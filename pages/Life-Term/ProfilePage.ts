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
        this.log("Starting Profile Journey");
        await this.check(this.noRadioBtn, "click on No radio button");
        await this.fill(this.pincode, "400002", "fill Pincode");
        await this.fullScreenScreenshot("Pincode Page Screenshot");
        await this.click(this.nextBtn, "click on Next button");
        await this.click(this.occupation, "click on Occupation button");
        await this.click(this.salariedBtn, "click on Salaried button");
        await this.click(this.educationalQualification, "Open Educational Qualification");
        await this.click(this.graduateAndAboveBtn, "click on Graduate and above button");
        await this.fullScreenScreenshot("Educational Qualification Page Screenshot");
        await this.click(this.nextBtn, "click on Next button");
        await this.fullScreenScreenshot("Income Page Screenshot");
        await this.click(this.nextBtn, "click on Next - Save quote button");
        this.log("Completed Profile Journey");
    }
}
