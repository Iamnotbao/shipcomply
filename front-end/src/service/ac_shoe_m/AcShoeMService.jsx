import axios from "axios";
const API = "/ac_shoe_m";
export const fetchAllAcShoeM = async (
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
export const fetchAcItemno = async (
  factory_code,
  language,
  page,
  limit,
  search,
  isStatus = true,
) => {
  const response = await axios.get(
    `${API}/ac_itemno_dropdown?factory_code=${factory_code}&language=${language}&page=${page}&limit=${limit}&search=${search}&is_status=${isStatus}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchShoeDropdown = async (
  factory_code,
  language,
  page,
  limit,
  search,
) => {
  const response = await axios.get(
    `${API}/shoe_dropdown?factory_code=${factory_code}&language=${language}&page=${page}&limit=${limit}&search=${search}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchAllAcShoeMByID = async (factory_code, customs_shoe_id) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&customs_shoe_id=${customs_shoe_id}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const getAcShoeMBySize = async (
  factory_code,
  department_code,
  user_code,
  query_level,
) => {
  const response = await axios.get(
    `${API}/size?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const linktoBom = async (
  factory_code,
  customs_shoe_id,
  ac_code = null,
  prod_no,
  department_code,
  user_code,
  query_level,
  ip,
  datetime,
) => {
  const response = await axios.get(
    `${API}/link_bom?factory_code=${factory_code}&customs_shoe_id=${customs_shoe_id}&ac_code=${ac_code}&prod_no=${prod_no}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&ip=${ip}&date_time=${datetime}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const addAcShoeM = async (
  token,
  data,
  pageSize,
  factory_code,
  department_code,
  user_code,
  query_level,
) => {
  const response = await axios.post(
    `${API}?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&page_size=${pageSize}&`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const editAcShoeM = async (
  data,
  pageSize,
  factory_code,
  department_code,
  user_code,
  query_level,
) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${data.factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&customs_shoe_id=${data.customs_shoe_id}&page_size=${pageSize}`,
    { data: data },
  );
  return response.data ? response.data : {};
};
export const deleteIMT = async (token, data) => {
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
export const searchASMByFilter = async (
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
export const exportExcelASM = async (
  factory_code,
  department_code,
  user_code,
  query_level,
) => {
  try {
    const response = await axios.get(
      `${API}/excel?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
      {
        // headers: {
        //   authorization: `Bearer ${token}`,
        // },
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ac_shoe_m.xlsx");
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
export const importExcel = async (
  token,
  factory_code,
  user_code,
  department_code,
  query_level,
  formData,
) => {
  const response = await axios.post(
    `${API}/import?factory_code=${factory_code}&user_code=${user_code}&department_code=${department_code}&query_level=${query_level}`,
    formData,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response ? response.data : "";
};
