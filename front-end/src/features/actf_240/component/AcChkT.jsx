import { useEffect, useState } from "react";
import DataTable from "../../../component/table/DataTable";
import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";

import { toast } from "react-toastify";
import { fnQuery } from "../../../utils/fnQuery";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import useAuth from "../../../hooks/useAuth";
import { exportPDFBasicData } from "../../../service/basic_data/basicDataService";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../../utils/notification/Notification";
import {
  addACT,
  deleteACT,
  editACT,
  fetchAllAcChkT,
} from "../../../service/ac_chk_t/acChkT";
import EditAcChkT from "../page/EditAcChkT";
import AddAcChkT from "../page/AddAcChgA";
import DeleteAcChkT from "../page/DeleteAcChkT";
const AcChkT = ({
  data,
  setData,
  setSelectAcChkT,
  selectAcChkT,
  isSearch = false,
  selectRows,
  selectFactory,
  handleSearchByAcProdM,
  subAuthentication = [],
  searchData,
  fetchDataByMatdSeq,
  fetchRecordFromDB,
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
  selectParentRows,
}) => {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
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
            "ACTF_240",
            "detail",
            "ac_issue_m_t",
            "AC_CHK_T",
          ),
        () => fetchTableControlTranslations("ACTF_240"),
      ]);
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const mergedControls = [...controls?.data, ...sysMessages?.data];
      if (mergedControls.length > 0) {
        setControlTranslations(mergedControls);
      }
      const mergedComplexColumn = [...controls?.data, ...columns?.data];
      if (mergedComplexColumn.length > 0)
        setColumnTranslations(mergedComplexColumn);
    } catch (error) {
      console.error(" Error fetching translations:", error);
    }
  };
  const refreshCurrentData = async (updatedRecord = null) => {
    await fetchDataByMatdSeq(false, currentPage, currentPageSize);

    if (updatedRecord) {
      setSelectAcChkT([updatedRecord]);
      setJumpToRow(updatedRecord);
    } else {
      setSelectAcChkT([]);
      handleDeleteClose();
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
        !selectRows[0]?.conf_seq ||
        !selectRows[0]?.matd_seq
      ) {
        setData([{ tableName: "AC_CHK_T", data: [] }]);
        setSelectAcChkT([]);
        return;
      }
      //  KIỂM TRA: Nếu đang search, KHÔNG GỌI API
      if (!isSearch) {
        setCurrentPage(0);
        setCurrentOffset(0);
        setCurrentPageSize(5);
        await fetchDataByMatdSeq(true, 0, 5);
      }
    };
    handleDataFetch();
  }, [
    selectRows?.[0]?.factory_code,
    selectRows?.[0]?.conf_seq,
    selectRows?.[0]?.matd_seq,
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

  const handleDeleteClose = () => setOpenDelete(false);
  //handler open delete popup
  const handleOpenDelete = async () => {
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
    const allowDelete = subAuthentication?.find(
      (item) => item.field === "allow_delete",
    )?.title;
    if (user?.user_code !== "admin" && allowDelete === "N") {
      return;
    }

    const freshRecord = await fetchRecordFromDB(selectAcChkT[0]);

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
  const handleEditClose = async (chooseRow) => {
    try {
      if (selectAcChkT.length === 1) {
        const record = chooseRow || selectAcChkT[0];
        if (record?.locked_information === user?.clientInfo) {
          const unlockData = {
            ...record,
            locked_information: null,
          };

          await editACT(
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
      const record = selectAcChkT[0];

      const freshRecord = await fetchRecordFromDB(record);
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
      // setSelectAcChkT([lockData]);
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
    if (selectAcChkT.length !== 1) return;

    try {
      const record = selectAcChkT[0];
      const freshRecord = await fetchRecordFromDB(record);
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
        return;
      }
      const { SHOE: _, FACTORY: __, desc_itemnm, ...clearData } = freshRecord;
      const updateData = {
        ...clearData,
        status: newStatus,
        last_user: user.user_code,
        last_date: new Date().toISOString(),
      };

      const response = await editACT(
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
        setSelectAcChkT([updateData]);
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

  const handleAdd = async (newData) => {
    const addData = {
      ...newData,
      grt_dept: user.department,
      grt_user: user.user_code,
      grt_date: new Date().toISOString(),
      status: 1,
    };

    try {
      const response = await addACT(
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
          `Add successfully with id ${addData.conf_seq}-${addData.matd_seq}!`,
        );
        handleAddClose();

        const allow = Array.isArray(subAuthentication)
          ? subAuthentication.find((item) => item.field === "query_level")
              ?.title
          : null;

        const responseData = await fetchAllAcChkT(
          user?.factory_code,
          user?.department,
          user?.user_code,
          allow || "1",
          selectRows[0]?.conf_seq,
          selectRows[0]?.matd_seq,
          language,
          response?.size,
          response?.offset,
        );
        if (responseData && responseData.data) {
          setCurrentPage(response?.page || 0);
          setCurrentPageSize(response.size);
          setCurrentOffset(response.offset);
          setHasMore(responseData?.hasMore);
          setData([{ tableName: "AC_CHK_T", data: responseData.data }]);
          setSelectAcChkT([response.data]);
          setJumpToRow(response.data);
        }
      } else {
        showErrorToast(
          getControlLabel,
          "noti_fail_add_2",
          `Added successfully but failed to refresh data`,
        );
      }
    } catch (error) {
      console.log("error", error);
      showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
    }
  };
  const handleDelete = async () => {
    const result = await deleteACT(
      user?.factory,
      selectAcChkT[0]?.conf_seq,
      selectAcChkT[0]?.matd_seq,
      selectAcChkT[0]?.issue_seq,
    );
    if (result?.success) {
      showSuccessToast(getControlLabel, "noti_delete_success", result?.message);
      await refreshCurrentData();
      handleDeleteClose();
    }
  };
  const handleSelectChoose = (rows) => {
    setSelectAcChkT(rows);
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
    const result = await editACT(
      user?.access_token,
      user?.factory,
      user?.department,
      user?.user_code,
      subAuthentication?.find((item) => item.field === "query_level")?.title,
      currentPageSize,
      cleanData,
    );

    if (result.success) {
      if (!skipTimestamp) {
        showSuccessToast(getControlLabel, "noti_success_edit", "Success Edit");
        await refreshCurrentData(cleanData);
        handleEditClose(cleanData);
      } else {
        await refreshCurrentData(cleanData);
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
            <DataTable
              data={data[0]?.data}
              tableName={"AC_CHK_T"}
              selectRows={selectAcChkT}
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
              // isSubTable={true}
              totalData={totalData || 0}
              onPageChange={onPageChange}
              currentPage={currentPage}
              currentPageSize={currentPageSize}
              hasMore={hasMore}
              setHasMore={setHasMore}
              onDelete={handleOpenDelete}
            />
          </div>
        </Stack>
      </Box>
      <AddAcChkT
        open={openAdd}
        handleAdd={handleAdd}
        onClose={handleAddClose}
        selectRows={selectRows.length > 0 ? selectRows : {}}
        selectParentRows={selectParentRows.length > 0 ? selectParentRows : {}}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={subAuthentication}
      />
      <EditAcChkT
        open={openEdit}
        onClose={handleEditClose}
        factory={selectFactory}
        handleEdit={handleEdit}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        selectMasterRows={selectRows.length > 0 ? selectRows : []}
        selectRows={selectAcChkT.length > 0 ? selectAcChkT : []}
        selectParentRows={selectParentRows.length > 0 ? selectParentRows : []}
        user={user}
      />
      <DeleteAcChkT
        openLink={openDelete}
        onClose={handleDeleteClose}
        onDelete={handleDelete}
        getColumnLabel={getColumnLabel}
        getControlLabel={getControlLabel}
        selectRows={selectAcChkT.length > 0 ? selectAcChkT : []}
      />
    </>
  );
};
export default AcChkT;
