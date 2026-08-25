import { useEffect, useState } from "react";
import DataTable from "../../../component/table/DataTable";
import {
  Box,
  Container,
  Paper,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { fnQuery } from "../../../utils/fnQuery";
import {
  exportExcelUser,
  importExcelUser,
} from "../../../service/user/userService";

import useAuth from "../../../hooks/useAuth";
import { toast } from "react-toastify";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import { fetchTablePermission } from "../../../service/users_permission/UsersPermission";
import {
  addIMT,
  editIMT,
  exportCustomExcel,
  exportExcelIMT,
  exportMaterialExcel,
  fetchIMT,
  fetchIMTByID,
  searchIMTByFilter,
} from "../../../service/ac_imp_material_tracking/AcImpMaterialTrackingService";
import {
  addASB,
  editASB,
  fetchAllASB,
  fetchASBByID,
  searchASBByFilter,
} from "../../../service/ac_send_base/AcSendBaseService";
import AddAcSendBase from "../page/AddAcSendBase";
import EditAcSendBase from "../page/EditAcSendBase";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../../utils/notification/Notification";

const AcSendBase = () => {
  const [data, setData] = useState([]);
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
  const [isSearch, setIsSearch] = useState(false);
  const [searchFilter, setSearchFilter] = useState(null);
  const [totalData, setTotalData] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(5);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const { user } = useAuth();
  const TABLE_NAME = "AC_SEND_BASE";

  const {
    fetchTableControlTranslations,
    fetchTableColumnTranslations,
    language,
  } = useColumnTranslation();
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);

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
        fetchAllASB(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          pageSize,
          offset,
        ),
    ]);
    setData([{ tableName: "AC_SEND_BASE", data: combinedData[0].data }]);
    setHasMore(combinedData[0]?.hasMore);
    if (
      combinedData?.[0]?.total !== undefined &&
      combinedData?.[0]?.total !== null
    ) {
      setTotalData(combinedData?.[0]?.total);
    }
    if (combinedData?.[0]?.data?.length > 0) {
      setSelectRows([combinedData[0].data[0]]);
      setJumpToRow(combinedData[0].data[0]);
    }
  };

  //fetch all translation of factory
  const fetchAllTranslations = async () => {
    try {
      const columns = await fetchTableColumnTranslations(
        "ACTF_410",
        "master",
        "ac_send_base",
      );
      const controls = await fetchTableControlTranslations("ACTF_410");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user?.factory,
        user?.department,
        user?.user_code,
        "ACTF_410",
      );

      if (columns) setColumnTranslations(columns?.data);
      const mergedControls = [...controls?.data, ...sysMessages?.data];
      if (mergedControls.length > 0) {
        setControlTranslations(mergedControls);
      }
      if (auth) setAuthorizations(auth?.data);
      return auth?.data || [];
    } catch (error) {
      console.error(" Error:", error);
      return [];
    }
  };

  const fetchRecordFromDB = async (record) => {
    try {
      const response = await fetchASBByID(
        selectRows[0]?.factory_code,
        selectRows[0]?.ac_send,
      );
      console.log("check fetch itm by id:", response?.data);
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

      const response = await searchASBByFilter(
        searchFilter,
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        currentPageSize,
        currentOffset,
      );

      if (response && response.data) {
        setData([{ tableName: response.tableName, data: response.data }]);
        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${currentSelection.ac_send}`;
          const foundRecord = response.data.find(
            (item) => `${item.factory_code}-${item.ac_send}` === currentKey,
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

      const responseData = await fetchAllASB(
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        currentPageSize,
        currentOffset,
      );
      console.log("chay vao day", responseData);
      if (responseData && responseData.data) {
        setData([{ tableName: "AC_SEND_BASE", data: responseData.data }]);
        setHasMore(responseData?.hasMore);
        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${currentSelection.ac_send}`;
          const updatedRecord = responseData.data.find(
            (item) => `${item.factory_code}-${item.ac_send}` === currentKey,
          );
          console.log("update records", updatedRecord);

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

  useEffect(() => {
    const init = async () => {
      console.log("🔵 [UseEffect] INITIAL LOAD");
      const authData = await fetchAllTranslations();
      await fetchAll(authData);
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

  // ========== END USEEFFECT SECTION ==========

  //========== HANDLER SECTION ================
  //handler row choose
  const handleSelectChoose = (rows) => {
    setSelectRows(rows);
  };
  const handleEditClose = async (data) => {
    try {
      if (selectRows.length === 1) {
        const record = data || selectRows[0];
        console.log("record", record);

        if (record?.locked_information === user?.clientInfo) {
          const unlockData = {
            ...record,
            locked_information: null,
          };
          await editASB(
            user?.factory,
            user?.department,
            user?.user_code,
            authorization?.find((item) => item.field === "query_level")?.title,
            unlockData,
            currentPageSize,
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
  const handleOpenEdit = async () => {
    try {
      if (selectRows.length !== 1) return;
      const record = selectRows[0];

      const freshRecord = await fetchRecordFromDB(record);
      // console.log("check for freshRecord",freshRecord);

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
     freshRecord.locked_information !==user?.clientInfo
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
      const { FACTORY, ...clearData } = freshRecord;
      const lockData = {
        ...clearData,
        locked_information: user?.clientInfo,
      };

      await handleEditASB(lockData, "", true);
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
  const handleAddClose = () => setOpenAdd(false);
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
      const response = await addASB(
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        data,
        currentPageSize,
      );
      console.log("response", response);

      if (response.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_add",
          `Add successfully with id ${data.ac_send}!`,
        );
        const allow = Array.isArray(authorization)
          ? authorization.find((item) => item.field === "query_level")?.title
          : null;
        const responseData = await fetchAllASB(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          response.size,
          response.offset,
        );
        setData([
          {
            tableName: "AC_SEND_BASE",
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
      console.log("error", error);
      showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
    }
  };

  const handleEditASB = async (updateRow, title, skipTimestamp = false) => {
    try {
      const { statusText, ...cleanData } = updateRow;
      if (!skipTimestamp) {
        cleanData.last_user = user.user_code;
        cleanData.last_date = new Date().toISOString();
      }
      const result = await editASB(
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        cleanData,
        currentPageSize,
      );
      if (result.success) {
        const successMessage =
          typeof title === "string" && title
            ? title
            : `Edit factory with code(${cleanData.ac_send}) successfully !!!`;
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
            await editASB(
              user?.factory,
              user?.department,
              user?.user_code,
              authorization?.find((item) => item.field === "query_level")
                ?.title,
              unlockData,
              currentPageSize,
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

            const responseData = await fetchAllASB(
              user?.factory,
              user?.department,
              user?.user_code,
              allow || "1",
              currentPageSize,
              resultOffset,
            );

            if (responseData && responseData.data) {
              setData([
                {
                  tableName: "AC_SEND_BASE",
                  data: responseData.data,
                },
              ]);
              setHasMore(responseData?.hasMore);
              setCurrentPage(resultPage);
              setCurrentOffset(resultOffset);

              const editedRecord = responseData.data.find(
                (item) =>
                  `${item.factory_code}-${item.ac_send}` ===
                  `${cleanData.factory_code}-${cleanData.ac_send}`,
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
              await editASB(
                user?.factory,
                user?.department,
                user?.user_code,
                authorization?.find((item) => item.field === "query_level")
                  ?.title,
                unlockData,
                currentPageSize,
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
          "noti_error_generic",
          `This has error when ${actionName}!`,
        );
      }
    } catch (error) {
      showErrorToast(
        getControlLabel,
        "noti_error_generic",
        `This has error when ${actionName}!`,
      );
      console.log("data has been problem", error);
    }
  };

  const handleSearchByFilter = async (filteredShoe) => {
    try {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;
      const response = await searchIMTByFilter(
        filteredShoe,
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
      );
      if (response && response.data) {
        if (response.data.length === 0) {
          setSelectRows([]);
          setData([
            { tableName: "AC_IMP_MATERIAL_TRACKING", data: response.data },
          ]);
        } else {
          setSelectRows([response.data[0]]);
          setJumpToRow(response.data[0]);
          setData([{ tableName: response.tableName, data: response.data }]);
        }
      }
    } catch (error) {
      console.log("cannot search because", error);
    }
  };
  const handleStatusChange = async (
    newStatus,
    actionName,
    allowedFromStatuses = [],
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
      const response = await editASB(
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        updateData,
        currentPageSize,
      );
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

  const handleCancel = () => {
    handleStatusChange(0, "cancel", [1, 2]);
  };

  const handleConfirm = () => {
    handleStatusChange(7, "confirm", [1, 2]);
  };

  const handleUnconfirm = () => {
    handleStatusChange(1, "unconfirm", [7]);
  };

  const handleClose = () => {
    handleStatusChange(9, "close", [1, 7]);
  };

  const handleCheck = () => {
    handleStatusChange(2, "check", [1]);
  };

  const handleImport = async () => {
    const form = new FormData();
    form.append("file", file);
    try {
      const result = await importExcelUser(user.access_token, form);
      if (result.importRows.success) {
        await fetchAll();
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
    await exportExcelIMT(
      user?.factory,
      user?.department_code,
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
    console.log(" Normal fetch all with offset:", newOffset);
    const responseData = await fetchAllASB(
      user?.factory,
      user?.department,
      user?.user_code,
      authorization?.find((item) => item.field === "query_level")?.title,
      newPageSize,
      newOffset,
    );

    setData([{ tableName: "AC_SEND_BASE", data: responseData.data || [] }]);
    setHasMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectRows([responseData.data[0]]);
    }
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
                  tableName={"AC_SEND_BASE"}
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
                  totalData={totalData || 0}
                  onPageChange={handlePageChange}
                  currentPage={currentPage}
                  currentPageSize={currentPageSize}
                  hasMore={hasMore}
                  isSearch={isSearch}
                />
              </div>
            </Paper>
          </Stack>
        </Container>
      </Box>

      {/* ========== MODAL/DIALOG COMPONENTS ========== */}

      {/*  Add Factory Modal */}
      <AddAcSendBase
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
      <EditAcSendBase
        open={openEdit}
        onClose={handleEditClose}
        acImp={selectRows.length > 0 ? selectRows[0] : null}
        handleEdit={handleEditASB}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={authorization}
        language={language}
      />
    </>
  );
};

export default AcSendBase;
