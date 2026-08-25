import { useEffect, useState } from "react";
import DataTable from "../../../component/table/DataTable";
import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";

import { toast } from "react-toastify";
import { fnQuery } from "../../../utils/fnQuery";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import { exportPDFBasicData } from "../../../service/basic_data/basicDataService";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../../utils/notification/Notification";
import {
  addSeShippingD,
  fetchAllSeShipingD,
} from "../../../service/se_shipping_d/seShippingD";
import AddSeShippingD from "../page/AddSeShipingD";
import EditSePlanSize from "../page/EditSePlanSize";
import {
  editSePlanSize,
  confirmItemsSePlanSize,
  unconfirmItemsSePlanSize,
  deleteSePlanSize,
  fetchSePlanSizeByID,
} from "../../../service/se_plan_size/sePlanSize";
import DeleteSePlanOrd from "../page/DeleteSePlanOrd";

const SePlanSize = ({
  jumpToRow,
  setJumpToRow,
  data = [],
  setData,
  setSelectSPS,
  selectSPS = [],
  selectRows = [],
  fetchBasicDataRecordFromDB,
  handleSearchByCode,
  subAuthentication,
  user,
  currentPage,
  setCurrentPage,
  currentPageSize,
  setCurrentPageSize,
  setCurrentOffset,
  currentOffset,
  fetchDataByPlanOrd,
  openAdd,
  handleOpenAdd,
  handleClosedAdd,
  totalData,
  setTotalData,
  handlePageChange,
  hasMore,
  setHasMore,
  selectCheckSPS,
  setSelectCheckSPS,
  selectionsVersionSPS,
  onCustomCheckboxChangeSPS,
  setSelectionsVersionSPS,
}) => {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const theme = useTheme();
  const [openDetail, setOpenDetail] = useState(false);
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
            "SE_PLAN_SIZE",
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
  const refreshCurrentBasicData = async () => {
    const currentSelection = selectSPS.length > 0 ? selectSPS[0] : null;
    // Không search - fetch all
    await fetchDataByPlanOrd().then(() => {
      setData((prevData) => {
        if (prevData?.[0]?.data?.length > 0 && currentSelection) {
          const updatedRecord = prevData[0].data.find(
            (item) =>
              item.factory_code === currentSelection.factory_code &&
              item.se_id === currentSelection.se_id &&
              parseFloat(item.se_ver) === parseFloat(currentSelection.se_ver) &&
              item.se_seq === currentSelection.se_seq &&
              parseFloat(item.pack_gu) ===
                parseFloat(currentSelection.pack_gu) &&
              parseFloat(item.ship_seq) ===
                parseFloat(currentSelection.ship_seq) &&
              parseFloat(item.pk_seq) === parseFloat(currentSelection.pk_seq),
          );

          if (updatedRecord) {
            setSelectSPS([updatedRecord]);
            setJumpToRow(updatedRecord);
          }
        }
        return prevData;
      });
    });
  };
  useEffect(() => {
    fetchAllTranslations();
  }, [language]);
  //selectRows
  useEffect(() => {
    const handleDataFetch = async () => {
      if (
        !selectRows ||
        selectRows.length === 0 ||
        !selectRows[0]?.factory_code ||
        !selectRows[0]?.se_id ||
        !selectRows[0]?.se_ver ||
        !selectRows[0]?.se_seq ||
        !selectRows[0]?.pack_gu ||
        !selectRows[0]?.ship_seq
      ) {
        setData([{ tableName: "SE_PLAN_SIZE", data: [] }]);
        setSelectSPS([]);
        setSelectCheckSPS([]);
        return;
      }
      setCurrentPage(0);
      setCurrentOffset(0);
      setCurrentPageSize(10);
      setSelectCheckSPS([]);
      await fetchDataByPlanOrd(true, 0, 10);
    };

    handleDataFetch();
  }, [
    selectRows?.[0]?.factory_code,
    selectRows?.[0]?.se_id,
    selectRows?.[0]?.se_ver,
    selectRows[0]?.se_seq,
    selectRows[0]?.pack_gu,
    selectRows[0]?.ship_seq,
  ]);

  useEffect(() => {
    if (jumpToRow) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow]);
  const handleEditClose = async () => {
    try {
      if (selectSPS.length === 1) {
        const record = selectSPS[0];
        const freshRecord = await fetchBasicDataRecordFromDB(record);
        const {
          statusText,
          goods_name,
          unit_code,
          unit_name,
          sizerun_name,
          pack_ctns,
          cbm,
          pairs,
          grt_deptname,
          grt_username,
          last_username,
          FACTORY,
          ...unlockedRecord
        } = freshRecord;
        if (freshRecord?.locked_information === user?.clientInfo) {
          const unlockData = {
            ...unlockedRecord,
            locked_information: null,
          };
          await editSePlanSize(
            user?.access_token,
            user?.factory,
            user?.department,
            user?.user_code,
            subAuthentication?.find((item) => item.field === "query_level")
              ?.title,
            currentPageSize,
            unlockData,
          );
          await refreshCurrentBasicData();
        }
      }
      setOpenEdit(false);
    } catch (error) {
      console.error("Error closing edit:", error);
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
          "Please change master to new!",
        );
        return;
      }
      const record = selectRows[0];
      const freshRecord = await fetchBasicDataRecordFromDB(record);
      if (user.user_code !== "admin") {
        const allowModify = subAuthentication?.find(
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
          await refreshCurrentBasicData();
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
      const { FACTORY, ...clearData } = freshRecord;
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
  const handleStatusChange = async (
    newStatus,
    actionName,
    allowedFromStatuses = [],
  ) => {
    if (
      selectRows[0] &&
      (selectRows[0].status === 0 ||
        selectRows[0].status === 7 ||
        selectRows[0].status === 9)
    ) {
      showErrorToast(
        getControlLabel,
        "noti_fail_parent_status",
        "this category is invalid to edit!",
      );
      return;
    }
    if (selectSPS.length !== 1) return;
    try {
      const record = selectSPS[0];
      if (user.user_code !== "admin") {
        const allowModify = subAuthentication?.find(
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
      const freshRecord = await fetchBasicDataRecordFromDB(record);
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
        await refreshCurrentBasicData();
        setJumpToRow(freshRecord);
        return;
      }
      const { FACTORY, goods_name, unit_code, unit_name, ...clearData } =
        freshRecord;
      const updateData = {
        ...clearData,
        status: newStatus,
        last_user: user.user_code,
        last_date: new Date().toISOString(),
      };
      const token = user?.access_token;
      const response = await editSePlanSize(
        token,
        user?.factory,
        user?.department,
        user?.user_code,
        subAuthentication?.find((item) => item.field === "query_level")?.title,
        currentPageSize,
        updateData,
      );
      if (response.success) {
        showSuccessToast(getControlLabel, `noti_success_${actionName}`);
        await refreshCurrentBasicData();
        setJumpToRow(updateData);
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
    //  Master gate — check trước cả nhánh bulk lẫn single, giống hệt
    // guard đầu handleStatusChange, tránh gọi API khi cha đang khóa
    if (
      selectRows[0] &&
      (selectRows[0].status === 0 ||
        selectRows[0].status === 7 ||
        selectRows[0].status === 9)
    ) {
      showErrorToast(
        getControlLabel,
        "noti_fail_parent_status",
        "this category is invalid to edit!",
      );
      return;
    }

    if (selectCheckSPS.length > 0) {
      const allow = subAuthentication?.find(
        (item) => item.field === "query_level",
      )?.title;
      try {
        const result = await confirmItemsSePlanSize(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          selectCheckSPS,
        );
        if (result?.success) {
          const skipped = result.skipped_count ?? 0;
          showSuccessToast(
            getControlLabel,
            "noti_success_confirm",
            skipped > 0
              ? `Confirmed ${result.confirmed_count} record(s), skipped ${skipped} (invalid status)!`
              : `Confirmed ${result.confirmed_count ?? selectCheckSPS.length} record(s)!`,
          );
          setSelectCheckSPS([]);
          setSelectionsVersionSPS((v) => v + 1);
          await refreshCurrentBasicData();
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

    await handleStatusChange(7, "confirm", [1, 2]);
  };

  const handleUnconfirm = async () => {
    //  Master gate — tương tự
    if (
      selectRows[0] &&
      (selectRows[0].status === 0 ||
        selectRows[0].status === 7 ||
        selectRows[0].status === 9)
    ) {
      showErrorToast(
        getControlLabel,
        "noti_fail_parent_status",
        "this category is invalid to edit!",
      );
      return;
    }

    if (selectCheckSPS.length > 0) {
      const allow = subAuthentication?.find(
        (item) => item.field === "query_level",
      )?.title;
      try {
        const result = await unconfirmItemsSePlanSize(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          selectCheckSPS,
        );
        if (result?.success) {
          const skipped = result.skipped_count ?? 0;
          showSuccessToast(
            getControlLabel,
            "noti_success_unconfirm",
            skipped > 0
              ? `Unconfirmed ${result.updated_count} record(s), skipped ${skipped} (invalid status)!`
              : `Unconfirmed ${result.updated_count ?? selectCheckSPS.length} record(s)!`,
          );
          setSelectCheckSPS([]);
          setSelectionsVersionSPS((v) => v + 1);
          await refreshCurrentBasicData();
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

  const handleDelete = async () => {
    const itemsToDelete =
      selectCheckSPS.length > 0
        ? selectCheckSPS
        : selectSPS.length > 0
          ? [selectSPS[0]]
          : [];

    if (itemsToDelete.length === 0) {
      showErrorToast(
        getControlLabel,
        "noti_delete_fail_0",
        "Please choose at least one row to delete!",
      );
      return;
    }

    const refRow = selectSPS[0] || row || itemsToDelete[0];

    try {
      const result = await deleteSePlanSize(
        user?.access_token,
        user?.factory,
        refRow?.se_id,
        refRow?.se_ver,
        refRow?.se_seq,
        refRow?.pack_gu,
        refRow?.ship_seq,
        refRow?.pk_seq,
        itemsToDelete,
      );
      if (result?.success) {
        showSuccessToast(getControlLabel, "noti_delete_success", result?.message);
        setSelectCheckSPS([]);
        setSelectionsVersionSPS((v) => v + 1);
        await refreshCurrentBasicData();
        handleDeleteClose();
      }
    } catch (error) {
      console.error("Error deleting SE_PLAN_SIZE:", error);
      showErrorToast(getControlLabel, "noti_fail_delete", "Failed to delete!");
    }
  };

  const handleDeleteOpen = async () => {
  if (
    selectRows[0] &&
    (selectRows[0].status === 0 ||
      selectRows[0].status === 7 ||
      selectRows[0].status === 9)
  ) {
    showErrorToast(getControlLabel, "noti_fail_parent_status", "this category is invalid to edit!");
    return;
  }

  const allowDelete = subAuthentication?.find((item) => item.field === "allow_delete")?.title;
  if (user?.user_code !== "admin" && allowDelete === "N") {
    return;
  }

  const itemsToDelete =
    selectCheckSPS.length > 0
      ? selectCheckSPS
      : selectSPS.length > 0
        ? [selectSPS[0]]
        : [];

  if (itemsToDelete.length === 0) {
    showErrorToast(getControlLabel, "noti_delete_fail_0", "Please choose at least one row to delete!");
    return;
  }
  const statusNames = { 0: "Cancelled", 7: "Confirmed", 9: "Closed" };
 const freshRecords = await Promise.all(
  itemsToDelete.map((row) =>
    fetchSePlanSizeByID(
      user?.access_token,
      user?.factory,
      row?.se_id,
      row?.se_ver,
      row?.se_seq,
      row?.pack_gu,
      row?.ship_seq,
      row?.pk_seq,
    ).then((res) => res?.data ?? res),
  ),
);

const invalidRecord = freshRecords.find((r) => [0, 7, 9].includes(r?.status));
if (invalidRecord) {
  showErrorToast(
    getControlLabel,
    "noti_delete_fail_1",
    "Cannot delete! Some selected rows have invalid status: {status}",
    { status: statusNames[invalidRecord.status] },
  );
  await refreshCurrentBasicData();
  return;
}

const lockedRecord = freshRecords.find(
  (r) =>
    r?.locked_information &&
    r.locked_information !== "null" &&
    r.locked_information !== "undefined" &&
    r.locked_information !== "" &&
    r.locked_information !== user?.clientInfo,
);
  if (lockedRecord) {
    showErrorToast(
      getControlLabel,
      "noti_delete_fail_2",
      "Cannot delete!\n\nRecord is edited by: {user}\n\nWait for user to finish!",
      { user: lockedRecord.locked_information },
    );
    return;
  }

  setOpenDelete(true);
};

  const handleDeleteClose = () => {
    setOpenDelete(false);
  };
  const handleClose = async () => {
    await handleStatusChange(9, "close", [1, 7]);
  };

  const handleCheck = () => {
    handleStatusChange(2, "check", [1]);
  };

  const handleAdd = async (addData) => {
    const payload = {
      ...addData,
      factory_code: user.factory,
      grt_dept: user.department,
      grt_user: user.user_code,
      grt_date: new Date().toISOString(),
      status: 1,
    };
    try {
      const response = await addSeShippingD(
        user.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        subAuthentication?.find((item) => item.field === "query_level")?.title,
        currentPageSize,
        payload,
      );
      if (response.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_add",
          `Add successfully with id ${payload.cust_id}!`,
        );
        handleClosedAdd();
        try {
          const allow = Array.isArray(subAuthentication)
            ? subAuthentication.find((item) => item.field === "query_level")
                ?.title
            : null;
          const responseData = await fetchAllSeShipingD(
            user?.access_token,
            user?.factory,
            selectRows[0]?.cust_id,
            selectRows[0]?.si_seq,
            selectRows[0]?.si_type,
            user?.department,
            user?.user_code,
            allow,
            language,
            response.size,
            response.offset,
          );
          setData([
            {
              tableName: "SE_PLAN_SIZE",
              data: responseData.data || [],
            },
          ]);
          setHasMore(responseData?.hasMore);
          setSelectSPS([response.data]);
          setCurrentPage(response?.page);
          setCurrentPageSize(response.size);
          setCurrentOffset(response.offset);
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
        showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
        handleClosedAdd();
      }
    } catch (error) {
      console.error(" Error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add record";

      console.error(errorMessage);
      showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
      handleClosedAdd();
    }
  };

  const handleSelectChoose = (rows) => {
    setSelectSPS(rows);
  };
  const handlePDF = async () => {
    await exportPDFBasicData();
  };

  const handleEdit = async (updateRow, title, skipTimestamp = false) => {
    const {
      statusText,
      si_type_name,
      ag_name,
      countrynm,
      ad_name,
      sizerun_name,
      pack_ctns,
      cbm,
      pairs,
      grt_deptname,
      grt_username,
      last_username,
      ...update
    } = updateRow;

    if (!skipTimestamp) {
      update.last_user = user.user_code;
      update.last_date = new Date().toISOString();
    }
    try {
      const result = await editSePlanSize(
        user?.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        subAuthentication?.find((item) => item.field === "query_level")?.title,
        currentPageSize,
        update,
      );
      if (result && result.success) {
        const successMessage =
          typeof title === "string" && title
            ? title
            : `${getControlLabel(
                "noti_success_edit",
                "Edit successfully with id",
              )} ${updateRow.cust_id}!`;

        if (!skipTimestamp) {
          showSuccessToast(
            getControlLabel,
            "noti_success_edit",
            successMessage,
          );
        }

        await refreshCurrentBasicData();
        if (!skipTimestamp) {
          handleEditClose(update);
        }
      }
    } catch (error) {
      showErrorToast(getControlLabel, "noti_edit_fail_ctns", error?.message, {
        user: user?.user_code,
      });
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
  const mapLanguageToColumn = (language) => {
    const languageMap = {
      zh: "_t",
      en: "_e",
      vi: "_l",
    };

    return languageMap[language] || "_e";
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
      <DataTable
        data={data[0]?.data}
        tableName={"SE_PLAN_SIZE"}
        onChecked={handleChecked}
        selectRows={selectSPS}
        onSelectChange={setSelectSPS}
        onDelete={handleDeleteOpen}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        onUnconfirm={handleUnconfirm}
        onClose={handleClose}
        onDetail={(row) => {
          handleDetailModal(row);
        }}
        onSearch={handleSearchByCode}
        onPDF={handlePDF}
        popupOpen={openEdit}
        columnTranslations={columnTranslations}
        controlTranslations={controlTranslations}
        language={language}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        jumpToRow={jumpToRow}
        isSubTable={true}
        onPageChange={handlePageChange}
        currentPage={currentPage}
        currentPageSize={currentPageSize}
        totalData={totalData || 0}
        hasMore={hasMore}
        checkboxSelection={false}
        customCheckboxColumn={true}
        customSelections={selectCheckSPS}
        onCustomCheckboxChange={onCustomCheckboxChangeSPS}
        selectionsVersion={selectionsVersionSPS}
      />
      <AddSeShippingD
        open={openAdd}
        onClose={handleClosedAdd}
        handleAdd={handleAdd}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={subAuthentication}
        selectRows={selectRows.length ? selectRows : []}
      />
      <EditSePlanSize
        open={openEdit}
        onClose={handleEditClose}
        handleEdit={handleEdit}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={subAuthentication}
        selectRows={selectRows.length ? selectRows : []}
        sePlanSize={selectSPS.length > 0 ? selectSPS[0] : {}}
      />
      <DeleteSePlanOrd
        openLink={openDelete}
        onClose={handleDeleteClose}
        onDelete={handleDelete}
        getColumnLabel={getColumnLabel}
        getControlLabel={getControlLabel}
        selectRows={
          selectCheckSPS.length > 0
            ? selectCheckSPS
            : selectSPS.length > 0
              ? [selectSPS[0]]
              : []
        }
        deleteKeys={[
          "se_id",
          "se_ver",
          "se_seq",
          "pack_gu",
          "ship_seq",
          "pk_seq",
        ]}
      />
    </>
  );
};
export default SePlanSize;
