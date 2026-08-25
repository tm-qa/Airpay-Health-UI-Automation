import { Page, expect } from "@playwright/test";

function coverLabel(amount: number): string {
    return `${amount / 100_000} lakhs`;
}

export async function selectCoverFromDropdown(page: Page, coverAmount: number) {
    const label = coverLabel(coverAmount);
    const dropdown = page.getByRole("tabpanel").getByText(/^\d+\.?\d*\s+lakhs?$/i).first();

    await dropdown.scrollIntoViewIfNeeded();
    if ((await dropdown.innerText()).trim().toLowerCase() === label) {
        console.log(`Cover already ${label} (${coverAmount})`);
        return;
    }

    for (let attempt = 0; attempt < 3; attempt++) {
        await dropdown.click();
        const scroller = page.locator(".rc-virtual-list-holder:visible");

        if (await scroller.count()) {
            await scroller.evaluate((el) => { el.scrollTop = 0; });
        }

        const option = page.getByText(label, { exact: true }).last();

        for (let i = 0; i < 50; i++) {
            if (await option.isVisible().catch(() => false)) {
                await option.click();
                break;
            }
            if (await scroller.count()) {
                await scroller.evaluate((el) => { el.scrollTop += 200; });
            } else {
                await page.mouse.wheel(0, 200);
            }
        }

        await page.keyboard.press("Escape");
        const newText = (await dropdown.innerText().catch(() => "")).trim().toLowerCase();
        if (newText === label) break;
    }

    await expect(dropdown).toHaveText(new RegExp(`^${label}$`, "i"), { timeout: 20000 });
    console.log(`Cover selected: ${label} (${coverAmount})`);
}
