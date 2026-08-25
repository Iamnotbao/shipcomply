import axios from "axios";
const API = "/ac_expect_matd";

export const fetchAllAcExpectMatd = async (
  factory_code,
  expect_id,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/all?factory_code=${factory_code}&expect_id=${expect_id}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&limit=${limit}&offset=${offset}&language=${language}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
export const fetchAcExpectMatByID = async (factory_code, expect_id, seq) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&expect_id=${expect_id}&seq=${seq}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
