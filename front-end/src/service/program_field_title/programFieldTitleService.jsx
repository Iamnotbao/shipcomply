import axios from "axios";
const API ="/program_field_title";
export const getColumnProgramsFieldTitle = async (tableName,language,tableType,relationship,specific_detail_table) => {
  const response = await axios.get(`${API}/column?table_name=${tableName}&language=${language}&table_type=${tableType}&relationship_name=${relationship}&specific_detail_table=${specific_detail_table}`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  return response ? response.data : "";
};
export const getControlUIProgramsFieldTitle = async (tableName,language) => {
  const response = await axios.get(`${API}/control?table_name=${tableName}&language=${language}`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  return response ? response.data : "";
};
export const fetchProgramFieldTitle = async () => {
  const response = await axios.get(`${API}/all`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  return response ? response.data : "";
};
export const fetchProgramFieldTitleByID = async (program_code, field_code) => {
  const response = await axios.get(
    `${API}?program_code=${program_code}&field_code=${field_code}`
  );
  return response.data ? response.data : {};
};
export const fetchProgramFieldTitleByProgram = async (program_code) => {
  const response = await axios.get(
    `${API}/program?program_code=${program_code}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    }
  );
  return response ? response.data : "";
};
export const addProgramFieldTitle  = async (token, data) => {
  const response = await axios.post(
    `${API}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data ? response.data : {};
};
export const editProgramFieldTitle= async (token, data) => {

  const response = await axios.put(
    `${API}/edit?program_code=${data.program_code}&field_code=${data.field_code}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data ? response.data : {};
};
export const deleteProgramFieldTitle = async (token, data) => {
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
export const deleteAllProgramFieldTitle = async (users, token) => {
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
export const searchProgramFieldTitleByFilter = async (filtered, token) => {
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
export const exportPDFProgramFieldTitle = async () => {
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
    link.setAttribute("download", "programs.pdf");
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
