import { Parser } from 'json2csv';
// import ExcelJS from 'exceljs';

/**
 * Convert data to CSV format
 * @param data Array of objects to convert
 * @param fields Optional list of fields to include
 */
export function exportToCSV(data: any[], fields?: string[]): string {
    try {
        const opts = fields ? { fields } : {};
        const parser = new Parser(opts);
        return parser.parse(data);
    } catch (error) {
        console.error('Error generating CSV:', error);
        throw new Error('Failed to generate CSV');
    }
}

/**
 * Generate Excel workbook from data
 * @param sheetsData Object mapping sheet names to data arrays
 * @returns Buffer containing the Excel file
 */
export async function exportToExcel(
    sheetsData: { [sheetName: string]: any[] }
): Promise<Buffer> {
    const ExcelJS = (await import('exceljs')).default;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Behind The Build';
    workbook.created = new Date();

    for (const [sheetName, data] of Object.entries(sheetsData)) {
        if (!data || data.length === 0) continue;

        const sheet = workbook.addWorksheet(sheetName);

        // Get headers from first object
        const headers = Object.keys(data[0]);

        // Set columns
        sheet.columns = headers.map(header => ({
            header: header.charAt(0).toUpperCase() + header.slice(1),
            key: header,
            width: 20
        }));

        // Add rows
        sheet.addRows(data);

        // Style header row
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
    }

    // Write to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as unknown as Buffer;
}
