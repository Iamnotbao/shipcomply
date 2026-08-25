import { useEffect, useState } from "react";
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
import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import { fetchTablePermission } from "../../service/users_permission/UsersPermission";
import {
  editAcShoeM,
  exportExcelASM,
} from "../../service/ac_shoe_m/AcShoeMService";
import {
  fetchAllAcProdMByID,
  fetchAllAcProdMByShoe,
  fetchAllConfirmedAcProdM,
  searchAPMByFilter,
} from "../../service/ac_prod_m/AcProdMService";
import {
  fetchRSDBySize,
  searchRSDByFilter,
} from "../../service/rd_size_d/RdSizeDService";
import {
  fetchAllAcShoeRefByID,
  fetchAllAcShoeRefByShoe,
  fetchAllConfirmedAcShoeRef,
} from "../../service/ac_shoe_ref/AcShoeRefService";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../utils/notification/Notification";

import { searchVwChgMByFilter } from "../../service/vw_chg_m/vwChgM";
import { close, exportExcelVwChgM } from "../../service/ac_chg_m/acChgM";
import {
  active,
  voidAll,
  addAcIssueMT,
  editAcIssueMT,
  fetchAcIssueMTByID,
  fetchAllAcIssueMT,
  searchAcIssueMTByFilter,
  calculate,
  exportExcelDetail,
  exportExcelSummary,
} from "../../service/ac_issue_m_t/acIssueMT";
import AddAcIssueMT from "../../features/actf_240/page/AddAcIssueMT";
import EditAcIssueMT from "../../features/actf_240/page/EditAcIssueMT";
import VwAcIssueT from "../../features/actf_240/component/vwAcIssueT";
import { fetchAllVwAcIssueT } from "../../service/vw_ac_issue_t/vwAcIssueT";
import AcIssueMatdT from "../../features/actf_240/component/AcIssueMatDT";
import {
  fetchAcIssueMatdTByID,
  fetchAllAcIssueMatdT,
} from "../../service/ac_issue_matd_t/acIssueMatdT";
import AcChkT from "../../features/actf_240/component/AcChkT";
import { fetchACTByID, fetchAllAcChkT } from "../../service/ac_chk_t/acChkT";
const Actf240 = () => {
  const [data, setData] = useState([]);
  const [acIssueMatdTData, setAcIssueMatdTData] = useState([]);
  const [selectAcIssueMatdT, setSelectAcIssueMatdT] = useState([]);
  const [jumpToRowAcProdM, setJumpToRowAcProdM] = useState(null);
  const [jumpToRowVAIT, setJumpToRowVAIT] = useState(null);
  const [jumpToRowAIMT, setJumpToRowAIMT] = useState(null);
  const [jumpToRowACT, setJumpToRowACT] = useState(null);
  const [vwAcIssueTData, setVwAcIssueTData] = useState([]);
  const [acChkTData, setAcChkTData] = useState([]);
  const [selectVAIT, setSelectVAIT] = useState([]);
  const [selectAcChkT, setSelectAcChkT] = useState([]);
  const [jumpToRowAcShoeRef, setJumpToRowAcShoeRef] = useState(null);
  const [rdSizeDData, setRdSizeDData] = useState([]);
  const [selectRdSizeD, setSelectRdSizeD] = useState([]);
  const [openSizeLink, setOpenSizeLink] = useState(false);
  const [isLoadingBom, setIsLoadingBom] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [searchFilter, setSearchFilter] = useState({});
  const [isAPMSearch, setIsAPMSearch] = useState(false);
  const [searchAPMData, setSearchAPMData] = useState([]);
  const [searchAPMFilter, setSearchAPMFilter] = useState(null);
  const [isASRSearch, setIsASRSearch] = useState(false);
  const [searchASRData, setSearchASRData] = useState([]);
  const [searchASRFilter, setSearchASRFilter] = useState(null);
  const [isRSDSearch, setIsRSDSearch] = useState(false);
  const [searchRSDData, setSearchRSDData] = useState([]);
  const [searchRSDFilter, setSearchRSDFilter] = useState(null);
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectRow, setSelectRow] = useState(null);
  const [selectRows, setSelectRows] = useState([]);
  const [authorization, setAuthorizations] = useState([]);
  const [filter, setFilter] = useState("");
  const [file, setFile] = useState(null);
  const [jumpToRow, setJumpToRow] = useState(null);
  const [totalData, setTotalData] = useState(0);
  const [totalAIMTData, setTotalAIMTData] = useState(0);
  const [totalVAITData, setTotalVAITData] = useState(0);
  const [totalACTData, setTotalACTData] = useState(0);
  const [totalRSDData, setTotalRSDData] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(5);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [currentAIMTPage, setCurrentAIMTPage] = useState(0);
  const [currentAIMTPageSize, setCurrentAIMTPageSize] = useState(10);
  const [currentAIMTOffset, setCurrentAIMTOffset] = useState(0);
  const [currentVAITPage, setCurrentVAITPage] = useState(0);
  const [currentVAITPageSize, setCurrentVAITPageSize] = useState(10);
  const [currentVAITOffset, setCurrentVAITOffset] = useState(0);
  const [currentASROffset, setCurrentASROffset] = useState(0);
  const [currentACTPage, setCurrentACTPage] = useState(0);
  const [currentACTPageSize, setCurrentACTPageSize] = useState(5);
  const [currentACTOffset, setCurrentACTOffset] = useState(0);
  const [currentRSDPage, setCurrentRSDPage] = useState(0);
  const [currentRSDPageSize, setCurrentRSDPageSize] = useState(5);
  const [currentRSDOffset, setCurrentRSDOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasAIMTMore, setHasAIMTMore] = useState(false);
  const [hasVAITMore, setHasVAITMore] = useState(false);
  const [hasACTMore, setHasACTMore] = useState(false);
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
  const [errorControlTranslations, setErrorControlTranslations] = useState([]);
  //========== FETCH DATA SECTION ================
  //fetch all factory

  const fetchAll = async (authData = null, pageSize = 5, offset = 0) => {
    const authToUse = authData || authorization;

    const allow = Array.isArray(authToUse)
      ? authToUse.find((item) => item.field === "query_level")?.title
      : null;

    setCurrentPage(0);
    setCurrentPageSize(pageSize);
    setCurrentOffset(0);
    const combinedData = await fnQuery([
      () =>
        fetchAllAcIssueMT(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          language,
          pageSize,
          offset,
        ),
    ]);
    setData([{ tableName: "AC_ISSUE_M_T", data: combinedData[0].data }]);
    setHasMore(combinedData[0]?.hasMore);
    if (combinedData?.[0]?.data?.length > 0) {
      setSelectRows([combinedData[0].data[0]]);
      setJumpToRow(combinedData[0].data[0]);
    }
  };
  //fetch all translation of factory
  const fetchAllTranslations = async () => {
    try {
      const columns = await fetchTableColumnTranslations(
        "ACTF_240",
        "master",
        "ac_issue_m_t",
      );
      const controls = await fetchTableControlTranslations("ACTF_240");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user?.factory,
        user?.department,
        user?.user_code,
        "ACTF_240",
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
  const fetchDataByMatdnoWithAIMT = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    try {
      if (!selectVAIT || selectVAIT.length === 0) {
        setAcIssueMatdTData([{ tableName: "AC_ISSUE_MATD_T", data: [] }]);
        setSelectAcIssueMatdT([]);
        return;
      }
      const offset = shouldResetPagination
        ? 0
        : explicitOffset !== null
          ? explicitOffset
          : currentAIMTOffset;
      const pageSize =
        explicitPageSize !== null ? explicitPageSize : currentAIMTPageSize;
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const response = await fetchAllAcIssueMatdT(
        user?.factory_code,
        user?.department,
        user?.user_code,
        allow || "1",
        selectVAIT[0]?.conf_seq,
        selectVAIT[0]?.matd_no,
        language,
        pageSize,
        offset,
      );
      if (response && response.data) {
        let childrenData = response.data;

        setAcIssueMatdTData([
          { tableName: "AC_ISSUE_MATD_T", data: childrenData },
        ]);
        setHasAIMTMore(response.hasMore);
        if (childrenData.length > 0) {
          setSelectAcIssueMatdT([childrenData[0]]);
        } else {
          setSelectAcIssueMatdT([]);
        }
      }
    } catch (error) {
      console.error(" Error fetching AC_PROD_M by shoe:", error);
      showErrorToast(getControlLabel, "noti_load_fail", "Fail to load data");
    }
  };
  const fetchDataByMatdSeq = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    try {
      if (!selectAcIssueMatdT || selectAcIssueMatdT.length === 0) {
        setAcChkTData([{ tableName: "AC_CHK_T", data: [] }]);
        setSelectAcChkT([]);
        return;
      }
      const offset = shouldResetPagination
        ? 0
        : explicitOffset !== null
          ? explicitOffset
          : currentACTOffset;
      const pageSize =
        explicitPageSize !== null ? explicitPageSize : currentACTPageSize;
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const response = await fetchAllAcChkT(
        user?.factory_code,
        user?.department,
        user?.user_code,
        allow || "1",
        selectAcIssueMatdT[0]?.conf_seq,
        selectAcIssueMatdT[0]?.matd_seq,
        language,
        pageSize,
        offset,
      );

      if (response && response.data) {
        let childrenData = response.data;
        setAcChkTData([{ tableName: "AC_CHK_T", data: childrenData }]);
        setHasACTMore(response.hasMore);
        if (childrenData.length > 0) {
          setSelectAcChkT([childrenData[0]]);
        } else {
          setSelectAcChkT([]);
        }
      }
    } catch (error) {
      console.error(" Error fetching AC_PROD_M by shoe:", error);
      showErrorToast(getControlLabel, "noti_load_fail", "Fail to load data");
    }
  };
  const fetchDataByConfSeqWithVAIT = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    try {
      if (!selectRows || selectRows.length === 0) {
        setVwAcIssueTData([{ tableName: "VW_AC_ISSUE_T", data: [] }]);
        setSelectVAIT([]);
        return;
      }
      const offset = shouldResetPagination
        ? 0
        : explicitOffset !== null
          ? explicitOffset
          : currentVAITOffset;
      const pageSize =
        explicitPageSize !== null ? explicitPageSize : currentVAITPageSize;
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const response = await fetchAllVwAcIssueT(
        user?.factory_code,
        user.department,
        user.user_code,
        allow || "1",
        selectRows[0]?.conf_seq,
        language,
        pageSize,
        offset,
      );
      if (response && response.data) {
        let childrenData = response.data;
        setVwAcIssueTData([{ tableName: "VW_AC_ISSUE_T", data: childrenData }]);
        setHasVAITMore(response.hasMore);
        if (childrenData.length > 0) {
          setSelectVAIT([childrenData[0]]);
        } else {
          setSelectVAIT([]);
        }
      }
    } catch (error) {
      console.error(" Error fetching AC_PROD_M by shoe:", error);
      showErrorToast(getControlLabel, "noti_load_fail", "Fail to load data");
    }
  };

  const fetchAcShoeRefByShoe = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    try {
      if (!selectRows || selectRows.length === 0) {
        setVwAcIssueTData([{ tableName: "VW_AC_ISSUE_T", data: [] }]);
        setSelectVAIT([]);
        return;
      }
      const offset = shouldResetPagination
        ? 0
        : explicitOffset !== null
          ? explicitOffset
          : currentASROffset;
      const pageSize =
        explicitPageSize !== null ? explicitPageSize : currentVAITPageSize;
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const response = await fetchAllAcShoeRefByShoe(
        selectRows[0]?.factory_code,
        selectRows[0]?.ac_no,
        user.department,
        user.user_code,
        allow || "1",
        pageSize,
        offset,
      );

      if (response && response.data) {
        let childrenData = response.data;
        if (isSearch && searchData.length > 0) {
          const selectedParent = selectRows[0];
          if (response.total !== undefined && response.total !== null) {
            setTotalVAITData(response.total);
          }
          if (shouldResetPagination) {
            setCurrentVAITPage(0);
            setCurrentASROffset(0);
          }
          childrenData = response.data.filter((child) =>
            searchData.some(
              (searchItem) =>
                searchItem.factory_code === selectedParent.factory_code &&
                searchItem.ac_no === selectedParent.ac_no &&
                searchItem.prod_acno === child.prod_no,
            ),
          );
        }
        setVwAcIssueTData([{ tableName: "VW_AC_ISSUE_T", data: childrenData }]);
        if (response.total !== undefined && response.total !== null) {
          setTotalVAITData(response.total);
        }
        if (childrenData.length > 0) {
          setSelectVAIT([childrenData[0]]);
        } else {
          setSelectVAIT([]);
        }
      }
    } catch (error) {
      console.error(" Error fetching AC_PROD_M by shoe:", error);
      showErrorToast(getControlLabel, "noti_load_fail", "Fail to load data");
    }
  };
  const fetchDataRSDBySize = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    try {
      if (!selectRows || selectRows.length === 0) {
        setRdSizeDData([{ tableName: "RD_SIZE_D", data: [] }]);
        setSelectRdSizeD([]);
        return;
      }
      const offset = shouldResetPagination
        ? 0
        : explicitOffset !== null
          ? explicitOffset
          : currentRSDOffset;
      const pageSize =
        explicitPageSize !== null ? explicitPageSize : currentRSDPageSize;
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const response = await fetchRSDBySize(
        selectRows[0]?.factory_code,
        selectRows[0]?.size_type,
        user.department,
        user.user_code,
        allow || "1",
        pageSize,
        offset,
      );

      if (response && response.data) {
        let childrenData = response.data;
        if (isSearch && searchData.length > 0) {
          const selectedParent = selectRows[0];
          if (response.total !== undefined && response.total !== null) {
            setTotalRSDData(response.total);
          }
          if (shouldResetPagination) {
            setCurrentRSDPage(0);
            setCurrentRSDOffset(0);
          }
          childrenData = response.data.filter((child) =>
            searchData.some(
              (searchItem) =>
                searchItem.factory_code === selectedParent.factory_code &&
                searchItem.size_type === selectedParent.size_type &&
                searchItem.size_no === child.size_no,
            ),
          );
        }
        setRdSizeDData([{ tableName: "RD_SIZE_D", data: childrenData }]);
        if (response.total !== undefined && response.total !== null) {
          setTotalRSDData(response.total);
        }
        if (childrenData.length > 0) {
          setSelectRdSizeD([childrenData[0]]);
        } else {
          setSelectRdSizeD([]);
        }
      }
    } catch (error) {
      console.error(" Error fetching AC_PROD_M by shoe:", error);
      showErrorToast(getControlLabel, "noti_load_fail", "Fail to load data");
    }
  };

  const fetchRecordFromDB = async (record) => {
    try {
      const response = await fetchAcIssueMTByID(
        user?.access_token,
        selectRows[0]?.factory_code,
        selectRows[0]?.conf_seq,
      );
      return response?.data;
    } catch (error) {
      console.error("Error fetching record:", error);
      return record;
    }
  };
  const fetchAcIssueMatdTRecordFromDB = async (record) => {
    try {
      const response = await fetchAcIssueMatdTByID(
        selectAcIssueMatdT[0]?.factory_code,
        selectAcIssueMatdT[0]?.conf_seq,
        selectAcIssueMatdT[0]?.matd_seq,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };
  const fetchAcChkTRecordFromDB = async (record) => {
    try {
      const response = await fetchACTByID(
        selectAcChkT[0]?.factory_code,
        selectAcChkT[0]?.conf_seq,
        selectAcChkT[0]?.matd_seq,
        selectAcChkT[0]?.issue_seq,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };

  const refreshCurrentData = async () => {
    const currentSelection = selectRows.length > 0 ? selectRows[0] : null;

    if (isSearch && searchFilter) {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;

      const response = await searchVwChgMByFilter(
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
          const currentKey = `${currentSelection.factory_code}-${parseInt(currentSelection.conf_seq)}`;
          const foundRecord = response.data.find(
            (item) =>
              `${item.factory_code}-${parseInt(item.conf_seq)}` === currentKey,
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

      const responseData = await fetchAllAcIssueMT(
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        language,
        currentPageSize,
        currentOffset,
      );
      if (responseData && responseData.data) {
        setData([{ tableName: "AC_ISSUE_M_T", data: responseData.data }]);
        setHasMore(responseData?.hasMore);
        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${parseInt(currentSelection.conf_seq)}`;
          const updatedRecord = responseData.data.find(
            (item) =>
              `${item.factory_code}-${parseInt(item.conf_seq)}` === currentKey,
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
    fetchAllTranslations();
  }, [language]);
  useEffect(() => {
    const init = async () => {
      if (!user?.factory) {
        return;
      }
      const authData = await fetchAllTranslations();
      await fetchAll(authData);
    };
    init();
  }, [language, user?.factory]);
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
          const unlockData = {
            ...record,
            locked_information: null,
          };
          const {
            chg_no,
            cont_no,
            ac_date,
            ac_typename,
            year_no,
            issue_seq,
            chgs_col3,
            old_no,
            out_dtype,
            status_name,
            ...finalLock
          } = unlockData;
          await editAcIssueMT(
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
        Object.keys(freshRecord).includes("locked_information") &&
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

      await handleEditASM(lockData, "", true);
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

  const handleSizeLink = () => {
    setOpenSizeLink(true);
  };
  const handleSizeLinkClose = () => {
    setOpenSizeLink(false);
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
      const response = await addAcIssueMT(
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
          `Add successfully with id ${addData.ac_no}!`,
        );
        const allow = Array.isArray(authorization)
          ? authorization.find((item) => item.field === "query_level")?.title
          : null;
        const responseData = await fetchAllAcIssueMT(
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
            tableName: "AC_ISSUE_M_T",
            data: responseData.data || [],
          },
        ]);
        setHasMore(responseData?.hasMore);
        setSelectRows([response.data]);
        setCurrentPage(response?.page);
        setCurrentPageSize(response.size);
        setCurrentOffset(response.offset);
        setIsSearch(false);
        setSearchFilter(null);
        setTotalData((prevTotal) => prevTotal + 1);
        handleAddClose();
      } else {
        showErrorToast(
          getControlLabel,
          "noti_fail_add_2",
          `Added successfully but failed to refresh data`,
        );
        handleAddClose();
      }
    } catch (error) {
      showErrorToast(
        getControlLabel,
        "noti_fail_duplicate_add",
        "Cannot add duplicate id!",
      );
      console.log("loi roi", error);
    }
  };
  const handleEditASM = async (updateRow, title, skipTimestamp = false) => {
    try {
      const {
        statusText,
        issued_date,
        expire_date,
        vend_no,
        vend_noname,
        last_edate,
        org_taxnm,
        grt_deptname,
        grt_username,
        last_username,
        currnm,
        d_type_name,
        ...cleanData
      } = updateRow;
      if (!skipTimestamp) {
        cleanData.last_user = user.user_code;
        cleanData.last_date = new Date().toISOString();
      }
      const result = await editAcIssueMT(
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
            : `Edit bom with code(${cleanData.ac_no}) successfully !!!`;
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
            await editAcIssueMT(
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

            const responseData = await fetchAllAcIssueMT(
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
                  tableName: "AC_ISSUE_M_T",
                  data: responseData.data,
                },
              ]);
              setHasMore(responseData?.hasMore);
              setCurrentPage(resultPage);
              setCurrentOffset(resultOffset);

              const editedRecord = responseData.data.find(
                (item) =>
                  `${item.factory_code}-${item.ac_no}` ===
                  `${cleanData.factory_code}-${cleanData.ac_no}`,
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
              await editAcIssueMT(
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
  const handleUpdateConfirm = async () => {
    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;

    try {
      //  Auto-confirm AC_PROD_M và AC_SHOE_REF
      // Filter searchData để lấy riêng AC_PROD_M
      const acProdMList =
        isSearch && searchData.length > 0
          ? searchData.filter((item) => item.prod_acno) // AC_PROD_M có prod_acno
          : [];

      await fetchAllConfirmedAcProdM(
        user?.factory,
        selectRows[0]?.ac_no,
        user?.department,
        user?.user_code,
        allow,
        acProdMList,
      );

      //  AC_SHOE_REF luôn confirm tất cả (không filter theo search)
      await fetchAllConfirmedAcShoeRef(
        user?.factory,
        selectRows[0]?.ac_no,
        user?.department,
        user?.user_code,
        allow,
        [], // Truyền [] để backend confirm tất cả AC_SHOE_REF của shoe này
      );

      //  Fetch lại data của 2 bảng con
      const acProdMResponse = await fetchAllAcProdMByShoe(
        selectRows[0]?.factory_code,
        selectRows[0]?.ac_no,
        user.department,
        user.user_code,
        allow,
      );
      const acShoeRefResponse = await fetchAllAcShoeRefByShoe(
        selectRows[0]?.factory_code,
        selectRows[0]?.ac_no,
        user.department,
        user.user_code,
        allow,
      );

      //  Nếu đang search, merge vào searchData
      if (isSearch && searchData.length > 0) {
        const selectedParent = selectRows[0];

        // Filter AC_PROD_M theo searchData
        const filteredAcProdM =
          acProdMResponse?.data?.filter((item) =>
            searchData.some(
              (search) =>
                search.factory_code === item.factory_code &&
                search.ac_no === item.ac_no &&
                search.prod_acno === item.prod_acno,
            ),
          ) || [];

        // Filter AC_SHOE_REF theo searchData
        const filteredAcShoeRef =
          acShoeRefResponse?.data?.filter((item) =>
            searchData.some(
              (search) =>
                search.factory_code === item.factory_code &&
                search.ac_no === item.ac_no &&
                search.prod_no === item.prod_no,
            ),
          ) || [];

        //  ĐÚNG - Merge vào searchData, không replace
        setSearchData((prevSearchData) => {
          // Xóa data cũ của cha này
          const otherParentsData = prevSearchData.filter(
            (item) =>
              !(
                item.factory_code === selectedParent.factory_code &&
                item.ac_no === selectedParent.ac_no
              ),
          );
          // Merge AC_PROD_M và AC_SHOE_REF mới
          return [
            ...otherParentsData,
            ...filteredAcProdM,
            ...filteredAcShoeRef,
          ];
        });

        // Update AC_PROD_M
        setAcIssueMatdTData([
          { tableName: "AC_ISSUE_MATD_T", data: filteredAcProdM },
        ]);
        if (filteredAcProdM.length > 0) {
          const currentItem = selectAcIssueMatdT[0];
          const matchedItem = filteredAcProdM.find(
            (item) =>
              item.factory_code === currentItem?.factory_code &&
              item.ac_no === currentItem?.ac_no &&
              item.prod_acno === currentItem?.prod_acno,
          );
          const itemToSelect = matchedItem || filteredAcProdM[0];
          setSelectAcIssueMatdT([itemToSelect]);
          setJumpToRowAcProdM(itemToSelect);
        } else {
          setSelectAcIssueMatdT([]);
        }

        // Update AC_SHOE_REF
        setVwAcIssueTData([
          { tableName: "VW_AC_ISSUE_T", data: filteredAcShoeRef },
        ]);
        if (filteredAcShoeRef.length > 0) {
          const currentItem = selectVAIT[0];
          const matchedItem = filteredAcShoeRef.find(
            (item) =>
              item.factory_code === currentItem?.factory_code &&
              item.ac_no === currentItem?.ac_no &&
              item.prod_no === currentItem?.prod_no,
          );
          const itemToSelect = matchedItem || filteredAcShoeRef[0];
          setSelectVAIT([itemToSelect]);
          setJumpToRowAcShoeRef(itemToSelect);
        } else {
          setSelectVAIT([]);
        }
      } else {
        // Không search - update bình thường
        // Update AC_PROD_M
        if (acProdMResponse && acProdMResponse.data) {
          setAcIssueMatdTData([
            { tableName: "AC_ISSUE_MATD_T", data: acProdMResponse.data },
          ]);

          if (acProdMResponse.data.length > 0) {
            const currentItem = selectAcIssueMatdT[0];
            const matchedItem = acProdMResponse.data.find(
              (item) =>
                item.factory_code === currentItem?.factory_code &&
                item.ac_no === currentItem?.ac_no &&
                item.prod_acno === currentItem?.prod_acno,
            );
            const itemToSelect = matchedItem || acProdMResponse.data[0];
            setSelectAcIssueMatdT([itemToSelect]);
            setJumpToRowAcProdM(itemToSelect);
          } else {
            setSelectAcIssueMatdT([]);
          }
        }

        // Update AC_SHOE_REF
        if (acShoeRefResponse && acShoeRefResponse.data) {
          setVwAcIssueTData([
            { tableName: "VW_AC_ISSUE_T", data: acShoeRefResponse.data },
          ]);

          if (acShoeRefResponse.data.length > 0) {
            const currentItem = selectVAIT[0];
            const matchedItem = acShoeRefResponse.data.find(
              (item) =>
                item.factory_code === currentItem?.factory_code &&
                item.ac_no === currentItem?.ac_no &&
                item.prod_no === currentItem?.prod_no,
            );
            const itemToSelect = matchedItem || acShoeRefResponse.data[0];
            setSelectVAIT([itemToSelect]);
            setJumpToRowAcShoeRef(itemToSelect);
          } else {
            setSelectVAIT([]);
          }
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
  //handler search by filter
  const handleSearchByFilter = async (
    filteredShoe,
    pageSize = 5,
    offset = 0,
  ) => {
    try {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;
      const search = filteredShoe.search || {};
      const keys = Object.keys(search);
      if (keys.length === 0) {
        setCurrentPage(0);
        setCurrentPageSize(10);
        setCurrentOffset(0);
        setIsSearch(false);
        setSearchData([]);
        setSelectRows([]);
        setSearchFilter(null);
        await fetchAll();
        return;
      }
      if (offset === 0) {
        setCurrentPage(0);
        setCurrentPageSize(pageSize);
        setCurrentOffset(0);
      }
      setIsSearch(true);
      setSearchFilter(filteredShoe);
      const isNewFilter =
        JSON.stringify(filteredShoe) !== JSON.stringify(searchFilter);
      const actualOffset = isNewFilter ? 0 : (offset ?? currentOffset);
      const response = await searchAcIssueMTByFilter(
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
          setTotalData(0);
          setHasMore(false);
          setData([{ tableName: "AC_ISSUE_M_T", data: response.data }]);
        } else {
          setSelectRows([response.data[0]]);
          if (offset === 0 && response.data.length > 0) {
            setTotalData(response.total);
          }
          setData([{ tableName: "AC_ISSUE_M_T", data: response.data }]);
        }
      }
    } catch (error) {
      console.log("cannot search because", error);
    }
  };

  const hanldeSearchForRDSizeD = async (
    filteredShoe,
    pageSize = 5,
    offset = 0,
  ) => {
    try {
      const search = filteredShoe?.search || {};
      const keys = Object.keys(search);

      if (keys.length === 0) {
        setIsRSDSearch(false);
        setSearchRSDData([]);
        setSearchRSDFilter(null);
        await fetchDataRSDBySize(true, 0, 5);
        return;
      }
      if (offset === 0) {
        setCurrentRSDPage(0);
        setCurrentRSDPageSize(pageSize);
        setCurrentRSDOffset(0);
      }
      setIsRSDSearch(true);
      setSearchRSDFilter(filteredShoe);
      const isNewFilter =
        JSON.stringify(filteredShoe) !== JSON.stringify(searchRSDFilter);
      const actualRSDOffset = isNewFilter ? 0 : (offset ?? currentRSDOffset);
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;
      const response = await searchRSDByFilter(
        filteredShoe,
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        pageSize,
        actualRSDOffset,
      );
      if (response && response.data) {
        if (response.data.length === 0) {
          setSelectRdSizeD([]);
          setCurrentRSDOffset(0);
          setCurrentRSDPage(0);
          setCurrentRSDPageSize(pageSize);
          setTotalRSDData(0);
          setAcIssueMatdTData([
            { tableName: "RD_SIZE_D", data: response.data },
          ]);
        } else {
          setSelectRdSizeD([response.data[0]]);
          if (offset === 0 && response.data.length > 0) {
            setTotalRSDData(response.total);
          }
          setRdSizeDData([{ tableName: "RD_SIZE_D", data: response.data }]);
        }
      }
    } catch (error) {
      console.log(" Cannot search because:", error);
      toast.error("Search failed!");
    }
  };

  //handler cancel
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
        await refreshCurrentData();
        return;
      }
      await fetchAction();
      showSuccessToast(getControlLabel, `noti_success_${actionName}`);
      await refreshCurrentData();
    } catch (error) {
      console.error(` Error in ${actionName}:`, error);
      showErrorToast(getControlLabel, `noti_fail_${actionName}`, error.message);
    }
  };

  const handleConfirm = async () => {
    try {
      const response = await active(
        user?.factory,
        user?.user_code,
        selectRows[0]?.conf_seq,
        language,
      );
      if (response && response?.success) {
        showSuccessToast(getControlLabel, "noti_success_confirm");
        await refreshCurrentData();
      }
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_confirm", error.message);
    }
  };

  const handleCalculateTrial = async () => {
    try {
      const response = await calculate(
        user?.factory,
        user?.user_code,
        selectRows[0]?.conf_seq,
        language,
      );
      if (response && response?.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_calculate",
          "Successfully calculated!",
        );
        await refreshCurrentData();
        await fetchDataByMatdSeq(false, 0, 10);
        await fetchDataByMatdnoWithAIMT(false, 0, 10);
        await fetchDataByConfSeqWithVAIT(false, 0, 10);
      }
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_unconfirm", error.message);
    }
  };

  const handleClose = async () => {
    try {
      await handleStatusChange("close", [1, 7], async () => {
        await active(
          user?.factory,
          user?.user_code,
          selectRows[0]?.conf_seq,
          language,
        );
      });
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_close", error.message);
    }
  };

  const handleUnclose = async () => {
    await handleStatusChange("unconfirm", [9], async () => {
      await voidAll(
        user?.factory,
        user?.user_code,
        selectRows[0]?.conf_seq,
        selectRows[0]?.lock_seq,
        language,
      );
    });
  };

  const handleCheck = () => {
    handleStatusChange(2, "check", [1]);
  };

  //handler export Excel
  const handleExport = async () => {
    const allow = authorization.find(
      (item) => item.field === "query_level",
    )?.title;
    const excel = await exportExcelVwChgM(
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
      language,
      searchFilter,
    );
  };
  const handleExcelDetail = async () => {
    try {
      const result = await exportExcelDetail(
        user?.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        language,
        searchFilter,
      );
      if (result && result.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_export",
          result.message,
        );
      }
    } catch (error) {
      console.log("the error has been occurred in excel list", error);
      showErrorToast(getControlLabel, "noti_fail_excel_detail", error.message);
    }
  };
  const handleExportExcelSummary = async () => {
    try {
      const result = await exportExcelSummary(
        user?.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        language,
        searchFilter,
      );
      if (result && result.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_export",
          result.message,
        );
      }
    } catch (error) {
      console.log(
        "the error has been occurred in excel writing_offs list",
        error,
      );
      showErrorToast(
        getControlLabel,
        "noti_fail_export_summary",
        error.message,
      );
    }
  };

  //handler export PDF
  const handlePDF = async () => {
    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;
    await exportExcelASM(
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
  const handlePageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentPage(newPage);
    setCurrentPageSize(newPageSize);
    setCurrentOffset(newOffset);
    if (isSearch && searchFilter) {
      await handleSearchByFilter(searchFilter, newPageSize, newOffset);
      return;
    }
    const allow = authorization.find(
      (item) => item.field === "query_level",
    )?.title;
    const responseData = await fetchAllAcIssueMT(
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
      language,
      newPageSize,
      newOffset,
    );
    setData([{ tableName: "AC_ISSUE_M_T", data: responseData.data || [] }]);
    setHasMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectRows([responseData.data[0]]);
    }
  };
  const handleAIMTPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentAIMTPage(newPage);
    setCurrentAIMTPageSize(newPageSize);
    setCurrentAIMTOffset(newOffset);
    await fetchDataByMatdnoWithAIMT(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.ac_no) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
  };
  const handleACTPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentACTPage(newPage);
    setCurrentACTPageSize(newPageSize);
    setCurrentACTOffset(newOffset);
    await fetchDataByMatdSeq(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.ac_no) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
  };
  const handleVAITPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentVAITPage(newPage);
    setCurrentVAITPageSize(newPageSize);
    setCurrentVAITOffset(newOffset);
    await fetchDataByConfSeqWithVAIT(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.ac_no) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
  };
  const handleASRPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentVAITPage(newPage);
    setCurrentVAITPageSize(newPageSize);
    setCurrentASROffset(newOffset);

    await fetchAcShoeRefByShoe(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.ac_no) {
      return;
    }
  };
  const handleRSDPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentRSDPage(newPage);
    setCurrentRSDPageSize(newPageSize);
    setCurrentRSDOffset(newOffset);

    if (isRSDSearch && searchRSDData) {
      await hanldeSearchForRDSizeD(searchRSDFilter, newPageSize, newOffset);
      return;
    }
    await fetchDataRSDBySize(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.ac_no) {
      return;
    }
  };
  const handleImportLink = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_240`, "_blank");
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
  const getErrorControlLabel = (fieldCode, fallback) => {
    if (!errorControlTranslations || errorControlTranslations.length === 0) {
      return fallback;
    }
    const translation = errorControlTranslations.find(
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
      <Box>
        <Container maxWidth="xxl">
          <Stack direction="row" flexWrap="wrap" sx={{ rowGap: 1 }}>
            <Paper
              sx={{
                width: "100%",
                maxWidth: "100%",
                height: "100%",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  mt: 1,
                  width: "100%",
                }}
              >
                {/* Bảng chính - chiếm 60% */}
                <Box
                  sx={{
                    flex: "0 0 60%",
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {" "}
                  <DataTable
                    data={data[0]?.data}
                    tableName={"AC_ISSUE_M_T"}
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
                    onConfirm={handleConfirm}
                    onCalculateTrial={handleCalculateTrial}
                    onClose={handleClose}
                    onUnclose={handleUnclose}
                    onDetail={(row) => {
                      handleDetailModal(row);
                    }}
                    onCheck={handleCheck}
                    onPDF={handleExport}
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
                    isLoadingBom={isLoadingBom}
                    hasMore={hasMore}
                    isSearch={isSearch}
                    onExcelDetail={handleExcelDetail}
                    onExcelSummary={handleExportExcelSummary}
                    onImportLink={handleImportLink}
                  />
                  <VwAcIssueT
                    data={vwAcIssueTData}
                    setData={setVwAcIssueTData}
                    setSelectVAIT={setSelectVAIT}
                    selectVAIT={selectVAIT.length > 0 ? selectVAIT : []}
                    setJumpToRow={setJumpToRowVAIT}
                    jumpToRow={jumpToRowVAIT}
                    selectRows={selectRows}
                    subAuthentication={authorization}
                    fetchDataByConfSeqWithVAIT={fetchDataByConfSeqWithVAIT}
                    totalData={totalVAITData || 0}
                    onPageChange={handleVAITPageChange}
                    currentOffset={currentVAITOffset}
                    currentPage={currentVAITPage}
                    currentPageSize={currentVAITPageSize}
                    setCurrentPage={setCurrentVAITPage}
                    setCurrentOffset={setCurrentVAITOffset}
                    setCurrentPageSize={setCurrentVAITPageSize}
                    setTotalData={setTotalVAITData}
                    setSearchData={setSearchAPMData}
                    searchFilter={searchAPMFilter}
                    hasMore={hasVAITMore}
                    setHasMore={setHasVAITMore}
                  />
                </Box>
                <Box
                  sx={{
                    flex: "0 0 40%",
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <AcIssueMatdT
                    data={acIssueMatdTData}
                    setData={setAcIssueMatdTData}
                    setSelectAcIssueMatdT={setSelectAcIssueMatdT}
                    selectAcIssueMatdT={
                      selectAcIssueMatdT.length > 0 ? selectAcIssueMatdT : []
                    }
                    setJumpToRow={setJumpToRowAIMT}
                    jumpToRow={jumpToRowAIMT}
                    selectRows={selectVAIT.length > 0 ? selectVAIT : []}
                    subAuthentication={authorization}
                    isSearch={isAPMSearch}
                    searchData={searchAPMData}
                    fetchDataByMatdnoWithAIMT={fetchDataByMatdnoWithAIMT}
                    fetchRecordFromDB={fetchAcIssueMatdTRecordFromDB}
                    totalData={totalAIMTData || 0}
                    onPageChange={handleAIMTPageChange}
                    currentOffset={currentAIMTOffset}
                    currentPage={currentAIMTPage}
                    currentPageSize={currentAIMTPageSize}
                    setCurrentPage={setCurrentAIMTPage}
                    setCurrentOffset={setCurrentAIMTOffset}
                    setCurrentPageSize={setCurrentAIMTPageSize}
                    setTotalData={setTotalAIMTData}
                    setSearchData={setSearchAPMData}
                    searchFilter={searchAPMFilter}
                    hasMore={hasAIMTMore}
                    setHasMore={setHasAIMTMore}
                    fetchDataByMatdSeq={fetchDataByMatdSeq}
                  />
                  <AcChkT
                    data={acChkTData}
                    setData={setAcChkTData}
                    setSelectAcChkT={setSelectAcChkT}
                    selectAcChkT={selectAcChkT.length > 0 ? selectAcChkT : []}
                    setJumpToRow={setJumpToRowACT}
                    jumpToRow={jumpToRowACT}
                    selectRows={
                      selectAcIssueMatdT.length > 0 ? selectAcIssueMatdT : []
                    }
                    subAuthentication={authorization}
                    isSearch={isAPMSearch}
                    searchData={searchAPMData}
                    fetchDataByMatdSeq={fetchDataByMatdSeq}
                    fetchRecordFromDB={fetchAcChkTRecordFromDB}
                    totalData={totalACTData || 0}
                    onPageChange={handleACTPageChange}
                    currentOffset={currentACTOffset}
                    currentPage={currentACTPage}
                    currentPageSize={currentACTPageSize}
                    setCurrentPage={setCurrentACTPage}
                    setCurrentOffset={setCurrentACTOffset}
                    setCurrentPageSize={setCurrentACTPageSize}
                    setTotalData={setTotalACTData}
                    setSearchData={setSearchAPMData}
                    searchFilter={searchAPMFilter}
                    hasMore={hasACTMore}
                    setHasMore={setHasACTMore}
                    selectParentRows={selectRows.length > 0 ? selectRows : []}
                  />
                </Box>
              </Box>
            </Paper>
          </Stack>
        </Container>
      </Box>
      {/* ========== MODAL/DIALOG COMPONENTS ========== */}
      <AddAcIssueMT
        open={openAdd}
        onClose={handleAddClose}
        handleAdd={handleAdd}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={authorization}
      />
      <EditAcIssueMT
        open={openEdit}
        onClose={handleEditClose}
        selectRows={selectRows.length > 0 ? selectRows[0] : null}
        handleEdit={handleEditASM}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={authorization}
      />
    </>
  );
};
export default Actf240;
