import { lazy, useEffect, useRef, useState } from "react";
import DataTable from "../../component/table/DataTable";
import {
  Box,
  Container,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { fnQuery } from "../../utils/fnQuery";
import {
  exportExcelUser,
  importExcelUser,
} from "../../service/user/userService";

import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import { fetchTablePermission } from "../../service/users_permission/UsersPermission";
import { exportPDFABM } from "../../service/ac_bom_m/AcBomMService";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../utils/notification/Notification";
import {
  addAcCoM,
  editAcCoM,
  exportExcel,
  fetchAcCoM,
  fetchAcCoMByID,
  fetchFieldDropDown,
  searchAcCoMByFilter,
} from "../../service/ac_co_m/acCoM";
import {
  fetchAllCustDropdown,
  fetchFieldDropDownSeCust,
} from "../../service/se_cust/seCust";
import ShippingOrderPopup from "../../features/actf_022/page/ShipingOrderPopup";
import {
  checkBox,
  clearTempTable,
  clearTempTextTable,
  confirmCheck,
  fetchAllSePlanOrdLink,
  fetchFieldDropDownSePlanOrd,
  getTempTable,
} from "../../service/se_plan_ord/sePlanOrd";
import SapTransTypePopup from "../../features/actf_022/page/SapTransTypePopup";
import AddAcCoM from "../../features/actf_022/page/AddAcCoM";
import EditAcCoM from "../../features/actf_022/page/EditAcCoM";
const Actf022 = () => {
  const [data, setData] = useState([]);
  const [rdTempdata, setRdTempData] = useState([]);
  const [sapTransTypeData, setSapTransTypData] = useState([]);
  const [textImportData, setTextImporData] = useState([]);
  const [sePlanOrdLinkData, setSePlanOrdLinkData] = useState([]);
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openPp026Excel, setOpenPp026Excel] = useState(false);
  const [openShipingOrder, setOpenShipingOrder] = useState(false);
  const [openCustomsReport, setOpenCustomsReport] = useState(false);
  const [selectRow, setSelectRow] = useState(null);
  const [selectRows, setSelectRows] = useState([]);
  const [selectSPOL, setSelectSPOL] = useState([]);
  const [selectRT, setSelectRT] = useState([]);
  const [selectTI, setSelectTI] = useState([]);
  const [selectSTT, setSelectSTT] = useState([]);
  const [authorization, setAuthorizations] = useState([]);
  const [filter, setFilter] = useState("");
  const [file, setFile] = useState(null);
  const [jumpToRow, setJumpToRow] = useState(null);
  const [jumptoRowSPOL, setJumpToRowSPOL] = useState(null);
  const [jumpToRowRT, setJumpToRowRT] = useState(null);
  const [jumpToRowTI, setJumpToRowTI] = useState(null);
  const [jumpToRowSTT, setJumpToRowSTT] = useState(null);
  const [totalData, setTotalData] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [isSearch, setIsSearch] = useState(false);
  const [searchFilter, setSearchFilter] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalSPOLData, setTotalSPOLData] = useState(0);
  const [currentSPOLPage, setCurrentSPOLPage] = useState(0);
  const [currentSPOLPageSize, setCurrentSPOLPageSize] = useState(10);
  const [currentSPOLOffset, setCurrentSPOLOffset] = useState(0);
  const [isSPOLSearch, setIsSPOLSearch] = useState(false);
  const [searchSPOLFilter, setSearchSPOLFilter] = useState({});
  const [hasSPOLMore, setHasSPOLMore] = useState(false);
  const [hasRTMore, setHasRTMore] = useState(false);
  const [hasTIMore, setHasTIMore] = useState(false);
  const [hasSTTMore, setHasSTTMore] = useState(false);
  const [selectSPOLCheck, setSelectSPOLCheck] = useState(null);
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const [dropdownValues, setDropdownValues] = useState({});
  const toolbarRef = useRef(null);
  const [dropdownSPOLValues, setDropdownSPOLValues] = useState({});
  const toolbarSPOLRef = useRef(null);
  const toolbarRTRef = useRef(null);
  const [pp026ExcelForm, setPP026ExcelForm] = useState({
    plan_date: "",
    s_date_1: "",
    e_date_1: "",
    mat_code: "",
  });
  const { user } = useAuth();
  const {
    fetchTableControlTranslations,
    fetchTableColumnTranslations,
    language,
  } = useColumnTranslation();
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  //========== FETCH DATA SECTION ================
  //fetch all factory

  const fetchAll = async (authData = null, pageSize = 10, offset = 0) => {
    const authToUse = authData || authorization;

    const allow = Array.isArray(authToUse)
      ? authToUse.find((item) => item.field === "query_level")?.title
      : null;

    setCurrentPage(0);
    setCurrentPageSize(pageSize);
    setCurrentOffset(0);
    const combinedData = await fnQuery([
      () =>
        fetchAcCoM(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          language,
          pageSize,
          offset,
        ),
    ]);
    setData([{ tableName: "AC_CO_M", data: combinedData[0].data }]);
    setHasMore(combinedData?.[0]?.hasMore);
    if (
      combinedData?.[0]?.total !== undefined &&
      combinedData?.[0]?.total !== null
    ) {
      setTotalData(combinedData?.[0]?.total);
    }
    if (combinedData?.[0]?.data?.length > 0) {
      setSelectRows([combinedData[0].data[0]]);
      setJumpToRow(combinedData[0].data[0]);
    }
  };
  //fetch all translation of factory
  const fetchAllTranslations = async () => {
    try {
      const columns = await fetchTableColumnTranslations(
        "ACTF_022",
        "master",
        "ac_co_m",
      );
      const controls = await fetchTableControlTranslations("ACTF_022");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user.factory,
        user.department,
        user.user_code,
        "ACTF_022",
      );
      const mergedControls = [...controls?.data, ...sysMessages?.data];
      if (mergedControls.length > 0) {
        setControlTranslations(mergedControls);
      }
      const mergedComplexColumn = [...controls?.data, ...columns?.data];
      if (mergedComplexColumn.length > 0)
        setColumnTranslations(mergedComplexColumn);

      if (auth) setAuthorizations(auth?.data);
      return auth?.data || [];
    } catch (error) {
      console.error(" Error:", error);
      return [];
    }
  };
  const fetchRecordFromDB = async (record) => {
    try {
      const response = await fetchAcCoMByID(
        selectRows[0]?.factory_code,
        selectRows[0]?.co_id,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };
  //========== END FETCH DATA SECTION ================

  // ========== USEEFFECT SECTION ==========
  //  UseEffect #1: Language thay đổi - Fetch lại translations
  // - Chạy khi language (VN/EN/...) thay đổi
  // - Fetch column translations, control translations, và permissions
  // - Update UI labels theo ngôn ngữ mới
  useEffect(() => {
    fetchAllTranslations();
  }, [language]);
  //  UseEffect #2: Khởi tạo - Fetch tất cả factory
  // - Chạy 1 lần khi component mount
  // - Gọi fetchF() để load dữ liệu
  // - Select row đầu tiên nếu có data
  useEffect(() => {
    const init = async () => {
      const authData = await fetchAllTranslations();
      await fetchAll(authData);
    };
    init();
  }, [language]);
  // 🔵 UseEffect #3: Jump to Row animation
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
  // ========== END USEEFFECT SECTION ==========

  //========== HANDLER SECTION ================
  const refreshCurrentData = async () => {
    const currentSelection = selectRows.length > 0 ? selectRows[0] : null;

    if (isSearch && searchFilter) {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;

      const response = await searchAcCoMByFilter(
        searchFilter,
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        language,
        currentPageSize,
        currentOffset,
      );

      if (response && response.data) {
        setData([{ tableName: response.tableName, data: response.data }]);

        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${currentSelection.co_id}}`;
          const foundRecord = response.data.find(
            (item) => `${item.factory_code}-${item.co_id}` === currentKey,
          );

          if (foundRecord) {
            setSelectRows([foundRecord]);
            // setJumpToRow(foundRecord);
          } else if (response.data.length > 0) {
            setSelectRows([response.data[0]]);
            setJumpToRow(response.data[0]);
          } else {
            setSelectRows([]);
          }
        }
      }
    } else {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;

      const responseData = await fetchAcCoM(
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        language,
        currentPageSize,
        currentOffset,
      );
      if (responseData && responseData.data) {
        setData([{ tableName: "AC_CO_M", data: responseData.data }]);
        setHasMore(responseData?.hasMore);

        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${parseInt(currentSelection.co_id)}`;
          const updatedRecord = responseData.data.find(
            (item) =>
              `${item.factory_code}-${parseInt(item.co_id)}` === currentKey,
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
  //handler row choose
  const handleSelectChoose = (rows) => {
    setSelectRows(rows);
  };

  //handler open edit popup
  const handleEditClose = async (data) => {
    try {
      const record = data || selectRows[0];

      if (record?.locked_information === user?.clientInfo) {
        const unlockData = {
          ...record,
          locked_information: null,
        };
        const {
          statusText,
          sort_name,
          el_country,
          dest_name,
          boat_companynm,
          status_name,
          grt_deptname,
          grt_username,
          last_username,
          prod_acno,
          ...cleanData
        } = unlockData;
        await editAcCoM(
          user?.factory,
          user?.department,
          user?.user_code,
          authorization?.find((item) => item.field === "query_level")?.title,
          cleanData,
          currentPageSize,
        );
        await refreshCurrentData();
        setOpenEdit(false);
      }
    } catch (error) {
      console.error(" Error closing edit:", error);
      setOpenEdit(false);
    }
  };
  //handler close edit popup
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
        freshRecord.locked_information !== user?.clientInfo
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
      const { FACTORY, statusText, ...clearData } = freshRecord;
      const lockData = {
        ...clearData,
        locked_information: user?.clientInfo,
      };

      await handleEditABM(lockData, "", true);
      setSelectRows([lockData]);
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
  const handleCloseShiping = () => setOpenShipingOrder(false);
  const handleOpenCustomsReport = () => {
    setOpenCustomsReport(true);
  };

  const handleCloseCustomsReport = async () => {
    await clearTempTable(user?.access_token);
    await clearTempTextTable(user?.access_token);
    setOpenCustomsReport(false);
  };
  const handleOpenShiping = () => {
    setOpenShipingOrder(true);
  };

  const handleOpenPp026Excel = () => {
    setOpenPp026Excel(true);
  };

  const handleClosePp026Excel = () => setOpenPp026Excel(false);
  //handler close add popup
  const handleAddClose = () => setOpenAdd(false);
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
  const handleModal = (row) => {
    setSelectRow(row);
    setOpen(true);
  };
  const handleDetailModal = (row) => {
    setSelectRow(row);
    setOpenDetail(true);
  };
  const onSetFilter = (filter) => {
    setFilter(filter);
  };
  //handler add import material tracking
  const handleAdd = async (data) => {
    data.factory_code = user.factory;
    data.grt_user = user.user_code;
    data.grt_date = new Date().toISOString();
    data.grt_dept = user.department;
    data.status = 1;
    try {
      const response = await addAcCoM(
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        data,
        currentPage,
      );
      if (response.success) {
        const allow = Array.isArray(authorization)
          ? authorization.find((item) => item.field === "query_level")?.title
          : null;
        const responseData = await fetchAcCoM(
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
            tableName: "AC_CO_M",
            data: responseData.data || [],
          },
        ]);
        showSuccessToast(
          getControlLabel,
          "noti_success_add",
          `Add successfully with id ${data.co_id}!`,
        );
        setHasMore(responseData?.hasMore);
        setSelectRows([response.data]);
        setJumpToRow(response.data);
        setCurrentPage(response?.page);
        setCurrentPageSize(response.size);
        setCurrentOffset(response.offset);
        setIsSearch(false);
        setSearchFilter(null);
        setTotalData((prevTotal) => prevTotal + 1);
        handleAddClose();
      } else {
        showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
        handleAddClose();
      }
    } catch (error) {
      showErrorToast(
        getControlLabel,
        "noti_fail_duplicate_add",
        "Cannot add duplicate id!",
      );
    }
  };
  const handleEditABM = async (updateRow, title, skipTimestamp = false) => {
    try {
      const {
        statusText,
        sort_name,
        el_country,
        dest_name,
        boat_companynm,
        status_name,
        grt_deptname,
        grt_username,
        last_username,
        prod_acno,
        ...cleanData
      } = updateRow;
      if (!skipTimestamp) {
        cleanData.last_user = user.user_code;
        cleanData.last_date = new Date().toISOString();
      }

      const result = await editAcCoM(
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        cleanData,
        currentPageSize,
      );
      if (result.success) {
        const successMessage =
          typeof title === "string" && title
            ? title
            : `Edit bom with code(${cleanData.co_id}) successfully !!!`;
        if (!skipTimestamp) {
          showSuccessToast(
            getControlLabel,
            "noti_success_edit",
            successMessage,
          );
        }
        if (isSearch) {
          // Unlock trước (nếu cần)
          if (
            !skipTimestamp &&
            cleanData.locked_information === user?.clientInfo
          ) {
            const unlockData = {
              ...cleanData,
              locked_information: null,
            };
            await editAcCoM(
              user?.factory,
              user?.department,
              user?.user_code,
              authorization?.find((item) => item.field === "query_level")
                ?.title,
              unlockData,
              currentPageSize,
            );
          }

          //  Refresh với current page/offset
          await refreshCurrentData();
        } else {
          //  Không search - dùng resultPage/resultOffset từ backend
          const resultPage =
            result.size !== undefined
              ? Math.floor(result.position / result.size)
              : currentPage;
          const resultOffset =
            result.offset !== undefined ? result.offset : currentOffset;

          if (resultPage !== currentPage) {
            // Record chuyển page
            const allow = Array.isArray(authorization)
              ? authorization.find((item) => item.field === "query_level")
                  ?.title
              : null;

            const responseData = await fetchAcCoM(
              user?.factory,
              user?.department,
              user?.user_code,
              allow || "1",
              language,
              currentPageSize,
              resultOffset,
            );

            if (responseData && responseData.data) {
              setData([
                {
                  tableName: "AC_CO_M",
                  data: responseData.data,
                },
              ]);
              setCurrentPage(resultPage);
              setCurrentOffset(resultOffset);
              setHasMore(responseData?.hasMore);
              const editedRecord = responseData.data.find(
                (item) =>
                  `${item.factory_code}-${item.co_id}` ===
                  `${cleanData.factory_code}-${cleanData.co_id}`,
              );

              if (editedRecord) {
                setSelectRows([editedRecord]);
                setJumpToRow(editedRecord);
              }
            }
          } else {
            //  Unlock trước (nếu cần)
            if (
              !skipTimestamp &&
              cleanData.locked_information === user?.clientInfo
            ) {
              const unlockData = {
                ...cleanData,
                locked_information: null,
              };
              await editAcCoM(
                user?.factory,
                user?.department,
                user?.user_code,
                authorization?.find((item) => item.field === "query_level")
                  ?.title,
                unlockData,
                currentPageSize,
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
    } catch (error) {
      showErrorToast(
        getControlLabel,
        "noti_edit_fail_3",
        `Cannot edit successfully for user ${user.user_code}!`,
        {
          user: user?.user_code,
        },
      );
      console.log("data has been problem", error);
    }
  };

  //handler search by filter
  const handleSearchByFilter = async (
    filteredShoe,
    pageSize = 10,
    offset = 0,
  ) => {
    try {
      const search = filteredShoe?.search || {};
      const hasSearchCriteria = Object.keys(search).length > 0;

      if (!hasSearchCriteria) {
        setIsSearch(false);
        setSearchFilter(null);
        await fetchAll();
        return;
      }
      setIsSearch(true);
      setSearchFilter(filteredShoe);
      const isNewFilter =
        JSON.stringify(filteredShoe) !== JSON.stringify(searchFilter);
      const actualOffset = isNewFilter ? 0 : (offset ?? currentOffset);
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;
      if (offset === 0) {
        setCurrentPage(0);
        setCurrentPageSize(pageSize);
        setCurrentOffset(0);
      }
      const response = await searchAcCoMByFilter(
        filteredShoe,
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        language,
        pageSize,
        actualOffset,
      );

      if (response && response.data) {
        if (response.data.length === 0) {
          setSelectRows([]);
          setCurrentOffset(0);
          setCurrentPage(0);
          setCurrentPageSize(pageSize);
          setHasMore(false);
          setTotalData(0);
          setData([{ tableName: "AC_CO_M", data: response.data }]);
        } else {
          setSelectRows([response.data[0]]);
          // setJumpToRow(response.data[0]);
          setTimeout(() => {
            console.log(" AFTER 100ms, selectRows:", selectRows);
          }, 100);
          if (offset === 0 && response.data.length > 0) {
            setTotalData(response.total);
          }
          setData([{ tableName: response.tableName, data: response.data }]);
        }
      }
    } catch (error) {
      console.log("cannot search because", error);
    }
  };
  //handler cancel
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
      }
      const freshRecord = await fetchRecordFromDB(record);
      if (
        freshRecord.locked_information &&
        freshRecord.locked_information !== "null" &&
        freshRecord.locked_information !== "undefined" &&
        freshRecord.locked_information !== "" &&
        freshRecord.locked_information !== user?.clientInfo
      ) {
        showErrorToast(
          getControlLabel,
          "noti_fail_2",
          ` Cannot ${actionName}!\n\nRecord is edited by: ${freshRecord.locked_information}\n\nWait for user to finish!`,
          {
            actionName: actionName,
            user: freshRecord.locked_information || "Unknown",
          },
          { toastId: `inactive-${actionName}` },
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
        return;
      }
      const { FACTORY, ...clearData } = freshRecord;
      const updateData = {
        ...clearData,
        status: newStatus,
        last_user: user.user_code,
        last_date: new Date().toISOString(),
      };

      const response = await editAcCoM(
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        updateData,
        currentPageSize,
      );

      if (response.success) {
        showSuccessToast(getControlLabel, `noti_success_${actionName}`);
        await refreshCurrentData();
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

  const handleCancel = () => {
    handleStatusChange(0, "cancel", [1, 2]);
  };

  const handleConfirm = () => {
    handleStatusChange(7, "confirm", [1, 2]);
  };

  const handleUnconfirm = () => {
    handleStatusChange(1, "unconfirm", [7]);
  };

  const handleClose = () => {
    handleStatusChange(9, "close", [1, 7]);
  };

  const handleCheck = () => {
    handleStatusChange(2, "check", [1]);
  };
  //handler import Excel
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
  //handler export Excel
  const handleExport = async (search) => {
    const allow = authorization?.find(
      (item) => item.field === "query_level",
    )?.title;
    try {
      const result = await exportExcel(
        user?.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        allow || "1",
        language,
        search || {},
      );
      if (result && result.success) {
        showSuccessToast(
          getControlLabel,
          `noti_success_excel_ship_order`,
          result?.message,
        );
      }
    } catch (error) {
      console.log("error in export material", error?.message);

      showErrorToast(
        getControlLabel,
        `noti_error_excel_ship_order`,
        "Failed to export excel ship order",
      );
    }
  };
  const handleCustomExport = async () => {
    const exportFile = {
      factory_code: user?.factory,
      invoice_no: selectRows[0]?.invoice_no,
    };
    const customExcel = await exportCustomExcel(exportFile);
  };
  const handleMaterialExport = async () => {
    const exportFile = {
      factory_code: user?.factory,
      invoice_no: selectRows[0]?.invoice_no,
    };
    const materialExcel = await exportMaterialExcel(exportFile);
  };
  //handler export PDF
  const handlePDF = async () => {
    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;
    await exportPDFABM(
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
    );
  };
  //handler send file image
  const handleFile = (e) => {
    const selectedFiled = e.target.files[0];
    if (selectedFiled) {
      setFile(selectedFiled);
    }
  };
  const handleCheckBoxAll = async (isChecked) => {
    const result = await checkBox(
      user?.access_token,
      user?.factory,
      user?.department,
      user?.user_code,
      isChecked ? "Y" : "N",
      null,
      searchSPOLFilter?.search,
      true,
      language,
    );
    setSelectSPOLCheck(isChecked ? result?.data?.items : []);
    setSelectSPOL(isChecked ? result?.data?.items : [result?.data?.items[0]]);
  };
  const handleCheckBoxChange = async (rows, uncheckedRow = null) => {
    const normalizedRows = Array.isArray(rows) ? rows : rows ? [rows] : [];
    let targetRow;
    if (uncheckedRow) {
      targetRow = uncheckedRow;
    } else if (normalizedRows.length > 0) {
      targetRow = normalizedRows[normalizedRows.length - 1];
    } else {
      targetRow = selectChgM[0];
    }
    setSelectSPOL(normalizedRows);
    setSelectSPOLCheck(normalizedRows);
    setJumpToRowSPOL(targetRow);
    await handleCheckBox(normalizedRows, targetRow);
  };
  const handleCheckBox = async (rows, targetRow) => {
    const normalizedRows = Array.isArray(rows) ? rows : rows ? [rows] : [];

    if (!targetRow) {
      return { success: false, message: "No target row found" };
    }

    const isTargetRowChecked = normalizedRows.some(
      (r) =>
        `${r.factory_code}-${r.se_id}-${r?.se_ver}-${r?.se_seq}-${r?.ship_seq}-${r?.pack_gu}` ===
        `${targetRow.factory_code}-${targetRow.se_id}-${targetRow.se_ver}-${targetRow.se_seq}-${targetRow.ship_seq}-${targetRow.pack_gu}`,
    );

    const rowKey = `${targetRow.factory_code}-${targetRow.se_id}-${targetRow.se_ver}-${targetRow.se_seq}-${targetRow.ship_seq}-${targetRow.pack_gu}`;

    if (!isTargetRowChecked) {
      // ────────────────────────────────────
      // CASE 1: UNCHECK
      // ────────────────────────────────────

      const filteredChecked = selectSPOLCheck.filter(
        (row) =>
          `${row.factory_code}-${row.se_id}-${row.se_ver}-${row.se_seq}-${row.ship_seq}-${row.pack_gu}` !==
          rowKey,
      );
      setSelectSPOLCheck(filteredChecked);
      setSelectSPOL(selectSPOLCheck);
      try {
        const result = await checkBox(
          user?.access_token,
          user?.factory,
          user?.department,
          user?.user_code,
          "N",
          targetRow,
        );
        if (result) {
          const po = await getTempTable(user?.access_token);
        }
      } catch (error) {
        console.error("Error unchecking:", error);
        return {
          success: false,
          message: error?.response?.data?.message || "Cannot uncheck this item",
        };
      }
    } else {
      // ────────────────────────────────────
      // CASE 2: CHECK
      // ────────────────────────────────────
      try {

        const result = await checkBox(
          user?.access_token,
          user?.factory,
          user?.department,
          user?.user_code,
          "Y",
          targetRow,
        );
        if (result) {
          const po = await getTempTable(user?.access_token);
        }
      } catch (error) {
        console.error(" Error checking:", error);
        return {
          success: false,
          message: error?.response?.data?.message || "An error occurred",
        };
      }
    }
  };
  const handleOk = async () => {
    try {
      const response = await confirmCheck(
        user?.access_token,
        user?.factory_code,
        user?.department_code,
        user?.user_code,
        selectRows[0],
      );
      if (response && response.success) {
        showSuccessToast(getControlLabel, "noti_success_ok");
        const childData = await fetchAllSePlanOrdLink(
          user?.access_token,
          user?.factory,
          user?.department,
          user?.user_code,
          authorization?.find((item) => item.field === "query_level")?.title,
          language,
          currentSPOLPageSize,
          currentSPOLOffset,
        );
        const parentData = await fetchAcCoM(
          user?.access_token,
          user?.factory,
          user?.department,
          user?.user_code,
          authorization?.find((item) => item.field === "query_level")?.title,
          currentPageSize,
          currentOffset,
        );

        setSePlanOrdLinkData([
          { tableName: "SE_PLAN_ORD_LINK", data: childData?.data },
        ]);
        setSelectSPOL([childData?.data[0]]);
        setSelectSPOLCheck([]);
        await refreshCurrentData();
      }
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_ok", "Can not confirm check!");
    }
  };
  const handlePageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentPage(newPage);
    setCurrentPageSize(newPageSize);
    setCurrentOffset(newOffset);

    if (isSearch && searchFilter) {
      await handleSearchByFilter(searchFilter, newPageSize, newOffset);
      return;
    }

    //  CASE 3: Không search
    const responseData = await fetchAcCoM(
      user?.factory,
      user?.department,
      user?.user_code,
      authorization?.find((item) => item.field === "query_level")?.title,
      language,
      newPageSize,
      newOffset,
    );

    setData([{ tableName: "AC_CO_M", data: responseData.data || [] }]);
    setHasMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectRows([responseData.data[0]]);
    }
  };
  const handleSPOLPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentSPOLPage(newPage);
    setCurrentSPOLPageSize(newPageSize);
    setCurrentSPOLOffset(newOffset);
    const allow = authorization.find(
      (item) => item.field === "query_level",
    )?.title;
    if (isSearch && searchFilter) {
      const search = searchFilter.search || {};
      const hasAIM = "status" in search || "se_custid" in search;
      const hasOther = Object.keys(search).some(
        (k) => k !== "status" && k !== "se_custid",
      );
      if (hasAIM && !hasOther) {
        await handleSearchByFilter(searchFilter, newPageSize, newOffset);
        return;
      }
    }
    //  CASE 2: Không search
    const responseData = await fetchAllSePlanOrdLink(
      user?.access_token,
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
      language,
      newPageSize,
      newOffset,
    );
    setSePlanOrdLinkData([
      {
        tableName: "SE_PLAN_ORD_LINK",
        data: responseData.data || [],
      },
    ]);
    setHasSPOLMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectSPOL([responseData.data[0]]);
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
  const createAcCoMCallback = (fieldName) => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchFieldDropDown(
          user?.factory,
          fieldName,
          page,
          pageSize,
          searchText,
        );
        const newData = [...result?.data, { expire_id: "" }];
        return {
          data: newData || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error(`Error fetching :`, error);
        return { data: [], total: 0, pageSize };
      }
    };
  };
  const createCustIdCallback = (fieldName) => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchAllCustDropdown(
          user?.factory,
          user?.department,
          user?.user_code,
          authorization?.find((item) => item.field === "query_level")?.title,
          fieldName,
          language,
          page,
          pageSize,
          searchText,
        );
        const newData = [...result?.data, { expire_id: "" }];
        return {
          data: newData || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error(`Error fetching:`, error);
        return { data: [], total: 0, pageSize };
      }
    };
  };
  const createSeCustCallback = (fieldName) => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchFieldDropDownSeCust(
          user?.factory,
          fieldName,
          language,
          page,
          pageSize,
          searchText,
        );
        const newData = [...result?.data, { expire_id: "" }];
        return {
          data: newData || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error(`Error fetching :`, error);
        return { data: [], total: 0, pageSize };
      }
    };
  };
  const createSePlanOrdCallback = (fieldName) => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchFieldDropDownSePlanOrd(
          user?.access_token,
          user?.factory,
          fieldName,
          language,
          page,
          pageSize,
          searchText,
        );
        const newData = [...result?.data, { expire_id: "" }];
        return {
          data: newData || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error(`Error fetching :`, error);
        return { data: [], total: 0, pageSize };
      }
    };
  };
  const getFetchData = {
    print_id: createAcCoMCallback("print_id"),
    se_id: createAcCoMCallback("se_id"),
    cust_id: createCustIdCallback("cust_id_1"),
  };
  const getFetchSPOLData = {
    se_custid: createSeCustCallback("cust_id"),
    agent: createSePlanOrdCallback("col5"),
  };
  //========== END LABEL TRANSLATION HANDLER ==============
  //set width base on screen size
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
      <Box sx={{ p: 2 }}>
        <Container maxWidth="xl">
          <Stack direction="row" flexWrap="wrap" sx={{ rowGap: 1 }}>
            <Paper
              sx={{
                width: "100%",
                maxWidth: "100%",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <DataTable
                data={data[0]?.data}
                tableName={"AC_CO_M"}
                onAdd={handleOpenAdd}
                onEdit={handleOpenEdit}
                onSetFilter={onSetFilter}
                filter={filter}
                onSearch={handleSearchByFilter}
                onSelectChange={handleSelectChoose}
                selectRows={selectRows}
                onDelete={(row) => {
                  handleModal(row);
                }}
                onDeleteAll={(row) => {
                  handleModal(row);
                }}
                onCancel={handleCancel}
                onConfirm={handleConfirm}
                onUnconfirm={handleUnconfirm}
                onClose={handleClose}
                onDetail={(row) => {
                  handleDetailModal(row);
                }}
                onExportSummary={handleExport}
                onImport={handleImport}
                onCheck={handleCheck}
                onCustomExport={handleCustomExport}
                onMaterialExport={handleMaterialExport}
                onPDF={handlePDF}
                onFile={handleFile}
                file={file}
                columnTranslations={columnTranslations}
                controlTranslations={controlTranslations}
                language={language}
                getControlLabel={getControlLabel}
                getColumnLabel={getColumnLabel}
                jumpToRow={jumpToRow}
                totalData={totalData || 0}
                onPageChange={handlePageChange}
                currentPage={currentPage}
                currentPageSize={currentPageSize}
                isSearch={isSearch}
                hasMore={hasMore}
                getFetchData={getFetchData}
                dropDownValues={dropdownValues}
                setDropdownValues={setDropdownValues}
                ref={toolbarRef}
                onImportShipment={handleOpenShiping}
                onCustomReport={handleOpenCustomsReport}
              />
            </Paper>
          </Stack>
        </Container>
      </Box>

      {/* ========== MODAL/DIALOG COMPONENTS ========== */}

      {/*  Add Factory Modal */}
      {/* - Mở khi user click "Add" button */}
      {/* - Gọi handleAdd khi submit form */}
      <AddAcCoM
        open={openAdd}
        onClose={handleAddClose}
        handleAdd={handleAdd}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={authorization}
        language={language}
      />
      {/*  Edit Factory Modal */}
      {/* - Mở khi user click "edit" button */}
      {/* - Gọi handleEditABM khi submit form */}
      <EditAcCoM
        open={openEdit}
        onClose={handleEditClose}
        rowData={selectRows.length > 0 ? selectRows[0] : null}
        handleEdit={handleEditABM}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={authorization}
        language={language}
      />
      <ShippingOrderPopup
        openLink={openShipingOrder}
        onClose={handleCloseShiping}
        data={sePlanOrdLinkData}
        setData={setSePlanOrdLinkData}
        jumpToRow={jumptoRowSPOL}
        setJumpToRow={setJumpToRowSPOL}
        selectRows={selectRows.length > 0 ? selectRows : []}
        selectSOMC={selectSPOL}
        setSelectSOMC={setSelectSPOL}
        subAuthentication={authorization}
        currentPage={currentSPOLPage}
        currentPageSize={currentSPOLPageSize}
        setCurrentOffset={setCurrentSPOLOffset}
        totalData={totalSPOLData}
        setTotalData={setTotalSPOLData}
        hasMore={hasSPOLMore}
        setHasMore={setHasSPOLMore}
        isSearch={isSPOLSearch}
        setIsSearch={setIsSPOLSearch}
        searchFilter={searchSPOLFilter}
        setSearchFilter={setSearchSPOLFilter}
        setCurrentPage={setCurrentSPOLPage}
        setCurrentPageSize={setCurrentSPOLPageSize}
        onPageChange={handleSPOLPageChange}
        user={user}
        selectCheck={selectSPOLCheck}
        handleCheckboxChange={handleCheckBoxChange}
        //onAutoAdd={handleAutoAdd}
        getFetchData={getFetchSPOLData}
        dropdownValues={dropdownSPOLValues}
        setDropdownValues={setDropdownSPOLValues}
        onOk={handleOk}
        onCheckBoxAll={handleCheckBoxAll}
      />
      <SapTransTypePopup
        openLink={openCustomsReport}
        onClose={handleCloseCustomsReport}
        data={sePlanOrdLinkData}
        setData={setSePlanOrdLinkData}
        rdTempdata={rdTempdata}
        setRdTempData={setRdTempData}
        sapTransTypeData={sapTransTypeData}
        setSapTransTypData={setSapTransTypData}
        textImportData={textImportData}
        setTextImporData={setTextImporData}
        jumpToRow={jumptoRowSPOL}
        setJumpToRow={setJumpToRowSPOL}
        selectRows={selectRows.length > 0 ? selectRows : []}
        selectSOMC={selectSPOL}
        setSelectSOMC={setSelectSPOL}
        selectRT={selectRT}
        setSelectRT={setSelectRT}
        selectTI={selectTI}
        setSelectTI={setSelectTI}
        selectSTT={selectSTT}
        setSelectSTT={setSelectSTT}
        jumpToRowRT={jumpToRowRT}
        setJumpToRowRT={setJumpToRowRT}
        jumpToRowTI={jumpToRowTI}
        setJumpToRowTI={setJumpToRowTI}
        jumpToRowSTT={jumpToRowSTT}
        setJumpToRowSTT={setJumpToRowSTT}
        subAuthentication={authorization}
        currentPage={currentSPOLPage}
        currentPageSize={currentSPOLPageSize}
        setCurrentOffset={setCurrentSPOLOffset}
        totalData={totalSPOLData}
        setTotalData={setTotalSPOLData}
        hasMore={hasSPOLMore}
        setHasMore={setHasSPOLMore}
        hasRTMore={hasRTMore}
        setHasRTMore={setHasRTMore}
        hasTIMore={hasTIMore}
        setHasTIMore={setHasTIMore}
        hasSTTMore={hasSTTMore}
        setHasSTTMore={setHasSTTMore}
        isSearch={isSPOLSearch}
        setIsSearch={setIsSPOLSearch}
        searchFilter={searchSPOLFilter}
        setSearchFilter={setSearchSPOLFilter}
        setCurrentPage={setCurrentSPOLPage}
        setCurrentPageSize={setCurrentSPOLPageSize}
        onPageChange={handleSPOLPageChange}
        user={user}
        selectCheck={selectSPOLCheck}
        handleCheckboxChange={handleCheckBoxChange}
        //onAutoAdd={handleAutoAdd}
        getFetchData={getFetchSPOLData}
        dropdownValues={dropdownSPOLValues}
        setDropdownValues={setDropdownSPOLValues}
        onOk={handleOk}
        ref={toolbarRTRef}
        onOpenPp026Excel={handleOpenPp026Excel}
        onClosePp026Excel={handleClosePp026Excel}
        openPp026Excel={openPp026Excel}
        pp026ExcelForm={pp026ExcelForm}
        setPP026ExcelForm={setPP026ExcelForm}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
      />
    </>
  );
};
export default Actf022;
