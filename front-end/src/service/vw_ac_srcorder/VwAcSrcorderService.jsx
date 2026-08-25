import axios from "axios";
const API = "/vw_ac_srcorder";
export const fetchAllVwAcSrcorder = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  invoice_no,
  vend_no,
  limit = 10,
  offset = 0,
  language,
  isCheckMax = false,
  signal,
) => {
  const response = await axios.get(
    `${API}/list_of_ac_srcorder?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&invoice_no=${invoice_no}&vend_no=${vend_no}&limit=${limit}&offset=${offset}&language=${language}&is_max=${isCheckMax}`,
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
export const fetchRdTemp = async (token) => {
  const response = await axios.get(`${API}/session`, {
    headers: {
      authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  return response ? response.data : "";
};
export const clearRdTemp = async (token) => {
  const response = await axios.get(`${API}/clear_session`, {
    headers: {
      authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  return response ? response.data : "";
};
export const checkLeft = async (filters, token, all_items = null) => {
  const response = await axios.post(
    `${API}/check-left?factory_code=${filters.factory_code}&order_no=${filters.order_no}&order_seq=${filters.order_seq}&is_check=${filters.is_check}&is_max=${filters.is_max}`,
    { plan_iqty: filters.plan_iqty, all_items: all_items },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const confirmAllVAS = async (token, filters) => {
  const response = await axios.get(
    `${API}/confirm-all?factory_code=${filters.factory_code}&department_code=${filters.department_code}&user_code=${filters.user_code}&query_level=${filters.query_level}&req_no=${filters.req_no}&vend_no=${filters.vend_no}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const getPlanIqty = async (filters, is_max) => {
  const response = await axios.get(
    `${API}/plan_iqty?factory_code=${filters.factory_code}&order_no=${filters.order_no}&order_seq=${filters.order_seq}&item_id=${filters.id}&is_max=${is_max}`,
  );
  return response.data ? response.data : {};
};
export const updateBlQty = async (token, filters, is_check, is_max) => {
  try {

    const response = await axios.post(
      `${API}/bl_qty?factory_code=${filters.factory_code}&is_max=${is_max}&is_check=${is_check}`,
      {
        gridData: filters.gridData,
        new_bl_qty: filters.new_bl_qty,
        plan_iqty: filters.plan_iqty,
        force: filters.force,
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data ? response.data : {};
  } catch (error) {

    throw error?.response.data;
  }
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
export const addAcReqM = async (data) => {
  const response = await axios.post(`${API}`, { data: data });
  return response.data ? response.data : {};
};
export const editVwAcSrcorder = async (token, data, force = false) => {
  try {
    const response = await axios.put(
      `${API}/update-custom?factory_code=${data.factory_code}&order_no=${data.order_no}&order_seq=${data.order_seq}&item_id=${data.id}&is_check=${data.is_check}&is_max=${data.is_max}&item_type=${data.type}&chge_ordqty=${data.chge_ordqty}&req_acqty=${data.req_acqty}&order_acqty=${data.order_acqty}&order_acqty=${data.order_acqty}`,
      { new_bl_qty: data.new_bl_qty, force: force },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data ? response.data : {};
  } catch (error) {
    throw error?.response?.data;
  }
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
export const searchVwAcSrcorderMByFilter = async (
  token,
  filtered,
  factory_code,
  language,
  limit,
  offset,
  isCheckMax = false,
) => {
  try {
    const response = await axios.post(
      `${API}/search?factory_code=${factory_code}&language=${language}&limit=${limit}&offset=${offset}&is_max=${isCheckMax}`,
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
export const exportAcSrcorderMExcel = async (
  filename = "AC_SRCORDER_M",
  data = {},
) => {
  try {
    const response = await axios.post(
      `${API}/srcorder-excel?filename=${filename}`,
      { data: data },
      {
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in exportExcelUser", error);
  }
};
