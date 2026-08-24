import { Page, Locator, expect } from "@playwright/test";

export class PayUPaymentPage {
    readonly page: Page;
    readonly testBank: Locator;
    readonly testBankProceed: Locator;
    readonly loginHeading: Locator;
    readonly userId: Locator;
    readonly password: Locator;
    readonly submitButton: Locator;
    readonly simulateSuccess: Locator;

    constructor(page: Page) {
        this.page = page;
        this.testBank = page.locator("#net-banking-list-TESTPGNB-pop").getByText("Test bank");
        this.testBankProceed = page.locator("#net-banking-list-TESTPGNB-pop").getByRole("button", { name: "PROCEED" });
        this.loginHeading = page.getByRole("heading", { name: "Login" });
        this.userId = page.getByRole("textbox").first();
        this.password = page.getByRole("textbox").nth(1);
        this.submitButton = page.getByRole("button", { name: "Submit" });
        this.simulateSuccess = page.getByText(/simulate success response/i);
    }

    async completeTestPayment() {
        await expect(this.page).toHaveURL(/apitest\.payu\.in/, { timeout: 60000 });

        if (!(await this.loginHeading.isVisible())) {
            await this.testBank.click();
            await this.testBankProceed.click();
            await expect(this.loginHeading).toBeVisible({ timeout: 20000 });
        }

        await this.userId.fill("payu");
        await this.password.fill("payu");
        await this.submitButton.click();
        await expect(this.simulateSuccess).toBeVisible({ timeout: 20000 });
        await this.simulateSuccess.click();
    }
}
