import axios from "axios";
const API = "/ac_cont_d";
export const fetchAllAcContD = async (
  factory_code,
  department_code,
  user_code,
  query_level,
) => {
  const response = await axios.get(
    `${API}/all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data?.rows : "";
};
export const fetchAcContDByID = async (token, factory_code, cont_no, seq) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&cont_no=${cont_no}&seq=${seq}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchFieldWithFunction = async (
  factory_code,
  ac_itemno,
  department_code,
  user_code,
  query_level,
  field,
  type='1'
) => {
  const response = await axios.get(
    `${API}/field_with_function?factory_code=${factory_code}&ac_itemno=${ac_itemno}&type=${type}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&field=${field}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchAllAcContDWithView = async (
  token,
  cont_no,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/list_of_ac_cont_d?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&cont_no=${cont_no}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchGoodsCodeListDropdown = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  page,
  limit,
  search,
  isStatus = true,
  isExport = false
) => {
  const response = await axios.get(
    `${API}/goods_code?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&page=${page}&limit=${limit}&search=${search}&is_status=${isStatus}&is_export=${isExport}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchGoodsCodeListDropdownWithFunc = async (
  token,
  factory_code,
  cont_no,
  department_code,
  user_code,
  query_level,
  language,
  page,
  limit,
  search,
  mark = "A"
) => {
  const response = await axios.get(
    `${API}/goods_code_with_func?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&cont_no=${cont_no}&language=${language}&page=${page}&limit=${limit}&search=${search}&mark=${mark}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchContPrice = async (
  token,
  factory_code,
  min_cont,
  item_acno,
  department_code,
  user_code,
  query_level,
  page,
  limit,
  search,
) => {
  const response = await axios.get(
    `${API}/cont_price?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&min_cont=${min_cont}&item_acno=${item_acno}&page=${page}&limit=${limit}&search=${search}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const getSum = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  cont_no,
) => {
  const response = await axios.get(
    `${API}/sum?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&field=${field}&cont_no=${cont_no}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchUnitByGoodsCodeDropdown = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  goods_code,
  page,
  limit,
  search,
  isStatus = true,
  isExport = false
) => {
  const response = await axios.get(
    `${API}/unit_by_goods_code?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&goods_code=${goods_code}&page=${page}&limit=${limit}&search=${search}&is_status=${isStatus}&is_export=${isExport}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const addAcContD = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
) => {
  const response = await axios.post(
    `${API}?page_size=${pageSize}&factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const editAcContD = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&cont_no=${data.cont_no}&seq=${data.seq}&page_size=${pageSize}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const deleteABomM = async (token, data) => {
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
export const deleteAcContD = async (factory_code, cont_no, seq) => {
  try {
    const response = await axios.delete(
      `${API}?factory_code=${factory_code}&cont_no=${cont_no}&seq=${seq}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return response.data ? response.data : [];
  } catch (error) {
    console.log("The error was in delete", error);
  }
};
export const searchVwAcContImpByFilter = async (
  filtered,
  factory_code,
  department_code,
  user_code,
  query_level,
) => {
  try {
    const response = await axios.post(
      `${API}/search?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
      filtered,
    );
    return response ? response.data?.rows : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const exportExcelVwContImp = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  filters,
) => {
  try {
    const response = await axios.post(
      `${API}/excel?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
      { filters: filters },
      {
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "vw_cont_imp.xlsx");
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
