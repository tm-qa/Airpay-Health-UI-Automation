import { HEALTH_INSURERS } from "../config/insurers";
import { registerHealthInsurerTests } from "../utils/healthTestFactory";



for (const insurer of HEALTH_INSURERS) {
    registerHealthInsurerTests(insurer);
}

