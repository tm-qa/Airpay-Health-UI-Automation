export interface LifeTermScenario {
    tcId: string;
    combination: string;
    type: string;
    cifNumber: string;
    sumAssured: number;
    sumAssuredLabel: string;
    coverAge: number;
    maturityAge: number;
    policyTerm: number;
    premiumPaymentTerm: number;
    paymentFrequency: string;
    rider1: string;
    rider1Package: string;
    rider1SI: number | undefined;
    rider2: string;
    rider2SI: number | undefined;
    rider3: string;
    rider3SI: number | undefined;
    rider4: string;
    rider4SI: number | undefined;
    expected: string;
    whyNegative: string;
    planName: string;
}
