import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../BasePage";

export class PayUPaymentPage extends BasePage {
    readonly testBank: Locator;
    readonly testBankProceed: Locator;
    readonly loginHeading: Locator;
    readonly userId: Locator;
    readonly password: Locator;
    readonly submitButton: Locator;
    readonly simulateSuccess: Locator;

    constructor(page: Page) {
        super(page);
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
            await this.click(this.testBank, "click on Test bank");
            await this.click(this.testBankProceed, "click on PROCEED button");
            await expect(this.loginHeading).toBeVisible({ timeout: 20000 });
        }

        await this.fill(this.userId, "payu", "fill PayU User ID");
        await this.fill(this.password, "payu", "fill PayU Password");
        await this.click(this.submitButton, "click on Submit button");
        await expect(this.simulateSuccess).toBeVisible({ timeout: 20000 });
        await this.click(this.simulateSuccess, "click on Simulate success response");
    }
}
