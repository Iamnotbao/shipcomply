import axios from "axios";
const API = "/users_permission_department";
export const fetchUPD = async () => {
  const response = await axios.get(`${API}/all`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  return response ? response.data : "";
};
export const fetchUPDByID = async (factory_code, department_code, user_code) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    }
  );
  return response ? response.data : "";
};
export const fetchUPDByUser = async (user_code) => {
  const response = await axios.get(
    `${API}/user?user_code=${user_code}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    }
  );
  return response ? response.data : "";
};
export const addUPD = async (data) => {
  
  const response = await axios.post(
    `${API}`,
    { data: data },
    // {
    //   headers: {
    //     authorization: `Bearer ${token}`,
    //   },
    // }
  );
  return response.data ? response.data : {};
};
export const editUPD = async ( data) => {
  console.log("data", data);

  const response = await axios.put(
    `${API}/edit`,
    { data: data },
    // {
    //   headers: {
    //     authorization: `Bearer ${token}`,
    //   },
    // }
  );
  return response.data ? response.data : {};
};
export const deleteUPD = async (token, data) => {
  const response = await axios.delete(
    `${API}?program_code=${data.program_code}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return response ? response.data : "";
};
export const deleteAllUPD = async (users, token) => {
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
export const searchUPDByFilter = async (filtered, token) => {
  try {
    const response = await axios.post(`${API}/search`, filtered, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const exportPDFUPD = async () => {
  try {
    const response = await axios.get(`${API}/pdf`, {
      // headers: {
      //   authorization: `Bearer ${token}`,
      // },
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "user_permission_department.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log("Download PDf failed", error);
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
