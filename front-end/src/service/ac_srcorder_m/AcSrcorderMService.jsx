import axios from "axios";
const API = "/ac_srcorder_m";
export const fetchAllAcSrcorderM = async (
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset
) => {
  const response = await axios.get(
    `${API}/all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    }
  );
  return response ? response.data : "";
};
export const fetchAllInvoiceNo = async (
  factory_code,
  department_code,
  user_code,
  query_level
) => {
  const response = await axios.get(
    `${API}/invoice?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
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
  query_level
) => {

  const response = await axios.get(
    `${API}/ac_no?factory_code=${factory_code}&invoice_no=${invoice_no}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    }
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
    }
  );
  return response ? response.data : "";
};
export const fetchAllByFieldDropDown = async (
  factory_code,
  field,
  page,
  limit,
  search,
  isStatus = true
) => {
  const response = await axios.get(
    `${API}/dropdown_field?factory_code=${factory_code}&field=${field}&page=${page}&limit=${limit}&search=${search}&is_status=${isStatus}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    }
  );
  return response ? response.data : "";
};
export const getReqNo = async (
  factory_code,
  year_month,
  factory_abbreviation,
  department_code,
  user_code,
  query_level
) => {
  const response = await axios.get(
    `${API}/req_no?factory_code=${factory_code}&year_month=${year_month}&factory_abbreviation=${factory_abbreviation}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    }
  );
  return response ? response.data : "";
};
export const addAcReqM = async (data) => {
  const response = await axios.post(`${API}`, { data: data });
  return response.data ? response.data : {};
};
export const editAcReqM = async (data) => {

  const response = await axios.put(
    `${API}/edit?factory_code=${data.factory_code}&req_no=${data.req_no}`,
    { data: data }
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
    }
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
export const searchAcSrcorderMByFilter = async (
  filtered,
  factory_code,
  department_code,
  user_code,
  query_level,
  limit,
  offset
) => {
  try {
    const response = await axios.post(
      `${API}/search?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&limit=${limit}&offset=${offset}`,
      filtered
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
  query_level
) => {
  try {
    const response = await axios.get(
      `${API}/pdf?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
      {
        // headers: {
        //   authorization: `Bearer ${token}`,
        // },
        responseType: "blob",
      }
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
  data = {}
) => {
  try {
    const response = await axios.post(
      `${API}/srcorder-excel?filename=${filename}`,
      { data: data },
      {
        responseType: "blob",
      }
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
