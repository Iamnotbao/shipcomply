import axios from "axios";
const API = "/se_plan_size";
export const fetchAllSePlanSize = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  se_id,
  pack_gu,
  se_ver,
  se_seq,
  ship_seq,
  language = "en",
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&se_id=${se_id}&pack_gu=${pack_gu}&se_ver=${se_ver}&se_seq=${se_seq}&ship_seq=${ship_seq}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchSePlanSizeByID = async (
  token,
  factory_code,
  se_id,
  se_ver,
  se_seq,
  pack_gu,
  ship_seq,
  pk_seq,
) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&se_id=${se_id}&se_ver=${se_ver}&se_seq=${se_seq}&pack_gu=${pack_gu}&ship_seq=${ship_seq}&pk_seq=${pk_seq}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response.data ? response.data : {};
};
export const getCtns = async (
  factory_code,
  se_id,
  pack_gu,
  se_seq,
  pk_seq,
  ship_seq,
  new_ctns,
) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&se_id=${se_id}&pack_gu=${pack_gu}&se_seq=${se_seq}&pk_seq=${pk_seq}&ship_seq=${ship_seq}&new_ctns=${new_ctns}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response.data ? response.data : {};
};
export const addSeShippingD = async (
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
export const editSePlanSize = async (
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
      `${API}/edit?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&se_id=${data.se_id}&se_ver=${data.se_ver}&se_seq=${data.se_seq}&ship_seq=${data.ship_seq}&pack_gu=${data.pack_gu}&pk_seq=${data.pk_seq}&page_size=${pageSize}`,
      { data: data },
      {
        authorization: `Bearer ${token}`,
      },
    );
    return response.data ? response.data : {};
  } catch (error) {
    throw error?.response?.data;
  }
};
export const deleteSePlanSize = async (
  token,
  factory_code,
  se_id,
  se_ver,
  se_seq,
  pack_gu,
  ship_seq,
  pk_seq,
  items,
) => {
  const response = await axios.delete(API, {
    params: {
      factory_code,
      se_id,
      se_ver,
      se_seq,
      pack_gu,
      ship_seq,
      pk_seq
    },
    data: items,
    headers: {
      authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  return response.data ? response.data : {};
};

export const confirmItemsSePlanSize = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  items,
) => {
  const response = await axios.post(
    `${API}/confirm_check_items`,
    {data:items},
    {
      params: {
        factory_code,
        department_code,
        user_code,
        query_level,
      },
    }
  );

  return response.data || {};
};
export const unconfirmItemsSePlanSize = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  items,
) => {
  const response = await axios.post(
    `${API}/unconfirm_check_items`,
    {data:items},
    {
      params: {
        factory_code,
        department_code,
        user_code,
        query_level,
      },
    }
  );

  return response.data || {};
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

export const confirmAll = async (
  token,
  factory_code,
  user_code,
  department_code,
  query_level,
  se_id,
  pack_gu,
  se_ver,
  se_seq,
  ship_seq,
) => {
  const response = await axios.get(
    `${API}/confirm_all?factory_code=${factory_code}&user_code=${user_code}&department_code=${department_code}&query_level=${query_level}&se_id=${se_id}&pack_gu=${pack_gu}&se_ver=${se_ver}&se_seq=${se_seq}&ship_seq=${ship_seq}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
