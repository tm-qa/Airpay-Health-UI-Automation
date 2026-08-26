import { HDFC_CONFIG } from "./hdfc.config";
import { ICICI_CONFIG } from "./icici.config";
import { InsurerConfig } from "./types";


// export const HEALTH_INSURERS: InsurerConfig[] = [HDFC_CONFIG, ICICI_CONFIG];
export const HEALTH_INSURERS: InsurerConfig[] = [HDFC_CONFIG,];


export { HDFC_CONFIG } from "./hdfc.config";
export { ICICI_CONFIG } from "./icici.config";
export type { InsurerConfig, KycData, CheckoutDefaults, NomineeDefaults } from "./types";
