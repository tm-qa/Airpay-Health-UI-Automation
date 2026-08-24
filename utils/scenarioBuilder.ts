import { InsurerConfig } from "../config/insurers/types";
import { HealthMember, HealthScenario } from "../types/health.types";
import { toJson } from "./excelReader";
import { ageToDob, dobToPickerTitle } from "./dateHelpers";
import { buildNominee, fakeMemberName } from "./fakeData";
import { getMemberUiLabel, resolveMaritalStatus } from "./memberHelpers";

function parseMembers(row: Record<string, unknown>): HealthMember[] {
    const members: HealthMember[] = [];

    for (let i = 1; i <= 11; i++) {
        const relation = String(row[`Member${i}Relation`] ?? "").trim();
        if (!relation) continue;

        const age = Number(row[`Member${i}Age`]);
        const dob = ageToDob(age);
        const relUpper = relation.toUpperCase();
        const childIndex = members.filter((m) => m.relation.toUpperCase() === relUpper).length + 1;

        members.push({
            relation,
            uiRelation: getMemberUiLabel(relation, String(row[`Member${i}Gender`] ?? "")),
            gender: String(row[`Member${i}Gender`] ?? ""),
            age,
            pincode: String(row[`Member${i}Pincode`] ?? ""),
            dob,
            dobPickerTitle: dobToPickerTitle(dob),
            name: fakeMemberName(relUpper, childIndex, String(row[`Member${i}Gender`] ?? "")),
        });
    }

    return members;
}

function buildScenario(row: Record<string, unknown>, config: InsurerConfig): HealthScenario {
    const members = parseMembers(row);

    return {
        tcId: String(row.TC_ID),
        combinations: String(row.Combinations ?? row.Combination ?? ""),
        coverAmount: Number(row.CoverAmount),
        deductible: String(row.Deductible),
        expectedPlan: String(row.ExpectedPlan),
        planVisibility: String(row.PlanVisibility),
        members,
        nominee: buildNominee(config.nominee),
        maritalStatus: resolveMaritalStatus(members),
        heightFeet: config.checkout.heightFeet,
        heightInches: config.checkout.heightInches,
        weight: config.checkout.weight,
        accountHolderName: config.checkout.accountHolderName,
        bankAccountNo: config.checkout.bankAccountNo,
        ifsc: config.checkout.ifsc,
        bankName: config.checkout.bankName,
    };
}

export function getScenarios(config: InsurerConfig): HealthScenario[] {
    return toJson(config.excelPath, config.sheetName).map((row) => buildScenario(row, config));
}
