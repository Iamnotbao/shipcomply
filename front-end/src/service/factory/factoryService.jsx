import axios from "axios";
const API = "/factory";
export const fetchFactory = async (
  limit = null,
  offset = null,
  search = "",
) => {
  const params = {};
  if (limit !== null) {
    params.limit = limit;
  }
  if (offset !== null) {
    params.offset = offset;
  }
  if (typeof search === "string" && search.trim() !== "") {
    params.search = search.trim();
  }
  const response = await axios.get(`${API}/all`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
    params,
  });
  return response ? response.data : "";
};

export const fetchFactoryByID = async (factory_code) => {
  const response = await axios.get(`${API}?factory_code=${factory_code}`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  return response ? response.data : "";
};
export const addFactories = async (token, data,pageSize) => {
  const params = {};
  params.pageSize = pageSize
  const response = await axios.post(
    `${API}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
    params
  );
  return response.data ? response.data : {};
};
export const editFactories = async (token, data) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${data.factory_code}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const deleteFactory = async (token, data) => {
  const response = await axios.delete(
    `${API}?factory_code=${data.factory_code}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response ? response.data : "";
};
export const deleteAllFactory = async (users, token) => {
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
export const searchFactoryByFilter = async (filtered, token, limit = null, offset = null) => {
  try {
    const params = {};
    if (limit !== null)  params.limit  = limit;
    if (offset !== null) params.offset = offset;

    const response = await axios.post(`${API}/search`, filtered, {
      headers: { authorization: `Bearer ${token}` },
      params,
    });
    return response?.data ?? [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const exportPDFFactories = async () => {
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
    link.setAttribute("download", "factories.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log("Download PDf failed", error);
  }
};
export const fetchFactoryDropdown = async (
  factory_code,
  field,
  language,
  page,
  limit,
  search,
  isStatus,
) => {
  const response = await axios.get(
    `${API}/field_dropdown?factory_code=${factory_code}&field=${field}&language=${language}&page=${page}&limit=${limit}&search=${search}&is_status=${isStatus}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
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
