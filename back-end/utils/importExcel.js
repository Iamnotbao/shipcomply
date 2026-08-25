const XLSX = require("xlsx");
function readExcel(fileBuffer, headers = null, sheetIndex = 0) {
  const workbook  = XLSX.read(fileBuffer, { type: "buffer",cellDates: true });
  const sheetName = workbook.SheetNames[sheetIndex];

  if (!sheetName) throw new Error(`Sheet index ${sheetIndex} not found`);

  const sheet = workbook.Sheets[sheetName];

  // Không có header → trả array of arrays
  if (!headers) {
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
    if (!rows || rows.length === 0) throw new Error("File is empty");
    return rows;
  }

  // Có header → map từng row thành object theo tên field
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
  if (!rawRows || rawRows.length === 0) throw new Error("File is empty");

  return rawRows
    .filter((row) => row && !row.every((cell) => cell === null || cell === ""))
    .map((row) => {
      const obj = {};
      headers.forEach((key, index) => {
        obj[key] = row[index] ?? null;
      });
      return obj;
    });
}

module.exports = { readExcel };