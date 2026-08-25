import { lazy, useEffect, useState } from "react";
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
  deleteAllUsers,
  exportExcelUser,
  importExcelUser,
} from "../../service/user/userService";

import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import AcShoeMDeletePage from "../../features/ac_shoe_m/page/AcShoeMDeletePage";
import {
  addFactories,
  deleteFactory,
  editFactories,
  exportPDFFactories,
  fetchFactory,
  fetchFactoryByID,
  searchFactoryByFilter,
} from "../../service/factory/factoryService";
import AddFactoryPage from "../../features/factory/page/AddFactoryPage";
import EditFactoryPage from "../../features/factory/page/EditFactoryPage";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import { fetchTablePermission } from "../../service/users_permission/UsersPermission";
import {
  showErrorToast,
  showSuccessToast,
} from "../../utils/notification/Notification";
const Factory = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectRow, setSelectRow] = useState(null);
  const [selectRows, setSelectRows] = useState([]);
  const [authorization, setAuthorizations] = useState({});
  const [filter, setFilter] = useState("");
  const [file, setFile] = useState(null);
  const [jumpToRow, setJumpToRow] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [isSearch, setIsSearch] = useState(false);
  const [searchFilter, setSearchFilter] = useState(null);
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
  //========== FETCH DATA SECTION ================
  //fetch all factory
  const fetchF = async () => {
    const combinedData = await fnQuery([
      () => fetchFactory(currentPageSize, currentOffset),
    ]);
    setData(combinedData);
    setHasMore(combinedData[0]?.hasMore);
    if (combinedData?.[0]?.data?.length > 0) {
      setSelectRows([combinedData[0].data[0]]);
    }
  };
  //fetch all translation of factory
  const fetchAllTranslations = async () => {
    try {
        const columns = await fetchTableColumnTranslations(
        "FACTORY",
        "master",
        "factory",
      );
      const controls = await fetchTableControlTranslations("FACTORY");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user.factory,
        user.department,
        user.user_code,
        "FACTORY",
      );
      const mergedControls = [...controls?.data, ...sysMessages?.data];
      if (mergedControls.length > 0) {
        setControlTranslations(mergedControls);
      }
      if (columns) setColumnTranslations(columns?.data);

      if (auth) setAuthorizations(auth?.data);
      return auth?.data || [];
    } catch (error) {
      console.error(" Error fetching translations:", error);
    }
  };
  //========== END FETCH DATA SECTION ================

  // ========== USEEFFECT SECTION ==========
  useEffect(() => {
    fetchAllTranslations();
  }, [language]);

  useEffect(() => {
    fetchF();
  }, []);
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
          const unlockData = { ...record, locked_information: null };
          await editFactories(user.access_token, unlockData);
          await refreshCurrentData();
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
          const statusNames = { 0: "Cancelled", 7: "Confirmed", 9: "Closed" };
          showErrorToast(
            getControlLabel,
            "noti_edit_fail_2",
            `Cannot edit! Present status: ${statusNames[freshRecord.status]}`,
            { status: statusNames[freshRecord?.status] || "Unknown" },
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
          `Cannot edit!\n\nRecord is edited by: ${freshRecord.locked_information}\n\nWait for user to finish!`,
          { user: freshRecord.locked_information || "Unknown" },
        );
        return;
      }

      const { statusText, ...clearData } = freshRecord;
      const lockData = { ...clearData, locked_information: user?.clientInfo };

      await handleEditFactory(lockData, "", true);
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
  const handleClose = () => handleStatusChange(9, "close", [7]);
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
  //handler add factory
  const handleAdd = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = Object.fromEntries(form.entries());
    data.grt_dept = user.department;
    data.grt_user = user.user_code;
    data.grt_date = new Date().toISOString();
    data.status = 1;
    try {
      const response = await addFactories(user.access_token, data);
      if (response.success) {
        const responseData = await fetchFactory(response.size, response.offset);
        setData([{ tableName: "FACTORY", data: responseData.data || [] }]);
        showSuccessToast(
          getControlLabel,
          "noti_success_add",
          `Add factory (${data.factory_code}) successfully!`,
        );
        setHasMore(responseData?.hasMore);
        setSelectRows([response.data]);
        setJumpToRow(response.data);
        setCurrentPage(response?.page || 0);
        setCurrentPageSize(response.size || currentPageSize);
        setCurrentOffset(response.offset || 0);
        setIsSearch(false);
        setSearchFilter(null);
        setTotalData((prev) => prev + 1);
        handleAddClose();
      } else {
        showErrorToast(getControlLabel, "noti_fail_add_1", "Failed to add");
        handleAddClose();
      }
    } catch (error) {
      showErrorToast(
        getControlLabel,
        "noti_fail_duplicate_add",
        "Cannot add duplicate id!",
      );
    }
  };
  //handler edit factory
  const handleEditFactory = async (data, title) => {
    try {
      data.last_user = user.user_code;
      data.last_date = new Date().toISOString();
      const { statusText, ...res } = data;
      const response = await editFactories(user.access_token, res);
      if (response.success) {
        const successMessage =
          typeof title === "string" && title
            ? title
            : `Edit factory with code(${res.factory_code}) successfully !!!`;
        showSuccessToast(getControlLabel, "noti_success_edit", successMessage);
        await refreshCurrentData();
        setSelectRows([res]);
        setOpenEdit(false);
      } else {
        toast.error(`${response?.data?.message}(${data.factory_code}`);
      }
    } catch (error) {
      toast.error(`${error.response?.data?.message}`);
    }
  };

  //handler search by filter
  const handleSearchByFilter = async (
    filteredShoe,
    pageSize = 10,
    offset = 0,
  ) => {
    try {
      const response = await searchFactoryByFilter(
        filteredShoe,
        user.access_token,
        pageSize,
        offset,
      );
      const isNewFilter =
        JSON.stringify(filteredShoe) !== JSON.stringify(searchFilter);
      const actualOffset = isNewFilter ? 0 : (offset ?? currentOffset);
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;
      if (offset === 0) {
        setCurrentPage(0);
        setCurrentPageSize(pageSize);
        setCurrentOffset(0);
      }
      setIsSearch(true);
      setSearchFilter(filteredShoe);
      if (response && response.data) {
        if (response.data.length === 0) {
          setSelectRows([]);
          setData([{ tableName: "FACTORY", data: response.data }]);
          setTotalData(response?.total || 0);
        } else {
          setSelectRows([response.data[0]]);
          setData([{ tableName: response.tableName, data: response.data }]);
          if (offset === 0 && response.data.length > 0) {
            setTotalData(response.total);
          }
        }
      }
    } catch (error) {
      await showErrorToast(
        getControlLabel,
        "noti_fail_search",
        "Failed to search",
      );
    }
  };
  //handler change status

  const fetchRecordFromDB = async (record) => {
    try {
      const response = await fetchFactoryByID(selectRows[0]?.factory_code);
      return response?.data;
    } catch (error) {
      console.error("Error fetching record:", error);
      return record;
    }
  };
  const refreshCurrentData = async () => {
    const currentSelection = selectRows.length > 0 ? selectRows[0] : null;
    console.log("ininin", isSearch, searchFilter);
    if (isSearch && searchFilter) {
      const response = await searchFactoryByFilter(
        searchFilter,
        user.access_token,
        currentPageSize,
        currentOffset,
      );
      if (response && response.data) {
        setData([{ tableName: "FACTORY", data: response.data }]);
        if (currentSelection) {
          const foundRecord = response.data.find(
            (item) => item.factory_code === currentSelection.factory_code,
          );
          if (foundRecord) {
            setSelectRows([foundRecord]);
          } else if (response.data.length > 0) {
            setSelectRows([response.data[0]]);
            setJumpToRow(response.data[0]);
          } else {
            setSelectRows([]);
          }
        }
      }
    } else {
      const responseData = await fetchFactory(currentPageSize, currentOffset);
      if (responseData && responseData.data) {
        setData([{ tableName: "FACTORY", data: responseData.data }]);
        setHasMore(responseData?.hasMore);
        if (currentSelection) {
          const updatedRecord = responseData.data.find(
            (item) => item.factory_code === currentSelection.factory_code,
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
  const handleStatusChange = async (
    newStatus,
    actionName,
    allowedFromStatuses = [],
  ) => {
    if (selectRows.length === 0) {
      return;
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
      const { FACTORY, ...clearData } = freshRecord;
      const updateData = {
        ...clearData,
        status: newStatus,
        last_user: user.user_code,
        last_date: new Date().toISOString(),
      };

      const response = await editFactories(user.access_token, updateData);

      if (response.success) {
        showSuccessToast(getControlLabel, `noti_success_${actionName}`);
        await refreshCurrentData();
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
  const handleCancel = async () => {
    await handleStatusChange(0, "cancel", [1, 2]);
  };
  //handler confirm
  const handleConfirm = async () => {
    await handleStatusChange(7, "confirm", [1, 2]);
  };
  const handleUnconfirm = async () => {
    await handleStatusChange(1, "confirm", [7]);
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
  //handler export PDF
  const handlePDF = async () => {
    const pdf = await exportPDFFactories();
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

    //  CASE 3: Không search
    const responseData = await fetchFactory(newPageSize, newOffset);

    setData([{ tableName: "FACTORY", data: responseData.data || [] }]);
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
              <div style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                <DataTable
                  data={data[0]?.data}
                  tableName={"FACTORY"}
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
                  onDetail={(row) => {
                    handleDetailModal(row);
                  }}
                  onExport={handleExport}
                  onImport={handleImport}
                  onPDF={handlePDF}
                  onFile={handleFile}
                  file={file}
                  columnTranslations={columnTranslations}
                  controlTranslations={controlTranslations}
                  language={language}
                  getControlLabel={getControlLabel}
                  getColumnLabel={getColumnLabel}
                  jumpToRow={jumpToRow}
                  hasMore={hasMore}
                  currentPage={currentPage}
                  currentOffset={currentOffset}
                  currentPageSize={currentPageSize}
                  setCurrrentPage={setCurrentPage}
                  setCurrrentPageSize={setCurrentPageSize}
                  totalData={totalData}
                  onPageChange={handlePageChange}
                  isSearch={isSearch}
                  setIsSearch={setIsSearch}
                  searchFilter={searchFilter}
                  onClose={handleClose}
                />
              </div>
            </Paper>
          </Stack>
        </Container>
      </Box>
      {/* ========== LOADING SKELETON ========== */}
      {data.length === 0 && (
        <Stack direction="row" flexWrap="wrap" sx={{ rowGap: 1 }}>
          <div style={{ width: itemWidth, minWidth: 0 }}>
            <Skeleton animation="wave" variant="rectangular" height={600} />
          </div>
        </Stack>
      )}
      {/* ========== MODAL/DIALOG COMPONENTS ========== */}

      {/*  Add Factory Modal */}
      {/* - Mở khi user click "Add" button */}
      {/* - Gọi handleAdd khi submit form */}
      <AddFactoryPage
        open={openAdd}
        onClose={handleAddClose}
        handleAdd={handleAdd}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
      />
      {/*  Edit Factory Modal */}
      {/* - Mở khi user click "edit" button */}
      {/* - Gọi handleEditFactory khi submit form */}
      <EditFactoryPage
        open={openEdit}
        onClose={handleEditClose}
        factory={selectRows.length > 0 ? selectRows[0] : null}
        handleEdit={handleEditFactory}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
      />
    </>
  );
};
export default Factory;
