import { test } from "@playwright/test";
import { Dashboardpage } from "../pages/Dashboard/Dashboardpage";
import { ProfilePage } from "../pages/Life-Term/ProfilePage";
import { ResultPage } from "../pages/Life-Term/ResultPage";
import { CheckoutPage } from "../pages/Life-Term/CheckoutPage";
import { getLifeTermScenarios } from "../utils/lifeTermScenarioBuilder";

const LIFE_TERM_SCENARIOS = getLifeTermScenarios();

test.describe("@LifeTerm Life Term Tests", () => {
    //test.describe.configure({ mode: "serial" });

    let dashboardPage: Dashboardpage;
    let profilePage: ProfilePage;
    let resultPage: ResultPage;
    let checkoutPage: CheckoutPage;

    test.beforeEach(async ({ page }) => {
        dashboardPage = new Dashboardpage(page);
        profilePage = new ProfilePage(page);
        resultPage = new ResultPage(page);
        checkoutPage = new CheckoutPage(page);
        await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
        await page.waitForURL(/dashboard/, { timeout: 30000 });
    });

    for (const scenario of LIFE_TERM_SCENARIOS) {
        test(`${scenario.tcId} | ${scenario.type} | ${scenario.expected} | ${scenario.sumAssured}`, async () => {
            test.setTimeout(180000);
            console.log(`========== ${scenario.tcId} | ${scenario.expected} | ${scenario.sumAssured} ==========`);
            await dashboardPage.navigateToLifeTermInsurance(scenario.cifNumber);
            await profilePage.lifeTermProfileJourney(scenario);
            const shouldStop = await resultPage.lifeTermResultJourney(scenario); if (shouldStop) return;
            await checkoutPage.lifeTermCheckoutJourney(scenario);
            console.log(`AUTOMATION_LOG: ==========> ${scenario.tcId} | ${scenario.expected} | ${scenario.sumAssured} | ========== Passed`);
        });
    }
});
