import axios from "axios";
const API = "/programs_group_m";
export const fetchProgramsGroupM = async () => {
  const response = await axios.get(`${API}/all`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  });
  return response ? response.data : "";
};
export const fetchBasicDataByID = async (
  factory_code,
  category_code,
  code_no
) => {
  const response = await axios.get(
    `${API}?factory_code=${factory_code}&category_code=${category_code}&code_no=${code_no}`
  );
  return response.data ? response.data : {};
};
export const fetchDepartmentByFac = async (factory_code) => {
  const response = await axios.get(
    `${API}/factory?factory_code=${factory_code}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    }
  );
  return response ? response.data : "";
};
export const fetchBasicDataByCate = async (factory_code,category_code,department_code,
    user_code,
    query_level,) => {
      console.log("check buggg");
      
  const response = await axios.get(
    `${API}/category?factory_code=${factory_code}&category_code=${category_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`,
    {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    }
  );
  return response ? response.data : "";
};
export const addBasicData = async (data) => {
  const response = await axios.post(
    `${API}`,
    { data: data },
  );
  return response.data ? response.data : {};
};
export const editBasicData = async (data) => {
  const response = await axios.put(
    `${API}/edit?factory_code=${data.factory_code}&category_code=${data.category_code}&code_no=${data.code_no}`,
    { data: data },
  );
  return response.data ? response.data : {};
};
export const deleteDepartment = async (token, data) => {
  const response = await axios.delete(
    `${API}?factory_code=${data.factory_code}&department_code=${data.department_code}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  );
  return response ? response.data : "";
};
export const deleteAllDepartment = async (users, token) => {
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
export const searchBasicDataByFilter = async (filtered,factory_code,department_code,user_code,query_level) => {
  try {
    const response = await axios.post(`${API}/search?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&query_level=${query_level}`, filtered);
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const exportPDFBasicData = async (token) => {
  try {
    const response = await axios.get(`${API}/pdf`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "basic_data.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data ? response.data : "";
  } catch (error) {
    console.log("Error when export PDF", error);
  }
};