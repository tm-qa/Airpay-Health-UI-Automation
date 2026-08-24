export interface HealthMember {
    relation: string;
    uiRelation: string;
    gender: string;
    age: number;
    pincode: string;
    dob: string;
    dobPickerTitle: string;
    name?: string;
}

export interface NomineeDetails {
    name: string;
    relation: string;
    dob: string;
    dobPickerTitle: string;
    mobile: string;
    email: string;
}

export interface HealthScenario {
    tcId: string;
    combinations: string;
    coverAmount: number;
    deductible: string;
    expectedPlan: string;
    planVisibility: string;
    members: HealthMember[];
    nominee: NomineeDetails;
    maritalStatus: string;
    heightFeet: string;
    heightInches: string;
    weight: string;
    accountHolderName: string;
    bankAccountNo: string;
    ifsc: string;
    bankName: string;
}
