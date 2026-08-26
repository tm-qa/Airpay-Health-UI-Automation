import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../BasePage";
import { InsurerConfig } from "../../config/insurers/types";
import { HealthMember, HealthScenario } from "../../types/health.types";
import { selectAntDate } from "../../utils/antDatePicker";
import { selectAntOption, selectAntOptionFromList } from "../../utils/antSelect";
import { getMemberMaritalStatus, getMemberTitleOptions } from "../../utils/memberHelpers";

export class CheckoutPage extends BasePage {
    readonly continueButton: Locator;
    readonly correspondenceCheckbox: Locator;
    readonly insuredDetailsHeading: Locator;
    readonly proposerMaritalStatus: Locator;
    readonly heightFeet: Locator;
    readonly heightInches: Locator;
    readonly weight: Locator;
    readonly maritalStatus: Locator;
    readonly nomineeName: Locator;
    readonly memberName: Locator;
    readonly nomineeRelation: Locator;
    readonly nomineeDob: Locator;
    readonly nomineeMobile: Locator;
    readonly nomineeEmail: Locator;
    readonly nomineeAddressCheckbox: Locator;
    readonly bankDetailsHeading: Locator;
    readonly accountHolderName: Locator;
    readonly proposerAccountNo: Locator;
    readonly proposerAccountNoConfirm: Locator;
    readonly savingAccountRadio: Locator;
    readonly proposerIfsc: Locator;
    readonly proposerBankName: Locator;
    readonly bankDropdown: Locator;
    readonly bankOption: Locator;
    readonly nomineeJointAccountCheckbox: Locator;
    readonly medicalHistoryHeading: Locator;
    readonly medicalQuestionnaireContinueBtn: Locator;
    readonly paymentHeading: Locator;
    readonly paymentGatewayRadio: Locator;
    readonly sharePaymentLink: Locator;
    readonly shareDialog: Locator;
    readonly copyLink: Locator;
    readonly seeMoreQuotesLink: Locator;
    readonly config: InsurerConfig;

    constructor(page: Page, config: InsurerConfig) {
        super(page);
        this.config = config;
        this.continueButton = page.getByRole("button", { name: "Continue" });
        this.correspondenceCheckbox = page.getByRole("checkbox", {
            name: "Correspondence address same as permanent address",
        });
        this.insuredDetailsHeading = page.getByRole("heading", { name: "2. Insured Details" });
        this.proposerMaritalStatus = page.getByRole("combobox", { name: "Marital Status *" }).first();
        this.heightFeet = page.getByRole("textbox", { name: "Height Feet *" });
        this.heightInches = page.getByRole("textbox", { name: "Height Inches *" });
        this.weight = page.getByRole("textbox", { name: "Weight *" });
        this.maritalStatus = page.getByRole("combobox", { name: "Marital Status *" });
        this.nomineeName = page.getByRole("textbox", { name: "Nominee's Name *" });
        this.memberName = page.getByRole("textbox", { name: "Name *" });
        this.nomineeRelation = page.getByRole("combobox", { name: "Nominee is my *" });
        this.nomineeDob = page.getByRole("textbox", { name: "Nominee's Date of Birth *" });
        this.nomineeMobile = page.getByRole("textbox", { name: "Nominee Mobile no. *" });
        this.nomineeEmail = page.getByRole("textbox", { name: "Nominee Email *" });
        this.nomineeAddressCheckbox = page.getByRole("checkbox", {
            name: /permanent address of the nominee is same as that of the proposer/i,
        });
        this.bankDetailsHeading = page.getByRole("heading", { name: /bank details/i });
        this.accountHolderName = page.getByRole("textbox", { name: "Account Holder Name *" });
        this.proposerAccountNo = page.locator("#maskedBankAccountNumber");
        this.proposerAccountNoConfirm = page.locator("#accountNo");
        this.savingAccountRadio = page.getByRole("radio", { name: "saving" });
        this.proposerIfsc = page.getByRole("textbox", { name: "IFSC no *" }).first();
        this.proposerBankName = page.getByRole("combobox", { name: "Bank name *" }).first();
        this.bankDropdown = page.locator(".ant-select-dropdown:visible").last();
        this.bankOption = this.bankDropdown
            .locator(".ant-select-item-option-content")
            .filter({ hasText: new RegExp(config.checkout.bankName, "i") })
            .first();
        this.nomineeJointAccountCheckbox = page.getByRole("checkbox", {
            name: /joint bank account, the bank account details of the nominee are same as that of proposer/i,
        });
        this.medicalHistoryHeading = page.getByRole("heading", { name: /medical history/i });
        this.medicalQuestionnaireContinueBtn = page
            .locator("div")
            .filter({ hasText: /Please answer the basic medical questionnaire|medical questionnaire|medical history/i })
            .getByRole("button", { name: "Continue" })
            .first();
        this.paymentHeading = page.getByRole("heading", { name: /payment/i });
        this.paymentGatewayRadio = page.getByRole("radio", { name: "Payment Gateway" });
        this.sharePaymentLink = page.getByRole("button", { name: "Share Payment Link" });
        this.shareDialog = page.getByRole("dialog");
        this.copyLink = this.shareDialog.getByText("Copy Link", { exact: true });
        this.seeMoreQuotesLink = page.getByRole("link", { name: /See more quotes/i });
    }

    async fillProposalFormHealth(scenario: HealthScenario): Promise<string> {
        await this.fillContactDetails();
        await this.fillInsuredDetails(scenario);
        const bankVisible = await this.accountHolderName.isVisible({ timeout: 8000 }).catch(() => false);
        if (bankVisible) {
            await this.fillBankDetails(scenario);
        }
        await this.continueToMedicalHistory();
        return this.proceedForPayment();
    }

    private async fillContactDetails() {
        await this.check(this.correspondenceCheckbox, "click on Correspondence address same checkbox");
        await this.fullScreenScreenshot("Correspondence address same");
        await this.click(this.continueButton, "click on Continue button", { force: true });
    }

    private async selectMemberTitle(member: HealthMember, index: number) {
        if (member.relation.toUpperCase() === "SELF") return;

        const titleCombo = this.page.getByRole("combobox", { name: "Title *" }).nth(index + 1);
        await selectAntOptionFromList(this.page, titleCombo, getMemberTitleOptions(member));
        await this.log(`select Title for ${member.uiRelation}`);
    }

    private async fillMemberName(member: HealthMember, formIndex: number, scenario: HealthScenario) {
        if (!member.name || member.relation.toUpperCase() === "SELF") return;

        const rel = member.relation.toUpperCase();
        const order = scenario.members
            .slice(0, formIndex + 1)
            .filter((m) => m.relation.toUpperCase() === rel).length;

        if (rel === "SON" || rel === "DAUGHTER") {
            const fieldId = rel === "SON" ? `son${order}Name` : `daughter${order}Name`;
            const field = this.page.locator(`#${fieldId}`);
            if (await field.isVisible()) await this.fill(field, member.name, `fill ${member.uiRelation} Name`);
            return;
        }

        const nameField = this.page.getByRole("textbox", { name: "Name *" }).nth(formIndex + 1);
        if (await nameField.isVisible()) await this.fill(nameField, member.name, `fill ${member.uiRelation} Name`);
    }

    private async fillInsuredDetails(scenario: HealthScenario) {
        await this.click(this.insuredDetailsHeading, "click on Insured Details heading");
        await selectAntOption(this.page, this.proposerMaritalStatus, scenario.maritalStatus);
        await this.log(`select Marital Status: ${scenario.maritalStatus}`);
        await this.fullScreenScreenshot("Marital Status");

        for (let formIndex = 0; formIndex < scenario.members.length; formIndex++) {
            const member = scenario.members[formIndex];
            const height = this.heightFeet.nth(formIndex);

            if (!(await height.isVisible({ timeout: 3000 }).catch(() => false))) break;

            if (member.relation.toUpperCase() !== "SELF") {
                await this.selectMemberTitle(member, formIndex);
            }

            await height.scrollIntoViewIfNeeded();
            await this.fill(height, scenario.heightFeet, `fill Height Feet for ${member.uiRelation}`);
            await this.fill(this.heightInches.nth(formIndex), scenario.heightInches, `fill Height Inches for ${member.uiRelation}`);
            await this.fill(this.weight.nth(formIndex), scenario.weight, `fill Weight for ${member.uiRelation}`);
            await this.fillMemberName(member, formIndex, scenario);
            await this.page.keyboard.press("Escape");

            const maritalCombo = this.maritalStatus.nth(formIndex + 1);
            if (await maritalCombo.isVisible()) {
                const status = getMemberMaritalStatus(member, scenario.members);
                await selectAntOption(this.page, maritalCombo, status);
                await this.log(`select Marital Status for ${member.uiRelation}: ${status}`);
            }
        }

        for (const r of await this.page.getByRole("radio", { name: /^No$/ }).all()) {
            if (await r.isVisible()) {
                await r.evaluate((el) => (el as HTMLElement).click());
                await this.log("click on No radio button");
            }
        }
        if (await this.page.getByRole("combobox", { name: /occupation/i }).isVisible()) {
            await selectAntOption(this.page, this.page.getByRole("combobox", { name: /occupation/i }), "Salaried");
            await this.log("select Occupation: Salaried");
        }
        if (await this.page.getByRole("combobox", { name: "Title *" }).last().isEnabled()) {
            await selectAntOption(this.page, this.page.getByRole("combobox", { name: "Title *" }).last(), "MR");
            await this.log("select Nominee Title: MR");
        }
        await this.fill(this.nomineeName, scenario.nominee.name, "fill Nominee Name");
        await selectAntOption(this.page, this.nomineeRelation, scenario.nominee.relation);
        await this.log(`select Nominee relation: ${scenario.nominee.relation}`);
        await selectAntDate(this.page, this.nomineeDob, scenario.nominee.dobPickerTitle);
        await this.log(`fill Nominee Date of Birth: ${scenario.nominee.dobPickerTitle}`);
        if (await this.nomineeMobile.isVisible({ timeout: 3000 }).catch(() => false)) {
            await this.fill(this.nomineeMobile, scenario.nominee.mobile, "fill Nominee Mobile");
        }
        if (await this.nomineeEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
            await this.fill(this.nomineeEmail, scenario.nominee.email, "fill Nominee Email");
        }
        if (await this.nomineeAddressCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
            await this.check(this.nomineeAddressCheckbox, "click on Nominee address same as proposer checkbox");
        }
        await this.fullScreenScreenshot("Insured Details");
        await this.click(this.continueButton, "click on Continue button", { force: true });
    }

    private async fillBankDetails(scenario: HealthScenario) {
        await this.click(this.bankDetailsHeading, "click on Bank Details heading");
        await this.fill(this.accountHolderName, scenario.accountHolderName, "fill Account Holder Name");
        await this.fill(this.proposerAccountNo, scenario.bankAccountNo, "fill Account Number");
        await this.fill(this.proposerAccountNoConfirm, scenario.bankAccountNo, "fill Confirm Account Number");
        await this.check(this.savingAccountRadio, "click on Saving account radio button");
        await this.fill(this.proposerIfsc, scenario.ifsc, "fill IFSC");
        await this.click(this.proposerBankName, "click on Bank name dropdown", { force: true });
        await this.fill(this.proposerBankName, scenario.bankName, "fill Bank name");
        await this.click(this.bankOption, `click on Bank option ${scenario.bankName}`);
        await this.check(this.nomineeJointAccountCheckbox, "click on Nominee joint account same as proposer checkbox");
        await this.fullScreenScreenshot("Bank Details");

        for (let attempt = 0; attempt < 3; attempt++) {
            await this.click(this.continueButton, "click on Continue button", { force: true });
            const serverError = this.page.getByText(/Something went wrong at server side/i);
            const advanced = await this.medicalQuestionnaireContinueBtn
                .or(this.paymentHeading)
                .isVisible()
                .catch(() => false);
            if (advanced) break;
            if (await serverError.isVisible({ timeout: 2000 }).catch(() => false)) {
                await this.page.waitForTimeout(2000);
                continue;
            }
            break;
        }
    }

    private async continueToMedicalHistory() {
        const alreadyVisible = await this.medicalQuestionnaireContinueBtn.isVisible({ timeout: 3000 }).catch(() => false);
        if (!alreadyVisible) {
            await this.click(this.medicalHistoryHeading, "click on Medical History heading");
        }
        const btnReady = await this.medicalQuestionnaireContinueBtn
            .or(this.continueButton)
            .first()
            .waitFor({ state: "visible", timeout: 20000 })
            .then(() => true)
            .catch(() => false);

        if (!btnReady) throw new Error("Medical history Continue button not found after 20s");

        if (await this.medicalQuestionnaireContinueBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            await this.click(this.medicalQuestionnaireContinueBtn, "click on Medical questionnaire Continue button");
        } else {
            await this.click(this.continueButton, "click on Continue button", { force: true });
        }
        await expect(this.paymentHeading).toBeVisible({ timeout: 20000 });
    }

    private async proceedForPayment(): Promise<string> {
        await this.click(this.paymentHeading, "click on Payment heading");
        if (await this.paymentGatewayRadio.isVisible({ timeout: 5000 }).catch(() => false)) {
            await this.click(this.paymentGatewayRadio, "click on Payment Gateway radio button");
        }

        const href = await this.seeMoreQuotesLink.getAttribute("href");
        if (href?.includes("referenceId")) {
            await this.fullScreenScreenshot("Payment");
            const referenceId = new URL(href, this.page.url()).searchParams.get("referenceId");
            return `https://pro.airpay.saas-sanity.turtle-feature.com/health-insurance/review?referenceId=${referenceId}`;
        }

        await this.click(this.sharePaymentLink, "click on Share Payment Link button");
        await expect(this.shareDialog).toBeVisible({ timeout: 20000 });
        if (await this.copyLink.isVisible()) await this.click(this.copyLink, "click on Copy Link button");
        await this.fullScreenScreenshot("Share Payment Link");

        const reviewHref = await this.seeMoreQuotesLink.getAttribute("href");
        const referenceId = new URL(reviewHref!, this.page.url()).searchParams.get("referenceId");
        return `https://pro.airpay.saas-sanity.turtle-feature.com/health-insurance/review?referenceId=${referenceId}`;
    }
}
