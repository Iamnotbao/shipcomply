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
  copyUsersPermission,
  deleteUserPermisison,
  exportPDFPermisison,
  fetchPermissionByFactoryAndUser,
  fetchTablePermission,
  fetchUsersPermission,
  searchPermissionByFilter,
} from "../../service/users_permission/UsersPermission";
import { toast } from "react-toastify";
import { fetchUsers, searchUserByFilter } from "../../service/user/userService";
import { fetchFactory } from "../../service/factory/factoryService";
import {
  fetchDepartmentByFac,
  fetchDepartments,
} from "../../service/factory_departments/FacDepartmentService";
import { fetchPrograms } from "../../service/program/programService";
import AddFacDept from "../../features/users_permission/page/AddFactDept";
import {
  addUPD,
  editUPD,
  exportPDFUPD,
  fetchUPD,
  fetchUPDByUser,
} from "../../service/users_permisison_department/usersPermissionDepartmentService";
import { set } from "react-hook-form";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import useAuth from "../../hooks/useAuth";
import CopyPopup from "../../features/users_permission/page/CopyPopup";

const Permission = () => {
  const [data, setData] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openPermission, setOpenPermission] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [selectRow, setSelectRow] = useState({});
  const [selectRows, setSelectRows] = useState([]);
  const [factories, setFactories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [permisisons, setPermissions] = useState([]);
  const [searchedUsersPermission, setSearchedUsersPermission] = useState([]);
  const [selectFactory, setSelectFactory] = useState({});
  const [selectDepartment, setSelectDepartment] = useState({});
  const [selectProgram, setSelectProgram] = useState({});
  const [users, setUsers] = useState([]);
  const [jumpToRow, setJumpToRow] = useState(null);
  const [authorization, setAuthorizations] = useState({});
  const [selectUser, setSelectUser] = useState({});
  const [selectCopyUser, setSelectCopyUser] = useState({});
  const [openDetail, setOpenDetail] = useState(false);
  const [allSearchPermissions, setAllSearchPermissions] = useState([]);
  const [isSearchByUser, setIsSearchByUser] = useState(false);
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const [lastSearchFilter, setLastSearchFilter] = useState(null);
  const {
    fetchTableControlTranslations,
    fetchTableColumnTranslations,
    language,
  } = useColumnTranslation();
  const { user } = useAuth();
  //========== FETCH DATA SECTION ================

  //fetch permission , users, factory, department , program
  const fetchAll = async () => {
    const [fact, dept, userData, prog, per] = await fnQuery([
      () => fetchFactory(),
      () => fetchDepartments(),
      () => fetchUsers(),
      () => fetchPrograms(),
      () => fetchUsersPermission(),
    ]);

    if (fact) {
      setFactories([{ tableName: fact.tableName, data: fact.data }]);
    }
    if (dept) {
      setDepartments([{ tableName: dept.tableName, data: dept.data }]);
    }
    if (prog) {
      setSelectProgram(prog.data[0]);
      setPrograms([{ tableName: prog.tableName, data: prog.data }]);
    }
    if (userData && userData.data && userData.data.length > 0) {
      const firstUser = userData.data[0];
      setUsers([{ tableName: userData.tableName, data: userData.data }]);
      setSelectUser(firstUser);
      const userDataResponse = await fetchUPDByUser(firstUser.user_code);
      if (
        userDataResponse &&
        userDataResponse.data &&
        userDataResponse.data.length > 0 &&
        userDataResponse.data[0]
      ) {
        setData([
          {
            tableName: "USER_PERMISSION_DEPARTMENT",
            data: userDataResponse.data,
          },
        ]);
        setSelectRows([userDataResponse.data[0]]);
      } else {
        setData([{ tableName: "USER_PERMISSION_DEPARTMENT", data: [] }]);
        setSelectRows([]);
      }
    } else {
      setUsers([{ tableName: "USER", data: [] }]);
      setData([{ tableName: "USER_PERMISSION_DEPARTMENT", data: [] }]);
      setSelectRows([]);
    }
  };
  //fetch all department by factory
  const fetchDeptByFactory = async () => {
    const response = await fetchDepartmentByFac(selectFactory.factory_code);
    if (response) {
      setDepartments([{ tableName: response.tableName, data: response.data }]);
    }
  };
  const fetchAllUPD = async () => {
    const response = await fetchUPD();
    return response;
  };
  //fetch all user permission department by searchData base on department
  const fetchUPDAndFilter = async (departmentData) => {
    try {
      const updResponse = await fetchUPD();
      const allUPD = updResponse?.data || [];

      //  KHÔNG set data nữa, CHỈ return kết quả
      const filteredByUPD = allUPD.filter((dept) => {
        return departmentData.some(
          (upd) =>
            upd.user_code === dept.user_code &&
            upd.factory_code === dept.factory_code &&
            upd.department_code === dept.department_code,
        );
      });

      //  RETURN thay vì setState
      return filteredByUPD;
    } catch (error) {
      console.error("Error fetching UPD:", error);
      return [];
    }
  };
  //fetch all permisison by user
  const fetchPerByUser = async () => {
    const response = await fetchUPDByUser(selectUser.user_code);
    if (
      response &&
      response.data &&
      response.data.length > 0 &&
      response.data[0]
    ) {
      setData([
        { tableName: "USER_PERMISSION_DEPARTMENT", data: response.data },
      ]);
      setSelectRows([response.data[0]]);
    } else {
      setData([{ tableName: "USER_PERMISSION_DEPARTMENT", data: [] }]);
      setSelectRows([]);
    }
  };
  //fetch all translation by user
  const fetchAllTranslations = async () => {
    try {
    const columns = await fetchTableColumnTranslations(
        "USER_PERMISSION",
        "master",
        "user_permision",
      );
      const controls = await fetchTableControlTranslations("USER_PERMISSION");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user.factory,
        user.department,
        user.user_code,
        "USER_PERMISSION",
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
  useEffect(() => {
    fetchAllTranslations();
  }, [language]);
  //  UseEffect #1: Initial Load
  useEffect(() => {
    fetchAll();
  }, []);

  //  UseEffect #2: Users Empty Check
  useEffect(() => {
    if (
      users &&
      users.length > 0 &&
      users[0]?.data &&
      users[0].data.length === 0
    ) {
      setData([{ tableName: "USER_PERMISSION_DEPARTMENT", data: [] }]);
      setSelectRows([]);
    }
  }, [users]);

  //  UseEffect #3: Factory Change
  useEffect(() => {
    if (selectFactory && selectFactory.factory_code) {
      fetchDeptByFactory();
    }
  }, [selectFactory]);

  //  UseEffect #4: SelectUser Change (MAIN LOGIC)
  // Sửa UseEffect #4
  useEffect(() => {
    if (selectUser && selectUser.user_code) {
      if (!isSearch) {
        //  Normal mode
        fetchPerByUser();
      } else if (isSearchByUser) {
        // Search by USER mode - load TẤT CẢ UPD

        (async () => {
          try {
            const userDataResponse = await fetchUPDByUser(selectUser.user_code);

            if (userDataResponse?.data?.length > 0) {
              const allUPD = userDataResponse.data;

              setData([
                {
                  tableName: "USER_PERMISSION_DEPARTMENT",
                  data: allUPD,
                },
              ]);

              setSelectRows([allUPD[0]]);
            } else {
              setData([{ tableName: "USER_PERMISSION_DEPARTMENT", data: [] }]);
              setSelectRows([]);
            }
          } catch (error) {
            console.error("   Error loading UPD:", error);
            setData([{ tableName: "USER_PERMISSION_DEPARTMENT", data: [] }]);
            setSelectRows([]);
          }
        })();
      } else {
        //  Search by PROGRAM mode - chỉ load UPD của user trong filtered list

        (async () => {
          try {
            // Lấy TẤT CẢ UPD
            const allUPDResponse = await fnQuery([() => fetchUPD()]);
            const allUPD = allUPDResponse?.[0]?.data || [];

            // Lọc theo permissions từ search
            const permissionKeys = searchData.map(
              (p) => `${p.factory_code}-${p.department_code}-${p.user_code}`,
            );

            const filteredUPD = allUPD.filter((upd) =>
              permissionKeys.includes(
                `${upd.factory_code}-${upd.department_code}-${upd.user_code}`,
              ),
            );

            // CHỈ lấy UPD của user hiện tại
            const userUPD = filteredUPD.filter(
              (upd) => upd.user_code === selectUser.user_code,
            );

            setData([
              {
                tableName: "USER_PERMISSION_DEPARTMENT",
                data: userUPD,
              },
            ]);

            if (userUPD.length > 0) {
              setSelectRows([userUPD[0]]);
            } else {
              setSelectRows([]);
            }
          } catch (error) {
            console.error("  Error:", error);
            setData([{ tableName: "USER_PERMISSION_DEPARTMENT", data: [] }]);
            setSelectRows([]);
          }
        })();
      }
    }
  }, [selectUser?.user_code, isSearch, isSearchByUser]);

  //  UseEffect #6: Update SearchedUsersPermission
  useEffect(() => {
    if (isSearch && selectRows && selectRows.length > 0) {
      if (isSearchByUser) {
        //  Search by USER → Fetch từ API
        (async () => {
          try {
            const selectedRow = selectRows[0];
            const permissions = await fetchPermissionByFactoryAndUser(
              selectedRow.factory_code,
              selectedRow.department_code,
              selectedRow.user_code,
            );

            setSearchedUsersPermission(permissions?.data || []);
          } catch (error) {
            console.error("   Error fetching permissions for row:", error);
            setSearchedUsersPermission([]);
          }
        })();
      } else {
        // Search by PROGRAM → Filter từ searchData

        const selectedRow = selectRows[0];
        const filteredData = searchData.filter(
          (d) =>
            d.user_code === selectedRow.user_code &&
            d.factory_code === selectedRow.factory_code &&
            d.department_code === selectedRow.department_code,
        );

        setSearchedUsersPermission(filteredData);
      }
    } else if (isSearch && selectRows.length === 0) {
      //  Không có selectRows
      setSearchedUsersPermission([]);
    }
  }, [
    selectRows,
    selectRows?.[0]?.user_code,
    selectRows?.[0]?.factory_code,
    selectRows?.[0]?.department_code,
    isSearch,
    isSearchByUser,
  ]);
  useEffect(() => {
    if (jumpToRow) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow]);
  // ========== END USEEFFECT SECTION ==========

  //========== HANDLER SECTION ================
  //handler close user permission popup
  const handlePermisisonClose = () => {
    setOpenPermission(false);
  };
  //handler open user permission popup
  const handlePermisisonOpen = () => {
    setOpenPermission(true);
    handleAdd();
  };
  //handler close add popup
  const handleAddClose = () => {
    setOpenAdd(false);
  };
  //handler open add popup
  const handleOpenAdd = () => {
    const allowAdd = authorization?.find(
      (item) => item.field === "allow_add",
    )?.title;
    if (user?.user_code !== "admin" && allowAdd === "N") {
      return;
    }
    setOpenAdd(true);
  };
  //handler close edit popup
  const handleEditClose = () => {
    setOpenEdit(false);
    setSelectRows([]);
  };
  //handler open edit popup
  const handleOpenEdit = () => {
    if (selectRows.length === 1) {
      const allow = authorization?.find(
        (item) => item.field === "allow_modify",
      )?.title;
      if (user?.user_code !== "admin" && allow === "N") {
        return;
      }
      setOpenEdit(true);
    }
  };
  //handler select user
  const handleSelectUser = (row) => {
    setSelectUser(row);
  };
  const handleClose = () => setOpen(false);

  const handleModal = (row) => {
    setSelectRow(row);
    setOpen(true);
  };
  //handler toggle query permission
  const handleSelectQuery = async (row, value) => {
    const updateRow = {
      ...row,
      query_level: value,
    };
    await handleEdit(updateRow);
  };
  // handler toggle copy
  const handleOpenCopy = () => setOpenLink(true);

  const handleCopyClose = () => setOpenLink(false);

  const handleCopy = async (new_user) => {
    const data = {
      new_user: new_user,
      old_user: selectUser?.user_code,
      grt_user: user?.user_code,
    };
    await copyUsersPermission(data);
    if (isSearch && lastSearchFilter) {
      await handleSearchByFilter(lastSearchFilter);
    } else {
      await fetchAll();
    }
    handleCopyClose();
  };

  //handler add permission
  const handleAdd = async (e, factory_code, department_code) => {
    e.preventDefault();
    let addData = {};
    addData.factory_code = factory_code;
    addData.department_code = department_code;
    addData.user_code = selectUser.user_code;
    addData.grt_user = selectUser.user_code;
    addData.grt_dept = selectUser.department_code;

    try {
      const response = await addUPD(addData);
      if (response.success) {
        toast.success("Add successfully !!!");
        handleAddClose();
        try {
          const combinedData = await fnQuery([
            () => fetchUPDByUser(selectUser.user_code),
          ]);
          if (combinedData && combinedData[0]?.data) {
            setData(combinedData);
            const addedPer = combinedData[0].data.find(
              (item) =>
                `${item.factory_code}-${item.department_code}-${item.user_code}` ===
                `${addData.factory_code}-${addData.department_code}-${addData.user_code}`,
            );
            if (addedPer) {
              setSelectRows([addedPer]);
              setJumpToRow(addedPer);
            }
          }
        } catch (fetchError) {
          console.error("Error fetching data after add:", fetchError);
          toast.warning("Added successfully but failed to refresh data");
        }
      } else {
        toast.dismiss("error-duplicate");
        toast.error(response.data?.message || "Add failed !!!", {
          toastId: "error-duplicate",
        });
      }
    } catch (error) {
      toast.error(`${error.response?.data?.message}`);
    }
  };
  //handler search by permission
  const handleSearch = async (newFilter) => {
    try {
      const response = await searchPermissionByFilter(newFilter);
      setIsSearchByUser(false);
      if (response && response.data && response.data.length > 0) {
        const permissions = response.data;
        setIsSearch(true);

        // ... existing filter logic (UPD, users, factories, departments)
        const allUPDResponse = await fnQuery([() => fetchUPD()]);
        const allUPD = allUPDResponse?.[0]?.data || [];

        const permissionKeys = permissions.map(
          (p) => `${p.factory_code}-${p.department_code}-${p.user_code}`,
        );

        const filteredUPD = allUPD.filter((upd) =>
          permissionKeys.includes(
            `${upd.factory_code}-${upd.department_code}-${upd.user_code}`,
          ),
        );

        setSearchData(permissions);
        setSearchedUsersPermission(permissions);

        // Filter Users
        const userCodes = [...new Set(filteredUPD.map((p) => p.user_code))];
        const allUsersResponse = await fnQuery([() => fetchUsers()]);
        const allUsers = allUsersResponse?.[0]?.data || [];
        const filteredUsers = allUsers.filter((u) =>
          userCodes.includes(u.user_code),
        );
        setUsers([{ tableName: "USER", data: filteredUsers }]);
        setSelectUser(filteredUsers[0]);

        // Filter Departments
        const allDepartmentsResponse = await fnQuery([
          () => fetchDepartments(),
        ]);
        const allDepartments = allDepartmentsResponse?.[0]?.data || [];
        const deptCodesInSearch = [
          ...new Set(
            filteredUPD.map(
              (item) => `${item.factory_code}-${item.department_code}`,
            ),
          ),
        ];
        const filteredDepts = allDepartments.filter((dept) =>
          deptCodesInSearch.includes(
            `${dept.factory_code}-${dept.department_code}`,
          ),
        );
        setDepartments([{ tableName: "DEPARTMENTS", data: filteredDepts }]);

        // Set data
        if (filteredUsers.length > 0) {
          const firstUser = filteredUsers[0];
          const userUPD = filteredUPD.filter(
            (p) => p.user_code === firstUser.user_code,
          );

          setData([{ tableName: "USER_PERMISSION_DEPARTMENT", data: userUPD }]);

          if (userUPD.length > 0 && userUPD[0]) {
            setSelectRows([userUPD[0]]);
          } else {
            setSelectRows([]);
          }
        } else {
          setData([{ tableName: "USER_PERMISSION_DEPARTMENT", data: [] }]);
          setSelectRows([]);
        }
      } else {
        setIsSearch(true);
        //  Không có kết quả → Clear state và reload
        setSearchData([]);
        setSearchedUsersPermission([]);
        setSelectRows([]);

        //  Gọi fetchAll để reload users list
        setUsers([]);
      }
    } catch (error) {
      console.log("cannot search because", error);

      //  Lỗi ->Clear state và reload
      setSearchData([]);
      setSearchedUsersPermission([]);
      setSelectRows([]);

      await fetchAll();
    }
  };
  //handler search by user
  const handleSearchUser = async (newFilter) => {
    try {
      const response = await searchUserByFilter(newFilter);
      if (response.success) {
        setUsers([response]);
        setIsSearch(true);
        setIsSearchByUser(true);
        setSelectUser(response.data[0]);

        //  Bước 1: Fetch TẤT CẢ UPD của user
        const userDataResponse = await fetchUPDByUser(
          response.data[0]?.user_code,
        );

        if (userDataResponse?.data?.length > 0) {
          const allUPD = userDataResponse.data;
          //  Bước 2: Fetch permissions từ database
          const allPermission = await fnQuery([() => fetchUsersPermission()]);
          const allPers = allPermission?.[0]?.data || [];

          const userCodes = response.data.map((u) => u.user_code);
          const filteredPer = allPers.filter((per) =>
            userCodes.includes(per.user_code),
          );
          setAllSearchPermissions(filteredPer);
          //  Bước 3: Map TẤT CẢ UPD với permissions
          // Nếu UPD có permission → trả về array permissions
          // Nếu UPD KHÔNG có permission → trả về array rỗng []
          const mappedSearchData = allUPD.map((upd) => {
            // Tìm tất cả permissions của UPD này
            const matchingPermissions = filteredPer.filter(
              (per) =>
                per.user_code === upd.user_code &&
                per.factory_code === upd.factory_code &&
                per.department_code === upd.department_code,
            );

            // Trả về permissions hoặc empty array
            return matchingPermissions.length > 0 ? matchingPermissions : [];
          });

          //  Flatten và set searchData
          const flattenedSearchData = mappedSearchData.flat();
          setSearchData(flattenedSearchData);

          //  Set data = TẤT CẢ UPD
          setData([
            {
              tableName: "USER_PERMISSION_DEPARTMENT",
              data: allUPD,
            },
          ]);
          setSelectRows([allUPD[0]]);
        } else {
          setData([{ tableName: "USER_PERMISSION_DEPARTMENT", data: [] }]);
          setSelectRows([]);
          setSearchData([]);
        }
      }
    } catch (error) {
      console.error("handleSearchUser error:", error);
    }
  };
  //handler search by filter
  const handleSearchByFilter = async (filteredShoe) => {
    try {
      setLastSearchFilter(filteredShoe);
      const search = filteredShoe.search || {};
      const keys = Object.keys(search);

      if (keys.length === 0) {
        //  Clear search → Reset state và reload
        setIsSearch(false);
        setIsSearchByUser(false);
        setSearchData([]);
        setSearchedUsersPermission([]);
        setSelectRows([]);

        await fetchAll();
        return;
      }

      const hasUser =
        search.user_code ||
        search.user_name ||
        search.factory_code ||
        search.factory_name;
      const hasOther = keys.some(
        (k) =>
          k !== "user_code" &&
          k !== "user_name" &&
          k !== "factory_code" &&
          k !== "factory_name",
      );

      if (hasUser && !hasOther) {
        await handleSearchUser(filteredShoe);
      } else {
        await handleSearch(filteredShoe);
      }
    } catch (error) {
      console.log("cannot search because", error);

      //  Lỗi → Reset
      setIsSearch(false);
      setSearchData([]);
      setSearchedUsersPermission([]);
      setSelectRows([]);

      await fetchAll();
    }
  };
  //handler toggle modify level
  const handleSelectModify = async (row, value) => {
    const updateRow = {
      ...row,
      modify_level: value,
    };
    await handleEdit(updateRow);
  };
  //handler confirm permissions
  const handleConfirm = async (row, value) => {
    if (data[0].data.length > 0) {
      // const update = { ...selectRows[0], };
      const allow = authorization?.find(
        (item) => item.field === "allow_confirm",
      )?.title;
      if (user?.user_code !== "admin" && allow === "N") {
        return;
      }
      const updateConfirm = { ...selectRows[0], status: 1 };
      await handleEdit(updateConfirm, "status");
    }
  };
  //handler cancel permissions
  const handleCancel = async (row, value) => {
    if (data[0].data.length > 0) {
      const allow = authorization?.find(
        (item) => item.field === "allow_confirm",
      )?.title;
      if (user?.user_code !== "admin" && allow === "N") {
        return;
      }
      const updateCancel = { ...selectRows[0], status: 0 };
      await handleEdit(updateCancel, "status");
    }
  };

  const handleDelete = async () => {
    const result = await deleteUserPermisison(user.access_token, selectRow);
    if (result.success) {
      toast.success("Delete permission successfully!");
      await fetchUsers();
      handleClose();
    } else {
      toast.error("Cannot delete");
      handleClose();
    }
  };
  //handler select row permission
  const handleSelectChoose = (rows) => {
    //  Luôn tạo new array để trigger re-render
    setSelectRows([...rows]);

    if (isSearch) {
      const filteredData = searchData.filter((d) =>
        rows.find(
          (r) =>
            r.user_code === d.user_code &&
            r.factory_code === d.factory_code &&
            r.department_code === d.department_code,
        ),
      );
      setSearchedUsersPermission(filteredData);
    }
  };
  //handler export pdf
  const handlePDF = async () => {
    await exportPDFUPD();
  };
  //handler edit permission
  const handleEdit = async (updateRow) => {
    const { statusText, ...cleanData } = updateRow;
    cleanData.last_user = selectUser.user_code;
    cleanData.last_date = new Date().toISOString();
    const result = await editUPD(cleanData);
    if (result.success) {
      setData((prevData) => {
        if (!prevData.length) {
          return prevData;
        }
        const { factory_code, user_code, department_code } = cleanData;
        const itemKey = `${factory_code}-${user_code}-${department_code}`;
        const filterPermission = prevData.map((table) => ({
          ...table,
          data: table.data
            .map((p) => {
              const eachKey = `${p.factory_code}-${p.user_code}-${p.department_code}`;
              return eachKey === itemKey ? { ...p, ...cleanData } : p;
            })
            .filter(
              (item, index, self) =>
                index ===
                self.findIndex(
                  (t) =>
                    `${t.factory_code}-${t.user_code}-${t.department_code}` ===
                    `${item.factory_code}-${item.user_code}-${item.department_code}`,
                ),
            ),
        }));
        return filterPermission;
      });
      setSelectRows([cleanData]);
      setJumpToRow(cleanData);
      toast.success(`Grant Priviliage for user ${updateRow.user_code}!`);
    } else {
      toast.error(`Cannot grant Privilage for user ${updateRow.user_code}!`);
    }
  };

  const handleDetailModal = (row) => {
    setSelectRow(row);
    setOpenDetail(true);
  };

  const handleDetailClose = () => setOpenDetail(false);

  const handleChecked = async (event, row, field) => {
    const newState = event.target.checked ? "Y" : "N";
    const updateRow = {
      ...row,
      [field]: newState,
    };
    await handleEdit(updateRow);
  };
  //==========END HANDLER SECTION ================

  //========== LABEL TRANSLATION HANDLER ==============

  //handler translation by control ui
  const getControlLabel = (fieldCode, fallback) => {
    if (!controlTranslations || controlTranslations.length === 0) {
      return fallback;
    }
    const translation = controlTranslations.find(
      (item) => item.field === fieldCode,
    );
    return translation?.title || fallback;
  };
  //handler translation by column table
  const getColumnLabel = (fieldCode, fallback) => {
    if (!columnTranslations || columnTranslations.length === 0) {
      return fallback;
    }

    const translation = columnTranslations.find(
      (item) => item.field === fieldCode,
    );
    return translation?.title || fallback;
  };
  const createUsersCallback = (fieldName) => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchUsers(user?.access_token);
        const newData = [...result?.data, { user_code: "" }];
        return {
          data: newData || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error(`Error fetching basic data:`, error);
        return { data: [], total: 0, pageSize };
      }
    };
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
          <Stack
            direction="row"
            flexWrap="wrap"
            sx={{ rowGap: 1, width: "100%" }}
          >
            {" "}
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
                  tableName={"USER_PERMISSION_DEPARTMENT"}
                  onChecked={handleChecked}
                  selectRows={selectRows}
                  onSelectChange={handleSelectChoose}
                  onDelete={(row) => {
                    handleModal(row);
                  }}
                  onSelectModify={handleSelectModify}
                  onSelectQuery={handleSelectQuery}
                  onView={handlePermisisonOpen}
                  onAdd={handleOpenAdd}
                  onEdit={handleOpenEdit}
                  onDetail={(row) => {
                    handleDetailModal(row);
                  }}
                  onCancel={handleCancel}
                  onConfirm={handleConfirm}
                  onSearch={handleSearchByFilter}
                  users={users}
                  selectUser={selectUser}
                  onSelectUser={handleSelectUser}
                  factories={factories}
                  selectFactory={selectFactory}
                  onSelectFactory={setSelectFactory}
                  departments={departments}
                  selectDepartment={selectDepartment}
                  onSelectDepartment={setSelectDepartment}
                  getDepartmentByFac={fetchDepartmentByFac}
                  onPDF={handlePDF}
                  isSearch={isSearch}
                  searchData={searchedUsersPermission}
                  programs={programs}
                  selectProgram={selectProgram}
                  onSelectProgram={setSelectProgram}
                  columnTranslations={columnTranslations}
                  controlTranslations={controlTranslations}
                  language={language}
                  getControlLabel={getControlLabel}
                  getColumnLabel={getColumnLabel}
                  jumpToRow={jumpToRow}
                  onCopy={handleOpenCopy}
                />
              </div>
            </Paper>
          </Stack>
        </Container>
      </Box>
      {/* ========== MODAL/DIALOG COMPONENTS ========== */}
      {/*  Add Permission Modal */}
      {/* - Mở khi user click "Add" button */}
      {/* - Gọi handleAdd khi submit form */}
      <AddFacDept
        open={openAdd}
        handleAdd={handleAdd}
        handleClose={handleAddClose}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        language={language}
      />
      {/* ========== LOADING SKELETON ========== */}
      {data.length === 0 && (
        <Stack direction="row" flexWrap="wrap" sx={{ rowGap: 1 }}>
          <div style={{ width: itemWidth, minWidth: 0 }}>
            <Skeleton animation="wave" variant="rectangular" height={600} />
          </div>
        </Stack>
      )}
      <CopyPopup
        openLink={openLink}
        onClose={handleCopyClose}
        onSave={handleCopy}
        selectPermissison={selectRows[0] ?? {}}
        fetchUser={fetchUsers}
        getControlLabel={getControlLabel}
        language={language}
      />
    </>
  );
};

export default Permission;
