
import { test } from "@playwright/test";
import { Dashboardpage } from "../pages/Dashboard/Dashboardpage";

test.describe("@Dashboard Tests", () => {
    let dashboardPage: Dashboardpage;

    test.beforeEach(async ({ page }) => {
        dashboardPage = new Dashboardpage(page);
        await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
        await page.waitForURL(/dashboard/, { timeout: 30000 });
    });

    test("Verify Dashboard scenarios", async () => {
         await leadSearch();
        await viewQuoteRedirection();
        await verifyProposalRedirection();
        await verifypaymentInProgressRedirection();
        await verifyinsuranceSale();
        await verifyProfileTabRedirection();
    });

    async function leadSearch() {
       await dashboardPage.verifyLeadsearchInShowall();
    }

    async function viewQuoteRedirection(){
        await dashboardPage.verifyViewQuoteBtnRedirection();
        
    }
    async function verifyProposalRedirection(){
        await dashboardPage.verifyCheckoutInProgressBtnRedirection();
    }
    async function verifypaymentInProgressRedirection(){
        await dashboardPage.verifyPaymentInProgressBtnRedirection();
    }

    async function verifyinsuranceSale() {
        await dashboardPage.verifyBusinessInsuranceSales();
    }

    async function verifyProfileTabRedirection() {
        await dashboardPage.verifyProfileTab();
    }
});





