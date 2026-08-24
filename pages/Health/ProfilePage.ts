import { Page, Locator, expect } from "@playwright/test";
import { HealthMember, HealthScenario } from "../../types/health.types";
import { fillAntDateField } from "../../utils/antDatePicker";
import { selectAntOption } from "../../utils/antSelect";
import {
    countByRelation,
    getMemberDisplayLabel,
    getProfileDropdownLabels,
    getProposerGender,
    getUniqueMemberTypes,
} from "../../utils/memberHelpers";

export class ProfilePage {
    readonly page: Page;
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
        this.page = page;
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
        // Wait for the gender radio to be rendered (profile API may take time to load form)
        await this.maleRadio.waitFor({ state: "visible", timeout: 45000 });

        await this.selectProposerGender(scenario);
        await this.selectMembers(scenario);
        await this.fillVisiblePincode(scenario.members[0]?.pincode);
        await this.selectDeductible(scenario);

        await this.diseaseBtn.click();
        await this.goNext(scenario);

        // HDFC shows Age vs DOB radio; ICICI goes straight to DOB fields
        if (await this.dobRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
            await this.dobRadio.click();
        }
        await this.fillMembersDob(scenario);
        await this.goNext(scenario);

        await this.noRadioBtn.click();
        await this.goNext(scenario);
        await this.goNext(scenario);
        await this.goNext(scenario);

        // Some member combinations have an extra step (e.g. "Save your quotes")
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
        await this.nextBtn.click();
    }

    private async fillVisiblePincode(pincode?: string) {
        if (!pincode) return;
        if (await this.parentsPincode.isVisible()) await this.parentsPincode.fill(pincode);
        if (await this.pincode.isVisible()) await this.pincode.fill(pincode);
    }

    private async selectProposerGender(scenario: HealthScenario) {
        const gender = getProposerGender(scenario.members);
        await (gender === "F" ? this.femaleRadio : this.maleRadio).check({ force: true });
    }

    private async clearSelectedMembers() {
        await this.insuredCombo.click();
        const clearAll = this.page.locator(".ant-select-clear");
        if (await clearAll.isVisible()) {
            await clearAll.click();
            return;
        }
        const removeBtns = this.page.locator(".ant-select-selection-item-remove");
        while ((await removeBtns.count()) > 0) await removeBtns.first().click();
    }

    private async pickDropdownOption(labels: string[]) {
        for (const label of labels) {
            for (let attempt = 0; attempt < 3; attempt++) {
                await this.page.keyboard.press("Escape");
                await this.insuredCombo.click();

                const option = this.page
                    .locator(".ant-select-dropdown:visible")
                    .getByText(label, { exact: true })
                    .first();

                if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
                    await option.click({ force: true });
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
            if (await combo.isVisible()) await selectAntOption(this.page, combo, String(sonCount));
        }
        if (daughterCount > 0) {
            const combo = this.page.getByRole("combobox", { name: /Number of daughters/i });
            if (await combo.isVisible()) await selectAntOption(this.page, combo, String(daughterCount));
        }

        const tags = await this.page.locator(".ant-select-selection-item-content").allTextContents();
        console.log(
            `${scenario.tcId} selected: [${tags.join(", ")}] sons=${sonCount} daughters=${daughterCount}`
        );
        expect(tags.length, `${scenario.tcId}: member tags`).toBe(uniqueTypes.length);
    }

    private async selectDeductible(scenario: HealthScenario) {
        const deductible = this.page.getByText(scenario.deductible, { exact: true }).first();
        if (await deductible.isVisible()) await deductible.click();
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
                    break;
                }
            }
        }
    }
}
