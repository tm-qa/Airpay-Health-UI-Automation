/** Convert Excel CoverAmount (500000) to UI dropdown labels */
export function coverAmountToLabels(amount: number): string[] {
    const lakhs = amount / 100_000;
    const n = Number.isInteger(lakhs) ? String(lakhs) : String(lakhs);
    return [`${n} lakhs`, `${n} lacs`, `${n} Lakh`, `${n} lakh`, `${n} Lakhs`];
}

export function coverAmountPattern(amount: number): RegExp {
    const lakhs = amount / 100_000;
    return new RegExp(`${lakhs}\\s*lakh?s?`, "i");
}

export function coverOptionRegex(amount: number): RegExp {
    const lakhs = amount / 100_000;
    return new RegExp(`^${lakhs}\\s+lakhs?$`, "i");
}


export function coverHeadingRegex(amount: number): RegExp {
    const lakhs = amount / 100_000;
    return new RegExp(`₹\\s*${lakhs}\\s*lakhs?`, "i");
}
