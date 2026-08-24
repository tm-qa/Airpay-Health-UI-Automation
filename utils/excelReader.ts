import * as xlsx from "xlsx";

export function toJson(filePath: string, sheetName: string): Record<string, unknown>[] {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) throw new Error(`Sheet "${sheetName}" not found in ${filePath}`);

    return xlsx.utils.sheet_to_json(sheet, { defval: "" }) as Record<string, unknown>[];
}
