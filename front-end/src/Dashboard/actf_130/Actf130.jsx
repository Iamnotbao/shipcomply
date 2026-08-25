import { useCallback, useEffect, useState } from "react";
import DataTable from "../../component/table/DataTable";
import {
  Box,
  Container,
  Paper,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { fnQuery } from "../../utils/fnQuery";
import { fetchTablePermission } from "../../service/users_permission/UsersPermission";
import { toast } from "react-toastify";
import {
  addAcInmD,
  fetchAcInmDByID,
  fetchAllConfirmedAll,
  fetchAllInmD,
} from "../../service/ac_inm_d/acInmD";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import useAuth from "../../hooks/useAuth";
import {
  exportPDFBasicDataCategory,
  fetchBasicDataCategory,
} from "../../service/basic_data_category/basicDataCategoryService";
import {
  fetchAllConfirmedBasicData,
  fetchBasicDataByCate,
  fetchBasicDataByID,
  searchBasicDataByFilter,
} from "../../service/basic_data/basicDataService";
import Actf1301 from "../../features/actf_130/component/Actf1301";
import AddAcInmM from "../../features/actf_130/page/AddAcInmM";
import EditAcInmM from "../../features/actf_130/page/EditAcInmM";
import {
  addAcInmM,
  editAcInmM,
  exportPDF,
  fetchAcInmMByID,
  fetchAlInmM,
  searchAcInmMByFilter,
} from "../../service/ac_inm_m/acInmM";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../utils/notification/Notification";
import { confirmAll } from "../../service/ac_cont_m/AcContMService";

const Actf130 = () => {
  const [data, setData] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openAddAcInmD, setOpenAddAcInmD] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [acInmDData, setAcInmDData] = useState([]);
  const [jumpToRowAcInmD, setJumpToRowAcInmD] = useState(null);
  const [openPermission, setOpenPermission] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [selectRow, setSelectRow] = useState({});
  const [selectRows, setSelectRows] = useState([]);
  const [searchedUsersPermission, setSearchedUsersPermission] = useState([]);
  const [jumpToRow, setJumpToRow] = useState(null);
  const [authorization, setAuthorizations] = useState([]);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectAcInmD, setSelectAcInmD] = useState([]);
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const [searchFilter, setSearchFilter] = useState(null);
  const [searchBasicDataFilter, setSearchBasicDataFilter] = useState(null);
  const [currentAcIMPage, setCurrentAcIMPage] = useState(0);
  const [currentAcIMPageSize, setCurrentAcIMPageSize] = useState(5);
  const [currentAcIMOffset, setCurrentAcIMOffset] = useState(0);
  const [currentAIDPageSize, setCurrentAIDPageSize] = useState(10);
  const [currentAIDPage, setCurrentAIDPage] = useState(0);
  const [currentAIDOffset, setCurrentAIDOffset] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [totalAIDData, setTotalAIDData] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasAIDMore, setHasAIDMore] = useState(false);
  const {
    fetchTableControlTranslations,
    fetchTableColumnTranslations,
    language,
  } = useColumnTranslation();
  const { user } = useAuth();
  //========== FETCH DATA SECTION ================

  const fetchAll = async (authData = null, pageSize = 5, offset = 0) => {
    const authToUse = authData || authorization;

    const allow = Array.isArray(authToUse)
      ? authToUse.find((item) => item.field === "query_level")?.title
      : null;
    setCurrentAcIMPage(0);
    setCurrentAcIMPageSize(pageSize);
    setCurrentAcIMOffset(0);

    let acInmM;
    [acInmM] = await fnQuery([
      () =>
        fetchAlInmM(
          user.factory,
          user.department,
          user.user_code,
          allow || "1",
          pageSize,
          offset,
        ),
    ]);

    if (acInmM) {
      if (acInmM.total !== undefined && acInmM.total !== null) {
        setTotalData(acInmM.total);
      }
      setData([
        {
          tableName: "AC_INM_M",
          data: acInmM.data,
        },
      ]);
      setHasMore(acInmM?.hasMore);
      setSelectRows([acInmM.data[0]]);
      setJumpToRow(acInmM.data[0]);
    }
  };
  const fetchRecordFromDB = async (record) => {
    try {
      const response = await fetchAcInmMByID(
        selectRows[0]?.factory_code,
        selectRows[0]?.inm_no,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };
  const fetchBasicDataRecordFromDB = async (record) => {
    const allow = authorization.find((item) => item.field === "query_level");
    try {
      const response = await fetchAcInmDByID(
        user?.access_token,
        user?.factory,
        selectAcInmD[0]?.inm_no,
        selectAcInmD[0]?.seq,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };
  //fetch all permisison by user
  const fetchDataByInmNo = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;
    const offset = shouldResetPagination
      ? 0
      : explicitOffset !== null
        ? explicitOffset
        : currentAIDOffset;
    const pageSize =
      explicitPageSize !== null ? explicitPageSize : currentAIDPageSize;
    const response = await fetchAllInmD(
      user?.access_token,
      selectRows[0]?.inm_no,
      user?.factory,
      user?.department,
      user?.user_code,
      allow,
      language,
      pageSize,
      offset,
    );
    if (response && response.data) {
      let childrenData = response.data;
      setAcInmDData([{ tableName: "AC_INM_D", data: childrenData }]);
      // if (response.total !== undefined && response.total !== null) {
      //   setTotalAIDData(response.total);
      // }
      setHasAIDMore(response?.hasMore);
      if (childrenData.length > 0) {
        setSelectAcInmD([childrenData[0]]);
      } else {
        setSelectAcInmD([]);
      }
    }
  };
  //fetch all translation by user
  const fetchAllTranslations = async () => {
    try {
      const columns = await fetchTableColumnTranslations(
        "ACTF_130",
        "master",
        "ac_inm_m",
      );
      const controls = await fetchTableControlTranslations("ACTF_130");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user.factory,
        user.department,
        user.user_code,
        "ACTF_130",
      );

      if (columns) setColumnTranslations(columns?.data);
      const mergedControls = [...controls?.data, ...sysMessages?.data];
      if (mergedControls.length > 0) {
        setControlTranslations(mergedControls);
      }
      if (auth) setAuthorizations(auth?.data);
      1;
      return auth?.data || [];
    } catch (error) {
      console.error(" Error:", error);
      return [];
    }
  };
  const refreshCurrentData = async () => {
    const currentSelection = selectRows.length > 0 ? selectRows[0] : null;

    if (isSearch && searchFilter) {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;
      const search = searchFilter.search || {};
      const hasAIM = "status" in search || "inm_no" in search;
      const hasOther = Object.keys(search).some(
        (k) => k !== "status" && k !== "inm_no",
      );
      let response;

      if (hasAIM && !hasOther) {
        response = await searchAcInmMByFilter(
          searchFilter,
          user.factory,
          user.department,
          user.user_code,
          allow,
          currentAcIMPageSize,
          currentAcIMOffset,
        );

        if (response && response.data) {
          setData([{ tableName: "AC_INM_M", data: response.data }]);

          if (currentSelection) {
            const currentKey = `${currentSelection.factory_code}-${currentSelection.inm_no}`;
            const foundRecord = response.data.find(
              (item) => `${item.factory_code}-${item.inm_no}` === currentKey,
            );

            if (foundRecord) {
              setSelectRows([foundRecord]);
              setJumpToRow(foundRecord);
            } else if (response.data.length > 0) {
              setSelectRows([response.data[0]]);
              setJumpToRow(response.data[0]);
            } else {
              setSelectRows([]);
            }
          }
        }
      }
    } else {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;

      const responseData = await fetchAlInmM(
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        currentAcIMPageSize,
        currentAcIMOffset,
      );

      if (responseData && responseData.data) {
        setData([{ tableName: "AC_INM_M", data: responseData.data }]);
        setHasMore(responseData?.hasMore);
        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${currentSelection.inm_no}`;
          const updatedRecord = responseData.data.find(
            (item) => `${item.factory_code}-${item.inm_no}` === currentKey,
          );

          if (updatedRecord) {
            setSelectRows([updatedRecord]);
            setJumpToRow(updatedRecord);
          } else if (responseData.data.length > 0) {
            setSelectRows([responseData.data[0]]);
            setJumpToRow(responseData.data[0]);
          }
        }
      }
    }
  };

  //========== END FETCH DATA SECTION ================

  // ========== USEEFFECT SECTION ==========
  useEffect(() => {
    const init = async () => {
      const authData = await fetchAllTranslations();
      await fetchAll(authData);
    };
    init();
  }, [language]);

  useEffect(() => {
    if (
      !isSearch &&
      selectRows &&
      selectRows.length > 0 &&
      selectRows[0]?.inm_no
    ) {
      fetchDataByInmNo();
    } 
  }, [selectRows?.[0]?.inm_no, isSearch]);
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
  //handler open user permission popup
  const handlePermisisonOpen = () => {
    setOpenPermission(true);
    handleAdd();
  };
  const handleUpdateConfirm = async () => {
    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;

    try {
      await fetchAllConfirmedAll(
        user?.factory,
        selectRows[0]?.inm_no,
        user?.department,
        user?.user_code,
        allow,
        isSearch && searchData.length > 0 ? searchData : [],
      );
      const response = await fetchAllInmD(
        user?.access_token,
        selectRows[0]?.inm_no,
        selectRows[0]?.factory_code,
        user.department,
        user.user_code,
        allow,
        language,
        currentAIDPageSize,
        currentAIDOffset,
      );
      if (response && response.data) {
        setAcInmDData([{ tableName: "AC_INM_D", data: response.data }]);
        if (response.data.length > 0) {
          const currentItem = selectAcInmD[0];
          const matchedItem = response.data.find(
            (item) =>
              item.factory_code === currentItem?.factory_code &&
              item.inm_no === currentItem?.inm_no &&
              item.seq === currentItem?.seq,
          );

          const itemToSelect = matchedItem || response.data[0];
          setSelectAcInmD([itemToSelect]);
          setJumpToRowAcInmD(itemToSelect);
        }
      }
    } catch (error) {
      console.error(" Error in handleUpdateConfirm:", error);
      showErrorToast(
        getControlLabel,
        "noti_fail_confirm_all",
        "Failed to auto-confirm AC INM D!",
      );
    }
  };
  const handleOpenAddAcInmD = () => {
    if (selectRows.length === 0) {
      showErrorToast(
        getControlLabel,
        "noti_fail_no_parent",
        "Please choose factory before list all permission!",
      );
      return;
    }
    if (
      selectRows[0]?.status === 0 ||
      selectRows[0]?.status === 7 ||
      selectRows[0]?.status === 9
    ) {
      showErrorToast(
        getControlLabel,
        "noti_fail_parent_status",
        "Please unconfirm first!",
      );
      return;
    }
    const allowAdd = authorization?.find(
      (item) => item.field === "allow_add",
    )?.title;

    if (user?.user_code !== "admin" && allowAdd === "N") {
      return;
    }
    setOpenAddAcInmD(true);
  };
  const handleClosedAddAcInmD = () => {
    setOpenAddAcInmD(false);
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
  const handleEditClose = async (data) => {
    try {
      if (selectRows.length === 1) {
        const record = data || selectRows[0];
        if (record?.locked_information === user?.clientInfo) {
          const unlockData = {
            ...record,
            locked_information: null,
          };
          await editAcInmM(
            user?.access_token,
            user?.factory,
            user?.department,
            user?.user_code,
            authorization?.find((item) => item.field === "query_level")?.title,
            currentAcIMPageSize,
            unlockData,
          );
          await refreshCurrentData();
        }
      }
      setOpenEdit(false);
    } catch (error) {
      console.error(" Error closing edit:", error);
      setOpenEdit(false);
    }
  };
  //handler open edit popup
  const handleOpenEdit = async () => {
    try {
      if (selectRows.length !== 1) return;
      const record = selectRows[0];

      const freshRecord = await fetchRecordFromDB(record);

      if (user.user_code !== "admin") {
        const allowModify = authorization?.find(
          (item) => item.field === "modify_level",
        )?.title;
        const allowStatus = freshRecord?.status;
        if (allowModify === "2" && freshRecord?.grt_dept !== user.department) {
          showWarningToast(
            getControlLabel,
            "noti_fail_modify_department",
            "You don't have permission to modify this record!",
          );
          return;
        }
        if (allowModify === "3" && freshRecord?.grt_user !== user.user_code) {
          showWarningToast(
            getControlLabel,
            "noti_fail_modify_user",
            "You can just modify your own record!",
          );
          return;
        }
        if (allowStatus === 7 || allowStatus === 0 || allowStatus === 9) {
          const statusNames = {
            0: "Cancelled",
            7: "Confirmed",
            9: "Closed",
          };
          showErrorToast(
            getControlLabel,
            "noti_edit_fail_2",
            `Cannot edit!Present status: ${statusNames[freshRecord.status]}`,
            {
              status: statusNames[freshRecord?.status] || "Unknown",
            },
          );
          await refreshCurrentData();
          return;
        }
        const allow = authorization?.find(
          (item) => item.field === "allow_modify",
        )?.title;
        if (allow === "N") {
          showWarningToast(
            getControlLabel,
            "noti_fail_permission",
            "You don't have permission!",
          );
          return;
        }
      }
      if (
        freshRecord.locked_information &&
        freshRecord.locked_information !== "null" &&
        freshRecord.locked_information !== "undefined" &&
        freshRecord.locked_information !== "" &&
     freshRecord.locked_information !==user?.clientInfo
      ) {
        showErrorToast(
          getControlLabel,
          "noti_edit_fail_1",
          ` Cannot edit!\n\nRecord is edited by: ${freshRecord.locked_information}\n\nWait for user to finish!`,
          {
            user: freshRecord.locked_information || "Unknown",
          },
        );
        return;
      }
      const { FACTORY, ...clearData } = freshRecord;
      const lockData = {
        ...clearData,
        locked_information: user?.clientInfo,
      };

      await handleEdit(lockData, "", true);
      // setSelectRows([lockData]);
      setOpenEdit(true);
    } catch (error) {
      console.error("Error opening edit:", error);
      showErrorToast(
        getControlLabel,
        "noti_error_open_edit",
        "This has error when open form edit!",
      );
    }
  };

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
  //handler add permission
  const handleAdd = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const addData = Object.fromEntries(form.entries());
    addData.factory_code = user.factory;
    addData.grt_user = user.user_code;
    addData.grt_date = new Date().toISOString();
    addData.grt_dept = user.department;
    addData.status = 1;
    try {
      const response = await addAcInmM(
        user.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        currentAcIMPageSize,
        addData,
      );
      if (response.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_add",
          `Add successfully with id ${addData.inm_no}!`,
        );
        try {
          const allow = Array.isArray(authorization)
            ? authorization.find((item) => item.field === "query_level")?.title
            : null;
          const responseData = await fetchAlInmM(
            user?.factory,
            user?.department,
            user?.user_code,
            allow,
            response.size,
            response.offset,
          );
          setData([
            {
              tableName: "AC_INM_M",
              data: responseData.data || [],
            },
          ]);
          setHasMore(responseData?.hasMore);
          setSelectRows([response.data]);
          setJumpToRow(response.data);
          setCurrentAcIMPage(response?.page);
          setCurrentAcIMPageSize(response.size);
          setCurrentAcIMOffset(response.offset);
          handleAddClose();
          setTotalData((prevTotal) => prevTotal + 1);
        } catch (fetchError) {
          console.error("Error fetching data after add:", fetchError);
          showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
        }
      } else {
        showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
        handleAddClose();
      }
    } catch (error) {
      console.error(" Error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add record";

      console.error(errorMessage);
      showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
      handleAddClose();
    }
  };

  //handler search by code
  const handleSearch = async (newFilter) => {
    try {
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const response = await searchBasicDataByFilter(
        newFilter,
        user.factory,
        user.department,
        user.user_code,
        allow,
      );

      if (response && response.data && response.data.length > 0) {
        const basicDataResults = response.data;
        const uniqueCategories = new Map();
        basicDataResults.forEach((item) => {
          const key = `${item.factory_code}-${item.inm_no}`;
          if (!uniqueCategories.has(key)) {
            uniqueCategories.set(key, {
              factory_code: item.factory_code,
              inm_no: item.inm_no,
            });
          }
        });
        const categoryKeys = Array.from(uniqueCategories.values());
        const allow = Array.isArray(authorization)
          ? authorization.find((item) => item.field === "query_level")?.title
          : null;

        const allCategoriesResponse = await fetchBasicDataCategory(
          user.factory,
          user.department,
          user.user_code,
          allow || "1",
        );

        const allCategories = allCategoriesResponse?.data || [];

        const filteredCategories = allCategories.filter((cat) =>
          categoryKeys.some(
            (key) =>
              key.factory_code === cat.factory_code &&
              key.inm_no === cat.inm_no,
          ),
        );

        setIsSearch(true);
        setSearchData(basicDataResults);
        setData([
          {
            tableName: "BASIC_DATA_CATEGORY",
            data: filteredCategories,
          },
        ]);
        if (filteredCategories.length > 0) {
          setSelectRows([filteredCategories[0]]);
          setJumpToRow(filteredCategories[0]);
        } else {
          setSelectRows([]);
        }
      } else {
        setIsSearch(true);
        setSearchData([]);
        setData([{ tableName: "BASIC_DATA_CATEGORY", data: [] }]);
        setSelectRows([]);
      }
    } catch (error) {
      console.error(" Search error:", error);
      setIsSearch(false);
      setSearchData([]);
      setSelectRows([]);
      await fetchDataByInmNo;
    }
  };
  //handler search by category
  const handleSearchMaster = async (newFilter, pageSize = 10, offset = 0) => {
    try {
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      if (offset === 0) {
        setCurrentAcIMPage(0);
        setCurrentAcIMPageSize(pageSize);
        setCurrentAcIMOffset(0);
        setCurrentAIDPage(0);
        setCurrentAIDOffset(0);
      }
      const response = await searchAcInmMByFilter(
        newFilter,
        user.factory,
        user.department,
        user.user_code,
        allow,
        pageSize,
        offset,
      );
      if (response && response.data && response.data.length > 0) {
        setIsSearch(true);
        setSearchFilter(newFilter);
        setSearchData([]);
        setData([{ tableName: "AC_INM_M", data: response.data }]);
        setSelectRows([response.data[0]]);
        setJumpToRow(response.data[0]);

        if (offset === 0 && response.data.length > 0) {
          setTotalData(response.total);
        }

        const airResponse = await fetchDataByInmNo(
          response.data[0]?.factory_code,
          response.data[0]?.inm_no,
          user.department,
          user.user_code,
          allow,
          currentAIDPageSize,
          0,
        );
        if (airResponse && airResponse.data) {
          setAcInmDData([{ tableName: "AC_INM_D", data: airResponse.data }]);
          setTotalAIDData(airResponse.total || 0);
          if (airResponse.data.length > 0) {
            setSelectAcInmD([airResponse.data[0]]);
            setJumpToRowAcInmD(airResponse.data[0]);
          } else {
            setSelectAcInmD([]);
            setJumpToRowAcInmD(null);
          }
        }
      } else {
        setIsSearch(true);
        setSearchData([]);
        setData([{ tableName: "AC_INM_M", data: [] }]);
        setSelectRows([]);
        setAcInmDData([{ tableName: "AC_INM_D", data: [] }]);
        setSelectAcInmD([]);
        setTotalData(0);
        setTotalAIDData(0);
        setCurrentAcIMOffset(0);
        setCurrentAcIMPage(0);
        setCurrentAIDOffset(0);
        setCurrentAIDPage(0);
        setCurrentAcIMPageSize(pageSize);
        setHasMore(false);
      }
    } catch (error) {
      console.error("handleSearchCategory error:", error);
      setIsSearch(false);
      setSearchData([]);
      setData([{ tableName: "AC_INM_M", data: [] }]);
      setSelectRows([]);
      setAcInmDData([{ tableName: "AC_INM_D", data: [] }]);
      setSelectAcInmD([]);
    }
  };
  //handler search by filter
  const handleSearchByFilter = async (filteredShoe, pageSize, offset) => {
    try {
      const search = filteredShoe.search || {};
      const keys = Object.keys(search);

      if (keys.length === 0) {
        setIsSearch(false);
        setSearchData([]);
        setSearchedUsersPermission([]);
        setCurrentAcIMPage(0);
        setCurrentAcIMPageSize(10);
        setCurrentAcIMOffset(0);
        setSearchFilter(null);
        setSearchBasicDataFilter(null);
        setSelectRows([]);
        setAcInmDData([{ tableName: "AC_INM_D", data: [] }]);
        setSelectAcInmD([]);
        setJumpToRowAcInmD(null);
        await fetchAll();
        return;
      }

      const isNewFilter =
        JSON.stringify(filteredShoe) !== JSON.stringify(searchFilter);
      const actualPageSize = pageSize ?? currentAcIMPageSize;
      const actualOffset = isNewFilter ? 0 : (offset ?? currentAcIMOffset);
      await handleSearchMaster(filteredShoe, actualPageSize, actualOffset);
    } catch (error) {
      console.log("cannot search because", error);

      setIsSearch(false);
      setSearchedUsersPermission([]);
      setSelectRows([]);

      setAcInmDData([{ tableName: "AC_INM_D", data: [] }]);
      setSelectAcInmD([]);

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
  const handleStatusChange = async (
    newStatus,
    actionName,
    allowedFromStatuses = [],
    fetchAction = null,
  ) => {
    if (selectRows.length !== 1) return;
    try {
      const record = selectRows[0];
      if (user.user_code !== "admin") {
        const allowModify = authorization?.find(
          (item) => item.field === "modify_level",
        )?.title;

        if (allowModify === "2" && record?.grt_dept !== user.department) {
          showWarningToast(
            getControlLabel,
            "noti_fail_modify_department",
            "You don't have permission to modify this record!",
          );
          return;
        }
        if (allowModify === "3" && record?.grt_user !== user.user_code) {
          showWarningToast(
            getControlLabel,
            "noti_fail_modify_user",
            "You can just modify your own record!",
          );
          return;
        }
        const allow = authorization?.find(
          (item) => item.field === "allow_modify",
        )?.title;
        if (allow === "N") {
          showWarningToast(
            getControlLabel,
            "noti_fail_permission",
            "You don't have permission!",
          );
          return;
        }
        const allowAction = authorization?.find(
          (item) => item.field === `allow_${actionName}`,
        )?.title;
        if (allowAction === "N") {
          showWarningToast(
            getControlLabel,
            "noti_fail_permission_action",
            `You don't have permission to ${actionName}!`,
          );
          return;
        }
      }
      const freshRecord = await fetchRecordFromDB(record);
      if (
        freshRecord.locked_information &&
        freshRecord.locked_information !== "null" &&
        freshRecord.locked_information !== "undefined" &&
        freshRecord.locked_information !== "" &&
     freshRecord.locked_information !==user?.clientInfo
      ) {
        showErrorToast(
          getControlLabel,
          "noti_fail_2",
          "Cannot {actionName}!\\n\\nRecord is edited by: {user}\\n\\nWait for user to finish!",
          {
            actionName: actionName,
            user: freshRecord.locked_information,
          },
          { toastId: `locked-${actionName}` },
        );
        return;
      }
      if (
        allowedFromStatuses.length > 0 &&
        !allowedFromStatuses.includes(freshRecord.status)
      ) {
        const statusNames = {
          0: "Cancelled",
          1: "New",
          2: "Checked",
          7: "Confirmed",
          9: "Closed",
        };
        showErrorToast(
          getControlLabel,
          "noti_fail_1",
          "Cannot {actionName}! Present status: {status}",
          {
            actionName: actionName,
            status: statusNames[freshRecord?.status] || "Unknown",
          },
          { toastId: `inactive-${actionName}` },
        );
        await refreshCurrentData();
        setJumpToRow(freshRecord);
        return;
      }
      const { FACTORY, ...clearData } = freshRecord;
      const updateData = {
        ...clearData,
        status: newStatus,
        last_user: user.user_code,
        last_date: new Date().toISOString(),
      };
      const response = await editAcInmM(
        user?.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        currentAcIMPageSize,
        updateData,
      );
      if (response.success) {
        if (fetchAction) {
          await fetchAction();
        }
        showSuccessToast(getControlLabel, `noti_success_${actionName}`);
        await refreshCurrentData();
        setSelectRows([updateData]);
        setJumpToRow(updateData);
      }
      if (actionName === "confirm") {
        await handleUpdateConfirm();
        setData((prevData) => {
          if (prevData?.[0]?.data?.length > 0) {
            const updatedRow = prevData[0].data.find(
              (item) =>
                `${item.factory_code}-${item.inm_no}` ===
                `${updateData.factory_code}-${updateData.inm_no}`,
            );
            if (updatedRow) {
              setSelectRows([updatedRow]);
              setJumpToRow(updatedRow);
            }
          }
          return prevData;
        });
      }
    } catch (error) {
      console.error(` Error in ${actionName}:`, error);
      showErrorToast(
        getControlLabel,
        "noti_error_generic",
        `This has error when ${actionName}!`,
      );
    }
  };
  const handleCancel = async () => {
    await handleStatusChange(0, "cancel", [1, 2]);
  };

  const handleConfirm = async () => {
    if (selectRows.length !== 1) return;
    await handleStatusChange(7, "confirm", [1, 2], async (freshRecord) => {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;
      try {
        await confirmAll(
          user?.access_token,
          user.factory,
          user.user_code,
          user.department,
          allow,
          freshRecord?.inm_no,
        );
        showSuccessToast(getControlLabel, "noti_success_confirm");
      } catch (error) {
        showErrorToast(getControlLabel, "noti_confirm_allF", error.message);
      }
    });
  };
  const handleUnconfirm = async () => {
    await handleStatusChange(1, "unconfirm", [7]);
  };

  const handleClose = async () => {
    await handleStatusChange(9, "close", [1, 7]);
  };

  const handleCheck = () => {
    handleStatusChange(2, "check", [1]);
  };

  //handler select row permission
  const handleSelectChoose = (rows) => {
    setSelectRows([...rows]);
  };
  //handler export pdf
  const handlePDF = async () => {
    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;
    await exportPDF(
      user?.access_token,
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
    );
  };
  //handler edit permission
  const handleEdit = async (updateRow, title, skipTimestamp = false) => {
    const { statusText, ...cleanData } = updateRow;
    if (!skipTimestamp) {
      cleanData.last_user = user.user_code;
      cleanData.last_date = new Date().toISOString();
    }
    const result = await editAcInmM(
      user?.access_token,
      user?.factory,
      user?.department,
      user?.user_code,
      authorization?.find((item) => item.field === "query_level")?.title,
      currentAcIMPageSize,
      cleanData,
    );
    if (result.success) {
      const successMessage =
        typeof title === "string" && title
          ? title
          : `${getControlLabel(
              "noti_success_edit",
              "Edit successfully with id",
            )} ${updateRow.inm_no}!`;

      if (!skipTimestamp) {
        showSuccessToast(getControlLabel, "noti_success_edit", successMessage);
      }
      if (isSearch) {
        if (
          !skipTimestamp &&
          cleanData.locked_information === user?.clientInfo
        ) {
          const unlockData = {
            ...cleanData,
            locked_information: null,
          };
          await editAcInmM(
            user?.access_token,
            user?.factory,
            user?.department,
            user?.user_code,
            authorization?.find((item) => item.field === "query_level")?.title,
            currentAcIMPageSize,
            unlockData,
          );
        }
        await refreshCurrentData();
      } else {
        const resultPage =
          result.size !== undefined
            ? Math.floor(result.position / result.size)
            : currentAcIMPage;
        const resultOffset =
          result.offset !== undefined ? result.offset : currentAcIMOffset;

        if (resultPage !== currentAcIMPage) {
          // Record chuyển page
          const allow = Array.isArray(authorization)
            ? authorization.find((item) => item.field === "query_level")?.title
            : null;

          const responseData = await fetchAlInmM(
            user?.factory,
            user?.department,
            user?.user_code,
            allow || "1",
            currentAcIMPageSize,
            resultOffset,
          );

          if (responseData && responseData.data) {
            setData([{ tableName: "AC_INM_M", data: responseData.data }]);
            setHasMore(responseData?.hasMore);
            setCurrentAcIMPage(resultPage);
            setCurrentAcIMOffset(resultOffset);

            const editedRecord = responseData.data.find(
              (item) =>
                `${item.factory_code}-${item.inm_no}` ===
                `${cleanData.factory_code}-${cleanData.inm_no}`,
            );

            if (editedRecord) {
              setSelectRows([editedRecord]);
              setJumpToRow(editedRecord);
            }
          }
        } else {
          if (
            !skipTimestamp &&
            cleanData.locked_information === user?.clientInfo
          ) {
            const unlockData = {
              ...cleanData,
              locked_information: null,
            };
            await editAcInmM(
              user?.access_token,
              user?.factory,
              user?.department,
              user?.user_code,
              authorization?.find((item) => item.field === "query_level")
                ?.title,
              currentAcIMPageSize,
              unlockData,
            );
          }

          //  Refresh với current page/offset
          await refreshCurrentData();
        }
      }

      if (!skipTimestamp) {
        setOpenEdit(false);
      }
    } else {
      showErrorToast(
        getControlLabel,
        "noti_edit_fail_3",
        `Cannot edit successfully for user ${user.user_code}!`,
        {
          user: user?.user_code,
        },
      );
    }
  };
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
  const mapLanguageToColumn = (language) => {
    const languageMap = {
      zh: "_t", // Chinese
      en: "_e", // English
      vi: "_l", // Vietnamese
    };

    return languageMap[language] || "_e"; // Default English
  };
  const handlePageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentAcIMPage(newPage);
    setCurrentAcIMPageSize(newPageSize);
    setCurrentAcIMOffset(newOffset);
    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;
    if (isSearch && searchFilter) {
      await handleSearchMaster(searchFilter, newPageSize, newOffset);
      return;
    }
    const responseData = await fetchAlInmM(
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
      newPageSize,
      newOffset,
    );
    setData([
      {
        tableName: "AC_INM_M",
        data: responseData.data || [],
      },
    ]);
    setHasMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectRows([responseData.data[0]]);
    }
  };
  const handleAIDPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentAIDPage(newPage);
    setCurrentAIDPageSize(newPageSize);
    setCurrentAIDOffset(newOffset);

    await fetchDataByInmNo(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.cont_no) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
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
              <Box>
                <Box style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                  <DataTable
                    data={data[0]?.data}
                    tableName={"AC_INM_M"}
                    onChecked={handleChecked}
                    selectRows={selectRows}
                    onSelectChange={handleSelectChoose}
                    onSelectModify={handleSelectModify}
                    onSelectQuery={handleSelectQuery}
                    onView={handlePermisisonOpen}
                    onAdd={handleOpenAdd}
                    onEdit={handleOpenEdit}
                    onCancel={handleCancel}
                    onConfirm={handleConfirm}
                    onUnconfirm={handleUnconfirm}
                    onClose={handleClose}
                    onSearch={handleSearchByFilter}
                    onPDF={handlePDF}
                    isSearch={isSearch}
                    searchData={searchData}
                    columnTranslations={columnTranslations}
                    controlTranslations={controlTranslations}
                    language={language}
                    getControlLabel={getControlLabel}
                    getColumnLabel={getColumnLabel}
                    jumpToRow={jumpToRow}
                    onPageChange={handlePageChange}
                    currentPage={currentAcIMPage}
                    currentPageSize={currentAcIMPageSize}
                    totalData={totalData}
                    hasMore={hasMore}
                  />
                </Box>
                <Box>
                  <Actf1301
                    subAuthentication={authorization}
                    factory_code={selectRows[0]?.factory_code}
                    parentSelectRows={selectRows.length > 0 ? selectRows : []}
                    isSearch={isSearch}
                    searchData={searchData}
                    handleSearchByCode={handleSearch}
                    fetchBasicDataRecordFromDB={fetchBasicDataRecordFromDB}
                    data={acInmDData}
                    setData={setAcInmDData}
                    selectRows={selectRows.length > 0 ? selectRows : []}
                    setSelectAcInmD={setSelectAcInmD}
                    selectAcInmD={selectAcInmD}
                    jumpToRow={jumpToRowAcInmD}
                    setJumpToRow={setJumpToRowAcInmD}
                    user={user}
                    currentAIDPage={currentAIDPage}
                    setCurrentAIDPage={setCurrentAIDPage}
                    currentAIDPageSize={currentAIDPageSize}
                    setCurrentAIDPageSize={setCurrentAIDPageSize}
                    currentAIDOffset={currentAIDOffset}
                    setCurrentAIDOffset={setCurrentAIDOffset}
                    searchBasicDataFilter={searchBasicDataFilter}
                    fetchDataByInmNo={fetchDataByInmNo}
                    openAddAcInmD={openAddAcInmD}
                    setOpenAddAcInmD={setOpenAddAcInmD}
                    handleOpenAddAcInmD={handleOpenAddAcInmD}
                    handleClosedAddAcInmD={handleClosedAddAcInmD}
                    totalAIDData={totalAIDData}
                    setTotalAIDData={setTotalAIDData}
                    handleAIDPageChange={handleAIDPageChange}
                    hasMore={hasAIDMore}
                    setHasMore={setHasAIDMore}
                  />
                </Box>
              </Box>
            </Paper>
          </Stack>
        </Container>
      </Box>
      {/* ========== MODAL/DIALOG COMPONENTS ========== */}
      {/*  Add Permission Modal */}
      {/* - Mở khi user click "Add" button */}
      {/* - Gọi handleAdd khi submit form */}
      <AddAcInmM
        open={openAdd}
        handleAdd={handleAdd}
        handleClose={handleAddClose}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        language={language}
        mapLanguageToColumn={mapLanguageToColumn}
        user={user}
        table="category_name"
      />
      <EditAcInmM
        open={openEdit}
        onClose={handleEditClose}
        acInmM={selectRows.length > 0 ? selectRows[0] : null}
        handleEdit={handleEdit}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        language={language}
        mapLanguageToColumn={mapLanguageToColumn}
        table="category_name"
      />
    </>
  );
};

export default Actf130;
