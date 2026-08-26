import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../BasePage";

export class Dashboardpage extends BasePage {
    readonly leadCards: Locator;
    readonly deleteButton: Locator;
    readonly confirmDeleteButton: Locator;
    readonly showAllTab: Locator;
    readonly sellBtn: Locator;
    readonly cifNumInput: Locator;
    readonly entrBtn: Locator;
    readonly verifyContinueBtn: Locator;
    readonly healthInsurance: Locator;
    readonly lifeTermInsurance: Locator;

    constructor(page: Page) {
        super(page);
        this.leadCards = page.locator('a[href^="/leads/lead-detail/"]');
        this.deleteButton = page.getByRole("button", { name: /^Delete$/ });
        this.confirmDeleteButton = page.getByRole("button", { name: /Delete Lead/i });
        this.showAllTab = page.getByText("Show All", { exact: true });
        this.sellBtn = page.getByText("Sell", { exact: true });
        this.cifNumInput = page.getByPlaceholder("Customer User Id", { exact: true });
        this.entrBtn = page.locator("button:visible");
        this.verifyContinueBtn = page.locator("span:has-text('VERIFY CONTINUE')");
        this.healthInsurance = page.getByText("Health", { exact: true });
        this.lifeTermInsurance = page.locator("a").filter({ hasText: "Term" });
    }

    async navigateToHealthInsurance(cif = "12345") {
        await expect(this.page).toHaveURL(/.*\/dashboard/);
        await this.click(this.sellBtn, "click on Sell button");
        await this.fill(this.cifNumInput, cif, "fill CIF");
        await this.click(this.entrBtn, "click on Enter CIF button");
        await expect(this.verifyContinueBtn).toBeVisible();
        await this.click(this.verifyContinueBtn, "click on VERIFY CONTINUE button");
        await expect(this.healthInsurance).toBeVisible();
        await this.click(this.healthInsurance, "click on Health button");
    }

    async navigateToLifeTermInsurance(cif = "12345") {
        await expect(this.page).toHaveURL(/.*\/dashboard/);
        await this.click(this.sellBtn, "click on Sell button");
        await this.fill(this.cifNumInput, cif, "CIF");
        await this.click(this.entrBtn, "click on Enter CIF button");
        await expect(this.verifyContinueBtn).toBeVisible();
        await this.click(this.verifyContinueBtn, "click on VERIFY CONTINUE button");
        await expect(this.lifeTermInsurance).toBeVisible();
        await this.click(this.lifeTermInsurance, "click on Term button");
    }
}
