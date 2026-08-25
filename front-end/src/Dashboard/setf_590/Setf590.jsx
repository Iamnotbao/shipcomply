import { lazy, useCallback, useEffect, useState } from "react";
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
import {
  copyContract,
  exportExcelVwContImp,
  extendConfirmContract,
  extendContract,
} from "../../service/vw_cont_imp/VwContImpService";
import CopyPopup from "../../features/actf_1101/page/CopyPopup";
import ExtendPopup from "../../features/actf_1101/page/ExtendPopup";
import ExtendConfirmPopup from "../../features/actf_1101/page/ExtendConfirmPopup";
import { fetchAllVwContUse } from "../../service/vw_cont_use/VwContUseService";
import DetailAcContM from "../../features/actf_110/page/DetailAcContM";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../utils/notification/Notification";
import {
  fetchBasicDataDropDownByCate,
  searchBasicDataByFilter,
} from "../../service/basic_data/basicDataService";
import AddSeInvM from "../../features/setf_590/page/AddSeInvM";
import EditSeInvM from "../../features/setf_590/page/EditSeInvM";
import {
  active,
  addSelnvM,
  autoAddSelnvM,
  cancelActive,
  closeAll,
  editSelnvM,
  exportExcel,
  fetchAllInvM,
  fetchSelnvMByID,
  pdfToFsi,
  searchSelnvMByFilter,
  updateHsCode,
  updateInvoiceDate,
  updateNWGW,
  voidAll,
} from "../../service/se_inv_m/seInvM";
import CustomDeclarationPopup from "../../features/setf_590/page/CustomDeclarationPopup";
import {
  autoAdd,
  checkBox,
  clearTempTable,
  fetchChgM,
  getTempTable,
} from "../../service/chg_m/chgM";
import { fetchAllSelnvD, fetchSelnvDByID } from "../../service/se_inv_d/seInvD";
import { fetchAllSPIForInvM } from "../../service/sd_price_item/sdPriceItem";
import SdPriceItem from "../../features/setf_590/component/SdPriceItem";
import SeInvD from "../../features/setf_590/component/SeInvD";
import { fetchFieldDropdown } from "../../service/ac_chg_m/acChgM";
import InvoicePrintPopup from "../../features/setf_590/page/InvoicePrintPopup";
import { set } from "react-hook-form";
import ImportLinkPopup from "../../features/setf_590/page/ImportLinkPopup";
const Setf590 = () => {
  const [data, setData] = useState([]);
  const [seInvDData, setSeInvDData] = useState([]);
  const [sdPriceItemData, setSdPriceItemData] = useState([]);
  const [vwContUseDData, setVwContUseData] = useState([]);
  const [chgMData, setChgMData] = useState([]);
  const [open, setOpen] = useState(false);
  const [openAddAcContD, setOpenAddAcContD] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openCopy, setOpenCopy] = useState(false);
  const [openExtend, setOpenExtend] = useState(false);
  const [openExtendConfirm, setOpenExtendConfirm] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openSelectCustoms, setOpenSelectCustoms] = useState(false);
  const [openInvoicePrint, setOpenInvoicePrint] = useState(false);
  const [selectRow, setSelectRow] = useState(null);
  const [selectRows, setSelectRows] = useState([]);
  const [selectSID, setSelectSID] = useState([]);
  const [selectSPI, setSelectSPI] = useState([]);
  const [selectVwContUse, setSelectVwContUse] = useState([]);
  const [selectChgM, setSelectChgM] = useState([]);
  const [selectCMCheck, setSelectCMCheck] = useState(null);
  const [searchChgMFilter, setSearchChgMFilter] = useState({});
  const [searchFilter, setSearchFilter] = useState({});
  const [isSearch, setIsSearch] = useState(false);
  const [isChgMSearch, setIsChgMSearch] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [authorization, setAuthorizations] = useState([]);
  const [filter, setFilter] = useState("");
  const [file, setFile] = useState(null);
  const [jumpToRow, setJumpToRow] = useState(null);
  const [jumpToRowSID, setJumpToRowSID] = useState(null);
  const [jumpToRowChgM, setJumpToRowChgM] = useState(null);
  const [jumpToRowSPI, setJumpToRowSPI] = useState(null);
  const [dropdownValues, setDropdownValues] = useState({});
  const [openImportLink, setOpenImportLink] = useState(false);
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
  const [selectedContImp, setSelectedContImp] = useState(null);
  const [totalData, setTotalData] = useState(0);
  const [totalSIDData, setTotalSIDData] = useState(0);
  const [totalSPIData, setTotalSPIData] = useState(0);
  const [totalVCUData, setTotalVCUData] = useState(0);
  const [totalCMData, setTotalCMData] = useState(0);
  const [currentACMOffset, setCurrentACMOffset] = useState(0);
  const [currentACMPage, setCurrentACMPage] = useState(0);
  const [currentACMPageSize, setCurrentACMPageSize] = useState(5);
  const [currentSIDOffset, setCurrentSIDOffset] = useState(0);
  const [currentSIDPage, setCurrentSIDPage] = useState(0);
  const [currentSIDPageSize, setCurrentSIDPageSize] = useState(10);
  const [currentSPIOffset, setCurrentSPIOffset] = useState(0);
  const [currentSPIPage, setCurrentSPIPage] = useState(0);
  const [currentSPIPageSize, setCurrentSPIPageSize] = useState(10);
  const [currentVCUOffset, setCurrentVCUOffset] = useState(0);
  const [currentVCUPage, setCurrentVCUPage] = useState(0);
  const [currentVCUPageSize, setCurrentVCUPageSize] = useState(10);
  const [currentCMOffset, setCurrentCMOffset] = useState(0);
  const [currentCMPage, setCurrentCMPage] = useState(0);
  const [currentCMPageSize, setCurrentCMPageSize] = useState(5);
  const [searchBasicDataFilter, setSearchBasicDataFilter] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [hasSIDMore, setHasSIDMore] = useState(false);
  const [hasSPIMore, setHasSPIMore] = useState(false);
  const [hasVCUMore, setHasVCUMore] = useState(false);
  const [hasCMMore, setHasCMMore] = useState(false);
  //========== FETCH DATA SECTION ================
  //fetch all factory

  const fetchAll = async (authData = null, pageSize = 5, offset = 0) => {
    const authToUse = authData || authorization;

    const allow = Array.isArray(authToUse)
      ? authToUse.find((item) => item.field === "query_level")?.title
      : null;
    setCurrentACMPage(0);
    setCurrentACMPageSize(pageSize);
    setCurrentACMOffset(0);
    const [combinedData] = await fnQuery([
      () =>
        fetchAllInvM(
          user.factory,
          user.department,
          user.user_code,
          allow,
          language,
          pageSize,
          offset,
        ),
    ]);
    if (combinedData) {
      if (combinedData.total !== undefined && combinedData.total !== null) {
        setTotalData(combinedData.total);
      }
      setData([
        {
          tableName: "SE_INV_M",
          data: combinedData.data || [],
        },
      ]);
      setHasMore(combinedData?.hasMore);
      if (combinedData.data && combinedData.data.length > 0) {
        setSelectRows([combinedData.data[0]]);
        setJumpToRow(combinedData.data[0]);
      }
    }
  };
  //fetch all translation of factory
  const fetchAllTranslations = async () => {
    try {
      const controls = await fetchTableControlTranslations("SETF_590");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const columns = await fetchTableColumnTranslations(
        "SETF_590",
        "master",
        "se_inv_m",
      );
      const auth = await fetchTablePermission(
        user.factory,
        user.department,
        user.user_code,
        "SETF_590",
      );
      const mergedControls = [...controls?.data, ...sysMessages?.data];
      if (mergedControls.length > 0) {
        setControlTranslations(mergedControls);
      }
      const mergedComplexColumn = [...controls?.data, ...columns?.data];
      if (auth) setAuthorizations(auth?.data);
      if (mergedComplexColumn.length > 0)
        setColumnTranslations(mergedComplexColumn);
      return auth?.data || [];
    } catch (error) {
      console.error(" Error:", error);
      return [];
    }
  };
  const fetchDataByAcnoForSID = async (
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
        : currentSIDOffset;
    const pageSize =
      explicitPageSize !== null ? explicitPageSize : currentSIDPageSize;
    const response = await fetchAllSelnvD(
      user?.factory,
      user?.department,
      user?.user_code,
      allow,
      selectRows[0]?.ac_no,
      selectRows[0]?.invoice_id,
      selectSPI[0]?.se_id,
      selectSPI[0]?.se_ver,
      selectSPI[0]?.se_seq,
      language,
      pageSize,
      offset,
    );
    if (response && response.data) {
      let childrenData = response.data;
      setSeInvDData([{ tableName: "SE_INV_D", data: childrenData }]);
      // if (response.total !== undefined && response.total !== null) {
      //   setTotalSIDData(response.total);
      // }
      setHasSIDMore(response?.hasMore);
      if (childrenData.length > 0) {
        setSelectSID([childrenData[0]]);
        setJumpToRowSID(childrenData[0]);
      } else {
        setSelectSID([]);
        setJumpToRowSID(null);
      }
    }
  };
  const fetchDataByAcNoForSPI = async (
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
        : currentSIDOffset;
    const pageSize =
      explicitPageSize !== null ? explicitPageSize : currentSIDPageSize;
    const response = await fetchAllSPIForInvM(
      user?.factory,
      user?.department,
      user?.user_code,
      allow,
      selectRows[0]?.ac_no,
      selectRows[0]?.invoice_no,
      language,
      pageSize,
      offset,
    );
    if (response && response.data) {
      let childrenData = response.data;
      setSdPriceItemData([
        { tableName: "SD_PRICE_ITEM_1", data: childrenData },
      ]);
      // if (response.total !== undefined && response.total !== null) {
      //   setTotalSIDData(response.total);
      // }
      setHasSPIMore(response?.hasMore);
      if (childrenData.length > 0) {
        setSelectSPI([childrenData[0]]);
        setJumpToRowSPI(childrenData[0]);
      } else {
        setSelectSPI([]);
        setJumpToRowSPI(null);
      }
    }
  };
  const fetchVwContUseByContNo = async () => {
    const allow = authorization.find(
      (item) => item.field === "query_level",
    )?.title;

    const response = await fetchAllVwContUse(
      user?.access_token,
      user.factory,
      selectSID[0],
      language,
    );
    if (response && response.data) {
      let childrenData = response.data;
      setVwContUseData([{ tableName: "VW_CONT_USE", data: childrenData }]);
      if (childrenData.length > 0) {
        setSelectVwContUse([childrenData[0]]);
      } else {
        setVwContUseData([]);
      }
    }
  };
  const fetchRecordFromDB = async (record) => {
    try {
      const response = await fetchSelnvMByID(
        user?.access_token,
        selectRows[0]?.factory_code,
        selectRows[0]?.ac_no,
        selectRows[0]?.invoice_id,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };
  const fetchDetailRecordFromDB = async (record) => {
    const allow = authorization.find((item) => item.field === "query_level");
    try {
      const response = await fetchSelnvDByID(
        user?.access_token,
        user?.factory,
        selectSID[0]?.cont_no,
        selectSID[0]?.seq,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };
  const fetchExtendNoti = async () => {
    const allow = authorization.find(
      (item) => item.field === "query_level",
    )?.title;
    const response = await extendContract(
      user.factory,
      user.department,
      user.user_code,
      allow,
      selectRows,
      ``,
    );
  };
  const refreshCurrentAcItemM = async () => {
    const currentSelection = selectRows.length > 0 ? selectRows[0] : null;
    if (isSearch && searchFilter) {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;
      const search = searchFilter.search || {};
      const hasAIM = "status" in search || "cont_no" in search;
      const hasOther = Object.keys(search).some(
        (k) => k !== "status" && k !== "cont_no",
      );
      let response;
      if (hasAIM && !hasOther) {
        response = await searchSelnvMByFilter(
          searchFilter,
          user.factory,
          user.department,
          user.user_code,
          allow,
          currentACMPageSize,
          currentACMOffset,
        );
        if (response && response.data) {
          setData([{ tableName: "SE_INV_M", data: response.data }]);
          if (currentSelection) {
            const currentKey = `${currentSelection.factory_code}-${currentSelection.cont_no}`;
            const foundRecord = response.data.find(
              (item) => `${item.factory_code}-${item.cont_no}` === currentKey,
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
      const responseData = await fetchAllInvM(
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        language,
        currentACMPageSize,
        currentACMOffset,
      );
      if (responseData && responseData.data) {
        setData([{ tableName: "SE_INV_M", data: responseData.data }]);
        setHasMore(responseData?.hasMore);
        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${currentSelection.ac_no}-${currentSelection.invoice_id}`;
          const updatedRecord = responseData.data.find(
            (item) =>
              `${item.factory_code}-${item.ac_no}-${currentSelection.invoice_id}` ===
              currentKey,
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

  // 🔵 UseEffect #1: Language thay đổi - Fetch lại translations
  // - Chạy khi language (VN/EN/...) thay đổi
  // - Fetch column translations, control translations, và permissions
  // - Update UI labels theo ngôn ngữ mới
  useEffect(() => {
    fetchAllTranslations();
  }, [language]);
  // 🔵 UseEffect #2: Khởi tạo - Fetch tất cả factory
  // - Chạy 1 lần khi component mount
  // - Gọi fetchF() để load dữ liệu
  // - Select row đầu tiên nếu có data
  useEffect(() => {
    const init = async () => {
      if (!user?.factory) {
        return;
      }
      const authData = await fetchAllTranslations();
      await fetchAll(authData);
    };
    init();
  }, [language, user?.factory, selectedContImp]);
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
  // useEffect(() => {
  //   if (
  //     !isSearch &&
  //     selectRows &&
  //     selectRows.length > 0 &&
  //     selectRows[0]?.cont_no
  //   ) {
  //     fetchDataByAcNoForSPI();
  //     fetchVwContUseByContNo();
  //   } else {
  //     setSeInvDData([{ tableName: "SE_INV_D", data: [] }]);
  //     setSelectSID([]);
  //     setSelectVwContUse([]);
  //   }
  // }, [selectRows?.[0]?.cont_no, isSearch]);
  // useEffect(() => {
  //   if (
  //     !isSearch &&
  //     selectSID &&
  //     selectSID.length > 0 &&
  //     selectSID[0]?.cont_no &&
  //     selectSID[0]?.seq
  //   ) {
  //     fetchVwContUseByContNo();
  //   } else {
  //     setVwContUseData([{ tableName: "VW_CONT_USE", data: [] }]);
  //     setSelectVwContUse([]);
  //   }
  // }, [selectSID, isSearch]);

  // ========== END USEEFFECT SECTION ==========

  //========== HANDLER SECTION ================
  const handleBasicDataPageChange = useCallback((page, pageSize) => {
    setCurrentAcInmDPage(page);
    SetCurrentAcInmDPageSize(pageSize);
  }, []);
  const handleOpenAddAcContD = () => {
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
    setOpenAddAcContD(true);
  };
  const handleClosedAddAcContD = () => {
    setOpenAddAcContD(false);
  };
  const handleCopyOpen = () => {
    setOpenCopy(true);
  };
  const handleCopyClose = () => {
    setOpenCopy(false);
  };

  const handleExtendClose = () => {
    setOpenExtend(false);
  };
  const handleExtendConfirmOpen = () => {
    setOpenExtendConfirm(true);
  };

  const handleExtendConfirmClose = () => {
    setOpenExtendConfirm(false);
  };
  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.target);
      const new_cont_no = formData.get("new_cont_no");
      if (new_cont_no === null) {
        return;
      }

      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;

      const response = await copyContract(
        user.factory,
        user.department,
        user.user_code,
        allow,
        selectRows[0].cont_no,
        new_cont_no,
      );
      // Success case - check response.data vì axios trả về { data, status, ... }
      if (response.data.success) {
        showSuccessToast(
          getControlLabel,
          "noti_copy_success",
          response.data.message,
        );
        await refreshCurrentAcItemM();
        setOpenCopy(false);
      } else {
        showErrorToast(
          getControlLabel,
          "noti_copy_fail_1",
          response.data.message,
        );
        setOpenCopy(false);
      }
    } catch (error) {
      // Bắt error khi backend trả về status 400, 500, etc.
      console.error("Error copying contract:", error);
      if (error.message) {
        console.error(error.message);
        showErrorToast(getControlLabel, "noti_copy_fail_2", error.message, {
          error: error.message,
        });
      } else {
        console.error("An error occurred while copying contract");
        showErrorToast(
          getControlLabel,
          "noti_copy_fail_3",
          "An error occurred while copying contract",
        );
      }
      setOpenCopy(false);
    }
  };

  const handleOk = async (e) => {
    e.preventDefault();
    const allow = authorization?.find(
      (item) => item.field === "query_level",
    )?.title;
    const formData = new FormData(e.target);
    const last_expire_date = formData.get("last_expire_date");
    const response = await extendContract(
      user.factory,
      user.department,
      user.user_code,
      allow,
      selectRows[0] || {
        factory_code: "2010",
        goods_code: "G001",
        seq: 1,
        vend_no: "V001",
        d_type: "D1",
        issued_date: "2025-4-1",
        expire_date: last_expire_date,
        cont_no: "CON001",
        cont_category: "2",
      },
      language,
    );
    if (response.success) {
      const confirmResponse = await extendConfirmContract(
        user.factory,
        user.department,
        user.user_code,
        allow,
        selectedContImp?.cont_no,
      );
      if (confirmResponse) {
        showSuccessToast(
          getControlLabel,
          "noti_extend_success",
          confirmResponse.message,
        );
        setOpenExtend(false);
        setOpenExtendConfirm(false);
      }
    }
  };
  const handleOkConfirm = async (e) => {
    e.preventDefault();
    setOpenExtend(true);
  };
  //handler row choose
  const handleSelectChoose = (rows) => {
    setSelectRows(rows);
  };

  //handler open edit popup
  const handleEditClose = async (data) => {
    try {
      if (selectRows.length === 1) {
        const record = data || selectRows[0];

        if (record?.locked_information === user?.clientInfo) {
          const { ...unlockRecord } = record;
          const unlockData = {
            ...unlockRecord,
            locked_information: null,
          };
          const {
            statusText,
            exp_name,
            dest_name,
            sort_name,
            trade_name,
            payment_name,
            status_name,
            ...finalUnlock
          } = unlockData;
          await editSelnvM(
            user?.access_token,
            user?.factory,
            user?.department,
            user?.user_code,
            authorization?.find((item) => item.field === "query_level")?.title,
            currentACMPageSize,
            finalUnlock,
          );
          await refreshCurrentAcItemM();
        }
      }
      setOpenEdit(false);
    } catch (error) {
      console.error("Error closing edit:", error);
      setOpenEdit(false);
    }
  };
  //handler close edit popup
  const handleOpenEdit = async () => {
    try {
      if (selectRows.length !== 1) return;
      const record = selectRows[0];
      await updateInvoiceDate(
        user.access_token,
        user.factory,
        selectRows[0]?.ac_no,
        selectRows[0]?.invoice_id,
        user.user_code,
      );
      await updateHsCode(
        user.access_token,
        user.factory,
        selectRows[0]?.ac_no,
        selectRows[0]?.invoice_id,
        user.user_code,
      );
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
            "You dont have permission to modify this record!",
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
            "noti_fail_child_status",
            "Cannot edit! Present status: {status}",
            { status: statusNames[allowStatus] },
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
      if (
        freshRecord.locked_information &&
        freshRecord.locked_information !== "null" &&
        freshRecord.locked_information !== "undefined" &&
        freshRecord.locked_information !== "" &&
        freshRecord.locked_information !== user?.clientInfo
      ) {
        showWarningToast(
          getControlLabel,
          "noti_fail_lock",
          "Record is edited!\\nLocked by: {user}",
          { user: freshRecord.locked_information },
          { toastId: `locked-${freshRecord.locked_information}` },
        );
        return;
      }
      const { FACTORY, ...clearData } = freshRecord;
      const lockData = {
        ...clearData,
        locked_information: user?.clientInfo,
      };

      await handleEdit(lockData, "", true);
      setOpenEdit(true);
    } catch (error) {
      console.error("Error opening edit:", error);
      showErrorToast(
        getControlLabel,
        "noti_error_open_edit",
        "An error occurred while opening edit form!",
      );
    }
    setOpenEdit(true);
  };
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
      await fetchAcInmDByInmNo;
    }
  };
  const handleExportFSI = async () => {
    try {
      const result = await pdfToFsi(
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        "",
      );
      showSuccessToast(getControlLabel, "noti_success_pdf_fsi", result.message);
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_pdf_fsi", error.message);
    }
  };
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
  const handleOpenSelectCustoms = () => {
    setOpenSelectCustoms(true);
  };
  const handleCloseSelectCustoms = async () => {
    await clearTempTable(user?.access_token);
    setSelectCMCheck([]);
    setOpenSelectCustoms(false);
  };
  const handleOpenInvoicePrint = () => {
    setOpenInvoicePrint(true);
  };
  const handleCloseInvoicePrint = () => {
    setOpenInvoicePrint(false);
  };
  const handleModal = (row) => {
    setSelectRow(row);
    setOpen(true);
  };
  const handleDetaiOpen = (row) => {
    setSelectRow(row);
    setOpenDetail(true);
  };
  const handleDetailClose = (row) => {
    setSelectRow(row);
    setOpenDetail(false);
  };
  const onSetFilter = (filter) => {
    setFilter(filter);
  };
  //handler add import material tracking
  const handleAdd = async (addData) => {
    const payload = {
      ...addData,
      factory_code: user.factory,
      grt_user: user.user_code,
      grt_date: new Date().toISOString(),
      grt_dept: user.department,
      status: 1,
    };
    try {
      const response = await addSelnvM(
        user?.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        currentACMPageSize,
        payload,
      );
      if (response.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_add",
          `Add successfully with id ${addData.cont_no}!`,
        );
        try {
          const allow = Array.isArray(authorization)
            ? authorization.find((item) => item.field === "query_level")?.title
            : null;
          const responseData = await fetchAllInvM(
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
              tableName: "SE_INV_M",
              data: responseData.data || [],
            },
          ]);
          setHasMore(responseData?.hasMore);
          setSelectRows([response.data]);
          setJumpToRow(response.data);
          setCurrentACMPage(response?.page);
          setCurrentACMPageSize(response.size);
          setCurrentACMOffset(response.offset);
          handleAddClose();
          setTotalData((prevTotal) => prevTotal + 1);
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
      showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
    }
  };
  const handleAutoAdd = async (addData) => {
    try {
      const response = await autoAdd(
        user?.access_token,
        user?.factory_code,
        language,
        user?.user_code,
      );
      if (response.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_auto_add",
          `Add successfully with id ${addData.ac_no}!`,
        );
        try {
          const allow = authorization?.find(
            (item) => item.field === "query_level",
          )?.title;
          const responseData = await fetchAllInvM(
            user.factory,
            user.department,
            user.user_code,
            allow || "1",
            language,
            currentACMPageSize,
            currentACMOffset,
          );

          if (responseData && responseData.data) {
            setData([
              {
                tableName: "SE_INV_M",
                data: responseData.data || [],
              },
            ]);
            setHasMore(responseData?.hasMore);
            setSelectRows([responseData.data[0]]);
            setJumpToRow(responseData.data[0]);
          }
        } catch (fetchError) {
          console.error("Error fetching data after add:", fetchError);
          showErrorToast(
            getControlLabel,
            "noti_fail_add_2",
            `Added successfully but failed to refresh data`,
          );
        }
        await handleCloseSelectCustoms();
      } else {
        showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
        handleAddClose();
      }
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
    }
  };
  const handleEdit = async (updateRow, title, skipTimestamp = false) => {
    try {
      const {
        statusText,
        exp_name,
        dest_name,
        sort_name,
        trade_name,
        payment_name,
        status_name,
        ...cleanData
      } = updateRow;
      data.factory_code = user?.factory;
      data.last_user = user?.user_code;
      data.last_date = new Date().toISOString();
      const result = await editSelnvM(
        user?.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        currentACMPageSize,
        cleanData,
      );
      if (result.success) {
        const successMessage =
          typeof title === "string" && title
            ? title
            : `${getControlLabel(
                "noti_success_edit",
                "Edit successfully with id",
              )} ${updateRow.cont_no}!`;

        if (!skipTimestamp) {
          showSuccessToast(
            getControlLabel,
            "noti_success_edit",
            successMessage,
          );
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
            await editSelnvM(
              user?.access_token,
              user?.factory,
              user?.department,
              user?.user_code,
              authorization?.find((item) => item.field === "query_level")
                ?.title,
              currentACMPageSize,
              unlockData,
            );
          }
          await refreshCurrentAcItemM();
        } else {
          const resultPage =
            result.size !== undefined
              ? Math.floor(result.position / result.size)
              : currentACMPage;
          const resultOffset =
            result.offset !== undefined ? result.offset : currentACMOffset;

          if (resultPage !== currentACMPage) {
            // Record chuyển page
            const allow = Array.isArray(authorization)
              ? authorization.find((item) => item.field === "query_level")
                  ?.title
              : null;

            const responseData = await fetchAllInvM(
              user?.factory,
              user?.department,
              user?.user_code,
              allow || "1",
              language,
              currentACMPageSize,
              resultOffset,
            );

            if (responseData && responseData.data) {
              setData([{ tableName: "SE_INV_M", data: responseData.data }]);
              setHasMore(responseData?.hasMore);
              setCurrentACMPageSize(resultPage);
              setCurrentACMOffset(resultOffset);

              const editedRecord = responseData.data.find(
                (item) =>
                  `${item.factory_code}-${item.cont_no}` ===
                  `${cleanData.factory_code}-${cleanData.cont_no}`,
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
              await editSelnvM(
                user?.access_token,
                user?.factory,
                user?.department,
                user?.user_code,
                authorization?.find((item) => item.field === "query_level")
                  ?.title,
                currentACMPageSize,
                unlockData,
              );
            }

            await refreshCurrentAcItemM();
          }
        }

        if (!skipTimestamp) {
          setOpenEdit(false);
        }
      } else {
        console.error(`${response?.data?.message}(${data.invoice_no}`);
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
  const handleSearchByFilter = async (filteredShoe, pageSize, offset) => {
    try {
      const search = filteredShoe.search || {};
      const keys = Object.keys(search);
      if (keys.length === 0) {
        setCurrentACMPage(0);
        setCurrentACMPageSize(5);
        setCurrentACMOffset(0);
        setIsSearch(false);
        setSearchData([]);
        setSelectRows([]);
        setSearchFilter(null);
        await fetchAll();
        return;
      }
      const isNewFilter =
        JSON.stringify(filteredShoe) !== JSON.stringify(searchFilter);
      const actualPageSize = pageSize ?? currentACMPageSize;
      const actualOffset = isNewFilter ? 0 : (offset ?? currentACMOffset);
      setSearchFilter(filteredShoe);
      handleSearchMaster(filteredShoe, actualPageSize, actualOffset);
    } catch (error) {
      console.log("cannot search because", error);
    }
  };
  const handleSearchMaster = async (newFilter, pageSize = 5, offset = 0) => {
    try {
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;

      if (offset === 0) {
        setCurrentACMPage(0);
        setCurrentACMPageSize(pageSize);
        setCurrentACMOffset(0);
        setCurrentSIDPage(0);
        setCurrentSIDOffset(0);
      }

      const response = await searchSelnvMByFilter(
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
        setSearchData([]);
        setData([{ tableName: "SE_INV_M", data: response.data }]);
        setSelectRows([response.data[0]]);
        setJumpToRow(response.data[0]);

        if (offset === 0 && response.data.length > 0) {
          setTotalData(response.total);
        }

        // 1) Fetch tầng SPI (SD_PRICE_ITEM) theo master vừa chọn
        const spiResponse = await fetchAllSPIForInvM(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          response.data[0].ac_no,
          response.data[0].invoice_no,
          language,
          currentSPIPageSize,
          0,
        );

        if (spiResponse && spiResponse.data) {
          setSdPriceItemData([
            { tableName: "SD_PRICE_ITEM_1", data: spiResponse.data },
          ]);
          setTotalSPIData(spiResponse.total || 0);
          setHasSPIMore(spiResponse?.hasMore);

          if (spiResponse.data.length > 0) {
            setSelectSPI([spiResponse.data[0]]);
            setJumpToRowSPI(spiResponse.data[0]);

            // 2) Fetch tầng SE_INV_D theo SPI vừa chọn
            const detailsResponse = await fetchAllSelnvD(
              user?.factory,
              user?.department,
              user?.user_code,
              allow,
              response.data[0].ac_no,
              response.data[0].invoice_id,
              spiResponse.data[0]?.se_id,
              spiResponse.data[0]?.se_ver,
              spiResponse.data[0]?.se_seq,
              language,
              currentSIDPageSize,
              0,
            );

            if (detailsResponse && detailsResponse.data) {
              setSeInvDData([
                { tableName: "SE_INV_D", data: detailsResponse.data },
              ]);
              setTotalSIDData(detailsResponse.total || 0);
              setHasSIDMore(detailsResponse?.hasMore);

              if (detailsResponse.data.length > 0) {
                setSelectSID([detailsResponse.data[0]]);
                setJumpToRowSID(detailsResponse.data[0]);
              } else {
                setSelectSID([]);
                setJumpToRowSID(null);
              }
            }
          } else {
            // Không có SPI -> clear cả SPI lẫn SE_INV_D
            setSelectSPI([]);
            setJumpToRowSPI(null);
            setSeInvDData([{ tableName: "SE_INV_D", data: [] }]);
            setSelectSID([]);
            setJumpToRowSID(null);
            setTotalSIDData(0);
          }
        }
      } else {
        setIsSearch(true);
        setSearchData([]);
        setData([{ tableName: "SE_INV_M", data: [] }]);
        setSelectRows([]);
        setSeInvDData([{ tableName: "SE_INV_D", data: [] }]);
        setSelectSID([]);
        setTotalData(0);
        setTotalSIDData(0);
        setCurrentACMOffset(0);
        setCurrentACMPage(0);
        setCurrentSIDOffset(0);
        setCurrentSIDPage(0);
        setCurrentACMPageSize(pageSize);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchData([]);
      setSelectRows([]);
      setSeInvDData([]);
    }
  };
  const handleStatusChange = async (
    actionName,
    allowedFromStatuses = [],
    fetchAction,
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
        await refreshCurrentAcItemM();
        return;
      }
      await fetchAction();
      showSuccessToast(getControlLabel, `noti_success_${actionName}`);
      await refreshCurrentAcItemM();
    } catch (error) {
      console.error(` Error in ${actionName}:`, error);
      showErrorToast(getControlLabel, `noti_fail_${actionName}`, error.message);
    }
  };
  const handleConfirm = async () => {
    try {
      await handleStatusChange("confirm", [1, 2], async () => {
        await active(
          user?.access_token,
          user?.factory,
          selectRows[0]?.ac_no,
          selectRows[0]?.invoice_id,
          user?.user_code,
        );
      });
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_confirm", error.message);
    }
  };

  const handleUnconfirm = async () => {
    try {
      await handleStatusChange("unconfirm", [1, 7], async () => {
        await cancelActive(
          user?.access_token,
          user?.factory,
          selectRows[0]?.ac_no,
          selectRows[0]?.invoice_id,
          user?.user_code,
        );
      });
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_unconfirm", error.message);
    }
  };

  const handleClose = async () => {
    try {
      await handleStatusChange("close", [1, 7], async () => {
        await closeAll(
          user?.access_token,
          user?.factory,
          selectRows[0]?.ac_no,
          selectRows[0]?.invoice_id,
          user?.user_code,
        );
      });
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_close", error.message);
    }
  };

  const handleCancel = async () => {
    await handleStatusChange("cancel", [1, 2], async () => {
      await voidAll(
        user?.access_token,
        user?.factory,
        selectRows[0]?.ac_no,
        selectRows[0]?.invoice_id,
        user?.user_code,
      );
    });
  };
  const handleCheck = async () => {
    if (selectRows.length === 1) {
      if (user.user_code !== "admin") {
        const allowModify = authorization?.find(
          (item) => item.field === "modify_level",
        )?.title;
        const allowStatus = selectRows[0]?.status;
        if (
          allowModify === "2" &&
          selectRows[0]?.grt_dept !== user.department
        ) {
          return;
        }
        if (allowModify === "3" && selectRows[0]?.grt_user !== user.user_code) {
          return;
        }
        if (allowStatus === 0 || allowStatus === 9 || allowStatus === 7) {
          return;
        }
        const allow = authorization?.find(
          (item) => item.field === "allow_modify",
        )?.title;
        if (user?.user_code !== "admin" && allow === "N") {
          return;
        }
      }
      const updateCancel = { ...selectRows[0], status: 2 };
      await handleEdit(updateCancel, "status");
    }
  };
  // Giữ lại những selectCheck nào còn trong searchResult
  // Uncheck những cái không có trong searchResult
  const handleCheckBoxAll = async (isChecked) => {
    const result = await checkBox(
      user?.access_token,
      user?.factory,
      selectRows[0]?.ac_no,
      isChecked ? "Y" : "N",
      searchChgMFilter?.search || {},
      true,
      language,
    );
    setSelectCMCheck(isChecked ? result?.data?.items : []);
    setSelectChgM(isChecked ? result?.data?.items : [result?.data?.items[0]]);
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
    setSelectChgM(normalizedRows);
    setSelectCMCheck(normalizedRows);
    setJumpToRowChgM(targetRow);
    await handleCheckBox(normalizedRows, targetRow);
  };
  const handleCheckBox = async (rows, targetRow) => {
    const normalizedRows = Array.isArray(rows) ? rows : rows ? [rows] : [];

    if (!targetRow) {
      return { success: false, message: "No target row found" };
    }

    const isTargetRowChecked = normalizedRows.some(
      (r) =>
        `${r.factory_code}-${r.ac_no}` ===
        `${targetRow.factory_code}-${targetRow.ac_no}`,
    );

    const rowKey = `${targetRow.factory_code}-${targetRow.ac_no}`;

    if (!isTargetRowChecked) {
      // ────────────────────────────────────
      // CASE 1: UNCHECK
      // ────────────────────────────────────

      const filteredChecked = selectCMCheck.filter(
        (row) => `${row.factory_code}-${row.ac_no}` !== rowKey,
      );
      setSelectCMCheck(filteredChecked);
      setSelectChgM(selectCMCheck);
      try {
        const result = await checkBox(
          user?.access_token,
          user?.factory,
          targetRow?.ac_no,
          "N",
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
          targetRow?.ac_no,
          "Y",
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
  const handleExport = async () => {
    const excel = await exportExcelUser(user.access_token);
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
    const allow = authorization?.find(
      (item) => item.field === "query_level",
    )?.title;
    await exportExcel(
      user?.access_token,
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
      searchFilter || {},
    );
  };
  const handleUpdateNWGW = async () => {
    try {
      const result = await updateNWGW(
        user?.access_token,
        user?.factory,
        selectRows[0]?.ac_no,
        selectRows[0]?.invoice_id,
        user?.user_code,
      );
      if (result && result?.success) {
        showSuccessToast(getControlLabel, "noti_success_update_nwgw");
        await refreshCurrentAcItemM();
      }
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_update_nwgw_1", error.message);
    }
  };
  //handler send file image
  const handleFile = (e) => {
    const selectedFiled = e.target.files[0];
    if (selectedFiled) {
      setFile(selectedFiled);
    }
  };
  const handlePageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentACMPage(newPage);
    setCurrentACMPageSize(newPageSize);
    setCurrentACMOffset(newOffset);
    const allow = authorization.find(
      (item) => item.field === "query_level",
    )?.title;
    if (isSearch && searchFilter) {
      const search = searchFilter.search || {};
      const hasAIM = "status" in search || "cont_no" in search;
      const hasOther = Object.keys(search).some(
        (k) => k !== "status" && k !== "cont_no",
      );
      if (hasAIM && !hasOther) {
        await handleSearchByFilter(searchFilter, newPageSize, newOffset);
        return;
      }
    }
    //  CASE 2: Không search
    const responseData = await fetchAllInvM(
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
        tableName: "AC_ITEM_M",
        data: responseData.data || [],
      },
    ]);
    setHasMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectRows([responseData.data[0]]);
    }
  };
  const handleSIDPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentSIDPage(newPage);
    setCurrentSIDPageSize(newPageSize);
    setCurrentSIDOffset(newOffset);

    await fetchDataByAcnoForSID(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.cont_no) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
  };
  const handleSPIPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentSPIPage(newPage);
    setCurrentSPIPageSize(newPageSize);
    setCurrentSPIOffset(newOffset);

    await fetchDataByAcNoForSPI(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.cont_no) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
  };

  const handleCMPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentCMPage(newPage);
    setCurrentCMPageSize(newPageSize);
    setCurrentCMOffset(newOffset);
    const allow = authorization.find(
      (item) => item.field === "query_level",
    )?.title;
    if (isSearch && searchFilter) {
      const search = searchFilter.search || {};
      const hasAIM = "status" in search || "cont_no" in search;
      const hasOther = Object.keys(search).some(
        (k) => k !== "status" && k !== "cont_no",
      );
      if (hasAIM && !hasOther) {
        await handleSearchByFilter(searchFilter, newPageSize, newOffset);
        return;
      }
    }
    //  CASE 2: Không search
    const responseData = await fetchChgM(
      user?.access_token,
      user.factory,
      user.department,
      user.user_code,
      allow || "1",
      language,
      newPageSize,
      newOffset,
    );
    setChgMData([
      {
        tableName: "CHG_M",
        data: responseData.data || [],
      },
    ]);
    setHasCMMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectChgM([responseData.data[0]]);
    }
  };
  const handleOpenImportLink = () => {
    setOpenImportLink(true);
  };
  const handleCloseImportLink = () => {
    setOpenImportLink(false);
  };
  const handleImportLink = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/setr_591`, "_blank");
  };

  const handleImportLink1 = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/setr_590_spg`, "_blank");
  };
  const handleImportLink2 = () => {
    window.open(
      `${import.meta.env.VITE_LINK_IMP_URL}/setr_590_fsi_spg`,
      "_blank",
    );
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
  const createFieldCallback = (field) => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchFieldDropdown(
          user?.factory,
          field,
          page,
          pageSize,
          searchText,
        );
        const newData = [...result?.data, { [field]: "" }];
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
  const createBasicCallback = (categoryCode) => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchBasicDataDropDownByCate(
          user?.factory,
          categoryCode,
          user?.department,
          user?.user_code,
          authorization?.find((item) => item.field === "query_level")?.title,
          page,
          pageSize,
          searchText,
        );
        const newData = [...result?.data, { code_no: "", code_name: "null" }];
        return {
          data: newData?.data || [],
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
    ac_chgno: createFieldCallback("ac_chgno"),
    ac_no: createFieldCallback("ac_no"),
    cont_no: createFieldCallback("cont_no"),
    chg_type: createBasicCallback("5002"),
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
                tableName={"SE_INV_M"}
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
                  handleDetaiOpen(row);
                }}
                onExport={handleExport}
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
                isPopup={true}
                onCopy={handleCopyOpen}
                onExtend={handleExtendConfirmOpen}
                totalData={totalData || 0}
                onPageChange={handlePageChange}
                currentPage={currentACMPage}
                currentPageSize={currentACMPageSize}
                hasMore={hasMore}
                isSearch={isSearch}
                onSelectCustoms={handleOpenSelectCustoms}
                onUpdateNWGW={handleUpdateNWGW}
                onInvoicePrint={handleOpenInvoicePrint}
                onImportLink={handleOpenImportLink}
              />
              <SdPriceItem
                subAuthentication={authorization}
                factory_code={selectRows[0]?.factory_code}
                parentSelectRows={selectRows.length > 0 ? selectRows : []}
                searchData={searchData}
                handleSearchByCode={handleSearch}
                fetchDetailRecordFromDB={fetchDetailRecordFromDB}
                data={sdPriceItemData}
                setData={setSdPriceItemData}
                selectRows={selectRows.length > 0 ? selectRows : []}
                setSelectSID={setSelectSPI}
                selectSID={selectSPI}
                jumpToRow={jumpToRowSPI}
                setJumpToRow={setJumpToRowSPI}
                user={user}
                currentSIDPage={currentSPIPage}
                setCurrentSIDPage={setCurrentSPIPage}
                currentSIDPageSize={currentSPIPageSize}
                setCurrentSIDPageSize={setCurrentSPIPageSize}
                setCurrentSIDOffset={setCurrentSPIOffset}
                searchBasicDataFilter={searchBasicDataFilter}
                fetchDataByContNo={fetchDataByAcNoForSPI}
                openAddAcContD={openAddAcContD}
                setOpenAddAcContD={setOpenAddAcContD}
                handleOpenAddAcContD={handleOpenAddAcContD}
                handleClosedAddAcContD={handleClosedAddAcContD}
                onSIDPageChange={handleSPIPageChange}
                totalSIDData={totalSPIData}
                setTotalSIDData={setTotalSPIData}
                currentSIDOffset={currentSPIOffset}
                hasMore={hasSPIMore}
                setHasMore={setHasSPIMore}
              />
              <SeInvD
                subAuthentication={authorization}
                factory_code={selectRows[0]?.factory_code}
                parentSelectRows={selectRows.length > 0 ? selectRows : []}
                searchData={searchData}
                handleSearchByCode={handleSearch}
                fetchBasicDataRecordFromDB={fetchDetailRecordFromDB}
                data={seInvDData}
                setData={setSeInvDData}
                selectRows={selectSPI.length > 0 ? selectSPI : []}
                setSelectVwContUse={setSelectSID}
                selectVwContUse={selectSID}
                jumpToRow={jumpToRowSID}
                setJumpToRow={setJumpToRowSID}
                user={user}
                handleVCUPageChange={handleSIDPageChange}
                currentVCUPage={currentSIDPage}
                setCurrentVCUPage={setCurrentSIDPage}
                currentVCUPageSize={currentSIDPageSize}
                setCurrentVCUPageSize={setCurrentSIDPageSize}
                currentVCUOffset={currentSIDOffset}
                setCurrentVCUOffset={setCurrentSIDOffset}
                totalVCUData={totalSIDData}
                searchBasicDataFilter={searchBasicDataFilter}
                fetchDataByACD={fetchDataByAcnoForSID}
                hasMore={hasSIDMore}
                setHasMore={setHasSIDMore}
              />
            </Paper>
          </Stack>
        </Container>
      </Box>

      {/* ========== MODAL/DIALOG COMPONENTS ========== */}

      {/*  Add Factory Modal */}
      {/* - Mở khi user click "Add" button */}
      {/* - Gọi handleAdd khi submit form */}
      <AddSeInvM
        open={openAdd}
        onClose={handleAddClose}
        handleAdd={handleAdd}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={authorization}
        selectRows={selectRows.length > 0 ? selectRows : []}
      />
      {/*  Edit Factory Modal */}
      {/* - Mở khi user click "edit" button */}
      {/* - Gọi handleEdit khi submit form */}
      <EditSeInvM
        open={openEdit}
        onClose={handleEditClose}
        rowData={selectRows.length > 0 ? selectRows[0] : null}
        handleEdit={handleEdit}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={authorization}
        selectRows={selectRows.length > 0 ? selectRows : []}
        language={language}
      />
      <CopyPopup
        openLink={openCopy}
        onClose={handleCopyClose}
        getControlLabel={getControlLabel}
        onSave={handleSave}
        selectVwContImp={
          selectRows.length > 0
            ? selectRows[0]
            : {
                factory_code: "2010",
                cont_no: "CON001",
                goods_code: "G001",
                seq: 1,
              }
        }
      />
      <ExtendConfirmPopup
        openLink={openExtendConfirm}
        onClose={handleExtendConfirmClose}
        getControlLabel={getControlLabel}
        selectVwContImp={selectRows.length > 0 ? selectRows[0] : null}
        onSave={handleOkConfirm}
      />
      <ExtendPopup
        openLink={openExtend}
        onClose={handleExtendClose}
        getControlLabel={getControlLabel}
        selectVwContImp={selectRows.length > 0 ? selectRows[0] : null}
        onSave={handleOk}
      />
      <DetailAcContM
        open={openDetail}
        onClose={handleDetailClose}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        acContM={selectRows.length > 0 ? selectRows[0] : null}
        user={user}
      />
      <CustomDeclarationPopup
        openLink={openSelectCustoms}
        onClose={handleCloseSelectCustoms}
        data={chgMData}
        setData={setChgMData}
        jumpToRow={jumpToRowChgM}
        setJumpToRow={setJumpToRowChgM}
        selectRows={selectRows.length > 0 ? selectRows : []}
        selectSOMC={selectChgM}
        setSelectSOMC={setSelectChgM}
        subAuthentication={authorization}
        currentPage={currentCMPage}
        currentPageSize={currentCMPageSize}
        setCurrentOffset={setCurrentCMOffset}
        totalData={totalCMData}
        setTotalData={setTotalCMData}
        hasMore={hasCMMore}
        setHasMore={setHasCMMore}
        isSearch={isChgMSearch}
        setIsSearch={setIsChgMSearch}
        searchFilter={searchChgMFilter}
        setSearchFilter={setSearchChgMFilter}
        setCurrentPage={setCurrentCMPage}
        setCurrentPageSize={setCurrentCMPageSize}
        onPageChange={handleCMPageChange}
        user={user}
        selectCheck={selectCMCheck}
        handleCheckboxChange={handleCheckBoxChange}
        onAutoAdd={handleAutoAdd}
        getFetchData={getFetchData}
        dropdownValues={dropdownValues}
        setDropdownValues={setDropdownValues}
        onCheckBoxAll={handleCheckBoxAll}
      />
      <InvoicePrintPopup
        openLink={openInvoicePrint}
        onClose={handleCloseInvoicePrint}
        // onCustomDeclaration={handleExportPS}
        onItemDetails={handleExportFSI}
        getControlLabel={getControlLabel}
      />
      <ImportLinkPopup
        openLink={openImportLink}
        onClose={handleCloseImportLink}
        onImportLink={handleImportLink}
        onImportLink1={handleImportLink1}
        onImportLink2={handleImportLink2}
        getControlLabel={getControlLabel}
      />
    </>
  );
};
export default Setf590;
