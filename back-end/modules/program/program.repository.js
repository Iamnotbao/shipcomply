const QueryHelper = require("../../utils/queryHelper");
const PROGRAM = require("./program.model");

async function listAll() {
  return await PROGRAM.findAll({
    order: [["program_code", "ASC"]],
  });
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
async function add(program, t) {
  try {
    const addProgram = await PROGRAM.create(program, {
      transaction: t,
    });
    return addProgram;
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
async function search(keyword) {
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
    const facSearch = await PROGRAM.findAll({
      where: queryHelper.whereMap.PROGRAM || {},
      order: [["program_code", "ASC"]],
    });
    return facSearch;
  } catch (error) {
    console.log("Database can not search the data", error);
  }
}
module.exports = { listAll, getByID, add, edit, deleteProg, search };
