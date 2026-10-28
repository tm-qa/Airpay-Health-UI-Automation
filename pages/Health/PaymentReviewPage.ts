import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../BasePage";

export class PaymentReviewPage extends BasePage {
    readonly reviewHeading: Locator;
    readonly termsCheckbox: Locator;
    readonly customerInfoSheetLink: Locator;
    readonly termsAndConditionsLink: Locator;
    readonly termsModal: Locator;
    readonly termsCloseButton: Locator;
    readonly approveButton: Locator;

    constructor(page: Page) {
        super(page);
        this.reviewHeading = page.getByText(/review & approve your application/i);
        this.termsCheckbox = page
            .locator("div")
            .filter({ hasText: /I hereby confirm that all the details mentioned here are correct/i })
            .getByRole("checkbox");
        this.customerInfoSheetLink = page.locator("a.ant-typography").filter({ hasText: /customer information sheet/i });
        this.termsAndConditionsLink = page.getByText(/^\* (Click here|Terms & Conditions)$/);
        this.termsModal = page.locator(".ant-modal:visible, [role='dialog']:visible").first();
        this.termsCloseButton = this.termsModal.getByRole("button", { name: "Close" }).first();
        this.approveButton = page.getByRole("button", { name: "Approve" });
    }

    async reviewAndApprove(paymentUrl: string): Promise<boolean> {
        await this.page.route("**/generate/cis/**", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ url: paymentUrl }),
            });
        });

        await this.page.goto(paymentUrl);
        await expect(this.reviewHeading).toBeVisible({ timeout: 20000 });

        const hasCisLink = await this.customerInfoSheetLink.isVisible({ timeout: 3000 }).catch(() => false);
        if (hasCisLink) {
            const cisPagePromise = this.page.context().waitForEvent("page", { timeout: 15000 }).catch(() => null);
            await this.click(this.customerInfoSheetLink, "click on Customer Information Sheet link");
            const cisPage = await cisPagePromise;
            if (cisPage) await cisPage.close();
        }

        await this.click(this.termsAndConditionsLink, "click on Terms & Conditions link");
        await expect(this.termsModal).toBeVisible({ timeout: 20000 });
        await this.click(this.termsCloseButton, "click on Close button");
        if (await this.termsModal.isVisible().catch(() => false)) {
            await this.page.keyboard.press("Escape");
        }
        await expect(this.termsModal).toBeHidden({ timeout: 15000 });

        await this.check(this.termsCheckbox, "click on Accept terms checkbox");
        await this.fullScreenScreenshot("Accept terms checkbox");

        await expect(this.approveButton).toBeEnabled({ timeout: 10000 });

        let paymentLink = "";
        await this.page.route(
            (url) => url.pathname.includes("/payments/approve"),
            async (route) => {
                if (route.request().method() !== "POST") return route.continue();
                const response = await route.fetch();
                expect(response.status(), "approve API status").toBe(200);
                paymentLink = (await response.json())?.data?.paymentLink ?? "";
                await route.fulfill({ response });
            }
        );
        await this.logUrl('Current PaymentReview Page URL')
        await this.click(this.approveButton, "click on Approve button");

        await expect.poll(() => paymentLink, { message: "approve API paymentLink", timeout: 20000 }).toBeTruthy();
        await this.log(`approve API paymentLink: ${paymentLink}`);

        const target = new URL(paymentLink);
        await this.page.waitForURL((u) => u.host === target.host, { waitUntil: "domcontentloaded", timeout: 40000 });
        await this.log(`auto-redirected to: ${this.page.url()}`);
        await expect(this.page).toHaveURL(new RegExp(target.host.replace(/\./g, "\\.")));

        await this.page.waitForLoadState("load", { timeout: 10000 }).catch(() => {});
        await this.fullScreenScreenshot("Redirected payment page");
        return true;
    }
}
