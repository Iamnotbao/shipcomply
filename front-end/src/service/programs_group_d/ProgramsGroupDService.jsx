import axios from "axios";
const API = "/programs_group_d";
export const fetchProgramsGroupD = async () => {
  const response = await axios.get(`${API}/all`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  return response ? response.data : "";
};
export const fetchAcItemRefByID = async (
  factory_code,
  item_acno,
  item_no
) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&item_acno=${item_acno}&item_no=${item_no}`
  );
  return response.data ? response.data : {};
};
export const fetchAcItemRefByItemNo = async (
  item_no
) => {
  const response = await axios.get(
    `${API}/item?item_no=${item_no}`
  );
  return response.data ? response.data : {};
};
export const fetchDepartmentByFac = async (factory_code) => {
  const response = await axios.get(
    `${API}/factory?factory_code=${factory_code}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    }
  );
  return response ? response.data : "";
};
export const fetchDataByItemAcno = async (factory_code,item_acno,department_code,
    user_code,
    query_level,) => {
      console.log("check buggg");
      
  const response = await axios.get(
    `${API}/itemAcno?factory_code=${factory_code}&item_acno=${item_acno}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    }
  );
  return response ? response.data : "";
};
export const addAcItemRef = async (data) => {
  const response = await axios.post(
    `${API}`,
    { data: data },
  );
  return response.data ? response.data : {};
};
export const editAcItemRef = async (data) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${data.factory_code}&item_acno=${data.item_acno}&item_no=${data.item_no}`,
    { data: data },
  );
  return response.data ? response.data : {};
};
export const deleteDepartment = async (token, data) => {
  const response = await axios.delete(
    `${API}?factory_code=${data.factory_code}&department_code=${data.department_code}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return response ? response.data : "";
};
export const deleteAllDepartment = async (users, token) => {
  try {
    const response = await axios.delete(`${API}/delete-all`, {
      data: users,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return response.data ? response.data : [];
  } catch (error) {
    console.log("The error was in delete", error);
  }
};
export const searchAcItemRefByFilter = async (filtered,factory_code,department_code,user_code,query_level) => {
  try {
    const response = await axios.post(`${API}/search?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`, filtered);
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const exportPDFBasicData = async (token) => {
  try {
    const response = await axios.get(`${API}/pdf`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "basic_data.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data ? response.data : "";
  } catch (error) {
    console.log("Error when export PDF", error);
  }
};
// export const importExcelUser = async (token, form) => {
//   try {
//     console.log("pass f", form.get("file"));

//     const repspone = await axios.post(`${API}/import`, form, {
//       headers: {
//         authorization: `Bearer ${token}`,
//       },
//     });
//     console.log("check after import :", repspone);
//     return repspone.data;
//   } catch (error) {
//     console.log(error);
//   }
// };
// export const exportExcelUser = async (token) => {
//   try {
//     const response = await axios.get(`${API}/excel`, {
//       headers: {
//         authorization: `Bearer ${token}`,
//       },
//       responseType: "blob",
//     });
//     const url = window.URL.createObjectURL(new Blob([response.data]));
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", "user.xlsx");
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//     return response ? response.data : [];
//   } catch (error) {
//     console.log("The error was in exportExcelUser", error);
//   }
// };
