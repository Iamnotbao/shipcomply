const createAcShoesRefSchema = require("./ac_prod_m.create.dto");
const AcProdMService = require("./ac_prod_m.service");
const sequelize = require("../../config/db");
const fs = require("fs");
const { broadcast } = require("../../utils/sseManager");
const createAcProdMSchema = require("./ac_prod_m.create.dto");

async function getAllAcProdM(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  const result = await AcProdMService.getAllAcProdM(
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
  console.log("result", result);

  return res.status(200).json({
    message: "ok",
    success: true,
    ata: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "AC_PROD_M",
  });
}
async function getAcProdMDropdown(req, res) {
  const { factory_code, language, page, limit, search } = req.query;
  const result = await AcProdMService.getAcProdMDropdown(
    factory_code,
    language,
    page,
    limit,
    search,
  );
  return res.status(200).json({
    message: "ok",
    success: true,
    data: result.data,
    total: result.total,
    currentPage: result.currentPage,
    pageSize: result.pageSize,
    tableName: "AC_PROD_M",
  });
}
async function getAcProdMByID(req, res) {
  const { factory_code, customs_shoe_id, prod_acno } = req.query;
  const result = await AcProdMService.getAcProdMByID(
    factory_code,
    customs_shoe_id,
    prod_acno,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac prod m!",
      success: false,
      tableName: "AC_PROD_M",
    });
  }
  return res.status(200).json({
    message: "Get single  single ac prod m successfully!",
    success: true,
    data: result,
    tableName: "AC_PROD_M",
  });
}

async function updateStatusAcProdM(req, res) {
  const {
    factory_code,
    customs_shoe_id,
    department_code,
    user_code,
    query_level,
  } = req.query;
  const { data } = req.body;
  try {
    const acProdM = await AcProdMService.updateStatusAProdM(
      factory_code,
      customs_shoe_id,
      department_code,
      user_code,
      query_level,
      data,
    );
    if (!acProdM) {
      return res.status(400).json({
        message: "This ac prod m does not exist !",
        success: false,
      });
    }
    return res.json({
      message: "Get ac prod m by category ok",
      success: true,
      data: acProdM,
      tableName: "AC_PROD_M",
    });
  } catch (error) {
    console.log("Cannot get the single ac prod m ", error);
  }
}
async function getAcProdMByShoe(req, res) {
  const {
    factory_code,
    customs_shoe_id,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  const result = await AcProdMService.getAcProdMByShoe(
    factory_code,
    customs_shoe_id,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get all ac prod m by shoe!",
      success: false,
      tableName: "AC_PROD_M",
    });
  }
  return res.status(200).json({
    message: "Get single  all ac prod m by shoe successfully!",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "AC_PROD_M",
  });
}
async function addAcProdM(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  const { error, value } = createAcProdMSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await AcProdMService.addAcProdM(
      factory_code,
      department_code,
      user_code,
      query_level,
      value,
      page_size,
      t,
    );
    broadcast({ table: "AC_PROD_M", action: "create" });
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
      message: "Add  ac prod m successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add  ac prod m because", error);
    await t.rollback();
  }
}
async function editAcProdM(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      customs_shoe_id,
      prod_acno,
      page_size,
    } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      customs_shoe_id,
      prod_acno,
    };
    const { error, value } = createAcProdMSchema.validate(dataToValidate);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await AcProdMService.editAcProdM(
      factory_code,
      department_code,
      user_code,
      query_level,
      customs_shoe_id,
      prod_acno,
      value,
      page_size,
      t,
    );
    broadcast({table : "AC_PROD_M", action: "edit"});
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
      message: "Edit ac prod m successfully!",
      data: response.data,
      size: response.size,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Can not edit ac prod m from controller!");
    await t.rollback();
  }
}
async function deleteAcProdM(req, res) {
  try {
    const { factory_code, customs_shoe_id, prod_acno } = req.query;

    const t = await sequelize.transaction();
    const isDelete = await AcProdMService.deleteAcProdM(
      factory_code,
      customs_shoe_id,
      prod_acno,
      t,
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
async function searchAcProdM(req, res) {
  const keyword = req.body;
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  console.log(keyword);
  try {
    const shoes = await AcProdMService.searchAcProdM(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
      limit,
      offset,
    );
    return res.json({
      message: "search ac item m successfully!",
      success: true,
      data: shoes.rows,
      total: shoes.count,
      hasMore: shoes.hasMore,
      tableName: "AC_PROD_M",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFAcProdM(req, res) {
  try {
    const filename = "AC_PROD_M.pdf";
    const pdf = await AcProdMService.exportPDFAcProdM(filename);
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
//     const filePath = await AcProdMService.exportExcelMaterialAcImp(filename, filters);

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
//     const filePath = await AcProdMService.exportExcelCustomAcImp(filename, filters);

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
  getAllAcProdM,
  getAcProdMByID,
  getAcProdMByShoe,
  updateStatusAcProdM,
  addAcProdM,
  editAcProdM,
  deleteAcProdM,
  searchAcProdM,
  exportPDFAcProdM,
  getAcProdMDropdown
  // exportMaterialToExcel,
  // exportCustomToExcel
};
