import axios from "axios";
const API = "/vw_ac_chg";

export const fetchFieldDropdown = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  page,
  limit,
  search,
  isStatus = true,
  field = null,
) => {
  const response = await axios.get(
    `${API}/dropdown_field?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&page=${page}&limit=${limit}&search=${search}&is_status=${isStatus}&field=${field}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
