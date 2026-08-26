import axios from "axios";

const API = "/users_permission";

const normalizeProgramCode = (programCode) =>
  programCode === "ACTF_4101" ? "ACTF_410" : programCode;

export const fetchUsersPermission = async () => {
  try {
    const response = await axios.get(`${API}/all`, {
      // headers: {
      //   authorization: `Bearer ${token}`,
      // },
    });
    return response.data;
  } catch (error) {
    console.log("error", error);
  }
};
export const fetchTablePermission = async (
  factory_code,
  department_code,
  user_code,
  program_code,
) => {
  try {
    const permissionProgramCode = normalizeProgramCode(program_code);
    const response = await axios.get(
      `${API}/permission?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&program_code=${permissionProgramCode}`,
      {
        // headers: {
        //   authorization: `Bearer ${token}`,
        // },
      },
    );

    return response.data;
  } catch (error) {
    console.log("error", error);
  }
};
export const fetchPermissionByID = async (
  factory_code,
  department_code,
  user_code,
  program_code,
) => {
  try {
    const permissionProgramCode = normalizeProgramCode(program_code);
    const response = await axios.get(
      `${API}?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}&program_code=${permissionProgramCode}`,
    );
    return response.data ? response.data : [];
  } catch (error) {
    console.log("Cannot fetch permision by id error", error);
  }
};
export const fetchPermissionByUser = async (user_code) => {
  try {
    const response = await axios.get(`${API}/user?user_code=${user_code}`);
    return response.data ? response.data : [];
  } catch (error) {
    console.log("Cannot fetch permision by user error", error);
  }
};
export const fetchPermissionByFactoryAndUser = async (
  factory_code,
  department_code,
  user_code,
) => {
  try {
    const response = await axios.get(
      `${API}/factory?factory_code=${factory_code}&department_code=${department_code}&user_code=${user_code}`,
    );
    return response.data ? response.data : [];
  } catch (error) {
    console.log("log error");
  }
};
export const addUserPermission = async (data) => {
  try {
    const response = await axios.post(
      `${API}`,
      { data: data },
      {
        // headers: {
        //   authorization: `Bearer ${token}`,
        // },
      },
    );
    return response.data ? response.data : [];
  } catch (error) {
    throw error;
  }
};
export const editUsersPermission = async (user) => {
  try {
    const response = await axios.put(
      `${API}/edit?factory_code=${user.factory_code}&department_code=${user.department_code}&user_code=${user.user_code}&program_code=003`,
      { data: user },
      // {
      //   headers: {
      //     authorization: `Bearer ${token}`,
      //   },
      // }
    );
    return response.data ? response.data : [];
  } catch (error) {
    console.log("error from edit", error);
  }
};
export const copyUsersPermission = async (data) => {
  try {
    const response = await axios.post(
      `${API}/copy`,
      { data: data },
      // {
      //   headers: {
      //     authorization: `Bearer ${token}`,
      //   },
      // }
    );
    return response.data ? response.data : [];
  } catch (error) {
    console.log("error from edit", error);
  }
};
export const searchPermissionByFilter = async (filtered) => {
  try {
    const response = await axios.post(`${API}/search`, filtered, {
      // headers: {
      //   authorization: `Bearer ${token}`,
      // },
    });
    return response ? response.data : [];
  } catch (error) {
    console.log("The error was in search", error);
  }
};
export const deleteUserPermisison = async (token, user) => {
  try {
    console.log("check user passing", user);
    const response = await axios.delete(
      `${API}?factory_code=${user.factory_code}&department_code=${user.department_code}&user_code=${user.user_code}&program_code=001`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data ? response.data : {};
  } catch (error) {
    console.log("delete error", error);
  }
};
export const exportPDFPermisison = async () => {
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
    link.setAttribute("download", "user_permissison.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
    return response.data ? response.data : "";
  } catch (error) {
    console.log("Error when export PDF", error);
  }
};
