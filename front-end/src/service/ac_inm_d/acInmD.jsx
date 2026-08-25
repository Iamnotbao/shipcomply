import axios from "axios";
const API = "/ac_inm_d";
export const fetchAllInmD = async (
  token,
  inm_no,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&inm_no=${inm_no}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchAcInmDByID = async (token, factory_code, inm_no, seq) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&inm_no=${inm_no}&seq=${seq}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
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
    },
  );
  return response ? response.data : "";
};
export const fetchBasicDataByCate = async (
  factory_code,
  category_code,
  department_code,
  user_code,
  query_level,
) => {
  const response = await axios.get(
    `${API}/category?factory_code=${factory_code}&category_code=${category_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchAllConfirmedAll = async (
  factory_code,
  inm_no,
  department_code,
  user_code,
  query_level,
  listAcItemRefs = [],
) => {
  const response = await axios.post(
    `${API}/confirmed?factory_code=${factory_code}&inm_no=${inm_no}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      data: listAcItemRefs,
    },
  );
  return response ? response.data : "";
};
export const fetchItemNoList = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  page,
  limit,
  search,
  isStatus = true
) => {
  const response = await axios.get(
    `${API}/item_no?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&page=${page}&limit=${limit}&search=${search}&is_status=${isStatus}`,
    {
      headers: {
        authourization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchUnitListByItemNo = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  item_no,
  page,
  limit,
  search,
  isStatus = true
) => {
  const response = await axios.get(
    `${API}/unit?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&item_no=${item_no}&page=${page}&limit=${limit}&search=${search}&is_status=${isStatus}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchAllConfirmedBasicData = async (
  factory_code,
  category_code,
  department_code,
  user_code,
  query_level,
  listBasicData = [],
) => {
  const response = await axios.post(
    `${API}/confirmed?factory_code=${factory_code}&category_code=${category_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      data: listBasicData,
    },
  );
  return response ? response.data : "";
};
export const addAcInmD = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
) => {
  const response = await axios.post(
    `${API}?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&page_size=${pageSize}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const editAcInmD = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&inm_no=${data.inm_no}&seq=${data.seq}&page_size=${pageSize}`,
    { data: data },
    {
      authorization: `Bearer ${token}`,
    },
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
    },
  );
  return response ? response.data : "";
};
export const deleteAcContD = async (factory_code, inm_no, seq) => {
  try {
    const response = await axios.delete(
      `${API}?factory_code=${factory_code}&inm_no=${inm_no}&seq=${seq}`,
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
export const searchAcInmMByFilter = async (
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
