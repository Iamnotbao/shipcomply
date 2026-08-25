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
  Paper,
} from "@mui/material";

import { toast } from "react-toastify";
import { fnQuery } from "../../../utils/fnQuery";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import useAuth from "../../../hooks/useAuth";
import CloseIcon from "@mui/icons-material/Close";
import {
  addBasicData,
  editBasicData,
  fetchBasicDataByCate,
} from "../../../service/basic_data/basicDataService";
import { searchAcItemRefByFilter } from "../../../service/ac_item_ref/AcItemRefService";
import { exportExcelAcItemM } from "../../../service/ac_item_m/AcItemMService";
const AcItemProdMSizeLink = ({
  openSizeLink = false,
  onClose,
  isSearch = false,
  selectRows,
  subAuthentication = [],
  selectedItemSizeRefs,
  data,
  setData,
  selectRdSizeD,
  setSelectRdSizeD,
  hanldeSearchForRDSizeD,
  onSave,
  onDataRSDBySize,
  getColumnLabel,
  getControlLabel,
  language,
  totalData,
  onPageChange,
  currentPage,
  currentOffset,
  currentPageSize,
  setCurrentPage,
  setCurrentOffset,
  setCurrentPageSize,
  setTotalData,
  setSearchData,
  searchFilter,
  hasMore,
  setHasMore,
}) => {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const theme = useTheme();
  const [openDetail, setOpenDetail] = useState(false);
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const [jumpToRow, setJumpToRow] = useState(null);
  const { user } = useAuth();
  
  console.log("check total",totalData,isSearch);
  
  //selectRows
  useEffect(() => {
    const handleDataFetch = async () => {
      if (
        !selectRows ||
        selectRows.length === 0 ||
        !selectRows[0]?.factory_code ||
        !selectRows[0]?.customs_shoe_id
      ) {
        console.log("[RD_SIZE_D] No valid parent selected");
        setData([{ tableName: "RD_SIZE_D", data: [] }]);
        setSelectRdSizeD([]);
        return;
      }
      //  KIỂM TRA: Nếu đang search, KHÔNG GỌI API
      if (!isSearch) {
        setCurrentPage(0);
        setCurrentOffset(0);
        setCurrentPageSize(10);
        await onDataRSDBySize(true, 0, 10);
      }
    };
    handleDataFetch();
  }, [
    selectRows?.[0]?.factory_code,
    selectRows?.[0]?.customs_shoe_id,
    isSearch,
    openSizeLink,
  ]);

  useEffect(() => {
    if (jumpToRow) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow]);

  const handleAddClose = () => {
    setOpenAdd(false);
  };
  const handleOpenAdd = () => {
    if (selectRows.length === 0) {
      toast.error("Please choose factory before list all permission!");
      return;
    }
    if (
      selectRows[0].status === 0 ||
      selectRows[0].status === 1 ||
      selectRows[0].status === 9
    ) {
      toast.error("this category is invalid to add!");
      return;
    }
    const allowAdd = subAuthentication?.find(
      (item) => item.field === "allow_add"
    )?.title;
    if (user?.user_code !== "admin" && allowAdd === "N") {
      return;
    }
    setOpenAdd(true);
  };
  const handleEditClose = () => {
    setOpenEdit(false);
  };
  const handleOpenEdit = () => {
    if (
      selectRows[0].status === 0 ||
      selectRows[0].status === 1 ||
      selectRows[0].status === 9
    ) {
      toast.error("this category is invalid to edit!");
      return;
    }
    if (data[0].data.length > 0) {
      if (user.user_code !== "admin") {
        const allowModify = subAuthentication?.find(
          (item) => item.field === "modify_level"
        )?.title;
        const allowStatus = selectRdSizeD[0]?.status;
        console.log("mod_lev: ", allowModify);

        if (
          allowModify === "2" &&
          selectRows[0]?.grt_dept !== user.department
        ) {
          return;
        }
        if (
          allowModify === "3" &&
          selectRdSizeD[0]?.grt_user !== user.user_code
        ) {
          return;
        }
        if (allowStatus === 7 || allowStatus === 0 || allowStatus === 9) {
          return;
        }
        const allow = subAuthentication?.find(
          (item) => item.field === "allow_modify"
        )?.title;
        if (user?.user_code !== "admin" && allow === "N") {
          return;
        }
      }
      setOpenEdit(true);
    }
  };
  const handleModal = (row) => {
    setSelectRow(row);
    setOpen(true);
  };
  const handleSelectQuery = async (row, value) => {
    const updateRow = {
      ...row,
      query_level: value,
    };
    await handleEdit(updateRow);
  };
  const handleSelectModify = async (row, value) => {
    const updateRow = {
      ...row,
      modify_level: value,
    };
    await handleEdit(updateRow);
  };
  const handleCancel = async () => {
    if (
      selectRows[0].status === 0 ||
      selectRows[0].status === 1 ||
      selectRows[0].status === 9
    ) {
      toast.error("this category is invalid to edit!");
      return;
    }
    if (selectRdSizeD.length === 1) {
      if (user.user_code !== "admin") {
        const allowModify = subAuthentication?.find(
          (item) => item.field === "modify_level"
        )?.title;
        const allowStatus = selectRdSizeD[0]?.status;
        if (
          allowModify === "2" &&
          selectRdSizeD[0]?.grt_dept !== user.department
        ) {
          return;
        }
        if (
          allowModify === "3" &&
          selectRdSizeD[0]?.grt_user !== user.user_code
        ) {
          return;
        }
        if (allowStatus === 7 || allowStatus === 0 || allowStatus === 9) {
          return;
        }
        const allow = subAuthentication?.find(
          (item) => item.field === "allow_modify"
        )?.title;
        if (user?.user_code !== "admin" && allow === "N") {
          return;
        }
        const allowP = subAuthentication?.find(
          (item) => item.field === "allow_cancel"
        )?.title;
        if (user?.user_code !== "admin" && allowP === "N") {
          return;
        }
      }
      const updateCancel = { ...selectRdSizeD[0], status: 0 };
      await handleEdit(updateCancel, "Canceled successfully!");
    }
  };

  const handleConfirm = async () => {
    if (
      selectRows[0].status === 0 ||
      selectRows[0].status === 1 ||
      selectRows[0].status === 9
    ) {
      toast.error("this category is invalid to edit!");
      return;
    }
    if (selectRdSizeD.length === 1) {
      if (user.user_code !== "admin") {
        const allowModify = subAuthentication?.find(
          (item) => item.field === "modify_level"
        )?.title;
        const allowStatus = selectRdSizeD[0]?.status;
        if (
          allowModify === "2" &&
          selectRdSizeD[0]?.grt_dept !== user.department
        ) {
          return;
        }
        if (
          allowModify === "3" &&
          selectRdSizeD[0]?.grt_user !== user.user_code
        ) {
          return;
        }
        if (allowStatus === 7 || allowStatus === 0) {
          return;
        }
        const allow = subAuthentication?.find(
          (item) => item.field === "allow_modify"
        )?.title;
        if (user?.user_code !== "admin" && allow === "N") {
          return;
        }
        const allowP = subAuthentication?.find(
          (item) => item.field === "allow_confirm"
        )?.title;
        if (user?.user_code !== "admin" && allowP === "N") {
          return;
        }
      }
      const updateConfirm = { ...selectRdSizeD[0], status: 7 };
      await handleEdit(updateConfirm, "Confirmed successfully!");
    }
  };
  const handleUnconfirm = async (row, value) => {
    if (
      selectRows[0].status === 0 ||
      selectRows[0].status === 1 ||
      selectRows[0].status === 9
    ) {
      toast.error("this category is invalid to edit!");
      return;
    }
    if (selectRdSizeD.length === 1) {
      if (user.user_code !== "admin") {
        const allowModify = subAuthentication?.find(
          (item) => item.field === "modify_level"
        )?.title;
        const allowStatus = selectRdSizeD[0]?.status;
        if (
          allowModify === "2" &&
          selectRdSizeD[0]?.grt_dept !== user.department
        ) {
          return;
        }
        if (
          allowModify === "3" &&
          selectRdSizeD[0]?.grt_user !== user.user_code
        ) {
          return;
        }
        if (allowStatus === 9 || allowStatus === 0) {
          return;
        }
        const allow = subAuthentication?.find(
          (item) => item.field === "allow_modify"
        )?.title;
        if (user?.user_code !== "admin" && allow === "N") {
          return;
        }
      }
      const allowP = subAuthentication?.find(
        (item) => item.field === "allow_unconfirm"
      )?.title;
      if (user?.user_code !== "admin" && allowP === "N") {
        return;
      }
      const updateConfirm = { ...selectRdSizeD[0], status: 1 };
      await handleEdit(updateConfirm, "Confirmed successfully!");
    }
  };
  const handleClose = async () => {
    if (
      selectRows[0].status === 0 ||
      selectRows[0].status === 1 ||
      selectRows[0].status === 9
    ) {
      toast.error("this category is invalid to edit!");
      return;
    }
    if (selectRows.length === 1) {
      if (user.user_code !== "admin") {
        const allowModify = subAuthentication?.find(
          (item) => item.field === "modify_level"
        )?.title;
        const allowStatus = selectRdSizeD[0]?.status;
        if (
          allowModify === "2" &&
          selectRdSizeD[0]?.grt_dept !== user.department
        ) {
          return;
        }
        if (
          allowModify === "3" &&
          selectRdSizeD[0]?.grt_user !== user.user_code
        ) {
          return;
        }
        if (allowStatus === 0 || allowStatus === 9) {
          return;
        }
        const allow = subAuthentication?.find(
          (item) => item.field === "allow_modify"
        )?.title;
        if (user?.user_code !== "admin" && allow === "N") {
          return;
        }
        const allowP = subAuthentication?.find(
          (item) => item.field === "allow_close"
        )?.title;
        if (user?.user_code !== "admin" && allowP === "N") {
          return;
        }
      }
      const updateConfirm = { ...selectRdSizeD[0], status: 9 };
      await handleEdit(updateConfirm, "Confirmed successfully!");
    }
  };
  const handleAdd = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const addData = Object.fromEntries(form.entries());
    addData.factory_code = user.factory;
    addData.category_code = selectRows[0].category_code;
    addData.grt_dept = user.department;
    addData.grt_user = user.user_code;
    addData.grt_date = new Date().toISOString();
    console.log("add data", addData);

    try {
      const response = await addBasicData(addData);
      if (response.success) {
        toast.success("Add successfully !!!");
        handleAddClose();
        try {
          const allow = Array.isArray(subAuthentication)
            ? subAuthentication.find((item) => item.field === "query_level")
                ?.title
            : null;
          const combinedData = await fnQuery([
            () =>
              fetchBasicDataByCate(
                selectRows[0]?.factory_code,
                selectRows[0]?.category_code,
                user.department,
                user.user_code,
                allow
              ),
          ]);
          if (combinedData && combinedData[0]?.data) {
            setData(combinedData);
            const addedPer = combinedData[0].data.find(
              (item) =>
                `${item.factory_code}-${item.category_code}-${item.code_no}` ===
                `${addData.factory_code}-${addData.category_code}-${addData.code_no}`
            );
            if (addedPer) {
              setSelectRdSizeD([addedPer]);
              setJumpToRow(addedPer);
            }
          }
        } catch (fetchError) {
          console.error("Error fetching data after add:", fetchError);
          toast.warning("Added successfully but failed to refresh data");
        }
      } else {
        toast.dismiss("error-duplicate");
        toast.error(response.data?.message || "Add failed !!!", {
          toastId: "error-duplicate",
        });
      }
    } catch (error) {
      toast.error(
        `User ${addData.user_code} has problem ${error?.response?.data?.message}`
      );
    }
  };
  const handleDelete = async () => {
    const result = await deleteUserPermisison(user.access_token, selectRow);
    console.log("check result ", result);
    if (result.success) {
      toast.success("Delete permission successfully!");
      await fetchUsers();
      handleClose();
    } else {
      toast.error("Cannot delete");
      handleClose();
    }
  };
  const handleSelectChoose = (rows) => {
    setSelectRdSizeD(rows);
  };
  const handlePDF = async () => {
    if (selectedItemSizeRefs.length === 0) {
      toast.warning("Please select items to export!");
      return;
    }

    try {
      const cleanedData = selectedItemSizeRefs.map(
        ({ statusText, ...cleanItem }) => {
          return cleanItem;
        }
      );
      await exportExcelAcItemM(cleanedData);
      toast.success("Export successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed!");
    }
  };
  const handleEdit = async (updateRow) => {
    const { statusText, ...update } = updateRow;
    update.last_user = user.user_code;
    update.last_date = new Date().toISOString();
    const result = await editBasicData(update);
    if (result.success) {
      setData((prevData) => {
        if (!prevData.length) {
          return prevData;
        }
        const { factory_code, category_code, code_no } = update;
        const itemKey = `${factory_code}-${category_code}-${code_no}`;

        const filterPermission = prevData.map((table) => ({
          ...table,
          data: table.data
            .map((p) => {
              const eachKey = `${p.factory_code}-${p.category_code}-${p.code_no}`;
              return eachKey === itemKey ? { ...p, ...update } : p;
            })
            .filter(
              (item, index, self) =>
                index ===
                self.findIndex(
                  (t) =>
                    `${t.factory_code}-${t.category_code}-${t.code_no}` ===
                    `${item.factory_code}-${item.category_code}-${item.code_no}`
                )
            ),
        }));
        return filterPermission;
      });
      setSelectRdSizeD([update]);
      setJumpToRow(update);
      toast.success(`Grant Priviliage for user ${user.user_code}!`);
      handleEditClose();
    } else {
      toast.error(`Cannot grant Privilage for user ${user.user_code}!`);
    }
  };
  const handleDetailModal = (row) => {
    setSelectRow(row);
    setOpenDetail(true);
  };
  const handleDetailClose = () => setOpenDetail(false);
  const handleChecked = async (event, row, field) => {
    const newState = event.target.checked ? "Y" : "N";
    const { statusText, ...modifiedRow } = row;
    modifiedRow.last_user = user.user_code;
    modifiedRow.last_date = new Date().toISOString();
    const updateRow = {
      ...modifiedRow,
      [field]: newState,
    };
    await handleEdit(updateRow);
  };
  const handlePopupSearch = async (filterData) => {
    const search = filterData.search || {};
    const keys = Object.keys(search);

    if (keys.length === 0) {
      await onDataRSDBySize();
      return;
    }
    try {
      const allow = Array.isArray(subAuthentication)
        ? subAuthentication.find((item) => item.field === "query_level")?.title
        : null;

      const popupFilter = {
        ...filterData,
        search: {
          ...search,
          factory_code: selectRows[0]?.factory_code,
          item_acno: selectRows[0]?.item_acno,
        },
      };

      console.log("🔍 Popup filter:", popupFilter);
      const response = await searchAcItemRefByFilter(
        popupFilter,
        user?.factory,
        user?.department,
        user?.user_code,
        allow
      );
      console.log("🔍 Popup search response:", response);
      if (response && response.data && response.data.length > 0) {
        const filteredData = response.data.filter(
          (item) =>
            item.factory_code === selectRows[0]?.factory_code &&
            item.item_acno === selectRows[0]?.item_acno
        );

        console.log("🔍 Filtered popup results:", filteredData.length);

        setData([{ tableName: "RD_SIZE_D", data: filteredData }]);

        if (filteredData.length > 0) {
          setSelectRdSizeD([filteredData[0]]);
        } else {
          setSelectRdSizeD([]);
        }
      } else {
        //  No results
        console.log("🔍 No results found");

        setData([{ tableName: "RD_SIZE_D", data: [] }]);
        setSelectRdSizeD([]);
        toast.info("No items found matching the search criteria");
      }
    } catch (error) {
      console.error("🔍 Popup search error:", error);
      toast.error("Search failed");

      //  Reset on error
      await onDataRSDBySize();
    }
  };

  const onSubmit = async () => {
    if (selectRdSizeD.length === 0) return;
    onSave(selectRdSizeD[0]);
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
      <Dialog open={openSizeLink} onClose={onClose} maxWidth="md">
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
                {getControlLabel("ttl_m_add", "RD SIZE D")}
              </Typography>
              <Button onClick={onClose} variant="contained" color="error">
                <CloseIcon />
              </Button>
            </Box>
            <Stack direction="row" flexWrap="wrap" sx={{ rowGap: 1 }}>
              <Paper
                sx={{
                  width: "100%",
                  maxWidth: "100%",
                  height: "100%",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                  <DataTable
                    data={data[0]?.data}
                    tableName={"RD_SIZE_D"}
                    selectRows={selectRdSizeD}
                    onSelectChange={handleSelectChoose}
                    onSearch={hanldeSearchForRDSizeD}
                    isSearch={isSearch}
                    // searchData={searchData}
                    columnTranslations={columnTranslations}
                    controlTranslations={controlTranslations}
                    language={language}
                    getControlLabel={getControlLabel}
                    getColumnLabel={getColumnLabel}
                    jumpToRow={jumpToRow}
                    isPopup={true}
                    isSubTable={true}
                    totalData={totalData || 0}
                    onPageChange={onPageChange}
                    currentPage={currentPage}
                    currentPageSize={currentPageSize}
                    hasMore={hasMore}
                    setHasMore={setHasMore}
                  />
                </div>
              </Paper>
              <Box
                sx={{
                  width: "400px",
                  maxWidth: "500px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                <Button variant="contained" color="primary" onClick={onSubmit}>
                  {getControlLabel("btn_save", "Save")}
                </Button>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default AcItemProdMSizeLink;
