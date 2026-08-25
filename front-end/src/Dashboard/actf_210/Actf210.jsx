import { useEffect, useState } from "react";
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
  exportCustomExcel,
  exportMaterialExcel,
} from "../../service/ac_imp_material_tracking/AcImpMaterialTrackingService";
import AcProdM from "../../features/bom_2/component/AcProdM";
import {
  addAcShoeM,
  editAcShoeM,
  exportExcelASM,
  fetchAllAcShoeM,
  fetchAllAcShoeMByID,
  linktoBom,
  searchASMByFilter,
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
import VwAcReqD from "../../features/actf_210/component/VwAcReqD";
import AcChgD from "../../features/actf_210/component/AcChgD";
import AcChgA from "../../features/actf_210/component/AcChgA";
import AddAcChgM from "../../features/actf_210/page/AddAcChgM";
import EditAcChgM from "../../features/actf_210/page/EditAcChgM";
import {
  fetchViewAcCM,
  searchVwChgMByFilter,
} from "../../service/vw_chg_m/vwChgM";
import {
  fetchAcChgDByID,
  fetchAllAcChgDByAcno,
} from "../../service/ac_chg_d/acChgD";
import {
  activate,
  addAcChgM,
  cancelActivate,
  close,
  confirmAll,
  editAcChgM,
  exportExcelVwChgM,
  fetchAcChgMByID,
  voidAll,
} from "../../service/ac_chg_m/acChgM";
import {
  fetchAcChgAByID,
  fetchAllAcChgAByAcno,
} from "../../service/ac_chg_a/AcChgA";
import { fetchVwAcReqDByCom } from "../../service/vw_acreq_d/vwAcreqD";
import ModifyLationPopup from "../../features/actf_210/page/ModifyLationPopup";
import ImportLinkPopup from "../../features/actf_210/page/ImportLinkPopup";
const Actf210 = () => {
  const [data, setData] = useState([]);
  const [acChgDData, setAcChgDData] = useState([]);
  const [selectAcChgD, setSelectAcChgD] = useState([]);
  const [jumpToRowAcProdM, setJumpToRowAcProdM] = useState(null);
  const [vwAcReqDData, setVwAcReqDData] = useState([]);
  const [acChgAData, setAcChgAData] = useState([]);
  const [selectVwAcReqD, setSelectVwAcReqD] = useState([]);
  const [selectAcChgA, setSelectAcChgA] = useState([]);
  const [jumpToRowAcShoeRef, setJumpToRowAcShoeRef] = useState(null);
  const [rdSizeDData, setRdSizeDData] = useState([]);
  const [selectRdSizeD, setSelectRdSizeD] = useState([]);
  const [openSizeLink, setOpenSizeLink] = useState(false);
  const [openImportLink, setOpenImportLink] = useState(false);
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
  const [totalAcCDData, setTotalAcCDData] = useState(0);
  const [totalVADData, setTotalVADData] = useState(0);
  const [totalACAData, setTotalACAData] = useState(0);
  const [totalRSDData, setTotalRSDData] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(5);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [currentAcCDPage, setCurrentAcCDPage] = useState(0);
  const [currentAcCDPageSize, setCurrentAcCDPageSize] = useState(10);
  const [currentAcCDOffset, setCurrentAcCDOffset] = useState(0);
  const [currentVADPage, setCurrentVADPage] = useState(0);
  const [currentVADPageSize, setCurrentVADPageSize] = useState(10);
  const [currentVADOffset, setCurrentVADOffset] = useState(0);
  const [currentASROffset, setCurrentASROffset] = useState(0);
  const [currentACAPage, setCurrentACAPage] = useState(0);
  const [currentACAPageSize, setCurrentACAPageSize] = useState(10);
  const [currentACAOffset, setCurrentACAOffset] = useState(0);
  const [currentRSDPage, setCurrentRSDPage] = useState(0);
  const [currentRSDPageSize, setCurrentRSDPageSize] = useState(5);
  const [currentRSDOffset, setCurrentRSDOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasAcCDMore, setHasAcCDMore] = useState(false);
  const [hasVADMore, setHasVADMore] = useState(false);
  const [hasACAMore, setHasACAMore] = useState(false);
  const [openModifyLation, setOpenModifyLation] = useState(false);
  const [isEditInCurrate, setIsEditInCurrate] = useState(true);
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
        fetchViewAcCM(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          language,
          pageSize,
          offset,
        ),
    ]);
    setData([{ tableName: "VW_CHG_M", data: combinedData[0].data }]);
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
        "ACTF_210",
        "master",
        "ac_chg_m",
      );
      const controls = await fetchTableControlTranslations("ACTF_210");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user?.factory,
        user?.department,
        user?.user_code,
        "ACTF_210",
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
  const fetchAcChgDByAcno = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    try {
      if (!selectRows || selectRows.length === 0) {
        setAcChgDData([{ tableName: "AC_CHG_D", data: [] }]);
        setSelectAcChgD([]);
        return;
      }
      const offset = shouldResetPagination
        ? 0
        : explicitOffset !== null
          ? explicitOffset
          : currentAcCDOffset;
      const pageSize =
        explicitPageSize !== null ? explicitPageSize : currentAcCDPageSize;
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const response = await fetchAllAcChgDByAcno(
        selectRows[0]?.factory_code,
        selectRows[0]?.ac_no,
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
            setTotalAcCDData(response.total);
          }
          if (shouldResetPagination) {
            setCurrentAcCDPage(0);
            setCurrentAcCDOffset(0);
          }
          childrenData = response.data.filter((child) =>
            searchData.some(
              (searchItem) =>
                searchItem.factory_code === selectedParent.factory_code &&
                searchItem.ac_no === selectedParent.ac_no &&
                searchItem.seq === child.seq,
            ),
          );
        }
        setAcChgDData([{ tableName: "AC_CHG_D", data: childrenData }]);
        setHasAcCDMore(response.hasMore);
        if (childrenData.length > 0) {
          setSelectAcChgD([childrenData[0]]);
        } else {
          setSelectAcChgD([]);
        }
      }
    } catch (error) {
      console.error(" Error fetching AC_PROD_M by shoe:", error);
      showErrorToast(getControlLabel, "noti_load_fail", "Fail to load data");
    }
  };
  const fetchAcChgAByAcno = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    try {
      if (!selectRows || selectRows.length === 0) {
        setAcChgAData([{ tableName: "AC_CHG_A", data: [] }]);
        setSelectAcChgA([]);
        return;
      }
      const offset = shouldResetPagination
        ? 0
        : explicitOffset !== null
          ? explicitOffset
          : currentACAOffset;
      const pageSize =
        explicitPageSize !== null ? explicitPageSize : currentACAPageSize;
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const response = await fetchAllAcChgAByAcno(
        selectRows[0]?.factory_code,
        selectRows[0]?.ac_no,
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
            setTotalACAData(response.total);
          }
          if (shouldResetPagination) {
            setCurrentACAPage(0);
            setCurrentACAOffset(0);
          }
          childrenData = response.data.filter((child) =>
            searchData.some(
              (searchItem) =>
                searchItem.factory_code === selectedParent.factory_code &&
                searchItem.ac_no === selectedParent.ac_no &&
                searchItem.seq === child.seq,
            ),
          );
        }
        setAcChgAData([{ tableName: "AC_CHG_A", data: childrenData }]);
        setHasACAMore(response.hasMore);
        if (childrenData.length > 0) {
          setSelectAcChgA([childrenData[0]]);
        } else {
          setSelectAcChgA([]);
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
                searchItem.ac_no === selectedParent.ac_no &&
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
      const response = await fetchAcChgMByID(
        selectRows[0]?.factory_code,
        selectRows[0]?.ac_no,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };
  const fetchAcChgDRecordFromDB = async (record) => {
    try {
      const response = await fetchAcChgDByID(
        selectAcChgD[0]?.factory_code,
        selectAcChgD[0]?.ac_no,
        selectAcChgD[0]?.seq,
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
        selectAcChgA[0]?.factory_code,
        selectAcChgA[0]?.ac_no,
        selectAcChgA[0]?.seq,
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
        selectVwAcReqD[0]?.ac_no,
        selectVwAcReqD[0]?.prod_no,
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
          const currentKey = `${currentSelection.factory_code}-${currentSelection.ac_no}`;
          const foundRecord = response.data.find(
            (item) => `${item.factory_code}-${item.ac_no}` === currentKey,
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

      const responseData = await fetchViewAcCM(
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        language,
        currentPageSize,
        currentOffset,
      );
      if (responseData && responseData.data) {
        setData([{ tableName: "VW_CHG_M", data: responseData.data }]);
        setHasMore(responseData?.hasMore);
        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${currentSelection.ac_no}`;
          const updatedRecord = responseData.data.find(
            (item) => `${item.factory_code}-${item.ac_no}` === currentKey,
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
            expire_date,
            issued_date,
            vend_no,
            vend_noname,
            last_edate,
            org_taxnm,
            grt_deptname,
            grt_username,
            last_username,
            currnm,
            d_type_name,
            stoc_type_name,
            ...finalLock
          } = unlockData;
          await editAcChgM(
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
      console.log("before check", freshRecord);

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
      //When detail data is not null, check if there is any data with status > 0
      if (acChgDData && acChgDData[0]?.data.length > 0) {
        const flag = acChgDData[0]?.data.find((item) => {
          if (item?.status > 0) {
            return item;
          }
        });
        if (flag !== null && flag !== undefined) {
          setIsEditInCurrate(false);
        } else {
          setIsEditInCurrate(true);
        }
      } else {
        setIsEditInCurrate(true);
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
  const handleOpenModifyLation = () => {
    setOpenModifyLation(true);
  };
  const handleCloseModifyLation = () => setOpenModifyLation(false);
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
      ac_type: "1",
      status: 1,
    };
    try {
      const response = await addAcChgM(
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
        const responseData = await fetchViewAcCM(
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
            tableName: "VW_CHG_M",
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
      console.log(`${error.response?.data?.message}`);
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
        stoc_type_name,
        ...cleanData
      } = updateRow;
      if (!skipTimestamp) {
        cleanData.last_user = user.user_code;
        cleanData.last_date = new Date().toISOString();
      }
      const result = await editAcChgM(
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

            const responseData = await fetchViewAcCM(
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
                  tableName: "VW_CHG_M",
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
    {
      try {
        const res = await activate(
          user?.factory,
          user?.user_code,
          selectRows[0]?.ac_no,
          selectRows[0]?.curr_rate || 1,
          language,
        );
        if (res && res.success) {
          try {
            const result = await confirmAll(
              user?.factory,
              user?.department,
              user?.user_code,
              authorization?.find((item) => item.field === "query_level")
                ?.title,
              selectRows[0]?.ac_no,
            );
            if (result && result.success) {
              await Promise.all([
                fetchAcChgDByAcno(true),
                fetchAcChgAByAcno(true),
                fetchVwAcReqDByComInvoice(true),
              ]);
            }
          } catch (error) {
            console.log("error in fetch confirm all", error);
            showErrorToast(getControlLabel, "noti_fail_confirm", error.message);
          }
        }
      } catch (error) {
        console.log("error in activate", error);
        showErrorToast(getControlLabel, "noti_fail_confirm", error.message);
      }
    }
  };
  const handleSaveModifyLation = async (e) => {
    e.preventDefault();
    const lation = e.target.lation.value;
    await handleEditASM({ ...selectRows[0], lation });
    await handleCancel();
    handleCloseModifyLation();
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
      const response = await searchVwChgMByFilter(
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
          setData([{ tableName: "VW_CHG_M", data: response.data }]);
          setHasMore(false);
        } else {
          setSelectRows([response.data[0]]);
          if (offset === 0 && response.data.length > 0) {
            setTotalData(response.total);
          }
          setData([{ tableName: "VW_CHG_M", data: response.data }]);
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
          setAcChgDData([{ tableName: "RD_SIZE_D", data: response.data }]);
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
      await handleStatusChange("confirm", [1, 2], handleUpdateConfirm);
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
          selectRows[0]?.ac_no,
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
        await close(user?.factory, selectRows[0]?.ac_no, user?.user_code);
      });
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_close", error.message);
    }
  };

  const handleCancel = async () => {
    await handleStatusChange("cancel", [1, 2], async () => {
      try {
        await voidAll(
          user?.factory,
          selectRows[0]?.ac_no,
          user?.user_code,
          language,
        );
      } catch (error) {
        setOpenModifyLation(true);
        throw error;
      }
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
    const responseData = await fetchViewAcCM(
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
      language,
      newPageSize,
      newOffset,
    );
    setData([{ tableName: "VW_CHG_M", data: responseData.data || [] }]);
    setHasMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectRows([responseData.data[0]]);
    }
  };
  const handleAcCDPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentAcCDPage(newPage);
    setCurrentAcCDPageSize(newPageSize);
    setCurrentAcCDOffset(newOffset);
    await fetchAcChgDByAcno(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.ac_no) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
  };
  const handleACAPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentACAPage(newPage);
    setCurrentACAPageSize(newPageSize);
    setCurrentACAOffset(newOffset);
    await fetchAcChgAByAcno(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.ac_no) {
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
    if (!selectRows.length || !selectRows[0]?.ac_no) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
  };
  const handleASRPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentVADPage(newPage);
    setCurrentVADPageSize(newPageSize);
    setCurrentASROffset(newOffset);

    await fetchAcShoeRefByShoe(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.ac_no) {
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
    if (!selectRows.length || !selectRows[0]?.ac_no) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
  };

  const handleOpenImportLink = () => {
    setOpenImportLink(true);
  };
  const handleCloseImportLink = () => {
    setOpenImportLink(false);
  };
  const handleImportLink = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_2181`, "_blank");
  };
  const handleImportLink1 = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_2182`, "_blank");
  };
  const handleImportLink2 = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_2191`, "_blank");
  };
  const handleImportLink3 = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_2201`, "_blank");
  };
  const handleImportLink4 = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_2203`, "_blank");
  };
  const handleImportLink5 = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_2192`, "_blank");
  };
  const handleImportLink6 = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_2200`, "_blank");
  };
  const handleImportLink7 = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_2201`, "_blank");
  };
  const handleImportLink8 = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_2203`, "_blank");
  };
  //  const handleImportLink9 = () => {
  //   window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_231`, "_blank");
  // };
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
                  <Typography
                    variant="h5"
                    textAlign={"center"}
                    fontWeight={"bold"}
                  >
                    {/*  {getControlLabel("ttl_table_m", "VW_CHG_M")}*/}
                  </Typography>
                  <DataTable
                    data={data[0]?.data}
                    tableName={"VW_CHG_M"}
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
                    onImportLink={handleOpenImportLink}
                  />
                  <AcChgD
                    data={acChgDData}
                    setData={setAcChgDData}
                    setSelectAcChgD={setSelectAcChgD}
                    selectAcChgD={selectAcChgD.length > 0 ? selectAcChgD : []}
                    setJumpToRow={setJumpToRowAcProdM}
                    jumpToRow={jumpToRowAcProdM}
                    selectRows={selectRows}
                    subAuthentication={authorization}
                    isSearch={isAPMSearch}
                    searchData={searchAPMData}
                    fetchDataByAcNo={fetchAcChgDByAcno}
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
                    totalData={totalAcCDData || 0}
                    onPageChange={handleAcCDPageChange}
                    currentOffset={currentAcCDOffset}
                    currentPage={currentAcCDPage}
                    currentPageSize={currentAcCDPageSize}
                    setCurrentPage={setCurrentAcCDPage}
                    setCurrentOffset={setCurrentAcCDOffset}
                    setCurrentPageSize={setCurrentAcCDPageSize}
                    setTotalData={setTotalAcCDData}
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
                    hasMore={hasAcCDMore}
                    setHasMore={setHasAcCDMore}
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
                  <AcChgA
                    data={acChgAData}
                    setData={setAcChgAData}
                    setSelectAcChgA={setSelectAcChgA}
                    selectAcChgA={selectAcChgA.length > 0 ? selectAcChgA : []}
                    setJumpToRow={setJumpToRowAcProdM}
                    jumpToRow={jumpToRowAcProdM}
                    selectRows={selectRows}
                    subAuthentication={authorization}
                    isSearch={isAPMSearch}
                    searchData={searchAPMData}
                    fetchDataByAcNo={fetchAcChgAByAcno}
                    fetchAcChgARecordFromDB={fetchAcChgARecordFromDB}
                    totalData={totalACAData || 0}
                    onPageChange={handleACAPageChange}
                    currentOffset={currentACAOffset}
                    currentPage={currentACAPage}
                    currentPageSize={currentACAPageSize}
                    setCurrentPage={setCurrentACAPage}
                    setCurrentOffset={setCurrentACAOffset}
                    setCurrentPageSize={setCurrentACAPageSize}
                    setTotalData={setTotalACAData}
                    setSearchData={setSearchAPMData}
                    searchFilter={searchAPMFilter}
                    hasMore={hasACAMore}
                    setHasMore={setHasACAMore}
                  />
                  <VwAcReqD
                    data={vwAcReqDData}
                    setData={setVwAcReqDData}
                    setSelectVwAcReqD={setSelectVwAcReqD}
                    selectVwAcReqD={
                      selectVwAcReqD.length > 0 ? selectVwAcReqD : []
                    }
                    setJumpToRow={setJumpToRowAcProdM}
                    jumpToRow={jumpToRowAcProdM}
                    selectRows={selectRows}
                    subAuthentication={authorization}
                    isSearch={isAPMSearch}
                    searchData={searchAPMData}
                    fetchDataByComInvoice={fetchVwAcReqDByComInvoice}
                    totalData={totalVADData || 0}
                    onPageChange={handleVADPageChange}
                    currentOffset={currentVADOffset}
                    currentPage={currentVADPage}
                    currentPageSize={currentVADPageSize}
                    setCurrentPage={setCurrentVADPage}
                    setCurrentOffset={setCurrentVADOffset}
                    setCurrentPageSize={setCurrentVADPageSize}
                    setTotalData={setTotalVADData}
                    setSearchData={setSearchAPMData}
                    searchFilter={searchAPMFilter}
                    hasMore={hasVADMore}
                    setHasMore={setHasVADMore}
                  />
                </Box>
              </Box>
            </Paper>
          </Stack>
        </Container>
      </Box>
      {/* ========== MODAL/DIALOG COMPONENTS ========== */}
      <AddAcChgM
        open={openAdd}
        onClose={handleAddClose}
        handleAdd={handleAdd}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={authorization}
        language={language}
      />
      <EditAcChgM
        open={openEdit}
        onClose={handleEditClose}
        selectedRow={selectRows.length > 0 ? selectRows[0] : null}
        handleEdit={handleEditASM}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={authorization}
        isEditInCurrate={isEditInCurrate}
        language={language}
      />
      <ModifyLationPopup
        openLink={openModifyLation}
        onClose={handleCloseModifyLation}
        getControlLabel={getControlLabel}
        onSave={handleSaveModifyLation}
      />
      <ImportLinkPopup
        openLink={openImportLink}
        onClose={handleCloseImportLink}
        onImportLink={handleImportLink}
        onImportLink1={handleImportLink1}
        onImportLink2={handleImportLink2}
        onImportLink3={handleImportLink3}
        onImportLink4={handleImportLink4}
        onImportLink5={handleImportLink5}
        onImportLink6={handleImportLink6}
        onImportLink7={handleImportLink7}
        onImportLink8={handleImportLink8}
        //    onImportLink9={handleImportLink9}
        getControlLabel={getControlLabel}
        selectRows={data[0]?.data?.length > 0 ? data[0]?.data : []}
      />
    </>
  );
};
export default Actf210;
