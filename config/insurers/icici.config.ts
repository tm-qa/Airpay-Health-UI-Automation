import path from "path";
import { InsurerConfig } from "./types";

export const ICICI_CONFIG: InsurerConfig = {
    name: "ICICI Elevate",
    excelPath: path.resolve("data/ICICI _ELEVATE _PLAN.xlsx"),
    sheetName: "Sheet1",
    cifNumber: "001812758",
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
};
