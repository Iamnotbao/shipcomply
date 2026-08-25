import { useEffect, useState } from "react";
import DataTable from "../../../component/table/DataTable";
import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";

import { toast } from "react-toastify";
import { fnQuery } from "../../../utils/fnQuery";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import useAuth from "../../../hooks/useAuth";
import { exportPDFBasicData } from "../../../service/basic_data/basicDataService";
import {
  editAcProdM,
  fetchAllAcProdMByShoe,
  searchAPMByFilter,
} from "../../../service/ac_prod_m/AcProdMService";
import {
  addAcProcD,
  autoAddAcProcD,
  editAcProcD,
  fetchAllAPDByAcno,
} from "../../../service/ac_proc_d/AcProcDService";
import AddAcProcD from "../page/AddAcProcD";
import EditAcProcD from "../page/EditAcProcD";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../../utils/notification/Notification";
const AcProcD = ({
  data,
  setData,
  setSelectAPD,
  selectAPD,
  isSearch = false,
  selectRows,
  selectFactory,
  handleSearchByAcProdM,
  subAuthentication = [],
  searchData,
  fetchDataByAcNo,
  setOpenSizeLink,
  fetchAPDRecordFromDB,
  setJumpToRow,
  jumpToRow,
  totalData,
  onPageChange,
  currentOffset,
  currentPage,
  currentPageSize,
  setCurrentPage,
  setCurrentOffset,
  setCurrentPageSize,
  setTotalData,
  searchFilter,
  hasMore,
  setHasMore,
}) => {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const theme = useTheme();
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
  const { user } = useAuth();

  const fetchAllTranslations = async () => {
    try {
      const [columns, controls, auth] = await fnQuery([
        () =>
          fetchTableColumnTranslations(
            "ACTF_220",
            "detail",
            "ac_proc_m",
            "AC_PROC_D",
          ),
        () => fetchTableControlTranslations("ACTF_220"),
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
  const refreshCurrentData = async (updatedRecord = null) => {
    if (updatedRecord) {
      const newData = await fetchAllAPDByAcno(
        user?.factory,
        selectRows[0]?.ac_no,
        user?.department,
        user?.user_code,
        subAuthentication?.find((item) => item.field === "query_level")?.title,
        language,
        currentPageSize,
        currentOffset,
      );
      setData([{ tableName: "AC_PROC_D", data: newData?.data }]);
      setHasMore(newData?.hasMore);
      const foundUpdate = newData?.data.find(
        (item) =>
          `${item.factory_code}-${item.ac_no}-${parseFloat(item.seq)}` ===
          `${updatedRecord.factory_code}-${updatedRecord.ac_no}-${parseFloat(updatedRecord.seq)}`,
      );
      setSelectAPD([foundUpdate]);
      return;
    }
  };
  useEffect(() => {
    fetchAllTranslations();
  }, [language]);
  useEffect(() => {
    const handleDataFetch = async () => {
      if (
        !selectRows ||
        selectRows.length === 0 ||
        !selectRows[0]?.factory_code ||
        !selectRows[0]?.ac_no
      ) {
        setData([{ tableName: "AC_PROC_D", data: [] }]);
        setSelectAPD([]);
        return;
      }
      //  KIỂM TRA: Nếu đang search, KHÔNG GỌI API
      if (!isSearch) {
        setCurrentPage(0);
        setCurrentOffset(0);
        setCurrentPageSize(10);
        await fetchDataByAcNo(true, 0, 10);
      }
    };
    handleDataFetch();
  }, [
    selectRows?.[0]?.factory_code,
    selectRows?.[0]?.ac_no,
    isSearch,
    searchData.length,
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
      showErrorToast(
        getControlLabel,
        "noti_add_fail_3",
        "Please choose master row before add detail row!",
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
        "this category is invalid to add!",
      );
      return;
    }
    const allowAdd = subAuthentication?.find(
      (item) => item.field === "allow_add",
    )?.title;
    if (user?.user_code !== "admin" && allowAdd === "N") {
      return;
    }
    setOpenAdd(true);
  };
  const handleEditClose = async (chooseRow) => {
    try {
      if (selectAPD.length === 1) {
        const record = chooseRow || selectAPD[0];
        if (record?.locked_information === user?.clientInfo) {
          const unlockData = {
            ...record,
            locked_information: null,
          };

          await editAcProcD(
            user?.access_token,
            user?.factory,
            user?.department,
            user?.user_code,
            subAuthentication?.find((item) => item.field === "query_level")
              ?.title,
            currentPageSize,
            unlockData,
          );

          await refreshCurrentData(unlockData);
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
      if (
        selectRows[0].status === 0 ||
        selectRows[0].status === 7 ||
        selectRows[0].status === 9
      ) {
        showErrorToast(
          getControlLabel,
          "noti_fail_parent_status",
          "Please unconfirm the record first!",
        );
        return;
      }
      const record = selectAPD[0];
      const freshRecord = await fetchAPDRecordFromDB(record);
      if (user.user_code !== "admin") {
        const allowModify = subAuthentication?.find(
          (item) => item.field === "modify_level",
        )?.title;

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

        const allowStatus = freshRecord?.status;
        if (allowStatus === 7 || allowStatus === 0 || allowStatus === 9) {
          const statusNames = { 0: "Cancelled", 7: "Confirmed", 9: "Closed" };
          showErrorToast(
            getControlLabel,
            "noti_edit_fail_2",
            ` Cannot edit!Present status: ${statusNames[freshRecord.status]}`,
            {
              status: statusNames[freshRecord?.status] || "Unknown",
            },
          );
          await refreshCurrentData(freshRecord);
          return;
        }

        const allow = subAuthentication?.find(
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

      const { SHOE: _, FACTORY: __, ...clearData } = freshRecord;
      const lockData = {
        ...clearData,
        locked_information: user?.clientInfo,
      };

      await handleEdit(lockData, "", true);
      setSelectAPD([lockData]);
      setOpenEdit(true);
    } catch (error) {
      console.log("Error when opening edit popup:", error);
      showErrorToast(
        getControlLabel,
        "noti_error_open_edit",
        "This has error when open form edit!",
      );
    }
  };

  const handleStatusChange = async (
    newStatus,
    actionName,
    allowedFromStatuses = [],
  ) => {
    if (
      selectRows[0].status === 0 ||
      selectRows[0].status === 7 ||
      selectRows[0].status === 9
    ) {
      showErrorToast(
        getControlLabel,
        "noti_fail_parent_status",
        "Please unconfirm the record first!",
      );
      return;
    }
    if (selectAPD.length !== 1) return;

    try {
      const record = selectAPD[0];
      const freshRecord = await fetchAPDRecordFromDB(record);
      if (user.user_code !== "admin") {
        const allowModify = subAuthentication?.find(
          (item) => item.field === "modify_level",
        )?.title;

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

        const allow = subAuthentication?.find(
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

        await refreshCurrentData(freshRecord);
        setSelectAPD([freshRecord]);
        setJumpToRow(freshRecord);
        return;
      }
      const { SHOE: _, FACTORY: __, ac_itemnm, ...clearData } = freshRecord;
      const updateData = {
        ...clearData,
        status: newStatus,
        last_user: user.user_code,
        last_date: new Date().toISOString(),
      };

      const response = await editAcProcD(
        user?.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        subAuthentication?.find((item) => item.field === "query_level")?.title,
        currentPageSize,
        updateData,
      );

      if (response.success) {
        showSuccessToast(getControlLabel, `noti_success_${actionName}`);
        await refreshCurrentData(updateData);
        setSelectAPD([updateData]);
        setJumpToRow(updateData);
      }
    } catch (error) {
      console.error(`Error in ${actionName}:`, error);
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
  const handleAutoAdd = async () => {
    if (selectRows?.length !== 1) return;
    if (selectRows[0]?.status !== 1) {
      showErrorToast(
        getControlLabel,
        "noti_fail_parent_status",
        "Please change the master row to new!",
      );
      return;
    }
    try {
      const response = await autoAddAcProcD(
        user?.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        selectRows[0]?.ac_no,
        language,
      );
      setData([
        {
          tableName: "AC_PROC_D",
          data: response?.data || [],
        },
      ]);
      setSelectAPD([response?.data[0]] || []);
      showSuccessToast(
        getControlLabel,
        "noti_success_auto_add",
        "Auto Add Successfully!",
      );
    } catch (error) {
      console.error("Error in handleAutoAdd:", error);
      showErrorToast(getControlLabel, "noti_fail_auto_add", error.message);
    }
  };
  const handleAdd = async (newData) => {
    const addData = {
      ...newData,
      ac_no: selectRows[0]?.ac_no,
      factory_code: user.factory,
      grt_dept: user.department,
      grt_user: user.user_code,
      grt_date: new Date().toISOString(),
      status: 1,
    };

    const numericFields = ["s_seq", "e_seq", "pt_per"];
    numericFields.forEach((field) => {
      if (addData[field]) {
        addData[field] = Number(addData[field]);
      }
    });
    try {
      const response = await addAcProcD(
        user?.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        subAuthentication?.find((item) => item.field === "query_level")?.title,
        currentPageSize,
        addData,
      );
      if (response.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_add",
          `Add successfully with id ${addData.ac_no}-${addData.seq}!`,
        );
        handleAddClose();

        const allow = Array.isArray(subAuthentication)
          ? subAuthentication.find((item) => item.field === "query_level")
              ?.title
          : null;

        const responseData = await fetchAllAPDByAcno(
          selectRows[0]?.factory_code,
          selectRows[0]?.ac_no,
          user.department,
          user.user_code,
          allow || "1",
          language,
          response.size,
          response.offset,
        );
        if (responseData && responseData.data) {
          setCurrentPage(response?.page || 0);
          setCurrentPageSize(response.size);
          setCurrentOffset(response.offset);
          setHasMore(responseData?.hasMore);
          setData([{ tableName: "AC_PROC_D", data: responseData.data }]);
          setSelectAPD([response.data]);
          setJumpToRow(response.data);
        }
      } else {
        showErrorToast(
          getControlLabel,
          "noti_fail_duplicate_add",
          "Cannot add duplicate id!",
        );
      }
    } catch (error) {
      console.log("error", error);
      showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
    }
  };
  const handleSelectChoose = (rows) => {
    setSelectAPD(rows);
  };
  const handlePDF = async () => {
    await exportPDFBasicData();
  };
 const handleEdit = async (updateRow, title, skipTimestamp = false) => {
  const { statusText, ac_itemnm, ...cleanData } = updateRow;
  if (!skipTimestamp) {
    cleanData.last_user = user.user_code;
    cleanData.last_date = new Date().toISOString();
  }

  try {
    const result = await editAcProcD(
      user?.access_token,
      user?.factory,
      user?.department,
      user?.user_code,
      subAuthentication?.find((item) => item.field === "query_level")?.title,
      currentPageSize,
      cleanData,
    );

    if (result.success) {
      const successMessage =
        typeof title === "string" && title
          ? title
          : `Edit successfully for user ${user.user_code}!`;

      if (!skipTimestamp) {
        showSuccessToast(getControlLabel, "noti_success_edit", successMessage);
      }

      if (isSearch) {
        await refreshCurrentData(cleanData);
        if (!skipTimestamp && cleanData.locked_information === user?.clientInfo) {
          const unlockData = { ...cleanData, locked_information: null };
          await editAcProcD(
            user?.access_token,
            user?.factory,
            user?.department,
            user?.user_code,
            subAuthentication?.find((item) => item.field === "query_level")?.title,
            currentPageSize,
            unlockData,
          );
          await refreshCurrentData(unlockData);
        }
      } else {
        const resultPage =
          result.size !== undefined
            ? Math.floor(result.position / result.size)
            : currentPage;
        const resultOffset =
          result.offset !== undefined ? result.offset : currentOffset;

        if (resultPage !== currentPage) {
          const allow = Array.isArray(subAuthentication)
            ? subAuthentication.find((item) => item.field === "query_level")?.title
            : null;

          const responseData = await fetchAllAPDByAcno(
            user?.factory,
            selectRows[0]?.ac_no,
            user?.department,
            user?.user_code,
            allow || "1",
            language,
            currentPageSize,
            resultOffset,
          );

          if (responseData?.data) {
            setData([{ tableName: "AC_PROC_D", data: responseData.data }]);
            setHasMore(responseData?.hasMore);
            setCurrentPage(resultPage);
            setCurrentOffset(resultOffset);

            const editedRecord = responseData.data.find(
              (item) =>
                `${item.factory_code}-${item.ac_no}-${item.seq}` ===
                `${cleanData.factory_code}-${cleanData.ac_no}-${cleanData.seq}`,
            );

            if (editedRecord) {
              setSelectAPD([editedRecord]);
              setJumpToRow(editedRecord);
            }
          }
        } else {
          await refreshCurrentData(cleanData);
          if (!skipTimestamp && cleanData.locked_information === user?.clientInfo) {
            const unlockData = { ...cleanData, locked_information: null };
            await editAcProcD(
              user?.access_token,
              user?.factory,
              user?.department,
              user?.user_code,
              subAuthentication?.find((item) => item.field === "query_level")?.title,
              currentPageSize,
              unlockData,
            );
            await refreshCurrentData(unlockData);
          }
        }
      }

      if (!skipTimestamp) {
        handleEditClose(cleanData);
      }
    } else {
      showErrorToast(
        getControlLabel,
        "noti_edit_fail_3",
        result.message || `Cannot edit successfully for user ${user.user_code}!`,
        { user: user?.user_code },
      );
    }
  } catch (error) {
    console.error("handleEdit unexpected error:", error);
    showErrorToast(
      getControlLabel,
      "noti_edit_fail_3",
      error.message || "Unexpected error occurred",
      { user: user?.user_code },
    );
  }
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
  return (
    <>
      <Box>
        <Stack
          direction="row"
          flexWrap="wrap"
          sx={{ rowGap: 1, width: "100%" }}
        >
          <div style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
            <Typography variant="h5" textAlign={"center"} fontWeight={"bold"}>
              {/*     {getControlLabel("ttl_table_d_1", "AC_PROC_D")} */}
            </Typography>
            <DataTable
              data={data[0]?.data}
              tableName={"AC_PROC_D"}
              selectRows={selectAPD}
              onSelectChange={handleSelectChoose}
              onAdd={handleOpenAdd}
              onEdit={handleOpenEdit}
              onCancel={handleCancel}
              onConfirm={handleConfirm}
              onUnconfirm={handleUnconfirm}
              onClose={handleClose}
              onSearch={handleSearchByAcProdM}
              onPDF={handlePDF}
              popupOpen={openEdit}
              columnTranslations={columnTranslations}
              controlTranslations={controlTranslations}
              language={language}
              getControlLabel={getControlLabel}
              getColumnLabel={getColumnLabel}
              jumpToRow={jumpToRow}
              isSubTable={true}
              totalData={totalData || 0}
              onPageChange={onPageChange}
              currentPage={currentPage}
              currentPageSize={currentPageSize}
              onAutoAdd={handleAutoAdd}
              hasMore={hasMore}
            />
          </div>
        </Stack>
      </Box>
      <AddAcProcD
        open={openAdd}
        handleAdd={handleAdd}
        onClose={handleAddClose}
        selectRows={selectRows.length > 0 ? selectRows : {}}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        language={language}
        user={user}
      />
      <EditAcProcD
        open={openEdit}
        onClose={handleEditClose}
        selectAcProcM={selectRows.length > 0 ? selectRows : null}
        factory={selectFactory}
        handleEdit={handleEdit}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        selectRows={selectAPD.length > 0 ? selectAPD : {}}
        user={user}
        language={language}
      />
    </>
  );
};
export default AcProcD;
