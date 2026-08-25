import { lazy, useCallback, useEffect, useState } from "react";
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
  fetchViewContImpSetting,
  searchVwAcContImpByFilter,
  updateLastExpDate,
} from "../../service/vw_cont_imp/VwContImpService";
import CopyPopup from "../../features/actf_1101/page/CopyPopup";
import ExtendPopup from "../../features/actf_1101/page/ExtendPopup";
import ExtendConfirmPopup from "../../features/actf_1101/page/ExtendConfirmPopup";
import AcContD from "../../features/actf_110/component/AcContD";
import VwContUse from "../../features/actf_110/component/VwContUse";
import AddAcContM from "../../features/actf_110/page/AddAcContM";
import EditAcContM from "../../features/actf_110/page/EditAcContM";
import {
  addAcContM,
  confirmAll,
  editAcContM,
  fetchAllAcContMByID,
} from "../../service/ac_cont_m/AcContMService";
import { fetchAllVwContUse } from "../../service/vw_cont_use/VwContUseService";
import DetailAcContM from "../../features/actf_110/page/DetailAcContM";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../utils/notification/Notification";
import { searchBasicDataByFilter } from "../../service/basic_data/basicDataService";
import {
  fetchAcContDByID,
  fetchAllAcContDWithView,
} from "../../service/ac_cont_d/acContDService";
const Actf110 = () => {
  const [data, setData] = useState([]);
  const [acContDData, setAcContDData] = useState([]);
  const [vwContUseDData, setVwContUseData] = useState([]);
  const [open, setOpen] = useState(false);
  const [openAddAcContD, setOpenAddAcContD] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openCopy, setOpenCopy] = useState(false);
  const [openExtend, setOpenExtend] = useState(false);
  const [openExtendConfirm, setOpenExtendConfirm] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectRow, setSelectRow] = useState(null);
  const [selectRows, setSelectRows] = useState([]);
  const [selectAcContD, setSelectAcContD] = useState([]);
  const [selectVwContUse, setSelectVwContUse] = useState([]);
  const [searchFilter, setSearchFilter] = useState({});
  const [isSearch, setIsSearch] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [authorization, setAuthorizations] = useState([]);
  const [filter, setFilter] = useState("");
  const [file, setFile] = useState(null);
  const [jumpToRow, setJumpToRow] = useState(null);
  const [jumpToRowAcContD, setJumpToRowAcContD] = useState(null);
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
  const [totalACDData, setTotalACDData] = useState(0);
  const [totalVCUData, setTotalVCUData] = useState(0);
  const [currentACMOffset, setCurrentACMOffset] = useState(0);
  const [currentACMPage, setCurrentACMPage] = useState(0);
  const [currentACMPageSize, setCurrentACMPageSize] = useState(5);
  const [currentACDOffset, setCurrentACDOffset] = useState(0);
  const [currentACDPage, setCurrentACDPage] = useState(0);
  const [currentACDPageSize, setCurrentACDPageSize] = useState(10);
  const [currentVCUOffset, setCurrentVCUOffset] = useState(0);
  const [currentVCUPage, setCurrentVCUPage] = useState(0);
  const [currentVCUPageSize, setCurrentVCUPageSize] = useState(10);
  const [searchBasicDataFilter, setSearchBasicDataFilter] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [hasACDMore, setHasACDMore] = useState(false);
  const [hasVCUMore, setHasVCUMore] = useState(false);
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
        fetchViewContImpSetting(
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
          tableName: "VW_CONT_IMP",
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
      const controls = await fetchTableControlTranslations("ACTF_110");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const columns = await fetchTableColumnTranslations(
        "ACTF_110",
        "master",
        "ac_cont_m",
      );
      const auth = await fetchTablePermission(
        user.factory,
        user.department,
        user.user_code,
        "ACTF_110",
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
  const fetchDataByContNo = async (
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
        : currentACDOffset;
    const pageSize =
      explicitPageSize !== null ? explicitPageSize : currentACDPageSize;
    const response = await fetchAllAcContDWithView(
      user?.access_token,
      selectRows[0]?.cont_no,
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
      setAcContDData([{ tableName: "AC_CONT_D", data: childrenData }]);
      // if (response.total !== undefined && response.total !== null) {
      //   setTotalACDData(response.total);
      // }
      setHasACDMore(response?.hasMore);
      if (childrenData.length > 0) {
        setSelectAcContD([childrenData[0]]);
      } else {
        setSelectAcContD([]);
      }
      return response;
    }
  };
  const fetchDataByACD = async (
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
        : currentVCUOffset;
    const pageSize =
      explicitPageSize !== null ? explicitPageSize : currentVCUPageSize;
    const response = await fetchAllVwContUse(
      user?.access_token,
      user.factory,
      selectAcContD[0],
      language,
      pageSize,
      offset,
    );
    if (response && response.data) {
      let childrenData = response.data;
      setVwContUseData([{ tableName: "VW_CONT_USE", data: childrenData }]);
      // if (response.total !== undefined && response.total !== null) {
      //   setTotalVCUData(response.total);
      // }
      setHasVCUMore(response?.hasMore);
      if (childrenData.length > 0) {
        setSelectVwContUse([childrenData[0]]);
      } else {
        setSelectVwContUse([]);
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
      selectAcContD[0],
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
      const response = await fetchAllAcContMByID(
        user?.access_token,
        selectRows[0]?.factory_code,
        selectRows[0]?.cont_no,
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
      const response = await fetchAcContDByID(
        user?.access_token,
        user?.factory,
        selectAcContD[0]?.cont_no,
        selectAcContD[0]?.seq,
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
  const refreshCurrentAcItemM = async (
    overridePageSize = 5,
    overrideOffset = 0,
  ) => {
    let allData = [];
    const pageSize = overridePageSize ?? currentACMPageSize;
    const offset = overrideOffset ?? currentACMOffset;
    const currentSelection = selectRows.length > 0 ? selectRows[0] : null;
    if (isSearch && searchFilter) {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;
      let response;
      response = await searchVwAcContImpByFilter(
        searchFilter,
        user.factory,
        user.department,
        user.user_code,
        allow,
        pageSize,
        offset,
      );
      if (response && response.data) {
        setData([{ tableName: "VW_CONT_IMP", data: response.data }]);
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
    } else {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;
      const responseData = await fetchViewContImpSetting(
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        language,
        pageSize,
        offset,
      );
      if (responseData && responseData.data) {
        setData([{ tableName: "VW_CONT_IMP", data: responseData.data }]);
        setHasMore(responseData?.hasMore);
        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${currentSelection.cont_no}`;
          const updatedRecord = responseData.data.find(
            (item) => `${item.factory_code}-${item.cont_no}` === currentKey,
          );
          allData = responseData.data;
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
    return allData;
  };
  //========== END FETCH DATA SECTION ================

  // ========== USEEFFECT SECTION ==========
  useEffect(() => {
    const storedData = localStorage.getItem("selectVwContImp");
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setSelectedContImp(parsed);
      } catch (error) {
        console.error("Error parsing localStorage:", error);
      }
    } 
  }, []);
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
      if (!user?.factory) {
        return;
      }
      const authData = await fetchAllTranslations();
      await fetchAll(authData);
    };
    init();
  }, [language, user?.factory, selectedContImp]);
  //  UseEffect #3: Jump to Row animation
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
  useEffect(() => {
    if (
      !isSearch &&
      selectRows &&
      selectRows.length > 0 &&
      selectRows[0]?.cont_no
    ) {
      fetchDataByContNo();
      fetchVwContUseByContNo();
    }
  }, [selectRows?.[0]?.cont_no, isSearch]);
  useEffect(() => {
    if (
      !isSearch &&
      selectAcContD &&
      selectAcContD.length > 0 &&
      selectAcContD[0]?.cont_no &&
      selectAcContD[0]?.seq
    ) {
      fetchVwContUseByContNo();
    }
  }, [selectAcContD, isSearch]);
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
    if (selectRows.length === 0) {
      return;
    }
    // if (
    //   selectRows[0]?.status === 0 ||
    //   selectRows[0]?.status === 7 ||
    //   selectRows[0]?.status === 9
    // ) {
    //   const statusNames = {
    //     0: "Cancelled",
    //     7: "Confirmed",
    //     9: "Closed",
    //   };
    //   showErrorToast(
    //     getControlLabel,
    //     "noti_edit_fail_4",
    //     ` Cannot copy!Present status: ${statusNames[selectRows[0].status]}`,
    //     {
    //       status: statusNames[selectRows[0]?.status] || "Unknown",
    //     },
    //   );
    //   return;
    // }
    setOpenCopy(true);
  };
  const handleCopyClose = () => {
    setOpenCopy(false);
  };

  const handleExtendClose = () => {
    setOpenExtend(false);
  };
  const handleExtendConfirmOpen = () => {
    if (selectRows.length === 0) {
      return;
    }
    if (
      selectRows[0]?.status === 0 ||
      selectRows[0]?.status === 7 ||
      selectRows[0]?.status === 9
    ) {
      const statusNames = {
        0: "Cancelled",
        7: "Confirmed",
        9: "Closed",
      };
      showErrorToast(
        getControlLabel,
        "noti_edit_fail_3",
        ` Cannot update the late expire date!Present status: ${statusNames[selectRows[0].status]}`,
        {
          status: statusNames[selectRows[0]?.status] || "Unknown",
        },
      );
      return;
    }
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
      if (new_cont_no === null) return;

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
        currentACMPageSize,
      );

      if (response.data.success) {
        showSuccessToast(
          getControlLabel,
          "noti_copy_success",
          response.data.message,
        );

        if (isSearch && searchFilter) {
          await handleSearchMaster(
            searchFilter,
            currentACMPageSize,
            currentACMOffset,
          );
        } else {
          const allData = await fetchViewContImpSetting(
            user?.factory,
            user?.department,
            user?.user_code,
            allow,
            language,
            response.data?.size,
            response.data?.offset,
          );

          setData([{ tableName: "VW_CONT_IMP", data: allData.data }]);
          setHasMore(allData?.hasMore);
          setCurrentACMPageSize(response?.data?.size);
          setCurrentACMOffset(response?.data?.offset);
          setCurrentACMPage(response?.data?.page);

          const foundData = allData?.data.find(
            (item) => item.cont_no === new_cont_no,
          );
          if (foundData) {
            setSelectRows([foundData]);
            setJumpToRow(foundData);
          }
        }

        setOpenCopy(false); //  đóng popup ở cả 2 nhánh
      } else {
        showErrorToast(
          getControlLabel,
          "noti_copy_fail_1",
          response.data.message,
        );
        setOpenCopy(false);
      }
    } catch (error) {
      console.error("Error copying contract:", error);
      if (error.message) {
        showErrorToast(getControlLabel, "noti_copy_fail_2", error.message, {
          error: error.message,
        });
      } else {
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
    const cont_no = selectRows[0]?.cont_no;

    try {
      const response = await updateLastExpDate(
        user.factory,
        user.department,
        user.user_code,
        allow,
        cont_no,
        last_expire_date,
      );

      if (response && response.success) {
        showSuccessToast(
          getControlLabel,
          "noti_copy_success",
          response.message,
        );

        if (isSearch && searchFilter) {
          await handleSearchMaster(
            searchFilter,
            currentACMPageSize,
            currentACMOffset,
          );
        } else {
          const allData = await fetchViewContImpSetting(
            //  đúng tên hàm
            user?.factory,
            user?.department,
            user?.user_code,
            allow,
            language,
            currentACMPageSize,
            currentACMOffset,
          );
          setData([{ tableName: "VW_CONT_IMP", data: allData.data }]); //  đúng tableName

          const findData = allData.data.find(
            (item) => item.cont_no === cont_no,
          ); //  đúng biến
          if (findData) {
            setSelectRows([findData]);
            setJumpToRow(findData);
          }
        }

        setOpenExtend(false); //  đóng popup ở cả 2 nhánh
        setOpenExtendConfirm(false);
      }
    } catch (error) {
      showErrorToast(getControlLabel, "noti_extend_fail", error.message);
      setOpenExtend(false);
      setOpenExtendConfirm(false);
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
            term_paynm,
            currencynm,
            pay_termnm,
            last_usernm,
            grt_deptnm,
            grt_usernm,
            currency_name,
            cont_category_name,
            buyer_name,
            ...finalUnlock
          } = unlockData;
          await editAcContM(
            user?.access_token,
            user?.factory,
            user?.department,
            user?.user_code,
            authorization?.find((item) => item.field === "query_level")?.title,
            currentACMPageSize,
            finalUnlock,
          );
          await refreshCurrentAcItemM(currentACMPageSize, currentACMOffset);
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
      const response = await addAcContM(
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
          const responseData = await fetchViewContImpSetting(
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
              tableName: "VW_CONT_IMP",
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
      console.log("error", error);

      showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
    }
  };

  const handleEdit = async (updateRow, title, skipTimestamp = false) => {
    try {
      const {
        statusText,
        term_paynm,
        currencynm,
        pay_termnm,
        last_usernm,
        grt_deptnm,
        grt_usernm,
        currency_name,
        cont_category_name,
        buyer_name,
        ...cleanData
      } = updateRow;
      cleanData.factory_code = user?.factory;
      cleanData.last_user = user?.user_code;
      cleanData.last_date = new Date().toISOString();
      const result = await editAcContM(
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
            await editAcContM(
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
          await refreshCurrentAcItemM(currentACMPageSize, currentACMOffset);
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

            const responseData = await fetchViewContImpSetting(
              user?.factory,
              user?.department,
              user?.user_code,
              allow || "1",
              language,
              currentACMPageSize,
              resultOffset,
            );

            if (responseData && responseData.data) {
              setData([{ tableName: "VW_CONT_IMP", data: responseData.data }]);
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
              await editAcContM(
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

            await refreshCurrentAcItemM(currentACMPageSize, currentACMOffset);
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
        setCurrentACDPage(0);
        setCurrentACDOffset(0);
      }

      const response = await searchVwAcContImpByFilter(
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
        setSearchData([]);
        setData([{ tableName: "VW_CONT_IMP", data: response.data }]);
        setSelectRows([response.data[0]]);
        // setJumpToRow(response.data[0]);

        if (offset === 0 && response.data.length > 0) {
          setTotalData(response.total);
        }
        const detailsResponse = await fetchAllAcContDWithView(
          user?.access_token,
          response.data[0]?.cont_no,
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          language,
          currentACDPageSize,
          0,
        );
        if (detailsResponse && detailsResponse.data) {
          setAcContDData([
            { tableName: "AC_CONT_D", data: detailsResponse.data },
          ]);
          setTotalACDData(detailsResponse.total || 0);

          if (detailsResponse.data.length > 0) {
            setSelectAcContD([detailsResponse.data[0]]);
            setJumpToRowAcContD(detailsResponse.data[0]);
            // fetch VW_CHG_EXMP cho detail đầu tiên
            const vwResponse = await fetchAllVwContUse(
              user?.access_token,
              user.factory,
              detailsResponse.data[0],
              language,
              currentVCUPageSize,
              0,
            );
            if (vwResponse?.data) {
              setVwContUseData([
                { tableName: "VW_CHG_EXMP", data: vwResponse.data },
              ]);
            }
          } else {
            setSelectAcContD([]);
            setJumpToRowAcContD(null);
          }
        }
      } else {
        setIsSearch(true);
        setSearchData([]);
        setData([{ tableName: "VW_CONT_IMP", data: [] }]);
        setSelectRows([]);
        setAcContDData([{ tableName: "AC_CONT_D", data: [] }]);
        setSelectAcContD([]);
        setTotalData(0);
        setTotalACDData(0);
        setCurrentACMOffset(0);
        setCurrentACMPage(0);
        setCurrentACDOffset(0);
        setCurrentACDPage(0);
        setCurrentACMPageSize(pageSize);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchData([]);
      setSelectRows([]);
      setAcContDData([]);
    }
  };
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
            "warning",
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
        freshRecord.locked_information !== user?.clientInfo
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
        await refreshCurrentAcItemM(currentACMPageSize, currentACMOffset);
        setJumpToRow(freshRecord);
        return;
      }
      if (fetchAction) {
        await fetchAction(freshRecord);
        return;
      }
      const {
        statusText,
        term_paynm,
        currencynm,
        pay_termnm,
        last_usernm,
        grt_deptnm,
        grt_usernm,
        currency_name,
        FACTORY,
        ...clearData
      } = freshRecord;
      const updateData = {
        ...clearData,
        status: newStatus,
        last_user: user.user_code,
        last_date: new Date().toISOString(),
      };
      const response = await editAcContM(
        user?.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        currentACMPageSize,
        updateData,
      );

      if (response.success) {
        showSuccessToast(getControlLabel, `noti_success_${actionName}`);

        await refreshCurrentAcItemM(currentACMPageSize, currentACMOffset);
        // setSelectRows([updateData]);
        // setJumpToRow(updateData);
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
  //handler cancel
  const handleCancel = () => {
    handleStatusChange(0, "cancel", [1, 2]);
  };
  //handler confirm
  const handleConfirm = async () => {
    await handleStatusChange(7, "confirm", [1], async (freshRecord) => {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;
      try {
        const extendResponse = await extendContract(
          user.factory,
          user.department,
          user.user_code,
          allow,
          freshRecord,
          language,
        );

        if (!extendResponse?.duplicateFound) {
          await extendConfirmContract(
            user.factory,
            user.department,
            user.user_code,
            allow,
            freshRecord?.cont_no,
          );
          await confirmAll(
            user?.access_token,
            user.factory,
            user.user_code,
            user.department,
            allow,
            freshRecord?.cont_no,
          );
          showSuccessToast(getControlLabel, "noti_success_confirm");
          await refreshCurrentAcItemM(currentACMPageSize, currentACMOffset);
          await fetchDataByContNo(false, null, null);
        }
      } catch (error) {
        // X=0 → bị block bởi AC-21
        showErrorToast(getControlLabel, "noti_confirm_blocked", error.message);
      }
    });
  };
  const handleUnconfirm = () => {
    handleStatusChange(1, "unconfirm", [7]);
  };
  //handler cancel
  const handleClose = () => {
    handleStatusChange(9, "close", [1, 7]);
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
    await exportExcelVwContImp(
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
      language,
      searchFilter || {},
    );
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
      await handleSearchByFilter(searchFilter, newPageSize, newOffset);
      return;
    }
    //  CASE 2: Không search
    await refreshCurrentAcItemM(newPageSize, newOffset);
  };
  const handleACDPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentACDPage(newPage);
    setCurrentACDPageSize(newPageSize);
    setCurrentACDOffset(newOffset);

    await fetchDataByContNo(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.cont_no) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
  };
  const handleVCUPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentVCUPage(newPage);
    setCurrentVCUPageSize(newPageSize);
    setCurrentVCUOffset(newOffset);

    await fetchDataByACD(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.cont_no) {
      console.warn(" No master selected, skipping detail fetch");
      return;
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
                tableName={"VW_CONT_IMP"}
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
              />
              <AcContD
                subAuthentication={authorization}
                factory_code={selectRows[0]?.factory_code}
                parentSelectRows={selectRows.length > 0 ? selectRows : []}
                isSearch={isSearch}
                searchData={searchData}
                handleSearchByCode={handleSearch}
                fetchDetailRecordFromDB={fetchDetailRecordFromDB}
                data={acContDData}
                setData={setAcContDData}
                selectRows={selectRows.length > 0 ? selectRows : []}
                setSelectAcContD={setSelectAcContD}
                selectAcContD={selectAcContD}
                jumpToRow={jumpToRowAcContD}
                setJumpToRow={setJumpToRowAcContD}
                user={user}
                currentACDPage={currentACDPage}
                setCurrentACDPage={setCurrentACDPage}
                currentACDPageSize={currentACDPageSize}
                setCurrentACDPageSize={setCurrentACDPageSize}
                setCurrentACDOffset={setCurrentACDOffset}
                searchBasicDataFilter={searchBasicDataFilter}
                fetchDataByContNo={fetchDataByContNo}
                openAddAcContD={openAddAcContD}
                setOpenAddAcContD={setOpenAddAcContD}
                handleOpenAddAcContD={handleOpenAddAcContD}
                handleClosedAddAcContD={handleClosedAddAcContD}
                onACDPageChange={handleACDPageChange}
                totalACDData={totalACDData}
                setTotalACDData={setTotalACDData}
                currentACDOffset={currentACDOffset}
                hasMore={hasACDMore}
                setHasMore={setHasACDMore}
              />
              <VwContUse
                subAuthentication={authorization}
                factory_code={selectRows[0]?.factory_code}
                parentSelectRows={selectRows.length > 0 ? selectRows : []}
                isSearch={isSearch}
                searchData={searchData}
                handleSearchByCode={handleSearch}
                fetchBasicDataRecordFromDB={fetchDetailRecordFromDB}
                data={vwContUseDData}
                setData={setVwContUseData}
                selectRows={selectAcContD.length > 0 ? selectAcContD : []}
                setSelectVwContUse={setSelectVwContUse}
                selectVwContUse={selectVwContUse}
                jumpToRow={jumpToRowAcContD}
                setJumpToRow={setJumpToRowAcContD}
                user={user}
                handleVCUPageChange={handleVCUPageChange}
                currentVCUPage={currentVCUPage}
                setCurrentVCUPage={setCurrentVCUPage}
                currentVCUPageSize={currentVCUPageSize}
                setCurrentVCUPageSize={setCurrentVCUPageSize}
                currentVCUOffset={currentVCUOffset}
                setCurrentVCUOffset={setCurrentVCUOffset}
                totalVCUData={totalVCUData}
                searchBasicDataFilter={searchBasicDataFilter}
                fetchDataByACD={fetchDataByACD}
                hasMore={hasVCUMore}
                setHasMore={setHasVCUMore}
              />
            </Paper>
          </Stack>
        </Container>
      </Box>

      {/* ========== MODAL/DIALOG COMPONENTS ========== */}

      {/*  Add Factory Modal */}
      {/* - Mở khi user click "Add" button */}
      {/* - Gọi handleAdd khi submit form */}
      <AddAcContM
        open={openAdd}
        onClose={handleAddClose}
        handleAdd={handleAdd}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={authorization}
        selectRows={selectRows.length > 0 ? selectRows : []}
        language={language}
      />
      {/*  Edit Factory Modal */}
      {/* - Mở khi user click "edit" button */}
      {/* - Gọi handleEdit khi submit form */}
      <EditAcContM
        open={openEdit}
        onClose={handleEditClose}
        acShoeM={selectRows.length > 0 ? selectRows[0] : null}
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
    </>
  );
};
export default Actf110;
