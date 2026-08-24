import { Page, Locator, expect } from "@playwright/test";

export class PaymentReviewPage {
    readonly page: Page;
    readonly reviewHeading: Locator;
    readonly termsCheckbox: Locator;
    readonly customerInfoSheetLink: Locator;
    readonly termsAndConditionsLink: Locator;
    readonly approveButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.reviewHeading = page.getByText(/review & approve your application/i);
        this.termsCheckbox = page
            .locator("div")
            .filter({ hasText: /I hereby confirm that all the details mentioned here are correct/i })
            .getByRole("checkbox");
        this.customerInfoSheetLink = page.locator("a.ant-typography").filter({ hasText: /customer information sheet/i });
        this.termsAndConditionsLink = page.locator("a.ant-typography").filter({ hasText: /Terms & Conditions/i });
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

        await this.termsCheckbox.check();

        const hasCisLink = await this.customerInfoSheetLink.isVisible({ timeout: 3000 }).catch(() => false);
        if (hasCisLink) {
            const cisPagePromise = this.page.context().waitForEvent("page", { timeout: 15000 }).catch(() => null);
            await this.customerInfoSheetLink.click();
            const cisPage = await cisPagePromise;
            if (cisPage) await cisPage.close();
        }

        const hasTermsLink = await this.termsAndConditionsLink.isVisible({ timeout: 5000 }).catch(() => false);
        if (hasTermsLink) {
            const termsPagePromise = this.page.context().waitForEvent("page", { timeout: 3000 }).catch(() => null);
            await this.termsAndConditionsLink.click();
            const termsPage = await termsPagePromise;
            if (termsPage) {
                await termsPage.close();
            } else {
                await this.page.locator(".ant-modal-close").click({ timeout: 5000 }).catch(() => {});
            }
        }

        await expect(this.approveButton).toBeEnabled({ timeout: 10000 });
        const approve = this.page.waitForResponse((r) => r.url().includes("/payments/approve") && r.request().method() === "POST");
        await this.approveButton.click();
        await this.page.goto((await (await approve).json()).data.paymentLink);
        return true;
    }
}
