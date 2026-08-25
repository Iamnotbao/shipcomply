import axios from "axios";
const API = "/ac_expect_m";
export const fetchAllAcExpectM = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&limit=${limit}&offset=${offset}&language=${language}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchAcExpectMByID = async (factory_code, expect_id) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&expect_id=${expect_id}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchFieldDropdown = async (
  factory_code,
  field,
  page,
  limit,
  search,
) => {
  const response = await axios.get(
    `${API}/field_dropdown?factory_code=${factory_code}&field=${field}&page=${page}&limit=${limit}&search=${search}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const createExpectId = async (factory_code) => {
  const response = await axios.get(
    `${API}/expect_id?factory_code=${factory_code}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};

export const addAcExpectM = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
) => {
  try {
    const response = await axios.post(
      `${API}?factory_code=${factory_code}&deparment_code=${department_code}&user_code=${user_code}&query_level=${query_level}&page_size=${pageSize}`,
      { data: data },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data ? response.data : {};
  } catch (error) {
    console.log("error", error);

    return error?.response?.data;
  }
};
export const editAcExpectM = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${factory_code}&deparment_code=${department_code}&user_code=${user_code}&query_level=${query_level}&expect_id=${data.expect_id}&page_size=${pageSize}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const searchAcExpectMByFilter = async (
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
      `${API}/search?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&limit=${limit}&offset=${offset}&language=${language}`,
      filtered,
    );
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const exportExcelVwChgM = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  filters,
) => {
  try {
    const response = await axios.post(
      `${API}/excel?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}`,
      { search: filters },
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

export const genOrderMaterial = async (factory_code, expect_id, user_code) => {
  try {
    const response = await axios.get(
      `${API}/gen_order_material?factory_code=${factory_code}&expect_id=${expect_id}&user_code=${user_code}`,
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
export const calculateWriteoff = async (factory_code, expect_id, user_code) => {
  try {
    const response = await axios.get(
      `${API}/calculate_write_off?factory_code=${factory_code}&expect_id=${expect_id}&user_code=${user_code}`,
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
export const exportExcelToShoe = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  expect_id,
) => {
  try {
    const response = await axios.get(
      `${API}/excel_shoe?factory_code=${factory_code}&expect_id=${expect_id}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}`,
      {
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "shoe.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log("Download PDf failed", error);
  }
};
export const exportExcelToWriteoff = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  expect_id,
) => {
  try {
    const response = await axios.get(
      `${API}/excel_write_off?factory_code=${factory_code}&expect_id=${expect_id}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}`,
      {
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "write_off.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log("Download PDf failed", error);
  }
};
export const voidAll = async (factory_code, ac_no, user_code, language) => {
  try {
    const response = await axios.get(
      `${API}/void?factory_code=${factory_code}&ac_no=${ac_no}&user_code=${user_code}&language=${language}`,
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
export const cancelActivate = async (
  factory_code,
  user_code,
  ac_no,
  language,
) => {
  try {
    const response = await axios.get(
      `${API}/cancel_activate?factory_code=${factory_code}&user_code=${user_code}&ac_no=${ac_no}&language=${language}`,
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
export const close = async (factory_code, ac_no, user_code) => {
  try {
    const response = await axios.get(
      `${API}/close?factory_code=${factory_code}&ac_no=${ac_no}&user_code=${user_code}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return response ? response?.data : "";
  } catch (error) {
    return error?.response?.data;
  }
};
