import { useEffect, useState } from "react";

import DataTable from "../../component/table/DataTable";
import {
  Box,
  Container,
  Paper,
  Skeleton,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { fnQuery } from "../../utils/fnQuery";
import {
  addUsers,
  deleteAllUsers,
  deleteUser,
  editUsers,
  exportExcelUser,
  exportPDFUser,
  fetchUserByDepartment,
  importExcelUser,
  searchUserByFilter,
} from "../../service/user/userService";

import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import AcShoeMDeletePage from "../../features/ac_shoe_m/page/AcShoeMDeletePage";
import {
  fetchFactory,
  searchFactoryByFilter,
} from "../../service/factory/factoryService";
import {
  fetchDepartmentByFac,
  fetchDepartments,
} from "../../service/factory_departments/FacDepartmentService";
import AddUserPage from "../../features/users/page/AddUserPage";
import EditUserPage from "../../features/users/page/EditUserPage";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import { fetchTablePermission } from "../../service/users_permission/UsersPermission";

const User = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectRow, setSelectRow] = useState({});
  const [selectRows, setSelectRows] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [isFactorySearch, setIsFactorySearch] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [factories, setFactories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectSupervisor, setSelectSupervisor] = useState([]);
  const [selectFactory, setSelectFactory] = useState({});
  const [selectDepartment, setSelectDepartment] = useState({});
  const [allSearchDepartments, setAllSearchDepartments] = useState([]);
  const [jumpToRow, setJumpToRow] = useState(null);
  const [authorization, setAuthorizations] = useState({});
  const [filter, setFilter] = useState("");
  const [file, setFile] = useState(null);
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const { user } = useAuth();
  const {
    fetchTableControlTranslations,
    fetchTableColumnTranslations,
    language,
  } = useColumnTranslation();
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);

  const today = new Date().toISOString().slice(0, 19).replace("T", " ");

  new Date().toISOString().split("T")[0];
  //========== FETCH DATA SECTION ================

  //fetch all factory and department
  const fetchU = async () => {
    const [fact, dept] = await fnQuery([
      () => fetchFactory(),
      () => fetchDepartments(),
    ]);
    if (fact) {
      setSelectFactory(fact.data[0]);
      setFactories([{ tableName: fact.tableName, data: fact.data }]);
    }
    if (dept) {
      setSelectDepartment(dept.data[0]);
      setDepartments([{ tableName: dept.tableName, data: dept.data }]);
    }
  };
  //fetch all department by factory
  const fetchDeptByFactory = async () => {
    const response = await fetchDepartmentByFac(selectFactory.factory_code);

    if (response) {
      setDepartments([{ tableName: response.tableName, data: response.data }]);
      setSelectDepartment(response.data[0]);
    }
  };
  //fetch all user by department
  const fetchUserByDept = async () => {
    const response = await fetchUserByDepartment(
      selectFactory.factory_code,
      selectDepartment.department_code
    );

    if (response) {
      setSelectRows([response.data[0]]);
      setData([{ tableName: response.tableName, data: response.data }]);
    }
  };
  //fetch all translation by user
  const fetchAllTranslations = async () => {
    try {
    const columns = await fetchTableColumnTranslations(
        "USER",
        "master",
        "user",
      );
      const controls = await fetchTableControlTranslations("USER");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user.factory,
        user.department,
        user.user_code,
        "USER",
      );
      const mergedControls = [...controls?.data, ...sysMessages?.data];
      if (mergedControls.length > 0) {
        setControlTranslations(mergedControls);
      }
      if (columns) setColumnTranslations(columns?.data);

      if (auth) setAuthorizations(auth?.data);
      return auth?.data || [];
    } catch (error) {
      console.error(" Error fetching translations:", error);
    }
  };
  //========== END FETCH DATA SECTION ================

  // ========== USEEFFECT SECTION ==========
  // UseEffect #1: Language thay đổi - Fetch lại translations
  // - Chạy khi language (VN/EN/...) thay đổi
  // - Fetch column translations, control translations, và permissions
  // - Update UI labels theo ngôn ngữ mới
  useEffect(() => {
    fetchAllTranslations();
  }, [language]);
  //  UseEffect #2: Fetch tất cả users
  // - Chạy dựa theo danh sách department khi component mount
  // - Danh sách user được reset khi danh sách department rỗng
  useEffect(() => {
    if (departments && departments[0]?.data.length === 0) {
      setData([{ tableName: "USER", data: [] }]);
    }
  }, [departments]);
  //  UseEffect #3: Fetch tất cả users
  // - Chạy 1 lần khi component mount
  // - Mount 2 danh sách factory và department ban đầu
  useEffect(() => {
    fetchU();
  }, []);
  //  UseEffect #4: Fetch data dựa theo case isSearch = true
  // - Chạy khi selectFactory, selectDepartment, isSearch, isFactorySearch, searchData thay đổi
  // - Danh sách user sẽ được theo searchData
  useEffect(() => {
    if (selectFactory && selectFactory.factory_code) {
      if (!isSearch) {
        // Trường hợp bình thường - không search
        fetchDeptByFactory();
      } else {
        // Trường hợp đang search (cả user và factory)
        const filteredDepts = allSearchDepartments.filter(
          (d) => d.factory_code === selectFactory.factory_code
        );
        if (filteredDepts.length > 0) {
          setDepartments([{ tableName: "DEPARTMENTS", data: filteredDepts }]);
          setSelectDepartment(filteredDepts[0]);
        } else {
          setDepartments([{ tableName: "DEPARTMENTS", data: [] }]);
          setSelectDepartment({});
          setSelectRows([]);
          setData([{ tableName: "USER", data: [] }]);
        }
      }
    }
  }, [selectFactory, isSearch, allSearchDepartments]);
  // 🔵 UseEffect #5: Fetch data dựa theo case isSearch = true và case isSearch =false;
  // - Chạy khi selectFactory, selectDepartment, isSearch, isFactorySearch, searchData thay đổi
  // - Danh sách user sẽ được theo searchData
  // - Danh sách chạy theo hàm fetchUserByDept hoặc lọc từ searchData
  useEffect(() => {
    if (
      !isSearch &&
      selectFactory &&
      selectFactory.factory_code &&
      selectDepartment &&
      selectDepartment.department_code &&
      Object.keys(selectFactory).length > 0 &&
      Object.keys(selectDepartment).length > 0
    ) {
      fetchUserByDept();
    } else if (
      isSearch &&
      selectFactory?.factory_code &&
      selectDepartment?.department_code
    ) {
      if (isFactorySearch) {
        // Search Factory - PHẢI FETCH USER từ API
        fetchUserByDept();
      } else if (searchData && searchData.length > 0) {
        // Search User - FILTER từ searchData
        const filter = searchData.filter(
          (d) =>
            d.department_code === selectDepartment.department_code &&
            d.factory_code === selectFactory.factory_code
        );

        if (filter.length > 0) {
          setSelectRows([filter[0]]);
          setData([{ tableName: "USER", data: filter }]);
        } else {
          setSelectRows([]);
          setData([{ tableName: "USER", data: [] }]);
        }
      }
    }
  }, [selectDepartment, selectFactory, isSearch, isFactorySearch, searchData]);
  // 🔵 UseEffect #6: Fetch supervisor
  // - Chạy khi selectRows, data, isSearch thay đổi
  // - Danh sách supervisor sẽ được filter từ danh sách ban đầu
  useEffect(() => {
    if (selectRows.length === 1 && selectRows[0]?.user_code) {
      const supervisor = data[0]?.data?.find(
        (d) => d.user_code === selectRows[0].user_code
      );
      setSelectSupervisor({});
    } else {
      setSelectSupervisor({});
    }
  }, [selectRows, data]);
  // 🔵 UseEffect #7: Jump to Row animation
  // - Chạy khi jumpToRow thay đổi
  // - Highlight hàng mới được thêm trong 500ms
  // - Reset jumpToRow sau đó để xóa highlight
  useEffect(() => {
    if (jumpToRow) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow]);
  //unclock
  // useEffect(() => {
  //   if (isSearch && searchData && searchData.length > 0) {
  //     let filteredData = [...searchData];
  //     if (selectFactory && selectFactory.factory_code) {
  //       filteredData = filteredData.filter(
  //         (d) => d.factory_code === selectFactory.factory_code
  //       );
  //     }
  //     if (selectDepartment && selectDepartment.department_code) {
  //       filteredData = filteredData.filter(
  //         (d) => d.department_code === selectDepartment.department_code
  //       );
  //     }
  //     setData([{ tableName: "USER", data: filteredData }]);
  //   }
  // }, [selectFactory, selectDepartment, isSearch, searchData]);
  //
  // ========== END USEEFFECT SECTION ==========

  //========== HANDLER SECTION ================

  //handler row choose
  const handleSelectChoose = (rows) => {
    setSelectRows(rows);
  };
  //handler selectFactory
  const handleSelectFactory = (row) => {
    setSelectFactory(row);
    // setIsSearch(false);
  };
  //handler selectDepartment
  const handleSelectDepartment = (row) => {
    setSelectDepartment(row);
    // setIsSearch(false);
  };
  //handler close add popup
  const handleAddClose = () => {
    setOpenAdd(false);
    setSelectSupervisor([]);
  };
  //handler open add popup
  const handleOpenAdd = () => {
    const allowAdd = authorization?.find(
      (item) => item.field === "allow_add"
    )?.title;
    if (user?.user_code !== "admin" && allowAdd === "N") {
      return;
    }
    setOpenAdd(true);
  };
  //handler close edit popup
  const handleEditClose = () => {
    setOpenEdit(false);
  };
  //handler open edit popup
  const handleOpenEdit = () => {
    if (data[0]?.data.length > 0) {
      const allow = authorization?.find(
        (item) => item.field === "allow_modify"
      )?.title;
      if (user?.user_code !== "admin" && allow === "N") {
        return;
      }
      setOpenEdit(true);
    }
  };
  const handleClose = () => setOpen(false);
  const handleModal = (row) => {
    setSelectRow(row);
    setOpen(true);
  };
  const onSetFilter = (filter) => {
    setFilter(filter);
  };
  const handleSingleDelete = async () => {
    const result = await deleteUser(user.access_token, selectRow);
    if (result.success) {
      await fetchU();
      toast.success("Delete user successfully!");
      handleClose();
    } else {
      toast.error("Cannot delete");
      handleClose();
    }
  };
  const handleDeleteAll = async () => {
    try {
      const deleteAll = await deleteAllUsers(selectRows, user.access_token);
      if (deleteAll.success) {
        await fetchU();
        toast.success("Delete all item successfully");
        handleClose();
      }
    } catch (error) {
      toast.error("Cannot delete all something wrong !");
    }
  };
  //handler add user
  const handleAdd = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = Object.fromEntries(form.entries());
    data.factory_code = selectFactory.factory_code;
    data.department_code = selectDepartment.department_code;
    data.supervisor_id = selectSupervisor.user_code;
    data.grt_dept = user.department_code;
    data.grt_user = user.user_code;
    data.grt_date = today;
    try {
      const response = await addUsers(data);
      if (response.success) {
        toast.success("Add successfully !!!");
        handleAddClose();
        const combinedData = await fnQuery([
          () =>
            fetchUserByDepartment(
              selectFactory.factory_code,
              selectDepartment.department_code
            ),
        ]);
        const addedUser = combinedData[0].data.find(
          (item) => item.user_code === data.user_code
        );
        setData(combinedData);
        if (addedUser) {
          setTimeout(() => {
            setSelectRows([addedUser]);
            setJumpToRow(addedUser);
            setTimeout(() => setJumpToRow(null), 500);
          }, 100);
        }
        setSelectSupervisor([]);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };
  //handler edit user
  const handleEdit = async (data) => {
    data.supervisor_id = selectSupervisor.user_code;
    data.last_user = user.user_code;
    data.last_date = new Date().toISOString();
    const { statusText, ...cleanData } = data;
    try {
      const response = await editUsers(cleanData);
      if (response.success) {
        toast.success(
          `Edit shoe with factory code(${cleanData.factory_code}) successfully !!!`
        );
        handleEditClose();
        const dataWithStatusText = {
          ...cleanData,
        };
        setData((prevData) => {
          if (!prevData.length) return prevData;
          const { factory_code, department_code, user_code } = cleanData;
          const uniqueKey = `${factory_code}-${department_code}-${user_code}`;
          const updatedData = prevData.map((table) => ({
            ...table,
            data: table.data.map((item) => {
              const itemKey = `${item.factory_code}-${item.department_code}-${item.user_code}`;
              return itemKey === uniqueKey
                ? { ...item, ...dataWithStatusText }
                : item;
            }),
          }));
          return updatedData;
        });
        setSelectRows([dataWithStatusText]);
        setJumpToRow(dataWithStatusText);
      }
    } catch (error) {
      console.log("data has been problem", error);
    }
  };
  const handleDelete = async () => {

    if (selectRows.length > 1) {
      handleDeleteAll();
    } else {
      handleSingleDelete();
    }
  };
  //handler confirm user
  const handleConfirm = async () => {
    if (selectRows.length === 1) {
      const allow = authorization?.find(
        (item) => item.field === "allow_confirm"
      )?.title;
      if (user?.user_code !== "admin" && allow === "N") {
        return;
      }
      const updateConfirmUser = { ...selectRows[0], status: 1 };

      await handleEdit(updateConfirmUser);
    }
  };
  //handler cancel user
  const handleCancle = async () => {
    if (selectRows.length === 1) {
      const allow = authorization?.find(
        (item) => item.field === "allow_confirm"
      )?.title;
      if (user?.user_code !== "admin" && allow === "N") {
        return;
      }
      const updateCancelUser = { ...selectRows[0], status: 0 };
      await handleEdit(updateCancelUser);
    }
  };
  const handleSearchCondition = async () => {
    const rawKeys = Array.isArray(searchData)
      ? searchData.map((d) => `${d.department_code}-${d.factory_code}`)
      : [`${searchData?.department_code}-${searchData?.factory_code}`];
    const searchKeys = [...new Set(rawKeys)];
    const selectedKey = searchKeys.filter((key) =>
      key.endsWith(`-${selectFactory.factory_code}`)
    );
    const allDepartments = await fnQuery([() => fetchDepartments()]);
    const chooseDepartments = allDepartments[0]?.data.filter((ad) =>
      searchKeys.includes(`${ad.department_code}-${ad.factory_code}`)
    );
    let foundDepartments = [];
    if (selectedKey) {
      foundDepartments = chooseDepartments?.filter((d) =>
        selectedKey.includes(`${d.department_code}-${d.factory_code}`)
      );
    }
    // await fetchDepartmentByFac(selectFactory.factory_code);
  };
  //handler search user
  const handleSearch = async (newFilter) => {
    try {
      const response = await searchUserByFilter(newFilter, user.access_token);
      if (response && response.data) {
        const users = response.data;

        setIsSearch(true);
        setIsFactorySearch(false);
        setSearchData(users); // LƯU TẤT CẢ USERS

        const allFactoryCombined = await fnQuery([() => fetchFactory()]);
        const allDepartmentCombined = await fnQuery([() => fetchDepartments()]);
        const allFactories = allFactoryCombined?.[0]?.data || [];
        const allDepartments = allDepartmentCombined?.[0].data || [];

        const deptCodes = [
          ...new Set(
            users.map((u) => `${u.factory_code}-${u.department_code}`)
          ),
        ];
        const factoryCodes = [...new Set(users.map((u) => u.factory_code))];

        const filteredFactories = allFactories.filter((fac) =>
          factoryCodes.includes(fac.factory_code)
        );
        const filteredDepartments = allDepartments.filter((dept) =>
          deptCodes.includes(`${dept.factory_code}-${dept.department_code}`)
        );

        // LƯU TẤT CẢ DEPARTMENTS TÌM ĐƯỢC
        setAllSearchDepartments(filteredDepartments);

        setFactories([{ tableName: "FACTORY", data: filteredFactories }]);

        // Chọn factory đầu tiên
        const firstFactory = filteredFactories[0];
        setSelectFactory(firstFactory);

        // Lọc departments theo factory đầu tiên
        const firstFactoryDepts = filteredDepartments.filter(
          (d) => d.factory_code === firstFactory.factory_code
        );
        setDepartments([{ tableName: "DEPARTMENTS", data: firstFactoryDepts }]);

        if (firstFactoryDepts.length > 0) {
          const firstDept = firstFactoryDepts[0];
          setSelectDepartment(firstDept);

          // Filter users theo factory và department đầu tiên
          const filteredUsers = users.filter(
            (u) =>
              u.factory_code === firstFactory.factory_code &&
              u.department_code === firstDept.department_code
          );

          if (filteredUsers.length > 0) {
            setSelectRows([filteredUsers[0]]);
            setData([{ tableName: response.tableName, data: filteredUsers }]);
          } else {
            setSelectRows([]);
            setData([{ tableName: "USER", data: [] }]);
          }
        } else {
          setSelectRows([]);
          setData([{ tableName: "USER", data: [] }]);
        }
      }
    } catch (error) {
      console.log("cannot search because", error);
    }
  };
  //handler search department by factory
  const handleSearchFactory = async (newFilter) => {
    try {
      const response = await searchFactoryByFilter(
        newFilter,
        user.access_token
      );

      if (!response.success || !response.data || response.data.length === 0) {
        setIsSearch(false);
        setIsFactorySearch(false);
        setFactories([{ tableName: "FACTORY", data: [] }]);
        setDepartments([{ tableName: "DEPARTMENTS", data: [] }]);
        setSelectFactory({});
        setSelectDepartment({});
        setSelectRows([]);
        setData([{ tableName: "USER", data: [] }]);
        setAllSearchDepartments([]); // Reset
        return;
      }

      setIsSearch(true);
      setIsFactorySearch(true);

      const searchedFactories = response.data;
      setFactories([{ tableName: "FACTORY", data: searchedFactories }]);

      // LẤY TẤT CẢ DEPARTMENTS CỦA TẤT CẢ FACTORIES TÌM ĐƯỢC
      const allDeptPromises = searchedFactories.map((fac) =>
        fetchDepartmentByFac(fac.factory_code)
      );
      const allDeptResponses = await Promise.all(allDeptPromises);

      // Gộp tất cả departments lại
      const allDepts = allDeptResponses
        .filter((res) => res?.data)
        .flatMap((res) => res.data);

      setAllSearchDepartments(allDepts); // LƯU TẤT CẢ

      // Hiển thị factory đầu tiên
      const firstFactory = searchedFactories[0];
      setSelectFactory(firstFactory);

      // Lọc departments của factory đầu tiên
      const firstFactoryDepts = allDepts.filter(
        (d) => d.factory_code === firstFactory.factory_code
      );

      if (firstFactoryDepts.length === 0) {
        setDepartments([{ tableName: "DEPARTMENTS", data: [] }]);
        setSelectDepartment({});
        setSelectRows([]);
        setData([{ tableName: "USER", data: [] }]);
        return;
      }

      setDepartments([{ tableName: "DEPARTMENTS", data: firstFactoryDepts }]);
      const firstDept = firstFactoryDepts[0];
      setSelectDepartment(firstDept);

      // Fetch users
      const userResponse = await fetchUserByDepartment(
        firstFactory.factory_code,
        firstDept.department_code
      );

      if (!userResponse?.data || userResponse.data.length === 0) {
        setSelectRows([]);
        setData([{ tableName: "USER", data: [] }]);
        return;
      }

      setSelectRows([userResponse.data[0]]);
      setData([{ tableName: userResponse.tableName, data: userResponse.data }]);
    } catch (error) {
      console.error("Error in handleSearchFactory:", error);
      setIsSearch(false);
      setIsFactorySearch(false);
      setFactories([{ tableName: "FACTORY", data: [] }]);
      setDepartments([{ tableName: "DEPARTMENTS", data: [] }]);
      setSelectFactory({});
      setSelectDepartment({});
      setSelectRows([]);
      setData([{ tableName: "USER", data: [] }]);
      setAllSearchDepartments([]);
    }
  };
  //handler search filter
  const handleSearchByFilter = async (filteredUser) => {
    try {
      const search = filteredUser.search || {};
      const keys = Object.keys(search);

      //  if (keys.length === 0) {
      //         setIsSearch(false);
      //         setSearchData([]);
      //         if (isFactorySearch) {
      //           setIsFactorySearch(false);
      //         }
      //         await fetchS();
      //         if (selectFactory?.factory_code) {
      //           await fetchD();
      //         } else {
      //           const combinedData = await fnQuery([() => fetchDepartments()]);
      //           setData(combinedData);
      //           if (combinedData?.[0]?.data?.length > 0) {
      //             setSelectRows([combinedData[0].data[0]]);
      //           }
      //         }
      //         return;
      //       }

      if (keys.length === 0) {
        setIsSearch(false);
        setSearchData([]);
        if (isFactorySearch) {
          setIsFactorySearch(false);
          await fetchU();
        } else {
          await fetchU();
        }
        return;
      }
      const hasFactory = search.factory_code || search.factory_name;
      const hasOther = keys.some(
        (k) => k !== "factory_code" && k !== "factory_name"
      );
      if (hasFactory && !hasOther) {
        await handleSearchFactory(filteredUser);
      } else {
        await handleSearch(filteredUser);
      }
    } catch (error) {
      console.log("cannot search because", error);
    }
  };
  //handler import excel
  const handleImport = async () => {
    const form = new FormData();
    form.append("file", file);
    try {
      const result = await importExcelUser(user.access_token, form);

      if (result.importRows.success) {
        await fetchU(user.access_token);
      }
    } catch (error) {
      if (error.message.includes("ERR_UPLOAD_FILE_CHANGED")) {
        toast.error("Please choose again !");
        setFile("");
      }
    }
  };
  //handler export excel
  const handleExport = async () => {
    const excel = await exportExcelUser(user.access_token);
  };
  //handler export pdf
  const handlePDF = async () => {
    await exportPDFUser();
  };
  //handler image file
  const handleFile = (e) => {
    const selectedFiled = e.target.files[0];
    if (selectedFiled) {
      setFile(selectedFiled);
    }
  };
  //==========END HANDLER SECTION ================

  //========== LABEL TRANSLATION HANDLER ==============
  //handler translation by control ui
  const getControlLabel = (fieldCode, fallback) => {
    if (!controlTranslations || controlTranslations.length === 0) {
      return fallback;
    }
    const translation = controlTranslations.find(
      (item) => item.field === fieldCode
    );
    return translation?.title || fallback;
  };
  //handler translation by column table
  const getColumnLabel = (fieldCode, fallback) => {
    if (!columnTranslations || columnTranslations.length === 0) {
      return fallback;
    }

    const translation = columnTranslations.find(
      (item) => item.field === fieldCode
    );
    return translation?.title || fallback;
  };
  //========== END LABEL TRANSLATION HANDLER ==============
  let columns = 1;
  if (isLgUp) columns = 3;
  else if (isMdUp) columns = 2;
  else if (isSmUp) columns = 1;
  else columns = 1;
  const itemWidth =
    data.length > 0 ? `${100 / data.length}%` : `${100 / columns}%`;
  return (
    <>
      {/* ========== MAIN CONTENT AREA ========== */}
      <Box>
        <Container maxWidth="xl">
          {/* <Typography
            variant="h3"
            component="div"
            textAlign={"center"}
            fontWeight={"bold"}
          >
            {data.length > 0 ? data[0].tableName : "Loading...."}
          </Typography> */}
          <Stack
            direction="row"
            flexWrap="wrap"
            sx={{ rowGap: 1, width: "100%" }}
          >
            <Paper
              sx={{
                width: "100%",
                maxWidth: "100%",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <div style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                <DataTable
                  data={data[0]?.data}
                  tableName={data[0]?.tableName}
                  onAdd={handleOpenAdd}
                  onEdit={handleOpenEdit}
                  onSetFilter={onSetFilter}
                  filter={filter}
                  onSearch={handleSearchByFilter}
                  onSelectChange={handleSelectChoose}
                  onDelete={(row) => {
                    handleModal(row);
                  }}
                  onDeleteAll={(row) => {
                    handleModal(row);
                  }}
                  onDetail={(row) => {
                    handleDetailModal(row);
                  }}
                  onPDF={handlePDF}
                  onConfirm={handleConfirm}
                  onCancel={handleCancle}
                  selectRows={selectRows}
                  onExport={handleExport}
                  onImport={handleImport}
                  onFile={handleFile}
                  file={file}
                  factories={factories}
                  selectFactory={selectFactory}
                  onSelectFactory={handleSelectFactory}
                  departments={departments}
                  selectDepartment={selectDepartment}
                  onSelectDepartment={handleSelectDepartment}
                  columnTranslations={columnTranslations}
                  controlTranslations={controlTranslations}
                  language={language}
                  getControlLabel={getControlLabel}
                  getColumnLabel={getColumnLabel}
                  jumpToRow={jumpToRow}
                />
              </div>
            </Paper>
          </Stack>
        </Container>
      </Box>
      {/* ========== LOADING SKELETON ========== */}
      {data.length === 0 && (
        <Stack direction="row" flexWrap="wrap" sx={{ rowGap: 1 }}>
          <div style={{ width: itemWidth, minWidth: 0 }}>
            <Skeleton animation="wave" variant="rectangular" height={600} />
          </div>
        </Stack>
      )}
      {/* ========== MODAL/DIALOG COMPONENTS ========== */}
      {/*  Add USER Modal */}
      {/* - Mở khi user click "Add" button */}
      {/* - Gọi handleAdd khi submit form */}
      <AddUserPage
        open={openAdd}
        handleClose={handleAddClose}
        handleAdd={handleAdd}
        handleSelectFactory={handleSelectFactory}
        handleSelectDepartment={handleSelectDepartment}
        handleSelectUser={setSelectSupervisor}
        departments={departments}
        users={data}
        selectFactory={selectFactory}
        selectDepartment={selectDepartment}
        selectUser={selectSupervisor}
        getColumnLabel={getColumnLabel}
        getControlLabel={getControlLabel}
        language={language}
      />
      {/*  Edit USER Modal */}
      {/* - Mở khi user click "edit" button */}
      {/* - Gọi handleEdit khi submit form */}
      <EditUserPage
        open={openEdit}
        onClose={handleEditClose}
        handleEdit={handleEdit}
        handleSelectSupervisor={setSelectSupervisor}
        getUsersByDept={fetchUserByDept}
        users={data}
        selectUser={selectRows.length > 0 ? selectRows[0] : null}
        selectSupervisor={selectSupervisor}
        selectFactory={selectFactory}
        selectDepartment={selectDepartment}
        getColumnLabel={getColumnLabel}
        getControlLabel={getControlLabel}
        language={language}
      />
      {/*  Delete Confirmation Modal */}
      {/* - Mở khi user click "Delete" button */}
      {/* - Gọi handleDelete (single hoặc multiple) khi confirm */}
      {/* - Xóa hàng được chọn từ selectRow hoặc selectRows */}
      <AcShoeMDeletePage
        shoe={selectRow}
        open={open}
        onClose={handleClose}
        onConfirm={handleDelete}
        title={"Delete Shoe"}
        message={"Do you want to delete this ?"}
      />
    </>
  );
};
export default User;
