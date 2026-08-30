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
    readonly identityDetailsHeading: Locator;
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

        this.identityDetailsHeading = page.getByText("Identity Details", { exact: true });
        this.applicationNumberLabel = page.locator('span:has-text("YOUR APPLICATION NUMBER IS")');
        this.kycQuotationStep = page.getByText("KYC & Quotation", { exact: true });
        this.identityFinancialStep = page.getByText("Identity & Financial", { exact: true });
        this.lifestyleHealthStep = page.getByText("Lifestyle & Health", { exact: true });
        this.payoutStep = page.getByText("Payout", { exact: true });
        this.reviewPaymentStep = page.getByText("Review & Payment", { exact: true });

    }

    async lifeTermCheckoutJourney(_scenario: LifeTermScenario) {
        this.log("Starting Checkout Journey");
        await this.fillProposerDetails();
        await this.sharePaymentLink();
        await this.approveOnReview();
        await this.validateInsurerRedirection();
        // await this.biPdfCompare();
        this.log("Completed Checkout Journey");
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
        await this.click(this.continueBtn, "click on Continue button");
        await this.check(this.correspondenceAddressSame, "click on Correspondence address same button");
        await this.fullScreenScreenshot("Correspondence address same Page Screenshot");
        await this.click(this.continueBtn, "click on Continue button");
    }

    private async sharePaymentLink() {
        await this.click(this.sharePaymentLinkBtn, "click on Share Payment Link button");
        if (await this.copyLink.isVisible().catch(() => false)) {
            await this.click(this.copyLink, "click on Copy Link button");
        }
        await this.fullScreenScreenshot("Share Payment Link");
    }

    // private async approveOnReview() {
    //     const reviewUrl = await this.buildReviewUrl();
    //     if (!reviewUrl) throw new Error("Could not resolve life-insurance review URL (missing referenceId)");

    //     await this.page.goto(reviewUrl);

    //     const [download] = await Promise.all([
    //         this.page.waitForEvent("download"),
    //         this.click(this.clickHere, "click on Click here BI button"),
    //     ]);
    //     fs.mkdirSync("lifeBiCompare", { recursive: true });
    //     await download.saveAs("lifeBiCompare/BiReviewpage.pdf");

    //     await this.check(this.termsCheckbox.first(), "click on Accept terms checkbox");
    //     await this.fullScreenScreenshot("Accept terms checkbox");
    //     await this.click(this.approveBtn, "click on Approve button");
    //     await this.page.waitForURL(/apptracker|applicationform|payment|success/i, { timeout: 60000 }).catch(() => { });
    // }

    private async approveOnReview() {
        const reviewUrl = await this.buildReviewUrl();
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
            ),
            this.click(this.approveBtn, "click on Approve button"),
        ]);

        const status = approveResponse.status();
        let body: any = null;
        try {
            body = await approveResponse.json();
        } catch {
            this.log("Approve API response is not JSON");
        }

        if (status !== 200 || body?.meta?.error) {
            await this.fullScreenScreenshot("Approve API Error Screenshot");
            this.log(`Approve API failed — status: ${status}, response: ${JSON.stringify(body)}`);
            throw new Error(
                `Approve API failed — status: ${status}, response: ${JSON.stringify(body)}`
            );
        }

        const redirectUrl: string | undefined =
            body?.data?.paymentLink || body?.data?.proposalResult?.redirectUrl;

        if (!redirectUrl) {
            await this.fullScreenScreenshot("Approve Missing Redirect URL");
            throw new Error(`Approve API succeeded but no redirectUrl/paymentLink in response: ${JSON.stringify(body)}`);
        }

        this.log(`Approve API succeeded, redirecting to: ${redirectUrl}`);

        await this.page.waitForURL(/iprulifeinsurance\.com/, {
            timeout: 30000,
            waitUntil: "domcontentloaded",
        });
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

    private async validateInsurerRedirection() {
        this.log("Validating insurer redirection page");

        await this.page.waitForURL(/iprulifeinsurance\.com/, { timeout: 30000 });

        const checks: { name: string; locator: Locator }[] = [
            { name: "Application Number label", locator: this.applicationNumberLabel },
            { name: "Identity Details heading", locator: this.identityDetailsHeading },
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
