const QueryHelper = require("../../utils/queryHelper");
const PROGRAM_FIELD_TITLE = require("./program_field_title.model");
const pool = require("../../config/db");
const USER_PERMISSION = require("../users_permission/users_permission.model");
const USER_PERMISSION_DEPARTMENT = require("../users_permisison_department/users_permisison_department.model");
const DEPARTMENTS = require("../factory_departments/factory_deparments.model");
const USER = require("../users/user.model");
const FACTORY = require("../factories/factory.model");
const PROGRAM = require("../program/program.model");
const BASIC_DATA = require("../basic_data/basic_data.model");
const BASIC_DATA_CATEGORY = require("../basic_data_category/basic_data_category.model");
const AC_IMP_MATERIAL_TRACKING = require("../ac_imp_material_tracking/ac_imp_material_tracking.model");
const AC_ITEM_M = require("../ac_item_m/ac_item_m.model");
const AC_ITEM_REF = require("../ac_item_ref/ac_item_ref.model");
const AC_SHOE_M = require("../ac_shoe_m/ac_shoe_m.model");
const AC_SHOE_REF = require("../ac_shoe_ref/ac_shoe_ref.model");
const AC_PROD_M = require("../ac_prod_m/ac_prod_m.model");
const AC_BOM_M = require("../ac_bom_m/ac_bom_m.model");
const RD_SIZE_D = require("../rd_size_d/rd_size_d.model");
const AC_VEND_BASE = require("../ac_vend_base/ac_vend_base.model");
const AC_SEND_BASE = require("../ac_send_base/ac_send_base.model");
const AC_REQ_M = require("../ac_req_m/ac_req_m.model");
const AC_REQ_ORDER = require("../ac_req_order/ac_req_order.model");
const AC_SRCORDER_M = require("../ac_srcorder_m/ac_srcorder_m.model");
const AC_CONT_M = require("../ac_cont_m/ac_cont_m.model");
const AC_CONT_D = require("../ac_cont_d/ac_cont_d.model");
const AC_INM_M = require("../ac_inm_m/ac_inm_m.model");
const AC_INM_D = require("../ac_inm_d/ac_inm_d.model");
const IV_TRANS_D_TW = require("../iv_trans_d_tw/iv_trans_d_tw.model");
const AC_CHG_M = require("../ac_chg_m/ac_chg_m.model");
const AC_CHG_A = require("../ac_chg_a/ac_chg_a.model");
const AC_CHG_D = require("../ac_chg_d/ac_chg_d.model");
const AC_PROC_M = require("../ac_proc_m/ac_proc_m.model");
const AC_PROC_D = require("../ac_proc_d/ac_proc_d.model");
const AC_DESC_PROC = require("../ac_desc_proc/ac_desc_proc.model");
const SE_SHIPING_M = require("../se_shiping_m/se_shiping_m.model");
const SE_SHIPING_D = require("../se_shiping_d/se_shiping_d.model");
const SE_PLAN_ORD = require("../se_plan_ord/se_plan_ord.model");
const SE_PLAN_SIZE = require("../se_plan_size/se_plan_size.model");
const SD_ORD_M = require("../sd_ord_m/sd_ord_m.model");
const SD_PRICE_ITEM = require("../sd_price_item/sd_price_item.model");
const SD_ORD_M_C = require("../sd_ord_m_c/sd_ord_m_c.model");
const PAKING_LIST_M = require("../paking_list_m/paking_list_m.model");
const PAKING_LIST_D = require("../paking_list_d/paking_list_d.model");
const SE_INV_M = require("../se_inv_m/se_inv_m.model");
const SE_INV_D = require("../se_inv_d/se_inv_d.model");
const AC_ISSUE_M_T = require("../ac_issue_m_t/ac_issue_m_t.model");
const AC_ISSUE_MATD_T = require("../ac_issue_matd_t/ac_issue_matd_t.model");
const AC_CHK_T = require("../ac_chk_t/ac_chk_t.model");
const AC_EXPECT_M = require("../ac_expect_m/ac_expect_m.model");
const AC_EXPECT_SE = require("../ac_expect_se/ac_expect_se.model");
const AC_EXPECT_MATD = require("../ac_expect_matd/ac_expect_matd.model");
const AC_CO_M = require("../ac_co_m/ac_co_m.model");
const SE_SALES = require("../se_sales/se_sales.model");
const SE_SALES_D = require("../se_sales_d/se_sales_d.model");
const SE_PAY = require("../se_pay/se_pay.model");
const AC_DESC_CHG = require("../ac_desc_chg/ac_desc_chg.model");
const AC_PLAN_ORD = require("../ac_plan_ord/ac_plan_ord.model");
const AC_PLAN_SIZE = require("../ac_plan_size/ac_plan_size.model");
const AC_PLAN_PACK = require("../ac_plan_pack/ac_plan_pack.model");
const MODEL_MAP = {
  FACTORY,
  PROGRAM,
  DEPARTMENTS,
  USER,
  USER_PERMISSION,
  USER_PERMISSION_DEPARTMENT,
  AC_IMP_MATERIAL_TRACKING,
  AC_ITEM_M,
  AC_ITEM_REF,
  PROGRAM_FIELD_TITLE,
  BASIC_DATA,
  BASIC_DATA_CATEGORY,
  AC_ITEM_M,
  AC_ITEM_REF,
  AC_SHOE_M,
  AC_SHOE_REF,
  AC_PROD_M,
  AC_BOM_M,
  RD_SIZE_D,
  AC_VEND_BASE,
  AC_SEND_BASE,
  AC_REQ_M,
  AC_REQ_ORDER,
  AC_SRCORDER_M,
  IV_TRANS_D_TW,
  AC_CONT_M,
  AC_CONT_D,
  AC_INM_M,
  AC_INM_D,
  AC_CHG_M,
  AC_CHG_D,
  AC_CHG_A,
  AC_PROC_M,
  AC_PROC_D,
  AC_DESC_PROC,
  SE_SHIPING_M,
  SE_SHIPING_D,
  SE_PLAN_ORD,
  SE_PLAN_SIZE,
  SD_ORD_M,
  SD_PRICE_ITEM,
  SD_ORD_M_C,
  PAKING_LIST_M,
  PAKING_LIST_D,
  SE_INV_M,
  SE_INV_D,
  AC_ISSUE_M_T,
  AC_ISSUE_MATD_T,
  AC_CHK_T,
  AC_EXPECT_M,
  AC_EXPECT_SE,
  AC_EXPECT_MATD,
  AC_CO_M,
  SE_SALES,
  SE_SALES_D,
  SE_PAY,
  AC_DESC_CHG,
  AC_PLAN_ORD,
  AC_PLAN_SIZE,
  AC_PLAN_PACK,
};
const MASTER_DETAIL_MAP = {
  BASIC_DATA: [
    {
      name: "basic_data_category",
      master: "BASIC_DATA_CATEGORY",
      detail: "BASIC_DATA",
    },
  ],
  ACTF_250: [
    {
      name: "ac_imp_material_tracking",
      master: "AC_IMP_MATERIAL_TRACKING",
    },
  ],
  ACTF_020: [
    {
      name: "ac_item_m",
      master: "AC_ITEM_M",
      detail: "AC_ITEM_REF",
    },
    {
      name: "ac_shoe_m",
      master: "AC_SHOE_M",
      detail: [AC_PROD_M, AC_SHOE_REF, RD_SIZE_D],
    },
    {
      name: "ac_bom_m",
      master: "AC_BOM_M",
    },
  ],
  ACTF_410: [
    {
      name: "ac_req_m",
      master: "AC_REQ_M",
      details: ["AC_REQ_ORDER", "IV_TRANS_D_TW"],
    },
    {
      name: "ac_vend_base",
      master: "AC_VEND_BASE",
    },
    {
      name: "ac_send_base",
      master: "AC_SEND_BASE",
    },
    {
      name: "ac_srcorder_m",
      master: "AC_SRCORDER_M",
    },
  ],
  ACTF_110: [
    {
      name: "ac_cont_m",
      master: "AC_CONT_M",
      details: ["AC_CONT_D"],
    },
  ],
  ACTF_120: [
    {
      name: "se_pay",
      master: "SE_PAY",
    },
  ],
  ACTF_130: [
    {
      name: "ac_inm_m",
      master: "AC_INM_M",
      details: ["AC_INM_D"],
    },
  ],
  ACTF_210: [
    {
      name: "ac_chg_m",
      master: "AC_CHG_M",
      details: ["AC_CHG_D,AC_DESC_CHG,VW_ACREQ_D,AC_PLAN_ORD,AC_PLAN_SIZE"],
    },
  ],
  ACTF_220: [
    {
      name: "ac_proc_m",
      master: "AC_PROC_M",
      details: ["AC_PROC_D,AC_DESC_PROC"],
    },
  ],
  ACTF_230: [
    {
      name: "ac_chg_m",
      master: "AC_CHG_M",
      details: ["AC_CHG_D,AC_DESC_CHG,VW_ACREQ_D,AC_PLAN_ORD,AC_PLAN_SIZE"],
    },
  ],
  ACTF_290: [
    {
      name: "ac_proc_m",
      master: "AC_PROC_M",
      details: ["AC_PROC_D,VW_APDUE_ALL"],
    },
  ],
  SETF_570: [
    {
      name: "se_shiping_m",
      master: "SE_SHIPING_M",
      details: ["SE_SHIPING_D"],
    },
  ],
  SETF_560: [
    {
      name: "se_plan_ord",
      master: "SE_PLAN_ORD",
      details: ["SE_PLAN_SIZE,SD_ORD_M_C"],
    },
  ],
  SETF_120: [
    {
      name: "sd_ord_m",
      master: "SD_ORD_M",
      details: ["SD_PRICE_ITEM"],
    },
  ],
  SETF_590: [
    {
      name: "se_inv_m",
      master: "SE_INV_M",
      details: ["SE_INV_D,SD_PRICE_ITEM"],
    },
    {
      name: "paking_list_m",
      master: "PAKING_LIST_M",
      details: ["PAKING_LIST_D"],
    },
  ],
  ACTF_240: [
    {
      name: "ac_issue_m_t",
      master: "AC_ISSUE_M_T",
      details: ["AC_ISSUE_MATD_T,AC_CHK_T"],
    },
  ],
  ACTF_270: [
    {
      name: "ac_expect_m",
      master: "AC_EXPECT_M",
      details: ["AC_EXPECT_M,AC_EXPECT_MATD,AC_EXPECT_SE"],
    },
  ],
  ACTF_022: [
    {
      name: "ac_co_m",
      master: "AC_CO_M",
    },
  ],
  SETF_510: [
    {
      name: "se_sales",
      master: "SE_SALES",
      details: ["SE_SALES_D"],
    },
  ],
};

async function listAll() {
  return await PROGRAM_FIELD_TITLE.findAll({
    order: [
      ["program_code", "ASC"],
      ["field_code", "ASC"],
    ],
  });
}

async function getColumn(
  table_name,
  language = "E",
  table_type = "auto",
  relationship_name = null,
  specific_detail_table = null,
) {
  let actualTableName = table_name;
  const relationships = MASTER_DETAIL_MAP[table_name];
  if (relationships && Array.isArray(relationships)) {
    if (relationship_name) {
      const relationship = relationships.find(
        (r) => r.name === relationship_name,
      );
      if (relationship) {
        if (table_type === "master") {
          actualTableName = relationship.master;
        } else if (table_type === "detail") {
          if (specific_detail_table) {
            actualTableName = specific_detail_table;
          } else if (
            relationship.details &&
            Array.isArray(relationship.details)
          ) {
            actualTableName = relationship.details[0];
          } else if (relationship.detail) {
            actualTableName = relationship.detail;
          }
        }
      }
    }
  }

  const Model = MODEL_MAP[actualTableName];
  if (!Model) {
    throw new Error(`Model cho bảng ${actualTableName} không tồn tại`);
  }

  const charsetMap = {
    zh: "T",
    en: "E",
    vi: "L",
    T: "T",
    E: "E",
    L: "L",
  };
  const charset = charsetMap[language] || "E";
  const fields = Object.keys(Model.rawAttributes);

  try {
    return await pool.transaction(async (t) => {
      await pool.query('SET search_path TO "Customs", public;', {
        transaction: t,
        type: pool.QueryTypes.RAW,
      });

      const results = await Promise.all(
        fields.map(async (field) => {
          try {
            const rows = await pool.query(
              `SELECT "Customs".get_program_field_title($1, $2, $3) AS title;`,
              {
                bind: [table_name, field, charset],
                type: pool.QueryTypes.SELECT,
                transaction: t,
                logging: false,
              },
            );
            return {
              field,
              title: rows[0]?.title || null,
              type: "column",
              tableName: actualTableName,
              relationshipName: relationship_name,
            };
          } catch (error) {
            console.error(`Error for field ${field}:`, error.original?.message);
            return {
              field,
              title: null,
              type: "column",
              tableName: actualTableName,
              relationshipName: relationship_name,
            };
          }
        }),
      );

      return results;
    });
  } catch (error) {
    console.error("Error in getColumn:", error);
    throw error;
  }
}
async function getUIControls(table_name, language = "E") {
  const charsetMap = { zh: "T", en: "E", vi: "L", T: "T", E: "E", L: "L" };
  const charset = charsetMap[language] || "E";

  return await pool.transaction(async (t) => {
    await pool.query('SET search_path TO "Customs", public;', {
      transaction: t,
      type: pool.QueryTypes.RAW,
    });

    const results = await pool.query(
      `
      SELECT 
        field_code AS field,
        "Customs".get_program_field_title(program_code, field_code, :charset) AS title,
        'control' AS type
      FROM "Customs"."program_field_title"
      WHERE program_code = :program_code
      ORDER BY field_code ASC
      `,
      {
        replacements: { program_code: table_name, charset },
        type: pool.QueryTypes.SELECT,
        transaction: t,
      }
    );
    return results;
  });
}

async function getByID(program_code, field_code) {
  const program = await PROGRAM_FIELD_TITLE.findOne({
    where: {
      program_code: program_code,
      field_code: field_code,
    },
    include: [PROGRAM],
  });
  if (!program) {
    console.log("No program founds!");
    return null;
  }
  return program;
}

async function getByProg(program_code) {
  try {
    const pft = await PROGRAM_FIELD_TITLE.findAll({
      where: {
        program_code: program_code,
      },
      order: [
        ["program_code", "ASC"],
        ["field_code", "ASC"],
      ],
    });
    return pft;
  } catch (error) {
    console.log("Error from Program Field Title Db: ", error);
  }
}

async function add(pft, t) {
  try {
    const addPFT = await PROGRAM_FIELD_TITLE.create(pft, {
      transaction: t,
    });
    return addPFT;
  } catch (error) {
    console.log("Cannot add program from db", error);
  }
}

async function edit(existPFT, editPFT, t) {
  try {
    const editProFT = await existPFT.update(editPFT, { transaction: t });
    return editProFT;
  } catch (error) {
    console.log("Cannot edit program from db", error);
  }
}

async function deletePFT(existPFT, t) {
  try {
    const deleteFac = await existPFT.destroy({ transaction: t });
    return deleteFac;
  } catch (error) {
    console.log("Cannot delete program from db", error);
  }
}

async function search(query) {
  try {
    const queryHelper = new QueryHelper(query, {
      PROGRAM_FIELD_TITLE: ["field_code", "status"],
      PROGRAM: ["program_code"],
    }).filter();
    const pftSearch = await PROGRAM_FIELD_TITLE.findAll({
      where: queryHelper.whereMap.PROGRAM_FIELD_TITLE || {},
      include: [
        {
          model: PROGRAM,
          where: queryHelper.whereMap.PROGRAM || {},
          required: true,
          attributes: [],
        },
      ],
      order: [["field_code", "ASC"]],
    });

    return pftSearch;
  } catch (error) {
    console.log("Database can not search the data", error);
    throw error;
  }
}

module.exports = {
  listAll,
  getByID,
  getByProg,
  add,
  edit,
  deletePFT,
  search,
  getColumn,
  getUIControls,
};
