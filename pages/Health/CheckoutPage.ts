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
    readonly incomeCombo: Locator;
    readonly proposerMaritalStatus: Locator;
    readonly memberName: Locator;
    readonly heightFeet: Locator;
    readonly heightInches: Locator;
    readonly weight: Locator;
    readonly maritalStatus: Locator;
    readonly titleCombos: Locator;
    readonly nameBoxes: Locator;
    readonly nomineeName: Locator;
    readonly nomineeTitle: Locator;
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
    readonly proposerPan: Locator;

    constructor(page: Page, config: InsurerConfig) {
        super(page);
        this.config = config;
        this.continueButton = page.getByRole("button", { name: "Continue" });
        this.correspondenceCheckbox = page.getByRole("checkbox", {
            name: "Correspondence address same as permanent address",
        });
        this.insuredDetailsHeading = page.getByRole("heading", { name: /Insured Details/i });
        this.incomeCombo = page.getByRole("combobox", { name: "Income *" });
        this.proposerMaritalStatus = page.getByRole("combobox", { name: "Marital Status *" }).first();
        this.memberName = page.getByRole("textbox", { name: "Name *" });

        this.heightFeet = page.getByRole("textbox", { name: "Height Feet *" });
        this.heightInches = page.getByRole("textbox", { name: "Height Inches *" });
        this.weight = page.getByRole("textbox", { name: "Weight *" });
        this.maritalStatus = page.getByRole("combobox", { name: "Marital Status *" });
        this.titleCombos = page.getByRole("combobox", { name: "Title *" });
        this.nameBoxes = page.getByRole("textbox", { name: "Name *" });


        this.nomineeName = page.getByRole("textbox", { name: "Nominee's Name *" });
        this.nomineeTitle = page.locator("#NomineeTitle");
        this.nomineeRelation = page.getByRole("combobox", { name: "Nominee is my *" });
        this.nomineeDob = page.getByRole("textbox", { name: "Nominee's Date of Birth *" });
        this.nomineeMobile = page.getByRole("textbox", { name: /nominee.*mobile|mobile/i }).last();
        this.nomineeEmail = page.getByRole("textbox", { name: /nominee.*email|email/i }).last();
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
        this.proposerPan = page.getByRole("textbox", { name: "PAN No. *" });
    }

    async fillProposalFormHealth(scenario: HealthScenario): Promise<string> {
        await this.logUrl('Current Checkout Page URL');
        await this.fillContactDetails();
        await this.fillInsuredDetails(scenario);
        const bankVisible = await this.isShown(this.accountHolderName, 8000);
        if (bankVisible) {
            await this.fillBankDetails(scenario);
        }
        await this.continueToMedicalHistory();
        return this.proceedForPayment();
    }


    private async isShown(locator: Locator, timeout = 3000) {
        return locator.waitFor({ state: "visible", timeout }).then(() => true).catch(() => false);
    }


    private async byIdOr(id: string, fallback: Locator): Promise<Locator> {
        const byId = this.page.locator(`#${id}`);
        return (await byId.count()) > 0 ? byId.first() : fallback;
    }

    private memberKey(member: HealthMember, scenario: HealthScenario, formIndex: number): string {
        const rel = member.relation.toUpperCase();
        if (rel === "SON" || rel === "DAUGHTER") {
            const order = scenario.members
                .slice(0, formIndex + 1)
                .filter((m) => m.relation.toUpperCase() === rel).length;
            return `${rel.toLowerCase()}${order}`;
        }
        return rel.toLowerCase();
    }


    private async fillContactDetails() {
        const hasSameAsCheckbox = await this.isShown(this.correspondenceCheckbox, 5000);

        if (hasSameAsCheckbox) {
            await this.check(this.correspondenceCheckbox, "click on Correspondence address same checkbox");
        } else {
            const line1 = this.page.getByRole("textbox", { name: "Address Line 1 *" });
            const line2 = this.page.getByRole("textbox", { name: "Address Line 2" });
            await this.fill(line1.last(), await line1.first().inputValue(), "fill Correspondence Address Line 1");
            await this.fill(line2.last(), await line2.first().inputValue(), "fill Correspondence Address Line 2");
        }
        await this.fullScreenScreenshot("Correspondence address same");
        await this.click(this.continueButton, "click on Continue button", { force: true });
    }

    private async fillInsuredDetails(scenario: HealthScenario) {
        await this.click(this.insuredDetailsHeading, "click on Insured Details heading");

        if ((await this.isShown(this.proposerPan, 3000)) && (await this.proposerPan.isEnabled()) && !(await this.proposerPan.inputValue())) {
            await this.fill(this.proposerPan, this.config.kyc.pan, "fill PAN");
        }

        const proposerMarital = await this.byIdOr("proposerMaritalStatus", this.proposerMaritalStatus);
        await expect(proposerMarital).toBeAttached();
        await this.pickFirstAntOption(this.incomeCombo, "Income");
        await selectAntOption(this.page, proposerMarital, scenario.maritalStatus);
        await this.log(`select Marital Status: ${scenario.maritalStatus}`);
        await this.fullScreenScreenshot("Marital Status");

        let nonSelfIndex = 0;
        const selfOffset = scenario.members.some((m) => m.relation.toUpperCase() === "SELF") ? 1 : 0;
        for (let formIndex = 0; formIndex < scenario.members.length; formIndex++) {
            const member = scenario.members[formIndex];
            const isSelf = member.relation.toUpperCase() === "SELF";
            const key = this.memberKey(member, scenario, formIndex);

            const height = await this.byIdOr(`${key}HeightFeet`, this.heightFeet.nth(formIndex));
            if (!(await this.isShown(height, 3000))) continue;
            await height.scrollIntoViewIfNeeded();

            if (!isSelf) {
                const title = await this.byIdOr(`${key}Title`, this.titleCombos.nth(nonSelfIndex + 1 + selfOffset));
                await selectAntOptionFromList(this.page, title, getMemberTitleOptions(member));
                await this.log(`select Title for ${member.uiRelation}`);

                if (member.name) {
                    const name = await this.byIdOr(`${key}Name`, this.nameBoxes.nth(nonSelfIndex + 1 + selfOffset));
                    if (await name.isVisible()) await this.fill(name, member.name, `fill ${member.uiRelation} Name`);
                }
                nonSelfIndex++;
            }

            await this.fill(height, scenario.heightFeet, `fill Height Feet for ${member.uiRelation}`);
            const inches = await this.byIdOr(`${key}HeightInches`, this.heightInches.nth(formIndex));
            await this.fill(inches, scenario.heightInches, `fill Height Inches for ${member.uiRelation}`);
            const weight = await this.byIdOr(`${key}Weight`, this.weight.nth(formIndex));
            await this.fill(weight, scenario.weight, `fill Weight for ${member.uiRelation}`);

            const marital = await this.byIdOr(`${key}MaritalStatus`, this.maritalStatus.nth(formIndex + 1));
            if (await marital.isVisible()) {
                const status = getMemberMaritalStatus(member, scenario.members);
                await selectAntOption(this.page, marital, status);
                await this.log(`select Marital Status for ${member.uiRelation}: ${status}`);
            }
        }


        for (const r of await this.page.getByRole("radio", { name: /^No$/ }).all()) {
            if (await r.isVisible()) {
                await r.evaluate((el) => (el as HTMLElement).click());
                await this.log("click on No radio button");
            }
        }
        await this.page.keyboard.press("Escape");

        const occupation = this.page.locator(".ant-select").filter({ hasText: "Select Occupation" }).first();
        if (await occupation.isVisible()) {
            await this.pickFirstAntOption(occupation, "Occupation");
        }

        const education = this.page.getByRole("combobox", { name: /education/i });
        if (await education.isVisible()) {
            await this.pickFirstAntOption(education, "Education");
        }


        if (await this.isShown(this.nomineeName, 3000)) {
            if ((await this.nomineeTitle.count()) > 0 && (await this.nomineeTitle.first().isEnabled())) {
                await selectAntOptionFromList(this.page, this.nomineeTitle.first(), ["Mr", "MR"]);
                await this.log("select Nominee Title: Mr");
            }

            await this.fill(this.nomineeName, scenario.nominee.name, "fill Nominee Name");
            await selectAntOption(this.page, this.nomineeRelation, scenario.nominee.relation);
            await this.log(`select Nominee relation: ${scenario.nominee.relation}`);
            await selectAntDate(this.page, this.nomineeDob, scenario.nominee.dobPickerTitle);
            await this.log(`fill Nominee Date of Birth: ${scenario.nominee.dobPickerTitle}`);

            if (await this.isShown(this.nomineeMobile, 1500)) {
                await this.fill(this.nomineeMobile, scenario.nominee.mobile, "fill Nominee Mobile");
            }
            if (await this.isShown(this.nomineeEmail, 1500)) {
                await this.fill(this.nomineeEmail, scenario.nominee.email, "fill Nominee Email");
            }
            if (await this.isShown(this.nomineeAddressCheckbox, 1500)) {
                await this.check(this.nomineeAddressCheckbox, "click on Nominee address same as proposer checkbox");
            }
        }
        await this.fullScreenScreenshot("Insured Details");
        await this.click(this.continueButton.last(), "click on Continue button", { force: true });
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
        const alreadyVisible = await this.isShown(this.medicalQuestionnaireContinueBtn, 3000);
        if (!alreadyVisible && (await this.isShown(this.medicalHistoryHeading, 5000))) {
            await this.click(this.medicalHistoryHeading, "click on Medical History heading");
        }
        const btnReady = await this.isShown(
            this.medicalQuestionnaireContinueBtn.or(this.continueButton).first(),
            20000
        );
        if (!btnReady) throw new Error("Medical history Continue button not found after 20s");

        if (await this.medicalQuestionnaireContinueBtn.isVisible().catch(() => false)) {
            await this.click(this.medicalQuestionnaireContinueBtn, "click on Medical questionnaire Continue button");
        } else {
            await this.click(this.continueButton, "click on Continue button", { force: true });
        }
        await expect(this.paymentHeading).toBeVisible({ timeout: 20000 });
    }

    private async proceedForPayment(): Promise<string> {
        await this.click(this.paymentHeading, "click on Payment heading");
        if (await this.isShown(this.paymentGatewayRadio, 5000)) {
            await this.check(this.paymentGatewayRadio, "click on Payment Gateway radio button");
        }

        await this.click(this.sharePaymentLink, "click on Share Payment Link button");
        await expect(this.shareDialog).toBeVisible({ timeout: 90000 });

        this.page.once("dialog", (dialog) => dialog.dismiss().catch(() => undefined));
        if (await this.copyLink.isVisible()) await this.click(this.copyLink, "click on Copy Link button");
        await this.fullScreenScreenshot("Share Payment Link");

        const reviewHref = await this.seeMoreQuotesLink.getAttribute("href");
        const referenceId = new URL(reviewHref!, this.page.url()).searchParams.get("referenceId");
        if (!referenceId) throw new Error(`Missing referenceId in href: ${reviewHref}`);

        const reviewUrl = new URL("/health-insurance/review", this.page.url());
        reviewUrl.searchParams.set("referenceId", referenceId);
        return reviewUrl.toString();
    }

    private async pickFirstAntOption(trigger: Locator, label: string) {
        await trigger.scrollIntoViewIfNeeded();
        await trigger.click();
        await this.click(
            this.page
                .locator(".ant-select-dropdown:not(.ant-select-dropdown-hidden)")
                .last()
                .locator(".ant-select-item-option")
                .first(),
            `select ${label}`
        );
    }
}
