import axios from "axios";
const API = "/sd_price_item";
export const fetchAllSPI = async (
  token,
  factory_code,
  se_id,
  se_ver,
  se_seq,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&se_id=${se_id}&se_ver=${se_ver}&se_seq=${se_seq}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchAllSPIForInvM = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  ac_no,
  invoice_id,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/all_for_inv_m?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&ac_no=${ac_no}&invoice_id=${invoice_id}&language=${language}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};

export const searchSPIByFilter = async (
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
