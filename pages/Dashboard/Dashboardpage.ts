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
    readonly searchBox: Locator;
    readonly cancel: Locator;
    readonly viewQuotes: Locator;
    readonly viewQuotesBtn: Locator;
    readonly checkoutInProgress: Locator;
    readonly checkoutInProgressBtn: Locator;
    readonly paymentPending: Locator;
    readonly paymentInprogress: Locator;
    readonly backToHome: Locator;
    readonly okBtn: Locator;
    readonly businessTab: Locator;
    readonly insuranceSales: Locator;
    readonly leads: Locator;
    readonly profile: Locator;
    readonly account: Locator;
    readonly accLink: Locator;
    readonly setting: Locator;
    readonly logout: Locator;
    readonly logoutBtn: Locator;


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
        this.searchBox = page.getByRole('textbox', { name: 'Search Lead by Name' });
        this.cancel = page.locator('span.closeSearch.mIcon.cross_icon');
        this.viewQuotes = page.locator('div').filter({ hasText: 'View Quotes' }).first();
        this.viewQuotesBtn = page.getByRole('button', { name: 'View Quotes' });
        this.checkoutInProgress = page.getByText('Checkout In Progress', { exact: true }).first();
        this.checkoutInProgressBtn = page.getByRole('button', { name: 'Checkout In Progress' });
        this.paymentPending = page.getByText('Payment Pending', { exact: true }).first();
        this.paymentInprogress = page.getByRole('button', { name: 'Payment In Progress' });
        this.backToHome = page.getByText('Back to home', { exact: true });
        this.okBtn = page.getByRole('button', { name: 'OK' });
        this.businessTab = page.getByText('Business', { exact: true });
        this.insuranceSales = page.getByText('Insurance Sales', { exact: true });
        this.leads = page.getByText('Leads', { exact: true });
        this.profile = page.getByText('Profile', { exact: true });
        this.account = page.getByText('My Account', { exact: true });
        this.accLink = page.getByRole('link', { name: 'Account' });
        this.setting = page.getByText('Settings', { exact: true });
        this.logout = page.getByText('Log Out', { exact: true });
        this.logoutBtn = page.getByRole('button', { name: 'Logout' });
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
        this.log("Navigated to Life Term Insurance");
        this.logUrl();
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
        this.log("Navigated to Life Term Insurance");
    }

    async verifyLeadsearchInShowall(){
        await this.click(this.searchBox, "Click into the lead searchbox");
        await this.fill(this.searchBox, "pranali", "Enter the lead name");
        this.page.screenshot();
        await this.click(this.cancel, "clear the lead name from search box");

    }

    async verifyViewQuoteBtnRedirection(){
        await this.click(this.viewQuotes, "click the lead having status view quotes");
        await this.click(this.viewQuotesBtn, "click on view quotes button on lead");
        await expect(this.page).toHaveURL(/.*\/result/);
        await this.click(this.backToHome, "Click on back to home button on result page");
        await this.click(this.okBtn, "click on ok button");
        await expect(this.page).toHaveURL(/.*\/dashboard/);

    }

    async verifyCheckoutInProgressBtnRedirection(){
        await this.click(this.checkoutInProgress, "click the lead having status checkout in progress");
        await this.click(this.checkoutInProgressBtn, "click on checkout in progress button on lead");
        await expect(this.page).toHaveURL(/.*\/checkout/);
        await this.click(this.backToHome, "Click on back to home button on checkout page");
        await this.click(this.okBtn, "click on ok button");
        await expect(this.page).toHaveURL(/.*\/dashboard/);

    }

    async verifyPaymentInProgressBtnRedirection(){
        await this.click(this.paymentPending, "click the lead having status payment pending");
        await this.click(this.paymentInprogress, "click on payment in progress button on lead");
        await expect(this.page).toHaveURL(/.*\/payment-tracking/);
        await this.click(this.backToHome, "Click on back to home button on tracking page");
        await this.click(this.okBtn, "click on ok button");
        await expect(this.page).toHaveURL(/.*\/dashboard/);

    }

    async verifyBusinessInsuranceSales(){
        await this.hover(this.businessTab, "Hover on business tab");
       // await this.click(this.businessTab, "Click business tab");
        await this.click(this.insuranceSales, "Click on insurance sales")
        this.page.screenshot();
        await this.click(this.leads, "click on leads tab");
        await expect(this.page).toHaveURL(/.*\/dashboard/);


    }

    async verifyProfileTab(){
        await this.click(this.profile, "Click on profile tab");
        await expect(this.page).toHaveURL(/.*\/account/);
        await this.click(this.account, "click on account");
        this.page.screenshot();
        await this.click(this.accLink, "click on my account back link");
        await this.click(this.setting, "click on setting btn");
        await this.click(this.logout, "click on logout");
        await this.click(this.logoutBtn, "click on logout btn");
        await expect(this.page).toHaveURL(/.*\/signup/);


    }


}
