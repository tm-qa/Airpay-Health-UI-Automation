export interface KycData {
    pan: string;
    dob: string;
}

export interface CheckoutDefaults {
    heightFeet: string;
    heightInches: string;
    weight: string;
    accountHolderName: string;
    bankAccountNo: string;
    ifsc: string;
    bankName: string;
}

export interface NomineeDefaults {
    name: string;
    relation: string;
    mobile: string;
    email: string;
    age: number;
}

export interface InsurerConfig {
    name: string;
    excelPath: string;
    sheetName: string;
    cifNumber?: string;
    kyc: KycData;
    checkout: CheckoutDefaults;
    nominee: NomineeDefaults;
    pdfWordingPattern?: string;
    pdfBrochurePattern?: string;
}
