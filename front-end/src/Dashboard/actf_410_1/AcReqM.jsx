import {
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
import {
  exportExcelUser,
  importExcelUser,
} from "../../service/user/userService";

import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import { fetchTablePermission } from "../../service/users_permission/UsersPermission";
import {
  addAcReqM,
  confirmAll,
  editAcReqM,
  exportExcelARM,
  fetchAcReqM,
  fetchAcReqMByID,
  fetchAcTypeDropdown,
  searchAcReqMByFilter,
} from "../../service/ac_req_m/AcReqMService";
import AddAcReqMPage from "../../features/actf_410_1/page/AddAcReqMPage";
import EditAcReqMPage from "../../features/actf_410_1/page/EditAcReqMPage";
import AcReqOrder from "../../features/actf_410_1/component/AcReqOrder";
import {
  fetchAcReqOrderByID,
  fetchAllAcReqOrderByReqNo,
} from "../../service/ac_req_order/AcReqOrder";
import Import_2Page from "../../features/actf_410_1/page/Import_2Page";
import Import_3Page from "../../features/actf_410_1/page/Import_3Page";
import {
  checkBoxQty,
  fetchAllIvTransDTw,
} from "../../service/iv_trans_d_tw/IvTransDTwService";
import {
  checkLeft,
  clearRdTemp,
  confirmAllVAS,
  editVwAcSrcorder,
  fetchAllVwAcSrcorder,
  fetchRdTemp,
  getPlanIqty,
  updateBlQty,
} from "../../service/vw_ac_srcorder/VwAcSrcorderService";
import {
  addContractNumber,
  approveContract,
  checkBox,
  clearTempTable,
  confirmAllVAA,
  fetchAllVwAcAllChk,
  revertApproveContract,
} from "../../service/vw_ac_allchk/VwAcAllChkService";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../utils/notification/Notification";
import { fetchAllVendNoByStatus } from "../../service/ac_vend_base/AcVendBaseService";
import { fetchBasicDataDropDownByCate } from "../../service/basic_data/basicDataService";
import ConfirmPopup from "../../features/actf_410_1/page/ConfirmPopup";
const AcReqM = () => {
  const [data, setData] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [isVASSearch, setIsVASSearch] = useState(false);
  const [isVAASearch, setIsVAASearch] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [searchVASData, setSearchVASData] = useState([]);
  const [searchFilter, setSearchFilter] = useState(null);
  const [acReqOrder, setAcReqOrder] = useState([]);
  const [selectAcReqOrder, setSelectAcReqOrder] = useState([]);
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [isDirectImport, setIsDirectImport] = useState(false);
  const [isVNImport, setIsVNImport] = useState(false);
  const [selectImport, setSelectImport] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openEditVwAcSrcorder, setOpenEditVwAcSrcorder] = useState(false);
  const [openConfirmPopup, setOpenConfirmPopup] = useState(false);
  const [selectRow, setSelectRow] = useState(null);
  const [selectRows, setSelectRows] = useState([]);
  const [isCheckMax, setIsCheckMax] = useState("N");
  const [vwAcSrorderData, setVwAcSrorderData] = useState([]);
  const [selectVwAcSrcorder, setSelectVwAcSrcorder] = useState([]);
  const [selectCheckVwAcSrcorder, setSelectCheckVwAcSrcorder] = useState([]);
  const [IvDTransDTwOData, setIvDTransDTwOData] = useState([]);
  const [selectIvDTransDTwO, setSelectIvDTransDTwO] = useState([]);
  const [selectCheckIvDTransDTwO, setSelectCheckIvDTransDTwO] = useState([]);
  const [VwAcAllChkData, setVwAcAllChkData] = useState([]);
  const [selectVwAcAllChk, setSelectVwAcAllChk] = useState([]);
  const [selectCheckVwAcAllChk, setSelectCheckVwAcAllChk] = useState([]);
  const [authorization, setAuthorizations] = useState([]);
  const [filter, setFilter] = useState("");
  const [file, setFile] = useState(null);
  const [jumpToRow, setJumpToRow] = useState(null);
  const [jumptoRowVwAcSrcorder, setJumptoRowVwAcSrcorder] = useState(null);
  const [jumptoRowVwAcAllChk, setJumptoRowVwAcAllChk] = useState(null);
  const [jumptoRowAcReqOrder, setJumptoRowAcReqOrder] = useState(null);
  const [jumptoRowIvDTransDTw, setJumptoRowIvDTransDTw] = useState(null);
  const [selectedItemRefs, setSelectedItemRefs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [ttlQTY, setTTLQTY] = useState(0);
  const [checkboxSelections, setCheckboxSelections] = useState(new Map());
  const [selectionsVersion, setSelectionsVersion] = useState(0);
  const [ivDataByRow, setIvDataByRow] = useState(new Map());
  const [customSelections, setCustomSelections] = useState([]);
  const [acReq, setAcReq] = useState(0);
  const selectCheckRef = useRef([]);
  const [currentVwAcSrcorderPage, setCurrentVwAcSrcorderPage] = useState(0);
  const [currentVwAcSrcorderPageSize, setCurrentVwAcSrcorderPageSize] =
    useState(10);
  const [currentITDTOffset, setCurrentITDTOffset] = useState(0);
  const [currentITDTPage, setCurrentITDTPage] = useState(0);
  const [currentITDTPageSize, setCurrentITDTPageSize] = useState(10);
  const [currentVwAcSrcorderOffset, setCurrentVwAcSrcorderOffset] = useState(0);
  const [totalARMData, setTotalARMData] = useState(0);
  const [totalAROData, setTotalAROData] = useState(0);
  const [totalITDTData, setTotalITDTData] = useState(0);
  const [totalVAAData, setTotalVAAData] = useState(0);
  const [currentARMPage, setCurrentARMPage] = useState(0);
  const [currentARMPageSize, setCurrentARMPageSize] = useState(5);
  const [currentARMOffset, setCurrentARMOffset] = useState(0);
  const [currentAROPage, setCurrentAROPage] = useState(0);
  const [currentAROPageSize, setCurrentAROPageSize] = useState(10);
  const [currentAROOffset, setCurrentAROOffset] = useState(0);
  const [currentVAAOffset, setCurrentVAAOffset] = useState(0);
  const [currentVAAPage, setCurrentVAAPage] = useState(0);
  const [currentVAAPageSize, setCurrentVAAPageSize] = useState(10);
  const [acTypeDropdown, setAcTypeDropdown] = useState({});
  const [hasMore, setHasMore] = useState(false);
  const [hasAROMore, setHasAROMore] = useState(false);
  const [hasVASMore, setHasVASMore] = useState(false);
  const [hasITDTMore, setHasITDTMore] = useState(false);
  const [hasVAAMore, setHasVAAMore] = useState(false);
  const [pendingBlQtyData, setPendingBlQtyData] = useState(null);
  const [isForceUpdate, setIsForceUpdate] = useState(false);
  const vaaAbortControllerRef = useRef(null);
  const vasAbortControllerRef = useRef(null);
  const [isVAALoading, setIsVAALoading] = useState(false);
  const [message, setMessage] = useState("");
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
  const isCheckingRef = useRef(false);

  //========== FETCH DATA SECTION ================
  //fetch all factory

  const fetchAll = async (authData = null, pageSize = 5, offset = 0) => {
    const authToUse = authData || authorization;
    const token = user?.access_token;
    const allow = Array.isArray(authToUse)
      ? authToUse.find((item) => item.field === "query_level")?.title
      : null;
    setCurrentARMPage(0);
    setCurrentARMPageSize(pageSize);
    setCurrentARMOffset(0);
    const [combinedData] = await fnQuery([
      () =>
        fetchAcReqM(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          pageSize,
          offset,
        ),
    ]);
    setHasMore(combinedData?.hasMore);
    if (combinedData?.data?.length > 0) {
      setData([{ tableName: "AC_REQ_M", data: combinedData?.data }]);
      setSelectRows([combinedData?.data[0]]);
    }
  };
  //fetch all translation of factory
  const fetchAllTranslations = async () => {
    try {
      const [columns, controls, sysMessages] = await Promise.all([
        fetchTableColumnTranslations("ACTF_410", "master", "ac_req_m"),
        fetchTableControlTranslations("ACTF_410"),
        fetchTableControlTranslations("SYS_MESG"),
      ]);

      const mergedComplexColumn = [
        ...(controls?.data || []),
        ...(columns?.data || []),
      ];
      if (mergedComplexColumn.length > 0)
        setColumnTranslations(mergedComplexColumn);
      const mergedControls = [
        ...(controls?.data || []),
        ...(sysMessages?.data || []),
      ];
      if (mergedControls.length > 0) setControlTranslations(mergedControls);
    } catch (error) {
      console.error("Error loading ACTF_410 translations:", error);
    }
  };

  const fetchAuthorization = async () => {
    try {
      const auth = await fetchTablePermission(
        user?.factory,
        user?.department,
        user?.user_code,
        "ACTF_410",
      );
      if (auth) setAuthorizations(auth?.data);
      return auth?.data || [];
    } catch (error) {
      console.error("Error loading ACTF_410 permission:", error);
      return [];
    }
  };
  const fetchDataByReqNo = async (
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
        : currentAROOffset;
    const pageSize =
      explicitPageSize !== null ? explicitPageSize : currentAROPageSize;
    const response = await fetchAllAcReqOrderByReqNo(
      selectRows[0]?.factory_code,
      user?.factory,
      user?.department,
      authorization?.find((item) => item.field === "query_level")?.title,
      selectRows[0]?.req_no,
      pageSize,
      offset,
    );
    if (response && response.data) {
      let childrenData = response.data;
      if (isSearch && searchData.length > 0) {
        const selectedParent = selectRows[0];
        if (response.total !== undefined && response.total !== null) {
          setTotalAROData(response.total);
        }
        if (shouldResetPagination) {
          setCurrentAROPage(0);
          setCurrentAROOffset(0);
        }
        childrenData = response.data.filter((child) =>
          searchData.some(
            (searchItem) =>
              searchItem.factory_code === selectedParent.factory_code &&
              searchItem.req_no === selectedParent.req_no &&
              searchItem.req_seq === child.req_seq,
          ),
        );
      }
      setAcReqOrder([{ tableName: "AC_REQ_ORDER", data: childrenData }]);
      setHasAROMore(response?.hasMore);
      if (childrenData.length > 0) {
        setSelectAcReqOrder([childrenData[0]]);
      } else {
        setSelectAcReqOrder([]);
      }
    }
  };

  const fetchIvDTransDTwOByvwAcSrcorder = async () => {
    const response = await fetchAllIvTransDTw(
      selectVwAcSrcorder[0]?.order_no || "001",
      selectVwAcSrcorder[0]?.order_seq || "3",
      user?.access_token,
    );
    if (response && response.success) {
      const rowKey = `${selectVwAcSrcorder[0]?.factory_code}-${selectVwAcSrcorder[0]?.id}`;

      setIvDataByRow((prev) => {
        const updated = new Map(prev);
        updated.set(rowKey, response?.data);
        return updated;
      });

      setIvDTransDTwOData(response?.data);

      setSelectIvDTransDTwO([
        response?.data?.length > 0 ? response?.data[0] : {},
      ]);
    }
  };
  const fetchAllVwAcSrcOrd = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
    explicitChecked = null,
    targetRow = null,
    explicitIsMax = null,
  ) => {
    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;
    if (vasAbortControllerRef.current) {
      vasAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    vasAbortControllerRef.current = controller;
    const isMaxToUse = explicitIsMax ?? isCheckMax;
    const offset = shouldResetPagination
      ? 0
      : explicitOffset !== null
        ? explicitOffset
        : currentVwAcSrcorderOffset;
    const pageSize =
      explicitPageSize !== null
        ? explicitPageSize
        : currentVwAcSrcorderPageSize;
    try {
      const response = await fetchAllVwAcSrcorder(
        user?.access_token,
        user.factory,
        user.department,
        user.user_code,
        allow,
        selectRows[0]?.invoice_no,
        selectRows[0]?.vend_no,
        pageSize,
        offset,
        language,
        isMaxToUse,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      if (response && response.success) {
        setHasVASMore(response?.hasMore);
        const checkedToMerge = explicitChecked ?? selectCheckVwAcSrcorder;

        const mergedData =
          checkedToMerge?.length > 0
            ? mergeVirtualFields(response?.data, checkedToMerge)
            : response?.data;

        setVwAcSrorderData(mergedData);

        const reSelectedRow = mergedData.find(
          (row) =>
            `${row.factory_code}-${row.id}` ===
            `${targetRow?.factory_code}-${targetRow?.id}`,
        );
        setSelectVwAcSrcorder(
          reSelectedRow
            ? [reSelectedRow]
            : mergedData?.length > 0
              ? [mergedData[0]]
              : [],
        );
      }
    } catch (error) {
      if (error.name === "AbortError" || error.code === "ERR_CANCELED") return; //  axios dùng ERR_CANCELED
      console.error(error);
    }
  };
  const fetchVwAcAllChkByReqNo = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
    explicitChecked = null,
  ) => {
    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;
    if (vaaAbortControllerRef.current) {
      vaaAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    vaaAbortControllerRef.current = controller;
    const offset = shouldResetPagination
      ? 0
      : explicitOffset !== null
        ? explicitOffset
        : currentVAAOffset;
    const pageSize =
      explicitPageSize !== null ? explicitPageSize : currentVAAPageSize;
    try {
      const response = await fetchAllVwAcAllChk(
        user?.access_token,
        user?.factory,
        selectRows[0]?.vend_no,
        selectRows[0]?.ac_type,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        pageSize,
        offset,
      );
      if (controller.signal.aborted) return;
      if (response && response.success) {
        const checkedToMerge = explicitChecked ?? selectCheckVwAcAllChk;

        const mergedData =
          checkedToMerge?.length > 0
            ? response.data.map((row) => {
                const rowKey = `${row.rcpt_date}-${row.chk_no}-${row.chk_seq}`;
                const checkedVersion = checkedToMerge.find(
                  (c) => `${c.rcpt_date}-${c.chk_no}-${c.chk_seq}` === rowKey,
                );
                return checkedVersion
                  ? {
                      ...row,
                      bl_qty: checkedVersion.bl_qty,
                      ac_req: checkedVersion.ac_req,
                      is_check: "Y",
                    }
                  : row;
              })
            : response.data;

        setHasVAAMore(response?.hasMore);
        setVwAcAllChkData(mergedData);
        setSelectVwAcAllChk(mergedData?.length > 0 ? [mergedData[0]] : []);
      }
    } catch (error) {
      if (error.name === "AbortError" || error.code === "ERR_CANCELED") return;
      console.error(error);
    }
  };
  const fetchRecordFromDB = async (record) => {
    try {
      const response = await fetchAcReqMByID(
        selectRows[0]?.factory_code,
        selectRows[0]?.req_no,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };
  const fetchAcReqOrderRecordFromDB = async (record) => {
    try {
      const response = await fetchAcReqOrderByID(
        selectRows[0]?.factory_code,
        selectRows[0]?.req_no,
        selectAcReqOrder[0]?.req_seq,
      );
      return response?.data;
    } catch (error) {
      console.error("Error fetching record:", error);
      return record;
    }
  };

  const fetchCheckLeft = async (item) => {
    const response = await checkLeft(item, user?.access_token);
    return response?.data;
  };
  const fetchAllAcType = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(authorization)
          ? authorization.find((item) => item.field === "query_level")?.title
          : "1";
        const result = await fetchAcTypeDropdown(
          user?.factory,
          selectRows[0]?.invoice_no,
          user?.department,
          user?.user_code,
          allow,
          page,
          pageSize,
          searchText,
        );
        const newData = [...(result?.data?.data ?? []), { ac_type: "" }];
        return {
          data: newData || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error(`Error fetching dropdown`, error);
        return { data: [], total: 0, pageSize };
      }
    };
  };

  const refreshCurrentAcReqM = async () => {
    const currentSelection = selectRows.length > 0 ? selectRows[0] : null;

    if (isSearch && searchFilter) {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;
      let response;
      response = await searchAcReqMByFilter(
        searchFilter,
        user.factory,
        user.department,
        user.user_code,
        allow,
        currentARMPageSize,
        currentARMOffset,
      );

      if (response && response.data) {
        setData([{ tableName: "AC_ITEM_M", data: response.data }]);

        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${currentSelection.req_no}`;
          const foundRecord = response.data.find(
            (item) => `${item.factory_code}-${item.req_no}` === currentKey,
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

      const responseData = await fetchAcReqM(
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        currentARMPageSize,
        currentARMOffset,
      );

      if (responseData && responseData.data) {
        setData([{ tableName: "AC_REQ_M", data: responseData.data }]);
        setHasMore(responseData?.hasMore);
        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${currentSelection.req_no}`;
          const updatedRecord = responseData.data.find(
            (item) => `${item.factory_code}-${item.req_no}` === currentKey,
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
  const confirmAllVwAcSrcorder = async () => {
    const filters = {
      factory_code: user?.factory,
      department_code: user?.department,
      user_code: user?.user_code,
      query_level: authorization?.find((item) => item.field === "query_level")
        ?.title,
      req_no: selectRows[0]?.req_no,
      vend_no: selectRows[0]?.vend_no,
    };
    const response = await confirmAllVAS(user?.access_token, filters);
    if (response.success) {
      showSuccessToast(
        getControlLabel,
        "noti_success_confirm_all",
        "Confirm all successfully",
      );
      fetchDataByReqNo();
    }
    handleCloseDirectImport();
    return response?.data;
  };
  const confirmAllVwAcAllChk = async () => {
    const filters = {
      factory_code: user?.factory,
      user_code: user?.user_code,
      department_code: user?.department,
      req_no: selectRows[0]?.req_no,
      vend_no: selectRows[0]?.vend_no,
    };
    try {
      const response = await confirmAllVAA(user?.access_token, filters);
      if (response.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_confirm_all",
          "Confirm all successfully",
        );
        fetchDataByReqNo();
      }
      handleCloseVNImport();
      return response?.data;
    } catch (error) {
      showErrorToast(
        getControlLabel,
        "noti_fail_confirm_all",
        error.response?.data.message,
      );
    }
  };
  useEffect(() => {
    const init = async () => {
      const translationsPromise = fetchAllTranslations();
      const authData = await fetchAuthorization();
      await fetchAll(authData);
      await Promise.all([translationsPromise, clearRdTemp(user?.access_token)]);
    };
    init();
  }, [language]);
  useEffect(() => {
    if (jumpToRow) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow]);

  // Tự động tính lại TOÀN BỘ data khi isCheckMax thay đổi
  useEffect(() => {
    if (checkboxSelections.size === 0) return;

    const recalculateAllRows = async () => {
      const updatedRows = new Map();
      for (const [rowKey, selections] of checkboxSelections.entries()) {
        const currentRow = vwAcSrorderData.find(
          (row) => `${row.factory_code}-${row.id}` === rowKey,
        );
        if (!currentRow) continue;

        if (!selections || selections.length === 0) {
          const newTotal = isCheckMax === "Y" ? currentRow?.order_qty || 0 : 0;
          updatedRows.set(rowKey, {
            ...currentRow,
            plan_iqty: newTotal,
          });
        } else {
          const parentData = {
            order_no: currentRow.order_no,
            order_seq: currentRow.order_seq,
            all_checked_items: selections,
          };
          const result = await checkBoxQty(parentData, user?.access_token);
          const planIqtyValue =
            typeof result?.data === "object" ? result.data.total : result.data;

          let finalValue;
          if (isCheckMax === "Y") {
            finalValue = Math.max(planIqtyValue, currentRow?.order_qty || 0);
          } else {
            finalValue = planIqtyValue;
          }
          updatedRows.set(rowKey, {
            ...currentRow,
            plan_iqty: finalValue,
          });
        }
      }

      // Cập nhật toàn bộ vwAcSrorderData
      const freshData = vwAcSrorderData.map((row) => {
        const rowKey = `${row.factory_code}-${row.id}`;
        return updatedRows.has(rowKey) ? updatedRows.get(rowKey) : row;
      });

      setVwAcSrorderData(freshData);

      // Cập nhật row đang chọn nếu có
      if (selectVwAcSrcorder.length > 0) {
        const currentRowKey = `${selectVwAcSrcorder[0].factory_code}-${selectVwAcSrcorder[0].id}`;
        const updatedCurrentRow = updatedRows.get(currentRowKey);

        if (updatedCurrentRow) {
          setSelectVwAcSrcorder([updatedCurrentRow]);
          //  BỎ dòng setTotal - không set total khi checkMax
        }
      }
    };

    recalculateAllRows();
  }, [isCheckMax]);
  useEffect(() => {
    if (isDirectImport) {
      fetchAllVwAcSrcOrd();
    }
  }, [isDirectImport]);
  useEffect(() => {
    if (isVNImport) {
      fetchVwAcAllChkByReqNo();
    }
  }, [isVNImport]);
  // ========== END USEEFFECT SECTION ==========

  //========== HANDLER SECTION ================
  //handler row choose
  const handleSelectChoose = (rows) => {
    setSelectRows(rows);
  };
  const handleCheckboxChange = (rows, contextRow) => {
    const currentRow =
      contextRow || selectVwAcSrcorder[selectVwAcSrcorder.length - 1];

    if (!currentRow) {
      console.warn(" No current row to save checkbox selections");
      return;
    }

    const rowKey = `${currentRow?.factory_code}-${currentRow?.id}`;

    setCheckboxSelections((prev) => {
      const updated = new Map(prev);
      updated.set(rowKey, rows);
      return updated;
    });
    setSelectVwAcSrcorder([currentRow]);
    setSelectionsVersion((v) => v + 1);
  };
  const handleSelectVwAcSrcorder = (rows) => {
    if (rows.length > 0) {
      const row = rows[0];
      const rowKey = `${row.factory_code}-${row.id}`;
      const freshRow = vwAcSrorderData.find(
        (r) => `${r.factory_code}-${r.id}` === rowKey,
      );

      const savedSelections = checkboxSelections.get(rowKey) || [];

      const newTotal = savedSelections.reduce(
        (sum, item) => sum + (Number(item?.out_qty) || 0),
        0,
      );
      setTotal(newTotal);

      setSelectVwAcSrcorder([{ ...(freshRow || row) }]);

      const cachedIvData = ivDataByRow.get(rowKey);
      if (cachedIvData) {
        setIvDTransDTwOData(cachedIvData);
      } else {
        setIvDTransDTwOData([]);
      }

      if (savedSelections.length > 0) {
        setSelectIvDTransDTwO(savedSelections);
      } else {
        setSelectIvDTransDTwO([]);
      }
    }
  };
  const handleSelectVwAcAllChk = (rows) => {
    if (rows.length > 0) {
      setSelectVwAcAllChk(rows);
      setJumptoRowVwAcAllChk(rows[0]);
    }
  };
  const handleCheckBoxAll = async (isChecked) => {
    const allData = vwAcSrorderData[0]?.data || [];
    await checkLeft(selectVwAcSrcorder, user?.access_token, allData);
    setSelectCheckVwAcSrcorder(isChecked ? allData : []);
    setSelectVwAcSrcorder(isChecked ? allData : [allData[0]]);
  };
  const handleCheckVwAcSrcorder = async (rows, uncheckedRow = null) => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    try {
      const normalizedRows = Array.isArray(rows) ? rows : rows ? [rows] : [];

      let targetRow;
      if (uncheckedRow) {
        targetRow = uncheckedRow;
      } else if (normalizedRows.length > 0) {
        targetRow = normalizedRows[normalizedRows.length - 1];
      } else {
        targetRow = selectVwAcSrcorder[0];
      }

      setSelectVwAcSrcorder(normalizedRows);
      setSelectCheckVwAcSrcorder(normalizedRows);
      setJumptoRowVwAcSrcorder(targetRow);

      const result = await handleLeftCheck(normalizedRows, targetRow);
      if (result && !result.success) {
        showErrorToast(getControlLabel, "noti_error_check_a", result.message);
      }
    } finally {
      isCheckingRef.current = false;
    }
  };
  const handleCheckVwAcAllChk = async (rows, uncheckedRow = null) => {
    const normalizedRows = Array.isArray(rows) ? rows : rows ? [rows] : [];

    let targetRow;
    if (uncheckedRow) {
      targetRow = uncheckedRow;
    } else if (normalizedRows.length > 0) {
      targetRow = normalizedRows[normalizedRows.length - 1];
    } else {
      targetRow = selectVwAcAllChk[0];
    }

    setSelectVwAcAllChk([targetRow]);
    setJumptoRowVwAcAllChk(targetRow);
    const result = await handleCheckBox(normalizedRows, targetRow);
    if (result && !result.success) {
      showErrorToast(getControlLabel, "noti_error_check_a", result.message);
    }
  };
  const handleCheckIvTransDTw = (rows) => {
    setSelectCheckIvDTransDTwO(rows);
  };
  const handleCustomCheck = (rows) => {
    setCustomSelections(rows);
  };
  const handleSelectIvTransDTw = (rows) => {
    setSelectIvDTransDTwO(rows);
  };
  const handleOpenDirectImport = async () => {
    if (!selectRows[0] || selectRows[0].length === 0) return;

    if (selectRows[0]?.ac_type !== "2") {
      showErrorToast(
        getControlLabel,
        "noti_fail_direct_import",
        "Declaration type must be 2",
      );
      return;
    }

    try {
      const freshRecord = await fetchRecordFromDB(selectRows[0]);
      if (
        freshRecord.status === 0 ||
        freshRecord.status === 7 ||
        freshRecord.status === 9
      ) {
        const statusNames = { 0: "Cancelled", 7: "Confirmed", 9: "Closed" };
        showErrorToast(
          getControlLabel,
          "noti_fail_parent_status",
          `Cannot open! Present status: ${statusNames[freshRecord.status]}`,
          { status: statusNames[freshRecord.status] },
        );
        await refreshCurrentAcReqM();
        return;
      }

      if (
        freshRecord.locked_information &&
        freshRecord.locked_information !== "null" &&
        freshRecord.locked_information !== "undefined" &&
        freshRecord.locked_information !== "" &&
        freshRecord.locked_information !== user?.clientInfo &&
        freshRecord.locked_information !== user?.clientInfo
      ) {
        showErrorToast(
          getControlLabel,
          "noti_edit_fail_1",
          `Cannot open!\n\nRecord is being used by: ${freshRecord.locked_information}\n\nWait for user to finish!`,
          { user: freshRecord.locked_information },
        );
        return;
      }

      const { FACTORY, ac_type, ac_type_name, vend_no_name, ...clearData } =
        freshRecord;
      const lockData = { ...clearData, locked_information: user?.clientInfo };
      await editAcReqM(
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        lockData,
        currentARMPageSize,
      );

      const response = await fetchRdTemp(user?.access_token);
      if (response && response.success) {
        const checkedRowKeys = response.data.map(
          (item) => `${item.factory_code}-${item.id}`,
        );
        const checkedRows = vwAcSrorderData.filter((row) =>
          checkedRowKeys.includes(`${row.factory_code}-${row.id}`),
        );
        setSelectCheckVwAcSrcorder(checkedRows);
      }

      setIsDirectImport(true);
    } catch (error) {
      console.error("Error opening Direct Import:", error);
      toast.error("Failed to load Direct Import data");
    }
  };
  const handleOpenConfirmPopup = (message, data) => {
    setMessage(message);
    setPendingBlQtyData(data);
    setOpenConfirmPopup(true);
  };
  const handleCloseConfirmPopup = () => {
    setMessage("");
    setOpenConfirmPopup(false);
  };
  const handleCloseAll = () => {
    handleEditVwAcSrorderClose();
    handleCloseConfirmPopup();
  };
  const handleRightCheck = async (rows) => {
    const currentRow = selectVwAcSrcorder[0];
    if (!currentRow) return;

    const rowKey = `${currentRow.factory_code}-${currentRow.id}`;

    if (!rows || rows.length === 0) {
      const updatedSelections = new Map(checkboxSelections);
      updatedSelections.delete(rowKey);
      setCheckboxSelections(updatedSelections);

      const isStillLeftChecked = selectCheckVwAcSrcorder.some(
        (row) => `${row.factory_code}-${row.id}` === rowKey,
      );

      const newData = {
        ...currentRow,
        plan_iqty: currentRow?.plan_iqty,
      };
      setSelectCheckVwAcSrcorder((prev) =>
        prev.map((row) =>
          `${row.factory_code}-${row.id}` === rowKey ? newData : row,
        ),
      );
      const freshData = vwAcSrorderData.map((f) =>
        `${f.factory_code}-${f.id}` === rowKey ? newData : f,
      );
      setVwAcSrorderData(freshData);
      setSelectVwAcSrcorder([newData]);

      setTotal(0);
      return;
    }
    handleCheckboxChange(rows, currentRow);
    const isCompared = handleCheckMaxCondition(rows);
    const parentData = {
      order_no: currentRow.order_no,
      order_seq: currentRow.order_seq,
      all_checked_items: rows,
    };
    const result = await checkBoxQty(parentData, user?.access_token);

    const planIqtyValue =
      typeof result?.data === "object" ? result.data.total : result.data;
    let max;
    if (isCompared) {
      max = Math.max(planIqtyValue, currentRow?.plan_iqty || 0);
    } else {
      max = planIqtyValue;
    }
    const newData = {
      ...currentRow,
      plan_iqty: max,
    };
    const freshData = vwAcSrorderData.map((f) => {
      if (
        `${f.factory_code}-${f.id}` === `${newData.factory_code}-${newData.id}`
      ) {
        return newData;
      }
      return f;
    });

    setVwAcSrorderData(freshData);
    setSelectVwAcSrcorder([newData]);
    const updatedSelectionsWithCurrent = new Map(checkboxSelections);
    updatedSelectionsWithCurrent.set(rowKey, rows);

    const newTotal = rows.reduce(
      (sum, item) => sum + (Number(item?.out_qty) || 0),
      0,
    );
    setTotal(newTotal);
  };
  const handleUpdateBlQty = async (data, force = false) => {
    if (
      selectCheckVwAcSrcorder[selectCheckVwAcSrcorder.length - 1].length === 0
    )
      return;

    const filters = {
      factory_code: user?.factory,
      gridData: selectVwAcSrcorder[0],
      new_bl_qty: data?.bl_qty,
      plan_iqty: selectVwAcSrcorder[0]?.plan_iqty,
      force,
    };

    try {
      const response = await updateBlQty(
        user?.access_token,
        filters,
        "Y",
        isCheckMax,
      );

      // Trường hợp backend trả warning nhưng cho phép force
      if (!response.success && response.canForce) {
        handleOpenConfirmPopup(response.message, data);
        return;
      }

      // Trường hợp lỗi cứng không cho force
      if (!response.success) {
        showErrorToast(getControlLabel, "noti_error", response.message);
        return;
      }

      // Thành công
      const updatedRow = {
        ...selectVwAcSrcorder[0],
        bl_qty: response.bl_qty,
        ac_req: response.ac_req,
      };
      const rowKey = `${updatedRow.factory_code}-${updatedRow.id}`;

      setTTLQTY(response.ttl_qty);
      setSelectCheckVwAcSrcorder((prev) => {
        const exists = prev.some((r) => `${r.factory_code}-${r.id}` === rowKey);
        return exists
          ? prev.map((r) =>
              `${r.factory_code}-${r.id}` === rowKey ? updatedRow : r,
            )
          : [...prev, updatedRow];
      });

      setSelectVwAcSrcorder([updatedRow]);
      setOpenEditVwAcSrcorder(false);

      const freshData = vwAcSrorderData.map((f) =>
        `${f.factory_code}-${f.id}` === rowKey ? updatedRow : f,
      );
      setVwAcSrorderData(freshData);

      // Cleanup
      setPendingBlQtyData(null);
      setIsForceUpdate(false);
    } catch (error) {
      showErrorToast(getControlLabel, "noti_error", error?.message);
    }
  };

  const handleApprove = async () => {
    const filters = {
      factory_code: user?.factory,
      req_no: selectRows[0]?.req_no,
      invoice_no: selectRows[0]?.invoice_no,
      user_code: user?.user_code,
    };
    try {
      const response = await approveContract(filters, user?.access_token);
      if (response.success) {
        showSuccessToast(
          getControlLabel,
          `noti_success_approve`,
          "Approve successfully",
        );
      }
    } catch (error) {
      showErrorToast(
        getControlLabel,
        `noti_fail_approve`,
        error?.response.data.message,
      );
      throw error;
    }
  };
  const handleRevertApprove = async () => {
    const filters = {
      factory_code: user?.factory,
      req_no: selectRows[0]?.req_no,
      invoice_no: selectRows[0]?.invoice_no,
      user_code: user?.user_code,
    };
    try {
      const response = await revertApproveContract(filters, user?.access_token);
      if (response.success) {
        showSuccessToast(
          getControlLabel,
          `noti_success_revert_approve`,
          "Revert approve successfully",
        );
      }
    } catch (error) {
      showErrorToast(
        getControlLabel,
        `noti_fail_revert_approve`,
        error?.response.data.message,
      );
      throw error;
    }
  };
  const handleAddContractNumber = async () => {
    const filters = {
      factory_code: user?.factory,
      req_no: selectRows[0]?.req_no,
      vend_no: selectRows[0]?.vend_no,
      ac_type: selectRows[0]?.ac_type,
      req_date: selectRows[0]?.req_date,
    };
    try {
      const response = await addContractNumber(filters, user?.access_token);

      if (response.success) {
        showSuccessToast(
          getControlLabel,
          `noti_success_add_contract_number`,
          "Approve successfully",
        );
        await fetchDataByReqNo();
      }
    } catch (error) {
      showErrorToast(
        getControlLabel,
        `noti_failed_add_contract`,
        error?.response.data.message,
      );
    }
  };
  const handleCloseDirectImport = async () => {
    try {
      await clearRdTemp(user?.access_token);

      // Unlock record
      const freshRecord = await fetchRecordFromDB(selectRows[0]);
      if (freshRecord?.locked_information === user?.clientInfo) {
        const { FACTORY, ac_type, ac_type_name, vend_no_name, ...clearData } =
          freshRecord;
        const unlockData = { ...clearData, locked_information: null };
        await editAcReqM(
          user?.factory,
          user?.department,
          user?.user_code,
          authorization?.find((item) => item.field === "query_level")?.title,
          unlockData,
          currentARMPageSize,
        );
        await refreshCurrentAcReqM();
        setIsVASSearch(false);
      }
    } catch (error) {
      console.error("Error closing Direct Import:", error);
    } finally {
      setIsDirectImport(false);
    }
  };
  const handleOpenVNImport = async () => {
    if (!selectRows[0] || selectRows[0].length === 0) return;
    if (selectRows[0]?.ac_type !== "3") {
      showErrorToast(
        getControlLabel,
        "noti_fail_vn_import",
        "Declaration type must be 3",
      );
      return;
    }

    try {
      const freshRecord = await fetchRecordFromDB(selectRows[0]);

      if (
        freshRecord.status === 0 ||
        freshRecord.status === 7 ||
        freshRecord.status === 9
      ) {
        const statusNames = { 0: "Cancelled", 7: "Confirmed", 9: "Closed" };
        showErrorToast(
          getControlLabel,
          "noti_fail_parent_status",
          `Cannot open! Present status: ${statusNames[freshRecord.status]}`,
          { status: statusNames[freshRecord.status] },
        );
        await refreshCurrentAcReqM();
        return;
      }

      if (
        freshRecord.locked_information &&
        freshRecord.locked_information !== "null" &&
        freshRecord.locked_information !== "undefined" &&
        freshRecord.locked_information !== "" &&
        freshRecord.locked_information !== user?.clientInfo &&
        freshRecord.locked_information !== user?.clientInfo
      ) {
        showErrorToast(
          getControlLabel,
          "noti_edit_fail_1",
          `Cannot open!\n\nRecord is being used by: ${freshRecord.locked_information}\n\nWait for user to finish!`,
          { user: freshRecord.locked_information },
        );
        return;
      }

      const { FACTORY, ac_type, ac_type_name, vend_no_name, ...clearData } =
        freshRecord;
      const lockData = { ...clearData, locked_information: user?.clientInfo };
      await editAcReqM(
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        lockData,
        currentARMPageSize,
      );

      const response = await fetchRdTemp(user?.access_token);
      if (response && response.success) {
        const checkedRowKeys = response.data.map(
          (item) => `${item.factory_code}-${item.id}`,
        );
        const checkedRows = VwAcAllChkData.filter((row) =>
          checkedRowKeys.includes(`${row.factory_code}-${row.id}`),
        );
        setSelectCheckVwAcAllChk(checkedRows);
      }

      setIsVNImport(true);
    } catch (error) {
      console.error("Error opening VN Import:", error);
      toast.error("Failed to load VN Import data");
    }
  };

  const handleCloseVNImport = async () => {
    try {
      await clearRdTemp(user?.access_token);

      // Unlock record
      const freshRecord = await fetchRecordFromDB(selectRows[0]);
      if (freshRecord?.locked_information === user?.clientInfo) {
        const { FACTORY, ac_type, ac_type_name, vend_no_name, ...clearData } =
          freshRecord;
        const unlockData = { ...clearData, locked_information: null };
        await editAcReqM(
          user?.factory,
          user?.department,
          user?.user_code,
          authorization?.find((item) => item.field === "query_level")?.title,
          unlockData,
          currentARMPageSize,
        );
        await refreshCurrentAcReqM();
        setIsVAASearch(false);
      }
    } catch (error) {
      console.error("Error closing VN Import:", error);
    } finally {
      setSelectCheckVwAcAllChk([]);
      setIsVNImport(false);
    }
  };
  //handler open edit popup
  const handleEditClose = async (data) => {
    try {
      if (selectRows.length === 1) {
        const record = data || selectRows[0];
        if (record?.locked_information === user?.clientInfo) {
          const {
            detailCount,
            ac_type,
            ac_type_name,
            vend_no_name,
            ...unlockRecord
          } = record;
          const unlockData = {
            ...unlockRecord,
            locked_information: null,
          };
          await editAcReqM(
            user?.factory,
            user?.department,
            user?.user_code,
            authorization?.find((item) => item.field === "query_level")?.title,
            unlockData,
            currentARMPageSize,
          );
          await refreshCurrentAcReqM();
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
            "noti_edit_fail_2",
            ` Cannot edit!Present status: ${statusNames[freshRecord.status]}`,
            {
              status: statusNames[freshRecord?.status] || "Unknown",
            },
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
        freshRecord.locked_information !== user?.clientInfo &&
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
        //  refreshCurrentAcReqM();
        return;
      }
      const { FACTORY, ac_type, ...clearData } = freshRecord;
      const lockData = {
        ...clearData,
        locked_information: user?.clientInfo,
      };

      await handleEditARM(lockData, "", true);
      // setSelectRows([lockData]);
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

  const handleEditVwAcSrorderClose = () => {
    setOpenEditVwAcSrcorder(false);
  };
  //handler close edit popup
  // Hàm lock nhẹ - chỉ ghi locked_information, không đụng virtual fields
  const lockVwAcSrcorderRow = async (rowToLock) => {
    try {
      const { statusText, ...data } = rowToLock;
      await editVwAcSrcorder(user.access_token, {
        ...data,
        is_check: selectCheckVwAcSrcorder.some(
          (r) =>
            `${r.factory_code}-${r.id}` === `${data.factory_code}-${data.id}`,
        )
          ? "Y"
          : "N",
        is_max: isCheckMax,
        last_user: user.user_code,
        last_date: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error locking row:", error);
      showErrorToast(getControlLabel, "noti_error_lock_row", error?.message);
      setOpenEditVwAcSrcorder(true);
    }
  };

  const handleOpenVwAcSrorderEdit = async () => {
    try {
      const selectedKey = `${selectVwAcSrcorder[0]?.factory_code}-${selectVwAcSrcorder[0]?.id}`;

      const checkedItems = selectCheckVwAcSrcorder.filter(
        (item) => `${item.factory_code}-${item.id}` === selectedKey,
      );

      if (checkedItems.length === 0) {
        showWarningToast(
          getControlLabel,
          "noti_warn_row_mismatch",
          "Please select the same row in the left table to edit!",
        );
        return;
      }

      let rowToEdit = selectVwAcSrcorder[0];

      if (user.user_code !== "admin") {
        const allowModify = authorization?.find(
          (item) => item.field === "modify_level",
        )?.title;
        const allowStatus = rowToEdit?.status;
        if (allowModify === "2" && rowToEdit?.grt_dept !== user.department)
          return;
        if (allowModify === "3" && rowToEdit?.grt_user !== user.user_code)
          return;
        if (allowStatus === 0 || allowStatus === 9) return;
        const allow = authorization?.find(
          (item) => item.field === "allow_modify",
        )?.title;
        if (user?.user_code !== "admin" && allow === "N") return;
      }

      //  Chỉ lock DB - không đụng virtual fields hay checked state
      if (user?.clientInfo) {
        const lockInfo = {
          ...rowToEdit,
          locked_information: user?.clientInfo,
        };
        await lockVwAcSrcorderRow(lockInfo);

        // Chỉ update locked_information trong state, giữ nguyên tất cả virtual fields
        const rowKey = `${rowToEdit.factory_code}-${rowToEdit.id}`;
        const lockedRow = {
          ...rowToEdit,
          locked_information: user?.clientInfo,
        };

        setVwAcSrorderData((prev) =>
          prev.map((item) =>
            `${item.factory_code}-${item.id}` === rowKey ? lockedRow : item,
          ),
        );
        // selectCheckVwAcSrcorder KHÔNG bị đụng đến
        setSelectVwAcSrcorder([lockedRow]);
      }

      setOpenEditVwAcSrcorder(true);
    } catch (error) {

      showErrorToast(
        getControlLabel,
        "noti_error_open_edit",
        "This has error when open form edit!",
      );
    }
  };
  const handleSearchAcSrcorderM = async (
    newFilter,
    pageSize = 10,
    offset = 0,
    isNewSearch = true,
  ) => {
    try {
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      if (offset === 0) {
        setCurrentARMPage(0);
        setCurrentARMPageSize(pageSize);
        setCurrentARMOffset(0);
        setCurrentVwAcSrcorderPage(0);
        setCurrentARMOffset(0);
      }
      const response = await searchAcReqMByFilter(
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
        setData([{ tableName: "AC_ITEM_M", data: response.data }]);
        setSelectRows([response.data[0]]);
        setJumpToRow(response.data[0]);
        if (offset === 0 && response.data.length > 0) {
          setTotalARMData(response.total);
        }
        const airResponse = await fetchAllAcReqOrderByReqNo(
          response.data[0]?.factory_code,
          user.department,
          user.user_code,
          authorization?.find((item) => item.field === "query_level")?.title,
          response.data[0]?.req_no,
          currentAROPageSize,
          0, //
        );

        if (airResponse && airResponse.data) {
          setAcReqOrder([
            { tableName: "AC_REQ_ORDER", data: airResponse.data },
          ]);
          setTotalAROData(airResponse.total || 0);

          if (airResponse.data.length > 0) {
            setSelectAcReqOrder([airResponse.data[0]]);
            setJumptoRowAcReqOrder(airResponse.data[0]);
          } else {
            setSelectAcReqOrder([]);
            setJumptoRowAcReqOrder(null);
          }
        }
      } else {
        setIsSearch(true);
        setSearchData([]);
        setData([{ tableName: "AC_REQ_M", data: [] }]);
        setSelectRows([]);
        setAcReqOrder([{ tableName: "AC_REQ_ORDER", data: [] }]);
        setSelectAcReqOrder([]);
        setTotalData(0);
        setTotalARMData(0);
        setTotalAROData(0);
        setCurrentARMOffset(0);
        setCurrentARMPage(0);
        setCurrentAROOffset(0);
        setCurrentAROPage(0);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchData([]);
      setSelectRows([]);
      setAcReqOrder([]);
    }
  };
  const handleSearch = async (newFilter, pageSize = 5, offset = 0) => {
    try {
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;

      if (offset === 0) {
        setCurrentAcItemRPage(0);
        setCurrentAIRPageSize(10);
        setCurrentAIROffset(0);
        setCurrentAcItemMPage(0);
        setCurrentAIMPageSize(pageSize);
        setCurrentAIMOffset(0);
      }
      const response = await searchAcItemRefByFilter(
        newFilter,
        user.factory,
        user.department,
        user.user_code,
        allow,
        pageSize,
        offset,
      );

      if (response && response.data && response.data.length > 0) {
     
        // KIỂM TRA: Backend có trả masterInfo không?
        let masterData;

        if (response.masterInfo && response.masterInfo.length > 0) {
          // CASE 1: Backend trả về masterInfo (cách MỚI - đầy đủ fields)

          const grouped = groupDetailsByMaster(response.data);

          masterData = response.masterInfo.map((masterInfo) => {
            const group = grouped.find(
              (g) =>
                g.factory_code === masterInfo.factory_code &&
                g.item_acno === masterInfo.item_acno,
            );

            return {
              ...masterInfo, 
              detailCount: group?.detailCount || 0,
            };
          });
        } else {
          //  CASE 2: Backend KHÔNG trả masterInfo (cách CŨ - fallback)

          const grouped = groupDetailsByMaster(response.data);

          masterData = grouped.map((group) => ({
            factory_code: group.factory_code,
            item_acno: group.item_acno,
            item_acname_t: group.item_acname_t,
            item_acname_e: group.item_acname_e,
            item_acname_l: group.item_acname_l,
            detailCount: group.detailCount,
          }));
        }

        // Set data cho AC_ITEM_M
        setData([{ tableName: "AC_ITEM_M", data: masterData }]);
        setTotalData(response.totalMasters);

        const masterPage = Math.floor(offset / pageSize);
        setCurrentAcItemMPage(masterPage);
        setCurrentAIMPageSize(pageSize);
        setCurrentAIMOffset(offset);

        // Details của master đầu tiên
        const grouped = groupDetailsByMaster(response.data);
        const firstMaster = grouped[0];
        const firstMasterAllDetails = firstMaster.details;

        const detailPageSize = currentAIRPageSize || 10;
        const paginatedFirstMasterDetails = firstMasterAllDetails.slice(
          0,
          detailPageSize,
        );

    

        setAcItemRefData([
          {
            tableName: "AC_ITEM_REF",
            data: paginatedFirstMasterDetails,
          },
        ]);

        setTotalAIRData(firstMasterAllDetails.length);
        setCurrentAcItemRPage(0);
        setCurrentAIRPageSize(detailPageSize);
        setCurrentAIROffset(0);

        //  Select master đầu tiên
        setSelectRows([masterData[0]]);
        setJumpToRow(masterData[0]);

        if (paginatedFirstMasterDetails.length > 0) {
          setSelectAcItemRef([paginatedFirstMasterDetails[0]]);
          setJumpToRowAcItemRef(paginatedFirstMasterDetails[0]);
        } else {
          setSelectAcItemRef([]);
          setJumpToRowAcItemRef(null);
        }

        setIsSearch(true);
        setSearchData(response.data); 
      } else {
        setIsSearch(true);
        setSearchData([]);
        setData([{ tableName: "AC_ITEM_M", data: [] }]);
        setAcItemRefData([{ tableName: "AC_ITEM_REF", data: [] }]);
        setSelectRows([]);
        setSelectAcItemRef([]);
        setTotalData(0);
        setTotalAIRData(0);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchData([]);
      setSelectRows([]);
      setSelectAcItemRef([]);
      await fetchAll();
    }
  };
  const mergeVirtualFields = (searchResult, stillChecked) => {
    // Virtual fields được tính toán từ check/edit
    const VIRTUAL_FIELDS = ["plan_iqty", "bl_qty", "ac_req", "is_check"];

    return searchResult.map((item) => {
      const rowKey = `${item.factory_code}-${item.id}`;
      const checkedVersion = stillChecked.find(
        (c) => `${c.factory_code}-${c.id}` === rowKey,
      );

      if (checkedVersion) {
        //  Giữ lại virtual fields từ checked version
        const virtualData = {};
        VIRTUAL_FIELDS.forEach((field) => {
          if (checkedVersion[field] !== undefined) {
            virtualData[field] = checkedVersion[field];
          }
        });
        return { ...item, ...virtualData };
      }

      return item; // item chưa check → dùng nguyên từ response
    });
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
  const handleDetailModal = (row) => {
    setSelectRow(row);
    setOpenDetail(true);
  };
  const onSetFilter = (filter) => {
    setFilter(filter);
  };
  //handler add import material tracking
  const handleAdd = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = Object.fromEntries(form.entries());
    data.factory_code = user.factory;
    data.grt_user = user.user_code;
    data.grt_date = new Date().toISOString();
    data.grt_dept = user.department;
    data.status = 1;
    try {
      const response = await addAcReqM(
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        data,
        currentARMPageSize,
      );
      if (response.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_add",
          `Add successfully with id ${data.req_no}!`,
        );
        try {
          const allow = Array.isArray(authorization)
            ? authorization.find((item) => item.field === "query_level")?.title
            : null;
          const responseData = await fetchAcReqM(
            user?.factory,
            user?.department,
            user?.user_code,
            allow,
            response.size,
            response.offset,
          );
          const addData = responseData.data.find(
            (item) =>
              `${item.factory_code}-${item.req_no}` ===
              `${data.factory_code}-${data.req_no}`,
          );
          setData([
            {
              tableName: "AC_REQ_M",
              data: responseData.data || [],
            },
          ]);

          setHasMore(responseData?.hasMore);
          setSelectRows([addData]);
          setJumpToRow(addData);
          setCurrentARMPage(response?.page);
          setCurrentARMPageSize(response.size);
          setCurrentARMOffset(response.offset);
          setIsSearch(false);
          setSearchFilter(null);
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
        showErrorToast(
          getControlLabel,
          "noti_fail_add_2",
          `Added successfully but failed to refresh data`,
        );
        handleAddClose();
      }
    } catch (error) {

      showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
    }
  };
  const handleEditARM = async (updateRow, title, skipTimestamp = false) => {
    try {
      const { statusText, ac_type, ac_type_name, vend_no_name, ...cleanData } =
        updateRow;
      cleanData.last_user = user.user_code;
      cleanData.last_date = new Date().toISOString();
      const result = await editAcReqM(
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        cleanData,
        currentARMPageSize,
      );
      if (result.success) {
        const successMessage =
          typeof title === "string" && title
            ? title
            : `Edit bom with code(${data.req_no}) successfully !!!`;
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
            await editAcReqM(
              user?.factory,
              user?.department,
              user?.user_code,
              authorization?.find((item) => item.field === "query_level")
                ?.title,
              unlockData,
              currentARMPageSize,
            );
          }

          await refreshCurrentAcReqM();
        } else {
          const resultPage =
            result.size !== undefined
              ? Math.floor(result.position / result.size)
              : currentARMPage;
          const resultOffset =
            result.offset !== undefined ? result.offset : currentARMOffset;

          if (resultPage !== currentARMPage) {
            // Record chuyển page
            const allow = Array.isArray(authorization)
              ? authorization.find((item) => item.field === "query_level")
                  ?.title
              : null;

            const responseData = await fetchAcReqM(
              user?.factory,
              user?.department,
              user?.user_code,
              allow || "1",
              currentARMPageSize,
              resultOffset,
            );

            if (responseData && responseData.data) {
              setData([{ tableName: "AC_REQ_M", data: responseData.data }]);
              setHasMore(responseData?.hasMore);
              setCurrentARMPage(resultPage);
              setCurrentARMOffset(resultOffset);

              const editedRecord = responseData.data.find(
                (item) =>
                  `${item.factory_code}-${item.req_no}` ===
                  `${cleanData.factory_code}-${cleanData.req_no}`,
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
              await editAcReqM(
                user?.factory,
                user?.department,
                user?.user_code,
                authorization?.find((item) => item.field === "query_level")
                  ?.title,
                unlockData,
                currentARMPageSize,
              );
            }

            //  Refresh với current page/offset
            await refreshCurrentAcReqM();
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
    }
  };
  const handleStatusChange = async (
    newStatus,
    actionName,
    allowedFromStatuses = [],
    fetchAction = null,
  ) => {
    if (selectRows.length !== 1) return;
    if (fetchAction) {
      await fetchAction();
    }
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
        freshRecord.locked_information !== user?.clientInfo &&
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
        await refreshCurrentAcReqM();
        return;
      }
      const { FACTORY, ac_type, ...clearData } = freshRecord;
      const updateData = {
        ...clearData,
        status: newStatus,
        last_user: user.user_code,
        last_date: new Date().toISOString(),
      };

      const response = await editAcReqM(
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        updateData,
        currentARMPageSize,
      );

      if (response.success) {
        showSuccessToast(getControlLabel, `noti_success_${actionName}`);
        await refreshCurrentAcReqM();
      }
    } catch (error) {
      console.error(` Error in ${actionName}:`, error);
      showErrorToast(
        getControlLabel,
        "noti_error_generic_1",
        `This has error when ${actionName}!`,
      );
    }
  };

  const handleEditVAS = async (update, title) => {
    try {
      let { statusText, ...data } = update;

      //  Fix is_check: kiểm tra đúng bằng rowKey thay vì reference
      const editedRowKey = `${data.factory_code}-${data.id}`;
      const isChecked = selectVwAcSrcorder.some(
        (r) => `${r.factory_code}-${r.id}` === editedRowKey,
      );

      data = {
        ...data,
        is_check: isChecked ? "Y" : "N",
        is_max: isCheckMax,
      };
      data.last_user = user.user_code;
      data.last_date = new Date().toISOString();

      const response = await editVwAcSrcorder(user.access_token, data);
      if (response.success) {
        const successMessage =
          typeof title === "string" && title
            ? title
            : `Edit ac srcorder with code(${data.id}) successfully !!!`;
        showSuccessToast(getControlLabel, "noti_success_edit", successMessage);

        const rowKey = editedRowKey;

        //  Tách virtual fields ra, chỉ update DB fields lên state
        // Không cho data override plan_iqty/bl_qty/ac_req/is_check của các row khác
        const { plan_iqty, bl_qty, ac_req, is_check, ...dbFields } = data;

        setVwAcSrorderData((prev) =>
          prev.map((item) =>
            `${item.factory_code}-${item.id}` === rowKey
              ? { ...item, ...dbFields } //  Giữ nguyên virtual fields của item
              : item,
          ),
        );

        setSelectCheckVwAcSrcorder((prev) =>
          prev.map((item) =>
            `${item.factory_code}-${item.id}` === rowKey
              ? { ...item, ...dbFields } //  is_check của row này vẫn "Y"
              : item,
          ),
        );

        setSelectVwAcSrcorder((prev) =>
          prev.map((item) =>
            `${item.factory_code}-${item.id}` === rowKey
              ? { ...item, ...dbFields }
              : item,
          ),
        );

        handleEditVwAcSrorderClose(data);
      }
    } catch (error) {
      showErrorToast(getControlLabel, "noti_edit_fail_no_item", error?.message);
      throw error;
    }
  };
  //handler search by filter
  const handleSearchByFilter = async (
    filteredShoe,
    pageSize = 5,
    offset = 0,
  ) => {
    try {
      const search = filteredShoe?.search || {};
      const hasSearchCriteria = Object.keys(search).length > 0;
      const actualPageSize = pageSize ?? currentVwAcSrcorderPageSize;
      const isNewFilter =
        JSON.stringify(filteredShoe) !== JSON.stringify(searchFilter);
      const actualOffset = isNewFilter
        ? 0
        : (offset ?? currentVwAcSrcorderOffset);
      if (!hasSearchCriteria) {
        setIsSearch(false);
        setSearchFilter(null);
        await fetchAll();
        return;
      }
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;
      if (offset === 0) {
        setCurrentARMPage(0);
        setCurrentARMPageSize(pageSize);
        setCurrentARMOffset(0);
      }
      const response = await searchAcReqMByFilter(
        filteredShoe,
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        actualPageSize,
        actualOffset,
      );
      setIsSearch(true);
      setSearchFilter(filteredShoe);
      if (response && response.data) {
        if (response.data.length === 0) {
          setSelectRows([]);
          setData([{ tableName: "AC_REQ_M", data: response.data }]);
          setTotalARMData(0);
          setCurrentARMPage(0);
          setCurrentARMOffset(0);
          setHasMore(false);
        } else {
          setSelectRows([response.data[0]]);
          setTotalARMData(response.total);
          setJumpToRow(response.data[0]);
          setData([{ tableName: response.tableName, data: response.data }]);
        }
      }
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_search", error.message);
    }
  };
  //handler cancel
  const handleCancel = () => {
    handleStatusChange(0, "cancel", [1, 2]);
  };
  const handleConfirm = async () => {
    if (selectRows.length !== 1) return;
    await handleStatusChange(7, "confirm", [1, 2], async () => {
      await handleApprove();
      await confirmAll(
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        selectRows[0]?.req_no,
      );
      await fetchDataByReqNo(true);
    });
  };
  const handleUnconfirm = async () => {
       if (selectRows.length !== 1) return;
      await handleStatusChange(1, "confirm", [7], async () => {
      await handleRevertApprove();
      await refreshCurrentAcReqM();
      await fetchDataByReqNo(true);
    });
  };

  const handleClose = () => {
    handleStatusChange(9, "close", [1, 7]);
  };
  const handleCheck = () => {
    handleStatusChange(2, "close", [1, 7]);
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
    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;
    await exportExcelARM(
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
      selectRows[0]?.req_no,
      searchFilter?.search,
    );
  };
  //handler send file image
  const handleFile = (e) => {
    const selectedFiled = e.target.files[0];
    if (selectedFiled) {
      setFile(selectedFiled);
    }
  };
  const handleCheckBoxVAAAll = async (isChecked) => {
    const allData = searchFilter;
    const result = await checkBox(
      user?.access_token,
      user?.factory,
      isChecked ? "Y" : "N",
      null,
      allData,
    );
    if (isChecked && result?.data?.items) {
      const itemMap = new Map(
        result.data.items.map((i) => [`${i.chk_no}-${i.chk_seq}`, i]),
      );
      const freshData = VwAcAllChkData.map((row) => {
        const key = `${row.chk_no}-${row.chk_seq}`;
        const processed = itemMap.get(key);
        return processed
          ? {
              ...row,
              bl_qty: processed.bl_qty,
              ac_req: processed.ac_req,
              is_check: "Y",
            }
          : row;
      });
      setVwAcAllChkData(freshData);
      setSelectCheckVwAcAllChk(allData);
    } else {
      const freshData = VwAcAllChkData.map((row) => ({
        ...row,
        bl_qty: null,
        ac_req: null,
        is_check: null,
      }));
      setVwAcAllChkData(freshData);
      setSelectCheckVwAcAllChk([]);
    }

    setTTLQTY(result?.data?.ttl_qty || 0);
    setSelectVwAcAllChk(allData.length > 0 ? [allData[0]] : []);
  };
  const handleCheckBox = async (rows, targetRow = null) => {
    const normalizedRows = Array.isArray(rows) ? rows : rows ? [rows] : [];
    const currentRow = targetRow || selectVwAcAllChk[0] || normalizedRows[0];
    if (!currentRow) return;

    const normalizeDate = (date) => {
      if (!date) return null;
      return new Date(date).toISOString().split("T")[0];
    };

    const isCurrentRowChecked = normalizedRows.some(
      (r) =>
        normalizeDate(r.rcpt_date) === normalizeDate(currentRow.rcpt_date) &&
        String(r.chk_no) === String(currentRow.chk_no) &&
        parseFloat(r.chk_seq) === parseFloat(currentRow.chk_seq),
    );

    const rowKey = `${currentRow.factory_code}-${currentRow.rcpt_date}-${currentRow.chk_no}-${currentRow.chk_seq}`;

    if (!isCurrentRowChecked) {
      // ── UNCHECK ──
      // normalizedRows đã bỏ row này rồi → set thẳng
      setSelectCheckVwAcAllChk(normalizedRows);

      const result = await checkBox(
        user?.access_token,
        currentRow?.factory_code,
        "N",
        currentRow,
      );
      const freshData = VwAcAllChkData.map((f) =>
        `${f.factory_code}-${f.rcpt_date}-${f.chk_no}-${f.chk_seq}` === rowKey
          ? { ...f, bl_qty: null, ac_req: null, is_check: null }
          : f,
      );
      setVwAcAllChkData(freshData);
      setAcReq(result?.data?.ac_req || 0);
      setTTLQTY(result?.data?.ttl_qty || 0);
    } else {
      // ── CHECK ──
      const result = await checkBox(
        user?.access_token,
        currentRow?.factory_code,
        "Y",
        currentRow,
      );

      if (result?.data?.is_check === "N" || !result?.success) {
        // Validation error → uncheck lại row này
        setSelectCheckVwAcAllChk((prev) =>
          prev.filter(
            (r) =>
              `${r.factory_code}-${r.rcpt_date}-${r.chk_no}-${r.chk_seq}` !==
              rowKey,
          ),
        );

        const freshData = VwAcAllChkData.map((f) =>
          `${f.factory_code}-${f.rcpt_date}-${f.chk_no}-${f.chk_seq}` === rowKey
            ? { ...f, bl_qty: null, ac_req: null, is_check: null }
            : f,
        );
        setVwAcAllChkData(freshData);
        setTTLQTY(result?.data?.ttl_qty || 0);
        return {
          success: false,
          message: result?.message || "Cannot check this item",
          isValidationError: true,
        };
      }

      // is_check === "Y" → bình thường
      const newData = {
        ...currentRow,
        bl_qty: result?.data?.bl_qty || 0,
        ac_req: result?.data?.ac_req || 0,
        is_check: "Y",
      };

      setSelectCheckVwAcAllChk((prev) => {
        const exists = prev.some(
          (r) =>
            `${r.factory_code}-${r.rcpt_date}-${r.chk_no}-${r.chk_seq}` ===
            rowKey,
        );
        return exists
          ? prev.map((r) =>
              `${r.factory_code}-${r.rcpt_date}-${r.chk_no}-${r.chk_seq}` ===
              rowKey
                ? newData
                : r,
            )
          : [...prev, newData];
      });

      const freshData = VwAcAllChkData.map((f) =>
        `${f.factory_code}-${f.rcpt_date}-${f.chk_no}-${f.chk_seq}` === rowKey
          ? newData
          : f,
      );
      setVwAcAllChkData(freshData);
      setAcReq(result?.data?.ac_req || 0);
      setTTLQTY(result?.data?.ttl_qty || 0);
    }

    if (!targetRow) {
      setSelectVwAcAllChk([currentRow]);
      setJumptoRowVwAcAllChk(currentRow);
    }
  };
  const handleLeftCheck = async (rows, targetRow) => {
    const normalizedRows = Array.isArray(rows) ? rows : rows ? [rows] : [];
    if (!targetRow) {
      return { success: false, message: "No target row found" };
    }

    const isTargetRowChecked = normalizedRows.some(
      (r) =>
        `${r.factory_code}-${r.id}` ===
        `${targetRow.factory_code}-${targetRow.id}`,
    );
    const rowKey = `${targetRow.factory_code}-${targetRow.id}`;
    let rightSelections = checkboxSelections.get(rowKey) || [];
    let finalPlanIqty = 0;
    //  Resolve IV data: ưu tiên cache, fallback fetch mới
    const cachedIvData = ivDataByRow.get(rowKey);
    let resolvedIvData = cachedIvData;

    if (!resolvedIvData) {
      const response = await fetchAllIvTransDTw(
        targetRow?.order_no,
        targetRow?.order_seq,
        user?.access_token,
      );
      if (response?.success) {
        resolvedIvData = response.data;
        setIvDataByRow((prev) => {
          const updated = new Map(prev);
          updated.set(rowKey, resolvedIvData);
          return updated;
        });
        setIvDTransDTwOData(resolvedIvData);
      }
    }
    if (!isTargetRowChecked) {
      // ────────────────────────────────────
      // CASE 1: UNCHECK
      // ────────────────────────────────────

      setSelectCheckVwAcSrcorder((prev) =>
        prev.filter((row) => `${row.factory_code}-${row.id}` !== rowKey),
      );

      try {
        const result = await fetchCheckLeft({
          factory_code: targetRow?.factory_code,
          order_no: targetRow?.order_no,
          order_seq: targetRow?.order_seq,
          is_check: "N",
          is_max: isCheckMax,
          plan_iqty: null,
        });
        setTTLQTY(result?.ttl_qty || 0);
        // if (rightSelections.length === 0) {
        //   setTotal(0);
        // }
        if (!resolvedIvData || resolvedIvData.length === 0) {
          finalPlanIqty = 0;
        } else {
          if (isCheckMax === "Y") {
            finalPlanIqty = Math.max(
              targetRow?.plan_iqty || 0,
              (targetRow?.order_qty || 0) - (targetRow?.chge_ordqty || 0),
            );
          } else {
            finalPlanIqty = targetRow?.plan_iqty || 0;
          }
        }
        //okawd
        if (!isVASSearch) {
          const updatedCheckedForFetch = selectCheckVwAcSrcorder.filter(
            (row) => `${row.factory_code}-${row.id}` !== rowKey,
          );

          await fetchAllVwAcSrcOrd(
            false,
            currentVwAcSrcorderOffset,
            currentVwAcSrcorderPageSize,
            updatedCheckedForFetch,
            targetRow,
          );

          //  Sau khi fetch xong, kiểm tra right còn check không
          const rightSelections = checkboxSelections.get(rowKey) || [];
          if (rightSelections.length > 0) {
            // Bên phải vẫn còn → giữ lại plan_iqty
            setVwAcSrorderData((prev) =>
              prev.map((f) =>
                `${f.factory_code}-${f.id}` === rowKey
                  ? { ...f, plan_iqty: targetRow?.plan_iqty || 0 }
                  : f,
              ),
            );
            setSelectVwAcSrcorder((prev) =>
              prev.map((r) =>
                `${r.factory_code}-${r.id}` === rowKey
                  ? { ...r, plan_iqty: targetRow?.plan_iqty || 0 }
                  : r,
              ),
            );
          }
        } else {
          // isVASSearch = true - UNCHECK branch
          const updatedChecked = selectCheckVwAcSrcorder.filter(
            (row) => `${row.factory_code}-${row.id}` !== rowKey,
          );

          const rightSelections = checkboxSelections.get(rowKey) || [];

          //  Lấy plan_iqty gốc từ searchVASData thay vì về 0
          const originalRow = searchVASData.find(
            (r) => `${r.factory_code}-${r.id}` === rowKey,
          );


          let resetPlanIqty;
          if (rightSelections.length > 0) {
            // Bên phải vẫn còn check → giữ plan_iqty hiện tại
            resetPlanIqty = targetRow?.plan_iqty || 0;
          } else {
            //  Không có right check → dùng plan_iqty gốc từ search data
            resetPlanIqty = originalRow?.plan_iqty ?? 0;
          }

          const resetData = vwAcSrorderData.map((f) =>
            `${f.factory_code}-${f.id}` === rowKey
              ? {
                  ...f,
                  plan_iqty: resetPlanIqty, //  về đúng giá trị gốc
                  bl_qty: result?.bl_qty || 0,
                  ac_req: result?.ac_req || 0,
                  is_check: null,
                }
              : f,
          );

          const mergedData = mergeVirtualFields(resetData, updatedChecked);
          setVwAcSrorderData(mergedData);

          const reSelected = mergedData.find(
            (r) =>
              `${r.factory_code}-${r.id}` ===
              `${targetRow.factory_code}-${targetRow.id}`,
          );
          setSelectVwAcSrcorder(
            reSelected
              ? [reSelected]
              : mergedData.length > 0
                ? [mergedData[0]]
                : [],
          );
        }
        return { success: true };
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

      if (!resolvedIvData || resolvedIvData.length === 0) {
        if (isCheckMax === "Y") {
          finalPlanIqty = Math.max(
            targetRow?.plan_iqty || 0,
            (targetRow?.order_qty || 0) - (targetRow?.chge_ordqty || 0),
          );
        } else {
          finalPlanIqty = targetRow?.plan_iqty || 0;
        }
      } else {
        if (isCheckMax === "Y") {
          finalPlanIqty = Math.max(
            targetRow?.plan_iqty || 0,
            (targetRow?.order_qty || 0) - (targetRow?.chge_ordqty || 0),
          );
       
        } else {
          finalPlanIqty = targetRow?.plan_iqty || 0;
        }
      }

      try {
        const result = await fetchCheckLeft({
          factory_code: targetRow?.factory_code,
          order_no: targetRow?.order_no,
          order_seq: targetRow?.order_seq,
          is_check: "Y",
          is_max: isCheckMax,
          plan_iqty: finalPlanIqty,
        });

        if (result?.is_check === "Y") {
          const newData = {
            ...targetRow,
            bl_qty: result?.bl_qty || 0,
            ac_req: result?.ac_req || 0,
            plan_iqty:
              isCheckMax === "Y"
                ? finalPlanIqty
                : isCheckMax === "N" && finalPlanIqty
                  ? finalPlanIqty
                  : result?.order_acqty,
            is_check: "Y",
          };

          const freshData = vwAcSrorderData.map((f) => {
            if (`${f.factory_code}-${f.id}` === rowKey) {
              return newData;
            }
            return f;
          });
          setTotal(finalPlanIqty);
          setVwAcSrorderData(freshData);

          setSelectVwAcSrcorder([newData]);

          setSelectCheckVwAcSrcorder((prev) => {
            const exists = prev.some(
              (row) => `${row.factory_code}-${row.id}` === rowKey,
            );
            if (exists) {
              // Update row đã có trong checked list
              return prev.map((row) =>
                `${row.factory_code}-${row.id}` === rowKey ? newData : row,
              );
            } else {
              return [...prev, newData];
            }
          });

          setTTLQTY(result?.ttl_qty || 0);
          const updatedChecked = (() => {
            const exists = selectCheckVwAcSrcorder.some(
              (row) => `${row.factory_code}-${row.id}` === rowKey,
            );
            return exists
              ? selectCheckVwAcSrcorder.map((row) =>
                  `${row.factory_code}-${row.id}` === rowKey ? newData : row,
                )
              : [...selectCheckVwAcSrcorder, newData];
          })();

          if (!isVASSearch) {
            await fetchAllVwAcSrcOrd(
              false,
              currentVwAcSrcorderOffset,
              currentVwAcSrcorderPageSize,
              updatedChecked,
              targetRow,
            );
          } else {
            const mergedData = mergeVirtualFields(
              vwAcSrorderData,
              updatedChecked,
            );
            setVwAcSrorderData(mergedData);
            const reSelected = mergedData.find(
              (r) =>
                `${r.factory_code}-${r.id}` ===
                `${targetRow.factory_code}-${targetRow.id}`,
            );
            setSelectVwAcSrcorder(
              reSelected
                ? [reSelected]
                : mergedData.length > 0
                  ? [mergedData[0]]
                  : [],
            );
          }
          return { success: true };
        } else {
          const targetKey = `${targetRow.factory_code}-${targetRow.id}`;
          setSelectCheckVwAcSrcorder((prev) =>
            prev.filter((row) => `${row.factory_code}-${row.id}` !== targetKey),
          );
          const freshData = vwAcSrorderData.map((f) =>
            `${f.factory_code}-${f.id}` === targetKey
              ? { ...f, plan_iqty: 0, is_check: null }
              : f,
          );
          setVwAcSrorderData(freshData);
          const resetRow = { ...targetRow, plan_iqty: 0, is_check: null };
          setSelectVwAcSrcorder([resetRow]);

          return {
            success: false,
            message: result?.message || "Cannot check this item",
            isValidationError: true,
          };
        }
      } catch (error) {
        console.error("Error checking:", error);
        return {
          success: false,
          message: error?.response?.data?.message || "An error occurred",
        };
      }
    }
  };
  const handleCheckMax = useCallback(
    async (event) => {
      const newValue = event.target.checked ? "Y" : "N";

      if (selectCheckVwAcSrcorder.length > 0) {
        showWarningToast(getControlLabel, "noti_warn_recheck", "...");
        await clearRdTemp(user?.access_token);
        setVwAcSrorderData((prev) =>
          prev.map((row) => ({
            ...row,
            plan_iqty: null,
            bl_qty: null,
            ac_req: null,
            is_check: null,
          })),
        );
        setSelectVwAcSrcorder((prev) =>
          prev.map((row) => ({
            ...row,
            plan_iqty: null,
            bl_qty: null,
            ac_req: null,
            is_check: null,
          })),
        );
        setSelectCheckVwAcSrcorder([]);
        setCheckboxSelections(new Map());
        setTTLQTY(0);
        setTotal(0);
      }
      setIsCheckMax(newValue);
      if (!isVASSearch) {
        await fetchAllVwAcSrcOrd(
          false,
          currentVwAcSrcorderOffset,
          currentVwAcSrcorderPageSize,
          [],
          null,
          newValue,
        );
      }
    },
    [
      selectCheckVwAcSrcorder,
      user?.access_token,
      currentVwAcSrcorderOffset,
      currentVwAcSrcorderPageSize,
      isVASSearch,
    ],
  );
  const handleCheckMaxCondition = (checkedRow) => {
    if (isCheckMax === "Y" && checkedRow) {
      return true;
    }
    return false;
  };
  const handleAROPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentAROPage(newPage);
    setCurrentAROPageSize(newPageSize);
    setCurrentAROOffset(newOffset);
    //  CHECK: Nếu đang search DETAILS (có searchData)
    if (isSearch && searchData.length > 0 && selectRows.length > 0) {
      const selectedMaster = selectRows[0];
      //  Lọc tất cả details của master đang chọn từ searchData
      const allMasterDetails = searchData.filter(
        (detail) =>
          detail.factory_code === selectedMaster.factory_code &&
          detail.req_no === selectedMaster.req_no,
      );
      //  Phân trang client-side
      const paginatedDetails = allMasterDetails.slice(
        newOffset,
        newOffset + newPageSize,
      );

      //  Update data với details đã phân trang
      setAcReqOrder([
        {
          tableName: "AC_REQ_ORDER",
          data: paginatedDetails,
        },
      ]);

      //  Select detail đầu tiên của page mới
      if (paginatedDetails.length > 0) {
        setSelectAcReqOrder([paginatedDetails[0]]);
        setJumptoRowAcReqOrder(paginatedDetails[0]);
      } else {
        setJumptoRowAcReqOrder([]);
      }

      return; //  DỪNG TẠI ĐÂY
    }

    // KHÔNG search HOẶC search MASTER (searchData = [])
    // Gọi API để fetch details
   
    await fetchDataByReqNo(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.req_no) {
      return;
    }
  };
  const handleARMPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentARMPage(newPage);
    setCurrentARMPageSize(newPageSize);
    setCurrentARMOffset(newOffset);

    if (isSearch && searchFilter) {
      const search = searchFilter.search || {};
      const hasAIM =
        "status" in search || "req_no" in search || "invoice_no" in search;
      const hasOther = Object.keys(search).some(
        (k) => k !== "status" && k !== "req_no" && k !== "invoice_no",
      );

      //  CASE 1: Search Master
      if (hasAIM && !hasOther) {
        await handleSearchAcSrcorderM(searchFilter, newPageSize, newOffset);
        return;
      } else {

        const allow = Array.isArray(authorization)
          ? authorization.find((item) => item.field === "query_level")?.title
          : null;

        await handleSearch(searchFilter, newPageSize, newOffset);

        return;
      }
    }
    const responseData = await fetchAcReqM(
      user?.factory,
      user?.department,
      user?.user_code,
      authorization.find((item) => item.field === "query_level")?.title,
      newPageSize,
      newOffset,
    );

    setData([
      {
        tableName: "AC_REQ_M",
        data: responseData.data || [],
      },
    ]);
    setHasMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectRows([responseData.data[0]]);
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

  const createVendNoDropdownCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(authorization)
          ? authorization.find((item) => item.field === "query_level")?.title
          : "1";
        const result = await fetchAllVendNoByStatus(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          language,
          page,
          pageSize,
          searchText,
          false,
        );
        const newData = [...result?.data, { vend_no: "", vend_name: "null" }];
        return {
          data: newData || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error(`Error fetching dropdown:`, error);
        return {
          data: [],
          total: 0,
          pageSize: pageSize,
        };
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
          false,
        );
        const newData = [...result?.data, { code_no: "", code_name: "null" }];
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
    vend_no: createVendNoDropdownCallback(),
    ac_type: createBasicCallback("CDC"),
  };
  return (
    <>
      {/* ========== MAIN CONTENT AREA ========== */}
      <Box sx={{ p: 2 }}>
        <Container maxWidth="xl">
          <Stack
            direction="row"
            flexWrap="wrap"
            sx={{ rowGap: 1, width: "100%" }}
          >
            <Paper
              sx={{
                width: "100%",
                maxWidth: "100%",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <Box style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                <Box>
                  <DataTable
                    data={data[0]?.data}
                    tableName={"AC_REQ_M"}
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
                    onDirectImport={handleOpenDirectImport}
                    onVNImport={handleOpenVNImport}
                    onCheckMax={handleCheckMax}
                    isCheckMax={isCheckMax}
                    onApprove={handleApprove}
                    onAddContractNumber={handleAddContractNumber}
                    totalData={totalARMData || 0}
                    onPageChange={handleARMPageChange}
                    currentPage={currentARMPage}
                    currentPageSize={currentARMPageSize}
                    onFetchData={fetchAllAcType}
                    dropDownValues={acTypeDropdown}
                    setDropdownValues={setAcTypeDropdown}
                    hasMore={hasMore}
                    isSearch={isSearch}
                    getFetchData={getFetchData}
                  />
                </Box>
                <Box>
                  <AcReqOrder
                    fetchDataByReqNo={fetchDataByReqNo}
                    parentKeyField="req_no"
                    fetchAcReqOrderRecordFromDB={fetchAcReqOrderRecordFromDB}
                    selectRows={selectRows}
                    data={acReqOrder}
                    setData={setAcReqOrder}
                    setSelectAcReqOrder={setSelectAcReqOrder}
                    selectAcReqOrder={selectAcReqOrder}
                    subAuthentication={authorization}
                    // isSearch={isSearch}
                    searchData={searchData}
                    totalAROData={totalAROData}
                    currentAROPage={currentAROPage}
                    currentAROPageSize={currentAROPageSize}
                    currentAROOffset={currentAROOffset}
                    setCurrentAROPage={setCurrentAROPage}
                    setCurrentAROPageSize={setCurrentAROPageSize}
                    setCurrentAROOffset={setCurrentAROOffset}
                    setTotalAROData={setTotalAROData}
                    onAROPageChange={handleAROPageChange}
                    jumpToRow={jumptoRowAcReqOrder}
                    setJumpToRow={setJumptoRowAcReqOrder}
                    hasMore={hasAROMore}
                    setHasMore={setHasAROMore}
                    isVnImport={isVNImport ? true : false}
                  />
                </Box>
              </Box>
            </Paper>
          </Stack>
        </Container>
      </Box>
      {/* ========== MODAL/DIALOG COMPONENTS ========== */}
      {/*  Add Factory Modal */}
      <AddAcReqMPage
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
      <EditAcReqMPage
        open={openEdit}
        onClose={handleEditClose}
        acReqM={selectRows.length > 0 ? selectRows[0] : null}
        handleEdit={handleEditARM}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={authorization}
        language={language}
      />
      <Import_2Page
        fetchAllVwAcSrcOrder={fetchAllVwAcSrcOrd}
        vwAcSrorderData={vwAcSrorderData}
        setVwAcSrorderData={setVwAcSrorderData}
        selectVwAcSrcorder={selectVwAcSrcorder}
        setSelectVwAcSrcorder={setSelectVwAcSrcorder}
        IvDTransDTwOData={IvDTransDTwOData}
        setIvDTransDTwOData={setIvDTransDTwOData}
        selectIvDTransDTwO={selectIvDTransDTwO}
        setSelectIvDTransDTwO={setSelectIvDTransDTwO}
        onClose={handleCloseDirectImport}
        openImport={isDirectImport}
        selectRows={selectRows.length ? selectRows : []}
        parentSearchFilter={searchFilter}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        language={language}
        user={user}
        fetchIvDTransDTwOByvwAcSrcorder={fetchIvDTransDTwOByvwAcSrcorder}
        onCheckLeft={handleLeftCheck}
        onSelectVwAcSrcorder={handleSelectVwAcSrcorder}
        onSelectIvTransDTw={handleSelectIvTransDTw}
        total={total}
        setTotal={setTotal}
        onRightCheck={handleRightCheck}
        onCheckMax={handleCheckMax}
        isCheckMax={isCheckMax}
        checkboxSelections={checkboxSelections}
        onCheckboxChange={handleCheckboxChange}
        selectionsVersion={selectionsVersion}
        selectCheckVwAcSrcorder={selectCheckVwAcSrcorder}
        onCheckVwAcSrcorder={handleCheckVwAcSrcorder}
        onHandleCheck={handleLeftCheck}
        selectCheckIvDTransDTwO={selectCheckIvDTransDTwO}
        onCheckIvDTransDTwO={handleCheckIvTransDTw}
        onCustomsSelection={handleCustomCheck}
        customSelections={customSelections}
        onOpenEditVwAcSrcorder={handleOpenVwAcSrorderEdit}
        openEditVwAcSrorder={openEditVwAcSrcorder}
        onOpenEditVwAcSrcorderClose={handleEditVwAcSrorderClose}
        ttl={ttlQTY}
        jumpToRow={jumptoRowVwAcSrcorder}
        setJumpToRow={setJumptoRowVwAcSrcorder}
        selectCheckRef={selectCheckRef}
        onConfirmAll={confirmAllVwAcSrcorder}
        handleEditVwAcSrcorder={handleEditVAS}
        onUpdateBlQty={handleUpdateBlQty}
        totalData={totalData || 0}
        setTotalData={setTotalData || 0}
        totalITDTData={totalITDTData || 0}
        setITDTTotal={setTotalITDTData || 0}
        currentVwAcSrcorderPageSize={currentVwAcSrcorderPageSize}
        currentVwAcSrcorderPage={currentVwAcSrcorderPage}
        currentVwAcSrcorderOffset={currentVwAcSrcorderOffset}
        setCurrentVwAcSrcorderOffset={setCurrentVwAcSrcorderOffset}
        setCurrentVwAcSrcorderPageSize={setCurrentVwAcSrcorderPageSize}
        setCurrentVwAcSrcorderPage={setCurrentVwAcSrcorderPage}
        currentITDTPageSize={currentITDTPageSize}
        currentITDTPage={currentITDTPage}
        currentITDTOffset={currentITDTOffset}
        setCurrentITDTOffset={setCurrentITDTOffset}
        setCurrentITDTPageSize={setCurrentITDTPageSize}
        setCurrentITDTPage={setCurrentITDTPage}
        setJumptoRowIvTransDTw={setJumptoRowIvDTransDTw}
        jumptoRowIvTransDTw={jumptoRowIvDTransDTw}
        authorization={authorization}
        searchFilterFromParent={searchFilter}
        hasVASMore={hasVASMore}
        setHasVASMore={setHasVASMore}
        hasITDTMore={hasITDTMore}
        setHasITDTMore={setHasITDTMore}
        searchData={searchVASData}
        isSearch={isVASSearch}
        setSearchData={setSearchVASData}
        setIsSearch={setIsVASSearch}
        mergeVirtualFields={mergeVirtualFields}
        onCheckBoxAll={handleCheckBoxAll}
      />
      <Import_3Page
        fetchAllVwAcAllChkByReqNo={fetchVwAcAllChkByReqNo}
        data={VwAcAllChkData}
        setData={setVwAcAllChkData}
        onClose={handleCloseVNImport}
        selectVwAcAllChk={selectVwAcAllChk}
        setSelectVwAcAllChk={setSelectVwAcAllChk}
        selectCheckVwAcAllChk={selectCheckVwAcAllChk}
        setSelectCheckVwAcAllChk={setSelectCheckVwAcAllChk}
        openImport={isVNImport}
        selectRows={selectRows.length ? selectRows : []}
        selectAcReqOrder={selectAcReqOrder}
        onSelectvwAcAllChk={handleSelectVwAcAllChk}
        onCheckVwAcAllChk={handleCheckVwAcAllChk}
        onCheckBox={handleCheckBox}
        onConfirmAll={confirmAllVwAcAllChk}
        ttlQTY={ttlQTY}
        acReq={acReq}
        hasMore={hasVAAMore}
        setHasMore={setHasVAAMore}
        totalData={totalVAAData}
        currentOffset={currentVAAOffset}
        currentPage={currentVAAPage}
        currentPageSize={currentVAAPageSize}
        setCurrentPage={setCurrentVAAPage}
        setCurrentPageSize={setCurrentVAAPageSize}
        setCurrentOffset={setCurrentVAAOffset}
        setTotalData={setTotalVAAData}
        parentSearchFilter={searchFilter}
        onCheckBoxAll={handleCheckBoxVAAAll}
        isSearch={isVAASearch}
        setIsSearch={setIsVAASearch}
        isLoading={isVAALoading}
        setIsLoading={setIsVAALoading}
      />
      <ConfirmPopup
        openLink={openConfirmPopup}
        onClose={handleCloseConfirmPopup}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        onConfirm={() => {
          handleCloseAll();
          handleUpdateBlQty(pendingBlQtyData, true);
        }}
        selectRows={selectVwAcSrcorder.length > 0 ? selectVwAcSrcorder : []}
        message={message}
        onCancel={handleCloseAll}
      />
    </>
  );
};
export default AcReqM;
