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
        await this.logUrl('Current Result Page URL');
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

        await this.selectAddOns(plan, scenario.addOns);
        await this.fullScreenScreenshot("Result page");
        await this.click(planCard.getByRole("button", { name: "View Details" }), "click on View Details button");
        await expect(this.buyNowBtn).toBeVisible();
        await this.waitForQuotes();
        await this.fullScreenScreenshot("PDP page");

        if (this.config.pdfWordingPattern && this.config.pdfBrochurePattern) {
            await this.downloadAndVerifyPDFs();
        }
        await this.click(this.buyNowBtn, "click on Buy Now button");
        await this.page.waitForURL(/\/(kyc|checkout)/, { timeout: 30000 });
        return true;
    }

    private async selectAddOns(plan: Locator, addOns: string[]) {
        if (addOns.length === 0) return;

        const card = plan.first().locator(
            "xpath=ancestor::div[.//button[contains(., 'View Details')] and .//*[contains(., 'more add-ons') or contains(., 'less add-ons') or normalize-space(.)='Add ons']][1]"
        );

        const moreLink = card.getByText(/View \d+ more add-ons/i);

        for (const addOn of addOns) {
            const [name, roomType] = addOn.startsWith("Room Modifier_") ? addOn.split("_") : [addOn];
            if (await moreLink.isVisible().catch(() => false)) {
                await this.click(moreLink, "click on View more add-ons");
            }

            const label = card.getByText(name, { exact: true }).first();
            await expect(label, `Add-on "${name}" not found on plan card`).toBeVisible({ timeout: 15000 });
            await label.scrollIntoViewIfNeeded();

            const row = label.locator("xpath=ancestor-or-self::*[.//input[@type='checkbox']][1]");
            if ((await row.locator("input[type='checkbox']").count()) !== 1) {
                await this.log(`Add-on has no checkbox (built-in): ${name}`);
                continue;
            }
            const checkbox = row.locator("input[type='checkbox']");

            if (roomType) {
                const dropdown = row.locator('[data-addon-slot="dropdown"]');
                const option = row.locator('[data-addon-slot="options"]').getByText(roomType, { exact: true });
                if (!(await option.isVisible())) await this.click(dropdown, "open Room Modifier variants");
                await this.click(option, `select Room Modifier: ${roomType}`);
                await expect(dropdown).toHaveText(roomType);
                await this.waitForQuotes();
            }

            if (await checkbox.isChecked()) {
                await this.log(`Add-on already selected: ${name}`);
                await this.waitForAddOnPrice(row, name);
                continue;
            }

            const details = row.getByRole("combobox");
            await expect(async () => {
                if (!(await checkbox.isChecked()) && (await details.count()) === 0) {
                    await this.click(checkbox, `select add-on: ${name}`, { force: true, timeout: 5000 });
                }
                await expect
                    .poll(async () => (await checkbox.isChecked()) || (await details.count()) > 0, { timeout: 3000 })
                    .toBe(true);
            }).toPass({ timeout: 20000 });

            if (!(await checkbox.isChecked())) {
                for (let i = 0, n = await details.count(); i < n; i++) {
                    const combo = details.nth(i);
                    await combo.locator("xpath=ancestor::div[contains(concat(' ',normalize-space(@class),' '),' ant-select ')][1]").click();
                    await expect(combo).toHaveAttribute("aria-expanded", "true");
                    const listId = await combo.getAttribute("aria-controls");
                    expect(listId, `Options list missing for ${name} detail ${i + 1}`).toBeTruthy();
                    const dropdown = this.page.locator(`[id="${listId}"]`).locator(
                        "xpath=ancestor::div[contains(concat(' ',normalize-space(@class),' '),' ant-select-dropdown ')][1]"
                    );
                    const option = name === "Personal Accident" && i === 0
                        ? dropdown.locator('.ant-select-item-option[title="5-10 Lakhs"]')
                        : dropdown.locator(".ant-select-item-option:not(.ant-select-item-option-disabled):visible").first();
                    await expect(option).toBeVisible();
                    const optionText = (await option.innerText()).trim();
                    await this.click(option, `select ${name} detail ${i + 1}: ${optionText}`);
                    await expect(combo).toHaveAttribute("aria-expanded", "false");
                    await expect(combo.locator("xpath=ancestor::div[contains(concat(' ',normalize-space(@class),' '),' ant-select ')][1]")
                        .locator(".ant-select-selection-item")).toHaveText(optionText);
                }
            }
            await expect(checkbox, `Add-on "${name}" did not get selected`).toBeChecked({ timeout: 30000 });
            await this.waitForQuotes();
            await this.waitForAddOnPrice(row, name);
        }
        await this.waitForQuotes();
        await this.fullScreenScreenshot("Add-ons selected");
    }

    private async waitForAddOnPrice(row: Locator, name: string) {
        if (name === "Room Modifier") return;
        await expect(row.locator('[data-addon-slot="price"]'), `Price not loaded for add-on "${name}"`)
            .toHaveText(/\u20b9\s*-?\s*\d[\d,.]*/, { timeout: 30000 });
    }

    private async waitForQuotes() {
        await expect(this.quoteLoader.filter({ visible: true })).toHaveCount(0, { timeout: 30000 });
        await expect(this.page.locator('[class*="loader_loaderContainer"]:visible')).toHaveCount(0, { timeout: 30000 });
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

