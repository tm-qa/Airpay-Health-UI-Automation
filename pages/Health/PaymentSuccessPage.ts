import { Page, Locator, expect } from "@playwright/test";

export class PaymentSuccessPage {
    readonly page: Page;
    readonly successUrl: RegExp;
    readonly applicationNumberText: Locator;
    readonly policyNumberText: Locator;

    constructor(page: Page) {
        this.page = page;
        this.successUrl = /health-insurance\/success\?referenceId=/;
        this.applicationNumberText = page.getByText(/Application Number:/i);
        this.policyNumberText = page.getByText(/Policy Number:/i);
    }

    async verifyAndLogPolicyDetails() {
        await expect(this.page).toHaveURL(this.successUrl, { timeout: 120000 });
        await expect(this.applicationNumberText).toBeVisible({ timeout: 30000 });
        await expect(this.policyNumberText).toBeVisible({ timeout: 30000 });

        const applicationNumber = (await this.applicationNumberText.textContent())
            ?.replace(/Application Number:\s*/i, "")
            .trim();
        const policyNumber = (await this.policyNumberText.textContent())
            ?.replace(/Policy Number:\s*/i, "")
            .trim();

        console.log(`Application Number: ${applicationNumber}`);
        console.log(`Policy Number: ${policyNumber}`);
    }
}
