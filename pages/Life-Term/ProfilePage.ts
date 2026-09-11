import { Page, Locator } from "@playwright/test";
import { BasePage } from "../BasePage";
import { LifeTermScenario } from "../../types/lifeTerm.types";

export class ProfilePage extends BasePage {
    readonly noRadioBtn: Locator;
    readonly pincode: Locator;
    readonly nextBtn: Locator;
    readonly occupation: Locator;
    readonly salariedBtn: Locator;
    readonly selfEmployedBtn: Locator;

    readonly educationalQualification: Locator;
    readonly twelvePassBtn: Locator;
    readonly tenPassBtn: Locator;
    readonly below10thBtn: Locator;
    readonly graduateAndAboveBtn: Locator;
    readonly income: Locator;
    readonly tenlacTo15LacBtn: Locator;
    readonly fifteenLacPlusBtn: Locator;
    readonly sevenLacToTenLacBtn: Locator;
    readonly fiveLacToSevenLacBtn: Locator;

    constructor(page: Page) {
        super(page);
        this.noRadioBtn = page.getByRole("radio", { name: "No" });
        this.pincode = page.getByRole("textbox", { name: "Pincode *" });
        this.nextBtn = page.getByRole("button", { name: "Next" });
        this.occupation = page.getByRole("combobox", { name: "Occupation *" });
        this.salariedBtn = page.getByText("Salaried", { exact: true });
        this.selfEmployedBtn = page.getByText("Self Employed", { exact: true });
        this.educationalQualification = page.getByRole("combobox", { name: "Educational Qualification *" });
        this.graduateAndAboveBtn = page.getByText("Graduate and above");
        this.twelvePassBtn = page.getByText("12th Pass");
        this.tenPassBtn = page.getByText("10th Pass");
        this.below10thBtn = page.getByText("Below 10th");
        this.tenlacTo15LacBtn = page.getByText("10 Lac to 15 Lac");
        this.income = page.getByText('5 Lac to 7 Lac', { exact: true });
        this.fifteenLacPlusBtn = page.getByText("15 Lac+");
        this.sevenLacToTenLacBtn = page.getByText("7 Lac to 10 Lac");
        this.fiveLacToSevenLacBtn = page.getByText("5 Lac to 7 Lac");
    }

    async lifeTermProfileJourney(_scenario: LifeTermScenario) {
        this.log("Starting Profile Journey");
        await this.check(this.noRadioBtn, "click on No radio button");
        await this.fill(this.pincode, "400002", "fill Pincode");
        await this.fullScreenScreenshot("Pincode Page Screenshot");
        await this.click(this.nextBtn, "click on Next button");
        await this.selectOccupation(_scenario);
        await this.selectEducationalQualification(_scenario);
        await this.selectIncome(_scenario);
        await this.fullScreenScreenshot("Educational Qualification Page Screenshot");
        await this.click(this.nextBtn, "click on Next button");
        await this.fullScreenScreenshot("Income Page Screenshot");
        await this.click(this.nextBtn, "click on Next - Save quote button");
        this.log("Completed Profile Journey");
    }

    private async selectOccupation(scenario: LifeTermScenario) {
        await this.click(this.occupation, "click on Occupation button");
       if(scenario.occupation === "Salaried") {
        await this.click(this.salariedBtn, "click on Salaried button");
       } else {
        await this.click(this.selfEmployedBtn, "click on Self-Employed button");
       }
    }

    private async selectEducationalQualification(scenario: LifeTermScenario) {
        await this.click(this.educationalQualification, "Open Educational Qualification");
        if(scenario.educationalQualification === "Graduate and above") {
            await this.click(this.graduateAndAboveBtn, "click on Graduate and above button");
        }
        else if(scenario.educationalQualification === "12th Pass") {
            await this.click(this.twelvePassBtn, "click on 12th Pass button");
        }else if(scenario.educationalQualification === "10th Pass") {
            await this.click(this.tenPassBtn, "click on 10th Pass button");
        }else if(scenario.educationalQualification === "Below 10th") {
            await this.click(this.below10thBtn, "click on Below 10th button");
        }
    }

    private async selectIncome(scenario: LifeTermScenario) {
        if(scenario.income === "5 Lac to 7 Lac") {
            return;
        }

       await this.click(this.income, "click on Income button");

       if(scenario.income === "15 Lac+") {
        await this.click(this.fifteenLacPlusBtn, "click on 15 Lac+ button");
       }else if(scenario.income === "10 Lac to 15 Lac") {
        await this.click(this.tenlacTo15LacBtn, "click on 10 Lac to 15 Lac button");
       }else if(scenario.income === "7 Lac to 10 Lac") {
        await this.click(this.sevenLacToTenLacBtn, "click on 7 Lac to 10 Lac button");
       }
    }
}
