import axios from "axios";
const API = "/vw_ac_allchk";
export const fetchAllVwAcAllChk = async (
  token,
  factory_code,
  vend_no,
  ac_type=null,
  order_no,
  chk_no,
  rs_date,
  re_date,
  s_cfm,
  e_cfm,
  is_item,
  limit = 10,
  offset = 0,
  signal
) => {
  const response = await axios.get(
    `${API}/all?factory_code=${factory_code}&vend_no=${vend_no}&order_no=${order_no}&chk_no=${chk_no}&rs_date=${rs_date}&re_date=${re_date}&s_cfm=${s_cfm}&e_cfm=${e_cfm}&is_item=${is_item}&ac_type=${ac_type}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      signal: signal,
    },
  );
  return response ? response.data : "";
};
export const fetchAllInvoiceNo = async (
  factory_code,
  department_code,
  user_code,
  query_level,
) => {
  const response = await axios.get(
    `${API}/invoice?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchFieldDropDown = async (
  token,
  factory_code,
  field,
  page,
  limit,
  search,
  isStatus = true,
) => {
  const response = await axios.get(
    `${API}/dropdown_field?factory_code=${factory_code}&field=${field}&page=${page}&limit=${limit}&search=${search}&is_status=${isStatus}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
        authorization: `Bearer ${token}`,
      },
    }
  );
  return response ? response.data : "";
};
export const fetchAllAcNo = async (
  factory_code,
  invoice_no,
  department_code,
  user_code,
  query_level,
) => {

  const response = await axios.get(
    `${API}/ac_no?factory_code=${factory_code}&invoice_no=${invoice_no}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const checkBox = async (
  token,
  factory_code,
  is_check,
  filters,
  all_items = null,
) => {
  const response = await axios.post(
    `${API}/check?factory_code=${factory_code}&is_check=${is_check}`,
    { data: filters, all_items: all_items },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const confirmAllVAA = async (token, filters) => {
  try {
    const response = await axios.get(
      `${API}/confirm-all?factory_code=${filters.factory_code}&user_code=${filters.user_code}&department_code=${filters.department_code}&req_no=${filters.req_no}&vend_no=${filters.vend_no}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data ? response.data : {};
  } catch (error) {
    throw error;
  }
};
export const approveContract = async (filters, token) => {
  try {
    const response = await axios.get(
      `${API}/approve?factory_code=${filters.factory_code}&req_no=${filters.req_no}&invoice_no=${filters.invoice_no}&user_code=${filters.user_code}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data ? response.data : {};
  } catch (error) {
    throw error;
  }
};
export const revertApproveContract = async (filters, token) => {
  try {
    const response = await axios.get(
      `${API}/revert-approve?factory_code=${filters.factory_code}&req_no=${filters.req_no}&invoice_no=${filters.invoice_no}&user_code=${filters.user_code}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data ? response.data : {};
  } catch (error) {
    throw error;
  }
};
export const addContractNumber = async (filters, token) => {
  try {
    const response = await axios.get(
      `${API}/add-contract-number?factory_code=${filters.factory_code}&req_no=${filters.req_no}&vend_no=${filters.vend_no}&req_date=${filters.req_date}&ac_type=${filters.ac_type}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data ? response.data : {};
  } catch (error) {
    throw error;
  }
};
export const fetchAllByField = async (factory_code, field) => {

  const response = await axios.get(
    `${API}/field?factory_code=${factory_code}&field=${field}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const getReqNo = async (
  factory_code,
  year_month,
  factory_abbreviation,
  department_code,
  user_code,
  query_level,
) => {
  const response = await axios.get(
    `${API}/req_no?factory_code=${factory_code}&year_month=${year_month}&factory_abbreviation=${factory_abbreviation}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const getTempTable = async (token) => {
  const response = await axios.get(`${API}/temp_table`, {
    headers: {
      authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  return response ? response.data : "";
};
export const clearTempTable = async (token) => {
  const response = await axios.get(`${API}/clear_temp_table`, {
    headers: {
      authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  return response ? response.data : "";
};
export const addAcReqM = async (data) => {
  const response = await axios.post(`${API}`, { data: data });
  return response.data ? response.data : {};
};
export const editAcReqM = async (data) => {

  const response = await axios.put(
    `${API}/edit?factory_code=${data.factory_code}&req_no=${data.req_no}`,
    { data: data },
  );
  return response.data ? response.data : {};
};
export const deleteAcReqM = async (token, data) => {
  const response = await axios.delete(
    `${API}?factory_code=${data.factory_code}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response ? response.data : "";
};
export const deleteAllFactory = async (users, token) => {
  try {
    const response = await axios.delete(`${API}/delete-all`, {
      data: users,
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return response.data ? response.data : [];
  } catch (error) {
    console.log("The error was in delete", error);
  }
};
export const searchVAAByFilter = async (
  token,
  filtered,
  factory_code,
  language,
  limit,
  offset,
) => {
  try {
    const response = await axios.post(
      `${API}/search?factory_code=${factory_code}&language=${language}&limit=${limit}&offset=${offset}`,
      filtered,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const exportPDFARM = async (
  factory_code,
  department_code,
  user_code,
  query_level,
) => {
  try {
    const response = await axios.get(
      `${API}/pdf?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
      {
        // headers: {
        //   authorization: `Bearer ${token}`,
        // },
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ac_bom_m.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log("Download PDf failed", error);
  }
};

export const exportMaterialExcel = async (data) => {
  try {
    const response = await axios.post(`${API}/material-excel`, data, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "material.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in exportExcelUser", error);
  }
};
export const exportVwAcAllChkExcel = async (filters = {}) => {
  try {
    const response = await axios.get(
      `${API}/chk-excel?factory_code=${filters.factory_code}&req_no=${filters.req_no}&vend_no=${filters.vend_no}&s_date=${filters.s_date}&e_date=${filters.e_date}&filename=${filters.filename}`,
      {
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filters.filename}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in exportExcelUser", error);
  }
};
