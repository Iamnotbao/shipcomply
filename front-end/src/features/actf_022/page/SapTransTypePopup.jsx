import { useEffect, useState } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import { exportExcelAcItemM } from "../../../service/ac_item_m/AcItemMService";
import {
  fetchAllSePlanOrdLink,
  searchLinkFilter,
} from "../../../service/se_plan_ord/sePlanOrd";
import RdTemp from "./RdTemp";
import SanTransType from "./SapTransType";
import TextImport from "./TextImport";

const SapTransTypePopup = ({
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
  setSearchFilter,
  setCurrentPage,
  setCurrentPageSize,
  onPageChange,
  user,
  onOpenPopup,
  selectCheck,
  handleCheckboxChange,
  selectionsVersion,
  onTransfer,
  onAutoAdd,
  getFetchData,
  dropdownValues,
  setDropdownValues,
  onOk,
  rdTempdata,
  setRdTempData,
  sapTransTypeData,
  setSapTransTypData,
  textImportData,
  setTextImporData,
  selectRT,
  setSelectRT,
  selectTI,
  setSelectTI,
  selectSTT,
  setSelectSTT,
  jumpToRowRT,
  setJumpToRowRT,
  jumpToRowTI,
  setJumpToRowTI,
  jumpToRowSTT,
  setJumpToRowSTT,
  hasRTMore,
  setHasRTMore,
  hasTIMore,
  setHasTIMore,
  hasSTTMore,
  setHasSTTMore,
  ref,
  onOpenPp026Excel,
  onClosePp026Excel,
  openPp026Excel,
  pp026ExcelForm,
  setPP026ExcelForm,
  getControlLabel,
  getColumnLabel,
}) => {
  const theme = useTheme();
  const [selectPermission, setSelectPermission] = useState([]);
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const { fetchTableControlTranslations, language } = useColumnTranslation();
  
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
        fetchAllSePlanOrdLink(
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
      setData([
        {
          tableName: "SE_PLAN_ORD_LINK",
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
    if (jumpToRow) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow]);

  return (
    <>
      <Dialog open={openLink} onClose={onClose} maxWidth="xxl" fullWidth>
        <DialogContent>
          <Box>
            <Box
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
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
                {getControlLabel("ttl_saps_trans_type", "Sap Trans Type")}
              </Typography>
              <Button onClick={onClose} variant="contained" color="error">
                <CloseIcon />
              </Button>
            </Box>
            <Box
              display={"flex"}
              flexDirection={"row"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Box flex={1}>
                {" "}
                <RdTemp
                  data={rdTempdata}
                  setData={setRdTempData}
                  selectRows={selectRT}
                  setSelectRows={setSelectRT}
                  setTextImporData={setTextImporData}
                  setJumpToRow={setJumpToRowRT}
                  jumpToRow={jumpToRowRT}
                  setJumpToRowTI={setJumpToRowTI}
                  jumpToRowTI={jumpToRowTI}
                  selectTI={selectTI}
                  setSelectTI={setSelectTI}
                  setHasMoreTI={setHasTIMore}
                  ref={ref}
                  onOpenPp026Excel={onOpenPp026Excel}
                  onClosePp026Excel={onClosePp026Excel}
                  openPp026Excel={openPp026Excel}
                  pp026ExcelForm={pp026ExcelForm}
                  setPP026ExcelForm={setPP026ExcelForm}
                />
              </Box>
              <Box flex={1}>
                <SanTransType
                  data={sapTransTypeData}
                  setData={setSapTransTypData}
                  selectRows={selectSTT}
                  setSelectRows={setSelectSTT}
                  jumpToRow={jumpToRowSTT}
                  setJumpToRow={setJumpToRowSTT}
                />
                <TextImport
                  data={textImportData}
                  setData={setTextImporData}
                  selectRows={selectTI}
                  setSelectRows={setSelectTI}
                  jumpToRow={setJumpToRowTI}
                  setJumpToRow={setJumpToRowTI}
                  hasMore={hasTIMore}
                  setHasMore={setHasTIMore}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SapTransTypePopup;
