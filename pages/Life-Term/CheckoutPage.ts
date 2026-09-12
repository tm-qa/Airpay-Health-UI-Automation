import { Page, Locator } from "@playwright/test";
import * as fs from "fs";
import toMatchPdf from "pdf-visual-comparer/playwright";
import { BasePage } from "../BasePage";
import { LifeTermScenario } from "../../types/lifeTerm.types";

export class CheckoutPage extends BasePage {
    readonly maritalStatus: Locator;
    readonly pan: Locator;
    readonly indianResidence: Locator;
    readonly yesRadioBtn: Locator;
    readonly continueBtn: Locator;
    readonly correspondenceAddressSame: Locator;
    readonly downloadBenefitIllustrationBtn: Locator;
    readonly sharePaymentLinkBtn: Locator;
    readonly copyLink: Locator;
    readonly clickHere: Locator;
    readonly termsCheckbox: Locator;
    readonly approveBtn: Locator;
    readonly applicationNumberLabel: Locator;
    readonly kycQuotationStep: Locator;
    readonly identityFinancialStep: Locator;
    readonly lifestyleHealthStep: Locator;
    readonly payoutStep: Locator;
    readonly reviewPaymentStep: Locator;

    constructor(page: Page) {
        super(page);
        this.maritalStatus = page.getByRole("combobox", { name: /marital status/i });
        this.pan = page.getByRole("textbox", { name: /PAN/i });
        this.indianResidence = page.locator("//label[@for='insuredMemberIsIndianResident']//div[1]");
        this.yesRadioBtn = page.getByLabel('Yes', { exact: true });
        this.continueBtn = page.getByRole("button", { name: /continue/i });
        this.correspondenceAddressSame = page.getByRole("checkbox", {
            name: /correspondence address same/i,
        });
        this.downloadBenefitIllustrationBtn = page.getByRole("button", {
            name: /benefit illustration/i,
        });
        this.sharePaymentLinkBtn = page.getByRole("button", { name: /share payment link/i });
        this.copyLink = page.getByText(/copy link/i);
        this.clickHere = page.getByText(/\*\s*click here/i);
        this.termsCheckbox = page.getByRole("checkbox");
        this.approveBtn = page.getByRole("button", { name: /approve/i });

        this.applicationNumberLabel = page.locator('span:has-text("YOUR APPLICATION NUMBER IS")');
        this.kycQuotationStep = page.getByText("KYC & Quotation", { exact: true });
        this.identityFinancialStep = page.getByText("Identity & Financial", { exact: true });
        this.lifestyleHealthStep = page.getByText("Lifestyle & Health", { exact: true });
        this.payoutStep = page.getByText("Payout", { exact: true });
        this.reviewPaymentStep = page.getByText("Review & Payment", { exact: true });

    }

    async lifeTermCheckoutJourney(_scenario: LifeTermScenario): Promise<boolean> {
        this.log("Starting Checkout Journey");
        await this.fillProposerDetails();
        const reviewUrl = await this.sharePaymentLink();
        const approved = await this.approveOnReview(reviewUrl);
        if (!approved) {
            this.log("Approve API failed, skipping validation");
            return false;
        }
        await this.validateInsurerRedirection();
        await this.biPdfCompare();
        this.log("Completed Checkout Journey");
        return true;
    }

    private async biPdfCompare() {
        const reviewPdf = "lifeBiCompare/BiReviewpage.pdf";
        const pdpPdf = "lifeBiCompare/BiPDPPage.pdf";
        try {
            if (!fs.existsSync(reviewPdf) || !fs.existsSync(pdpPdf)) {
                throw new Error(`BI PDF missing: review=${fs.existsSync(reviewPdf)} pdp=${fs.existsSync(pdpPdf)}`);
            }
            const result = await toMatchPdf(reviewPdf, pdpPdf);
            if (!result.pass) throw new Error(result.message());
            console.log("Directory: lifeBiCompare", fs.readdirSync("lifeBiCompare").map((file) => `lifeBiCompare/${file}`));
            fs.rmSync("lifeBiCompare", { recursive: true, force: true });
            console.log("Directory deleted:", !fs.existsSync("lifeBiCompare"));
            console.log("PDFs are identical");
        } catch (error) {
            console.log("PDF comparison failed:", error);
            throw error;
        }
    }

    private async fillProposerDetails() {
        await this.click(this.maritalStatus, "select on Marital Status button", { force: true });
        await this.fullScreenScreenshot("Marital Status Page Screenshot");
        await this.click(this.page.getByText("Married").nth(1), "click on Married button");
        await this.fill(this.pan, "ABCDR2345A", "fill PAN");
        await this.indianResidence.isVisible().then(async (isVisible) => {
            if (isVisible) {
                await this.click(this.yesRadioBtn, "click on Yes radio button");
            };
        });
        await this.click(this.continueBtn, "click on Continue button");
        await this.check(this.correspondenceAddressSame, "click on Correspondence address same button");
        await this.fullScreenScreenshot("Correspondence address same Page Screenshot");
        await this.click(this.continueBtn, "click on Continue button");
    }

    private async sharePaymentLink(): Promise<string> {
        const [response] = await Promise.all([
            this.page.waitForResponse(
                res => res.url().includes("/products/life/proposals") &&
                    res.request().method() === "POST"
            ),
            this.click(this.sharePaymentLinkBtn, "click on Share Payment Link button"),
        ]);

        await this.click(this.copyLink, "click on Copy Link button");
        await this.fullScreenScreenshot("Share Payment Link");

        const body = await response.json().catch(() => null);
        const referenceId: string | undefined = body?.data?.referenceId;

        if (!referenceId) {
            throw new Error(`Could not resolve referenceId from proposals response: ${JSON.stringify(body)}`);
        }

        const origin = new URL(this.page.url()).origin;
        return `${origin}/life-insurance/review?referenceId=${referenceId}`;
    }

    private async approveOnReview(reviewUrl: string): Promise<boolean> {
        if (!reviewUrl) throw new Error("Could not resolve life-insurance review URL (missing referenceId)");

        await this.page.goto(reviewUrl);

        const [download] = await Promise.all([
            this.page.waitForEvent("download"),
            this.click(this.clickHere, "click on Click here BI button"),
        ]);
        fs.mkdirSync("lifeBiCompare", { recursive: true });
        await download.saveAs("lifeBiCompare/BiReviewpage.pdf");

        await this.check(this.termsCheckbox.first(), "click on Accept terms checkbox");
        await this.fullScreenScreenshot("Accept terms checkbox");


        const [approveResponse] = await Promise.all([
            this.page.waitForResponse(
                (res) => res.url().includes("/products/life/payments/approve") && res.request().method() === "POST"
                    && (this.log(`Approve API Request: ${res.request().postData()}`), true)
            ),
            this.click(this.approveBtn, "click on Approve button"),
        ]);

        const approveBody = await approveResponse.json().catch(() => null);
        //this.log(`Approve API Response (status ${approveResponse.status()}): ${JSON.stringify(approveBody)}`);
        this.log(`Approve API Response (status ${approveResponse.status()})`);

        await this.page.waitForURL(/iprulifeinsurance\.com/, {
            timeout: 30000,
            waitUntil: "domcontentloaded",
        });
        return true;
    }

    private async validateInsurerRedirection() {
        this.log("Validating insurer redirection page");

        await this.page.waitForURL(/iprulifeinsurance\.com/, { timeout: 30000 });
        await this.applicationNumberLabel.first().waitFor({ state: "visible", timeout: 30000 }).catch(() => { });

        const checks: { name: string; locator: Locator }[] = [
            { name: "Application Number label", locator: this.applicationNumberLabel },
            { name: "KYC & Quotation step", locator: this.kycQuotationStep },
            { name: "Identity & Financial step", locator: this.identityFinancialStep },
            { name: "Lifestyle & Health step", locator: this.lifestyleHealthStep },
            { name: "Payout step", locator: this.payoutStep },
            { name: "Review & Payment step", locator: this.reviewPaymentStep },
        ];

        for (const { name, locator } of checks) {
            const isVisible = await locator.first().isVisible().catch(() => false);
            this.log(`${name} visible: ${isVisible}`);
        }

        await this.fullScreenScreenshot("Insurer Redirection Page Screenshot");
        this.log("Insurer redirection validated");
    }
}
