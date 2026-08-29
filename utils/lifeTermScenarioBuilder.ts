import path from "path";
import { toJson } from "./excelReader";
import { LifeTermScenario } from "../types/lifeTerm.types";

const LIFE_EXCEL = path.resolve("data/LifeICICISmartPlusTestData.xlsx");
const LIFE_SHEET = "Test Scenarios";

function sumAssuredLabel(amount: number): string {
    if (amount >= 10_000_000) {
        const cr = amount / 10_000_000;
        return `₹ ${Number.isInteger(cr) ? cr : cr.toFixed(2)} Cr`;
    }
    return `₹ ${amount / 100_000} L`;
}

function text(value: unknown): string {
    return value === "" || value == null ? "" : String(value).trim();
}

function optionalNumber(value: unknown): number | undefined {
    if (value === "" || value == null) return undefined;
    const n = Number(value);
    return Number.isNaN(n) ? undefined : n;
}

export function getLifeTermScenarios(): LifeTermScenario[] {
    return toJson(LIFE_EXCEL, LIFE_SHEET)
        .filter((row) => String(row.Execute).toUpperCase() === "Y")
        .map((row) => ({
            tcId: String(row.TC_ID),
            combination: text(row.Combination),
            type: text(row.Type),
            cifNumber: text(row.CIF) || "12345",
            sumAssured: Number(row.SumAssured),
            sumAssuredLabel: sumAssuredLabel(Number(row.SumAssured)),
            coverAge: Number(row.CoverAge),
            maturityAge: Number(row.MaturityAge),
            policyTerm: Number(row.PolicyTerm),
            premiumPaymentTerm: Number(row.PremiumPaymentTerm),
            planName: text(row.PlanName),
            paymentFrequency: text(row.PaymentFrequency),
            rider1: text(row.Rider1),
            rider1Package: text(row.Rider1Package),
            rider1SI: optionalNumber(row.Rider1SI),
            rider2: text(row.Rider2),
            rider2SI: optionalNumber(row.Rider2SI),
            rider3: text(row.Rider3),
            rider3SI: optionalNumber(row.Rider3SI),
            rider4: text(row.Rider4),
            rider4SI: optionalNumber(row.Rider4SI),
            expected: text(row.Expected),
            whyNegative: text(row.WhyNegative),
        }));
}
