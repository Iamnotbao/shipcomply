import axios from "axios";
const API = "/se_inv_m";
export const fetchAllInvM = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchSelnvMByID = async (
  token,
  factory_code,
  ac_no,
  invoice_id,
) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&ac_no=${ac_no}&invoice_id=${invoice_id}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response.data ? response.data : {};
};
export const fetchInvoiceDropdown = async (
  factory_code,
  page,
  limit,
  search,
) => {
  const response = await axios.get(
    `${API}/invoice?factory_code=${factory_code}&page=${page}&limit=${limit}&search=${search}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response.data ? response.data : {};
};
export const fetchPackingSeid = async (factory_code, invoice_no) => {
  const response = await axios.get(
    `${API}/packing_seid?factory_code=${factory_code}&invoice_no=${invoice_no}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response.data ? response.data : {};
};
export const updateInvoiceDate = async (
  token,
  factory_code,
  ac_no,
  invoice_id,
  user_code,
) => {
  const response = await axios.get(
    `${API}/update_invoice?factory_code=${factory_code}&ac_no=${ac_no}&invoice_id=${invoice_id}&user_code=${user_code}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response.data ? response.data : {};
};
export const updateHsCode = async (
  token,
  factory_code,
  ac_no,
  invoice_id,
  user_code,
) => {
  const response = await axios.get(
    `${API}/update_hscode?factory_code=${factory_code}&ac_no=${ac_no}&invoice_id=${invoice_id}&user_code=${user_code}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response.data ? response.data : {};
};
export const updateNWGW = async (
  token,
  factory_code,
  ac_no,
  invoice_id,
  user_code,
) => {
  let response;
  try {
    response = await axios.get(
      `${API}/update_nw?factory_code=${factory_code}&ac_no=${ac_no}&invoice_id=${invoice_id}&user_code=${user_code}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      },
    );
    return response.data ? response.data : {};
  } catch (error) {
    console.log("err",error);
    
    throw error?.response?.data;
  }
};
export const active = async (
  token,
  factory_code,
  ac_no,
  invoice_id,
  user_code,
) => {
  const response = await axios.get(
    `${API}/active?factory_code=${factory_code}&ac_no=${ac_no}&invoice_id=${invoice_id}&user_code=${user_code}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response.data ? response.data : {};
};
export const cancelActive = async (
  token,
  factory_code,
  ac_no,
  invoice_id,
  user_code,
) => {
  const response = await axios.get(
    `${API}/cancel_active?factory_code=${factory_code}&ac_no=${ac_no}&invoice_id=${invoice_id}&user_code=${user_code}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response.data ? response.data : {};
};
export const voidAll = async (
  token,
  factory_code,
  ac_no,
  invoice_id,
  user_code,
) => {
  const response = await axios.get(
    `${API}/void_all?factory_code=${factory_code}&ac_no=${ac_no}&invoice_id=${invoice_id}&user_code=${user_code}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response.data ? response.data : {};
};
export const closeAll = async (
  token,
  factory_code,
  ac_no,
  invoice_id,
  user_code,
) => {
  const response = await axios.get(
    `${API}/close?factory_code=${factory_code}&ac_no=${ac_no}&invoice_id=${invoice_id}&user_code=${user_code}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response.data ? response.data : {};
};
export const fetchAllConfirmedChildren = async (
  factory_code,
  category_code,
  department_code,
  user_code,
  query_level,
  listBasicData = [],
) => {
  const response = await axios.post(
    `${API}/confirmed?factory_code=${factory_code}&category_code=${category_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      data: listBasicData,
    },
  );
  return response ? response.data : "";
};
export const addSelnvM = async (
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
export const autoAddSelnvM = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
) => {
  const response = await axios.post(
    `${API}/auto_add?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&page_size=${pageSize}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const editSelnvM = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  pageSize,
  data,
) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&ac_no=${data.ac_no}&invoice_id=${data.invoice_id}&page_size=${pageSize}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data ? response.data : {};
};
export const searchSelnvMByFilter = async (
  filtered,
  factory_code,
  department_code,
  user_code,
  query_level,
  language,
  limit,
  offset,
) => {
  try {
    const response = await axios.post(
      `${API}/search?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&language=${language}&limit=${limit}&offset=${offset}`,
      filtered,
    );
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const exportExcel = async (
  token,
  factory_code,
  department_code,
  user_code,
  query_level,
  search,
) => {
  try {
    const response = await axios.post(
      `${API}/excel?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
      { search },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "export_invoice.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data ? response.data : "";
  } catch (error) {
    console.log("Error when export PDF", error);
  }
};
export const pdfToFsi = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  search,
) => {
  try {
    const response = await axios.post(
      `${API}/pdf_packing_list?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
      { search },
      {
        responseType: "blob",
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "se_shiping_m.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data ? response.data : "";
  } catch (error) {
    console.log("Error when export PDF", error);
  }
};
