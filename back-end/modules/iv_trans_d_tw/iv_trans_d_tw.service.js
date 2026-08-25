const {
  exportExcelCustoms,
  exportExcelMaterial,
} = require("../../utils/excelMultiple");
const { generatePDF } = require("../../utils/pdf");
const ivTransDTwRepository = require("./iv_trans_d_tw.repository");

async function getAllIvTransDTw(order_no, order_seq, limit, offset) {
  return await ivTransDTwRepository.listAllITDT(
    order_no,
    order_seq,
    limit,
    offset,
  );
}
async function getIvTransDTwById(factory_code, trans_no, trans_seq) {
  return await ivTransDTwRepository.getByID(factory_code, trans_no, trans_seq);
}
async function addIvTransDTw(acIR, t) {
  try {
    const existIR = await getIvTransDTwById(
      acIR.factory_code,
      acIR.trans_no,
      acIR.trans_seq,
    );
    if (existIR) {
      const message =
        "ac item ref is already exist and invoice cannot be duplicate or the same !";
      return { message };
    }
    const result = await ivTransDTwRepository.add(acIR, t);
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("error from IRort material trackin service: ", error);
  }
}
async function editvTransDTw(factory_code, trans_no, trans_seq, ivTDT, t) {
  try {
    const existITDT = await getIvTransDTwById(
      factory_code,
      trans_no,
      trans_seq,
      ivTDT,
    );
    if (!existITDT) {
      console.log("ac item ref is not exist !");
      return null;
    }
    const result = await ivTransDTwRepository.edit(existITDT, ivTDT, t);
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("cannot edit from ac item ref service", error);
  }
}
async function checkBoxR(order_no, order_seq, all_checked_items, session_id) {
  return await ivTransDTwRepository.checkBoxRight(
    order_no,
    order_seq,
    all_checked_items,
    session_id,
  );
}
async function deleteIvTDT(factory_code, item_acno, item_no, t) {
  try {
    const existITDT = await getIvTransDTwById(factory_code, item_acno, item_no);
    if (!existIR) {
      console.log("ac item ref is not exist !");
      return null;
    }
    const result = await ivTransDTwRepository.deleteITDT(existITDT, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchIvTDT(
  keyword,
  factory_code,
  department_code,
  user_code,
  query_level,
) {
  try {
    const acIRFound = await ivTransDTwRepository.search(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    return acIRFound;
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFAcIR(filename) {
  const data = await getAllAcIR();
  const plainFactory = data.map((d) => d.get({ plain: true }));
  await generatePDF(plainFactory, filename);
  return filename;
}
// async function exportExcelMaterialAcIR(filename, filters) {
//   return await exportExcelMaterial(filename, filters);
// }
// async function exportExcelCustomAcIR(filename, filters) {
//   return await exportExcelCustoms(filename, filters);
// }
module.exports = {
  getAllIvTransDTw,
  getIvTransDTwById,
  checkBoxR,
  addIvTransDTw,
  editvTransDTw,
  exportPDFAcIR,
  searchIvTDT,
  deleteIvTDT,
  // exportExcelMaterialAcIR,
  // exportExcelCustomAcIR
};
