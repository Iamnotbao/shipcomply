const createProgramsGroupMSchema = require("./programs_group_m.create.dto");
const programsGroupMService = require("./programs_group_m.service");
const sequelize = require("../../config/db");
const fs = require("fs");

async function getAllPGM(req, res) {
  const result = await programsGroupMService.getAllPGM();
  console.log("result", result);

  return res.status(200).json({
    message: "ok",
    success: true,
    data: result,
    tableName: "PROGRAMS_GROUP_M",
  });
}
async function getAcIMByID(req, res) {
  const { factory_code, item_acno } = req.query;
  const result = await programsGroupMService.getAcIMByID(factory_code, item_acno);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac item m!",
      success: false,
      tableName: "PROGRAMS_GROUP_M",
    });
  }
  return res.status(200).json({
    message: "Get single  single ac item m successfully!",
    success: true,
    data: result,
    tableName: "PROGRAMS_GROUP_M",
  });
}
async function getAcIMByIA(req, res) {
  const { item_acno } = req.query;
  const result = await programsGroupMService.getAllACIMByItemAcno(item_acno);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get all item acno!",
      success: false,
      tableName: "PROGRAMS_GROUP_M",
    });
  }
  return res.status(200).json({
    message: "Get single  single ac item m successfully!",
    success: true,
    data: result,
    tableName: "PROGRAMS_GROUP_M",
  });
}
async function addAcIM(req, res) {
  const { data } = req.body;
  const { error, value } = createProgramsGroupMSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await programsGroupMService.addAcIM(value, t);
    if (response.message) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: response.message,
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Add ac item m successfully!",
      data: response,
    });
  } catch (error) {
    console.log("Cannot add ac item m because", error);
    await t.rollback();
  }
}
async function editAcIM(req, res) {
  const t = await sequelize.transaction();
  try {
    const { factory_code, item_acno } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      item_acno,
    };
    const { error, value } = createProgramsGroupMSchema.validate(dataToValidate);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await programsGroupMService.editAcIM(
      factory_code,
      item_acno,
      value,
      t
    );
    if (!response) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot edit ac item m",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Edit  ac item m  successfully!",
      data: response,
    });
  } catch (error) {
    console.log("Can not edit ac item m from controller!");
    await t.rollback();
  }
}
async function deleteAcIM(req, res) {
  try {
    const { factory_code, item_acno } = req.query;

    const t = await sequelize.transaction();
    const isDelete = await programsGroupMService.deleteAcImp(
      factory_code,
      item_acno,
      t
    );
    if (!isDelete) {
      await t.rollback();
      return res.status(401).json({
        success: false,
        message: "Cannot delete because null!",
      });
    }
    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Delete ac item m successfully!",
    });
  } catch (error) {
    await t.rollback();
    console.log("Something error from delete controller :", error);
  }
}
async function searchAcIM(req, res) {
  const keyword = req.body;
  const { factory_code, department_code, user_code, query_level } = req.query;
  console.log(keyword);
  try {
    const shoes = await programsGroupMService.searchAcIM(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level
    );
    return res.json({
      message: "search ac item m successfully!",
      success: true,
      data: shoes,
      tableName: "PROGRAMS_GROUP_M",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFAcIM(req, res) {
  try {
    const filename = "PROGRAMS_GROUP_M.pdf";
    const { factory_code, department_code, user_code, query_level } = req.query;
    const pdf = await programsGroupMService.exportPDFAcIM(
      filename,
      factory_code,
      department_code,
      user_code,
      query_level
    );
    res.download(pdf, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error downloading file");
      }
      fs.unlinkSync(filename);
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Export PDF failed" });
  }
}
async function exportExcelAcIM(req, res) {
  try {
    console.log("req", req);
    const { data } = req.body;
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided for export",
      });
    }

    const workbook = await programsGroupMService.exportExcelAcIM(data, "PROGRAMS_GROUP_M");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=PROGRAMS_GROUP_M_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(" Export Excel error:", error);

    // Prevent "Cannot set headers after they are sent"
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: error.message || "Export Excel failed",
      });
    }
  }
}
// async function exportMaterialToExcel(req, res) {
//   try {
//     const filename = `material_tracking_${Date.now()}.xlsx`;
//     const filters = {
//       ...req.body,
//       ...req.query,
//       ...req.params
//     };
//     console.log("filter",filters);

//     if (!filters.orgId && !filters.factory_code) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required parameter: orgId or factory_code'
//       });
//     }
//     const filePath = await programsGroupMService.exportExcelMaterialAcImp(filename, filters);

//     res.download(filePath, (err) => {
//       if (err) {
//         console.error("Error sending file:", err);
//         res.status(500).send("Error downloading file");
//       }
//       fs.unlinkSync(filePath);
//     });

//   } catch (error) {
//     console.error('❌ Export error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Export failed',
//       error: error.message
//     });
//   }
// }

// async function exportCustomToExcel(req,res) {
//    try {
//     const filename = `custom_tracking_${Date.now()}.xlsx`;
//     const filters = {
//       ...req.body,
//       ...req.query,
//       ...req.params
//     };

//     if (!filters.orgId && !filters.factory_code) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required parameter: orgId or factory_code'
//       });
//     }
//     const filePath = await programsGroupMService.exportExcelCustomAcImp(filename, filters);

//     res.download(filePath, (err) => {
//       if (err) {
//         console.error("Error sending file:", err);
//         res.status(500).send("Error downloading file");
//       }
//       fs.unlinkSync(filePath);
//     });

//   } catch (error) {
//     console.error('❌ Export error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Export failed',
//       error: error.message
//     });
//   }
// }
module.exports = {
  getAllPGM,
  getAcIMByID,
  getAcIMByIA,
  addAcIM,
  editAcIM,
  deleteAcIM,
  searchAcIM,
  exportPDFAcIM,
  exportExcelAcIM,
  // exportMaterialToExcel,
  // exportCustomToExcel
};
