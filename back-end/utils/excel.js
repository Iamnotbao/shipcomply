const ExcelJS = require("exceljs");


async function generateExcel(data, sheetName = "Sheet1", columnDefinitions = null) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);
  let columns;
  if (columnDefinitions) {
    columns = columnDefinitions;
  } else if (data && data.length > 0) {
    columns = Object.keys(data[0]).map((key) => ({
      header: key.toUpperCase(),
      key: key,
      width: 40,
    }));
  } else {
    columns = [{ header: 'NO DATA AVAILABLE', key: 'message', width: 50 }];
  }
  worksheet.columns = columns;
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F81BD" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });
  if (data && data.length > 0) {
    data.forEach((row) => worksheet.addRow(row));
  }

  return workbook;
}
async function importExcel(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = workbook.worksheets[0];

  const headers = worksheet.getRow(1).values.slice(1);

  const rows = [];
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const rowData = {};
    headers.forEach((h, i) => {
      rowData[h.toLowerCase()] = row.values[i + 1];
    });
    rows.push(rowData);
  });
  return rows;
}
async function generateExcelWithSub(data, sheetName = "Sheet1", columnDefinitions = null) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  let columns;
  if (columnDefinitions) {
    columns = columnDefinitions;
  } else if (data && data.length > 0) {
    columns = Object.keys(data[0])
      .filter((key) => key !== "is_sub") // ẩn cột is_sub
      .map((key) => ({ header: key.toUpperCase(), key, width: 40 }));
  } else {
    columns = [{ header: "NO DATA AVAILABLE", key: "message", width: 50 }];
  }
  worksheet.columns = columns;

  // Header row style
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F81BD" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
  });

  if (data && data.length > 0) {
    data.forEach((rowData) => {
      const excelRow = worksheet.addRow(rowData);
      if (rowData.is_sub) {
        // Sub row: màu xám, chữ nghiêng, indent
        excelRow.eachCell((cell) => {
          cell.font = { italic: true, color: { argb: "FF666666" } };
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF2F2F2" } };
        });
        excelRow.getCell("item_no").alignment = { indent: 2 };
      } else {
        // Main row: bold
        excelRow.eachCell((cell) => {
          cell.font = { bold: true };
        });
      }
    });
  }

  return workbook;
}
module.exports = { generateExcel, importExcel,generateExcelWithSub };
