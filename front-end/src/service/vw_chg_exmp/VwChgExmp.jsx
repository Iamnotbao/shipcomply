import axios from "axios";
const API = "/vw_chg_exmp";
export const fetchAllVwChgExmp = async (
  token,
  factory_code,
  filter,
  language,
  limit,
  offset,
) => {

  const response = await axios.get(
    `${API}/list_of_chg_exmp?factory_code=${factory_code}&cont_no=${filter?.cont_no}&language=${language}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response?.data : "";
};
