import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../BasePage";

export class HdfcPaymentGatewayPage extends BasePage {
    readonly netBanking: Locator;
    readonly payuOption: Locator;
    readonly proceedToPay: Locator;

    constructor(page: Page) {
        super(page);
        this.netBanking = page.getByRole("link", { name: /net banking/i });
        this.payuOption = page.locator("label.gs_control:visible").filter({ hasText: /^PAYU$/ }).first();
        this.proceedToPay = page.getByRole("button", { name: /Proceed To Pay/i });
    }

    async payViaNetBanking() {
        await expect(this.page).toHaveURL(/uatpg\.hdfcergo\.com/, { timeout: 60000 });
        await this.click(this.netBanking, "click on Net Banking link");
        await expect(this.payuOption).toBeVisible({ timeout: 15000 });
        await this.click(this.payuOption, "click on PAYU option");
        await expect(this.proceedToPay).toBeEnabled({ timeout: 10000 });
        await this.click(this.proceedToPay, "click on Proceed To Pay button");
        await expect(this.page).toHaveURL(/apitest\.payu\.in/, { timeout: 60000 });
    }
}
