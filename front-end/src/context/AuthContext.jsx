import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [programCodeList, setProgramCodeList] = useState([]);
  const navigation = useNavigate();
  const getDefaultRoute = () => {
    if (user?.user_code === "admin") {
      return "/factory";
    }

    const ALLOWED_PROGRAMS = [
      "FACTORY",
      "DEPARTMENTS",
      "USER",
      "USER_PERMISSION",
      "PROGRAM",
      "PROGRAM_FIELD_TITLE",
      "BASIC_DATA",
      "ACTF_250",
      "ACTF_020",
      "ACTF_0201",
      "ACTF_0202",
      "ACTF_021",
      "ACTF_410",
      "ACTF_4101",
      "ACTF_4102",
      "ACTF_110",
      "ACTF_1101",
      "ACTF_1102",
      "ACTF_1103",
      "ACTF_130",
      "ACTF_1301",
      "ACTF_210",
      "ACTF_220",
      "SETF_570",
      "SETF_560",
      "ACTF_120",
      "ACTF_1201",
      "SETF_120",
      "ACTF_230",
      "SETF_590",
      "ACTF_240",
      "ACTF_310",
      "ACTF_3101",
      "SETF_510",
      "ACTF_270",
      "ACTF_022",
    ];

    const programRouteMap = {
      FACTORY: "/factory",
      DEPARTMENTS: "/departments",
      USER: "/user",
      USER_PERMISSION: "/permission",
      PROGRAM: "/program",
      PROGRAM_FIELD_TITLE: "/language",
      BASIC_DATA: "/basic_data",
      ACTF_250: "/actf_250",
      ACTF_020: "/actf_020",
      ACTF_0201: "/actf_020_1",
      ACTF_0202: "/actf_020_2",
      ACTF_021: "/actf_021",
      ACTF_410: "/actf_410",
      ACTF_4101: "/actf_410_1",
      ACTF_4102: "/actf_410_2",
      ACTF_110: "/actf_110",
      ACTF_1101: "/actf_1101",
      ACTF_1102: "/actf_1102",
      ACTF_1103: "/actf_1103",
      ACTF_130: "/actf_130",
      ACTF_1301: "/actf_1301",
      ACTF_210: "/actf_210",
      ACTF_220: "/actf_220",
      SETF_570: "/setf_570",
      SETF_560: "/setf_560",
      ACTF_120: "/actf_120",
      ACTF_1201: "/actf_120_1",
      SETF_120: "/setf_120",
      ACTF_230: "/actf_230",
      SETF_590: "/setf_590",
      ACTF_240: "/actf_240",
      ACTF_310: "/actf_310",
      ACTF_3101: "/actf_310_1",
      SETF_510: "/setf_510",
      ACTF_270: "/actf_270",
      ACTF_022: "/actf_022",
    };
    const firstAllowedProgram = ALLOWED_PROGRAMS.find((programCode) => {
      const program = programCodeList.find(
        (p) => p.program_code === programCode,
      );
      return program && program.allow_query === "Y";
    });

    return programRouteMap[firstAllowedProgram] || "/login";
  };

  useEffect(() => {
    const access_token = localStorage.getItem("access_token");
    const refresh_token = localStorage.getItem("refresh_token");
    const savedUser = localStorage.getItem("user");
    const savedProgramCodeList = localStorage.getItem("programCodeList");
    if (access_token && savedUser && refresh_token) {
      axios.defaults.headers.common["authorization"] = `Bearer ${access_token}`;
      setUser({
        ...JSON.parse(savedUser),
        access_token: access_token,
        refresh_token: refresh_token,
      });
    }
    if (savedProgramCodeList) {
      try {
        const parsedProgramCodeList = JSON.parse(savedProgramCodeList);
        setProgramCodeList(parsedProgramCodeList);
      } catch (error) {
        console.error(
          "Error parsing programCodeList from localStorage:",
          error,
        );
        setProgramCodeList([]);
      }
    } else {
      console.warn("No programCodeList in localStorage");
      setProgramCodeList([]);
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    axios.defaults.headers.common["authorization"] = `Bearer ${data.access_token}`;

    setUser({
      ...data.user,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
  };
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("language");
    localStorage.removeItem("programCodeList");
    delete axios.defaults.headers.common["authorization"]; 
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "language",
        newValue: null,
        oldValue: localStorage.getItem("language"),
      }),
    );
    setUser(null);
    setProgramCodeList([]);
    navigation("/login");
  };
  const updateProgramCodeList = (data) => {
    setProgramCodeList(data);
    localStorage.setItem("programCodeList", JSON.stringify(data));
  };

  useEffect(() => {
    const handleExpiredSession = () => {
      localStorage.removeItem("user");
      localStorage.removeItem("programCodeList");
      setUser(null);
      setProgramCodeList([]);
      navigation("/login", { replace: true });
    };
    const handleRefreshedToken = (event) => {
      setUser((currentUser) =>
        currentUser
          ? { ...currentUser, access_token: event.detail.accessToken }
          : currentUser,
      );
    };

    window.addEventListener("shipcomply:auth-expired", handleExpiredSession);
    window.addEventListener("shipcomply:token-refreshed", handleRefreshedToken);
    return () => {
      window.removeEventListener("shipcomply:auth-expired", handleExpiredSession);
      window.removeEventListener(
        "shipcomply:token-refreshed",
        handleRefreshedToken,
      );
    };
  }, [navigation]);
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        updateProgramCodeList,
        programCodeList,
        getDefaultRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
