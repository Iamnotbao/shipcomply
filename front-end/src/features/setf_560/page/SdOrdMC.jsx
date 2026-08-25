import { useEffect, useState } from "react";
import DataTable from "../../../component/table/DataTable";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  useMediaQuery,
  useTheme,
  Typography,
} from "@mui/material";

import { toast } from "react-toastify";
import { fnQuery } from "../../../utils/fnQuery";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import useAuth from "../../../hooks/useAuth";
import CloseIcon from "@mui/icons-material/Close";

import { searchAcItemRefByFilter } from "../../../service/ac_item_ref/AcItemRefService";
import { exportExcelAcItemM } from "../../../service/ac_item_m/AcItemMService";
import {
  fetchAllSOMC,
  searchSOMCByFilter,
} from "../../../service/sd_ord_m_c/sdOrdMC";
import PlanDatePopup from "./PlanDatePopup";

const SdOrdMCLink = ({
  openLink = false,
  onClose,
  data,
  setData,
  jumpToRow,
  setJumpToRow,
  selectSOMC,
  setSelectSOMC,
  subAuthentication = [],
  currentPage,
  currentPageSize,
  setCurrentOffset,
  totalData,
  setTotalData,
  hasMore,
  setHasMore,
  isSearch,
  setIsSearch,
  searchFilter,
  setSearchFilter,
  setCurrentPage,
  setCurrentPageSize,
  onPageChange,
  user,
  openPopup,
  setOpenPopup,
  handlePlanDate,
  onClosePopup,
  onOpenPopup,
  selectCheckSOMC,
  setSelectCheckSOMC,
  handleCheckboxChange,
  selectionsVersion,
  onCheckBoxAll,
  onSyncCheckAfterSearch
}) => {
  const theme = useTheme();
  const [selectPermission, setSelectPermission] = useState([]);
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const {
    fetchTableControlTranslations,
    fetchTableColumnTranslations,
    language,
  } = useColumnTranslation();
  const fetchAllTranslations = async () => {
    try {
      const [columns, controls, auth] = await fnQuery([
        () =>
          fetchTableColumnTranslations(
            "SETF_560",
            "detail",
            "se_plan_ord",
            "SD_ORD_M_C",
          ),
        () => fetchTableControlTranslations("SETF_560"),
      ]);
      const mergedComplexColumn = [...controls?.data, ...columns?.data];
      if (mergedComplexColumn.length > 0)
        setColumnTranslations(mergedComplexColumn);
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const mergedControls = [...controls?.data, ...sysMessages?.data];
      if (mergedControls.length > 0) {
        setControlTranslations(mergedControls);
      }
    } catch (error) {
      console.error(" Error fetching translations:", error);
    }
  };

  const fetchAll = async (authData = null, pageSize = 10, offset = 0) => {
    const authToUse = authData || subAuthentication;

    const allow = Array.isArray(authToUse)
      ? authToUse.find((item) => item.field === "query_level")?.title
      : null;
    setCurrentPage(0);
    setCurrentPageSize(pageSize);
    setCurrentOffset(0);

    let acInmM;
    [acInmM] = await fnQuery([
      () =>
        fetchAllSOMC(
          user.factory,
          user.department,
          user.user_code,
          allow || "1",
          language,
          pageSize,
          offset,
        ),
    ]);
    console.log("adokaowda", acInmM?.data);

    if (acInmM) {
      setData([
        {
          tableName: "SD_ORD_M_C",
          data: acInmM.data,
        },
      ]);
      setHasMore(acInmM?.hasMore);
      setSelectSOMC([acInmM.data[0]]);
      setJumpToRow(acInmM.data[0]);
    }
  };

  useEffect(() => {
    if (openLink) {
      fetchAll();
    }
  }, [openLink]);

  useEffect(() => {
    console.log(" Language changed to:", language);
    fetchAllTranslations();
  }, [language]);

  useEffect(() => {
    if (jumpToRow) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow]);

  const handleSelectChoose = (rows) => {
    setSelectPermission(rows);
  };

  const handlePDF = async () => {
    if (selectedItemRefs.length === 0) {
      toast.warning("Please select items to export!");
      return;
    }

    try {
      const cleanedData = selectedItemRefs.map(
        ({ statusText, ...cleanItem }) => {
          return cleanItem;
        },
      );
      await exportExcelAcItemM(cleanedData);
      toast.success("Export successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed!");
    }
  };

  const handleSearch = async (newFilter, pageSize = 10, offset = 0,isNewSearch = true) => {
    try {
      const allow = Array.isArray(subAuthentication)
        ? subAuthentication.find((item) => item.field === "query_level")?.title
        : null;
      const search = newFilter.search || {};
      const keys = Object.keys(search);

      if (keys.length === 0) {
        setIsSearch(false);
        setTotalData(0);
        setCurrentPage(0);
        setCurrentPageSize(10);
        setCurrentOffset(0);
        setSearchFilter(null);
        setSelectSOMC([]);
        await fetchAll();
        return;
      }
      if (offset === 0) {
        setCurrentPage(0);
        setCurrentPageSize(10);
        setCurrentOffset(0);
      }
      const response = await searchSOMCByFilter(
        newFilter,
        user.factory,
        user.department,
        user.user_code,
        allow,
        language,
        pageSize,
        offset,
      );
      setIsSearch(true);
      setSearchFilter(newFilter);
     if (response && response.data && response.data.length > 0) {
      setIsSearch(true);
      setSearchFilter(newFilter);
      setData([{ tableName: "SD_ORD_M_C", data: response.data }]);
      setTotalData(response?.total);
      setSelectSOMC([response.data[0]]);
      setJumpToRow(response.data[0]);
      if (isNewSearch) {
        await onSyncCheckAfterSearch(response.data); 
      }
    } else {
      // empty result
      if (isNewSearch) {
        await onSyncCheckAfterSearch([]);
      }
      setData([{ tableName: "SD_ORD_M_C", data: [] }]);
      setTotalData(0);
    }
  } catch (error) {
    await fetchAll();
  }
};
  const handleSOMCPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentPage(newPage);
    setCurrentPageSize(newPageSize);
    setCurrentOffset(newOffset);
    if (isSearch && searchFilter) {
      await handleSearch(
        searchFilter,
        newPageSize,
        newOffset,
        false,
      );
      return;
    }
    const allow = Array.isArray(subAuthentication)
      ? subAuthentication.find((item) => item.field === "query_level")?.title
      : null;
    if (isSearch && searchFilter) {
      await handleSearch(searchFilter, newPageSize, newOffset);
      return;
    }
    const responseData = await fetchAllSOMC(
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
        tableName: "SD_ORD_M_C",
        data: responseData.data || [],
      },
    ]);
    setHasMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectSOMC([responseData.data[0]]);
    }
  };
  //  FIXED: Hỗ trợ cả select all và single checkbox
  const handleCustomCheckboxChange = async (item, isChecked) => {
    const currentSelections = selectCheckSOMC || [];

    //  CASE 1: SELECT ALL (item là mảng)
    if (Array.isArray(item)) {
      console.log("🟢 SELECT ALL detected in SdOrdMCLink", item);

      if (isChecked) {
        // Check all
        if (handleCheckboxChange) {
          await handleCheckboxChange(item, null);
        }
      } else {
        // Uncheck all
        if (handleCheckboxChange) {
          await handleCheckboxChange([], null);
        }
      }
      return;
    }
    let newSelections;

    if (isChecked) {
      newSelections = [...currentSelections, item];
    } else {
      const itemId = `${item.org_id}-${item.se_id}`;
      newSelections = currentSelections.filter((sel) => {
        const selId = `${sel.org_id}-${sel.se_id}`;
        return selId !== itemId;
      });
    }
    if (handleCheckboxChange) {
      const uncheckedRow = !isChecked ? item : null;
      await handleCheckboxChange(newSelections, uncheckedRow);
    }
  };
  const handleLeftSelectAll = async (isChecked) => {
    if (onCheckBoxAll) await onCheckBoxAll(isChecked);
  };
  const getControlLabel = (fieldCode, fallback) => {
    if (!controlTranslations || controlTranslations.length === 0) {
      return fallback;
    }
    const translation = controlTranslations.find(
      (item) => item.field === fieldCode,
    );
    return translation?.title || fallback;
  };

  const getColumnLabel = (fieldCode, fallback) => {
    if (!columnTranslations || columnTranslations.length === 0) {
      return fallback;
    }

    const translation = columnTranslations.find(
      (item) => item.field === fieldCode,
    );
    return translation?.title || fallback;
  };

  let columns = 1;
  if (isLgUp) columns = 3;
  else if (isMdUp) columns = 2;
  else if (isSmUp) columns = 1;
  else columns = 1;
  const itemWidth =
    data.length > 0 ? `${100 / data.length}%` : `${100 / columns}%`;

  return (
    <>
      <Dialog open={openLink} onClose={onClose} maxWidth="xl">
        <DialogContent>
          <Box>
            <Box
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
              mb={2}
            >
              <Typography
                variant="h4"
                textTransform={"uppercase"}
                fontWeight={600}
                gutterBottom
                textAlign={"center"}
                flex={1}
                mb={"0"}
              >
                {getControlLabel("ttl_plan_order", "Plan Order")}
              </Typography>
              <Button onClick={onClose} variant="contained" color="error">
                <CloseIcon />
              </Button>
            </Box>
            <Stack
              direction="row"
              flexWrap="wrap"
              sx={{ rowGap: 1, width: "100%" }}
            >
              <div style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                <DataTable
                  data={data[0]?.data || []}
                  tableName={"SD_ORD_M_C"}
                  selectRows={selectSOMC}
                  onSelectChange={handleSelectChoose}
                  onSearch={handleSearch}
                  onPDF={handlePDF}
                  columnTranslations={columnTranslations}
                  controlTranslations={controlTranslations}
                  language={language}
                  getControlLabel={getControlLabel}
                  getColumnLabel={getColumnLabel}
                  jumpToRow={jumpToRow}
                  isSubTable={true}
                  isPopup={true}
                  totalData={totalData}
                  onPageChange={handleSOMCPageChange}
                  currentPage={currentPage}
                  currentPageSize={currentPageSize}
                  hasMore={hasMore}
                  isSearch={isSearch}
                  onPlanDate={onOpenPopup}
                  checkboxSelection={false}
                  customCheckboxColumn={true}
                  customSelections={selectCheckSOMC}
                  onCustomCheckboxChange={handleCustomCheckboxChange}
                  onCustomSelectAll={handleLeftSelectAll}
                  selectionsVersion={selectionsVersion}
                />
              </div>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
      <PlanDatePopup
        openLink={openPopup}
        onClose={onClosePopup}
        getColumnLabel={getColumnLabel}
        getControlLabel={getControlLabel}
        handlePlanDate={handlePlanDate}
      />
    </>
  );
};

export default SdOrdMCLink;
