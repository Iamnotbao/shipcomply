import axios from "axios";
const API = "/ac_prod_m";
export const fetchAllAcProdM = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};

export const fetchAllAcProdMByID = async (
  factory_code,
  customs_shoe_id,
  prod_acno,
) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&customs_shoe_id=${customs_shoe_id}&prod_acno=${prod_acno}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchAllConfirmedAcProdM = async (
  factory_code,
  customs_shoe_id,
  department_code,
  user_code,
  query_level,
  listAcProdM = [],
) => {
  const response = await axios.post(
    `${API}/confirmed?factory_code=${factory_code}&customs_shoe_id=${customs_shoe_id}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      data: listAcProdM,
    },
  );
  return response ? response.data : "";
};

export const fetchAllAcProdMByShoe = async (
  factory_code,
  customs_shoe_id,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/shoe?factory_code=${factory_code}&customs_shoe_id=${customs_shoe_id}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const addAcProdM = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  data,
  pageSize,
) => {
  const response = await axios.post(
    `${API}?page_size=${pageSize}&factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      data: data,
    },
  );
  return response.data ? response.data : {};
};
export const editAcProdM = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  data,
  pageSize,
) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&customs_shoe_id=${data.customs_shoe_id}&prod_acno=${data.prod_acno}&page_size=${pageSize}`,
    { data: data },
  );
  return response.data ? response.data : {};
};
export const deleteAcProdM = async (token, data) => {
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
export const searchAPMByFilter = async (
  filtered,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) => {
  try {
    const response = await axios.post(
      `${API}/search?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&limit=${limit}&offset=${offset}`,
      filtered,
    );
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const exportPDFAPM = async () => {
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
    link.setAttribute("download", "ac_prod_m.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log("Download PDf failed", error);
  }
};

export const exportMaterialExcel = async (data) => {
  try {
    const response = await axios.post(`${API}/material-excel`, data, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "material.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in exportExcelUser", error);
  }
};
export const exportCustomExcel = async (data) => {
  try {
    const response = await axios.post(`${API}/custom-excel`, data, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "custom.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in exportExcelUser", error);
  }
};
export const fetchProdMDropdown = async (
  factory_code,
  language,
  page,
  limit,
  search,
) => {
  const response = await axios.get(
    `${API}/prod_m_dropdown?factory_code=${factory_code}&language=${language}&page=${page}&limit=${limit}&search=${search}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
