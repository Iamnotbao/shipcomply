import axios from "axios";
const API = "/plan_ord";

export const fetchAllPlanOrd = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/plan_date?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};

export const searchPlanOrdFilter = async (
  filtered,
  token,
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
      `${API}/search_plan_date?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&limit=${limit}&offset=${offset}`,
      filtered,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const checkBox = async (
  token,
  ac_no,
  se_id,
  se_seq,
  ship_seq,
  se_ver,
  pack_gu,
  is_check,
  filters = {},
  factory_code,
  isAll = false,
) => {
  try {
    const response = await axios.post(
      `${API}/checkbox?ac_no=${ac_no}&se_id=${se_id}&se_seq=${se_seq}&ship_seq=${ship_seq}&se_ver=${se_ver}&pack_gu=${pack_gu}&is_check=${is_check}&factory_code=${factory_code}`,
      { filters: filters, isAll: isAll },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const confirmAllPD = async (
  token,
  factory_code,
  ac_no,
  language,
  cont_no,
  status1,
) => {
  try {
    const response = await axios.get(
      `${API}/confirm_all?factory_code=${factory_code}&ac_no=${ac_no}&language=${language}&cont_no=${cont_no}&status1=${status1}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    return response ? response.data : [];
  } catch (error) {
    throw error?.response?.data;
  }
};
export const getTempTable = async (token) => {
  try {
    const response = await axios.get(`${API}/temp_table`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const clearTempTable = async (token) => {
  try {
    const response = await axios.get(`${API}/clear_temp_table`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const deletePlanOrd = async (
      factory_code,
      ac_no,
      se_id,
      se_seq,
      ship_seq,
      se_ver,
      pack_gu,
      status1,
      language,
      resetCol7Value,
) => {
  const response = await axios.delete(
    `${API}?factory_code=${factory_code}&se_id=${se_id}&se_ver=${se_ver}&se_seq=${se_seq}&pack_gu=${pack_gu}&ship_seq=${ship_seq}&ac_no=${ac_no}&status1=${status1}&language=${language}&resetCol7Value=${resetCol7Value} `,
    {
    },
  );
  return response.data ? response.data : {};
};