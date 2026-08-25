const sequelize = require("../../config/db");
const createFactoryDepartmentsSchema = require("./factory_deparments.create.dto");
const fs = require("fs")
const fDeparmentService = require("./factory_departments.service");

async function getAll(req, res) {
  const fDepartments = await fDeparmentService.getAll();
  if (fDepartments) {
    return res.json({
      message: "Get all departments",
      sucess: true,
      data: fDepartments,
      tableName: "DEPARTMENTS",
    });
  }
}
async function getByID(req, res) {
  const { factory_code, department_code } = req.query;
  try {
    const department = await fDeparmentService.getDepartmentByID(
      factory_code,
      department_code
    );
    if (!department) {
      return res.status(400).json({
        message: "This department does not exist !",
        success: false,
      });
    }
    return res.json({
      message: "Get single deparment ok",
      success: true,
      data: department,
    });
  } catch (error) {
    console.log("Cannot get the single deparment");
  }
}
async function getByFactory(req, res) {
  const { factory_code } = req.query;
  try {
    const department = await fDeparmentService.getByFactory(factory_code);
    if (!department) {
      return res.status(400).json({
        message: "This department does not exist !",
        success: false,
      });
    }
    return res.json({
      message: "Get single deparment ok",
      success: true,
      data: department,
      tableName: "DEPARTMENTS",
    });
  } catch (error) {
    console.log("Cannot get the single deparment");
  }
}
async function createDepartment(req, res) {
  const { data } = req.body;
  console.log("check data", data);

  const { error, value } = createFactoryDepartmentsSchema.validate(data);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  const t = await sequelize.transaction();
  try {
    const response = await fDeparmentService.createDepartment(value, t);
    if (response.message) {
      await t.rollback();
      return res.status(400).json({
        message:response.message,
        success: false,
      });
    }
    await t.commit();
    return res.status(200).json({
      message: "Create department successfully!",
      success: true,
      data:response
    });
  } catch (error) {
    await t.rollback();
    console.log("Add Department Failed:", error);
  }
}
async function editDepartment(req, res) {
  const { factory_code, department_code } = req.query;
  const { data } = req.body;
  const { error, value } = createFactoryDepartmentsSchema.validate(
    data,
    factory_code,
    department_code
  );
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  const t = await sequelize.transaction();
  try {
    const response = await fDeparmentService.editDepartment(
      factory_code,
      department_code,
      value,
      t
    );
    if (!response) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Edit Failed!",
      });
    }
    await t.commit();
    return res.status(200).json({
      message: "Edit Department successfully!",
      success: true,
    });
  } catch (error) {
    await t.rollback();
    console.log("Error edit department", error);
  }
}
async function deleteFactoryDepartment(req, res) {
  const { factory_code, department_code } = req.query;
  const t = await sequelize.transaction();
  try {
    const isDelete = await fDeparmentService.deleteFactoryDepartment(
      factory_code,
      department_code,
      t
    );
    if (!isDelete) {
      await t.rollback();
      return res.status(400).json({
        message: "Cannot delete department!",
        success: false,
      });
    }
    await t.commit();
    return res.status(200).json({
      message: "Delete Department Success!",
      success: true,
    });
  } catch (error) {
    t.rollback();
    console.log("Cannot delete department with some issue in try");
  }
}
async function deleteAllFactoryDepartment(req, res) {
  const { departments } = req.body;
  const t = await sequelize.transaction();
  try {
    const isAllDelete = await fDeparmentService.deleteAllDepartment(
      departments
    );
    if (!isAllDelete) {
      await t.rollback();
      return res.status(400).json({
        message: "Cannot delete all department!",
        success: false,
      });
    }
    await t.commit();
    return res.status(200).json({
      message: "Delete all department Success!",
      success: true,
    });
  } catch (error) {
    t.rollback();
    console.log("Cannot delete all department with some issue in try");
  }
}
async function searchByDepartment(req, res) {
  try {
    const search = req.body;
    const response = await fDeparmentService.searchByDepartment(search);
    return res.status(200).json({
      message: "Search has been executed!",
      data: response,
      tableName: "DEPARTMENTS",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Search Failed!",
      error: error,
    });
  }
}
async function exportPDFDepartment(req, res) {
  try {
    const filename = "department.pdf";
    const pdf = await fDeparmentService.exportPDFDepartment(filename);
    res.download(pdf, (err) => {
      if (err) {
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
module.exports = {
  getAll,
  getByID,
  getByFactory,
  createDepartment,
  editDepartment,
  deleteFactoryDepartment,
  deleteAllFactoryDepartment,
  searchByDepartment,
  exportPDFDepartment
};
