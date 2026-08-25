import axios from "axios";
const API = "/ac_req_order";
export const fetchAcReqOrder = async (
  factory_code,
  department_code,
  user_code,
  query_level,
) => {
  const response = await axios.get(
    `${API}/all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchAllAcReqOrderByReqNo = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  req_no,
  limit=10,
  offset=0,
) => {
  const response = await axios.get(
    `${API}/req_no?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&req_no=${req_no}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const fetchAllAcReqOrderById = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  id,
  limit,
  offset,
) => {
  const response = await axios.get(
    `${API}/id?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&id=${id}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  return response ? response.data : "";
};
export const deleteAcReqOrderById = async (factory_code, req_no, req_seq) => {
  const response = await axios.delete(
    `${API}?factory_code=${factory_code}&req_no=${req_no}&req_seq=${req_seq}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
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
export const fetchAcReqOrderByID = async (factory_code, req_no, req_seq) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&req_no=${req_no}&req_seq=${req_seq}`,
  );
  return response.data ? response.data : {};
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
export const addAcReqOrder = async (data, pageSize) => {
  const response = await axios.post(`${API}?page_size=${pageSize}`, {
    data: data,
  });
  return response.data ? response.data : {};
};
export const editAcReqOrder = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  data,
  pageSize,
) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&req_no=${data.req_no}&req_seq=${data.req_seq}&page_size=${pageSize}`,
    { data: data },
  );
  return response.data ? response.data : {};
};
export const deleteAcReqOrder = async (factory_code, req_no, req_seq) => {
  const response = await axios.delete(
    `${API}?factory_code=${factory_code}&req_no=${req_no}&req_seq=${req_seq}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
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
export const searchAcReqOrderByFilter = async (
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
export const exportPDFARO = async (
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
export const exportCustomExcel = async (data) => {
  try {
    const response = await axios.post(`${API}/custom-excel`, data, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "custom.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in exportExcelUser", error);
  }
};
