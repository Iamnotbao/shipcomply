 const { generatePDF } = require("../../utils/pdf");
const programReposity = require("./program.repository");

async function getAllProgram(limit,offset) {
  return await programReposity.listAll(limit,offset);
}
async function getProgramByID(program_code) {
  return await programReposity.getByID(program_code);
}
async function addProgram(program,pageSize, t) {
  try {
    const existProgram = await getProgramByID(program.program_code);
    if (existProgram) {
      const  message = "program is already exist and program_code cannot be duplicate or the same !";
      return {message};
    }
    const result = await programReposity.add(program,pageSize, t);
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("error from program service: ", error);
  }
}
async function editProgram(program_code, program, t) {
  try {
    const existProgram = await getProgramByID(program_code);
    if (!existProgram) {
      console.log("program is not exist !");
      return null;
    }
    const result = await programReposity.edit(existProgram, program, t);
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("cannot edit from program service", error);
  }
}
async function deleteProgram(program_code, t) {
  try {
    const existProgram = await getProgramByID(program_code);
    if (!existProgram) {
      console.log("program is not exist !");
      return null;
    }
    const result = await programReposity.deleteProg(existProgram, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchProgram(keyword,limit, offset) {
  try {
    const programFound = await programReposity.search(keyword,limit, offset);
    return programFound;
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFPrograms(filename) {
  const data = await getAllProgram();
  const plainProgram = data.map((d)=> d.get({plain:true}))
  await generatePDF(plainProgram, filename,"PROGRAMS");
  return filename;
}
module.exports = {
  getAllProgram,
  getProgramByID,
  addProgram,
  editProgram,
  deleteProgram,
  searchProgram,
  exportPDFPrograms,
};

 
 