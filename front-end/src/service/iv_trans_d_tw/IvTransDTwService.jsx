import axios from "axios";
const API = "/iv_trans_d_tw";
export const fetchAllIvTransDTw = async (order_no, order_seq, token) => {
  const response = await axios.get(
    `${API}/all?order_no=${order_no}&order_seq=${order_seq}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    }
  );
  return response ? response?.data : "";
};
export const checkBoxQty = async (data, token) => {
  const response = await axios.post(
    `${API}/check-right?order_no=${data?.order_no}&order_seq=${data?.order_seq}`,
    { all_checked_items: data?.all_checked_items },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return response?.data ? response?.data : "";
};
export const addABomM = async (data) => {
  const response = await axios.post(`${API}`, { data: data });
  return response.data ? response.data : {};
};
export const editABomM = async (data) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${data.factory_code}&prod_acno=${data.prod_acno}&item_acno=${data.item_acno}`,
    { data: data }
  );
  return response.data ? response.data : {};
};
export const deleteABomM = async (token, data) => {
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
export const searchVwAcShoeBomByFilter = async (
  filtered,
  factory_code,
  department_code,
  user_code,
  query_level
) => {
  try {
    const response = await axios.post(
      `${API}/search?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
      filtered
    );
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const exportPDFVwAcShoeBom = async (
  factory_code,
  department_code,
  user_code,
  query_level
) => {
  try {
    const response = await axios.get(
      `${API}/pdf?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
      {
        responseType: "blob",
      }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "vw_ac_shoebom.pdf");
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
