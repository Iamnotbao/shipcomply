const QueryHelper = require("../../utils/queryHelper.js");
const PROGRAMS_GROUP_M = require("./programs_group_m.model.js");
const FACTORY = require("../factories/factory.model.js");

async function listAllPGM(
) {
  return await PROGRAMS_GROUP_M.findAll({order: [["group_code", "ASC"]],
  });
}

async function getByID(factory_code, item_acno) {
  const acImp = await PROGRAMS_GROUP_M.findOne({
    where: {
      factory_code: factory_code,
      item_acno: item_acno,
    },
    include: [FACTORY],
  });
  if (!acImp) {
    console.log("No PROGRAMS_GROUP_M found!");
    return null;
  }
  return acImp;
}
async function getAllACIMByIA(item_acno) {
  return await PROGRAMS_GROUP_M.findAll({
    where: {
      item_acno: item_acno,
    },
  });
}
async function add(acIM, t) {
  try {
    const addItemM = await PROGRAMS_GROUP_M.create(acIM, {
      transaction: t,
    });
    return addItemM;
  } catch (error) {
    console.log("Cannot add ac item m from db", error);
  }
}
async function edit(existAcIM, editAcIM, t) {
  try {
    const editAIM = await existAcIM.update(editAcIM, { transaction: t });
    return editAIM;
  } catch (error) {
    console.log("Cannot edit ac item m from db", error);
  }
}
async function deleteIM(existAcIM, t) {
  try {
    const deleteIM = await existAcIM.destroy({ transaction: t });
    return deleteIM;
  } catch (error) {
    console.log("Cannot delete ac item m from db", error);
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
      PROGRAMS_GROUP_M: [
        "item_acno",
        "item_acname",
        "ac_item",
        "status",
      ],
      FACTORY: ["factory_code"],
    }).filter();
    const whereClause = queryHelper.whereMap.PROGRAMS_GROUP_M || {};
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
    const impSearch = await PROGRAMS_GROUP_M.findAll({
      where: whereClause,
      include: [
        {
          model: FACTORY,
          where: queryHelper.whereMap.FACTORY || {},
          required: true,
          attributes: [],
        },
      ],
      order: [["item_acno", "ASC"]],
    });

    return impSearch;
  } catch (error) {
    console.log("Database can not search the data", error);
    throw error;
  }
}
module.exports = {
  listAllPGM,
  getAllACIMByIA,
  getByID,
  add,
  edit,
  deleteIM,
  search,
};
