import { Page, Locator, FrameLocator, expect } from "@playwright/test";
import { BasePage } from "../BasePage";

export class OVDPage extends BasePage {
    readonly kycIframe: Locator;

    constructor(page: Page) {
        super(page);
        this.kycIframe = page.locator("iframe").first();
    }

    private get frame(): FrameLocator {
        return this.kycIframe.contentFrame();
    }

    async uploadAadhaar(
        frontPath = "data/AFront.jpg",
        backPath = "data/ABack.jpg"
    ) {
        const frame = this.frame;

        const documentType = frame.getByRole("combobox");
        await documentType.waitFor({ state: "visible", timeout: 30000 });
        await this.click(documentType, "click on Document Type dropdown");
        await this.click(
            frame.getByText("Aadhaar Card", { exact: true }).last(),
            "select Aadhaar Card"
        );

        const fileInputs = frame.locator('input[type="file"]');
        await expect(fileInputs).toHaveCount(4);
        await fileInputs.nth(0).setInputFiles(frontPath);
        await fileInputs.nth(2).setInputFiles(backPath);
        await this.log(`upload Aadhaar front: ${frontPath}, back: ${backPath}`);

        await expect(frame.getByText("AFront.jpg", { exact: true })).toBeVisible();
        await expect(frame.getByText("ABack.jpg", { exact: true })).toBeVisible();
        await this.fullScreenScreenshot("OVD upload");

        await this.click(
            frame.getByRole("button", { name: "Verify Details" }),
            "click on Verify Details button"
        );
        await this.click(
            frame.getByRole("button", { name: "Confirm & Proceed" }),
            "click on Confirm & Proceed button"
        );
    }
}