import axios from "axios";
const API = "/sd_ord_m_c";
export const fetchFieldDropdown = async (
  factory_code,
  field,
  language,
  page,
  limit,
  search,
  extraField = "",
  isStatus = true,
) => {
  const response = await axios.get(
    `${API}/dropdown_field?factory_code=${factory_code}&field=${field}&language=${language}&page=${page}&limit=${limit}&search=${search}&extraField=${extraField}&is_status=${isStatus}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchPackingSeidDropdown = async (
  factory_code,
  page,
  limit,
  search,
) => {
  const response = await axios.get(
    `${API}/packing_seid?factory_code=${factory_code}&page=${page}&limit=${limit}&search=${search}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const checkBox = async (
  token,
  se_id,
  se_seq,
  pack_gu,
  pack_status,
  is_check,
  filters = {},
  isAll = false,
  factory_code,
) => {
  const response = await axios.post(
    `${API}/check?se_id=${se_id}&se_seq=${se_seq}&pack_gu=${pack_gu}&pack_status=${pack_status}&is_check=${is_check}&factory_code=${factory_code}`,
    { filters: filters, isAll: isAll },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchAllSOMC = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&offset=${offset}&limit=${limit}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const searchSOMCByFilter = async (
  search,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  const response = await axios.post(
    `${API}/search?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&limit=${limit}&offset=${offset}`,
    search,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const getSysTree = async (token, limit, offset) => {
  const response = await axios.get(
    `${API}/sys_tree?limit=${limit}&offset=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const clearSysTree = async (token) => {
  const response = await axios.get(`${API}/clear_sys_tree`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  return response ? response.data : "";
};
export const createPlan = async (
  token, factory_code, user_code, department_code, plan_date, last_user,
) => {
  try {
    const response = await axios.get(
      `${API}/create_plan?factory_code=${factory_code}&user_code=${user_code}&department_code=${department_code}&plan_date=${plan_date}&last_user=${last_user}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return response?.data;
  } catch (error) {
    const err = error?.response?.data;
    if (error?.response?.status === 409) {
      throw { ...err, isDuplicate: true };
    }
    throw err;
  }
};
export const updatePDD = async (search, factory_code, user_code) => {
  const response = await axios.post(
    `${API}/update_pdd?factory_code=${factory_code}&user_code=${user_code}`,
    search,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
