import * as XLSX from 'xlsx';
export default function exportToExcel(records: any[],
   fileName: string = 'Records.xlsx',
   sheetName: string = 'Sheet1',
  includeColumns?: string[]): void {
  // 2. Convert records to an Excel sheet
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(records, { header: includeColumns });

  // 3. Create a new Workbook and add the worksheet
  const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // 4. Generate the Excel file and trigger download
  XLSX.writeFile(workbook, fileName);
}
