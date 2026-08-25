// ========================================
// services/excelMaterial.js
// ========================================
const ExcelJS = require('exceljs');
const { Op } = require('sequelize');
const AC_IMP_MATERIAL_TRACKING = require('../modules/ac_imp_material_tracking/ac_imp_material_tracking.model');
const sequelize = require('../config/db');

/**
 * Format date theo DD-MON (Oracle style)
 */
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  return `${d.getDate().toString().padStart(2,'0')}-${months[d.getMonth()]}`;
};

/**
 * Get CONT_NO từ VW_PROC_CHG
 */
const getContNo = async (orgId, invoice, sort) => {
  try {
    const [result] = await sequelize.query(
      `SELECT cont_no FROM vw_proc_chg 
       WHERE factory_code = :orgId 
       AND com_invoice = :invoice 
       AND sort = :sort 
       LIMIT 1`,
      {
        replacements: { orgId, invoice, sort },
        type: sequelize.QueryTypes.SELECT
      }
    );
    return result?.cont_no || '';
  } catch (err) {
    return '';
  }
};

/**
 * Get Vendor info từ VW_CONT_IMP
 */
const getVendorInfo = async (orgId, contNo) => {
  try {
    const [result] = await sequelize.query(
      `SELECT REPLACE(seller, ',', ' ') as seller 
       FROM vw_cont_imp 
       WHERE factory_code = :orgId 
       AND cont_no = :contNo 
       LIMIT 1`,
      {
        replacements: { orgId, contNo },
        type: sequelize.QueryTypes.SELECT
      }
    );
    return result?.seller || '';
  } catch (err) {
    return '';
  }
};

/**
 * Get Code Name từ code_master
 */
const getCodeName = async (orgId, codeType, codeValue) => {
  if (!codeValue) return '';
  try {
    const [result] = await sequelize.query(
      `SELECT code_name FROM code_master 
       WHERE factory_code = :orgId 
       AND code_type = :codeType 
       AND code_value = :codeValue 
       LIMIT 1`,
      {
        replacements: { orgId, codeType, codeValue },
        type: sequelize.QueryTypes.SELECT
      }
    );
    return result?.code_name || '';
  } catch (err) {
    return '';
  }
};

/**
 * MAIN FUNCTION: Export Material Tracking to Excel
 * @param {String} filename - Tên file Excel (vd: "material_tracking.xlsx")
 * @param {Object} filters - Điều kiện lọc
 * @returns {String} - Đường dẫn file đã tạo
 */
async function exportExcelMaterial(filename, filters = {}) {
  console.log('📥 Creating Excel:', filename);
  console.log('🔍 Filters:', filters);

  // 1. Create workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Material Tracking');

  // 2. Add headers
  const headers = [
    'ETD', 'RCVD DOCS', 'P\'KGS', 'Container', 'INVOICE #',
    'Ex-Country', 'B/L (Release or Original)', 'ETA-P (HCM)',
    'ETA-A (HCM)', 'IMP-P', 'Date of import', 'Supplier',
    'KIND OF MTRS', 'G.W', 'Unit', 'CBM/Qty', 'Forwarder',
    'Dest. (HCMC)', 'B/L no', 'AMOUNT (USD)', 'Import delay reason'
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFCCCCCC' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  // 3. Build WHERE conditions
  const whereConditions = {};
  
  if (filters.factory_code || filters.orgId) {
    whereConditions.factory_code = filters.factory_code || filters.orgId;
  }
  if (filters.invoice_no) {
    whereConditions.invoice_no = { [Op.iLike]: `${filters.invoice_no}%` };
  }
  if (filters.sort) {
    whereConditions.sort = { [Op.iLike]: `${filters.sort}%` };
  }
  if (filters.startDate || filters.endDate) {
    whereConditions.estimated_delivery_date = {};
    if (filters.startDate) {
      whereConditions.estimated_delivery_date[Op.gte] = filters.startDate;
    }
    if (filters.endDate) {
      whereConditions.estimated_delivery_date[Op.lte] = filters.endDate;
    }
  }
  if (filters.shType) {
    whereConditions.loading_way = { [Op.iLike]: `${filters.shType}%` };
  }
  if (filters.djStartDate || filters.djEndDate) {
    whereConditions.date_completion_procedures = {};
    if (filters.djStartDate) {
      whereConditions.date_completion_procedures[Op.gte] = filters.djStartDate;
    }
    if (filters.djEndDate) {
      whereConditions.date_completion_procedures[Op.lte] = filters.djEndDate;
    }
  }
  if (filters.acStartDate || filters.acEndDate) {
    whereConditions.declaration_retrieve_date = {};
    if (filters.acStartDate) {
      whereConditions.declaration_retrieve_date[Op.gte] = filters.acStartDate;
    }
    if (filters.acEndDate) {
      whereConditions.declaration_retrieve_date[Op.lte] = filters.acEndDate;
    }
  }
  if (filters.isFactDate === 'N') {
    whereConditions.actual_delivery_date = { [Op.is]: null };
  } else if (filters.isFactDate === 'Y') {
    whereConditions.actual_delivery_date = { [Op.not]: null };
  }
  if (filters.status) {
    whereConditions.status = filters.status;
  }

  console.log('🔍 Where conditions:', whereConditions);

  // 4. Query database
  const records = await AC_IMP_MATERIAL_TRACKING.findAll({
    where: whereConditions,
    order: [
      ['departure_date', 'ASC'],
      ['record_date', 'ASC'],
      ['invoice_no', 'ASC']
    ],
    raw: true,
    limit: 5000
  });

  console.log(`📊 Found ${records.length} records`);

  // 5. Populate data rows
  const orgId = filters.factory_code || filters.orgId;

  for (const record of records) {
    // Get related data
    const contNo = await getContNo(orgId, record.invoice_no, record.sort);
    const vendorName = await getVendorInfo(orgId, contNo);
    
    // Get code names
    const shTypeName = await getCodeName(orgId, 'SHIPSPEC', record.loading_way);
    const countryName = await getCodeName(orgId, 'CHGCY', record.exporting_countries);
    const portName = await getCodeName(orgId, 'PORT', record.unloading_port);
    const delayReasonCode = await getCodeName(orgId, 'IMPORTDELAYCODE', record.import_delay_reason);

    // Format B/L
    const blName = record.b_l === '1' ? 'Release' : 
                   record.b_l === '2' ? 'Original' : '';

    // Format delay reason
    const delayReason = record.import_delay_reason 
      ? `${record.import_delay_reason}[${delayReasonCode}]` 
      : '';

    // Add row
    worksheet.addRow([
      formatDate(record.departure_date),              // ETD
      formatDate(record.record_date),                 // RCVD DOCS
      record.qty_of_pieces || 0,                      // P'KGS
      shTypeName,                                     // Container
      record.invoice_no,                              // INVOICE #
      countryName,                                    // Ex-Country
      blName,                                         // B/L
      formatDate(record.estimated_arrival_date),      // ETA-P (HCM)
      formatDate(record.actual_arrival_date),         // ETA-A (HCM)
      formatDate(record.estimated_delivery_date),     // IMP-P
      formatDate(record.actual_delivery_date),        // Date of import
      vendorName,                                     // Supplier
      record.material_description,                    // KIND OF MTRS
      record.gross_weight || 0,                       // G.W
      'KGS',                                          // Unit
      record.container_quantity,                      // CBM/Qty
      record.factory_materials,                       // Forwarder
      portName,                                       // Dest. (HCMC)
      record.bill_of_lading_no,                       // B/L no
      record.invoice_amount || 0,                     // AMOUNT (USD)
      delayReason                                     // Import delay reason
    ]);
  }

  // 6. Auto-fit columns
  worksheet.columns.forEach((column, index) => {
    if (index === 12) { // KIND OF MTRS
      column.width = 40;
    } else if (index === 20) { // Import delay reason
      column.width = 30;
    } else {
      column.width = 15;
    }
  });

  // 7. Freeze header row
  worksheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: 1 }
  ];

  // 8. Write file
  await workbook.xlsx.writeFile(filename);
  
  console.log('✅ Excel file created:', filename);
  return filename;
}

module.exports = {
  exportExcelMaterial
};

// ========================================
// FUNCTION 2: Export Customs Tracking
// ========================================


async function exportExcelCustoms(filename, filters = {}) {
  console.log('📥 Creating Customs Excel:', filename);
  console.log('🔍 Filters:', filters);

  // 1. Create workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Customs Tracking');

  // 2. Add headers (11 columns)
  const headers = [
    'TTR',
    'Import Customs No',
    'Customs Type',
    'Customs Date',
    'Invoice #',
    'Container',
    'Supplier',
    'Import Money',
    'Rate',
    'Desc status',
    'Get Desc status'
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFCCCCCC' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  const whereConditions = {};
  
  if (filters.factory_code || filters.orgId) {
    whereConditions.factory_code = filters.factory_code || filters.orgId;
  }
  if (filters.invoice_no) {
    whereConditions.invoice_no = { [Op.iLike]: `${filters.invoice_no}%` };
  }
  if (filters.sort) {
    whereConditions.sort = { [Op.iLike]: `${filters.sort}%` };
  }
  if (filters.start_date || filters.end_date) {
    whereConditions.estimated_delivery_date = {};
    if (filters.start_date) {
      whereConditions.estimated_delivery_date[Op.gte] = filters.start_date;
    }
    if (filters.end_date) {
      whereConditions.estimated_delivery_date[Op.lte] = filters.end_date;
    }
  }
  if (filters.shType) {
    whereConditions.loading_way = { [Op.iLike]: `${filters.shType}%` };
  }
  if (filters.djStartDate || filters.djEndDate) {
    whereConditions.date_completion_procedures = {};
    if (filters.djStartDate) {
      whereConditions.date_completion_procedures[Op.gte] = filters.djStartDate;
    }
    if (filters.djEndDate) {
      whereConditions.date_completion_procedures[Op.lte] = filters.djEndDate;
    }
  }
  if (filters.acStartDate || filters.acEndDate) {
    whereConditions.declaration_retrieve_date = {};
    if (filters.acStartDate) {
      whereConditions.declaration_retrieve_date[Op.gte] = filters.acStartDate;
    }
    if (filters.acEndDate) {
      whereConditions.declaration_retrieve_date[Op.lte] = filters.acEndDate;
    }
  }
  if (filters.isFactDate === 'N') {
    whereConditions.actual_delivery_date = { [Op.is]: null };
  } else if (filters.isFactDate === 'Y') {
    whereConditions.actual_delivery_date = { [Op.not]: null };
  }
  if (filters.status) {
    whereConditions.status = filters.status;
  }

  console.log('🔍 Where conditions:', whereConditions);

  // 4. Query database
  const records = await AC_IMP_MATERIAL_TRACKING.findAll({
    where: whereConditions,
    order: [
      ['departure_date', 'ASC'],
      ['record_date', 'ASC'],
      ['invoice_no', 'ASC']
    ],
    raw: true,
    limit: 5000
  });

  console.log(`📊 Found ${records.length} records`);

  // 5. Helper: Format date YYYY/MM/DD (khác với format DD-MON ở trên)
  const formatDateYMD = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  // 6. Helper: Get customs info từ VW_PROC_CHG
  const getCustomsInfo = async (orgId, invoice, sort) => {
    try {
      const [result] = await sequelize.query(
        `SELECT ac_chgs, 
                TO_CHAR(ac_date, 'YYYY/MM/DD') as ac_date,
                ac_type
         FROM vw_proc_chg 
         WHERE factory_code = :orgId 
         AND com_invoice = :invoice 
         AND sort = :sort 
         LIMIT 1`,
        {
          replacements: { orgId, invoice, sort },
          type: sequelize.QueryTypes.SELECT
        }
      );
      return {
        ac_chgs: result?.ac_chgs || '',
        ac_date: result?.ac_date || '',
        ac_type: result?.ac_type || ''
      };
    } catch (err) {
      return { ac_chgs: '', ac_date: '', ac_type: '' };
    }
  };

  // 7. Populate data rows
  const orgId = filters.factory_code || filters.orgId;
  let rowNumber = 0; // TTR counter (T trong Oracle code)

  for (const record of records) {
    rowNumber++; // T := T + 1

    // Get customs info
    const customsInfo = await getCustomsInfo(orgId, record.invoice_no, record.sort);
    
    // Get container info
    const contNo = await getContNo(orgId, record.invoice_no, record.sort);
    const vendorName = await getVendorInfo(orgId, contNo);
    
    // Get code names
    const shTypeName = await getCodeName(orgId, 'SHIPSPEC', record.loading_way);
    const acTypeName = await getCodeName(orgId, 'ACTYPE', customsInfo.ac_type);

    // Format status: DECODE(STATUS,1,'Not Yet',7,'RCVD')
    const statusName = record.status === 1 ? 'Not Yet' : 
                       record.status === 7 ? 'RCVD' : '';

    // Format date for Get Desc status (REC_ACDATE)
    const recAcDate = formatDateYMD(record.declaration_retrieve_date);

    // Add row (11 columns)
    worksheet.addRow([
      rowNumber,                              // TTR (số thứ tự)
      customsInfo.ac_chgs,                    // Import Customs No
      acTypeName,                             // Customs Type
      customsInfo.ac_date,                    // Customs Date
      record.invoice_no,                      // Invoice #
      shTypeName,                             // Container
      vendorName,                             // Supplier
      record.invoice_amount || 0,             // Import Money
      record.exchange_rate || 1,              // Rate
      statusName,                             // Desc status
      recAcDate                               // Get Desc status
    ]);
  }

  // 8. Auto-fit columns
  worksheet.columns.forEach((column, index) => {
    if (index === 0) { // TTR
      column.width = 8;
    } else if (index === 6) { // Supplier
      column.width = 30;
    } else {
      column.width = 15;
    }
  });

  // 9. Freeze header row
  worksheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: 1 }
  ];

  // 10. Write file
  await workbook.xlsx.writeFile(filename);
  
  console.log('✅ Customs Excel file created:', filename);
  return filename;
}

module.exports = {
  exportExcelMaterial,
  exportExcelCustoms
};

