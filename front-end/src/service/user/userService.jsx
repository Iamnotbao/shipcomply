import axios from "axios";
const API = "/users";
export const fetchUsers = async (token) => {
  const response = await axios.get(`${API}/all`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  return response ? response.data : "";
};
export const fetchSingleUser = async (
  factory_code,
  department_code,
  user_code,
) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}`,
    {
      // headers: {
      //   authorization: `Bearer ${token}`,
      // },
    },
  );
  return response ? response.data : "";
};
export const addUsers = async (data) => {
  const response = await axios.post(
    `${API}`,
    { data: data },
    {
      // headers: {
      //   authorization: `Bearer ${token}`,
      // },
    },
  );
  return response.data ? response.data : {};
};
export const editUsers = async (data) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${data.factory_code}&department_code=${data.department_code}&user_code=${data.user_code}`,
    { data: data },
    {
      // headers: {
      //   authorization: `Bearer ${token}`,
      // },
    },
  );
  return response.data ? response.data : {};
};
export const fetchUserByDepartment = async (factory_code, department_code) => {
  const response = await axios.get(
    `${API}/dept?factory_code=${factory_code}&department_code=${department_code}`,
    {
      // headers: {
      //   authorization: `Bearer ${token}`,
      // },
    },
  );
  return response.data ? response.data : "";
};
export const fetchUserByFactory = async (
  factory_code,
  limit = 10,
  page = 1,
  search = "",
  isStatus = true,
) => {
  const response = await axios.get(
    `${API}/factory?factory_code=${factory_code}&limit=${limit}&page=${page}&search=${search}&isStatus=${isStatus}`,
    {},
  );
  return response.data ? response.data : "";
};

export const deleteUser = async (token, data) => {
  const response = await axios.delete(
    `${API}?factory_code=${data.factory_code}&department_code=${data.department_code}&user_code=${data.user_code}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return response ? response.data : "";
};
export const deleteAllUsers = async (users, token) => {
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
export const searchUserByFilter = async (filtered, token) => {
  try {
    const response = await axios.post(`${API}/search`, filtered, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};

export const importExcelUser = async (token, form) => {
  try {
    console.log("pass f", form.get("file"));

    const repspone = await axios.post(`${API}/import`, form, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    console.log("check after import :", repspone);
    return repspone.data;
  } catch (error) {
    console.log(error);
  }
};
export const exportExcelUser = async (token) => {
  try {
    const response = await axios.get(`${API}/excel`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "user.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in exportExcelUser", error);
  }
};
export const exportPDFUser = async () => {
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
    link.setAttribute("download", "user.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data ? response.data : "";
  } catch (error) {
    console.log("Error when export PDF", error);
  }
};
