import { test } from "@playwright/test";
import { InsurerConfig } from "../config/insurers/types";
import { runHealthE2e } from "../flows/healthE2eFlow";
import { getScenarios } from "./scenarioBuilder";

export function registerHealthInsurerTests(config: InsurerConfig, timeoutMs = 180000) {
    const scenarios = getScenarios(config);

    test.describe(`@Health Health Tests - ${config.name}`, () => {
        test.describe.configure({ mode: "serial" });

        test.beforeEach(async ({ page }) => {
            for (let attempt = 0; attempt < 3; attempt++) {
                await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
                const on503 = await page
                    .getByText(/503 Service Temporarily Unavailable/i)
                    .isVisible()
                    .catch(() => false);
                if (!on503 && page.url().includes("dashboard")) break;
                await page.waitForTimeout(3000 * (attempt + 1));
            }
            await page.waitForURL(/dashboard/, { timeout: 30000 });
        });

        for (const scenario of scenarios) {
            test(`${scenario.tcId} | ${scenario.combinations} | ${scenario.coverAmount}`, async ({ page }) => {
                test.setTimeout(timeoutMs);
                await runHealthE2e(page, scenario, config);
            });
        }
    });
}
