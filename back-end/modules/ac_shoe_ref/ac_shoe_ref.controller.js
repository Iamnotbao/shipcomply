const createAcShoesRefSchema = require("./ac_shoe_ref.create.dto");
const acShoeRefService = require("./ac_shoe_ref.service");
const sequelize = require("../../config/db");
const fs = require("fs");

async function getAllAcShoeRef(req, res) {
  const {
    factory_code,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  const result = await acShoeRefService.getAllAcShoeRef(
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
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "AC_SHOE_REF",
  });
}
async function updateStatusAcShoeRef(req, res) {
  const {
    factory_code,
    customs_shoe_id,
    department_code,
    user_code,
    query_level,
  } = req.query;
  const { data } = req.body;
  try {
    const acProdM = await acShoeRefService.updateStatusAcShoeRef(
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
async function getAcShoeRefByID(req, res) {
  const { factory_code, customs_shoe_id, prod_no } = req.query;
  const result = await acShoeRefService.getAcShoeRefByID(
    factory_code,
    customs_shoe_id,
    prod_no,
  );
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac shoe ref!",
      success: false,
      tableName: "AC_SHOE_REF",
    });
  }
  return res.status(200).json({
    message: "Get single  single ac shoe ref successfully!",
    success: true,
    data: result,
    tableName: "AC_SHOE_REF",
  });
}
async function getByNoneViewItemNo(req, res) {
  const { prod_no } = req.query;
  const result = await acShoeRefService.getByNoneViewItemNo(prod_no);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get all ac shoe ref by prod_no!",
      success: false,
      tableName: "AC_SHOE_REF",
    });
  }
  return res.status(200).json({
    message: "Get single all ac shoe ref by prod_no!",
    success: true,
    data: result,
    tableName: "AC_SHOE_REF",
  });
}
async function getAcShoeRefByShoe(req, res) {
  const {
    factory_code,
    customs_shoe_id,
    department_code,
    user_code,
    query_level,
    limit,
    offset,
  } = req.query;
  const result = await acShoeRefService.getAcShoeRefByShoe(
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
      message: "Cannot get single ac shoe ref!",
      success: false,
      tableName: "AC_SHOE_REF",
    });
  }
  return res.status(200).json({
    message: "Get  ac shoe ref by factory successfully!",
    success: true,
    data: result.rows,
    total: result.count,
    hasMore: result.hasMore,
    tableName: "AC_SHOE_REF",
  });
}
async function getListViewProdNo(req, res) {
  const { page, limit, search } = req.query;
  const result = await acShoeRefService.getListViewProdNo(page, limit, search);
  if (!result) {
    return res.status(401).json({
      message: "Cannot get single ac shoe ref!",
      success: false,
      tableName: "AC_SHOE_REF",
    });
  }
  return res.status(200).json({
    message: "Get  ac shoe ref by factory successfully!",
    success: true,
    data: result,
    tableName: "AC_SHOE_REF",
  });
}
async function addAcShoeRef(req, res) {
  const { page_size, factory_code, department_code, user_code, query_level } =
    req.query;
  const { data } = req.body;
  const { error, value } = createAcShoesRefSchema.validate(data);
  if (error) {
    return res.status(402).json({
      success: false,
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await acShoeRefService.addAcShoeRef(
      factory_code,
      department_code,
      user_code,
      query_level,
      value,
      page_size,
      t,
    );
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
      message: "Add  ac shoe ref successfully!",
      data: response.data,
      size: response.size,
      page: response.page,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Cannot add  ac shoe ref because", error);
    await t.rollback();
  }
}
async function editAcShoeRef(req, res) {
  const t = await sequelize.transaction();
  try {
    const {
      factory_code,
      department_code,
      user_code,
      query_level,
      customs_shoe_id,
      prod_no,
      page_size,
    } = req.query;
    const { data } = req.body;
    const dataToValidate = {
      ...data,
      factory_code,
      customs_shoe_id,
      prod_no,
    };
    const { error, value } = createAcShoesRefSchema.validate(dataToValidate);
    if (error) {
      return res.status(402).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const response = await acShoeRefService.editAcShoeRef(
      factory_code,
      department_code,
      user_code,
      query_level,
      customs_shoe_id,
      prod_no,
      value,
      page_size,
      t,
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
      message: "Edit ac shoe ref successfully!",
      data: response.data,
      size: response.size,
      offset: response.offset,
      position: response.position,
    });
  } catch (error) {
    console.log("Can not edit ac shoe ref from controller!");
    await t.rollback();
  }
}
async function deleteAcShoeRef(req, res) {
  try {
    const { factory_code, customs_shoe_id, prod_no } = req.query;

    const t = await sequelize.transaction();
    const isDelete = await acShoeRefService.deleteAcShoeRef(
      factory_code,
      customs_shoe_id,
      prod_no,
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
async function searchAcShoeRef(req, res) {
  const keyword = req.body;
  const { factory_code, department_code, user_code, query_level } = req.query;
  console.log(keyword);
  try {
    const shoes = await acShoeRefService.searchAcShoeRef(
      keyword,
      factory_code,
      department_code,
      user_code,
      query_level,
    );
    return res.json({
      message: "search ac item m successfully!",
      success: true,
      data: shoes,
      tableName: "AC_SHOE_REF",
    });
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFAcShoeRef(req, res) {
  try {
    const filename = "AC_SHOE_REF.pdf";
    const pdf = await acShoeRefService.exportPDFAcShoeRef(filename);
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
//     const filePath = await acShoeRefService.exportExcelMaterialAcImp(filename, filters);

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
//     const filePath = await acShoeRefService.exportExcelCustomAcImp(filename, filters);

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
  getAllAcShoeRef,
  getAcShoeRefByID,
  getAcShoeRefByShoe,
  getListViewProdNo,
  getByNoneViewItemNo,
  updateStatusAcShoeRef,
  addAcShoeRef,
  editAcShoeRef,
  deleteAcShoeRef,
  searchAcShoeRef,
  exportPDFAcShoeRef,
  // exportMaterialToExcel,
  // exportCustomToExcel
};
