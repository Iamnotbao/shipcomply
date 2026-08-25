import axios from "axios";
const API = "/ac_proc_d";
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
export const fetchAllAPDByAcno = async (
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
export const fetchAllAPDMarkBByAcno = async (
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
    `${API}/ac_no_mark_b?factory_code=${factory_code}&ac_no=${ac_no}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&limit=${limit}&offset=${offset}&language=${language}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const getSum = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  ac_no,
) => {
  const response = await axios.get(
    `${API}/sum?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&field=${field}&ac_no=${ac_no}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchFieldDropdown = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  ac_no,
  page,
  limit,
  search,
  isStatus = true
) => {
  const response = await axios.get(
    `${API}/dropdown_field?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&field=${field}&ac_no=${ac_no}&page=${page}&limit=${limit}&search=${search}&is_status=${isStatus}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
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
export const fetchAPDByID = async (factory_code, ac_no, seq) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&ac_no=${ac_no}&seq=${seq}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const addAcProcD = async (
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
export const autoAddAcProcD = async (
  token,
  factory_code,
  department_code,
  user_code,
  ac_no,
  language = "en",
) => {
  try {
    const response = await axios.get(
      `${API}/auto_add?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&ac_no=${ac_no}&language=${language}`,
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
export const autoAddAcProcDMarkB = async (
  token,
  factory_code,
  department_code,
  user_code,
  ac_no,
  language = "en",
) => {
  try {
    const response = await axios.get(
      `${API}/auto_add_mark_b?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&ac_no=${ac_no}&language=${language}`,
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
export const exChangeRateAcProcDMarkB = async (
  factory_code,
  ac_no,
  in_crate,
  language,
) => {
  try {
    const response = await axios.get(
      `${API}/exchange_rate?factory_code=${factory_code}&in_crate=${in_crate}&language=${language}&ac_no=${ac_no}`,
    );
    return response.data ? response.data : {};
  } catch (error) {
    console.log("adaddoa",error);
    
    throw error?.response?.data;
  }
};
export const editAcProcD = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
) => {
  try {
    const response = await axios.put(
      `${API}/edit?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&ac_no=${data.ac_no}&seq=${data.seq}&page_size=${pageSize}`,
      { data: data },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data ?? {};
  } catch (error) {
    const serverMessage =
      error?.response?.data?.message|| error.message || "Unknown error";
    console.error("editAcProcD failed:", serverMessage);
    return {
      success: false,
      message: serverMessage,
    };
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
