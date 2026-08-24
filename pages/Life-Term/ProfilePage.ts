import { Page, Locator } from "@playwright/test";
import { BasePage } from "../BasePage";
import { LifeTermScenario } from "../../types/lifeTerm.types";

export class ProfilePage extends BasePage {
    readonly noRadioBtn: Locator;
    readonly pincode: Locator;
    readonly nextBtn: Locator;
    readonly occupation: Locator;
    readonly salariedBtn: Locator;
    readonly educationalQualification: Locator;
    readonly graduateAndAboveBtn: Locator;
    readonly income: Locator;
    readonly lacTo15LacBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.noRadioBtn = page.getByRole("radio", { name: "No" });
        this.pincode = page.getByRole("textbox", { name: "Pincode *" });
        this.nextBtn = page.getByRole("button", { name: "Next" });
        this.occupation = page.getByRole("combobox", { name: "Occupation *" });
        this.salariedBtn = page.getByText("Salaried", { exact: true });
        this.educationalQualification = page.getByRole("combobox", { name: "Educational Qualification *" });
        this.graduateAndAboveBtn = page.getByText("Graduate and above");
        this.lacTo15LacBtn = page.getByText("Lac to 15 Lac");
        this.income = page.getByText("₹1 Crs");
    }

    async lifeTermProfileJourney(_scenario: LifeTermScenario) {
        await this.check(this.noRadioBtn, "Select No");
        await this.fill(this.pincode, "400002", "Pincode");
        await this.fullScreenScreenshot("Pincode");
        await this.click(this.nextBtn, "Next");
        await this.click(this.occupation, "Open Occupation");
        await this.click(this.salariedBtn, "Select Salaried");
        await this.click(this.educationalQualification, "Open Educational Qualification");
        await this.click(this.graduateAndAboveBtn, "Select Graduate and above");
        await this.fullScreenScreenshot("Educational Qualification");
        await this.click(this.nextBtn, "Next");
        await this.fullScreenScreenshot("Income");
        await this.click(this.nextBtn, "Next - Save quote");
    }
}
