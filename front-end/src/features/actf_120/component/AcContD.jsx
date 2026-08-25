import { useEffect, useState } from "react";
import DataTable from "../../../component/table/DataTable";
import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";

import { toast } from "react-toastify";
import { fnQuery } from "../../../utils/fnQuery";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import { exportPDFBasicData } from "../../../service/basic_data/basicDataService";
import AddAcContD from "../page/AddAcContD";
import EditAcContD from "../page/EditAcContD";
import {
  addAcContD,
  deleteAcContD,
  editAcContD,
  fetchAllAcContDWithView,
} from "../../../service/ac_cont_d/acContDService";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../../utils/notification/Notification";
import DeleteAcContD from "../../actf_120/page/DeleteAcContD";
const AcContD = ({
  jumpToRow,
  setJumpToRow,
  data = [],
  setData,
  setSelectAcContD,
  selectAcContD = [],
  selectRows = [],
  isSearch = false,
  fetchDetailRecordFromDB,
  handleSearchByCode,
  subAuthentication,
  user,
  currentACDPage,
  setCurrentACDPage,
  currentACDPageSize,
  setCurrentACDPageSize,
  currentACDOffset,
  setCurrentACDOffset,
  searchBasicDataFilter,
  fetchDataByContNo,
  openAddAcContD,
  handleOpenAddAcContD,
  handleClosedAddAcContD,
  totalACDData,
  setTotalACDData,
  onACDPageChange,
  searchData,
  hasMore,
  setHasMore,
}) => {
  const [openAdd, setOpenAdd] = useState(false);
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
            "ACTF_110",
            "detail",
            "ac_cont_m",
            "AC_CONT_D",
          ),
        () => fetchTableControlTranslations("ACTF_110"),
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
  const refreshCurrentBasicData = async () => {
    const currentSelection = selectAcContD.length > 0 ? selectAcContD[0] : null;

    await fetchDataByContNo(false, currentACDOffset, currentACDPageSize).then(
      () => {
        setData((prevData) => {
          if (prevData?.[0]?.data?.length > 0 && currentSelection) {
            const normalizeSeq = (seq) => parseFloat(seq) || 0;

            const updatedRecord = prevData[0].data.find(
              (item) =>
                item.factory_code === currentSelection.factory_code &&
                item.cont_no === currentSelection.cont_no &&
                normalizeSeq(item.seq) === normalizeSeq(currentSelection.seq),
            );

            if (updatedRecord) {
              setSelectAcContD([updatedRecord]);
              setJumpToRow(updatedRecord);
            }
          }
          return prevData;
        });
      },
    );
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
        !selectRows[0]?.cont_no
      ) {
        setData([{ tableName: "AC_CONT_D", data: [] }]);
        setSelectAcContD([]);
        return;
      }
      setCurrentACDPage(0);
      setCurrentACDOffset(0);
      setCurrentACDPageSize(10);
      await fetchDataByContNo(true, 0, 10);
    };

    handleDataFetch();
  }, [
    selectRows?.[0]?.factory_code,
    selectRows?.[0]?.cont_no,
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
    const handleDelete = async () => {
    const result = await deleteAcContD(
      user?.factory,
      selectAcContD[0]?.cont_no,
      selectAcContD[0]?.seq,
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
      setCurrentACDPage(0);
      setCurrentACDOffset(0);
      await fetchDataByContNo(false, 0, currentACDPageSize);
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
      showErrorToast(
        getControlLabel,
        "noti_delete_fail_2",
        "You don't have permission to delete!",
      );
      return;
    }

    const freshRecord = await fetchDetailRecordFromDB(selectAcContD[0]);

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
            `${item.factory_code}-${item.cont_no}-${parseFloat(item.seq)}` ===
            `${freshRecord.factory_code}-${freshRecord.cont_no}-${parseFloat(freshRecord.seq)}`
              ? freshRecord
              : item,
          ),
        })),
      );
      setSelectAcContD([freshRecord]);
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
  const handleAddClose = () => {
    setOpenAdd(false);
  };
  const handleOpenAdd = () => {
    if (selectRows.length === 0) {
      toast.error("Please choose factory before list all permission!");
      return;
    }
    if (
      selectRows[0] &&
      (selectRows[0].status === 0 ||
        selectRows[0].status === 7 ||
        selectRows[0].status === 9)
    ) {
      toast.error("this category is invalid to add!");
      return;
    }
    setOpenAdd(true);
  };
  const handleEditClose = async () => {
    try {
      if (selectAcContD.length === 1) {
        const record = selectAcContD[0];
        const freshRecord = await fetchDetailRecordFromDB(record);
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
          await editAcContD(
            user?.access_token,
            user?.factory,
            user?.department,
            user?.user_code,
            subAuthentication?.find((item) => item.field === "query_level")
              ?.title,
            currentACDPageSize,
            unlockData,
          );
          await fetchDataByContNo(false).then(() => {
            setData((prevData) => {
              if (prevData?.[0]?.data?.length > 0) {
                const updatedBD = prevData[0].data.find(
                  (item) =>
                    `${item.factory_code}-${item.cont_no}-${item.seq}` ===
                    `${record.factory_code}-${record.cont_no}-${record.seq}`,
                );
                if (updatedBD) {
                  setSelectAcContD([updatedBD]);
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
          "Please unconfirm first!",
        );
        return;
      }

      const record = selectAcContD[0];
      const freshRecord = await fetchDetailRecordFromDB(record);

      if (user.user_code !== "admin") {
        const allowModify = subAuthentication?.find(
          (item) => item.field === "modify_level",
        )?.title;
        const allowStatus = freshRecord?.status;

        if (allowModify === "2" && freshRecord?.grt_dept !== user.department) {
          showWarningToast(
            getControlLabel,
            "noti_fail_modify_department",
            "You dont have permission to modify this record!",
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
            "noti_fail_child_status",
            "Cannot edit! Present status: {status}",
            { status: statusNames[allowStatus] },
          );
          setData((prevData) => {
            return prevData.map((table) => ({
              ...table,
              data: table.data.map((item) =>
                `${item.factory_code}-${item.cont_no}-${item.seq}` ===
                `${freshRecord.factory_code}-${freshRecord.cont_no}-${freshRecord.seq}`
                  ? freshRecord
                  : item,
              ),
            }));
          });
          setSelectAcContD([freshRecord]);
          setJumpToRow(freshRecord);
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
        showWarningToast(
          getControlLabel,
          "noti_fail_lock",
          "Record is edited!\\nLocked by: {user}",
          { user: freshRecord.locked_information },
          { toastId: `locked-${freshRecord.locked_information}` },
        );
        return;
      }
      const { FACTORY, ...clearData } = freshRecord;
      const lockData = {
        ...clearData,
        locked_information: user?.clientInfo,
      };

      await handleEdit(lockData, "", true);
      setSelectAcContD([lockData]);
      setOpenEdit(true);
    } catch (error) {
      console.log("error when open the edit popup", error);
      showErrorToast(
        getControlLabel,
        "noti_error_open_edit",
        "An error occurred while opening edit form!",
      );
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
    if (selectAcContD.length !== 1) return;
    try {
      const record = selectAcContD[0];
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
            "noti_fail_permission",
            "You don't have permission!",
          );
          return;
        }
      }
      const freshRecord = await fetchDetailRecordFromDB(record);
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
          ` Cannot ${actionName}!\n\nRecord is edited by: ${freshRecord.locked_information}\n\nWait for user to finish!`,
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
      const response = await editAcContD(
        token,
        user?.factory,
        user?.department,
        user?.user_code,
        subAuthentication?.find((item) => item.field === "query_level")?.title,
        currentACDPageSize,
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

  const handlePDF = async () => {
    await exportPDFBasicData();
  };
  const handleAddAcContD = async (addData) => {
    const payload = {
      ...addData,
      factory_code: user.factory,
      cont_no: selectRows[0].cont_no,
      grt_dept: user.department,
      grt_user: user.user_code,
      grt_date: new Date().toISOString(),
      status: 1,
    };
    try {
      const response = await addAcContD(
        user.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        subAuthentication?.find((item) => item.field === "query_level")?.title,
        currentACDPageSize,
        payload,
      );
      if (response.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_add",
          `Add successfully with id ${addData.cont_no}!`,
        );
        handleClosedAddAcContD();
        try {
          const allow = Array.isArray(subAuthentication)
            ? subAuthentication.find((item) => item.field === "query_level")
                ?.title
            : null;
          const responseData = await fetchAllAcContDWithView(
            user?.access_token,
            selectRows[0]?.cont_no,
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
              tableName: "AC_CONT_D",
              data: responseData.data || [],
            },
          ]);
          setHasMore(responseData?.hasMore);
          setSelectAcContD([response.data]);
          setJumpToRow(response.data);
          setCurrentACDPage(response?.page);
          setCurrentACDPageSize(response.size);
          setCurrentACDOffset(response.offset);
          setTotalACDData((prevTotal) => prevTotal + 1);
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
        handleClosedAddAcContD();
      }
    } catch (error) {
      console.error(" Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to add record";
      console.error(errorMessage);
      showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
      handleClosedAddAcContD();
    }
  };
  const handleEdit = async (updateRow, title, skipTimestamp) => {
    const { statusText, goods_name, unit_code, unit_name, ...update } =
      updateRow;
    if (!skipTimestamp) {
      update.last_user = user.user_code;
      update.last_date = new Date().toISOString();
    }
    const result = await editAcContD(
      user?.access_token,
      user?.factory,
      user?.department,
      user?.user_code,
      subAuthentication?.find((item) => item.field === "query_level")?.title,
      currentACDPageSize,
      update,
    );
    if (result.success) {
      const successMessage =
        typeof title === "string" && title
          ? title
          : `${getControlLabel(
              "noti_success_edit",
              "Edit successfully with id",
            )} ${updateRow.cont_no}!`;

      if (!skipTimestamp) {
        showSuccessToast(getControlLabel, "noti_success_edit", successMessage);
      }

      setData((prevData) => {
        if (!prevData.length) {
          return prevData;
        }

        const { factory_code, cont_no, seq } = update;
        const itemKey = `${factory_code}-${cont_no}-${seq}`;

        const filterPermission = prevData.map((table) => ({
          ...table,
          data: table.data.map((p) => {
            const eachKey = `${p.factory_code}-${p.cont_no}-${p.seq}`;
            return eachKey === itemKey ? { ...p, ...update } : p;
          }),
        }));

        return filterPermission;
      });

      setSelectAcContD([update]);

      if (!skipTimestamp) {
        handleEditClose(update);
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
        tableName={"AC_CONT_D"}
        onChecked={handleChecked}
        selectRows={selectAcContD}
        onSelectChange={setSelectAcContD}
        onDelete={handleDeleteOpen}
        onSelectModify={handleSelectModify}
        onSelectQuery={handleSelectQuery}
        onAdd={handleOpenAddAcContD}
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
        onPageChange={onACDPageChange}
        totalData={totalACDData || 0}
        currentPage={currentACDPage}
        currentPageSize={currentACDPageSize}
        hasMore={hasMore}
        isSearch={isSearch}
      />
      <AddAcContD
        open={openAddAcContD}
        onClose={handleClosedAddAcContD}
        handleAdd={handleAddAcContD}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={subAuthentication}
        selectRows={selectRows.length ? selectRows : []}
      />
      <EditAcContD
        open={openEdit}
        onClose={handleEditClose}
        handleEdit={handleEdit}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={subAuthentication}
        selectRows={selectRows.length ? selectRows : []}
        basicData={selectAcContD.length > 0 ? selectAcContD[0] : {}}
      />
       <DeleteAcContD
        openLink={openDelete}
        onClose={handleDeleteClose}
        onDelete={handleDelete}
        getColumnLabel={getColumnLabel}
        getControlLabel={getControlLabel}
        selectRows={selectAcContD.length > 0 ? selectAcContD : []}
      />
    </>
  );
};
export default AcContD;
