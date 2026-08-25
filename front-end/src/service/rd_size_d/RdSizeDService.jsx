import axios from "axios";
const API = "/rd_size_d";
export const fetchAllRSD = async (
  factory_code,
  department_code,
  user_code,
  query_level
) => {
  const response = await axios.get(
    `${API}/all?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    }
  );
  return response ? response.data : "";
};
export const fetchRSDByID = async (factory_code, size_type, size_no) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&size_type=${size_type}&size_no=${size_no}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    }
  );
  return response ? response.data : "";
};
export const fetchRSDBySize = async (
  factory_code,
  size_type,
  department_code,
  user_code,
  query_level,
  limit,
  offset
) => {
  const response = await axios.get(
    `${API}/size?factory_code=${factory_code}&size_type=${size_type}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&limit=${limit}&offset=${offset}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    }
  );
  return response ? response.data : "";
};
export const fetchRSDBySizeDropdown = async (
  factory_code,
  size_type,
  department_code,
  user_code,
  query_level,
  page,
  limit,
  search
) => {
  const response = await axios.get(
    `${API}/dropdown_size?factory_code=${factory_code}&size_type=${size_type}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}&page=${page}&limit=${limit}&search=${search}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    }
  );
  return response ? response.data : "";
};
export const addRSD = async (token, data) => {
  const response = await axios.post(
    `${API}`,
    { data: data },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data ? response.data : {};
};
export const editRSD = async (data) => {

  const response = await axios.put(
    `${API}/edit?factory_code=${data.factory_code}&invoice_no=${data.invoice_no}&sort=${data.sort}`,
    { data: data }
  );
  return response.data ? response.data : {};
};
export const deleteRSD = async (token, data) => {
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
export const searchRSDByFilter = async (
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
export const exportPDFRSD = async () => {
  try {
    const response = await axios.get(`${API}/pdf`, {
      // headers: {
      //   authorization: `Bearer ${token}`,
      // },
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ac_imp_material_tracking.pdf");
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
