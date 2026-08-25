import { Page, Locator } from "@playwright/test";
import * as fs from "fs";
import toMatchPdf from "pdf-visual-comparer/playwright";
import { BasePage } from "../BasePage";
import { LifeTermScenario } from "../../types/lifeTerm.types";

export class CheckoutPage extends BasePage {
    readonly maritalStatus: Locator;
    readonly pan: Locator;
    readonly continueBtn: Locator;
    readonly correspondenceAddressSame: Locator;
    readonly downloadBenefitIllustrationBtn: Locator;
    readonly sharePaymentLinkBtn: Locator;
    readonly copyLink: Locator;
    readonly clickHere: Locator;
    readonly termsCheckbox: Locator;
    readonly approveBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.maritalStatus = page.getByRole("combobox", { name: /marital status/i });
        this.pan = page.getByRole("textbox", { name: /PAN/i });
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
    }

    async lifeTermCheckoutJourney(_scenario: LifeTermScenario) {
        await this.fillProposerDetails();
        await this.sharePaymentLink();
        await this.approveOnReview();
       await this.biPdfCompare();
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
        await this.click(this.maritalStatus, "Open Marital Status", { force: true });
        await this.fullScreenScreenshot("Marital Status");
        await this.click(this.page.getByText("Married").nth(1), "Select Married");
        await this.fill(this.pan, "ABCDR2345A", "PAN");
        await this.click(this.continueBtn, "Continue");
        await this.check(this.correspondenceAddressSame, "Correspondence address same");
        await this.fullScreenScreenshot("Correspondence address same");
        await this.click(this.continueBtn, "Continue");
    }

    private async sharePaymentLink() {
        await this.click(this.sharePaymentLinkBtn, "Share Payment Link");
        if (await this.copyLink.isVisible().catch(() => false)) {
            await this.click(this.copyLink, "Copy Link");
        }
        await this.fullScreenScreenshot("Share Payment Link");
    }

    private async approveOnReview() {
        const reviewUrl = await this.buildReviewUrl();
        if (!reviewUrl) throw new Error("Could not resolve life-insurance review URL (missing referenceId)");

        await this.page.goto(reviewUrl);

        const [download] = await Promise.all([
            this.page.waitForEvent("download"),
            this.click(this.clickHere, "Click here BI"),
        ]);
        fs.mkdirSync("lifeBiCompare", { recursive: true });
        await download.saveAs("lifeBiCompare/BiReviewpage.pdf");

        await this.check(this.termsCheckbox.first(), "Accept terms");
        await this.fullScreenScreenshot("Accept terms");
        await this.click(this.approveBtn, "Approve");
        await this.page.waitForURL(/apptracker|applicationform|payment|success/i, { timeout: 60000 }).catch(() => {});
    }

    private async buildReviewUrl(): Promise<string | null> {
        const current = new URL(this.page.url());
        let referenceId = current.searchParams.get("referenceId");

        if (!referenceId) {
            const link = this.page.locator("a[href*='referenceId']").first();
            const href = await link.getAttribute("href").catch(() => null);
            if (href) referenceId = new URL(href, this.page.url()).searchParams.get("referenceId");
        }

        if (!referenceId) return null;
        return `${current.origin}/life-insurance/review?referenceId=${referenceId}`;
    }
}
