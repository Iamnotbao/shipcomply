import axios from "axios";
const API = "/ac_issue_matd_t";
export const fetchAllAcIssueMatdT = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  conf_seq,
  matd_no,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/conf_seq?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&conf_seq=${conf_seq}&matd_no=${matd_no}&language=${language}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const confirmAll = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  conf_seq,
  matd_seq,
) => {
  try {
    const response = await axios.get(
      `${API}/confirm_all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&conf_seq=${conf_seq}&matd_seq=${matd_seq}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return response ? response?.data : "";
  } catch (error) {
    throw error?.response?.data;
  }
};
export const fetchAllAIMTByAcno = async (
  factory_code,
  ac_no,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/ac_no?factory_code=${factory_code}&ac_no=${ac_no}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&limit=${limit}&offset=${offset}&language=${language}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchAcIssueMatdTByID = async (
  factory_code,
  conf_seq,
  matd_seq,
) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&conf_seq=${conf_seq}&matd_seq=${matd_seq}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const addAIMT = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
  mark = "A",
) => {
  const response = await axios.post(
    `${API}?factory_code=${factory_code}&department=${department_code}&user_code=${user_code}&query_level=${query_level}&page_size=${pageSize}&mark=${mark}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const autoAddAIMT = async (
  token,
  factory_code,
  department_code,
  user_code,
  ac_no,
) => {
  try {
    const response = await axios.get(
      `${API}/auto_add?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&ac_no=${ac_no}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data ? response.data : {};
  } catch (error) {
    throw error?.response?.data;
  }
};
export const editAIMT = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&conf_seq=${data?.conf_seq}&matd_seq=${data?.matd_seq}&page_size=${pageSize}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const searchAIMTByFilter = async (
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
