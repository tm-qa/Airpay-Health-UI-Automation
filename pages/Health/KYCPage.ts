import { Page, Locator, expect } from "@playwright/test";
import { KycData } from "../../config/insurers/types";

export class KYCPage {
    readonly page: Page;
    readonly heading: Locator;
    readonly dobTextbox: Locator;
    readonly panTextbox: Locator;
    readonly continueBtn: Locator;
    readonly confirmDetails: Locator;
    readonly confirmBtn: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole("heading", { name: "Know Your Customer" });
        this.dobTextbox = page.getByRole("textbox", { name: /Date of Birth/i });
        this.panTextbox = page.getByRole("textbox", { name: "PAN Number" });
        this.continueBtn = page.getByRole("button", { name: "Continue" });
        this.confirmDetails = page.getByText("Confirm Details");
        this.confirmBtn = page.getByRole("button", { name: "Confirm" });
    }

    async fillKYCDetails(kyc: KycData) {
        await expect(this.heading).toBeVisible({ timeout: 30000 });
        await this.dobTextbox.click();
        await this.dobTextbox.pressSequentially(kyc.dob);
        await this.panTextbox.fill(kyc.pan);
        await this.continueBtn.click();
        await expect(this.confirmDetails).toBeVisible();
        await expect(this.confirmBtn).toBeVisible({ timeout: 20000 });
        await this.confirmBtn.click();
    }
}
