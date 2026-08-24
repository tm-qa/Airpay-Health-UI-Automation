import path from "path";
import { InsurerConfig } from "./types";

export const HDFC_CONFIG: InsurerConfig = {
    name: "HDFC Optima Secure",
    excelPath: path.resolve("data/HDFC_Optim_Secure.xlsx"),
    sheetName: "TC",
    kyc: {
        pan: "BKGPC8713D",
        dob: "24/12/1997",
    },
    checkout: {
        heightFeet: "5",
        heightInches: "3",
        weight: "60",
        accountHolderName: "KRUNAL RAMESH PATIL",
        bankAccountNo: "123456789012",
        ifsc: "HDFC0001234",
        bankName: "HDFC",
    },
    nominee: {
        name: "Rahul Amar Rane",
        relation: "Brother",
        mobile: "9876543210",
        email: "rahul.rane@example.com",
        age: 25,
    },
    pdfWordingPattern: "hdfc_optima_secure.pdf",
    pdfBrochurePattern: "hdfc_optima_secure_brochure.pdf",
};
