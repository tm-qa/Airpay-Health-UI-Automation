import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "../BasePage";
import { HealthScenario } from "../../types/health.types";
import { fillAntDateField } from "../../utils/antDatePicker";
import { selectAntOption } from "../../utils/antSelect";
import {
    countByRelation,
    getMemberDisplayLabel,
    getProfileDropdownLabels,
    getProposerGender,
    getUniqueMemberTypes,
} from "../../utils/memberHelpers";

export class ProfilePage extends BasePage {
    readonly insuredCombo: Locator;
    readonly diseaseBtn: Locator;
    readonly nextBtn: Locator;
    readonly dobRadio: Locator;
    readonly noRadioBtn: Locator;
    readonly maleRadio: Locator;
    readonly femaleRadio: Locator;
    readonly parentsPincode: Locator;
    readonly pincode: Locator;

    constructor(page: Page) {
        super(page);
        this.insuredCombo = page.getByRole("combobox", { name: /Who would you like to get insured/i });
        this.diseaseBtn = page.locator("div").filter({ hasText: "Tell us about the insuredWhat" }).nth(2);
        this.nextBtn = page.getByRole("button", { name: "Next", exact: true });
        this.dobRadio = page.getByRole("radio", { name: "Date of birth" });
        this.noRadioBtn = page.getByRole("radio", { name: "No" });
        this.maleRadio = page.getByRole("radio", { name: "Male", exact: true });
        this.femaleRadio = page.getByRole("radio", { name: "Female", exact: true });
        this.parentsPincode = page.locator("#parentsPincode");
        this.pincode = page.locator("#yourPincode");
    }

    async healthProfileJourney(scenario: HealthScenario) {
        await expect(this.page).toHaveURL(/.*\/profile/);
        await this.maleRadio.waitFor({ state: "visible", timeout: 45000 });

        await this.selectProposerGender(scenario);
        await this.selectMembers(scenario);
        await this.fillVisiblePincode(scenario.members[0]?.pincode);
        await this.selectDeductible(scenario);
        await this.fullScreenScreenshot("Pincode");

        await this.click(this.diseaseBtn, "click on Disease / medical details");
        await this.goNext(scenario);

        if (await this.dobRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
            await this.click(this.dobRadio, "click on Date of birth radio button");
        }
        await this.fillMembersDob(scenario);
        await this.fullScreenScreenshot("Date of birth");
        await this.goNext(scenario);

        await this.click(this.noRadioBtn, "click on No radio button");
        await this.fullScreenScreenshot("Medical questions");
        await this.goNext(scenario);
        await this.goNext(scenario);
        await this.goNext(scenario);

        try {
            await this.page.waitForURL(/\/results?/, { timeout: 15000 });
        } catch {
            if (this.page.url().includes("/profile")) {
                const visible = await this.nextBtn.isVisible({ timeout: 3000 }).catch(() => false);
                if (visible) await this.goNext(scenario);
            }
            await expect(this.page).toHaveURL(/\/results?/, { timeout: 60000 });
        }
    }

    private async goNext(scenario: HealthScenario) {
        await this.fillVisiblePincode(scenario.members[0]?.pincode);
        await this.page.locator(".loader_loaderContainer__rDdBU").waitFor({ state: "hidden", timeout: 15000 }).catch(() => {});
        await this.click(this.nextBtn, "click on Next button");
    }

    private async fillVisiblePincode(pincode?: string) {
        if (!pincode) return;
        if (await this.parentsPincode.isVisible()) await this.fill(this.parentsPincode, pincode, "fill Parents Pincode");
        if (await this.pincode.isVisible()) await this.fill(this.pincode, pincode, "fill Pincode");
    }

    private async selectProposerGender(scenario: HealthScenario) {
        const gender = getProposerGender(scenario.members);
        if (gender === "F") {
            await this.check(this.femaleRadio, "click on Female radio button", { force: true });
        } else {
            await this.check(this.maleRadio, "click on Male radio button", { force: true });
        }
    }

    private async clearSelectedMembers() {
        await this.click(this.insuredCombo, "click on Who would you like to get insured dropdown");
        const clearAll = this.page.locator(".ant-select-clear");
        if (await clearAll.isVisible()) {
            await this.click(clearAll, "click on Clear all members");
            return;
        }
        const removeBtns = this.page.locator(".ant-select-selection-item-remove");
        while ((await removeBtns.count()) > 0) {
            await this.click(removeBtns.first(), "click on Remove selected member");
        }
    }

    private async pickDropdownOption(labels: string[]) {
        for (const label of labels) {
            for (let attempt = 0; attempt < 3; attempt++) {
                await this.page.keyboard.press("Escape");
                await this.click(this.insuredCombo, "click on Who would you like to get insured dropdown");

                const option = this.page
                    .locator(".ant-select-dropdown:visible")
                    .getByText(label, { exact: true })
                    .first();

                if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
                    await option.evaluate((el) => (el as HTMLElement).click());
                    await this.log(`click on ${label} option`);
                    return label;
                }
            }
        }
        return null;
    }

    private async selectMembers(scenario: HealthScenario) {
        await this.clearSelectedMembers();

        const uniqueTypes = getUniqueMemberTypes(scenario.members);
        const selected: string[] = [];

        for (const member of uniqueTypes) {
            const labels = getProfileDropdownLabels(member);
            const picked = await this.pickDropdownOption(labels);
            if (!picked) {
                throw new Error(`${scenario.tcId}: could not select "${labels.join('" or "')}"`);
            }
            selected.push(picked);
        }

        await this.page.keyboard.press("Escape");

        const sonCount = countByRelation(scenario.members, "SON");
        const daughterCount = countByRelation(scenario.members, "DAUGHTER");

        if (sonCount > 0) {
            const combo = this.page.getByRole("combobox", { name: /Number of sons/i });
            if (await combo.isVisible()) {
                await selectAntOption(this.page, combo, String(sonCount));
                await this.log(`select Number of sons: ${sonCount}`);
            }
        }
        if (daughterCount > 0) {
            const combo = this.page.getByRole("combobox", { name: /Number of daughters/i });
            if (await combo.isVisible()) {
                await selectAntOption(this.page, combo, String(daughterCount));
                await this.log(`select Number of daughters: ${daughterCount}`);
            }
        }

        const tags = await this.page.locator(".ant-select-selection-item-content").allTextContents();
        await this.log(
            `${scenario.tcId} selected members: [${tags.join(", ")}] sons=${sonCount} daughters=${daughterCount}`
        );
        expect(tags.length, `${scenario.tcId}: member tags`).toBe(uniqueTypes.length);
    }

    private async selectDeductible(scenario: HealthScenario) {
        const deductible = this.page.getByText(scenario.deductible, { exact: true }).first();
        if (await deductible.isVisible()) {
            await this.click(deductible, `click on Deductible ${scenario.deductible}`);
        }
    }

    private async fillMembersDob(scenario: HealthScenario) {
        for (let i = 0; i < scenario.members.length; i++) {
            const member = scenario.members[i];
            const rel = member.relation.toUpperCase();
            const sameType = countByRelation(scenario.members, rel);
            const labels =
                sameType > 1 && (rel === "SON" || rel === "DAUGHTER")
                    ? [getMemberDisplayLabel(member, i, scenario.members), member.uiRelation]
                    : [member.uiRelation, getMemberDisplayLabel(member, i, scenario.members)];

            for (const label of labels) {
                const dobField = this.page.getByRole("textbox", { name: new RegExp(`^${label}`, "i") });
                if (await dobField.first().isVisible()) {
                    await fillAntDateField(this.page, dobField.first(), member.dob);
                    await this.log(`fill Date of birth for ${label}: ${member.dob}`);
                    break;
                }
            }
        }
    }
}
