const QueryHelper = require("../../utils/queryHelper");
const PROGRAM = require("./program.model");

async function listAll(limit, offset) {
  const parsedLimit = !isNaN(parseInt(limit)) ? parseInt(limit) : null;
  const parsedOffset = !isNaN(parseInt(offset)) ? parseInt(offset) : null;

  const findOptions = {
    order: [["program_code", "ASC"]],
    raw: true,
  };
  if (parsedLimit !== null) {
    findOptions.limit = parsedLimit + 1;
    findOptions.offset = parsedOffset ?? 0;
  }
  const rows = await PROGRAM.findAll(findOptions);
  return {
    rows: parsedLimit !== null ? rows.slice(0, parsedLimit) : rows,
    count: rows.length,
    hasMore: parsedLimit !== null && rows.length === parsedLimit + 1,
  };
}
async function getByID(program_code) {
  const program = await PROGRAM.findOne({
    where: {
      program_code: program_code,
    },
  });
  if (!program) {
    console.log("No program founds!");
    return null;
  }
  return program;
}
async function getPosition(keys, pageSize, t) {
  try {
    const orderFields = Object.keys(keys);
    const orConditions = [];

    for (let i = 0; i < orderFields.length; i++) {
      const condition = {};
      for (let j = 0; j < i; j++) {
        condition[orderFields[j]] = keys[orderFields[j]];
      }
      condition[orderFields[i]] = { [Op.lt]: keys[orderFields[i]] };
      orConditions.push(condition);
    }

    const position = await PROGRAM.count({
      where: { [Op.or]: orConditions },
      transaction: t,
    });

    const size = parseInt(pageSize) || 10;
    const page = Math.floor(position / size);
    const offset = page * size;

    return { position, size, page, offset };
  } catch (error) {
    console.log("Cannot calculate position", error);
    throw error;
  }
}
async function add(program, pageSize, t) {
  try {
    const addProgram = await PROGRAM.create(program, {
      transaction: t,
    });

    const positionInfo = await getPosition(
      { program_code: addProgram.program_code },
      pageSize,
      t,
    );
    return { data: addProgram, ...positionInfo };
  } catch (error) {
    console.log("Cannot add program from db", error);
  }
}
async function edit(existProgram, editProgram, t) {
  try {
    const editP = await existProgram.update(editProgram, { transaction: t });
    return editP;
  } catch (error) {
    console.log("Cannot edit program from db", error);
  }
}
async function deleteProg(existProgram, t) {
  try {
    const deleteFac = await existProgram.destroy({ transaction: t });
    return deleteFac;
  } catch (error) {
    console.log("Cannot delete program from db", error);
  }
}
async function search(keyword, limit, offset) {
  try {
    const fields = [
      "program_code",
      "program_name_e",
      "program_name_l",
      "program_name_t",
      "status",
      "grt_dept",
      "grt_user",
      "grt_date",
      "last_user",
      "last_date",
    ];
    const queryHelper = new QueryHelper(keyword, {
      PROGRAM: fields,
    }).filter();
    const whereClause = queryHelper.whereMap.PROGRAM || {};
    const parsedLimit = !isNaN(parseInt(limit)) ? parseInt(limit) : null;
    const parsedOffset = !isNaN(parseInt(offset)) ? parseInt(offset) : null;
     const findOptions = {
      where: whereClause,
      order: [["program_code", "ASC"]],
    };
    if (parsedLimit !== null) {
      findOptions.limit = parsedLimit + 1;
      findOptions.offset = parsedOffset ?? 0;
    }

    const rows = await PROGRAM.findAll(findOptions);

    const hasMore = parsedLimit !== null && rows.length > parsedLimit;
    const actualRows = hasMore ? rows.slice(0, parsedLimit) : rows;

    let total = null;
    if (parsedOffset === 0 || parsedOffset === null) {
      total = await PROGRAM.count({ where: whereClause });
    }

    return {
      rows: actualRows,
      count: total,
      hasMore: hasMore,
    };
  } catch (error) {
    console.log("Database can not search the data", error);
  }
}
module.exports = { listAll, getByID, add, edit, deleteProg, search };
