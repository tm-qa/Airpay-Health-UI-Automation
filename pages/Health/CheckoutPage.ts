import { Page, Locator, expect } from "@playwright/test";
import { InsurerConfig } from "../../config/insurers/types";
import { HealthMember, HealthScenario } from "../../types/health.types";
import { selectAntDate } from "../../utils/antDatePicker";
import { selectAntOption, selectAntOptionFromList } from "../../utils/antSelect";
import { getMemberMaritalStatus, getMemberTitleOptions } from "../../utils/memberHelpers";

export class CheckoutPage {
    readonly page: Page;
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
        this.page = page;
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
        await this.correspondenceCheckbox.check();
        await this.continueButton.click({ force: true });
    }

    private async selectMemberTitle(member: HealthMember, index: number) {
        if (member.relation.toUpperCase() === "SELF") return;

        const titleCombo = this.page.getByRole("combobox", { name: "Title *" }).nth(index + 1);
        await selectAntOptionFromList(this.page, titleCombo, getMemberTitleOptions(member));
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
            if (await field.isVisible()) await field.fill(member.name);
            return;
        }

        const nameField = this.page.getByRole("textbox", { name: "Name *" }).nth(formIndex + 1);
        if (await nameField.isVisible()) await nameField.fill(member.name);
    }

    private async fillInsuredDetails(scenario: HealthScenario) {
        await this.insuredDetailsHeading.click();
        await selectAntOption(this.page, this.proposerMaritalStatus, scenario.maritalStatus);

        for (let formIndex = 0; formIndex < scenario.members.length; formIndex++) {
            const member = scenario.members[formIndex];
            const height = this.heightFeet.nth(formIndex);

            if (!(await height.isVisible({ timeout: 3000 }).catch(() => false))) break;

            if (member.relation.toUpperCase() !== "SELF") {
                await this.selectMemberTitle(member, formIndex);
            }

            await height.scrollIntoViewIfNeeded();
            await height.fill(scenario.heightFeet);
            await this.heightInches.nth(formIndex).fill(scenario.heightInches);
            await this.weight.nth(formIndex).fill(scenario.weight);
            await this.fillMemberName(member, formIndex, scenario);
            await this.page.keyboard.press("Escape");

            const maritalCombo = this.maritalStatus.nth(formIndex + 1);
            if (await maritalCombo.isVisible()) {
                await selectAntOption(
                    this.page,
                    maritalCombo,
                    getMemberMaritalStatus(member, scenario.members)
                );
            }
        }

        for (const r of await this.page.getByRole("radio", { name: /^No$/ }).all()) if (await r.isVisible()) await r.evaluate((el) => (el as HTMLElement).click());
        if (await this.page.getByRole("combobox", { name: /occupation/i }).isVisible()) await selectAntOption(this.page, this.page.getByRole("combobox", { name: /occupation/i }), "Salaried");
        if (await this.page.getByRole("combobox", { name: "Title *" }).last().isEnabled()) await selectAntOption(this.page, this.page.getByRole("combobox", { name: "Title *" }).last(), "MR");
        await this.nomineeName.fill(scenario.nominee.name);
        await selectAntOption(this.page, this.nomineeRelation, scenario.nominee.relation);
        await selectAntDate(this.page, this.nomineeDob, scenario.nominee.dobPickerTitle);
        if (await this.nomineeMobile.isVisible({ timeout: 3000 }).catch(() => false)) {
            await this.nomineeMobile.fill(scenario.nominee.mobile);
        }
        if (await this.nomineeEmail.isVisible({ timeout: 3000 }).catch(() => false)) {
            await this.nomineeEmail.fill(scenario.nominee.email);
        }
        if (await this.nomineeAddressCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
            await this.nomineeAddressCheckbox.check();
        }
        await this.continueButton.click({ force: true });
    }

    private async fillBankDetails(scenario: HealthScenario) {
        await this.bankDetailsHeading.click();
        await this.accountHolderName.fill(scenario.accountHolderName);
        await this.proposerAccountNo.fill(scenario.bankAccountNo);
        await this.proposerAccountNoConfirm.fill(scenario.bankAccountNo);
        await this.savingAccountRadio.check();
        await this.proposerIfsc.fill(scenario.ifsc);
        await this.proposerBankName.click({ force: true });
        await this.proposerBankName.fill(scenario.bankName);
        await this.bankOption.click();
        await this.nomineeJointAccountCheckbox.check();

        for (let attempt = 0; attempt < 3; attempt++) {
            await this.continueButton.click({ force: true });
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
            await this.medicalHistoryHeading.click();
        }
        const btnReady = await this.medicalQuestionnaireContinueBtn
            .or(this.continueButton)
            .first()
            .waitFor({ state: "visible", timeout: 20000 })
            .then(() => true)
            .catch(() => false);

        if (!btnReady) throw new Error("Medical history Continue button not found after 20s");

        if (await this.medicalQuestionnaireContinueBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            await this.medicalQuestionnaireContinueBtn.click();
        } else {
            await this.continueButton.click({ force: true });
        }
        await expect(this.paymentHeading).toBeVisible({ timeout: 20000 });
    }

    private async proceedForPayment(): Promise<string> {
        await this.paymentHeading.click();
        if (await this.paymentGatewayRadio.isVisible({ timeout: 5000 }).catch(() => false)) {
            await this.paymentGatewayRadio.click();
        }

        const href = await this.seeMoreQuotesLink.getAttribute("href");
        if (href?.includes("referenceId")) {
            const referenceId = new URL(href, this.page.url()).searchParams.get("referenceId");
            return `https://pro.airpay.saas-sanity.turtle-feature.com/health-insurance/review?referenceId=${referenceId}`;
        }

        await this.sharePaymentLink.click();
        await expect(this.shareDialog).toBeVisible({ timeout: 20000 });
        if (await this.copyLink.isVisible()) await this.copyLink.click();

        const reviewHref = await this.seeMoreQuotesLink.getAttribute("href");
        const referenceId = new URL(reviewHref!, this.page.url()).searchParams.get("referenceId");
        return `https://pro.airpay.saas-sanity.turtle-feature.com/health-insurance/review?referenceId=${referenceId}`;
    }
}
