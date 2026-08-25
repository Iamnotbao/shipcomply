import { useCallback, useEffect, useRef, useState } from "react";
import DataTable from "../../component/table/DataTable";
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { fnQuery } from "../../utils/fnQuery";
import { fetchTablePermission } from "../../service/users_permission/UsersPermission";
import {
  fetchAcInmDByID,
  fetchAllConfirmedAll,
  fetchAllInmD,
} from "../../service/ac_inm_d/acInmD";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import useAuth from "../../hooks/useAuth";
import { fetchBasicDataCategory } from "../../service/basic_data_category/basicDataCategoryService";
import {
  fetchBasicDataDropDownByCate,
  searchBasicDataByFilter,
} from "../../service/basic_data/basicDataService";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../utils/notification/Notification";
import {
  addSeShippingM,
  editSeShhippingM,
  exportPDF,
  fetchSeShippingMByID,
} from "../../service/se_shipping_m/seShippingM";
import { fetchAllSeShipingD, fetchShippingDByID } from "../../service/se_shipping_d/seShippingD";
import AddSeShipingM from "../../features/setf_570/page/AddSeShipingM";
import EditSeShippingM from "../../features/setf_570/page/EditSeShipingM";
import SeSalesD from "../../features/setf_510/component/SeSalesD";
import {
  exportExcel,
  exportExcel2,
  fetchAllSalesM,
  fetchFieldDropdown,
  searchSeSalesMByFilter,
} from "../../service/se_sales/seSales";
import { fetchAllSeSalesD } from "../../service/se_sales_d/seSalesD";

const Setf510 = () => {
  const [data, setData] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openAddSSD, setOpenAddSSD] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [sSDData, setSSDData] = useState([]);
  const [jumpToRowSSD, setJumpToRowSSD] = useState(null);
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
  const [selectSSD, setSelectSSD] = useState([]);
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const [searchFilter, setSearchFilter] = useState(null);
  const [searchBasicDataFilter, setSearchBasicDataFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(5);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [currentSSDPageSize, setCurrentSSDPageSize] = useState(10);
  const [currentSSDPage, setCurrentSSDPage] = useState(0);
  const [currentSSDOffset, setCurrentSSDOffset] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [totalSSDData, setTotalSSDData] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasAIDMore, setHasAIDMore] = useState(false);
  const [dropdownValues, setDropdownValues] = useState({});
  const toolbarRef = useRef(null);
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
    setCurrentPage(0);
    setCurrentPageSize(pageSize);
    setCurrentOffset(0);

    let acInmM;
    [acInmM] = await fnQuery([
      () =>
        fetchAllSalesM(
          user.factory,
          user.department,
          user.user_code,
          allow || "1",
          language,
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
          tableName: "SE_SALES",
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
      const response = await fetchSeShippingMByID(
        selectRows[0]?.factory_code,
        selectRows[0]?.cust_id,
        selectRows[0]?.si_seq,
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
      const response = await fetchShippingDByID(
        user?.access_token,
        user?.factory,
        selectSSD[0]?.cust_id,
        selectSSD[0]?.si_seq,
        selectSSD[0]?.si_type,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };
  //fetch all permisison by user
  const fetchDataBySalesID = async (
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
        : currentSSDOffset;
    const pageSize =
      explicitPageSize !== null ? explicitPageSize : currentSSDPageSize;
    const response = await fetchAllSeSalesD(
      user?.factory,
      user?.department,
      user?.user_code,
      allow,
      selectRows[0]?.sales_id || null,
      language,
      pageSize,
      offset,
    );

    if (response && response.data) {
      let childrenData = response.data;
      setSSDData([{ tableName: "SE_SALES_D", data: childrenData }]);
      // if (response.total !== undefined && response.total !== null) {
      //   setTotalSSDData(response.total);
      // }
      setHasAIDMore(response?.hasMore);
      if (childrenData.length > 0) {
        setSelectSSD([childrenData[0]]);
      } else {
        setSelectSSD([]);
      }
    }
  };
  //fetch all translation by user
  const fetchAllTranslations = async () => {
    try {
      const columns = await fetchTableColumnTranslations(
        "SETF_510",
        "master",
        "se_sales",
      );
      const controls = await fetchTableControlTranslations("SETF_510");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user.factory,
        user.department,
        user.user_code,
        "SETF_510",
      );

      const mergedComplexColumn = [...controls?.data, ...columns?.data];
      if (mergedComplexColumn.length > 0)
        setColumnTranslations(mergedComplexColumn);
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
      const hasAIM = "status" in search || "cust_id" in search;
      const hasOther = Object.keys(search).some(
        (k) => k !== "status" && k !== "cust_id",
      );
      let response;

      if (hasAIM && !hasOther) {
        response = await searchSeSalesMByFilter(
          searchFilter,
          user.factory,
          user.department,
          user.user_code,
          allow,
          language,
          currentPageSize,
          currentOffset,
        );

        if (response && response.data) {
          setData([{ tableName: "SE_SALES", data: response.data }]);

          if (currentSelection) {
            const currentKey = `${currentSelection.factory_code}-${currentSelection.sales_id}}`;
            const foundRecord = response.data.find(
              (item) => `${item.factory_code}-${item.sales_id}}` === currentKey,
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

      const responseData = await fetchAllSalesM(
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        language,
        currentPageSize,
        currentOffset,
      );

      if (responseData && responseData.data) {
        setData([{ tableName: "SE_SALES", data: responseData.data }]);
        setHasMore(responseData?.hasMore);
        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${currentSelection.sales_id}}`;
          const updatedRecord = responseData.data.find(
            (item) => `${item.factory_code}-${item.sales_id}}` === currentKey,
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
      selectRows[0]?.factory_code &&
      selectRows[0]?.sales_id
    ) {
      fetchDataBySalesID();
    } else {
      setSSDData([{ tableName: "SE_SALES_D", data: [] }]);
      // setSelectAcInmD([]);
    }
  }, [selectRows?.[0]?.factory_code, selectRows?.[0]?.sales_id, isSearch]);
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
        currentSSDPageSize,
        currentSSDOffset,
      );
      if (response && response.data) {
        setSSDData([{ tableName: "SE_SALES_D", data: response.data }]);
        if (response.data.length > 0) {
          const currentItem = selectSSD[0];
          const matchedItem = response.data.find(
            (item) =>
              item.factory_code === currentItem?.factory_code &&
              item.inm_no === currentItem?.inm_no &&
              item.seq === currentItem?.seq,
          );

          const itemToSelect = matchedItem || response.data[0];
          setSelectSSD([itemToSelect]);
          setJumpToRowSSD(itemToSelect);
        }
      }
    } catch (error) {
      console.error(" Error in handleUpdateConfirm:", error);
      showErrorToast(
        getControlLabel,
        "noti_fail_confirm_all",
        "Failed to auto-confirm child data!",
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
    setOpenAddSSD(true);
  };
  const handleClosedAddAcInmD = () => {
    setOpenAddSSD(false);
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
          const {
            cust_name,
            cust_po,
            grt_deptname,
            grt_username,
            last_username,
            ...finalLock
          } = unlockData;
          await editSeShhippingM(
            user?.access_token,
            user?.factory,
            user?.department,
            user?.user_code,
            authorization?.find((item) => item.field === "query_level")?.title,
            currentPageSize,
            finalLock,
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
            ` Cannot edit!Present status: ${statusNames[freshRecord.status]}`,
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
      const {
        FACTORY,
        cust_name,
        cust_po,
        grt_deptname,
        grt_username,
        last_username,
        ...clearData
      } = freshRecord;
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
  const handleAdd = async (newData) => {
    const addData = {
      ...newData,
      factory_code: user.factory,
      grt_user: user.user_code,
      grt_date: new Date().toISOString(),
      grt_dept: user.department,
      status: 1,
    };
    try {
      const response = await addSeShippingM(
        user.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        currentPageSize,
        addData,
      );
      if (response.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_add",
          `Add successfully with id ${addData.cust_id}!`,
        );
        try {
          const allow = Array.isArray(authorization)
            ? authorization.find((item) => item.field === "query_level")?.title
            : null;
          const responseData = await fetchAllSalesM(
            user?.factory,
            user?.department,
            user?.user_code,
            allow,
            language,
            response.size,
            response.offset,
          );
          setData([
            {
              tableName: "SE_SALES",
              data: responseData.data || [],
            },
          ]);
          setHasMore(responseData?.hasMore);
          setSelectRows([response.data]);
          setJumpToRow(response.data);
          setCurrentPage(response?.page);
          setCurrentPageSize(response.size);
          setCurrentOffset(response.offset);
          setIsSearch(false);
          setSearchFilter(null);
          handleAddClose();
        } catch (fetchError) {
          console.error("Error fetching data after add:", fetchError);
          showErrorToast(
            getControlLabel,
            "noti_fail_add_2",
            `Added successfully but failed to refresh data`,
          );
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
      await fetchDataBySalesID(true, 0, currentSSDPageSize);
    }
  };
  //handler search by category
  const handleSearchMaster = async (newFilter, pageSize = 5, offset = 0) => {
    try {
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      if (offset === 0) {
        setCurrentPage(0);
        setCurrentPageSize(pageSize);
        setCurrentOffset(0);
        setCurrentSSDPage(0);
        setCurrentSSDOffset(0);
      }
      const response = await searchSeSalesMByFilter(
        newFilter,
        user.factory,
        user.department,
        user.user_code,
        allow,
        language,
        pageSize,
        offset,
      );
      if (response && response.data && response.data.length > 0) {
        setIsSearch(true);
        setSearchFilter(newFilter);
        setSearchData([]);
        
        setData([{ tableName: "SE_SALES", data: response.data }]);
        setSelectRows([response.data[0]]);
        setJumpToRow(response.data[0]);

        if (offset === 0 && response.data.length > 0) {
          setTotalData(response.total);
        }
        
        const airResponse = await fetchAllSeSalesD(
          response.data[0]?.factory_code,
          user.department,
          user.user_code,
          allow,
          response.data[0]?.sales_id,
          language,
          currentSSDPageSize,
          0,
        );
        if (airResponse && airResponse.data) {
          setSSDData([{ tableName: "SE_SALES_D", data: airResponse.data }]);
          setTotalSSDData(airResponse.total || 0);
          if (airResponse.data.length > 0) {
            setSelectSSD([airResponse.data[0]]);
            setJumpToRowSSD(airResponse.data[0]);
          } else {
            setSelectSSD([]);
            setJumpToRowSSD(null);
          }
        }
      } else {
      
        setIsSearch(true);
        setSearchData([]);
        setData([{ tableName: "SE_SALES", data: [] }]);
        setSelectRows([]);
        setSSDData([{ tableName: "SE_SALES_D", data: [] }]);
        setSelectSSD([]);
        setTotalData(0);
        setTotalSSDData(0);
        setCurrentOffset(0);
        setCurrentPage(0);
        setCurrentSSDOffset(0);
        setCurrentSSDPage(0);
        setCurrentPageSize(pageSize);
        setHasMore(false);
      }
    } catch (error) {
      console.error("handleSearchCategory error:", error);
      setIsSearch(false);
      setSearchData([]);
      setData([{ tableName: "SE_SALES", data: [] }]);
      setSelectRows([]);
      setSSDData([{ tableName: "SE_SALES_D", data: [] }]);
      setSelectSSD([]);
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
        setCurrentPage(0);
        setCurrentPageSize(10);
        setCurrentOffset(0);
        setSearchFilter(null);
        setSearchBasicDataFilter(null);
        setSelectRows([]);
        setSSDData([{ tableName: "SE_SALES_D", data: [] }]);
        setSelectSSD([]);
        setJumpToRowSSD(null);
        await fetchAll();
        return;
      }

      const isNewFilter =
        JSON.stringify(filteredShoe) !== JSON.stringify(searchFilter);
      const actualPageSize = pageSize ?? currentPageSize;
      const actualOffset = isNewFilter ? 0 : (offset ?? currentOffset);
      await handleSearchMaster(filteredShoe, actualPageSize, actualOffset);
    } catch (error) {

      setIsSearch(false);
      setSearchedUsersPermission([]);
      setSelectRows([]);

      setSSDData([{ tableName: "SE_SALES_D", data: [] }]);
      setSelectSSD([]);

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
      const response = await editSeShhippingM(
        user?.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        currentPageSize,
        updateData,
      );
      if (response.success) {
        showSuccessToast(getControlLabel, `noti_success_${actionName}`);
        await refreshCurrentData();
        setSelectRows([updateData]);
        setJumpToRow(updateData);
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
    const currentSelectRow = selectRows[0];
    await handleStatusChange(7, "confirm", [1, 2]);
    await handleUpdateConfirm();
    setData((prevData) => {
      if (prevData?.[0]?.data?.length > 0) {
        const updatedRow = prevData[0].data.find(
          (item) =>
            `${item.factory_code}-${item.cust_id}-${item.si_seq}` ===
            `${currentSelectRow.factory_code}-${currentSelectRow.cust_id}-${currentSelectRow.si_seq}`,
        );
        if (updatedRow) {
          setSelectRows([updatedRow]);
          setJumpToRow(updatedRow);
        }
      }
      return prevData;
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
    try {
      const result = await exportExcel(
        user?.factory,
        user?.department,
        user?.user_code,
        allow || "1",
        language,
        searchFilter?.search,
      );
      if (result && result.success) {
        showSuccessToast(
          getControlLabel,
          `noti_success_excel`,
          "Export excel successfully!",
        );
      }
    } catch (error) {
      showErrorToast(
        getControlLabel,
        `noti_failed_excel`,
        "Export excel failed!",
      );
    }
  };
  const handleExcel2 = async () => {
    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;
    try {
      const result = await exportExcel2(
        user?.factory,
        user?.department,
        user?.user_code,
        allow || "1",
        language,
        selectRows[0]?.sales_id,
      );
      if (result && result.success) {
        showSuccessToast(
          getControlLabel,
          `noti_success_excel`,
          "Export excel successfully!",
        );
      }
    } catch (error) {
      showErrorToast(
        getControlLabel,
        `noti_failed_excel`,
        "Export excel failed!",
      );
    }
  };
  //handler edit permission
  const handleEdit = async (updateRow, title, skipTimestamp = false) => {
    const {
      statusText,
      cust_name,
      cust_po,
      grt_deptname,
      grt_username,
      last_username,
      ...cleanData
    } = updateRow;
    if (!skipTimestamp) {
      cleanData.last_user = user.user_code;
      cleanData.last_date = new Date().toISOString();
    }
    const result = await editSeShhippingM(
      user?.access_token,
      user?.factory,
      user?.department,
      user?.user_code,
      authorization?.find((item) => item.field === "query_level")?.title,
      currentPageSize,
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
          await editSeShhippingM(
            user?.access_token,
            user?.factory,
            user?.department,
            user?.user_code,
            authorization?.find((item) => item.field === "query_level")?.title,
            currentPageSize,
            unlockData,
          );
        }
        await refreshCurrentData();
      } else {
        const resultPage =
          result.size !== undefined
            ? Math.floor(result.position / result.size)
            : currentPage;
        const resultOffset =
          result.offset !== undefined ? result.offset : currentOffset;

        if (resultPage !== currentPage) {
          // Record chuyển page
          const allow = Array.isArray(authorization)
            ? authorization.find((item) => item.field === "query_level")?.title
            : null;

          const responseData = await fetchAllSalesM(
            user?.factory,
            user?.department,
            user?.user_code,
            allow || "1",
            language,
            currentPageSize,
            resultOffset,
          );

          if (responseData && responseData.data) {
            setData([{ tableName: "SE_SALES", data: responseData.data }]);
            setHasMore(responseData?.hasMore);
            setCurrentPage(resultPage);
            setCurrentOffset(resultOffset);

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
            await editSeShhippingM(
              user?.access_token,
              user?.factory,
              user?.department,
              user?.user_code,
              authorization?.find((item) => item.field === "query_level")
                ?.title,
              currentPageSize,
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
    setCurrentPage(newPage);
    setCurrentPageSize(newPageSize);
    setCurrentOffset(newOffset);
    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;
    if (isSearch && searchFilter) {
      await handleSearchMaster(searchFilter, newPageSize, newOffset);
      return;
    }
    const responseData = await fetchAllSalesM(
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
      language,
      newPageSize,
      newOffset,
    );
    setData([
      {
        tableName: "SE_SALES",
        data: responseData.data || [],
      },
    ]);
    setHasMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectRows([responseData.data[0]]);
    }
  };
  const handleSEDPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentSSDPage(newPage);
    setCurrentSSDPageSize(newPageSize);
    setCurrentSSDOffset(newOffset);

    await fetchAllSeSalesD(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.cont_no) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
  };
  const createSeSalesCallback = (fieldName) => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchFieldDropdown(
          user?.factory,
          user?.department,
          user?.user_code,
          authorization?.find((item) => item.field === "query_level")?.title ||
            "1",
          fieldName,
          language,
          page,
          pageSize,
          searchText,
        );
        const newData = [...result?.data, { col2: "", sales_date: "" }];
        return {
          data: newData || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error(`Error fetching basic data ${fieldName}:`, error);
        return { data: [], total: 0, pageSize };
      }
    };
  };
  const createSendCorpCallback = (categoryCode) => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchBasicDataDropDownByCate(
          user?.factory,
          categoryCode,
          user?.department,
          user?.user_code,
          authorization?.find((item) => item.field === "query_level")?.title ||
            "1",
          page,
          pageSize,
          searchText,
        );
        const newData = [...result?.data, { code_no: "", item_name: "" }];
        return {
          data: newData || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error(`Error fetching basic data ${categoryCode}:`, error);
        return { data: [], total: 0, pageSize };
      }
    };
  };
  const getFetchData = {
    sales_no: createSeSalesCallback("sales_no"),
    send_type: createSeSalesCallback("send_type"),
    send_corp: createSendCorpCallback("2110"),
  };
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
              <Box style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                <DataTable
                  data={data[0]?.data}
                  tableName={"SE_SALES"}
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
                  currentPage={currentPage}
                  currentPageSize={currentPageSize}
                  totalData={totalData}
                  hasMore={hasMore}
                  onExcel2={handleExcel2}
                  getFetchData={getFetchData}
                  dropDownValues={dropdownValues}
                  setDropdownValues={setDropdownValues}
                  ref={toolbarRef}
                />
              </Box>
              <Box>
                <SeSalesD
                  subAuthentication={authorization}
                  factory_code={selectRows[0]?.factory_code}
                  parentSelectRows={selectRows.length > 0 ? selectRows : []}
                  isSearch={isSearch}
                  searchData={searchData}
                  handleSearchByCode={handleSearch}
                  fetchBasicDataRecordFromDB={fetchBasicDataRecordFromDB}
                  data={sSDData}
                  setData={setSSDData}
                  selectRows={selectRows.length > 0 ? selectRows : []}
                  setSelectSSD={setSelectSSD}
                  selectSSD={selectSSD}
                  jumpToRow={jumpToRowSSD}
                  setJumpToRow={setJumpToRowSSD}
                  user={user}
                  currentPage={currentSSDPage}
                  setCurrentPage={setCurrentSSDPage}
                  currentPageSize={currentSSDPageSize}
                  setCurrentPageSize={setCurrentSSDPageSize}
                  currentOffset={currentSSDOffset}
                  setCurrentOffset={setCurrentSSDOffset}
                  searchBasicDataFilter={searchBasicDataFilter}
                  fetchDataBySalesID={fetchDataBySalesID}
                  openAdd={openAddSSD}
                  setOpenAdd={setOpenAddSSD}
                  handleOpenAdd={handleOpenAddAcInmD}
                  handleClosedAdd={handleClosedAddAcInmD}
                  totalData={totalSSDData}
                  setTotalData={setTotalSSDData}
                  handlePageChange={handleSEDPageChange}
                  hasMore={hasAIDMore}
                  setHasMore={setHasAIDMore}
                />
              </Box>
            </Paper>
          </Stack>
        </Container>
      </Box>
      {/* ========== MODAL/DIALOG COMPONENTS ========== */}
      {/*  Add Permission Modal */}
      {/* - Mở khi user click "Add" button */}
      {/* - Gọi handleAdd khi submit form */}
      <AddSeShipingM
        open={openAdd}
        handleAdd={handleAdd}
        handleClose={handleAddClose}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        language={language}
        mapLanguageToColumn={mapLanguageToColumn}
        user={user}
        auth={authorization}
      />
      <EditSeShippingM
        open={openEdit}
        onClose={handleEditClose}
        seShippingM={selectRows.length > 0 ? selectRows[0] : null}
        handleEdit={handleEdit}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        language={language}
        mapLanguageToColumn={mapLanguageToColumn}
        auth={authorization}
        user={user}
      />
    </>
  );
};

export default Setf510;
