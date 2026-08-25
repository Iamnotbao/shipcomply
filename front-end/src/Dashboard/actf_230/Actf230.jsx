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

import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import { fetchTablePermission } from "../../service/users_permission/UsersPermission";
import {
  exportCustomExcel,
  exportMaterialExcel,
} from "../../service/ac_imp_material_tracking/AcImpMaterialTrackingService";
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
import VwAcReqD from "../../features/actf_230/component/VwAcReqD";
import AcChgD from "../../features/actf_230/component/AcChgD";
import AcChgA from "../../features/actf_230/component/AcDescChg";
import AddAcChgM from "../../features/actf_230/page/AddAcChgM";
import EditAcChgM from "../../features/actf_230/page/EditAcChgM";
import {
  copyShoe,
  fetchAcChgDByID,
  fetchAllAcChgDExpByAcno,
  refreshPrice,
  refreshSeq,
} from "../../service/ac_chg_d/acChgD";
import {
  activate,
  activateExp,
  addAcChgM,
  cancelActivate,
  cancelActivateExp,
  close,
  confirmAll,
  confirmPassDate,
  editAcChgM,
  exportExcelToTransfer,
  exportExcelVwChgM,
  fetchAcChgMByID,
  pdfItemDetails,
  pdfToChgD,
  refreshGrossW,
  voidAll,
  voidAllExp,
} from "../../service/ac_chg_m/acChgM";
import { fetchVwAcReqDByCom } from "../../service/vw_acreq_d/vwAcreqD";
import {
  fetchVCE,
  searchVwChgExpByFilter,
} from "../../service/vw_chg_exp/vwChgExp";
import ConfirmPDPopup from "../../features/actf_230/page/ConfirmPD";
import PlanShipDate from "../../features/actf_230/page/PlanShipDate";
import { get, set } from "react-hook-form";
import {
  checkBox,
  clearTempTable,
  confirmAllPD,
  deletePlanOrd,
  fetchAllPlanOrd,
  getTempTable,
  searchPlanOrdFilter,
} from "../../service/plan_ord/planOrd";
import ReportPopup from "../../features/actf_230/page/ReportPopup";
import ModifyLationPopup from "../../features/actf_230/page/ModifyLationPopup";
import AcDescChg from "../../features/actf_230/component/AcDescChg";
import {
  fetchAllAcDescChgByAcno,
  fetchAcDescChgByID,
} from "../../service/ac_desc_chg/acDescChg";
import AcPlanOrd from "../../features/actf_230/component/AcPlanOrd";
import { fetchAllAcPlanOrd } from "../../service/ac_plan_ord/acPlanOrd";
import AcPlanSize from "../../features/actf_230/component/AcPlanSize";
import {
  editAcPlanSize,
  fetchAllAcPlanSize,
  updateProdAcno,
} from "../../service/ac_plan_size/acSizePlan";
import AcPlanPack from "../../features/actf_230/component/AcPlanPack";
import { fetchAllAcPlanPack } from "../../service/ac_plan_pack/acPlanPack";
import ImportLinkPopup from "../../features/actf_230/page/ImportLinkPopup";
const Actf230 = () => {
  const [data, setData] = useState([]);
  const [acChgDData, setAcChgDData] = useState([]);
  const [acPlanOrdData, setAcPlanOrdData] = useState([]);
  const [openDelete, setOpenDelete] = useState(false);
  const [acPlanSizeData, setAcPlanSizeData] = useState([]);
  const [acPlanPackData, setAcPlanPackData] = useState([]);
  const [pDData, setPDData] = useState([]);
  const [selectAcPlanSize, setSelectAcPlanSize] = useState([]);
  const [selectAcPlanPack, setSelectAcPlanPack] = useState([]);
  const [selectAcChgD, setSelectAcChgD] = useState([]);
  const [jumpToRowAcChgD, setJumpToRowAcChgD] = useState(null);
  const [jumpToRowAcProdM, setJumpToRowAcProdM] = useState(null);
  const [vwAcReqDData, setVwAcReqDData] = useState([]);
  const [acChgAData, setAcChgAData] = useState([]);
  const [selectVwAcReqD, setSelectVwAcReqD] = useState([]);
  const [selectAcChgA, setSelectAcChgA] = useState([]);
  const [selectAcPlanOrd, setSelectAcPlanOrd] = useState([]);
  const [jumpToRowAcShoeRef, setJumpToRowAcShoeRef] = useState(null);
  const [jumpToRowAcPlanOrd, setJumpToRowAcPlanOrd] = useState(null);
  const [jumpToRowAcPlanSize, setJumpToRowAcPlanSize] = useState(null);
  const [jumpToRowAcPlanPack, setJumpToRowAcPlanPack] = useState(null);
  const [rdSizeDData, setRdSizeDData] = useState([]);
  const [selectRdSizeD, setSelectRdSizeD] = useState([]);
  const [openSizeLink, setOpenSizeLink] = useState(false);
  const [isLoadingBom, setIsLoadingBom] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [searchFilter, setSearchFilter] = useState({});
  const [isAPOSearch, setIsAPOSearch] = useState(false);
  const [searchAPOData, setSearchAPOData] = useState([]);
  const [searchAPOFilter, setSearchAPOFilter] = useState({});
  const [isAPMSearch, setIsAPMSearch] = useState(false);
  const [searchAPMData, setSearchAPMData] = useState([]);
  const [searchAPMFilter, setSearchAPMFilter] = useState(null);
  const [isASRSearch, setIsASRSearch] = useState(false);
  const [searchASRData, setSearchASRData] = useState([]);
  const [searchASRFilter, setSearchASRFilter] = useState(null);
  const [isPDSearch, setIsPDSearch] = useState(false);
  const [searchPDData, setSearchPDData] = useState([]);
  const [searchPDFilter, setSearchPDFilter] = useState(null);
  const [isRSDSearch, setIsRSDSearch] = useState(false);
  const [searchRSDData, setSearchRSDData] = useState([]);
  const [searchRSDFilter, setSearchRSDFilter] = useState(null);
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openConfirmPD, setOpenConfirmPD] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [openGenegrateGC, setOpenGenegrateGC] = useState(false);
  const [selectRow, setSelectRow] = useState(null);
  const [selectRows, setSelectRows] = useState([]);
  const [openPD, setOpenPD] = useState(false);
  const [openImportLink, setOpenImportLink] = useState(false);
  const [selectPD, setSelectPD] = useState([]);
  const [selectCheckPD, setSelectCheckPD] = useState([]);
  const [jumpToRowPD, setJumpToRowPD] = useState(null);
  const [authorization, setAuthorizations] = useState([]);
  const [filter, setFilter] = useState("");
  const [file, setFile] = useState(null);
  const [jumpToRow, setJumpToRow] = useState(null);
  const [totalData, setTotalData] = useState(0);
  const [totalAcCDData, setTotalAcCDData] = useState(0);
  const [totalVADData, setTotalVADData] = useState(0);
  const [totalACAData, setTotalACAData] = useState(0);
  const [totalRSDData, setTotalRSDData] = useState(0);
  const [totalAPOData, setTotalAPOData] = useState(0);
  const [totalAPSData, setTotalAPSData] = useState(0);
  const [totalAPPData, setTotalAPPData] = useState(0);
  // const [totalAPMData, setTotalAPSData] = useState(0);
  const [totalPDData, setTotalPDData] = useState(0);
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
  const [currentACAPageSize, setCurrentACAPageSize] = useState(3);
  const [currentACAOffset, setCurrentACAOffset] = useState(0);
  const [currentRSDPage, setCurrentRSDPage] = useState(0);
  const [currentRSDPageSize, setCurrentRSDPageSize] = useState(5);
  const [currentRSDOffset, setCurrentRSDOffset] = useState(0);
  const [currentPDPage, setCurrentPDPage] = useState(0);
  const [currentPDPageSize, setCurrentPDPageSize] = useState(5);
  const [currentPDOffset, setCurrentPDOffset] = useState(0);
  const [currentAPOPage, setCurrentAPOPage] = useState(0);
  const [currentAPOPageSize, setCurrentAPOPageSize] = useState(3);
  const [currentAPOOffset, setCurrentAPOOffset] = useState(0);
  const [currentAPSPage, setCurrentAPSPage] = useState(0);
  const [currentAPSPageSize, setCurrentAPSPageSize] = useState(3);
  const [currentAPSOffset, setCurrentAPSOffset] = useState(0);
  const [currentAPPPage, setCurrentAPPPage] = useState(0);
  const [currentAPPPageSize, setCurrentAPPPageSize] = useState(3);
  const [currentAPPOffset, setCurrentAPPOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasAcCDMore, setHasAcCDMore] = useState(false);
  const [hasVADMore, setHasVADMore] = useState(false);
  const [hasACAMore, setHasACAMore] = useState(false);
  const [hasPDMore, setHasPDMore] = useState(false);
  const [hasAPOMore, setHasAPOMore] = useState(false);
  const [hasAPSMore, setHasAPSMore] = useState(false);
  const [hasAPPMore, setHasAPPMore] = useState(false);
  const [selectionsVersion, setSelectionsVersion] = useState(0);
  const [isEditInCurrate, setIsEditInCurrate] = useState(true);
  const [openModifyLation, setOpenModifyLation] = useState(false);
  const [openGenegratePM, setOpenGenegratePM] = useState(false);
  const [totalImportData, setTotalImportData] = useState(0);
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
        fetchVCE(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          language,
          pageSize,
          offset,
        ),
    ]);
    setData([{ tableName: "VW_CHG_EXP", data: combinedData[0].data }]);
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
      const controls = await fetchTableControlTranslations("ACTF_230");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user?.factory,
        user?.department,
        user?.user_code,
        "ACTF_230",
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
      const response = await fetchAllAcChgDExpByAcno(
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
        setAcChgAData([{ tableName: "AC_DESC_CHG", data: [] }]);
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
      const response = await fetchAllAcDescChgByAcno(
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
        setAcChgAData([{ tableName: "AC_DESC_CHG", data: childrenData }]);
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
  const fetchAcPlanOrdByAcno = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    try {
      if (!selectRows || selectRows.length === 0) {
        setAcPlanOrdData([{ tableName: "AC_PLAN_ORD", data: [] }]);
        setSelectAcPlanOrd([]);
        return;
      }
      const offset = shouldResetPagination
        ? 0
        : explicitOffset !== null
          ? explicitOffset
          : currentAPOOffset;
      const pageSize =
        explicitPageSize !== null ? explicitPageSize : currentAPOPageSize;
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const response = await fetchAllAcPlanOrd(
        user?.access_token,
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
            setTotalAPOData(response.total);
          }
          if (shouldResetPagination) {
            setCurrentAPOPage(0);
            setCurrentAPOOffset(0);
          }
          childrenData = response.data.filter((child) =>
            searchData.some(
              (searchItem) =>
                searchItem.factory_code === selectedParent.factory_code &&
                searchItem.ac_no === selectedParent.ac_no &&
                searchItem.se_id === child.se_id &&
                searchItem.se_seq === child.se_seq &&
                parseFloat(searchItem.se_ver).toFixed(2) ===
                  parseFloat(child.se_ver).toFixed(2) &&
                parseFloat(searchItem.pack_gu).toFixed(2) ===
                  parseFloat(child.pack_gu).toFixed(2) &&
                parseFloat(searchItem.ship_seq).toFixed(2) ===
                  parseFloat(child.ship_seq).toFixed(2),
            ),
          );
        }
        setAcPlanOrdData([{ tableName: "AC_PLAN_ORD", data: childrenData }]);
        setHasAPOMore(response.hasMore);
        if (childrenData.length > 0) {
          setSelectAcPlanOrd([childrenData[0]]);
          setJumpToRowAcPlanOrd(childrenData[0]);
        } else {
          setSelectAcPlanOrd([]);
          setJumpToRowAcPlanOrd(null);
        }
      }
    } catch (error) {
      console.error(" Error fetching AC_PROD_M by shoe:", error);
      showErrorToast(getControlLabel, "noti_load_fail", "Fail to load data");
    }
  };
  const fetchAcPlanSizeByAcno = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
    preserveSelection = null,
  ) => {
    try {
      if (!selectRows || selectRows.length === 0) {
        setAcPlanSizeData([{ tableName: "AC_PLAN_SIZE", data: [] }]);
        setSelectAcPlanSize([]);
        return;
      }
      const offset = shouldResetPagination
        ? 0
        : explicitOffset !== null
          ? explicitOffset
          : currentAPOOffset;
      const pageSize =
        explicitPageSize !== null ? explicitPageSize : currentAPSPageSize;
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const response = await fetchAllAcPlanSize(
        user?.access_token,
        selectRows[0]?.factory_code,
        user.department,
        user.user_code,
        allow || "1",
        language,
        pageSize,
        offset,
        selectAcPlanOrd[0]?.ac_no,
        selectAcPlanOrd[0]?.se_id,
        selectAcPlanOrd[0]?.se_seq,
        selectAcPlanOrd[0]?.se_ver,
        selectAcPlanOrd[0]?.pack_gu,
        selectAcPlanOrd[0]?.ship_seq,
      );
      if (response && response.data) {
        let childrenData = response.data;
        if (isSearch && searchData.length > 0) {
          const selectedParent = selectRows[0];
          if (response.total !== undefined && response.total !== null) {
            setTotalAPOData(response.total);
          }
          if (shouldResetPagination) {
            setCurrentAPSPage(0);
            setCurrentAPSOffset(0);
          }
          childrenData = response.data.filter((child) =>
            searchData.some(
              (searchItem) =>
                searchItem.factory_code === selectedParent.factory_code &&
                searchItem.ac_no === selectedParent.ac_no &&
                searchItem.se_id === child.se_id &&
                searchItem.se_seq === child.se_seq &&
                parseFloat(searchItem.se_ver).toFixed(2) ===
                  parseFloat(child.se_ver).toFixed(2) &&
                parseFloat(searchItem.pack_gu).toFixed(2) ===
                  parseFloat(child.pack_gu).toFixed(2) &&
                parseFloat(searchItem.ship_seq).toFixed(2) ===
                  parseFloat(child.ship_seq).toFixed(2) &&
                searchItem.size_no === child.size_no,
            ),
          );
        }
        setAcPlanSizeData([{ tableName: "AC_PLAN_SIZE", data: childrenData }]);
        setHasAPSMore(response.hasMore);
        if (childrenData.length > 0) {
          const targetRecord = preserveSelection
            ? childrenData.find(
                (item) =>
                  `${item.factory_code}-${item.ac_no}-${item.se_id}-${item.se_seq}-${item.size_no}` ===
                  `${preserveSelection.factory_code}-${preserveSelection.ac_no}-${preserveSelection.se_id}-${preserveSelection.se_seq}-${preserveSelection.size_no}`,
              ) || childrenData[0]
            : childrenData[0];

          setSelectAcPlanSize([targetRecord]);
          setJumpToRowAcPlanSize(targetRecord);
        }
      }
    } catch (error) {
      console.error("Error fetching AC_PROD_M by shoe:", error);
      showErrorToast(getControlLabel, "noti_load_fail", "Fail to load data");
    }
  };
  const fetchAcPlanPackByAcno = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    try {
      if (!selectRows || selectRows.length === 0) {
        setAcPlanPackData([{ tableName: "AC_PLAN_PACK", data: [] }]);
        setSelectAcPlanPack([]);
        return;
      }
      const offset = shouldResetPagination
        ? 0
        : explicitOffset !== null
          ? explicitOffset
          : currentAPPOffset;
      const pageSize =
        explicitPageSize !== null ? explicitPageSize : currentAPPPageSize;
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const response = await fetchAllAcPlanPack(
        user?.access_token,
        selectRows[0]?.factory_code,
        user.department,
        user.user_code,
        allow || "1",
        language,
        pageSize,
        offset,
        selectAcPlanOrd[0]?.ac_no,
        selectAcPlanOrd[0]?.se_id,
        selectAcPlanOrd[0]?.se_seq,
        selectAcPlanOrd[0]?.se_ver,
        selectAcPlanOrd[0]?.pack_gu,
        selectAcPlanOrd[0]?.ship_seq,
      );

      if (response && response.data) {
        let childrenData = response.data;
        if (isSearch && searchData.length > 0) {
          const selectedParent = selectRows[0];
          if (response.total !== undefined && response.total !== null) {
            setTotalAPPData(response.total);
          }
          if (shouldResetPagination) {
            setCurrentAPPPage(0);
            setCurrentAPPOffset(0);
          }
          childrenData = response.data.filter((child) =>
            searchData.some(
              (searchItem) =>
                searchItem.factory_code === selectedParent.factory_code &&
                searchItem.ac_no === selectedParent.ac_no &&
                searchItem.se_id === child.se_id &&
                searchItem.se_seq === child.se_seq &&
                parseFloat(searchItem.se_ver).toFixed(2) ===
                  parseFloat(child.se_ver).toFixed(2) &&
                parseFloat(searchItem.pack_gu).toFixed(2) ===
                  parseFloat(child.pack_gu).toFixed(2) &&
                parseFloat(searchItem.ship_seq).toFixed(2) ===
                  parseFloat(child.ship_seq).toFixed(2) &&
                parseFloat(searchItem.pk_seq).toFixed(2) ===
                  parseFloat(child.pk_seq).toFixed(2),
            ),
          );
        }
        setAcPlanPackData([{ tableName: "AC_PLAN_PACK", data: childrenData }]);
        setHasAPPMore(response.hasMore);
        if (childrenData.length > 0) {
          setSelectAcPlanPack([childrenData[0]]);
          setJumpToRowAcPlanPack(childrenData[0]);
        } else {
          setSelectAcPlanPack([]);
          setJumpToRowAcPlanPack(null);
        }
      }
    } catch (error) {
      console.error("Error fetching AC_PROD_M by shoe:", error);
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
      const response = await fetchAcDescChgByID(
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

      const response = await searchVwChgExpByFilter(
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

      const responseData = await fetchVCE(
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        language,
        currentPageSize,
        currentOffset,
      );
      if (responseData && responseData.data) {
        setData([{ tableName: "VW_CHG_EXP", data: responseData.data }]);
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
  const handleCheckBoxAll = async (isChecked) => {
    const allData = pDData[0]?.data || [];
    const result = await checkBox(
      user?.access_token,
      selectRows[0]?.ac_no,
      null,
      null,
      null,
      null,
      null,
      isChecked ? "Y" : "N",
      searchPDFilter?.search || {},
      user?.factory,
      true,
    );

    setSelectCheckPD(isChecked ? result?.data?.items : []);
    setSelectPD(isChecked ? result?.data?.items : [result?.data?.items[0]]);
  };
  const handleCheckBoxChange = async (rows, uncheckedRow = null) => {
    const normalizedRows = Array.isArray(rows) ? rows : rows ? [rows] : [];
    let targetRow;
    if (uncheckedRow) {
      targetRow = uncheckedRow;
    } else if (normalizedRows.length > 0) {
      targetRow = normalizedRows[normalizedRows.length - 1];
    } else {
      targetRow = selectCheckPD[0];
    }
    setSelectPD(normalizedRows);
    setSelectCheckPD(normalizedRows);
    setJumpToRowPD(targetRow);
    await handleCheckBox(normalizedRows, targetRow);
  };
  const handleCheckBox = async (rows, targetRow) => {
    const normalizedRows = Array.isArray(rows) ? rows : rows ? [rows] : [];

    if (!targetRow) {
      return { success: false, message: "No target row found" };
    }

    const isTargetRowChecked = normalizedRows.some(
      (r) =>
        `${r.factory_code}-${r.se_id}-${r.se_seq}-${r.ship_seq}-${r.pack_gu}` ===
        `${targetRow.factory_code}-${targetRow.se_id}-${targetRow.se_seq}-${targetRow.ship_seq}-${targetRow.pack_gu}`,
    );

    const rowKey = `${targetRow.factory_code}-${targetRow.se_id}-${targetRow.se_seq}-${targetRow.ship_seq}-${targetRow.pack_gu}`;

    if (!isTargetRowChecked) {
      // ────────────────────────────────────
      // CASE 1: UNCHECK
      // ────────────────────────────────────

      const filteredChecked = selectCheckPD.filter(
        (row) =>
          `${row.factory_code}-${row.se_id}-${row.se_seq}-${row.ship_seq}-${row.pack_gu}` !==
          rowKey,
      );
      setSelectCheckPD(filteredChecked);
      setSelectPD(selectCheckPD);
      try {
        const result = await checkBox(
          user?.access_token,
          selectRows[0]?.ac_no,
          targetRow?.se_id,
          targetRow?.se_seq,
          targetRow?.ship_seq,
          targetRow?.se_ver,
          targetRow?.pack_gu,
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
          selectRows[0]?.ac_no,
          targetRow?.se_id,
          targetRow?.se_seq,
          targetRow?.ship_seq,
          targetRow?.se_ver,
          targetRow?.pack_gu,
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
  const handleTransfer = async () => {
    try {
      const result = await confirmAllPD(
        user?.access_token,
        user?.factory,
        selectRows[0]?.ac_no,
        language,
        selectRows[0]?.cont_no,
        selectRows[0]?.status,
      );
      if (result.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_transfer",
          "Success Transfer!",
        );
      if (selectRows.length === 1) {
        const record = selectRows[0];
        if (record?.locked_information === user?.clientInfo) {
          // Lấy bản mới nhất từ DB — vì confirmPlanOrd vừa chạy xong,
          // peice/gross/sum_qty/sum_money/tax ở đây là giá trị ĐÚNG vừa tính lại
          const freshRecord = await fetchRecordFromDB(record);
          const unlockData = {
            ...freshRecord,
            locked_information: null,
          };
          const {
            FACTORY,
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
            ac_type_name,
            sort_name,
            typenm,
            port_name,
            pay_name,
            curr_name,
            status_name,
            se_id,
            ship_seq,
            country_nm,
            trade_name,
            // KHÔNG loại peice, gross, sum_qty, sum_money, tax nữa
            // vì giờ nó lấy từ freshRecord (DB), không phải state cũ
            ...finalLock
          } = unlockData;
          await editAcChgM(
            user?.access_token,
            user?.factory,
            user?.department,
            user?.user_code,
            authorization?.find((item) => item.field === "query_level")
              ?.title,
            currentPageSize,
            finalLock,
            "2",
          );
        }
      }

        const newData = await fetchAllPlanOrd(
          user?.access_token,
          user?.factory,
          user?.department,
          user?.user_code,
          authorization?.find((item) => item.field === "query_level")?.title ||
            "1",
          language,
          "10",
          "0",
        );
        setPDData([{ tableName: "PLAN_ORD", data: newData?.data }]);
        setSelectPD([newData?.data[0]]);
        await fetchAcChgDByAcno(false, null, null);
        await fetchAcPlanOrdByAcno(false, null, null);
        await fetchAcPlanSizeByAcno(false, null, null);
        await fetchAcPlanPackByAcno(false, null, null);
        await refreshCurrentData();
      }
    } catch (error) {
      console.log("err", error);
      showErrorToast(getControlLabel, "noti_fail_transfer_1", error.message);
    }
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
            ac_type_name,
            sort_name,
            typenm,
            port_name,
            pay_name,
            curr_name,
            status_name,
            se_id,
            ship_seq,
            country_nm,
            trade_name,
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
            "2",
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
  const handleOpenAdd = () => {
    const allowAdd = authorization?.find(
      (item) => item.field === "allow_add",
    )?.title;
    if (user?.user_code !== "admin" && allowAdd === "N") {
      return;
    }
    setOpenAdd(true);
  };
  const handleOpenConfirmPD = () => {
    if (selectRows.length === 0) {
      showErrorToast(
        getControlLabel,
        "noti_fail_parent_status",
        "Please choose master row!",
      );
      return;
    }
    if (selectRows[0].status !== 1) {
      showErrorToast(
        getControlLabel,
        "noti_fail_parent_status",
        "Please change the status of master row!",
      );
      return;
    }
    setOpenConfirmPD(true);
  };
  const handleCloseConfirmPD = () => {
    setOpenConfirmPD(false);
  };
  const handleOpenReport = () => {
    setOpenReport(true);
  };
  const handleCloseReport = () => {
    setOpenReport(false);
  };
  const handleOpenPD = async () => {
    if (selectRows.length === 0) {
      showErrorToast(
        getControlLabel,
        "noti_fail_parent_status",
        "Please choose master row!",
      );
      return;
    }
    if (selectRows[0].status !== 1) {
      showErrorToast(
        getControlLabel,
        "noti_fail_parent_status",
        "Please change the status of master row!",
      );
      return;
    }
    const record = selectRows[0];
    const freshRecord = await fetchRecordFromDB(record);
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
    setOpenPD(true);
  };
  const handleClosePD = async (data) => {
    await clearTempTable(user?.access_token);
    setSelectCheckPD([]);
    if (selectRows.length === 1) {
      const record = data || selectRows[0];
      if (record?.locked_information === user?.clientInfo) {
        const unlockData = {
          ...record,
          locked_information: null,
        };
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
          ac_type_name,
          sort_name,
          typenm,
          port_name,
          pay_name,
          curr_name,
          status_name,
          se_id,
          ship_seq,
          country_nm,
          trade_name,
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
          "2",
        );
        await refreshCurrentData();
      }
    }
    setOpenPD(false);
  };
  const handleRefreshGW = async () => {
    const result = await refreshGrossW(user?.factory, user?.user_code);
    if (result) {
      showSuccessToast(getControlLabel, "noti_success_refreshGW");
      await refreshCurrentData();
    }
  };
  const handleRefreshSeq = async () => {
    const result = await refreshSeq(
      user?.factory,
      selectRows[0]?.ac_no,
      language,
    );

    if (result.success) {
      showSuccessToast(
        getControlLabel,
        "noti_success_refreshSeq",
        "Refresh Seq successfully!",
      );
      await fetchAcChgDByAcno(false, null, null);
    }
  };
  const handleRefreshPrice = async () => {
    if (selectRows.length === 0) {
      showErrorToast(
        getControlLabel,
        "noti_fail_parent_staus",
        "Please choose master row!",
      );
      return;
    }
    if (selectRows[0]?.status !== 1) {
      showErrorToast(
        getControlLabel,
        "noti_fail_parent_staus",
        "Please change the status of master row",
      );
      return;
    }
    const result = await refreshPrice(
      user?.factory,
      selectRows[0]?.ac_no,
      language,
    );
    if (result.success) {
      showSuccessToast(getControlLabel, "noti_success_refreshPrice");
      await fetchAcChgDByAcno(false, null, null);
    }
  };
  const handleOpenGenerateGC = () => {
    setOpenGenegrateGC(true);
  };
  const handleCloseGenerateGC = () => {
    setOpenGenegrateGC(false);
  };
  const handleGenerateGC = async (data) => {
    const result = await copyShoe(
      user?.factory,
      selectRows[0]?.ac_no,
      selectRows[0]?.cont_no,
      data?.customs_shoe_id,
      language,
    );
    if (result) {
      showSuccessToast(getControlLabel, "noti_success_generateGC");
      await fetchAcChgDByAcno(false, null, null);
      setOpenGenegrateGC(false);
    }
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

  const handleDelete = async () => {
    const result = await deletePlanOrd(
      user?.factory,
      selectAcPlanOrd[0]?.ac_no,
      selectAcPlanOrd[0]?.se_id,
      selectAcPlanOrd[0]?.se_seq,
      selectAcPlanOrd[0]?.ship_seq,
      selectAcPlanOrd[0]?.se_ver,
      selectAcPlanOrd[0]?.pack_gu,
      selectRows[0]?.status,
      language,
      null,
    );
    if (result?.success) {
      showSuccessToast(getControlLabel, "noti_delete_success", result?.message);
      await refreshCurrentData();
      await fetchAcChgDByAcno(false, null, null);
      await fetchAcPlanOrdByAcno(false, null, null);
      handleDeleteClose();
    }
  };

  const handleDeleteOpen = async () => {
    if (selectRows.length === 0) {
      showErrorToast(
        getControlLabel,
        "noti_add_fail_3",
        "Please choose master row before delete row!",
      );
      return;
    }
    if (
      selectRows[0].status === 0 ||
      selectRows[0].status === 7 ||
      selectRows[0].status === 9
    ) {
      showErrorToast(
        getControlLabel,
        "noti_fail_parent_status",
        "Please unconfirm first!",
      );
      return;
    }
    const allowDelete = authorization?.find(
      (item) => item.field === "allow_delete",
    )?.title;
    if (user?.user_code !== "admin" && allowDelete === "N") {
      return;
    }
    setOpenDelete(true);
  };

  const handleDeleteClose = () => {
    setOpenDelete(false);
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
      ac_type: "2",
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
        addData.ac_type,
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
        const responseData = await fetchVCE(
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
            tableName: "VW_CHG_EXP",
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
        ac_type_name,
        sort_name,
        typenm,
        port_name,
        pay_name,
        curr_name,
        status_name,
        se_id,
        ship_seq,
        country_nm,
        trade_name,
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
        "2",
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
              "2",
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

            const responseData = await fetchVCE(
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
                  tableName: "VW_CHG_EXP",
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
                "2",
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

  const handleEditAPS = async (updateRow, title, skipTimestamp = false) => {
    try {
      const { statusText, pay_no, note, ...cleanData } = updateRow;
      if (!skipTimestamp) {
        cleanData.last_user = user.user_code;
        cleanData.last_date = new Date().toISOString();
      }
      const result = await editAcPlanSize(
        user?.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        currentAPSPageSize,
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
            await editAcPlanSize(
              user?.access_token,
              user?.factory,
              user?.department,
              user?.user_code,
              authorization?.find((item) => item.field === "query_level")
                ?.title,
              currentAPSPageSize,
              unlockData,
            );
          }

          //  Refresh với current page/offset
          await fetchAcPlanSizeByAcno(
            true,
            currentAPSOffset,
            currentAPSPageSize,
            cleanData,
          );
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

            const responseData = await fetchAllAcPlanSize(
              user?.access_token,
              selectRows[0]?.factory_code,
              user.department,
              user.user_code,
              allow || "1",
              language,
              currentAPSPageSize,
              resultOffset,
              selectAcPlanOrd[0]?.ac_no,
              selectAcPlanOrd[0]?.se_id,
              selectAcPlanOrd[0]?.se_seq,
              selectAcPlanOrd[0]?.se_ver,
              selectAcPlanOrd[0]?.pack_gu,
              selectAcPlanOrd[0]?.ship_seq,
            );

            if (responseData && responseData.data) {
              setAcPlanSizeData([
                {
                  tableName: "AC_PLAN_SIZE",
                  data: responseData.data,
                },
              ]);
              setHasAPSMore(responseData?.hasMore);
              setCurrentAPSPage(resultPage);
              setCurrentAPSOffset(resultOffset);

              const editedRecord = responseData.data.find(
                (item) =>
                  `${item.factory_code}-${item.ac_no}-${item.se_id}-${item.se_seq}-${parseFloat(item.se_ver).toFixed(2)}-${parseFloat(item.pack_gu).toFixed(2)}-${parseFloat(item.ship_seq).toFixed(2)}` ===
                  `${cleanData.factory_code}-${cleanData.ac_no}-${cleanData.se_id}-${cleanData.se_seq}-${parseFloat(cleanData.se_ver).toFixed(2)}-${parseFloat(cleanData.pack_gu).toFixed(2)}-${parseFloat(cleanData.ship_seq).toFixed(2)}`,
              );

              if (editedRecord) {
                setSelectAcPlanSize([editedRecord]);
                setJumpToRowAcPlanSize(editedRecord);
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
                // locked_information: null,
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
                "2",
              );
            }
            //  Refresh với current page/offset
            await fetchAcPlanSizeByAcno(
              true,
              currentAPSOffset,
              currentAPSPageSize,
              cleanData,
            );
          }
        }
        if (!skipTimestamp) {
          handleCloseGeneratePM(data);
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
        const res = await activateExp(
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
              "2",
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
      const response = await searchVwChgExpByFilter(
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
          setData([{ tableName: "VW_CHG_EXP", data: response.data }]);
        } else {
          setSelectRows([response.data[0]]);
          if (offset === 0 && response.data.length > 0) {
            setTotalData(response.total);
          }
          setData([{ tableName: "VW_CHG_EXP", data: response.data }]);
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
      await handleStatusChange("confirm", [1, 2], handleUpdateConfirm);
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_confirm", error.message);
    }
  };

  const handleUnconfirm = async () => {
    try {
      await handleStatusChange("unconfirm", [1, 7], async () => {
        await cancelActivateExp(
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
      console.log("addud", selectRows[0]);

      try {
        await voidAllExp(
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
  const handleOpenModifyLation = () => {
    setOpenModifyLation(true);
  };
  const handleCloseModifyLation = () => setOpenModifyLation(false);

  const handleOpenGeneratePM = () => {
    setOpenGenegratePM(true);
  };
  const handleCloseGeneratePM = async (data) => {
    try {
      if (selectAcPlanSize.length === 1) {
        const record = data || selectRows[0];
        if (record?.locked_information === user?.clientInfo) {
          const unlockData = {
            ...record,
            locked_information: null,
          };
          const { statusText, note, ...finalLock } = unlockData;
          await editAcPlanSize(
            user?.access_token,
            user?.factory,
            user?.department,
            user?.user_code,
            authorization?.find((item) => item.field === "query_level"),
            currentAPSPageSize,
            record,
          );
          await fetchAcPlanSizeByAcno(
            true,
            currentAPSOffset,
            currentAPSPageSize,
          );
        }
      }
      setOpenGenegratePM(false);
    } catch (error) {
      console.error(" Error closing edit:", error);
      setOpenGenegratePM(false);
    }
  };

  const handleSaveModifyLation = async (e) => {
    e.preventDefault();
    const old_no = e.target.old_no.value;
    await handleEditASM({ ...selectRows[0], old_no });
    await handleCancel();
    handleCloseModifyLation();
  };
  const handleGeneratePM = async (data) => {
    await updateProdAcno(
      user?.access_token,
      user?.factory,
      user?.department,
      user?.user_code,
      authorization?.find((item) => item.field === "query_level")?.title,
      selectAcPlanOrd[0]?.se_id,
      selectAcPlanOrd[0]?.pack_gu,
      selectAcPlanOrd[0]?.se_ver,
      selectAcPlanOrd[0]?.se_seq,
      selectAcPlanOrd[0]?.ship_seq,
      selectAcPlanOrd[0]?.ac_no,
      data[0]?.prod_acno || "",
    );
    await fetchAcPlanSizeByAcno(false, null, null);
    handleCloseGeneratePM(null);
  };
  const handleConfirmPassDate = async (e) => {
    try {
      await e.preventDefault();
      const formData = new FormData(e.target);
      const pass_date = formData.get("pass_date");
      const result = await confirmPassDate(
        user?.factory,
        pass_date,
        selectRows[0]?.ac_no,
      );
      if (result) {
        showSuccessToast(getControlLabel, "noti_success_confirmPassDate");
        await refreshCurrentData();
        handleCloseConfirmPD();
      }
    } catch (error) {
      handleCloseConfirmPD();
      showErrorToast(
        getControlLabel,
        "noti_fail_confirmPassDate",
        error.message,
      );
    }
  };
  const handleCheck = () => {
    handleStatusChange(2, "check", [1]);
  };

  //handler export Excel
  const handleExport = async () => {
    const allow = authorization.find(
      (item) => item.field === "query_level",
    )?.title;
    const excel = await exportExcelToTransfer(
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
      language,
      searchFilter,
    );
    console.log("done: ", excel);
  };
  const handleExportPDFCHGD = async () => {
    try {
      const result = await pdfToChgD(
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        selectRows[0]?.ac_no,
      );
      if (result) {
        showSuccessToast(getControlLabel, "noti_success_pdfToChgD");
      }
    } catch (error) {
      console.log("error when pdf to chgd", error);

      showErrorToast(getControlLabel, "noti_fail_pdfToChgD");
    }

    console.log("after pdf to chg d", result);
  };
  const handleExportPDFItemDetails = async () => {
    try {
      const result = await pdfItemDetails(
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        selectRows[0]?.ac_no,
      );
      if (result) {
        showSuccessToast(getControlLabel, "noti_success_pdfItemDetails");
      }
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_pdfItemDetails");
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
    const responseData = await fetchVCE(
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
      language,
      newPageSize,
      newOffset,
    );
    setData([{ tableName: "VW_CHG_EXP", data: responseData.data || [] }]);
    setHasMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectRows([responseData.data[0]]);
    }
  };
  const handlePDPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentPDPage(newPage);
    setCurrentPDPageSize(newPageSize);
    setCurrentPDOffset(newOffset);
    if (isSearch && searchFilter) {
      await handleSearchByFilter(searchFilter, newPageSize, newOffset);
      return;
    }
    const allow = authorization.find(
      (item) => item.field === "query_level",
    )?.title;
    const responseData = await fetchAllPlanOrd(
      user?.access_token,
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
      language,
      newPageSize,
      newOffset,
    );
    setPDData([{ tableName: "PLAN_ORD", data: responseData.data || [] }]);
    setHasPDMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectPD([responseData.data[0]]);
      setJumpToRowPD(responseData.data[0]);
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
  const handleAPOPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentAPOPage(newPage);
    setCurrentAPOPageSize(newPageSize);
    setCurrentAPOOffset(newOffset);
    await fetchAcPlanOrdByAcno(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.ac_no) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
  };
  const handleAPSPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentAPSPage(newPage);
    setCurrentAPSPageSize(newPageSize);
    setCurrentAPSOffset(newOffset);
    await fetchAcPlanSizeByAcno(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.ac_no) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
  };
  const handleAPPPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentAPPPage(newPage);
    setCurrentAPPPageSize(newPageSize);
    setCurrentAPPOffset(newOffset);
    await fetchAcPlanPackByAcno(false, newOffset, newPageSize);
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
      return;
    }
  };
  const handleOpenImportLink = async () => {
    const allow = authorization.find(
      (item) => item.field === "query_level",
    )?.title;

    const response = await fetchVCE(
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
      language,
      1,
      7,
    );

    const isMoreThan7 = response?.data?.length > 0;
    setTotalImportData(isMoreThan7 ? 8 : 0);
    setOpenImportLink(true);
  };
  const handleCloseImportLink = () => {
    setOpenImportLink(false);
  };
  const handleImportLink = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_230`, "_blank");
  };
  const handleImportLink1 = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_2301`, "_blank");
  };
  const handleImportLink2 = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_2311`, "_blank");
  };
  const handleImportLink3 = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_231`, "_blank");
  };
  const handleImportLink4 = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_2302`, "_blank");
  };
  const handleImportLink5 = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_2312`, "_blank");
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
                  <Typography
                    variant="h5"
                    textAlign={"center"}
                    fontWeight={"bold"}
                  >
                    {/*      {getControlLabel("ttl_table_m", "VW_CHG_EXP")}*/}
                  </Typography>
                  <DataTable
                    data={data[0]?.data}
                    tableName={"VW_CHG_EXP"}
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
                    onConfirmPD={handleOpenConfirmPD}
                    onRefreshGW={handleRefreshGW}
                    onReport={handleOpenReport}
                    onImportLink={handleOpenImportLink}
                  />
                  <AcChgD
                    data={acChgDData}
                    setData={setAcChgDData}
                    setSelectAcChgD={setSelectAcChgD}
                    selectAcChgD={selectAcChgD.length > 0 ? selectAcChgD : []}
                    selectAcPlanOrd={selectAcPlanOrd.length > 0 ? selectAcPlanOrd : []}
                    setJumpToRow={setJumpToRowAcChgD}
                    jumpToRow={jumpToRowAcChgD}
                    selectRows={selectRows}
                    subAuthentication={authorization}
                    //      isSearch={isAPMSearch}
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
                    //    searchFilter={searchAPMFilter}
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
                    onRefreshSeq={handleRefreshSeq}
                    onOpenGenegrateGC={handleOpenGenerateGC}
                    onCloseGenegrateGC={handleCloseGenerateGC}
                    openGenegrateGC={openGenegrateGC}
                    onGenerateGC={handleGenerateGC}
                    openPD={openPD}
                    onOpenPD={handleOpenPD}
                    onClosePD={handleClosePD}
                    pDData={pDData}
                    setPDData={setPDData}
                    jumpToRowPD={jumpToRowPD}
                    setJumpToRowPD={setJumpToRowPD}
                    selectPD={selectPD}
                    setSelectPD={setSelectPD}
                    currentPDPage={currentPDPage}
                    currentPDOffset={currentPDOffset}
                    currentPDPageSize={currentPDPageSize}
                    setCurrentPDOffset={setCurrentPDOffset}
                    totalPDData={totalPDData || 0}
                    setTotalPDData={setTotalPDData}
                    hasPDMore={hasPDMore}
                    setHasPDMore={setHasPDMore}
                    isSearchPD={isPDSearch}
                    setIsPDSearch={setIsPDSearch}
                    searchPDFilter={searchPDFilter}
                    setSearchPDFilter={setSearchPDFilter}
                    setCurrentPDPage={setCurrentPDPage}
                    setCurrentPDPageSize={setCurrentPDPageSize}
                    handlePDPageChange={handlePDPageChange}
                    user={user}
                    selectCheckPD={selectCheckPD}
                    handleCheckBoxChange={handleCheckBoxChange}
                    selectionsVersion={selectionsVersion}
                    onTransfer={handleTransfer}
                    onRefreshPrice={handleRefreshPrice}
                    onCheckBoxAll={handleCheckBoxAll}
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
                  <AcDescChg
                    data={acChgAData}
                    setData={setAcChgAData}
                    setSelectAcChgA={setSelectAcChgA}
                    selectAcChgA={selectAcChgA.length > 0 ? selectAcChgA : []}
                    //     setJumpToRow={setJumpToRowAcProdM}
                    jumpToRow={jumpToRowAcProdM}
                    selectRows={selectRows}
                    subAuthentication={authorization}
                    //     isSearch={isAPMSearch}
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
                    //     searchFilter={searchAPMFilter}
                    hasMore={hasACAMore}
                    setHasMore={setHasACAMore}
                    acPlanOrdData={acPlanOrdData}
                    setAcPlanOrdData={setAcPlanOrdData}
                    setSelectAcPlanOrd={setSelectAcPlanOrd}
                    selectAcPlanOrd={
                      selectAcPlanOrd.length > 0 ? selectAcPlanOrd : []
                    }
                    setJumpToRowAcPlanOrd={setJumpToRowAcPlanOrd}
                    jumpToRowAcPlanOrd={jumpToRowAcPlanOrd}
                    totalAPOData={totalAPOData || 0}
                    onPageAPOChange={handleAPOPageChange}
                    currentAPOOffset={currentAPOOffset}
                    currentAPOPage={currentAPOPage}
                    currentAPOPageSize={currentAPOPageSize}
                    setCurrentAPOPage={setCurrentAPOPage}
                    setCurrentAPOOffset={setCurrentAPOOffset}
                    setCurrentAPOPageSize={setCurrentAPOPageSize}
                    setTotalAPOData={setTotalAPOData}
                    setSearchAPOData={setSearchAPOData}
                    searchAPOFilter={searchAPOFilter}
                    hasAPOMore={hasAPOMore}
                    setHasAPOMore={setHasAPOMore}
                    isAPOSearch={isAPOSearch}
                  />
                  <AcPlanOrd
                    data={acPlanOrdData}
                    setData={setAcPlanOrdData}
                    setSelectAcPlanOrd={setSelectAcPlanOrd}
                    selectAcPlanOrd={
                      selectAcPlanOrd.length > 0 ? selectAcPlanOrd : []
                    }
                    setJumpToRow={setJumpToRowAcPlanOrd}
                    jumpToRow={jumpToRowAcPlanOrd}
                    selectRows={selectRows?.length > 0 ? selectRows : []}
                    subAuthentication={authorization}
                    isSearch={isAPOSearch}
                    searchData={searchData}
                    fetchDataByAcNo={fetchAcPlanOrdByAcno}
                    // fetchAcChgARecordFromDB={fetchAcChgARecordFromDB}
                    totalData={totalAPOData || 0}
                    onPageChange={handleAPOPageChange}
                    currentOffset={currentAPOOffset}
                    currentPage={currentAPOPage}
                    currentPageSize={currentAPOPageSize}
                    setCurrentPage={setCurrentAPOPage}
                    setCurrentOffset={setCurrentAPOOffset}
                    setCurrentPageSize={setCurrentAPOPageSize}
                    setTotalData={setTotalAPOData}
                    setSearchData={setSearchAPOData}
                    searchFilter={searchAPOFilter}
                    hasMore={hasAPOMore}
                    setHasMore={setHasAPOMore}
                    onDeleteOpen={handleDeleteOpen}
                    onDelete={handleDelete}
                    onDeleteClose={handleDeleteClose}
                    openDelete={openDelete}
                  />
                  <AcPlanSize
                    data={acPlanSizeData}
                    setData={setAcPlanSizeData}
                    setSelectAcPlanSize={setSelectAcPlanSize}
                    selectAcPlanSize={
                      selectAcPlanSize.length > 0 ? selectAcPlanSize : []
                    }
                    setJumpToRow={setJumpToRowAcProdM}
                    jumpToRow={jumpToRowAcProdM}
                    selectRows={
                      selectAcPlanOrd?.length > 0 ? selectAcPlanOrd : []
                    }
                    subAuthentication={authorization}
                    isSearch={isAPMSearch}
                    searchData={searchAPMData}
                    fetchDataByAcNo={fetchAcPlanSizeByAcno}
                    // fetchAcChgARecordFromDB={fetchAcChgARecordFromDB}
                    totalData={totalAPSData || 0}
                    onPageChange={handleAPSPageChange}
                    currentOffset={currentAPSOffset}
                    currentPage={currentAPSPage}
                    currentPageSize={currentAPSPageSize}
                    setCurrentPage={setCurrentAPSPage}
                    setCurrentOffset={setCurrentAPSOffset}
                    setCurrentPageSize={setCurrentAPSPageSize}
                    setTotalData={setTotalAPSData}
                    setSearchData={setSearchAPMData}
                    searchFilter={searchAPMFilter}
                    hasMore={hasAPSMore}
                    setHasMore={setHasAPSMore}
                    openGenegratePM={openGenegratePM}
                    onOpenGenegrateGC={handleOpenGeneratePM}
                    onCloseGenegratePM={handleCloseGeneratePM}
                    onGeneratePM={handleGeneratePM}
                    handleEditAPS={handleEditAPS}
                  />
                  <AcPlanPack
                    data={acPlanPackData}
                    setData={setAcPlanPackData}
                    setSelectAcPlanPack={setSelectAcPlanPack}
                    selectAcPlanPack={
                      selectAcPlanPack.length > 0 ? selectAcPlanPack : []
                    }
                    setJumpToRow={setJumpToRowAcPlanPack}
                    jumpToRow={jumpToRowAcPlanPack}
                    selectRows={
                      selectAcPlanOrd?.length > 0 ? selectAcPlanOrd : []
                    }
                    subAuthentication={authorization}
                    isSearch={isAPMSearch}
                    searchData={searchAPMData}
                    fetchDataByAcNo={fetchAcPlanPackByAcno}
                    // fetchAcChgARecordFromDB={fetchAcChgARecordFromDB}
                    totalData={totalAPPData || 0}
                    onPageChange={handleAPPPageChange}
                    currentOffset={currentAPPOffset}
                    currentPage={currentAPPPage}
                    currentPageSize={currentAPPPageSize}
                    setCurrentPage={setCurrentAPPPage}
                    setCurrentOffset={setCurrentAPPOffset}
                    setCurrentPageSize={setCurrentAPPPageSize}
                    setTotalData={setTotalAPPData}
                    setSearchData={setSearchAPMData}
                    searchFilter={searchAPMFilter}
                    hasMore={hasAPPMore}
                    setHasMore={setHasAPPMore}
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
      />
      <ConfirmPDPopup
        openLink={openConfirmPD}
        onClose={handleCloseConfirmPD}
        onSave={handleConfirmPassDate}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
      />
      <ReportPopup
        openLink={openReport}
        onClose={handleCloseReport}
        onCustomDeclaration={handleExportPDFCHGD}
        onItemDetails={handleExportPDFItemDetails}
        getControlLabel={getControlLabel}
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
        getControlLabel={getControlLabel}
        isMore={totalImportData <= 7}
      />
    </>
  );
};
export default Actf230;
