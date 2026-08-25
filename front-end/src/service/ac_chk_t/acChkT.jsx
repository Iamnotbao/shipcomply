import axios from "axios";
const API = "/ac_chk_t";
export const fetchAllAcChkT = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  conf_seq,
  matd_seq,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/matd_seq?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&conf_seq=${conf_seq}&matd_seq=${matd_seq}&language=${language}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
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
export const fetchACTByID = async (
  factory_code,
  conf_seq,
  matd_seq,
  issue_seq,
) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&conf_seq=${conf_seq}&matd_seq=${matd_seq}&issue_seq=${issue_seq}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const deleteACT = async (
  factory_code,
  conf_seq,
  matd_seq,
  issue_seq,
) => {
  const response = await axios.delete(
    `${API}/delete?factory_code=${factory_code}&conf_seq=${conf_seq}&matd_seq=${matd_seq}&issue_seq=${issue_seq}`,
  );
  return response.data ? response.data : {};
};
export const addACT = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
) => {
  const response = await axios.post(
    `${API}?factory_code=${factory_code}&department=${department_code}&user_code=${user_code}&query_level=${query_level}&page_size=${pageSize}`,
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
export const editACT = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&conf_seq=${data.conf_seq}&matd_seq=${data.matd_seq}&issue_seq=${data.issue_seq}&page_size=${pageSize}`,
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
