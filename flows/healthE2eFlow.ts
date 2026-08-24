import { Page } from "@playwright/test";
import { InsurerConfig } from "../config/insurers/types";
import { Dashboardpage } from "../pages/Dashboard/Dashboardpage";
import { ProfilePage } from "../pages/Health/ProfilePage";
import { ResultPage } from "../pages/Health/ResultPage";
import { KYCPage } from "../pages/Health/KYCPage";
import { CheckoutPage } from "../pages/Health/CheckoutPage";
import { PaymentReviewPage } from "../pages/Health/PaymentReviewPage";
import { HealthScenario } from "../types/health.types";
import { PayUPaymentPage } from "../pages/Health/PayUPaymentPage";
import { HdfcPaymentGatewayPage } from "../pages/Health/HdfcPaymentGatewayPage";
import { PaymentSuccessPage } from "../pages/Health/PaymentSuccessPage";

export async function runHealthE2e(page: Page, scenario: HealthScenario, config: InsurerConfig) {
    const dashboardPage = new Dashboardpage(page);
    const profilePage = new ProfilePage(page);
    const resultPage = new ResultPage(page, config);
    const kycPage = new KYCPage(page);
    const checkoutPage = new CheckoutPage(page, config);
    const paymentReviewPage = new PaymentReviewPage(page);
    const hdfcPaymentGatewayPage = new HdfcPaymentGatewayPage(page);
    const payUPaymentPage = new PayUPaymentPage(page);
    const paymentSuccessPage = new PaymentSuccessPage(page);

    console.log(`\n========== ${scenario.tcId} | ${scenario.combinations} | ${scenario.coverAmount} ==========`);
    console.log(`Cover: ${scenario.coverAmount} | Deductible: ${scenario.deductible}`);
    console.log(`Members: ${scenario.members.map((m) => `${m.uiRelation}(${m.age}y)`).join(", ")}`);

    console.log("Step 1: Navigate to Health Insurance");
    await dashboardPage.navigateToHealthInsurance(config.cifNumber);

    console.log("Step 2: Complete Health Profile journey");
    await profilePage.healthProfileJourney(scenario);

    console.log("Step 3: Verify Result page and buy plan");
    const planAvailable = await resultPage.verifyResultPageForHealth(scenario);
    // if (!planAvailable) {
    //     console.log(`Step 3: Skipped — plan not available for ${scenario.tcId}`);
    //     return;
    // }

    console.log("Step 4: Fill KYC details");
    await kycPage.fillKYCDetails(config.kyc);

    console.log("Step 5: Fill Checkout / Proposal form");
    const paymentUrl = await checkoutPage.fillProposalFormHealth(scenario);

    console.log("Step 6: Review application and approve");
    const redirected = await paymentReviewPage.reviewAndApprove(paymentUrl);
    // if (!redirected) {
    //     console.log(`Step 6: Skipped payment gateway — sandbox approval API unavailable for ${scenario.tcId}`);
    //     return;
    // }

    console.log('payment application approved');
    await hdfcPaymentGatewayPage.payViaNetBanking();

    console.log('HDFC payment gateway completed');
    await payUPaymentPage.completeTestPayment();

    console.log('PayU test payment completed');
    await paymentSuccessPage.verifyAndLogPolicyDetails();

    console.log(`========== Completed ${scenario.tcId} ==========\n`);
}
