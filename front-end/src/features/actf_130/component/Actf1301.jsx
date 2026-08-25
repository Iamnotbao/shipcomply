import { useEffect, useState } from "react";
import DataTable from "../../../component/table/DataTable";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material";

import { toast } from "react-toastify";
import { fnQuery } from "../../../utils/fnQuery";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import {
  addBasicData,
  editBasicData,
  exportPDFBasicData,
  searchBasicDataByFilter,
} from "../../../service/basic_data/basicDataService";
import AddAcInmD from "../page/AddAcInmD";
import {
  addAcInmD,
  editAcInmD,
  fetchAllInmD,
  deleteAcContD
} from "../../../service/ac_inm_d/acInmD";
import EditAcInmD from "../page/EditAcInmD";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../../utils/notification/Notification";
import DeleteAcInmD from "../page/DeleteAcInmD";
const Actf1301 = ({
  jumpToRow,
  setJumpToRow,
  data = [],
  setData,
  setSelectAcInmD,
  selectAcInmD = [],
  selectRows = [],
  isSearch = false,
  searchData = [],
  fetchBasicDataRecordFromDB,
  handleSearchByCode,
  subAuthentication,
  user,
  handleBasicDataPageChange,
  currentAIDPage,
  setCurrentAIDPage,
  currentAIDPageSize,
  setCurrentAIDPageSize,
  currentAIDOffset,
  setCurrentAIDOffset,
  searchBasicDataFilter,
  fetchDataByInmNo,
  openAddAcInmD,
  setOpenAddAcInmD,
  handleOpenAddAcInmD,
  handleClosedAddAcInmD,
  totalAIDData,
  setTotalAIDData,
  handleAIDPageChange,
  hasMore,
  setHasMore,
}) => {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const theme = useTheme();
  const [openDetail, setOpenDetail] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
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
            "ACTF_130",
            "detail",
            "ac_inm_m",
            "AC_INM_D",
          ),
        () => fetchTableControlTranslations("ACTF_130"),
      ]);
      if (columns) {
        setColumnTranslations(columns?.data);
      }
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
    const currentSelection = selectAcInmD.length > 0 ? selectAcInmD[0] : null;

    if (isSearch && searchBasicDataFilter) {
      const response = await fetchDataByInmNo();

      if (response && response.data) {
        setData([{ tableName: response.tableName, data: response.data }]);

        if (currentSelection) {
          const normalizeSeq = (seq) => parseFloat(seq) || 0;

          const foundRecord = response.data.find(
            (item) =>
              item.factory_code === currentSelection.factory_code &&
              item.inm_no === currentSelection.inm_no &&
              normalizeSeq(item.seq) === normalizeSeq(currentSelection.seq),
          );

          if (foundRecord) {
            setSelectAcInmD([foundRecord]);
            setJumpToRow(foundRecord);
          } else {
            //  Không tìm thấy - giữ nguyên selection hiện tại
            console.warn(
              " Record not found after edit, keeping current selection",
            );
            const startIndex = currentAIDPage * currentAIDPageSize;
            const itemOnCurrentPage = response.data[startIndex];

            if (itemOnCurrentPage) {
              setSelectAcInmD([itemOnCurrentPage]);
              setJumpToRow(itemOnCurrentPage);
            }
          }
        }
      }
    } else {
      // Không search - fetch all
      await fetchDataByInmNo().then(() => {
        setData((prevData) => {
          if (prevData?.[0]?.data?.length > 0 && currentSelection) {
            const normalizeSeq = (seq) => parseFloat(seq) || 0;

            const updatedRecord = prevData[0].data.find(
              (item) =>
                item.factory_code === currentSelection.factory_code &&
                item.inm_no === currentSelection.inm_no &&
                normalizeSeq(item.seq) === normalizeSeq(currentSelection.seq),
            );

            if (updatedRecord) {
              setSelectAcInmD([updatedRecord]);
              setJumpToRow(updatedRecord);
            }
          }
          return prevData;
        });
      });
    }
  };
  useEffect(() => {
    console.log(" Language changed to:", language);
    fetchAllTranslations();
  }, [language]);
  //selectRows
  useEffect(() => {
    const handleDataFetch = async () => {
      if (
        !selectRows ||
        selectRows.length === 0 ||
        !selectRows[0]?.factory_code ||
        !selectRows[0]?.inm_no
      ) {
        setData([{ tableName: "AC_INM_D", data: [] }]);
        setSelectAcInmD([]);
        return;
      }
      setCurrentAIDPage(0);
      setCurrentAIDOffset(0);
      setCurrentAIDPageSize(10);
      await fetchDataByInmNo(true, 0, 10);
    };

    handleDataFetch();
  }, [selectRows?.[0]?.factory_code, selectRows?.[0]?.inm_no]);

  useEffect(() => {
    if (jumpToRow) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow]);
  const handleDelete = async () => {
    const result = await deleteAcContD(
      user?.factory,
      selectAcInmD[0]?.inm_no,
      selectAcInmD[0]?.seq,
    );
    if (result?.success) {
      showSuccessToast(getControlLabel, "noti_delete_success", result?.message);
      handleDeleteClose();
      // const response = await fetchDataByContNo(false, currentACDOffset, currentACDPageSize);
      // const currentData = response?.data || [];
      // if (currentData.length === 0 && currentACDPage > 0) {
      //   const prevPage = currentACDPage - 1;
      //   const prevOffset = prevPage * currentACDPageSize;
      //   setCurrentACDPage(prevPage);
      //   setCurrentACDOffset(prevOffset);
      //   await fetchDataByContNo(false, prevOffset, currentACDPageSize);
      // }
      setCurrentAIDPage(0);
      setCurrentAIDOffset(0);
      await fetchDataByInmNo(false, 0, currentAIDPageSize);
    }
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
    const allowDelete = subAuthentication?.find(
      (item) => item.field === "allow_delete",
    )?.title;
    if (user?.user_code !== "admin" && allowDelete === "N") {
      return;
    }

    const freshRecord = await fetchBasicDataRecordFromDB(selectAcInmD[0]);

    const statusNames = { 0: "Cancelled", 7: "Confirmed", 9: "Closed" };
    if ([0, 7, 9].includes(freshRecord?.status)) {
      showErrorToast(
        getControlLabel,
        "noti_delete_fail_1",
        "Cannot delete! Present status: {status}",
        { status: statusNames[freshRecord.status] },
      );
      setData((prevData) =>
        prevData.map((table) => ({
          ...table,
          data: table.data.map((item) =>
            `${item.factory_code}-${item.inm_no}-${parseFloat(item.seq)}` ===
            `${freshRecord.factory_code}-${freshRecord.inm_no}-${parseFloat(freshRecord.seq)}`
              ? freshRecord
              : item,
          ),
        })),
      );
      setSelectAcInmD([freshRecord]);
      setJumpToRow(freshRecord);
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
  const handleEditClose = async () => {
    try {
      if (selectAcInmD.length === 1) {
        const record = selectAcInmD[0];
        const freshRecord = await fetchBasicDataRecordFromDB(record);
        const {
          statusText,
          goods_name,
          unit_code,
          unit_name,
          FACTORY,
          ...unlockedRecord
        } = freshRecord;
        if (freshRecord?.locked_information === user?.clientInfo) {
          const unlockData = {
            ...unlockedRecord,
            locked_information: null,
          };
          await editAcInmD(
            user?.access_token,
            user?.factory,
            user?.department,
            user?.user_code,
            subAuthentication?.find((item) => item.field === "query_level")
              ?.title,
            currentAIDPageSize,
            unlockData,
          );
          await fetchDataByInmNo(false).then(() => {
            setData((prevData) => {
              if (prevData?.[0]?.data?.length > 0) {
                const updatedBD = prevData[0].data.find(
                  (item) =>
                    `${item.factory_code}-${item.inm_no}-${item.seq}` ===
                    `${record.factory_code}-${record.inm_no}-${record.seq}`,
                );
                if (updatedBD) {
                  setSelectAcInmD([updatedBD]);
                }
              }
              return prevData;
            });
          });
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
              user: freshRecord.locked_information || "Unknown",
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
     freshRecord.locked_information !==user?.clientInfo
      ) {
        showErrorToast(
          getControlLabel,
          "noti_edit_fail_1",
          `Cannot edit!\n\nRecord is edited by: ${freshRecord.locked_information}\n\nWait for user to finish!`,
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
    if (selectAcInmD.length !== 1) return;
    try {
      const record = selectAcInmD[0];
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
        const allowAction = subAuthentication?.find(
          (item) => item.field === `allow_${actionName}`,
        )?.title;
        if (allowAction === "N") {
          showWarningToast(
            getControlLabel,
            "noti_fail_child_status",
            `You don't have permission to ${actionName}!`,
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
     freshRecord.locked_information !==user?.clientInfo
      ) {
        showErrorToast(
          getControlLabel,
          "noti_fail_2",
          `Cannot ${actionName}!\n\nRecord is edited by: ${freshRecord.locked_information}\n\nWait for user to finish!`,
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
          ` Cannot ${actionName}!Present status: ${
            statusNames[freshRecord.status]
          }`,
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
      const response = await editAcInmD(
        token,
        user?.factory,
        user?.department,
        user?.user_code,
        subAuthentication?.find((item) => item.field === "query_level")?.title,
        currentAIDPageSize,
        updateData,
      );
      if (response.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_grant",
          `${actionName} success!`,
        );
        await refreshCurrentBasicData();
        setJumpToRow(updateData);
      }
    } catch (error) {
      console.error(` Error in ${actionName}:`, error);
      showErrorToast(
        getControlLabel,
        "noti_error_generic",
        `This has error when ${actionName}! ${error}`,
      );
    }
  };

  const handleCancel = async () => {
    await handleStatusChange(0, "cancel", [1, 2]);
  };

  const handleConfirm = async () => {
    await handleStatusChange(7, "confirm", [1, 2]);
  };

  const handleUnconfirm = async () => {
    await handleStatusChange(1, "unconfirm", [7]);
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
      inm_no: selectRows[0].inm_no,
      grt_dept: user.department,
      grt_user: user.user_code,
      grt_date: new Date().toISOString(),
      status: 1,
    };
    try {
      const response = await addAcInmD(
        user.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        subAuthentication?.find((item) => item.field === "query_level")?.title,
        currentAIDPageSize,
        payload,
      );
      if (response.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_add",
          `Add successfully with id ${payload.inm_no}!`,
        );
        handleClosedAddAcInmD();
        try {
          const allow = Array.isArray(subAuthentication)
            ? subAuthentication.find((item) => item.field === "query_level")
                ?.title
            : null;
          const responseData = await fetchAllInmD(
            user?.access_token,
            selectRows[0]?.inm_no,
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
              tableName: "AC_INM_D",
              data: responseData.data || [],
            },
          ]);
          setHasMore(responseData?.hasMore);
          setSelectAcInmD([response.data]);
          setCurrentAIDPage(response?.page);
          setCurrentAIDPageSize(response.size);
          setCurrentAIDOffset(response.offset);
          setTotalAIDData((prevTotal) => prevTotal + 1);
        } catch (fetchError) {
          console.error("Error fetching data after add:", fetchError);
          showErrorToast(
            getControlLabel,
            "noti_fail_add_2",
            `Added successfully but failed to refresh data`,
          );
        }
      } else {
        console.error(response.error || response.message || "Failed to add");
        showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
        handleClosedAddAcInmD();
      }
    } catch (error) {
      console.error(" Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add record";
      console.error(errorMessage);
      showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
      handleClosedAddAcInmD();
    }
  };

  const handleSelectChoose = (rows) => {
    setSelectAcInmD(rows);
  };
  const handlePDF = async () => {
    await exportPDFBasicData();
  };

  const handleEdit = async (updateRow, title, skipTimestamp = false) => {
    const { statusText, item_nonm, in_unitnm, invoice_no, ...update } =
      updateRow;

    if (!skipTimestamp) {
      update.last_user = user.user_code;
      update.last_date = new Date().toISOString();
    }
    const result = await editAcInmD(
      user?.access_token,
      user?.factory,
      user?.department,
      user?.user_code,
      subAuthentication?.find((item) => item.field === "query_level")?.title,
      currentAIDPageSize,
      update,
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
      setData((prevData) => {
        if (!prevData.length) {
          return prevData;
        }
        const { factory_code, inm_no, seq } = update;
        const itemKey = `${factory_code}-${inm_no}-${seq}`;

        const filterPermission = prevData.map((table) => ({
          ...table,
          data: table.data.map((p) => {
            const eachKey = `${p.factory_code}-${p.inm_no}-${p.seq}`;
            return eachKey === itemKey ? { ...p, ...update } : p;
          }),
        }));
        return filterPermission;
      });

      setSelectAcInmD([update]);

      if (!skipTimestamp) {
        handleEditClose(update);
      }
      showSuccessToast(getControlLabel, "noti_success_grant", successMessage);
    } else {
      showErrorToast(
        getControlLabel,
        "noti_fail_grant",
        `Cannot grant Privilage for user ${user.user_code}!`,
      );
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
        tableName={"AC_INM_D"}
        onChecked={handleChecked}
        selectRows={selectAcInmD}
        onSelectChange={setSelectAcInmD}
        onDelete={handleDeleteOpen}
        onAdd={handleOpenAddAcInmD}
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
        onPageChange={handleAIDPageChange}
        currentPage={currentAIDPage}
        currentPageSize={currentAIDPageSize}
        totalData={totalAIDData || 0}
        hasMore={hasMore}
      />
      <AddAcInmD
        open={openAddAcInmD}
        onClose={handleClosedAddAcInmD}
        handleAdd={handleAdd}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={subAuthentication}
        selectRows={selectRows.length ? selectRows : []}
      />
      <EditAcInmD
        open={openEdit}
        onClose={handleEditClose}
        handleEdit={handleEdit}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={subAuthentication}
        selectRows={selectRows.length ? selectRows : []}
        basicData={selectAcInmD.length > 0 ? selectAcInmD[0] : {}}
      />
      <DeleteAcInmD
        openLink={openDelete}
        onClose={handleDeleteClose}
        onDelete={handleDelete}
        getColumnLabel={getColumnLabel}
        getControlLabel={getControlLabel}
        selectRows={selectAcInmD.length > 0 ? selectAcInmD : []}
      />
    </>
  );
};
export default Actf1301;
