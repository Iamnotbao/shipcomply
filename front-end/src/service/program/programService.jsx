import axios from "axios";
const API = "/program";
export const fetchPrograms = async (token) => {
  const response = await axios.get(`${API}/all`, {
    headers: {
      authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  return response ? response.data : "";
};
export const addPrograms = async (token, data) => {
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
export const editPrograms = async (token, data) => {

  const response = await axios.put(
    `${API}/edit?program_code=${data.program_code}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data ? response.data : {};
};
export const deletePrograms = async (token, data) => {
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
export const deleteAllPrograms = async (users, token) => {
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
export const searchProgramsByFilter = async (filtered, token) => {
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
export const exportPDFPrograms = async () => {
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
