import { useEffect, useRef, useState } from "react";
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
import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import { fetchTablePermission } from "../../service/users_permission/UsersPermission";
import {
  exportCustomExcel,
  exportMaterialExcel,
} from "../../service/ac_imp_material_tracking/AcImpMaterialTrackingService";
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
import { fetchAcChgDByID } from "../../service/ac_chg_d/acChgD";
import {
  activate,
  cancelActivate,
  close,
  editAcChgM,
  exportExcelVwChgM,
  voidAll,
} from "../../service/ac_chg_m/acChgM";
import { fetchAcChgAByID } from "../../service/ac_chg_a/AcChgA";
import { fetchVwAcReqDByCom } from "../../service/vw_acreq_d/vwAcreqD";
import {
  addAcExpectM,
  calculateWriteoff,
  editAcExpectM,
  exportExcelToShoe,
  exportExcelToWriteoff,
  fetchAcExpectMByID,
  fetchAllAcExpectM,
  fetchFieldDropdown,
  genOrderMaterial,
  searchAcExpectMByFilter,
} from "../../service/ac_expect_m/acExpectM";
import AcExpectSe from "../../features/actf_270/component/AcExpectSe";
import AcExpectMatd from "../../features/actf_270/component/AcExpectMatd";
import AddAcExpectM from "../../features/actf_270/page/AddAcExpectM";
import EditAcExpectM from "../../features/actf_270/page/EditAcExpectM";
import { fetchAllAcExpectSe } from "../../service/ac_expect_se/acExpectSe";
import { fetchAllAcExpectMatd } from "../../service/ac_expect_matd/acExpectMatd";
const Actf270 = () => {
  const [data, setData] = useState([]);
  const [acExpectSeData, setAcExpectSeData] = useState([]);
  const [selectAES, setSelectAES] = useState([]);
  const [jumpToRowAcProdM, setJumpToRowAcProdM] = useState(null);
  const [vwAcReqDData, setVwAcReqDData] = useState([]);
  const [acExpectMatDData, setAcExpectMatdData] = useState([]);
  const [selectVwAcReqD, setSelectVwAcReqD] = useState([]);
  const [selectAcExpectMatd, setSelectAcExpectMatd] = useState([]);
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
  const [totalAESData, setTotalAESData] = useState(0);
  const [totalVADData, setTotalVADData] = useState(0);
  const [totalAEMData, setTotalACAData] = useState(0);
  const [totalRSDData, setTotalRSDData] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(5);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [currentAESPage, setCurrentAESPage] = useState(0);
  const [currentAESPageSize, setCurrentAESPageSize] = useState(10);
  const [currentAESOffset, setCurrentAESOffset] = useState(0);
  const [currentVADPage, setCurrentVADPage] = useState(0);
  const [currentVADPageSize, setCurrentVADPageSize] = useState(10);
  const [currentVADOffset, setCurrentVADOffset] = useState(0);
  const [currentASROffset, setCurrentASROffset] = useState(0);
  const [currentAEMPage, setCurrentAEMPage] = useState(0);
  const [currentAEMPageSize, setCurrentAEMPageSize] = useState(5);
  const [currentAEMOffset, setCurrentAEMOffset] = useState(0);
  const [currentRSDPage, setCurrentRSDPage] = useState(0);
  const [currentRSDPageSize, setCurrentRSDPageSize] = useState(5);
  const [currentRSDOffset, setCurrentRSDOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasAESMore, setHasAESMore] = useState(false);
  const [hasVADMore, setHasVADMore] = useState(false);
  const [hasAEMMore, setHasAEMMore] = useState(false);
  const [dropdownValues, setDropdownValues] = useState({});
  const toolbarRef = useRef(null);
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
        fetchAllAcExpectM(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          language,
          pageSize,
          offset,
        ),
    ]);
    setData([{ tableName: "AC_EXPECT_M", data: combinedData[0].data }]);
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
        "ACTF_270",
        "master",
        "ac_expect_m",
      );
      const controls = await fetchTableControlTranslations("ACTF_270");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user?.factory,
        user?.department,
        user?.user_code,
        "ACTF_270",
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
  const fetchDataByExpectId = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    try {
      if (!selectRows || selectRows.length === 0) {
        setAcExpectSeData([{ tableName: "AC_EXPECT_SE", data: [] }]);
        setSelectAES([]);
        return;
      }
      const offset = shouldResetPagination
        ? 0
        : explicitOffset !== null
          ? explicitOffset
          : currentAESOffset;
      const pageSize =
        explicitPageSize !== null ? explicitPageSize : currentAESPageSize;
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const response = await fetchAllAcExpectSe(
        user?.factory_code,
        selectRows[0]?.expect_id || 1,
        user.department,
        user.user_code,
        allow || "1",
        language,
        pageSize,
        offset,
      );
      if (response && response.data) {
        let childrenData = response.data;
        setAcExpectSeData([{ tableName: "AC_EXPECT_SE", data: childrenData }]);
        setHasAESMore(response.hasMore);
        if (childrenData.length > 0) {
          setSelectAES([childrenData[0]]);
        } else {
          setSelectAES([]);
        }
      }
    } catch (error) {
      console.error(" Error fetching AC_PROD_M by shoe:", error);
      showErrorToast(getControlLabel, "noti_load_fail", "Fail to load data");
    }
  };
  const fetchAcExpectMatDByExpectId = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    try {
      if (!selectRows || selectRows.length === 0) {
        setAcExpectMatdData([{ tableName: "AC_EXPECT_MATD", data: [] }]);
        setSelectAcExpectMatd([]);
        return;
      }
      const offset = shouldResetPagination
        ? 0
        : explicitOffset !== null
          ? explicitOffset
          : currentAEMOffset;
      const pageSize =
        explicitPageSize !== null ? explicitPageSize : currentAEMPageSize;
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const response = await fetchAllAcExpectMatd(
        selectRows[0]?.factory_code,
        selectRows[0]?.expect_id || 1,
        user.department,
        user.user_code,
        allow || "1",
        language,
        pageSize,
        offset,
      );

      if (response && response.data) {
        let childrenData = response.data;
        setAcExpectMatdData([
          { tableName: "AC_EXPECT_MATD", data: childrenData },
        ]);
        setHasAEMMore(response.hasMore);
        if (childrenData.length > 0) {
          setSelectAcExpectMatd([childrenData[0]]);
        } else {
          setSelectAcExpectMatd([]);
        }
      }
    } catch (error) {
      console.error(" Error fetching AC_PROD_M by shoe:", error);
      showErrorToast(getControlLabel, "noti_load_fail", "Fail to load data");
    }
  };
  const fetchVwAcReqDByComInvoice = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    try {
      if (!selectRows || selectRows.length === 0) {
        setVwAcReqDData([{ tableName: "VW_ACREQ_D", data: [] }]);
        setSelectVwAcReqD([]);
        return;
      }
      const offset = shouldResetPagination
        ? 0
        : explicitOffset !== null
          ? explicitOffset
          : currentVADOffset;
      const pageSize =
        explicitPageSize !== null ? explicitPageSize : currentVADPageSize;
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const response = await fetchVwAcReqDByCom(
        selectRows[0]?.factory_code,
        selectRows[0]?.com_invoice,
        user.department,
        user.user_code,
        allow || "1",
        language,
        pageSize,
        offset,
      );
      if (response && response.data) {
        let childrenData = response.data;
        if (isSearch && searchData.length > 0) {
          const selectedParent = selectRows[0];
          if (response.total !== undefined && response.total !== null) {
            setTotalVADData(response.total);
          }
          if (shouldResetPagination) {
            setCurrentVADPage(0);
            setCurrentVADOffset(0);
          }
          childrenData = response.data.filter((child) =>
            searchData.some(
              (searchItem) =>
                searchItem.factory_code === selectedParent.factory_code &&
                searchItem.req_no === selectedParent.req_no &&
                searchItem.ac_code === child.ac_code,
            ),
          );
        }
        setVwAcReqDData([{ tableName: "VW_ACREQ_D", data: childrenData }]);
        setHasVADMore(response.hasMore);
        if (childrenData.length > 0) {
          setSelectVwAcReqD([childrenData[0]]);
        } else {
          setSelectVwAcReqD([]);
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
        setVwAcReqDData([{ tableName: "VW_ACREQ_D", data: [] }]);
        setSelectVwAcReqD([]);
        return;
      }
      const offset = shouldResetPagination
        ? 0
        : explicitOffset !== null
          ? explicitOffset
          : currentASROffset;
      const pageSize =
        explicitPageSize !== null ? explicitPageSize : currentVADPageSize;
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const response = await fetchAllAcShoeRefByShoe(
        selectRows[0]?.factory_code,
        selectRows[0]?.expect_id,
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
            setTotalVADData(response.total);
          }
          if (shouldResetPagination) {
            setCurrentVADPage(0);
            setCurrentASROffset(0);
          }
          childrenData = response.data.filter((child) =>
            searchData.some(
              (searchItem) =>
                searchItem.factory_code === selectedParent.factory_code &&
                searchItem.expect_id === selectedParent.expect_id &&
                searchItem.prod_acno === child.prod_no,
            ),
          );
        }
        setVwAcReqDData([{ tableName: "VW_ACREQ_D", data: childrenData }]);
        if (response.total !== undefined && response.total !== null) {
          setTotalVADData(response.total);
        }
        if (childrenData.length > 0) {
          setSelectVwAcReqD([childrenData[0]]);
        } else {
          setSelectVwAcReqD([]);
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
      const response = await fetchAcExpectMByID(
        selectRows[0]?.factory_code,
        selectRows[0]?.expect_id,
      );
      return response?.data;
    } catch (error) {
      console.error("Error fetching record:", error);
      return record;
    }
  };
  const fetchAcChgDRecordFromDB = async (record) => {
    try {
      const response = await fetchAcChgDByID(
        selectAES[0]?.factory_code,
        selectAES[0]?.expect_id,
        selectAES[0]?.seq,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };
  const fetchAcChgARecordFromDB = async (record) => {
    try {
      const response = await fetchAcChgAByID(
        selectAcExpectMatd[0]?.factory_code,
        selectAcExpectMatd[0]?.expect_id,
        selectAcExpectMatd[0]?.seq,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };
  const fetchAcShoeRefRecordFromDB = async (record) => {
    try {
      const response = await fetchAllAcShoeRefByID(
        selectVwAcReqD[0]?.factory_code,
        selectVwAcReqD[0]?.expect_id,
        selectVwAcReqD[0]?.prod_no,
      );
      return response?.data;
    } catch (error) {
      console.error("Error fetching record:", error);
      return record;
    }
  };
  const refreshCurrentData = async () => {
    const currentSelection = selectRows.length > 0 ? selectRows[0] : null;

    if (isSearch && searchFilter) {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;

      const response = await searchAcExpectMByFilter(
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
          const currentKey = `${currentSelection.factory_code}-${currentSelection.expect_id}`;
          const foundRecord = response.data.find(
            (item) => `${item.factory_code}-${item.expect_id}` === currentKey,
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

      const responseData = await fetchAllAcExpectM(
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        language,
        currentPageSize,
        currentOffset,
      );
      if (responseData && responseData.data) {
        setData([{ tableName: "AC_EXPECT_M", data: responseData.data }]);
        setHasMore(responseData?.hasMore);
        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${currentSelection.expect_id}`;
          const updatedRecord = responseData.data.find(
            (item) => `${item.factory_code}-${item.expect_id}` === currentKey,
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
          const { type_name,grt_deptname,grt_username,last_username, ...finalLock } = unlockData;
          await editAcExpectM(
            user?.access_token,
            user?.factory,
            user?.department,
            user?.user_code,
            authorization?.find((item) => item.field === "modify_level")?.title,
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
      const response = await addAcExpectM(
        user.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        currentPageSize,
        addData,
      );
      if (response && response.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_add",
          `Add successfully with id ${addData.expect_id}!`,
        );
        const allow = Array.isArray(authorization)
          ? authorization.find((item) => item.field === "query_level")?.title
          : null;
        const responseData = await fetchAllAcExpectM(
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
            tableName: "AC_EXPECT_M",
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
      console.log(`${error.message}`);
    }
  };
  const handleEditASM = async (updateRow, title, skipTimestamp = false) => {
    try {
      const { statusText, type_name, ...cleanData } = updateRow;
      if (!skipTimestamp) {
        cleanData.last_user = user.user_code;
        cleanData.last_date = new Date().toISOString();
      }
      const result = await editAcExpectM(
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
            : `Edit bom with code(${cleanData.expect_id}) successfully !!!`;
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
            await editAcExpectM(
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

            const responseData = await fetchAllAcExpectM(
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
                  tableName: "AC_EXPECT_M",
                  data: responseData.data,
                },
              ]);
              setHasMore(responseData?.hasMore);
              setCurrentPage(resultPage);
              setCurrentOffset(resultOffset);

              const editedRecord = responseData.data.find(
                (item) =>
                  `${item.factory_code}-${item.expect_id}` ===
                  `${cleanData.factory_code}-${cleanData.expect_id}`,
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
              await editAcChgM(
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
        selectRows[0]?.expect_id,
        user?.department,
        user?.user_code,
        allow,
        acProdMList,
      );

      // AC_SHOE_REF luôn confirm tất cả (không filter theo search)
      await fetchAllConfirmedAcShoeRef(
        user?.factory,
        selectRows[0]?.expect_id,
        user?.department,
        user?.user_code,
        allow,
        [], // Truyền [] để backend confirm tất cả AC_SHOE_REF của shoe này
      );

      //  Fetch lại data của 2 bảng con
      const acProdMResponse = await fetchAllAcProdMByShoe(
        selectRows[0]?.factory_code,
        selectRows[0]?.expect_id,
        user.department,
        user.user_code,
        allow,
      );
      const acShoeRefResponse = await fetchAllAcShoeRefByShoe(
        selectRows[0]?.factory_code,
        selectRows[0]?.expect_id,
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
                search.expect_id === item.expect_id &&
                search.prod_acno === item.prod_acno,
            ),
          ) || [];

        // Filter AC_SHOE_REF theo searchData
        const filteredAcShoeRef =
          acShoeRefResponse?.data?.filter((item) =>
            searchData.some(
              (search) =>
                search.factory_code === item.factory_code &&
                search.expect_id === item.expect_id &&
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
                item.expect_id === selectedParent.expect_id
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
        setAcExpectSeData([
          { tableName: "AC_EXPECT_SE", data: filteredAcProdM },
        ]);
        if (filteredAcProdM.length > 0) {
          const currentItem = selectAES[0];
          const matchedItem = filteredAcProdM.find(
            (item) =>
              item.factory_code === currentItem?.factory_code &&
              item.expect_id === currentItem?.expect_id &&
              item.prod_acno === currentItem?.prod_acno,
          );
          const itemToSelect = matchedItem || filteredAcProdM[0];
          setSelectAES([itemToSelect]);
          setJumpToRowAcProdM(itemToSelect);
        } else {
          setSelectAES([]);
        }

        // Update AC_SHOE_REF
        setVwAcReqDData([{ tableName: "VW_ACREQ_D", data: filteredAcShoeRef }]);
        if (filteredAcShoeRef.length > 0) {
          const currentItem = selectVwAcReqD[0];
          const matchedItem = filteredAcShoeRef.find(
            (item) =>
              item.factory_code === currentItem?.factory_code &&
              item.expect_id === currentItem?.expect_id &&
              item.prod_no === currentItem?.prod_no,
          );
          const itemToSelect = matchedItem || filteredAcShoeRef[0];
          setSelectVwAcReqD([itemToSelect]);
          setJumpToRowAcShoeRef(itemToSelect);
        } else {
          setSelectVwAcReqD([]);
        }
      } else {
        // Không search - update bình thường
        // Update AC_PROD_M
        if (acProdMResponse && acProdMResponse.data) {
          setAcExpectSeData([
            { tableName: "AC_EXPECT_SE", data: acProdMResponse.data },
          ]);

          if (acProdMResponse.data.length > 0) {
            const currentItem = selectAES[0];
            const matchedItem = acProdMResponse.data.find(
              (item) =>
                item.factory_code === currentItem?.factory_code &&
                item.expect_id === currentItem?.expect_id &&
                item.prod_acno === currentItem?.prod_acno,
            );
            const itemToSelect = matchedItem || acProdMResponse.data[0];
            setSelectAES([itemToSelect]);
            setJumpToRowAcProdM(itemToSelect);
          } else {
            setSelectAES([]);
          }
        }

        // Update AC_SHOE_REF
        if (acShoeRefResponse && acShoeRefResponse.data) {
          setVwAcReqDData([
            { tableName: "VW_ACREQ_D", data: acShoeRefResponse.data },
          ]);

          if (acShoeRefResponse.data.length > 0) {
            const currentItem = selectVwAcReqD[0];
            const matchedItem = acShoeRefResponse.data.find(
              (item) =>
                item.factory_code === currentItem?.factory_code &&
                item.expect_id === currentItem?.expect_id &&
                item.prod_no === currentItem?.prod_no,
            );
            const itemToSelect = matchedItem || acShoeRefResponse.data[0];
            setSelectVwAcReqD([itemToSelect]);
            setJumpToRowAcShoeRef(itemToSelect);
          } else {
            setSelectVwAcReqD([]);
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
      const response = await searchAcExpectMByFilter(
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
          setData([{ tableName: "AC_EXPECT_M", data: response.data }]);
        } else {
          setSelectRows([response.data[0]]);
          if (offset === 0 && response.data.length > 0) {
            setTotalData(response.total);
          }

          setData([{ tableName: "AC_EXPECT_M", data: response.data }]);
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
          setAcExpectSeData([{ tableName: "RD_SIZE_D", data: response.data }]);
        } else {
          setSelectRdSizeD([response.data[0]]);
          if (offset === 0 && response.data.length > 0) {
            setTotalRSDData(response.total);
          }
          setRdSizeDData([{ tableName: "RD_SIZE_D", data: response.data }]);
        }
      }
    } catch (error) {
      console.log("Cannot search because:", error);
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
      await handleStatusChange("confirm", [1, 2], async () => {
        await activate(
          user?.factory,
          user?.user_code,
          selectRows[0]?.expect_id,
          selectRows[0]?.curr_rate,
          language,
        );
      });
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_confirm", error.message);
    }
  };

  const handleUnconfirm = async () => {
    try {
      await handleStatusChange("unconfirm", [1, 7], async () => {
        await cancelActivate(
          user?.factory,
          user?.user_code,
          selectRows[0]?.expect_id,
          language,
        );
      });
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_unconfirm", error.message);
    }
  };

  const handleClose = async () => {
    try {
      await handleStatusChange("close", [1, 7], async () => {
        await close(user?.factory, selectRows[0]?.expect_id, user?.user_code);
      });
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_close", error.message);
    }
  };

  const handleCancel = async () => {
    await handleStatusChange("cancel", [1, 2], async () => {
      await voidAll(
        user?.factory,
        selectRows[0]?.expect_id,
        user?.user_code,
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
  const handleGenOrderMaterial = async () => {
    try {
      const result = await genOrderMaterial(
        user?.factory,
        selectRows[0]?.expect_id,
        user?.user_code,
      );
      if (result && result?.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_genOrderMaterial",
          "Success Generate Order Material",
        );
        await fetchDataByExpectId(false, null, null);
      }
    } catch (error) {
      console.log("Error on generate the order", error);
      showErrorToast(
        getControlLabel,
        "noti_fail_genOrderMaterial",
        "Fail Generate Order Material",
      );
    }
  };
  const handleCalculateWriteoff = async () => {
    try {
      const result = await calculateWriteoff(
        user?.factory,
        selectRows[0]?.expect_id,
        user?.user_code,
      );
      if (result && result?.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_calculateWriteoff",
          "Success Calculate Writeoff",
        );
        await fetchAcExpectMatDByExpectId(false, null, null);
      }
    } catch (error) {
      console.log("Error on generate the order", error);
      showErrorToast(
        getControlLabel,
        "noti_fail_calculateWriteoff",
        "Fail Calculate Writeoff",
      );
    }
  };
  const handleExportShoe = async () => {
    try {
      const result = await exportExcelToShoe(
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        language,
        selectRows[0]?.expect_id,
      );
      if (result && result?.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_exportShoe",
          "Success Export Shoe",
        );
      }
    } catch (error) {
      console.log("Error on generate the order", error);
      showErrorToast(
        getControlLabel,
        "noti_fail_calculateWriteoff",
        "Fail Calculate Writeoff",
      );
    }
  };
  const handleExportWriteoff = async () => {
    try {
      const result = await exportExcelToWriteoff(
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        language,
        selectRows[0]?.expect_id,
      );
      if (result && result?.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_exportWriteoff",
          "Success Export WriteOff",
        );
      }
    } catch (error) {
      console.log("Error on generate the order", error);
      showErrorToast(
        getControlLabel,
        "noti_fail_exportWriteoff",
        "Fail Export WriteOff",
      );
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
    const responseData = await fetchAllAcExpectM(
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
      language,
      newPageSize,
      newOffset,
    );
    setData([{ tableName: "AC_EXPECT_M", data: responseData.data || [] }]);
    setHasMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectRows([responseData.data[0]]);
    }
  };
  const handleAESPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentAESPage(newPage);
    setCurrentAESPageSize(newPageSize);
    setCurrentAESOffset(newOffset);
    await fetchDataByExpectId(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.expect_id) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
  };
  const handleAEMPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentAEMPage(newPage);
    setCurrentAEMPageSize(newPageSize);
    setCurrentAEMOffset(newOffset);
    await fetchAcExpectMatDByExpectId(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.expect_id) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
  };
  const handleVADPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentVADPage(newPage);
    setCurrentVADPageSize(newPageSize);
    setCurrentVADOffset(newOffset);
    await fetchVwAcReqDByComInvoice(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.expect_id) {
      console.warn(" No master selected, skipping detail fetch");
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
    if (!selectRows.length || !selectRows[0]?.expect_id) {
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
  const createAcExpectMCallback = (fieldName) => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchFieldDropdown(
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
        console.error(`Error fetching basic data:`, error);
        return { data: [], total: 0, pageSize };
      }
    };
  };
  const createTypeCallback = () => {
    return async (page, pageSize, searchText) => {
      const staticData = [
        { code_no: "1", code_name: "1-Write‑off Estimation" },
        { code_no: "2", code_name: "2 – Receipt Reconciliation" },
        { code_no: "", code_name: "null" },
      ];
      const filtered = searchText
        ? staticData.filter(
            (d) =>
              d.code_no.includes(searchText) ||
              d.code_name.toLowerCase().includes(searchText.toLowerCase()),
          )
        : staticData;
      return { data: filtered, total: filtered.length, pageSize };
    };
  };

  const getFetchData = {
    expect_id: createAcExpectMCallback("expect_id"),
    type: createTypeCallback(),
  };

  const handleImportLink = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_0271`, "_blank");
  };
  const handleImportLink2 = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_0272`, "_blank");
  };
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
                  <DataTable
                    data={data[0]?.data}
                    tableName={"AC_EXPECT_M"}
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
                    onCheck={handleCheck}
                    onCustomExport={handleCustomExport}
                    onMaterialExport={handleMaterialExport}
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
                    getFetchData={getFetchData}
                    dropDownValues={dropdownValues}
                    setDropdownValues={setDropdownValues}
                    ref={toolbarRef}
                    onGenOrderMaterial={handleGenOrderMaterial}
                    onCalculateWriteOff={handleCalculateWriteoff}
                    onExcelShoe={handleExportShoe}
                    onExcelWriteOff={handleExportWriteoff}
                    onImportLink={handleImportLink}
                    onImportLink2={handleImportLink2}
                  />
                  <AcExpectSe
                    data={acExpectSeData}
                    setData={setAcExpectSeData}
                    setSelectAES={setSelectAES}
                    selectAES={selectAES.length > 0 ? selectAES : []}
                    setJumpToRow={setJumpToRowAcProdM}
                    jumpToRow={jumpToRowAcProdM}
                    selectRows={selectRows}
                    subAuthentication={authorization}
                    isSearch={isAPMSearch}
                    searchData={searchAPMData}
                    fetchDataByExpectID={fetchDataByExpectId}
                    rdSizeDData={rdSizeDData}
                    setRdSizeDData={setRdSizeDData}
                    selectRdSizeD={selectRdSizeD}
                    setSelectRdSizeD={setSelectRdSizeD}
                    hanldeSearchForRDSizeD={hanldeSearchForRDSizeD}
                    openSizeLink={openSizeLink}
                    setOpenSizeLink={setOpenSizeLink}
                    onOpenSizeLink={handleSizeLink}
                    onCloseSizeLink={handleSizeLinkClose}
                    onDataRSDBySize={fetchDataRSDBySize}
                    fetchAcChgDRecordFromDB={fetchAcChgDRecordFromDB}
                    totalData={totalAESData || 0}
                    onPageChange={handleAESPageChange}
                    currentOffset={currentAESOffset}
                    currentPage={currentAESPage}
                    currentPageSize={currentAESPageSize}
                    setCurrentPage={setCurrentAESPage}
                    setCurrentOffset={setCurrentAESOffset}
                    setCurrentPageSize={setCurrentAESPageSize}
                    setTotalData={setTotalAESData}
                    setSearchData={setSearchAPMData}
                    searchFilter={searchAPMFilter}
                    totalRSDData={totalRSDData || 0}
                    onRSDPageChange={handleRSDPageChange}
                    currentRSDOffset={currentRSDOffset}
                    currentRSDPage={currentRSDPage}
                    currentRSDPageSize={currentRSDPageSize}
                    setCurrentRSDPage={setCurrentRSDPage}
                    setCurrentRSDOffset={setCurrentRSDOffset}
                    setCurrentRSDPageSize={setCurrentRSDPageSize}
                    setTotalRSDData={setTotalRSDData}
                    setRSDSearchData={setSearchRSDData}
                    searchRSDFilter={searchRSDFilter}
                    hasMore={hasAESMore}
                    setHasMore={setHasAESMore}
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
                  <AcExpectMatd
                    data={acExpectMatDData}
                    setData={setAcExpectMatdData}
                    setSelectAcExpectMatd={setSelectAcExpectMatd}
                    selectAcExpectMatd={
                      selectAcExpectMatd.length > 0 ? selectAcExpectMatd : []
                    }
                    setJumpToRow={setJumpToRowAcProdM}
                    jumpToRow={jumpToRowAcProdM}
                    selectRows={selectRows}
                    subAuthentication={authorization}
                    isSearch={isAPMSearch}
                    searchData={searchAPMData}
                    fetchDataByExpectID={fetchAcExpectMatDByExpectId}
                    fetchAcChgARecordFromDB={fetchAcChgARecordFromDB}
                    totalData={totalAEMData || 0}
                    onPageChange={handleAEMPageChange}
                    currentOffset={currentAEMOffset}
                    currentPage={currentAEMPage}
                    currentPageSize={currentAEMPageSize}
                    setCurrentPage={setCurrentAEMPage}
                    setCurrentOffset={setCurrentAEMOffset}
                    setCurrentPageSize={setCurrentAEMPageSize}
                    setTotalData={setTotalACAData}
                    setSearchData={setSearchAPMData}
                    searchFilter={searchAPMFilter}
                    hasMore={hasAEMMore}
                    setHasMore={setHasAEMMore}
                  />
                </Box>
              </Box>
            </Paper>
          </Stack>
        </Container>
      </Box>
      {/* ========== MODAL/DIALOG COMPONENTS ========== */}
      <AddAcExpectM
        open={openAdd}
        onClose={handleAddClose}
        handleAdd={handleAdd}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={authorization}
      />
      <EditAcExpectM
        open={openEdit}
        onClose={handleEditClose}
        selectRows={selectRows.length > 0 ? selectRows : null}
        handleEdit={handleEditASM}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={authorization}
      />
    </>
  );
};
export default Actf270;
