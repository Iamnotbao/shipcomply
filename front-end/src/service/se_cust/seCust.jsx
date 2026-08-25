import axios from "axios";
const API = "/se_cust";
export const fetchAllCustDropdown = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  field,
  language,
  page = 0,
  limit = 10,
  search = "",
) => {
  const response = await axios.get(
    `${API}/cust_id?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&field=${field}&language=${language}&page=${page}&limit=${limit}&search=${search}`,
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
  isStatus = true
) => {
  const response = await axios.get(
    `${API}/field_vend_no?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&field=${field}&category_code=${categoryCode}&vend_no=${vend_no}&is_status=${is_status}&page=${page}&limit=${limit}&search=${search}&language=${language}&is_status=${isStatus}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchFieldDropDownSeCust = async (
  factory_code,
  field = null,
  language,
  page,
  limit,
  search,
  extraField,
) => {
  const response = await axios.get(
    `${API}/field_dropdown?factory_code=${factory_code}&field=${field}&language=${language}&page=${page}&limit=${limit}&search=${search}&extraField=${extraField}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
