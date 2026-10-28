import { Locator, Page } from "@playwright/test";

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const openDropdownPanel = (page: Page) =>
    page.locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)").last();

const optionByText = (page: Page, text: string) =>
    openDropdownPanel(page)
        .locator(".ant-select-item-option")
        .filter({ hasText: new RegExp(`^\\s*${escapeRe(text)}\\s*$`, "i") })
        .first();


async function openDropdown(combobox: Locator) {
    await combobox.scrollIntoViewIfNeeded();

    if ((await combobox.getAttribute("aria-expanded")) === "true") return;

    const root = combobox.locator(
        "xpath=ancestor::div[contains(concat(' ', normalize-space(@class), ' '), ' ant-select ')][1]"
    );
    await root.locator(".ant-select-selector").click();
}

export async function selectAntOption(page: Page, combobox: Locator, optionText: string) {
    await openDropdown(combobox);
    await page.keyboard.type(optionText); 
    const option = optionByText(page, optionText);
    try {
        await option.click({ timeout: 3000 });
    } catch {
        await openDropdown(combobox);
        await option.dispatchEvent("click");
    }
}

export async function selectAntOptionFromList(page: Page, combobox: Locator, options: string[]) {
    for (const optionText of options) {
        await openDropdown(combobox);

        const option = optionByText(page, optionText);
        const found = await option
            .waitFor({ state: "visible", timeout: 2000 })
            .then(() => true)
            .catch(() => false);

        if (found) {
            await option.click();
            return;
        }
        await page.keyboard.press("Escape"); 
    }

    throw new Error(`None of the options were found: ${options.join(", ")}`);
}
