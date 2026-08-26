import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../BasePage";

export class PaymentSuccessPage extends BasePage {
    readonly successUrl: RegExp;
    readonly applicationNumberText: Locator;
    readonly policyNumberText: Locator;

    constructor(page: Page) {
        super(page);
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

        await this.log(`Application Number: ${applicationNumber}`);
        await this.log(`Policy Number: ${policyNumber}`);
        await this.fullScreenScreenshot("Payment Success");
    }
}
