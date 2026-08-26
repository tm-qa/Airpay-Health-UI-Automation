import { Page, Locator, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { BasePage } from "../BasePage";
import { InsurerConfig } from "../../config/insurers/types";
import { HealthScenario } from "../../types/health.types";
import { coverHeadingRegex } from "../../utils/coverHelpers";
import { selectCoverFromDropdown } from "../../utils/coverSelect";

export class ResultPage extends BasePage {
    readonly buyNowBtn: Locator;
    readonly policyBrochure: Locator;
    readonly policyWording: Locator;
    readonly downloadsSection: Locator;
    readonly quoteLoader: Locator;
    readonly downloadDir = path.resolve("downloads");
    private readonly config: InsurerConfig;

    constructor(page: Page, config: InsurerConfig) {
        super(page);
        this.config = config;
        this.buyNowBtn = page.getByRole("button", { name: "Buy Now" });
        this.policyWording = config.pdfWordingPattern
            ? page.locator(`a[href*='${config.pdfWordingPattern}']`)
            : page.locator("a[href*='.pdf']").first();
        this.policyBrochure = config.pdfBrochurePattern
            ? page.locator(`a[href*='${config.pdfBrochurePattern}']`)
            : page.locator("a[href*='brochure']").first();
        this.downloadsSection = page.locator("article", { hasText: "Downloads" });
        this.quoteLoader = page.locator("img[alt='Image placeholder']");
    }

    async verifyResultPageForHealth(scenario: HealthScenario): Promise<boolean> {
        await expect(this.page).toHaveURL(/\/results?/, { timeout: 60000 });
        await this.waitForQuotes();

        await this.log(`select Cover amount: ${scenario.coverAmount}`);
        await selectCoverFromDropdown(this.page, scenario.coverAmount);
        await this.waitForQuotes();

        const lakhs = scenario.coverAmount / 100_000;
        await expect(this.page.getByText(coverHeadingRegex(scenario.coverAmount)).first()).toBeVisible({
            timeout: 15000,
        });
        await this.log(`verified cover ${lakhs}L on results page`);

        const plan = this.page.getByText(scenario.expectedPlan);
        const expectVisible = scenario.planVisibility.toUpperCase() === "YES";

        if (!expectVisible) {
            await expect(plan).not.toBeVisible();
            return false;
        }

        const noPlans = this.page.getByText(/no plans to match|no results found/i);
        if (await noPlans.isVisible({ timeout: 8000 }).catch(() => false)) {
            await this.log(`No plans available for ${scenario.tcId}`);
            return false;
        }

        try {
            await expect(plan, `Plan "${scenario.expectedPlan}" not found for ${scenario.tcId}`).toBeVisible({
                timeout: 30000,
            });
        } catch {
            await this.log(`Plan "${scenario.expectedPlan}" not returned by API for ${scenario.tcId}`);
            return false;
        }

        const planCard = plan.first().locator(
            "xpath=ancestor::div[.//button[contains(., 'View Details')]][1]"
        );

        const hasCard = await planCard.isVisible({ timeout: 5000 }).catch(() => false);
        if (!hasCard) {
            await this.log(`Plan "${scenario.expectedPlan}" found but no View Details button for ${scenario.tcId}`);
            return false;
        }

        await this.click(planCard.getByRole("button", { name: "View Details" }), "click on View Details button");
        await this.fullScreenScreenshot("View Details");

        await expect(this.buyNowBtn).toBeVisible();
        if (this.config.pdfWordingPattern && this.config.pdfBrochurePattern) {
            await this.downloadAndVerifyPDFs();
        }
        await this.click(this.buyNowBtn, "click on Buy Now button");
        await this.page.waitForURL(/\/(kyc|checkout)/, { timeout: 30000 });
        return true;
    }

    private async waitForQuotes() {
        if (await this.quoteLoader.isVisible()) {
            await expect(this.quoteLoader).toBeHidden({ timeout: 30000 });
        }
    }

    private async downloadAndVerifyPDFs() {
        if (!fs.existsSync(this.downloadDir)) fs.mkdirSync(this.downloadDir, { recursive: true });

        await this.click(this.downloadsSection, "click on Downloads button");

        for (const locator of [this.policyWording, this.policyBrochure]) {
            const href = await locator.getAttribute("href");
            if (!href) continue;
            const fileName = path.basename(href);
            const filePath = path.join(this.downloadDir, fileName);
            const response = await this.page.request.get(href, { timeout: 60000 });

            expect(response.ok()).toBeTruthy();
            fs.writeFileSync(filePath, await response.body());
            expect(fs.statSync(filePath).size).toBeGreaterThan(0);
            await this.log(`downloaded ${fileName}`);
        }
        await this.fullScreenScreenshot("Downloads");
    }
}
