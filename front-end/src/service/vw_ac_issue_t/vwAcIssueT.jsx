import axios from "axios";
const API = "/vw_ac_issue_t";
export const fetchAllVwAcIssueT = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  conf_seq,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/list_of_ac_issue_t?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&conf_seq=${conf_seq}&language=${language}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
