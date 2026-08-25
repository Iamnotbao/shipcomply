import axios from "axios";
const API = "/cd_code";
export const fetchCdCodeDropDown = async (
  factory_code,
  rule_no,
  language,
  page,
  limit,
  search,
) => {
  const response = await axios.get(
    `${API}/field_dropdown?factory_code=${factory_code}&rule_no=${rule_no}&language=${language}&page=${page}&limit=${limit}&search=${search}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchVendnoDropDown = async (
  token,
  factory_code,
  categoryCode,
  vend_no,
  is_status,
  department_code,
  user_code,
  query_level,
  field,
  page,
  limit,
  search,
  language,
) => {
  const response = await axios.get(
    `${API}/field_vend_no?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&field=${field}&category_code=${categoryCode}&vend_no=${vend_no}&is_status=${is_status}&page=${page}&limit=${limit}&search=${search}&language=${language}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
