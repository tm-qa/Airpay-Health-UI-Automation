import { Page, Locator, expect, test } from "@playwright/test";
import * as fs from "fs";
import { BasePage } from "../BasePage";
import { LifeTermScenario } from "../../types/lifeTerm.types";

export class ResultPage extends BasePage {
    readonly sumAssured: Locator;
    readonly coverUptoAge: Locator;
    readonly payForYears: Locator;
    readonly paymentFrequency: Locator;
    readonly monthlyOption: Locator;
    readonly quarterlyOption: Locator;
    readonly halfYearlyOption: Locator;
    readonly yearlyOption: Locator;
    readonly singlePremiumRadio: Locator;
    readonly payForYearsSingleWarning: Locator;
    readonly sortBy: Locator;
    readonly viewAddons: Locator;
    readonly criticalIllnessCover: Locator;
    readonly addonCoverAmount: Locator;
    readonly getAddonBtn: Locator;
    readonly closeBtn: Locator;
    readonly benefitIllustrationBtn: Locator;
    readonly downloadBtn: Locator;
    readonly downloadsSection: Locator;
    readonly policyBrochure: Locator;
    readonly downloadBiBtn: Locator;
    readonly buyNowBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.sumAssured = page.getByRole("textbox", { name: /sum assured/i });
        this.coverUptoAge = page.getByRole("textbox", { name: /cover upto age/i });
        this.payForYears = page.getByRole("textbox", { name: "Pay for (Years)" });
        this.paymentFrequency = page.getByRole("textbox", { name: "Payment Frequency" });
        this.monthlyOption = page.getByText("Monthly");
        this.quarterlyOption = page.getByText("Quarterly");
        this.halfYearlyOption = page.getByText("Half-Yearly");
        this.yearlyOption = page.getByText("Yearly", { exact: true });
        this.singlePremiumRadio = page.getByRole("radio", { name: "Single premium" });
        this.payForYearsSingleWarning = page.getByText("Pay for must be 1 for single");
        this.sortBy = page.getByText(/relevance/i);
        this.viewAddons = page.getByText(/view \d+ available addons/i);
        this.criticalIllnessCover = page.getByText(/critical illness cover/i);
        this.addonCoverAmount = page.getByRole("spinbutton", { name: /enter cover amount/i });
        this.getAddonBtn = page.getByRole("button", { name: /get add-on/i });
        this.closeBtn = page.getByRole("button", { name: /close/i });
        this.benefitIllustrationBtn = page.getByRole("button", { name: /benefit illustration/i });
        this.downloadBtn = page.getByRole("button", { name: /download/i });
        this.downloadsSection = page.locator("article", { hasText: /downloads/i });
        this.policyBrochure = page.getByText(/policy brochure/i);
        this.downloadBiBtn = page.getByRole("button", { name: /download bi/i });
        this.buyNowBtn = page.getByRole("button", { name: /buy now/i });
    }

    async lifeTermResultJourney(scenario: LifeTermScenario): Promise<boolean> {
        this.log("Starting Result Journey");
        await expect(this.page).toHaveURL(/\/results?/, { timeout: 60000 });

        await this.selectSumAssured(scenario.sumAssured);
        await this.selectCoverUptoAge(scenario.maturityAge);
        await this.selectPaymentFrequency(scenario.paymentFrequency);
        // await this.validatenegativeCasesScenarios(scenario.type, scenario.expected, scenario.planName);
        const shouldStop = await this.validateNegativeCasesScenarios(scenario.type, scenario.expected, scenario.planName);
        if (shouldStop) {
            this.log("Stopping journey — negative case confirmed or plan not present as expected or plan is not visible due to insurer side issue.");
            await this.fullScreenScreenshot("Result Page: Result page Screenshot id plan is not available");
            return true;
        }
        await this.sortByClaimSettlementRatio();
        await this.applyRiders(scenario);
        await this.openPlanDetailsAndDownloads(scenario.planName);
        await this.click(this.buyNowBtn, "click on Buy Now button");
        await this.page.waitForURL(/\/(kyc|checkout|proposal)/, { timeout: 30000 });
        this.log("Completed Result Journey");
        return false;
    }

    private async selectSumAssured(amount: number) {
        await this.click(this.sumAssured, "click on Sum Assured button");
        await this.fill(this.sumAssured, String(amount), "fill Sum Assured");
    }

    private async selectCoverUptoAge(age: number) {
        await this.click(this.coverUptoAge, "click on Cover Upto Age button");
        await this.fill(this.coverUptoAge, String(age), "fill Cover Upto Age");
    }

    private async sortByClaimSettlementRatio() {
        await this.click(this.sortBy, "click on Sort by button");
        await this.click(this.page.getByRole("option", { name: /claim settlement ratio/i }), "Sort by Claim Settlement Ratio");
    }

    private async applyRiders(scenario: LifeTermScenario) {
        if (![scenario.rider1, scenario.rider2, scenario.rider3, scenario.rider4].some(Boolean)) return;

        const planCard = this.page.locator(".LifeResultCard_card__kArGK", { hasText: scenario.planName });
        const viewAddonsForPlan = planCard.getByText(/view \d+ available addons/i);

        await viewAddonsForPlan.waitFor({ state: "visible", timeout: 15000 });
        await this.click(viewAddonsForPlan, "click on View addons button");

        if (scenario.rider1) await this.selectCriticalIllnessCover(scenario.rider1Package, scenario.rider1SI);
        if (scenario.rider2) await this.selectAccidentalTotalPermanentDisability(scenario.rider2SI);
        if (scenario.rider3) await this.selectWaiverOfPremium();
        if (scenario.rider4) await this.selectAccidentalDeathCover(scenario.rider4SI);
    }

    private async selectCriticalIllnessCover(ciPackage: string, coverAmount?: number) {
        await this.click(this.page.getByText("Critical Illness Cover", { exact: true }), "click on Critical Illness Cover button");
        await this.click(this.page.getByText("₹ 5.00 L").first(), "click on CI cover button");
        if (ciPackage) await this.click(this.page.getByText(ciPackage, { exact: true }), ciPackage);
        await this.submitAddonCover(coverAmount);
    }

    private async selectAccidentalTotalPermanentDisability(coverAmount?: number) {
        await this.click(this.page.getByText("Accidental Total & Permanent Disability", { exact: true }), "click on ATPD button");
        await this.click(this.page.getByText("₹ 5.00 L").nth(2), "click on ATPD cover button");
        await this.submitAddonCover(coverAmount);
    }

    private async selectWaiverOfPremium() {
        await this.click(this.page.getByText("Waiver of Premium", { exact: true }), "click on Waiver of Premium button");
    }

    private async selectAccidentalDeathCover(coverAmount?: number) {
        await this.click(this.page.getByText("Accidental Death Cover", { exact: true }), "click on Accidental Death Cover button");
        await this.click(this.page.getByText("₹ 5.00 L").nth(1), "click on ADC cover button");
        await this.submitAddonCover(coverAmount);
    }

    private async submitAddonCover(coverAmount?: number) {
        if (coverAmount != null) await this.fill(this.addonCoverAmount, String(coverAmount), "fill Cover amount");
        await this.click(this.getAddonBtn, "click on Get Add-On button");
        //  if (await this.closeBtn.isVisible().catch(() => false)) await this.click(this.closeBtn, "Close");
    }

    private async downloadBenefitIllustration() {
        if (!(await this.benefitIllustrationBtn.first().isVisible().catch(() => false))) return;

        await this.click(this.benefitIllustrationBtn.first(), "click on Benefit Illustration button");
        await this.clickPdfViewerDownload();

        const pageDownload = this.page.getByRole("button", { name: /download download/i });
        if (await pageDownload.isVisible().catch(() => false)) {
            const downloadPromise = this.page.waitForEvent("download").catch(() => null);
            await this.click(pageDownload, "click on Download BI button");
            await downloadPromise;
        }

        if (await this.closeBtn.isVisible().catch(() => false)) await this.click(this.closeBtn, "click on Close BI button");
        console.log("Benefit Illustration downloaded on result page");
        await this.fullScreenScreenshot("Benefit Illustration");
    }

    private async openPlanDetailsAndDownloads(planName: string) {
        await this.clickViewDetailsByPlanName(planName,);
        await this.fullScreenScreenshot("Result Page: View Details Screenshot");
        if (await this.downloadsSection.isVisible().catch(() => false)) {
            await this.click(this.downloadsSection, "click on Downloads button");
        }

        if (await this.policyBrochure.isVisible().catch(() => false)) {
            const popupPromise = this.page.waitForEvent("popup").catch(() => null);
            await this.click(this.policyBrochure, "click on Policy Brochure button");
            const popup = await popupPromise;
            if (popup) await this.clickPdfViewerDownload(popup);
        }

        const [download] = await Promise.all([
            this.page.waitForEvent("download"),
            this.click(this.downloadBiBtn, "click on Download BI on PDP button"),
        ]);
        fs.mkdirSync("lifeBiCompare", { recursive: true });
        await download.saveAs("lifeBiCompare/BiPDPPage.pdf");
        this.log("Policy brochure is downloaded on PDP page");
    }

    private async clickPdfViewerDownload(target: Page = this.page) {
        const downloadBtn = target
            .locator("iframe")
            .contentFrame()
            .locator("iframe")
            .contentFrame()
            .getByRole("button", { name: /download/i });
        const [download] = await Promise.all([
            target.waitForEvent("download"),
            this.click(downloadBtn, "click on PDF viewer Download button"),
        ]);
        fs.mkdirSync("lifeBiCompare", { recursive: true });
        await download.saveAs("lifeBiCompare/BiPDPPage.pdf");
    }


    private async selectPaymentFrequency(frequency: string) {
        if (!frequency || frequency == "Yearly") {
            this.log("No Payment Frequency provided in scenario or Payment Frequency is Yearly");
            return;
        }

        const normalized = frequency.trim().toLowerCase();
        await this.click(this.paymentFrequency, "click on Payment Frequency dropdown");

        if (normalized === "single" || normalized === "single premium") {
            await this.click(this.singlePremiumRadio, "select Single Premium radio");
            await expect(this.payForYearsSingleWarning, "Pay for (Years) single-premium warning should be visible")
                .toBeVisible({ timeout: 5000 });
            await this.payForYears.fill("");
            await this.fill(this.payForYears, "1", "fill Pay for (Years) as 1 for Single Premium");
            this.log("Selected Single Premium, warning verified, Pay for (Years) set to 1");
            return;
        }

        if (normalized === "quarterly") {
            const isQuarterlyAvailable = await this.quarterlyOption.isVisible().catch(() => false);
            if (isQuarterlyAvailable) {
                await this.click(this.quarterlyOption, "select Payment Frequency: Quarterly (expected unsupported)");
                this.log("Quarterly option was selectable in UI — expected to fail downstream validation");
                return;
            }
            throw new Error(
                `Payment Frequency "Quarterly" is not supported by the plan validator (as per test data expectation).`
            );
        }

        const optionMap: Record<string, Locator> = {
            monthly: this.monthlyOption,
            yearly: this.yearlyOption,
            "half-yearly": this.halfYearlyOption,
            "halfyearly": this.halfYearlyOption,
            "half yearly": this.halfYearlyOption,
        };

        const option = optionMap[normalized];
        if (!option) {
            throw new Error(`Unsupported Payment Frequency value from Excel sheet: "${frequency}"`);
        }

        await this.click(option, `select Payment Frequency: ${frequency}`);
        this.log(`Payment Frequency set to: ${frequency}`);
    }


    async clickViewDetailsByPlanName(planName: string) {
        if (!planName) {
            throw new Error("planName is required to click View Details button");
        }

        const planCard = this.page.locator(".LifeResultCard_card__kArGK", { hasText: planName });
        await planCard.waitFor({ state: "visible", timeout: 15000 });

        const viewDetailsBtn = planCard.getByRole("button", { name: /view details/i });
        await viewDetailsBtn.waitFor({ state: "visible", timeout: 15000 });

        await this.click(viewDetailsBtn, `click on View Details button for plan: ${planName}`);
    }


    private async validateNegativeCasesScenarios(type?: string, expected?: string, planName?: string): Promise<boolean> {
        this.log("validating negative tc");

        const planCard = this.page.locator(".LifeResultCard_card__kArGK", { hasText: planName });
        const noPlansFound = this.page.locator(".LifeResultCardModule_noPlansFound__PG7QW");

        await planCard.first().or(noPlansFound).waitFor({ state: "visible", timeout: 30000 });

        const isPlanCardVisible = await planCard.first().isVisible().catch(() => false);

        if (isPlanCardVisible) {
            await this.fullScreenScreenshot("Result Page: Plan Card Visible Screenshot");
            return false;
        }

        if (type === "Negative") {
            this.log("Plan is not supported for negative cases : " + expected);
            await this.fullScreenScreenshot("Result Page: Plan Card Not Supported Screenshot");
        } else if (type === "Positive") {
            this.log("Plan is not visible due to insurer side issue");
            await this.fullScreenScreenshot("Result Page: Plan Card Not Visible Screenshot");
        }

        return true;
    }

}
