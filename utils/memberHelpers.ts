import { HealthMember } from "../types/health.types";

const RELATION_MAP: Record<string, string> = {
    SELF: "Self",
    SPOUSE: "Spouse",
    MOTHER: "Mother",
    FATHER: "Father",
    SON: "Son",
    DAUGHTER: "Daughter",
};

export function getProfileDropdownLabels(member: HealthMember): string[] {
    const rel = member.relation.toUpperCase();
    if (rel === "SPOUSE") return [member.uiRelation, "Spouse"];
    return [member.uiRelation];
}

export function getUniqueMemberTypes(members: HealthMember[]): HealthMember[] {
    const seen = new Set<string>();
    return members.filter((m) => {
        const rel = m.relation.toUpperCase();
        if (seen.has(rel)) return false;
        seen.add(rel);
        return true;
    });
}

export function countByRelation(members: HealthMember[], relation: string): number {
    return members.filter((m) => m.relation.toUpperCase() === relation.toUpperCase()).length;
}

export function getMemberUiLabel(relation: string, gender: string): string {
    const rel = relation.toUpperCase();
    const gen = gender.toUpperCase();

    if (rel === "SPOUSE") {
        return gen === "F" ? "Wife" : "Husband";
    }

    return RELATION_MAP[rel] ?? relation;
}

export function getMemberDisplayLabel(member: HealthMember, index: number, members: HealthMember[]): string {
    const rel = member.relation.toUpperCase();
    const sameBefore = members.slice(0, index).filter((m) => m.relation.toUpperCase() === rel).length;

    if (rel === "SON" || rel === "DAUGHTER") {
        return `${member.uiRelation} ${sameBefore + 1}`;
    }

    return member.uiRelation;
}

export function getMemberTitleOptions(member: HealthMember): string[] {
    const rel = member.relation.toUpperCase();

    if (rel === "SON") return ["Master", "Mr"];
    if (rel === "DAUGHTER") return ["Miss", "Ms"];
    if (member.gender.toUpperCase() === "F") return ["Mrs", "Ms"];

    return ["Mr"];
}

export function getMemberTitle(member: HealthMember): string {
    return getMemberTitleOptions(member)[0];
}

export function getProposerGender(members: HealthMember[]): "M" | "F" {
    const self = members.find((m) => m.relation.toUpperCase() === "SELF");
    if (self) return self.gender.toUpperCase() === "F" ? "F" : "M";

    const spouse = members.find((m) => m.relation.toUpperCase() === "SPOUSE");
    if (spouse) return spouse.gender.toUpperCase() === "F" ? "M" : "F";

    return "M";
}

export function getMemberMaritalStatus(member: HealthMember, members: HealthMember[]): string {
    const rel = member.relation.toUpperCase();

    if (rel === "SON" || rel === "DAUGHTER") {
        return "Single";
    }

    if (rel === "SELF") {
        const hasFamily = members.some((m) =>
            ["SPOUSE", "SON", "DAUGHTER"].includes(m.relation.toUpperCase())
        );
        return hasFamily ? "Married" : "Single";
    }

    return "Married";
}

export function resolveMaritalStatus(members: HealthMember[]): string {
    const self = members.find((m) => m.relation.toUpperCase() === "SELF");
    if (self) return getMemberMaritalStatus(self, members);

    return "Married";
}
