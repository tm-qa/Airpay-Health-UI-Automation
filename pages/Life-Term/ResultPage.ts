import { Page, Locator, expect } from "@playwright/test";
import * as fs from "fs";
import { BasePage } from "../BasePage";
import { LifeTermScenario } from "../../types/lifeTerm.types";

export class ResultPage extends BasePage {
    readonly sumAssured: Locator;
    readonly coverUptoAge: Locator;
    readonly sortBy: Locator;
    readonly viewAddons: Locator;
    readonly criticalIllnessCover: Locator;
    readonly addonCoverAmount: Locator;
    readonly getAddonBtn: Locator;
    readonly closeBtn: Locator;
    readonly benefitIllustrationBtn: Locator;
    readonly downloadBtn: Locator;
    readonly viewDetailsBtn: Locator;
    readonly downloadsSection: Locator;
    readonly policyBrochure: Locator;
    readonly downloadBiBtn: Locator;
    readonly buyNowBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.sumAssured = page.getByRole("textbox", { name: /sum assured/i });
        this.coverUptoAge = page.getByRole("textbox", { name: /cover upto age/i });
        this.sortBy = page.getByText(/relevance/i);
        this.viewAddons = page.getByText(/view \d+ available addons/i);
        this.criticalIllnessCover = page.getByText(/critical illness cover/i);
        this.addonCoverAmount = page.getByRole("spinbutton", { name: /enter cover amount/i });
        this.getAddonBtn = page.getByRole("button", { name: /get add-on/i });
        this.closeBtn = page.getByRole("button", { name: /close/i });
        this.benefitIllustrationBtn = page.getByRole("button", { name: /benefit illustration/i });
        this.downloadBtn = page.getByRole("button", { name: /download/i });
        this.viewDetailsBtn = page.getByRole("button", { name: /view details/i });
        this.downloadsSection = page.locator("article", { hasText: /downloads/i });
        this.policyBrochure = page.getByText(/policy brochure/i);
        this.downloadBiBtn = page.getByRole("button", { name: /download bi/i });
        this.buyNowBtn = page.getByRole("button", { name: /buy now/i });
    }

    async lifeTermResultJourney(scenario: LifeTermScenario) {
        await expect(this.page).toHaveURL(/\/results?/, { timeout: 60000 });

        await this.selectSumAssured(scenario.sumAssured);
        await this.selectCoverUptoAge(scenario.maturityAge);
        await this.sortByClaimSettlementRatio();
        await this.applyRiders(scenario);
        await this.openPlanDetailsAndDownloads();
        await this.click(this.buyNowBtn, "Buy Now");
        await this.page.waitForURL(/\/(kyc|checkout|proposal)/, { timeout: 30000 });
    }

    private async selectSumAssured(amount: number) {
        await this.click(this.sumAssured, "Open Sum Assured");
        await this.fill(this.sumAssured, String(amount), "Sum Assured");
    }

    private async selectCoverUptoAge(age: number) {
        await this.click(this.coverUptoAge, "Open Cover Upto Age");
        await this.fill(this.coverUptoAge, String(age), "Cover Upto Age");
    }

    private async sortByClaimSettlementRatio() {
        await this.click(this.sortBy, "Open Sort by");
        await this.click(this.page.getByRole("option", { name: /claim settlement ratio/i }), "Sort by Claim Settlement Ratio");
    }

    private async applyRiders(scenario: LifeTermScenario) {
        if (![scenario.rider1, scenario.rider2, scenario.rider3, scenario.rider4].some(Boolean)) return;
        await this.viewAddons.waitFor({ state: "visible", timeout: 15000 });
        await this.click(this.viewAddons, "View addons");
        if (scenario.rider1) await this.selectCriticalIllnessCover(scenario.rider1Package, scenario.rider1SI);
        if (scenario.rider2) await this.selectAccidentalTotalPermanentDisability(scenario.rider2SI);
        if (scenario.rider3) await this.selectWaiverOfPremium();
        if (scenario.rider4) await this.selectAccidentalDeathCover(scenario.rider4SI);
    }

    private async selectCriticalIllnessCover(ciPackage: string, coverAmount?: number) {
        await this.click(this.page.getByText("Critical Illness Cover", { exact: true }), "Critical Illness Cover");
        await this.click(this.page.getByText("₹ 5.00 L").first(), "CI cover");
        if (ciPackage) await this.click(this.page.getByText(ciPackage, { exact: true }), ciPackage);
        await this.submitAddonCover(coverAmount);
    }

    private async selectAccidentalTotalPermanentDisability(coverAmount?: number) {
        await this.click(this.page.getByText("Accidental Total & Permanent Disability", { exact: true }), "ATPD");
        await this.click(this.page.getByText("₹ 5.00 L").nth(2), "ATPD cover");
        await this.submitAddonCover(coverAmount);
    }

    private async selectWaiverOfPremium() {
        await this.click(this.page.getByText("Waiver of Premium", { exact: true }), "Waiver of Premium");
    }

    private async selectAccidentalDeathCover(coverAmount?: number) {
        await this.click(this.page.getByText("Accidental Death Cover", { exact: true }), "Accidental Death Cover");
        await this.click(this.page.getByText("₹ 5.00 L").nth(1), "ADC cover");
        await this.submitAddonCover(coverAmount);
    }

    private async submitAddonCover(coverAmount?: number) {
        if (coverAmount != null) await this.fill(this.addonCoverAmount, String(coverAmount), "Cover amount");
        await this.click(this.getAddonBtn, "Get Add-On");
      //  if (await this.closeBtn.isVisible().catch(() => false)) await this.click(this.closeBtn, "Close");
    }

    private async downloadBenefitIllustration() {
        if (!(await this.benefitIllustrationBtn.first().isVisible().catch(() => false))) return;

        await this.click(this.benefitIllustrationBtn.first(), "Benefit Illustration");
        await this.clickPdfViewerDownload();

        const pageDownload = this.page.getByRole("button", { name: /download download/i });
        if (await pageDownload.isVisible().catch(() => false)) {
            const downloadPromise = this.page.waitForEvent("download").catch(() => null);
            await this.click(pageDownload, "Download BI");
            await downloadPromise;
        }

        if (await this.closeBtn.isVisible().catch(() => false)) await this.click(this.closeBtn, "Close BI");
        console.log("Benefit Illustration downloaded on result page");
        await this.fullScreenScreenshot("Benefit Illustration");
    }

    private async openPlanDetailsAndDownloads() {
        await this.click(this.viewDetailsBtn.first(), "View Details");
        await this.fullScreenScreenshot("View Details");
        if (await this.downloadsSection.isVisible().catch(() => false)) {
            await this.click(this.downloadsSection, "Downloads");
        }

        if (await this.policyBrochure.isVisible().catch(() => false)) {
            const popupPromise = this.page.waitForEvent("popup").catch(() => null);
            await this.click(this.policyBrochure, "Policy Brochure");
            const popup = await popupPromise;
            if (popup) await this.clickPdfViewerDownload(popup);
        }

        const [download] = await Promise.all([
            this.page.waitForEvent("download"),
            this.click(this.downloadBiBtn, "Download BI on PDP"),
        ]);
        fs.mkdirSync("lifeBiCompare", { recursive: true });
        await download.saveAs("lifeBiCompare/BiPDPPage.pdf");
        console.log("Policy brochure is downloaded on PDP page");
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
            this.click(downloadBtn, "PDF viewer Download"),
        ]);
        fs.mkdirSync("lifeBiCompare", { recursive: true });
        await download.saveAs("lifeBiCompare/BiPDPPage.pdf");
    }
}
