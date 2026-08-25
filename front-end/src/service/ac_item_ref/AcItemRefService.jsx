import axios from "axios";
const API = "/ac_item_ref";
export const fetchBasicData = async () => {
  const response = await axios.get(`${API}/all`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  return response ? response.data : "";
};
export const fetchAllConfirmedAcItemRefs = async (
  factory_code,
  item_acno,
  department_code,
  user_code,
  query_level,
  listAcItemRefs = [],
) => {
  const response = await axios.post(
    `${API}/confirmed?factory_code=${factory_code}&item_acno=${item_acno}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      data: listAcItemRefs,
    },
  );
  return response ? response.data : "";
};
export const fetchAcItemRefByID = async (factory_code, item_acno, item_no) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&item_acno=${item_acno}&item_no=${item_no}`,
  );
  return response.data ? response.data : {};
};
export const fetchAcItemRefByItemNo = async (item_no) => {
  const response = await axios.get(`${API}/item?item_no=${item_no}`);
  return response.data ? response.data : {};
};
export const fetchListAcItemRefByItemNo = async (item_no) => {
  const response = await axios.get(`${API}/list_item_no?item_no=${item_no}`);
  return response.data ? response.data : {};
};
export const fetchDepartmentByFac = async (factory_code) => {
  const response = await axios.get(
    `${API}/factory?factory_code=${factory_code}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchDataByItemAcno = async (
  factory_code,
  item_acno,
  department_code,
  user_code,
  query_level,
  limit,
  offset,
) => {

  const response = await axios.get(
    `${API}/itemAcno?factory_code=${factory_code}&item_acno=${item_acno}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const addAcItemRef = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  data,
  pageSize,
) => {
  const response = await axios.post(
    `${API}?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&page_size=${pageSize}`,
    {
      data: data,
    },
  );
  return response.data ? response.data : {};
};
export const editAcItemRef = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  data,
  pageSize,
) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&item_acno=${data.item_acno}&item_no=${data.item_no}&page_size=${pageSize}`,
    { data: data },
  );
  return response.data ? response.data : {};
};
export const deleteAcItemRef = async (factory_code, item_acno, item_no) => {
  const response = await axios.delete(
    `${API}?factory_code=${factory_code}&item_acno=${item_acno}&item_no=${item_no}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
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
export const searchAcItemRefByFilter = async (
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
