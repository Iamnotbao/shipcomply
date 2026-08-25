import axios from "axios";
const API = "/se_sales_d";
export const fetchAllSeSalesD = async (
    factory_code,
    department_code,
    user_code,
    query_level,
    sales_id,
    language,
    limit,
    offset,
) => {
  const response = await axios.get(
    `${API}/all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&sales_id=${sales_id}&language=${language}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchSalesDByID = async (
  token,
  factory_code,
  sales_id,
  sales_seq
) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&sales_id=${sales_id}&sales_seq=${sales_seq}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response.data ? response.data : {};
};

export const addSeSalesD = async (
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
export const editSeSalesD = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&cust_id=${data.cust_id}&si_seq=${data.si_seq}&si_type=${data.si_type}&page_size=${pageSize}`,
    { data: data },
    {
      authorization: `Bearer ${token}`,
    },
  );
  return response.data ? response.data : {};
};
export const searchSeShippingDByFilter = async (
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
