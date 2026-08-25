import axios from "axios";
const API = "/se_shipping_m";
export const fetchAllShippingM = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchSeShippingMByID = async (factory_code, cust_id, si_seq) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&cust_id=${cust_id}&si_seq=${si_seq}`,
  );
  return response.data ? response.data : {};
};
export const confirmAll = async (factory_code,cust_id, si_seq,user_code,department_code,query_level) => {
  const response = await axios.get(
    `${API}/confirm_all?factory_code=${factory_code}&cust_id=${cust_id}&si_seq=${si_seq}&user_code=${user_code}&department_code=${department_code}&query_level=${query_level}`,
  );
  return response.data ? response.data : {};
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
export const addSeShippingM = async (
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
export const editSeShhippingM = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&cust_id=${data.cust_id}&si_seq=${data.si_seq}&page_size=${pageSize}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const searchSeShippingMByFilter = async (
  filtered,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  try {
    const response = await axios.post(
      `${API}/search?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&limit=${limit}&offset=${offset}`,
      filtered,
    );
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const exportPDF = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  search
) => {
  try {
    const response = await axios.post(
      `${API}/excel?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
      {search},{
        headers: {
          authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "se_shiping_m.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data ? response.data : "";
  } catch (error) {
    console.log("Error when export PDF", error);
  }
};
export const getSiSeq = async (
  factory_code,
  cust_id,
  department_code,
  user_code,
  query_level,
  language,
) => {
  const response = await axios.get(
    `${API}/si_seq?factory_code=${factory_code}&cust_id=${cust_id}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
