import { Locator, Page } from "@playwright/test";

export async function selectAntOption(page: Page, combobox: Locator, optionText: string) {
    await combobox.scrollIntoViewIfNeeded();
    await combobox.click({ force: true });
    await combobox.pressSequentially(optionText);
    await page.getByText(optionText, { exact: true }).last().evaluate((el) => (el as HTMLElement).click());
}

export async function selectAntOptionFromList(page: Page, combobox: Locator, options: string[]) {
    await combobox.scrollIntoViewIfNeeded();
    await combobox.click({ force: true });
    for (const optionText of options) {
        await combobox.pressSequentially(optionText);
        const option = page.getByText(optionText, { exact: true }).last();
        if (await option.count()) {
            await option.evaluate((el) => (el as HTMLElement).click());
            return;
        }
    }
}
