import { NomineeDefaults } from "../config/insurers/types";
import { NomineeDetails } from "../types/health.types";
import { ageToDob, dobToPickerTitle } from "./dateHelpers";

const SON_NAMES = ["Rahul Amar Kumar", "Arjun Vikas Sharma", "Vikram Raj Patel", "Amit Sunil Desai"];
const DAUGHTER_NAMES = ["Priya Anjali Kumar", "Anita Meera Sharma", "Sneha Rani Patel", "Kavya Nisha Desai"];
const SPOUSE_FEMALE_NAMES = ["Priya Anjali Sharma", "Anita Meera Kumar"];
const SPOUSE_MALE_NAMES = ["Rahul Amar Sharma", "Vikram Raj Kumar"];
const FATHER_NAMES = ["Ramesh Kumar Patel", "Suresh Amar Singh"];
const MOTHER_NAMES = ["Sushila Devi Patel", "Kamla Devi Singh"];

/** Fake member name when sheet has no Name column */
export function fakeMemberName(relation: string, index = 1, gender = ""): string | undefined {
    const rel = relation.toUpperCase();
    const gen = gender.toUpperCase();
    if (rel === "SELF") return undefined;
    if (rel === "SON") return fakeChildName("SON", index);
    if (rel === "DAUGHTER") return fakeChildName("DAUGHTER", index);
    if (rel === "SPOUSE") {
        const names = gen === "F" ? SPOUSE_FEMALE_NAMES : SPOUSE_MALE_NAMES;
        return names[(index - 1) % names.length];
    }
    if (rel === "FATHER") return FATHER_NAMES[(index - 1) % FATHER_NAMES.length];
    if (rel === "MOTHER") return MOTHER_NAMES[(index - 1) % MOTHER_NAMES.length];
    return undefined;
}

/** Fake child name when sheet has no Name column */
export function fakeChildName(relation: string, index: number): string {
    const names = relation.toUpperCase() === "SON" ? SON_NAMES : DAUGHTER_NAMES;
    return names[(index - 1) % names.length];
}

/** Build nominee from insurer defaults (sheet has no nominee columns) */
export function buildNominee(defaults: NomineeDefaults): NomineeDetails {
    const dob = ageToDob(defaults.age);
    return {
        name: defaults.name,
        relation: defaults.relation,
        dob,
        dobPickerTitle: dobToPickerTitle(dob),
        mobile: defaults.mobile,
        email: defaults.email,
    };
}
