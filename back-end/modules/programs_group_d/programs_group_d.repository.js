const QueryHelper = require("../../utils/queryHelper.js");
const pool = require("../../config/db.js");
const path = require("path");
const fs = require("fs");
const PROGRAMS_GROUP_D = require("./programs_group_d.model.js");
const FACTORY = require("../factories/factory.model.js");
const AC_ITEM_M = require("../ac_item_m/ac_item_m.model.js");
const { Op, literal } = require("sequelize");

async function listAllPGD(
) {
  return await PROGRAMS_GROUP_D.findAll({order: [["group_code", "ASC"]],
  });
}
async function listAllWithItemAcno(
  factory_code,
  department_code,
  user_code,
  query_level
) {
  console.log(
    "listAll with category join",
    factory_code,
    department_code,
    user_code,
    query_level
  );

  const whereClause = {};

  if (user_code !== "admin") {
    if (query_level === "1" && factory_code) {
      whereClause.factory_code = factory_code;
    } else if (query_level === "2" && department_code) {
      whereClause.grt_dept = department_code;
      whereClause.factory_code = factory_code;
    } else if (query_level === "3" && user_code) {
      whereClause.grt_user = user_code;
    }
  }

  return await PROGRAMS_GROUP_D.findAll({
    where: whereClause,
    include: [
      {
        model: AC_ITEM_M,
        as: "ITEM_ACNO",
        attributes: [
          "item_acname_t",
          "item_acname_e",
          "item_acname_l",
          "status",
        ],
        required: false, 
        on: {
          [Op.and]: [
            literal('"PROGRAMS_GROUP_D"."factory_code" = "ITEM_ACNO"."factory_code"'),
            literal(
              '"PROGRAMS_GROUP_D"."item_acno" = "ITEM_ACNO"."item_acno"'
            ),
          ],
        },
      },
    ],
    raw: true,
    nest: true,
    order: [["item_no", "ASC"]],
  });
}
async function getByID(factory_code, item_acno, item_no) {
  const acImp = await PROGRAMS_GROUP_D.findOne({
    where: {
      factory_code: factory_code,
      item_acno: item_acno,
      item_no: item_no,
    },
      include: [
        {
          model: FACTORY,
          required: false,
        },
        //  Include BASIC_DATA_CATEGORY - Composite key với literal
        {
          model: AC_ITEM_M,
          as: "ITEM_ACNO",
          attributes: [
            "item_acname_t",
            "item_acname_e",
            "item_acname_l",
            "status",
          ],
          required: false,
          on: {
            [Op.and]: [
              literal(
                '"PROGRAMS_GROUP_D"."factory_code" = "ITEM_ACNO"."factory_code"'
              ),
              literal(
                '"PROGRAMS_GROUP_D"."item_acno" = "ITEM_ACNO"."item_acno"'
              ),
            ],
          },
        },
      ],
    
  });
  if (!acImp) {
    console.log("No ac item ref found!");
    return null;
  }
  return acImp;
}
async function getByItemNo(item_no) {
  const acImp = await PROGRAMS_GROUP_D.findAll({
    where: {
      item_no: item_no,
    },
      include: [
        {
          model: FACTORY,
          required: false,
        },
        //  Include BASIC_DATA_CATEGORY - Composite key với literal
        {
          model: AC_ITEM_M,
          as: "ITEM_ACNO",
          attributes: [
            "item_acname_t",
            "item_acname_e",
            "item_acname_l",
            "status",
          ],
          required: false,
          on: {
            [Op.and]: [
              literal(
                '"PROGRAMS_GROUP_D"."factory_code" = "ITEM_ACNO"."factory_code"'
              ),
              literal(
                '"PROGRAMS_GROUP_D"."item_acno" = "ITEM_ACNO"."item_acno"'
              ),
            ],
          },
        },
      ],
    
  });
  if (!acImp) {
    console.log("No ac item ref found!");
    return null;
  }
  return acImp;
}
async function getByItemAcno(
  factory_code,
  item_acno,
  department_code,
  user_code,
  query_level
) {
  try {
    const whereClause = {
      factory_code: factory_code,
      item_acno: item_acno,
    };
    if (user_code !== "admin") {
      switch (query_level) {
        case "1":
          break;
        case "2":
          if (department_code) {
            whereClause.grt_dept = department_code;
          }
          break;
        case "3":
          if (user_code) {
            whereClause.grt_user = user_code;
          }
          break;
      }
    }
    const acItemRef = await PROGRAMS_GROUP_D.findAll({
      where: whereClause,
      order: [["item_no", "ASC"]],
    });

    return acItemRef;
  } catch (error) {
    console.log("Error from basic data Db: ", error);
    throw error;
  }
}
async function add(acIR, t) {
  try {
    const addIR = await PROGRAMS_GROUP_D.create(acIR, {
      transaction: t,
    });
    return addIR;
  } catch (error) {
    console.log("Cannot add ac item ref from db", error);
  }
}
async function edit(existAcIR, editAcIR, t) {
  try {
    const editAIR = await existAcIR.update(editAcIR, { transaction: t });
    return editAIR;
  } catch (error) {
    console.log("Cannot edit ac item ref from db", error);
  }
}
async function deleteIR(existAcIR, t) {
  try {
    const deleteAcIR = await existAcIR.destroy({ transaction: t });
    return deleteAcIR;
  } catch (error) {
    console.log("Cannot delete ac item ref from db", error);
  }
}
async function search(
  query,
  factory_code,
  department_code,
  user_code,
  query_level
) {
  try {
    const queryHelper = new QueryHelper(query, {
      PROGRAMS_GROUP_D: [
        "item_no",
        "item_unit",
        "formula",
        "status"
      ],
      FACTORY: ["factory_code"],
    }).filter();
    const whereClause = queryHelper.whereMap.PROGRAMS_GROUP_D || {};
    if (user_code !== "admin") {
      if (query_level === "1" && factory_code) {
        whereClause.factory_code = factory_code;
      } else if (query_level === "2" && department_code) {
        whereClause.grt_dept = department_code;
        whereClause.factory_code = factory_code;
      } else if (query_level === "3" && user_code) {
        whereClause.grt_user = user_code;
      }
    }
    const impSearch = await PROGRAMS_GROUP_D.findAll({
      where: whereClause,
      include: [
        {
          model: FACTORY,
          where: queryHelper.whereMap.FACTORY || {},
          required: true,
          attributes: [],
        },
      ],
      order: [["item_no", "ASC"]],
    });

    return impSearch;
  } catch (error) {
    console.log("Database can not search the data", error);
    throw error;
  }
}
module.exports = {
  listAllPGD,
  listAllWithItemAcno,
  getByID,
  getByItemAcno,
  getByItemNo,
  add,
  edit,
  deleteIR,
  search,
};
