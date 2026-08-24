import { Page, Locator, expect } from "@playwright/test";

export class HdfcPaymentGatewayPage {
    readonly page: Page;
    readonly netBanking: Locator;
    readonly payuOption: Locator;
    readonly proceedToPay: Locator;

    constructor(page: Page) {
        this.page = page;
        this.netBanking = page.getByRole("link", { name: /net banking/i });
        this.payuOption = page.locator("label.gs_control:visible").filter({ hasText: /^PAYU$/ }).first();
        this.proceedToPay = page.getByRole("button", { name: /Proceed To Pay/i });
    }

    async payViaNetBanking() {
        await expect(this.page).toHaveURL(/uatpg\.hdfcergo\.com/, { timeout: 60000 });
        await this.netBanking.click();
        await expect(this.payuOption).toBeVisible({ timeout: 15000 });
        await this.payuOption.click();
        await expect(this.proceedToPay).toBeEnabled({ timeout: 10000 });
        await this.proceedToPay.click();
        await expect(this.page).toHaveURL(/apitest\.payu\.in/, { timeout: 60000 });
    }
}
