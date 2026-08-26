import { Locator, Page, expect } from "@playwright/test";
import { dobToPickerTitle } from "./dateHelpers";

export async function fillAntDateField(page: Page, field: Locator, dob: string) {
    if (await field.isEditable()) {
        await field.fill(dob);
        return;
    }

    const currentValue = await field.inputValue();
    if (currentValue) return;

    await selectAntDate(page, field, dobToPickerTitle(dob));
}

export async function selectAntDate(page: Page, field: Locator, pickerTitle: string) {
    const [year, month] = pickerTitle.split("-");
    const targetYear = Number(year);
    const monthName = new Date(targetYear, Number(month) - 1, 1).toLocaleString("en-US", { month: "short" });

    await field.scrollIntoViewIfNeeded();
    await page.keyboard.press("Escape");
    await page.locator(".ant-picker-dropdown:not(.ant-picker-dropdown-hidden)").waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});

    const picker = field.locator("xpath=ancestor::*[contains(@class,'ant-picker')][1]");
    if (await picker.count()) await picker.click({ force: true });
    else await field.click({ force: true });

    const datePicker = page.locator(".ant-picker-dropdown:not(.ant-picker-dropdown-hidden)").last();
    await expect(datePicker).toBeVisible({ timeout: 10000 });
    const yearBtn = datePicker.getByRole("button", { name: "Choose a year" });
    if (!(await yearBtn.isVisible().catch(() => false))) {
        await field.locator("xpath=..").getByRole("img", { name: "calendar" }).click({ force: true });
    }
    await expect(yearBtn).toBeVisible({ timeout: 10000 });
    await yearBtn.click();
    await navigateToYear(datePicker, targetYear);
    await datePicker.locator(".ant-picker-cell-inner").filter({ hasText: new RegExp(`^${year}$`) }).first().click();

    const dayCell = datePicker.locator(`td[title="${pickerTitle}"]`);
    if (await dayCell.isVisible()) {
        await dayCell.click();
        return;
    }

    await datePicker.getByRole("cell", { name: monthName, exact: true }).click();
    await dayCell.click();
    await page.keyboard.press("Escape");
}

async function navigateToYear(datePicker: Locator, targetYear: number) {
    const yearCell = datePicker.locator(".ant-picker-cell-inner").filter({ hasText: new RegExp(`^${targetYear}$`) }).first();
    const targetDecade = Math.floor(targetYear / 10) * 10;
    const decadeLabel = `${targetDecade}-${targetDecade + 9}`;
    const prevBtn = datePicker.getByRole("button", { name: /Last year|Previous decade/i }).first();
    const nextBtn = datePicker.getByRole("button", { name: /Next year|Next decade/i }).first();

    for (let attempt = 0; attempt < 20; attempt++) {
        if (await yearCell.isVisible()) return;

        const decadeCell = datePicker.getByRole("cell", { name: decadeLabel });
        if (await decadeCell.isVisible()) {
            await decadeCell.click();
            continue;
        }

        const cellTexts = await datePicker
            .locator(".ant-picker-cell:not(.ant-picker-cell-disabled) .ant-picker-cell-inner")
            .allTextContents();

        const years = cellTexts.map((v) => parseInt(v.trim(), 10)).filter((v) => !Number.isNaN(v));
        if (years.length > 0) {
            if (targetYear < Math.min(...years)) await prevBtn.click();
            else if (targetYear > Math.max(...years)) await nextBtn.click();
            else break;
            continue;
        }

        const decades = cellTexts.map((t) => parseInt(t.split("-")[0], 10)).filter((v) => !Number.isNaN(v));
        if (decades.length > 0) {
            if (targetDecade < Math.min(...decades)) await prevBtn.click();
            else if (targetDecade > Math.max(...decades)) await nextBtn.click();
            else break;
            continue;
        }

        const chooseDecade = datePicker.getByRole("button", { name: /Choose a decade/i });
        if (await chooseDecade.isVisible()) {
            await chooseDecade.click();
            continue;
        }

        break;
    }

    await expect(yearCell).toBeVisible();
}
