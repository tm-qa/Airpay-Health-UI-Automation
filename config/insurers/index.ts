import { HDFC_CONFIG } from "./hdfc.config";
import { ICICI_CONFIG } from "./icici.config";
import { InsurerConfig } from "./types";

/** Add new insurer config here — tests auto-register from this list */
export const HEALTH_INSURERS: InsurerConfig[] = [HDFC_CONFIG, ICICI_CONFIG];

export { HDFC_CONFIG } from "./hdfc.config";
export { ICICI_CONFIG } from "./icici.config";
export type { InsurerConfig, KycData, CheckoutDefaults, NomineeDefaults } from "./types";
