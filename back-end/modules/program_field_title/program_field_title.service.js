 const { generatePDF } = require("../../utils/pdf");
const programFieldTitleReposity = require("./program_field_title.repository");

async function getAllPFT() {
  return await programFieldTitleReposity.listAll();
}
async function getColumnName(table_name,language,table_type,relationship_name,specific_detail_table) {
  return await programFieldTitleReposity.getColumn(table_name,language,table_type,relationship_name,specific_detail_table);
}
async function getUIControlName(table_name,language) {
  return await programFieldTitleReposity.getUIControls(table_name,language);
}
async function getPFTByID(program_code,field_code) {
  return await programFieldTitleReposity.getByID(program_code,field_code);
}
async function getPFTByProgram(program_code) {
   try {
      const program = await programFieldTitleReposity.getByProg(program_code);
      return program;
    } catch (error) {
      console.log(error);
    }
}
async function addPFT(pft, t) {
  try {
    const existPFT = await getPFTByID(pft.program_code,pft.field_code);
    if (existPFT) {
      const  message = "program is already exist and program_code cannot be duplicate or the same !";
      return {message};
    }
    const result = await programFieldTitleReposity.add(pft, t);
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("error from program service: ", error);
  }
}
async function editPFT(program_code,field_code, pft, t) {
  try {
    const existPFT = await getPFTByID(program_code,field_code);
    if (!existPFT) {
      console.log("program is not exist !");
      return null;
    }
    const result = await programFieldTitleReposity.edit(existPFT, pft, t);
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("cannot edit from program service", error);
  }
}
async function deletePFT(program_code,field_code, t) {
  try {
    const existPFT = await getPFTByID(program_code,field_code);
    if (!existPFT) {
      console.log("program is not exist !");
      return null;
    }
    const result = await programFieldTitleReposity.deletePFT(existPFT, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchPFT(keyword) {
  try {
    const programFound = await programFieldTitleReposity.search(keyword);
    return programFound;
  } catch (error) {
    console.log(error);
  }
}


async function exportPFT(filename) {
  const data = await getAllPFT();
  const plainProgram = data.map((d)=> d.get({plain:true}))
  await generatePDF(plainProgram, filename,"PROGRAMS");
  return filename;
}
module.exports = {
   getAllPFT,
  getPFTByID,
  getPFTByProgram,
  addPFT,
  editPFT,
  deletePFT,
  searchPFT,
  exportPFT,
  getColumnName,
  getUIControlName
};

 
 