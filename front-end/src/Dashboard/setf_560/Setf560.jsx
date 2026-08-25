import { useCallback, useEffect, useState } from "react";
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
import { toast } from "react-toastify";
import {
  fetchAcInmDByID,
  fetchAllConfirmedAll,
  fetchAllInmD,
} from "../../service/ac_inm_d/acInmD";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import useAuth from "../../hooks/useAuth";
import { fetchBasicDataCategory } from "../../service/basic_data_category/basicDataCategoryService";
import { searchBasicDataByFilter } from "../../service/basic_data/basicDataService";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../utils/notification/Notification";
import SePlanSize from "../../features/setf_560/component/SePlanSize";
import {
  addSePlanOrd,
  editSePlanOrd,
  exportPDF,
  fetchSePlanOrdByID,
  searchSePlanOrdFilter,
  fetchAllSePlanOrd,
  deleteSePlanOrd,
  exportExcel,
  confirm,
  confirmItemsSePlanOrd,
  unconfirmItemsSePlanOrd,
} from "../../service/se_plan_ord/sePlanOrd";
import AddSePlanOrd from "../../features/setf_560/page/AddSePlanOrd";
import EditSePlanOrd from "../../features/setf_560/page/EditSePlanOrd";
import {
  fetchAllSePlanSize,
  fetchSePlanSizeByID,
} from "../../service/se_plan_size/sePlanSize";
import SdOrdMCLink from "../../features/setf_560/page/SdOrdMC";
import {
  checkBox,
  createPlan,
  fetchAllSOMC,
  getSysTree,
  clearSysTree,
  updatePDD,
} from "../../service/sd_ord_m_c/sdOrdMC";
import DeleteSePlanOrd from "../../features/setf_560/page/DeleteSePlanOrd";

const Setf560 = () => {
  const [data, setData] = useState([]);
  const [sOMCData, setSOMCData] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openAddSSD, setOpenAddSSD] = useState(false);
  const [openPlanDatePopup, setOpenPlanDatePopup] = useState(false);
  const [selectionsVersion, setSelectionsVersion] = useState(0);
  const [selectionsVersionSPO, setSelectionsVersionSPO] = useState(0);
  const [openEdit, setOpenEdit] = useState(false);
  const [sPSData, setSPSData] = useState([]);
  const [jumpToRowSPS, setJumpToRowSPS] = useState(null);
  const [openPermission, setOpenPermission] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [isSOMCSearch, setIsSOMCSearch] = useState(false);
  const [searchSOMCFilter, setSearchSOMCFilter] = useState(null);
  const [searchData, setSearchData] = useState([]);
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [openSOMC, setOpenSOMC] = useState(false);
  const [selectSOMC, setSelectSOMC] = useState([]);
  const [selectCheckSOMC, setSelectCheckSOMC] = useState([]);
  const [jumpToRowSOMC, setJumpToRowSOMC] = useState(null);
  const [selectRow, setSelectRow] = useState({});
  const [selectRows, setSelectRows] = useState([]);
  const [selectCheckSPO, setSelectCheckSPO] = useState([]);
  const [selectCheckSPS, setSelectCheckSPS] = useState([]);
  const [selectionsVersionSPS, setSelectionsVersionSPS] = useState(0);
  const [searchedUsersPermission, setSearchedUsersPermission] = useState([]);
  const [jumpToRow, setJumpToRow] = useState(null);
  const [authorization, setAuthorizations] = useState([]);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectSPS, setSelectSPS] = useState([]);
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
  const [currentSOMCPageSize, setCurrentSOMCPageSize] = useState(10);
  const [currentSOMCPage, setCurrentSOMCPage] = useState(0);
  const [currentSOMCOffset, setCurrentSOMCOffset] = useState(0);
  const [currentSPSPageSize, setCurrentSPSPageSize] = useState(10);
  const [currentSPSPage, setCurrentSPSPage] = useState(0);
  const [currentSPSOffset, setCurrentSPSOffset] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [totalSPSData, setTotalSPSData] = useState(0);
  const [totalSOMCData, setTotalSOMCData] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasAIDMore, setHasAIDMore] = useState(false);
  const [hasSOMCMore, setHasSOMCMore] = useState(false);
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
        fetchAllSePlanOrd(
          user?.access_token,
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
          tableName: "SE_PLAN_ORD",
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
      const response = await fetchSePlanOrdByID(
        user?.access_token,
        selectRows[0]?.factory_code,
        selectRows[0]?.se_id,
        selectRows[0]?.se_ver,
        selectRows[0]?.se_seq,
        selectRows[0]?.pack_gu,
        selectRows[0]?.ship_seq,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };
  const fetchBasicDataRecordFromDB = async (record) => {
    try {
      const response = await fetchSePlanSizeByID(
        user?.access_token,
        user?.factory,
        selectSPS[0]?.se_id,
        selectSPS[0]?.se_ver,
        selectSPS[0]?.se_seq,
        selectSPS[0]?.pack_gu,
        selectSPS[0]?.ship_seq,
        selectSPS[0]?.pk_seq,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };
  //fetch all permisison by user
  const fetchDataByPlanOrd = async (
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
        : currentSPSOffset;
    const pageSize =
      explicitPageSize !== null ? explicitPageSize : currentSPSPageSize;
    const response = await fetchAllSePlanSize(
      user?.access_token,
      user?.factory,
      user?.department,
      user?.user_code,
      allow,
      selectRows[0]?.se_id,
      selectRows[0]?.pack_gu,
      selectRows[0]?.se_ver,
      selectRows[0]?.se_seq,
      selectRows[0]?.ship_seq,
      language,
      pageSize,
      offset,
    );
    if (response && response.data) {
      let childrenData = response.data;
      setSPSData([{ tableName: "SE_PLAN_SIZE", data: childrenData }]);
      // if (response.total !== undefined && response.total !== null) {
      //   setTotalSPSData(response.total);
      // }
      setHasAIDMore(response?.hasMore);
      if (childrenData.length > 0) {
        setSelectSPS([childrenData[0]]);
        setJumpToRowSPS(childrenData[0]);
      } else {
        setSelectSPS([]);
        setJumpToRowSPS(null);
      }
    }
  };
  //fetch all translation by user
  const fetchAllTranslations = async () => {
    try {
      const columns = await fetchTableColumnTranslations(
        "SETF_560",
        "master",
        "se_plan_ord",
      );
      const controls = await fetchTableControlTranslations("SETF_560");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user.factory,
        user.department,
        user.user_code,
        "SETF_560",
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

  //fix o day
  const refreshCurrentData = async () => {
    const currentSelection = selectRows.length > 0 ? selectRows[0] : null;

    if (isSearch && searchFilter) {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;

      let response;
      response = await searchSePlanOrdFilter(
        user?.access_token,
        searchFilter?.search,
        user.factory,
        user.department,
        user.user_code,
        allow,
        language,
        currentPageSize,
        currentOffset,
      );

      if (response && response.data) {
        setData([{ tableName: "SE_PLAN_ORD", data: response.data }]);

        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${currentSelection.se_id}-${parseFloat(currentSelection.se_ver)}-${currentSelection.se_seq}-${parseFloat(currentSelection.pack_gu)}-${parseFloat(currentSelection.ship_seq)}`;
          const foundRecord = response.data.find(
            (item) =>
              `${item.factory_code}-${item.se_id}-${parseFloat(item.se_ver)}-${item.se_seq}-${parseFloat(item.pack_gu)}-${parseFloat(item.ship_seq)}` ===
              currentKey,
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

      const responseData = await fetchAllSePlanOrd(
        user.access_token,
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        language,
        currentPageSize,
        currentOffset,
      );

      if (responseData && responseData.data) {
        setData([{ tableName: "SE_PLAN_ORD", data: responseData.data }]);
        setHasMore(responseData?.hasMore);
        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${currentSelection.se_id}-${parseFloat(currentSelection.se_ver)}-${currentSelection.se_seq}-${parseFloat(currentSelection.pack_gu)}-${parseFloat(currentSelection.ship_seq)}`;
          const updatedRecord = responseData.data.find(
            (item) =>
              `${item.factory_code}-${item.se_id}-${parseFloat(item.se_ver)}-${item.se_seq}-${parseFloat(item.pack_gu)}-${parseFloat(item.ship_seq)}` ===
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
  useEffect(() => {
    const init = async () => {
      const authData = await fetchAllTranslations();
      await fetchAll(authData);
    };
    init();
  }, [language]);

  // useEffect(() => {
  //   if (
  //     !isSearch &&
  //     selectRows &&
  //     selectRows.length > 0 &&
  //     selectRows[0]?.
  //   ) {
  //     fetchDataByPlanOrd();
  //   }
  // }, [selectRows?.[0]?.inm_no, isSearch]);
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
      await confirm(
        user?.access_token,
        user?.factory,
        user?.user_code,
        user?.department,
        allow,
        selectRows[0]?.se_id,
        selectRows[0]?.pack_gu,
        selectRows[0]?.se_ver,
        selectRows[0]?.se_seq,
        selectRows[0]?.ship_seq,
        isSearch && searchData.length > 0 ? searchData : [],
      );
      showSuccessToast(
        getControlLabel,
        "noti_success_confirm",
        "Successfully confirm!",
      );
      await refreshCurrentData();
      await fetchDataByPlanOrd(false, null, null);
      // const response = await fetchAllSePlanSize(
      //   user?.access_token,
      //   user?.factory,
      //   user?.department,
      //   user?.user_code,
      //   allow,
      //   selectRows[0]?.se_id,
      //   selectRows[0]?.pack_gu,
      //   selectRows[0]?.se_ver,
      //   selectRows[0]?.se_seq,
      //   selectRows[0]?.ship_seq,
      //   language,
      //   currentSPSPageSize,
      //   currentSPSOffset,
      // );
      // if (response && response.data) {
      //   setSPSData([{ tableName: "SE_PLAN_SIZE", data: response.data }]);
      //   if (response.data.length > 0) {
      //     const currentItem = selectSPS[0];
      //     const matchedItem = response.data.find(
      //       (item) =>
      //         item.factory_code === currentItem?.factory_code &&
      //         item.inm_no === currentItem?.inm_no &&
      //         item.seq === currentItem?.seq,
      //     );

      //     const itemToSelect = matchedItem || response.data[0];
      //     setSelectSPS([itemToSelect]);
      //     setJumpToRowSPS(itemToSelect);
      //   }
      // }
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

  //Sd_Ord_M_C check box
  const handleCheckBoxAll = async (isChecked) => {
    const currentPageRows = sOMCData[0]?.data || [];
    if (currentPageRows.length === 0) return;

    try {
      await Promise.all(
        currentPageRows.map((row) =>
          checkBox(
            user?.access_token,
            row?.se_id,
            row?.se_seq,
            row?.pack_gu,
            isChecked ? 7 : 1,
            isChecked ? "Y" : "N",
          ),
        ),
      );
    } catch (error) {
      console.error("Error toggling select-all for page:", error);
      showErrorToast(
        getControlLabel,
        "noti_error_check",
        "Cannot update selection for this page",
      );
      return;
    }

    const currentPageKeys = new Set(
      currentPageRows.map((r) => `${r.org_id}-${r.se_id}`),
    );

    const nextChecked = isChecked
      ? [
          ...selectCheckSOMC.filter(
            (sel) => !currentPageKeys.has(`${sel.org_id}-${sel.se_id}`),
          ),
          ...currentPageRows,
        ]
      : selectCheckSOMC.filter(
          (sel) => !currentPageKeys.has(`${sel.org_id}-${sel.se_id}`),
        );

    setSelectCheckSOMC(nextChecked);
    setSelectionsVersion((v) => v + 1);

    // 🔧 targetRow tách khỏi nextChecked — luôn lấy từ trang hiện tại
    // check-all: highlight dòng cuối vừa check (giữ hành vi cũ)
    // uncheck-all: quay về dòng đầu của trang, giống mọi bảng khác trong file
    const targetRow = isChecked
      ? currentPageRows[currentPageRows.length - 1]
      : currentPageRows[0];

    setSelectSOMC([targetRow]);
    setJumpToRowSOMC(targetRow);

    await getSysTree(user?.access_token);
  };
  const handleCheckBoxChange = async (rows, uncheckedRow = null) => {
    const normalizedRows = Array.isArray(rows) ? rows : rows ? [rows] : [];
    let targetRow;
    if (uncheckedRow) {
      targetRow = uncheckedRow;
    } else if (normalizedRows.length > 0) {
      targetRow = normalizedRows[normalizedRows.length - 1];
    } else {
      targetRow = selectCheckSOMC[0];
    }
    setSelectSOMC(targetRow ? [targetRow] : []);
    setSelectCheckSOMC(normalizedRows);
    setSelectionsVersion((v) => v + 1);
    setJumpToRowSOMC(targetRow);
    const result = await handleCheckBox(normalizedRows, targetRow);
    if (result && !result.success) {
      showErrorToast(
        getControlLabel,
        "noti_error_check",
        result.message || "Cannot check this item",
      );
    }
  };
  const handleCheckBox = async (rows, targetRow) => {
    const normalizedRows = Array.isArray(rows) ? rows : rows ? [rows] : [];

    if (!targetRow) {
      return { success: false, message: "No target row found" };
    }

    const isTargetRowChecked = normalizedRows.some(
      (r) =>
        `${r.org_id}-${r.se_id}` === `${targetRow.org_id}-${targetRow.se_id}`,
    );

    try {
      const result = await checkBox(
        user?.access_token,
        targetRow?.se_id,
        targetRow?.se_seq,
        targetRow?.pack_gu,
        isTargetRowChecked ? 7 : 1,
        isTargetRowChecked ? "Y" : "N",
      );
      if (result) {
        await getSysTree(user?.access_token);
      }
      return { success: true };
    } catch (error) {
      console.error(
        isTargetRowChecked ? " Error checking:" : "Error unchecking:",
        error,
      );
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          (isTargetRowChecked
            ? "An error occurred"
            : "Cannot uncheck this item"),
      };
    }
  };
  const syncCheckAfterSearchSOMC = async (searchResult) => {
    const currentChecked = selectCheckSOMC || [];
    if (currentChecked.length === 0) return [];

    const stillChecked = currentChecked.filter((checkedItem) =>
      searchResult.some(
        (searchItem) =>
          `${searchItem.org_id}-${searchItem.se_id}` ===
          `${checkedItem.org_id}-${checkedItem.se_id}`,
      ),
    );

    // Uncheck những item không còn trong kết quả search
    const uncheckedItems = currentChecked.filter(
      (checkedItem) =>
        !searchResult.some(
          (searchItem) =>
            `${searchItem.org_id}-${searchItem.se_id}` ===
            `${checkedItem.org_id}-${checkedItem.se_id}`,
        ),
    );

    for (const item of uncheckedItems) {
      await checkBox(
        user?.access_token,
        item?.se_id,
        item?.se_seq,
        item?.pack_gu,
        1,
        "N",
      );
    }

    setSelectCheckSOMC(stillChecked);
    setSelectionsVersion((v) => v + 1);
    setSelectSOMC(
      stillChecked.length > 0 ? [stillChecked[stillChecked.length - 1]] : [],
    );
    return stillChecked;
  };

  //Se_Plan_ORD check box

  const handleCustomCheckboxChangeSPO = async (item, isChecked) => {
    const currentSelections = selectCheckSPO || [];

    //  CASE 1: SELECT ALL (item là mảng)
    if (Array.isArray(item)) {
      if (isChecked) {
        // Check all
        if (handleCheckboxChangeSPO) {
          await handleCheckboxChangeSPO(item, null);
        }
      } else {
        // Uncheck all
        if (handleCheckboxChangeSPO) {
          await handleCheckboxChangeSPO([], null);
        }
      }
      return;
    }
    let newSelections;

    if (isChecked) {
      newSelections = [...currentSelections, item];
    } else {
      const itemId = `${item.factory_code}-${item.se_id}-${item.se_seq}-${item.se_ver}-${item.pack_gu}-${item.ship_seq}`;
      newSelections = currentSelections.filter((sel) => {
        const selId = `${sel.factory_code}-${sel.se_id}-${sel.se_seq}-${sel.se_ver}-${sel.pack_gu}-${sel.ship_seq}`;
        return selId !== itemId;
      });
    }
    if (handleCheckboxChangeSPO) {
      const uncheckedRow = !isChecked ? item : null;
      await handleCheckboxChangeSPO(newSelections, uncheckedRow);
    }
  };

  const handleCheckboxChangeSPO = async (rows, uncheckedRow = null) => {
    const normalizedRows = Array.isArray(rows) ? rows : rows ? [rows] : [];
    let targetRow;
    if (uncheckedRow) {
      targetRow = uncheckedRow;
    } else if (normalizedRows.length > 0) {
      targetRow = normalizedRows[normalizedRows.length - 1];
    } else {
      targetRow = selectCheckSPO[0];
    }
    setSelectRows(targetRow ? [targetRow] : []);
    setSelectCheckSPO(normalizedRows);
    setSelectionsVersionSPO((v) => v + 1);
    setJumpToRow(targetRow);
  };

  const syncCheckAfterSearchSPO = async (searchResult) => {
    const currentChecked = selectCheckSPO || [];
    if (currentChecked.length === 0) return [];

    const stillChecked = currentChecked.filter((checkedItem) =>
      searchResult.some(
        (searchItem) =>
          `${searchItem.factory_code}-${searchItem.se_id}-${searchItem.se_seq}-${searchItem.se_ver}-${searchItem.pack_gu}-${searchItem.ship_seq}` ===
          `${checkedItem.factory_code}-${checkedItem.se_id}-${checkedItem.se_seq}-${checkedItem.se_ver}-${checkedItem.pack_gu}-${checkedItem.ship_seq}`,
      ),
    );
    setSelectCheckSPO(stillChecked);
    setSelectionsVersionSPO((v) => v + 1);
    setSelectRows(
      stillChecked.length > 0 ? [stillChecked[stillChecked.length - 1]] : [],
    );
    return stillChecked;
  };

  //Se_Plan_Size check box

  const handleCheckboxChangeSPS = (rows, uncheckedRow = null) => {
    const normalizedRows = Array.isArray(rows) ? rows : rows ? [rows] : [];
    let targetRow;
    if (uncheckedRow) {
      targetRow = uncheckedRow;
    } else if (normalizedRows.length > 0) {
      targetRow = normalizedRows[normalizedRows.length - 1];
    } else {
      targetRow = selectCheckSPS[0];
    }
    setSelectSPS(targetRow ? [targetRow] : []);
    setSelectCheckSPS(normalizedRows);
    setSelectionsVersionSPS((v) => v + 1);
    setJumpToRowSPS(targetRow);
  };

  const handleCustomCheckboxChangeSPS = (item, isChecked) => {
    const currentSelections = selectCheckSPS || [];

    // Select all / Uncheck all
    if (Array.isArray(item)) {
      handleCheckboxChangeSPS(isChecked ? item : [], null);
      return;
    }

    let newSelections;
    if (isChecked) {
      newSelections = [...currentSelections, item];
    } else {
      const itemId = `${item.factory_code}-${item.se_id}-${item.se_seq}-${item.se_ver}-${item.pack_gu}-${item.ship_seq}-${item.pk_seq}`;
      newSelections = currentSelections.filter((sel) => {
        const selId = `${sel.factory_code}-${sel.se_id}-${sel.se_seq}-${sel.se_ver}-${sel.pack_gu}-${sel.ship_seq}-${sel.pk_seq}`;
        return selId !== itemId;
      });
    }
    handleCheckboxChangeSPS(newSelections, !isChecked ? item : null);
  };
  const handleClosePlandDate = () => {
    setOpenPlanDatePopup(false);
  };
  const handleOpenPlandDate = () => {
    setOpenPlanDatePopup(true);
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

    const freshRecord = await fetchSePlanOrdByID(
      user?.access_token,
      user?.factory,
      selectRows[0]?.se_id,
      selectRows[0]?.se_ver,
      selectRows[0]?.se_seq,
      selectRows[0]?.pack_gu,
      selectRows[0]?.ship_seq,
    );

    const statusNames = { 0: "Cancelled", 7: "Confirmed", 9: "Closed" };
    if ([0, 7, 9].includes(freshRecord?.status)) {
      showErrorToast(
        getControlLabel,
        "noti_delete_fail_1",
        "Cannot delete! Present status: {status}",
        { status: statusNames[freshRecord.status] },
      );
      await refreshCurrentData();
      return;
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
        "noti_delete_fail_2",
        "Cannot delete!\n\nRecord is edited by: {user}\n\nWait for user to finish!",
        { user: freshRecord.locked_information },
      );
      return;
    }

    setOpenDelete(true);
  };

  const handleDeleteClose = () => {
    setOpenDelete(false);
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
            sum_ctns,
            packing_seid,
            so,
            etd,
            invoice_no,
            se_custid,
            se_custname,
            acc_custid,
            acc_custname,
            column1_name,
            send_typename,
            ship_compname,
            col6_name,
            sendty,
            send_mode,
            col5_name,
            nlt,
            nst,
            grt_deptname,
            grt_username,
            last_username,
            spec_code,
            ex_status_name,
            ...finalLock
          } = unlockData;
          await editSePlanOrd(
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
      const {
        FACTORY,
        cust_name,
        cust_po,
        grt_deptname,
        grt_username,
        last_username,
        sum_ctns,
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

  const handleOpenSOMC = () => {
    setOpenSOMC(true);
  };
  const handleCloseSOMC = async () => {
    setOpenSOMC(false);
    setSelectCheckSOMC([]);
    await clearSysTree(user?.access_token);
  };
  //handler toggle query permission
  const handleSelectQuery = async (row, value) => {
    const updateRow = {
      ...row,
      query_level: value,
    };
    await handleEdit(updateRow);
  };
  const handlePDD = async (search = {}) => {
    const filter = { search: search };
    try {
      const response = await updatePDD(filter, user?.factory, user?.user_code);
      if (response.success) {
        showSuccessToast(getControlLabel, "noti_success_pdd", response.message);
        await refreshCurrentData();
      }
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_pdd", error.message);
    }
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
      const response = await addSePlanOrd(
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
          const responseData = await fetchAllSePlanOrd(
            user.access_token,
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
              tableName: "SE_PLAN_ORD",
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
      await fetchDataByPlanOrd;
    }
  };
  //handler search by category
  const handleSearchMaster = async (
    newFilter,
    pageSize = 10,
    offset = 0,
    isNewSearch = true,
  ) => {
    try {
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const search = newFilter.search || {};
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
        setSPSData([{ tableName: "SE_PLAN_SIZE", data: [] }]);
        setSelectSPS([]);
        setJumpToRowSPS(null);
        await fetchAll();
        return;
      }
      if (offset === 0) {
        setCurrentPage(0);
        setCurrentPageSize(pageSize);
        setCurrentOffset(0);
        setCurrentSPSPage(0);
        setCurrentSPSOffset(0);
      }
      const response = await searchSePlanOrdFilter(
        user.access_token,
        newFilter.search,
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
        setData([{ tableName: "SE_PLAN_ORD", data: response.data }]);
        setSelectRows([response.data[0]]);
        setJumpToRow(response.data[0]);
        if (offset === 0 && response.data.length > 0) {
          setTotalData(response.total);
        }
        if (isNewSearch) {
          await syncCheckAfterSearchSPO(response.data);
        }
      } else {
        if (isNewSearch) {
          await syncCheckAfterSearchSPO([]);
        }
        setIsSearch(true);
        setSearchData([]);
        setData([{ tableName: "SE_PLAN_ORD", data: [] }]);
        setSelectRows([]);
        setSPSData([{ tableName: "SE_PLAN_SIZE", data: [] }]);
        setSelectSPS([]);
        setTotalData(0);
        setTotalSPSData(0);
        setCurrentOffset(0);
        setCurrentPage(0);
        setCurrentSPSOffset(0);
        setCurrentSPSPage(0);
        setCurrentPageSize(pageSize);
        setHasMore(false);
      }
    } catch (error) {
      console.error("handleSearchCategory error:", error);
      setIsSearch(false);
      setSearchData([]);
      setData([{ tableName: "SE_PLAN_ORD", data: [] }]);
      setSelectRows([]);
      setSPSData([{ tableName: "SE_PLAN_SIZE", data: [] }]);
      setSelectSPS([]);
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
        setSPSData([{ tableName: "SE_PLAN_SIZE", data: [] }]);
        setSelectSPS([]);
        setJumpToRowSPS(null);
        await fetchAll();
        return;
      }

      const isNewFilter =
        JSON.stringify(filteredShoe) !== JSON.stringify(searchFilter);
      const actualPageSize = pageSize ?? currentPageSize;
      const actualOffset = isNewFilter ? 0 : (offset ?? currentOffset);
      await handleSearchMaster(
        filteredShoe,
        actualPageSize,
        actualOffset,
        isNewFilter,
      );
    } catch (error) {
      setIsSearch(false);
      setSearchedUsersPermission([]);
      setSelectRows([]);

      setSPSData([{ tableName: "SE_PLAN_SIZE", data: [] }]);
      setSelectSPS([]);

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
        await refreshCurrentData();
        setJumpToRow(freshRecord);
        return;
      }
      if (fetchAction) {
        await fetchAction();
        return;
      }
      const { FACTORY, ...clearData } = freshRecord;
      const updateData = {
        ...clearData,
        status: newStatus,
        last_user: user.user_code,
        last_date: new Date().toISOString(),
      };
      const response = await editSePlanOrd(
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
      if (actionName === "confirm") {
        await handleUpdateConfirm();
        setData((prevData) => {
          if (prevData?.[0]?.data?.length > 0) {
            const updatedRow = prevData[0].data.find(
              (item) =>
                `${item.factory_code}-${item.se_id}-${parseFloat(item.se_ver)}-${item.se_seq}-${parseFloat(item.pack_gu)}-${parseFloat(item.ship_seq)}` ===
                `${updateData.factory_code}-${updateData.se_id}-${parseFloat(updateData.se_ver)}-${updateData.se_seq}-${parseFloat(updateData.pack_gu)}-${parseFloat(updateData.ship_seq)}`,
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
    if (selectCheckSPO.length > 0) {
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      try {
        const result = await confirmItemsSePlanOrd(
          user?.factory,
          user?.user_code,
          user?.department,
          allow,
          selectCheckSPO,
        );
        if (result?.success) {
          showSuccessToast(
            getControlLabel,
            "noti_success_confirm",
            `Confirmed ${result.confirmed_count ?? selectCheckSPO.length} record(s)!`,
          );
          setSelectCheckSPO([]);
          setSelectionsVersionSPO((v) => v + 1);
          await refreshCurrentData();
          await fetchDataByPlanOrd(false, null, null);
        }
      } catch (error) {
        console.error("Error in bulk confirm:", error);
        showErrorToast(
          getControlLabel,
          "noti_fail_confirm_all",
          "Failed to bulk confirm!",
        );
      }
      return;
    }

    // Không check gì → giữ nguyên hành vi cũ, confirm record đang chọn
    if (selectRows.length !== 1) return;
    await handleStatusChange(7, "confirm", [1, 2], async () => {
      await handleUpdateConfirm();
    });
  };

  const handleUnconfirm = async () => {
    if (selectCheckSPO.length > 0) {
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      try {
        const result = await unconfirmItemsSePlanOrd(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          selectCheckSPO,
        );
        if (result?.success) {
          showSuccessToast(
            getControlLabel,
            "noti_success_unconfirm",
            `Unconfirmed ${result.updated_count ?? selectCheckSPO.length} record(s)!`,
          );
          setSelectCheckSPO([]);
          setSelectionsVersionSPO((v) => v + 1);
          await refreshCurrentData();
        }
      } catch (error) {
        console.error("Error in bulk unconfirm:", error);
        showErrorToast(
          getControlLabel,
          "noti_fail_confirm_all",
          "Failed to bulk unconfirm!",
        );
      }
      return;
    }

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

    await exportExcel(
      user?.access_token,
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
      searchFilter?.search,
    );
  };
  const handlePlanDate = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = Object.fromEntries(form.entries());
    try {
      const result = await createPlan(
        user?.access_token,
        user?.factory,
        user?.user_code,
        user?.department,
        data.plan_date,
        user?.user_code,
      );
      if (result.success) {
        showSuccessToast(getControlLabel, "noti_success_plan_date");
        await refreshCurrentData();
      }
      setOpenPlanDatePopup(false);
      handleCloseSOMC();
      await refreshCurrentData();
    } catch (error) {
      if (error?.isDuplicate) {
        showErrorToast(getControlLabel, "noti_fail_duplicate", error.message);
      } else {
        showErrorToast(getControlLabel, "noti_fail_plan_date", error.message);
      }
    }
  };
  //handler edit permission
  const handleEdit = async (updateRow, title, skipTimestamp = false) => {
    const {
      sum_ctns,
      statusText,
      spec_code,
      packing_seid,
      so,
      etd,
      invoice_no,
      se_custid,
      se_custname,
      acc_custid,
      acc_custname,
      column1_name,
      send_typename,
      ship_compname,
      col6_name,
      sendty,
      send_mode,
      col5_name,
      nlt,
      nst,
      grt_deptname,
      grt_username,
      last_username,
      ex_status_name,
      ...cleanData
    } = updateRow;
    if (!skipTimestamp) {
      cleanData.last_user = user.user_code;
      cleanData.last_date = new Date().toISOString();
    }
    const result = await editSePlanOrd(
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
          await editSePlanOrd(
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

          const responseData = await fetchAllSePlanOrd(
            user?.access_token,
            user?.factory,
            user?.department,
            user?.user_code,
            allow || "1",
            language,
            currentPageSize,
            resultOffset,
          );

          if (responseData && responseData.data) {
            setData([{ tableName: "SE_PLAN_ORD", data: responseData.data }]);
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
            await editSePlanOrd(
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
  const handleDelete = async () => {
    const result = await deleteSePlanOrd(
      user?.access_token,
      user?.factory,
      selectRows[0]?.se_id,
      selectRows[0]?.se_ver,
      selectRows[0]?.se_seq,
      selectRows[0]?.pack_gu,
      selectRows[0]?.ship_seq,
      selectCheckSPO,
    );
    if (result?.success) {
      showSuccessToast(getControlLabel, "noti_delete_success", result?.message);
      await refreshCurrentData();
      setSelectCheckSPO([]);
      setSelectionsVersionSPO((v) => v + 1);
      handleDeleteClose();
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

  const handleImportLink = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/setr_560`, "_blank");
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
      await handleSearchMaster(searchFilter, newPageSize, newOffset, false);
      return;
    }
    const responseData = await fetchAllSePlanOrd(
      user?.access_token,
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
        tableName: "SE_PLAN_ORD",
        data: responseData.data || [],
      },
    ]);
    setHasMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectRows([responseData.data[0]]);
    }
  };
  const handleSPSPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentSPSPage(newPage);
    setCurrentSPSPageSize(newPageSize);
    setCurrentSPSOffset(newOffset);

    await fetchDataByPlanOrd(false, newOffset, newPageSize);
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
                    tableName={"SE_PLAN_ORD"}
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
                    onPlanOrd={handleOpenSOMC}
                    onPDD={handlePDD}
                    onDelete={handleDeleteOpen}
                    onImportLink={handleImportLink}
                    checkboxSelection={false}
                    customCheckboxColumn={true}
                    customSelections={selectCheckSPO}
                    onCustomCheckboxChange={handleCustomCheckboxChangeSPO}
                    //  onCustomSelectAll={handleLeftSelectAll}
                    selectionsVersion={selectionsVersionSPO}
                  />
                </Box>
                <Box>
                  <SePlanSize
                    subAuthentication={authorization}
                    factory_code={selectRows[0]?.factory_code}
                    parentSelectRows={selectRows.length > 0 ? selectRows : []}
                    isSearch={isSearch}
                    searchData={searchData}
                    handleSearchByCode={handleSearch}
                    fetchBasicDataRecordFromDB={fetchBasicDataRecordFromDB}
                    data={sPSData}
                    setData={setSPSData}
                    selectRows={selectRows.length > 0 ? selectRows : []}
                    setSelectSPS={setSelectSPS}
                    selectSPS={selectSPS}
                    jumpToRow={jumpToRowSPS}
                    setJumpToRow={setJumpToRowSPS}
                    user={user}
                    currentPage={currentSPSPage}
                    setCurrentPage={setCurrentSPSPage}
                    currentPageSize={currentSPSPageSize}
                    setCurrentPageSize={setCurrentSPSPageSize}
                    currentOffset={currentSPSOffset}
                    setCurrentOffset={setCurrentSPSOffset}
                    searchBasicDataFilter={searchBasicDataFilter}
                    fetchDataByPlanOrd={fetchDataByPlanOrd}
                    openAdd={openAddSSD}
                    setOpenAdd={setOpenAddSSD}
                    handleOpenAdd={handleOpenAddAcInmD}
                    handleClosedAdd={handleClosedAddAcInmD}
                    totalData={totalSPSData}
                    setTotalData={setTotalSPSData}
                    handlePageChange={handleSPSPageChange}
                    hasMore={hasAIDMore}
                    setHasMore={setHasAIDMore}
                    selectCheckSPS={selectCheckSPS}
                    setSelectCheckSPS={setSelectCheckSPS}
                    selectionsVersionSPS={selectionsVersionSPS}
                    setSelectionsVersionSPS={setSelectionsVersionSPS}
                    onCustomCheckboxChangeSPS={handleCustomCheckboxChangeSPS}
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
      <AddSePlanOrd
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
      <EditSePlanOrd
        open={openEdit}
        onClose={handleEditClose}
        editData={selectRows.length > 0 ? selectRows[0] : null}
        handleEdit={handleEdit}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        language={language}
        mapLanguageToColumn={mapLanguageToColumn}
        auth={authorization}
        user={user}
      />
      <SdOrdMCLink
        openLink={openSOMC}
        onClose={handleCloseSOMC}
        data={sOMCData}
        setData={setSOMCData}
        jumpToRow={jumpToRowSOMC}
        setJumpToRow={setJumpToRowSOMC}
        selectRows={selectRows.length > 0 ? selectRows : []}
        selectSOMC={selectSOMC}
        setSelectSOMC={setSelectSOMC}
        subAuthentication={authorization}
        currentPage={currentSOMCPage}
        currentPageSize={currentSOMCPageSize}
        setCurrentOffset={setCurrentSOMCOffset}
        totalData={totalSOMCData}
        setTotalData={setTotalSOMCData}
        hasMore={hasSOMCMore}
        setHasMore={setHasSOMCMore}
        isSearch={isSOMCSearch}
        setIsSearch={setIsSOMCSearch}
        searchFilter={searchSOMCFilter}
        setSearchFilter={setSearchSOMCFilter}
        setCurrentPage={setCurrentSOMCPage}
        setCurrentPageSize={setCurrentSOMCPageSize}
        user={user}
        openPopup={openPlanDatePopup}
        handlePlanDate={handlePlanDate}
        onClosePopup={handleClosePlandDate}
        onOpenPopup={handleOpenPlandDate}
        selectCheckSOMC={selectCheckSOMC}
        handleCheckboxChange={handleCheckBoxChange}
        selectionsVersion={selectionsVersion}
        onCheckBoxAll={handleCheckBoxAll}
        onSyncCheckAfterSearch={syncCheckAfterSearchSOMC}
      />
      <DeleteSePlanOrd
        openLink={openDelete}
        onClose={handleDeleteClose}
        onDelete={handleDelete}
        getColumnLabel={getColumnLabel}
        getControlLabel={getControlLabel}
         selectRows={
          selectCheckSPO.length > 0
            ? selectCheckSPO
            : selectRows.length > 0
              ? [selectRows[0]]
              : []
        }
        deleteKeys={["se_id", "se_ver", "se_seq", "pack_gu", "ship_seq"]}
      />
    </>
  );
};

export default Setf560;
