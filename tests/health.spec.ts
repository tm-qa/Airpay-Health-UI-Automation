import { test } from "playwright/types/test";
import { HEALTH_INSURERS } from "../config/insurers";
import { registerHealthInsurerTests } from "../utils/healthTestFactory";


test.describe("@Health Health Tests", () => {

for (const insurer of HEALTH_INSURERS) {
    registerHealthInsurerTests(insurer);
}
});
