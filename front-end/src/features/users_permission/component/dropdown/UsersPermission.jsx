import { useEffect, useState } from "react";
import DataTable from "../../../../component/table/DataTable";
import {
  Box,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { fnQuery } from "../../../../utils/fnQuery";
import {
  addUserPermission,
  deleteUserPermisison,
  editUsersPermission,
  exportPDFPermisison,
  fetchPermissionByFactoryAndUser,
  fetchTablePermission,
  fetchUsersPermission,
  searchPermissionByFilter,
} from "../../../../service/users_permission/UsersPermission";
import { toast } from "react-toastify";
import {
  fetchUserByDepartment,
  fetchUsers,
  searchUserByFilter,
} from "../../../../service/user/userService";
import AddUserPermission from "../../page/AddUserPermission";
import EditUserPermission from "../../page/EditUserPermission";
import { useColumnTranslation } from "../../../../context/ColumnTranslationContext";
import useAuth from "../../../../hooks/useAuth";
const UsersPermission = ({
  isSearch = false,
  selectRows,
  selectUser,
  selectFactory,
  selectProgram,
  selectDepartment,
  onSelectFactory,
  onSelectDepartment,
  onSelectProgram,
  onSelectUser,
  factories,
  factory_code,
  departments,
  programs,
  searchData,
}) => {
  const [data, setData] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectSupervisor, setSelectSupervisor] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const theme = useTheme();
  const [selectPermission, setSelectPermission] = useState([]);
  const [openDetail, setOpenDetail] = useState(false);
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const [jumpToRow, setJumpToRow] = useState(null);
  const [authorization, setAuthorizations] = useState({});
  const {
    fetchTableControlTranslations,
    fetchTableColumnTranslations,
    language,
  } = useColumnTranslation();
  const { user } = useAuth();

 
  
  const fetchPerByFacAndUser = async () => {
    const response = await fetchPermissionByFactoryAndUser(
      selectRows[0].factory_code,
      selectRows[0].department_code,
      selectRows[0].user_code
    );
    setSelectPermission([response.data[0]]);
    fetchSupervisorByFacAndDept();
    setData([{ tableName: response.tableName, data: response.data }]);
  };
  const fetchSupervisorByFacAndDept = async () => {
    const response = await fetchUserByDepartment(
      selectRows[0].factory_code,
      selectRows[0].department_code
    );
    setSupervisors([{ tableName: "USERS", data: response.data }]);
  };
const fetchAllTranslations = async () => {
    try {
    const columns = await fetchTableColumnTranslations(
        "USER_PERMISSION",
        "master",
        "user_permission",
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
  useEffect(() => {
    fetchAllTranslations();
  }, [language]);
  //errorroror
  useEffect(() => {
    if (
      !isSearch &&
      selectUser &&
      Object.keys(selectUser).length > 0 &&
      selectRows &&
      selectRows.length > 0 &&
      selectRows[0] &&
      selectRows[0].factory_code &&
      selectRows[0].department_code &&
      selectRows[0].user_code
    ) {
      fetchPerByFacAndUser();
    } else if (!isSearch) {
      setData([{ tableName: "USER_PERMISSION", data: [] }]);
      setSelectPermission([]);
    }
  }, [selectUser?.user_code, selectRows, isSearch]);
  useEffect(() => {
    if (isSearch && Array.isArray(searchData)) {
      if (searchData.length > 0 && selectRows && selectRows.length > 0) {
        const selectedParentRow = selectRows[0];
        let filteredData = searchData.filter(
          (item) =>
            item.factory_code === selectedParentRow.factory_code &&
            item.department_code === selectedParentRow.department_code &&
            item.user_code === selectedParentRow.user_code
        );

        setSelectPermission([filteredData[0]]);
        setData([{ tableName: "USER_PERMISSION", data: filteredData }]);
      } else {
        setData([{ tableName: "USER_PERMISSION", data: [] }]);
      }
    } else {
      console.log("okokok");
    }
  }, [
    isSearch,
    searchData,
    selectRows,
    selectRows?.[0]?.user_code,
    selectRows?.[0]?.factory_code,
    selectRows?.[0]?.department_code,
  ]);
  useEffect(() => {
    if (jumpToRow) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow]);
  const handleAddClose = () => {
    setOpenAdd(false);
    onSelectFactory({});
    onSelectDepartment({});
    setSelectSupervisor([]);
  };
  const handleOpenAdd = () => {
    if (selectRows.length === 0) {
      toast.error("Please choose factory before list all permission!");
      return;
    }
    if (Object.keys(selectUser).length === 0) {
      toast.error("Please choose user before list all permission!");
      return;
    }
    const allowAdd = authorization?.find(
      (item) => item.field === "allow_add"
    )?.title;
    if (user?.user_code !== "admin" && allowAdd === "N") {
      return;
    }
    setOpenAdd(true);
  };
  const handleEditClose = () => {
    setOpenEdit(false);
  };
  const handleOpenEdit = () => {
    if (data[0].data.length > 0) {
      const allow = authorization?.find(
        (item) => item.field === "allow_modify"
      )?.title;
      if (user?.user_code !== "admin" && allow === "N") {
        return;
      }
      setOpenEdit(true);
    }
  };
  const handleModal = (row) => {
    setSelectRow(row);
    setOpen(true);
  };
  const handleSelectQuery = async (row, value) => {
    const updateRow = {
      ...row,
      query_level: value,
    };
    await handleEdit(updateRow);
  };
  const handleSearch = async (newFilter) => {

    try {
      const response = await searchPermissionByFilter(newFilter);
      if (response && response.data) {
        setData([{ tableName: response.tableName, data: response.data }]);

        const allUserCombined = await fnQuery([() => fetchUsers()]);
        const allUsers = allUserCombined?.[0]?.data || [];

        const userCodes = [...new Set(response.data.map((us) => us.user_code))];
        const filteredUsers = allUsers.filter((u) =>
          userCodes.includes(u.user_code)
        );
        setUsers([{ tableName: "USER", data: filteredUsers }]);
      }
    } catch (error) {
      console.log("cannot search because", error);
    }
  };
  const handleSearchUser = async (newFilter) => {
    try {
      const response = await searchUserByFilter(newFilter);
      if (response.success) {
        setUsers([response]);
        const allPermission = await fnQuery([() => fetchUsersPermission()]);
        const allPers = allPermission?.[0]?.data || [];
        const userCodes = response.data.map((u) => u.user_code);
        const filteredPer = allPers.filter((per) =>
          userCodes.includes(`${per.user_code}`)
        );
        setIsSearch(true);
        if (response.data.length === 1) {
          setSelectUser(response.data[0]);
        } else {
          setSelectUser({});
        }
        setSearchData(filteredPer);

        setData([{ tableName: "USER_PERMISSION", data: filteredPer }]);
      }
    } catch (error) {
      console.error("handleSearchUser error:", error);
    }
  };

  const handleSearchByFilter = async (filteredShoe) => {
    try {
      const search = filteredShoe.search || console.log("jump");
      {
      }
      const keys = Object.keys(search);
      if (keys.length === 0) {
        await fetchPermisison();
        setIsSearch(false);
        setSelectUser({});
        return;
      }
      const hasUser = search.user_code || search.user_name;
      const hasOther = keys.some((k) => k !== "user_code" && k !== "user_name");
      if (hasUser && !hasOther) {
        await handleSearchUser(filteredShoe);
      } else {
        await handleSearch(filteredShoe);
      }
    } catch (error) {
      console.log("cannot search because", error);
    }
  };
  const handleSelectModify = async (row, value) => {
    const updateRow = {
      ...row,
      modify_level: value,
    };
    await handleEdit(updateRow);
  };
  const handleCancel = async () => {
    if (selectRows.length === 1) {
      const allow = authorization?.find(
        (item) => item.field === "allow_confirm"
      )?.title;
      if (user?.user_code !== "admin" && allow === "N") {
        return;
      }
      const updateCancel = { ...selectPermission[0], status: 0 };
      await handleEdit(updateCancel, "Canceled successfully!");
    }
  };

  const handleConfirm = async () => {
    if (selectRows.length === 1) {
      const allow = authorization?.find(
        (item) => item.field === "allow_confirm"
      )?.title;
      if (user?.user_code !== "admin" && allow === "N") {
        return;
      }
      const updateConfirm = { ...selectPermission[0], status: 1 };
      await handleEdit(updateConfirm, "Confirmed successfully!");
    }
  };
  const handleAdd = async (e) => {
    e.preventDefault();
    const addData = {};
    addData.factory_code = selectFactory.factory_code;
    addData.department_code = selectDepartment.department_code;
    addData.user_code = selectUser.user_code;
    addData.program_code = selectProgram.program_code;
    addData.grt_dept = user.department_code;
    addData.grt_user = user.user_code;
    addData.grt_date = new Date().toISOString();
    try {
      const response = await addUserPermission(addData);
      if (response.success) {
        toast.success("Add successfully !!!");
        handleAddClose();
        try {
          const combinedData = await fnQuery([
            () =>
              fetchPermissionByFactoryAndUser(
                addData.factory_code,
                addData.department_code,
                addData.user_code,
                addData.program_code
              ),
          ]);
          if (combinedData && combinedData[0]?.data) {
            setData(combinedData);
            const addedPer = combinedData[0].data.find(
              (item) =>
                `${item.factory_code}-${item.department_code}-${item.user_code}-${item.program_code}` ===
                `${addData.factory_code}-${addData.department_code}-${addData.user_code}-${addData.program_code}`
            );
            if (addedPer) {
              setSelectPermission([addedPer]);
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
      toast.error(
        `User ${addData.user_code} has problem ${error?.response?.data?.message}`
      );
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
  const handleSelectChoose = (rows) => {
    setSelectPermission(rows);
  };
  const handlePDF = async () => {
    await exportPDFPermisison();
  };
  const handleEdit = async (updateRow) => {
    const { PROGRAM, statusText, ...update } = updateRow;
    update.last_user = user.user_code;
    update.last_date = new Date().toISOString();

    const result = await editUsersPermission(update);

    if (result.success) {
      setData((prevData) => {
        if (!prevData.length) {
          return prevData;
        }
        const { factory_code, department_code, user_code, program_code } =
          update;
        const itemKey = `${factory_code}-${department_code}-${user_code}-${program_code}`;

        const filterPermission = prevData.map((table) => ({
          ...table,
          data: table.data
            .map((p) => {
              const eachKey = `${p.factory_code}-${p.department_code}-${p.user_code}-${p.program_code}`;
              return eachKey === itemKey ? { ...p, ...update } : p;
            })
            .filter(
              (item, index, self) =>
                index ===
                self.findIndex(
                  (t) =>
                    `${t.factory_code}-${t.department_code}-${t.user_code}-${t.program_code}` ===
                    `${item.factory_code}-${item.department_code}-${item.user_code}-${item.program_code}`
                )
            ),
        }));
        return filterPermission;
      });
      setSelectPermission([update]);
      setJumpToRow(update);
      toast.success(`Grant Priviliage for user ${update.user_code}!`);
      handleEditClose();
    } else {
      toast.error(`Cannot grant Privilage for user ${update.user_code}!`);
    }
  };
  const handleDetailModal = (row) => {
    setSelectRow(row);
    setOpenDetail(true);
  };
  const handleDetailClose = () => setOpenDetail(false);
  const handleChecked = async (event, row, field) => {
    const newState = event.target.checked ? "Y" : "N";
    const { statusText, ...modifiedRow } = row;
    modifiedRow.last_user = user.user_code;
    modifiedRow.last_date = new Date().toISOString();
    const updateRow = {
      ...modifiedRow,
      [field]: newState,
    };
    await handleEdit(updateRow);
  };
  const getControlLabel = (fieldCode, fallback) => {
    if (!controlTranslations || controlTranslations.length === 0) {
      return fallback;
    }
    const translation = controlTranslations.find(
      (item) => item.field === fieldCode
    );
    return translation?.title || fallback;
  };
  const getColumnLabel = (fieldCode, fallback) => {
    if (!columnTranslations || columnTranslations.length === 0) {
      return fallback;
    }

    const translation = columnTranslations.find(
      (item) => item.field === fieldCode
    );
    return translation?.title || fallback;
  };
  let columns = 1;
  if (isLgUp) columns = 3;
  else if (isMdUp) columns = 2;
  else if (isSmUp) columns = 1;
  else columns = 1;
  const itemWidth =
    data.length > 0 ? `${100 / data.length}%` : `${100 / columns}%`;
  return (
    <>
      <Box>
        <Stack
          direction="row"
          flexWrap="wrap"
          sx={{ rowGap: 1, width: "100%" }}
        >
          <div style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
            <DataTable
              data={data[0]?.data}
              tableName={"USER_PERMISSION"}
              onChecked={handleChecked}
              selectRows={selectPermission}
              onSelectChange={handleSelectChoose}
              onDelete={(row) => {
                handleModal(row);
              }}
              onSelectModify={handleSelectModify}
              onSelectQuery={handleSelectQuery}
              onAdd={handleOpenAdd}
              onEdit={handleOpenEdit}
              onCancel={handleCancel}
              onConfirm={handleConfirm}
              onDetail={(row) => {
                handleDetailModal(row);
              }}
              onPDF={handlePDF}
              onSearch={handleSearchByFilter}
              popupOpen={openEdit}
              columnTranslations={columnTranslations}
              controlTranslations={controlTranslations}
              language={language}
              getControlLabel={getControlLabel}
              getColumnLabel={getColumnLabel}
              jumpToRow={jumpToRow}
            />
          </div>
        </Stack>
      </Box>
      <AddUserPermission
        open={openAdd}
        handleClose={handleAddClose}
        handleAdd={handleAdd}
        selectFactory={selectFactory}
        selectDepartment={selectDepartment}
        selectProgram={selectProgram}
        onSelectProgram={onSelectProgram}
        programs={programs}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        language={language}
      />
      <EditUserPermission
        open={openEdit}
        onClose={handleEditClose}
        handleEdit={handleEdit}
        selectFactory={selectFactory}
        selectDepartment={selectDepartment}
        selectProgram={selectProgram}
        userPermisison={selectPermission[0]}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        language={language}
      />
    </>
  );
};
export default UsersPermission;
