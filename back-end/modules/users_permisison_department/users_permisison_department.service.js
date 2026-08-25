 const { generatePDF } = require("../../utils/pdf");
const userPDReposity = require("./users_permisison_department.repository");
const programService = require("../program/program.service");

async function getAllUserPD() {
  return await userPDReposity.listAll();
}
async function getUserPDByID(factory_code,department_code,user_code) {
  return await userPDReposity.getByID(factory_code,department_code,user_code);
}
async function getUserPDByUser(user_code) {
  return await userPDReposity.getByUser(user_code);
}
async function addUserPD(userPerDept, t) {
  try {
    const existUPD = await getUserPDByID(userPerDept.factory_code,userPerDept.department_code,userPerDept.user_code);
    console.log("exist udp",existUPD);
    
    if (existUPD) {
      const  message = "user permission departments is already exist and code cannot be duplicate or the same !";
      return {message};
    }
    const result = await userPDReposity.add(userPerDept, t);
    if (!result) {
      console.log("Cannot add because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("error from program service: ", error);
  }
}
async function editUserPD(userPerDept, t) {
  try {
    const existUPD = await getUserPDByID(userPerDept.factory_code,userPerDept.department_code,userPerDept.user_code);
    if (!existUPD) {
      console.log("program is not exist !");
      return null;
    }
    const result = await userPDReposity.edit(existUPD, userPerDept, t);
    if (!result) {
      console.log("Cannot edit because data from db is null");
      return null;
    }
    return result;
  } catch (error) {
    console.log("cannot edit from program service", error);
  }
}
async function deleteUserPD(factory_code,department_code,user_code, t) {
  try {
    const existProgram = await getUserPDByID(factory_code,department_code,user_code);
    if (!existProgram) {
      console.log("program is not exist !");
      return null;
    }
    const result = await userPDReposity.deleteUPD(existProgram, t);
    if (!result) {
      console.log("Cannot delete because data from db is null!");
      return null;
    }
    return result;
  } catch (error) {
    console.log("Cannot delete", error);
  }
}
async function searchUserPD(keyword) {
  try {
    const programFound = await userPDReposity.search(keyword);
    return programFound;
  } catch (error) {
    console.log(error);
  }
}
async function exportPDFUserPD(filename) {
  const data = await getAllUserPD();
  const plainProgram = data.map((d)=> d.get({plain:true}))
  await generatePDF(plainProgram, filename,"USER_PERMISSION_DEPARTMENT");
  return filename;
}
module.exports = {
  getAllUserPD,
  getUserPDByID,
  getUserPDByUser,
  addUserPD,
  editUserPD,
  deleteUserPD,
  searchUserPD,
  exportPDFUserPD,
};

 
 