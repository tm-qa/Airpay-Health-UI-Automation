import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../BasePage";
import { KycData } from "../../config/insurers/types";

export class KYCPage extends BasePage {
    readonly heading: Locator;
    readonly dobTextbox: Locator;
    readonly panTextbox: Locator;
    readonly continueBtn: Locator;
    readonly confirmDetails: Locator;
    readonly confirmBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.heading = page.getByRole("heading", { name: "Know Your Customer" });
        this.dobTextbox = page.getByRole("textbox", { name: /Date of Birth/i });
        this.panTextbox = page.getByRole("textbox", { name: "PAN Number" });
        this.continueBtn = page.getByRole("button", { name: "Continue" });
        this.confirmDetails = page.getByText("Confirm Details");
        this.confirmBtn = page.getByRole("button", { name: "Confirm" });
    }

    async fillKYCDetails(kyc: KycData) {
        await expect(this.heading).toBeVisible({ timeout: 30000 });
        await this.click(this.dobTextbox, "click on Date of Birth textbox");
        await this.dobTextbox.pressSequentially(kyc.dob);
        await this.log(`fill Date of Birth: ${kyc.dob}`);
        await this.fill(this.panTextbox, kyc.pan, "fill PAN Number");
        await this.fullScreenScreenshot("KYC details");
        await this.click(this.continueBtn, "click on Continue button");
        await expect(this.confirmDetails).toBeVisible();
        await expect(this.confirmBtn).toBeVisible({ timeout: 20000 });
        await this.click(this.confirmBtn, "click on Confirm button");
    }
}
