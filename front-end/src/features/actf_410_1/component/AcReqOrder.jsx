import { useEffect, useState } from "react";
import DataTable from "../../../component/table/DataTable";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material";

import { toast } from "react-toastify";
import { fnQuery } from "../../../utils/fnQuery";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import useAuth from "../../../hooks/useAuth";
import { exportPDFBasicData } from "../../../service/basic_data/basicDataService";
import {
  addAcItemRef,
  editAcItemRef,
  fetchDataByItemAcno,
} from "../../../service/ac_item_ref/AcItemRefService";
import AddAcReqOrderPage from "../page/AddAcReqOrderPage";
import {
  deleteAcReqOrder,
  editAcReqOrder,
} from "../../../service/ac_req_order/AcReqOrder";
import EditAcReqOrderPage from "../page/EditAcReqOrderPage";
import {
  showErrorToast,
  showSuccessToast,
} from "../../../utils/notification/Notification";
import DeleteAcReqOrder from "../page/DeleteAcReqOrder";

const AcReqOrder = ({
  data,
  setData,
  setSelectAcReqOrder,
  selectAcReqOrder,
  isSearch = false,
  selectRows,
  fetchDataByReqNo,
  fetchAcReqOrderRecordFromDB,
  searchData,
  subAuthentication,
  isHide = false,
  totalAROData,
  currentAROPage,
  currentAROPageSize,
  currentAROOffset,
  setCurrentAROPage,
  setCurrentAROPageSize,
  setCurrentAROOffset,
  setTotalAROData,
  onAROPageChange,
  jumpToRow,
  setJumpToRow,
  parentKeyField = "req_no",
  hasMore,
  setHasMore,
  isVnImport
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
  const { user } = useAuth();

  const fetchAllTranslations = async () => {
    try {
      const [columns, controls, auth] = await fnQuery([
        () =>
          fetchTableColumnTranslations(
            "ACTF_410",
            "detail",
            "ac_req_m",
            "AC_REQ_ORDER",
          ),
        () => fetchTableControlTranslations("ACTF_410"),
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
        !selectRows?.[0]?.[parentKeyField]
      ) {
        setData([{ tableName: "AC_REQ_ORDER", data: [] }]);
        setSelectAcReqOrder([]);
        return;
      }
      const selectedParentRow = selectRows[0];

      //  KIỂM TRA: Nếu đang search, KHÔNG GỌI API
      if (isSearch && searchData.length > 0) {
      

        //  Lọc details từ searchData
        const masterDetails = searchData.filter(
          (detail) =>
            detail.factory_code === selectedParentRow.factory_code &&
            detail.req_no === selectedParentRow.req_no,
        );


        //  Phân trang
        const detailPageSize = currentAROPageSize || 10;
        const paginatedDetails = masterDetails.slice(0, detailPageSize);

        setData([{ tableName: "AC_REQ_ORDER", data: paginatedDetails }]);
        setTotalAROData(masterDetails.length);
        setCurrentAROPage(0);
        setCurrentAROOffset(0);

        if (paginatedDetails.length > 0) {
          setSelectAcReqOrder([paginatedDetails[0]]);
          setJumpToRow(paginatedDetails[0]);
        } else {
          setSelectAcReqOrder([]);
          setJumpToRow(null);
        }

        return; //  DỪNG TẠI ĐÂY, không chạy fetchDataByIAcno
      }

      //  Không search - gọi API như bình thường

      setCurrentAROPage(0);
      setCurrentAROOffset(0);
      setCurrentAROPageSize(10);

      await fetchDataByReqNo(true, 0, 10);
    };

    handleDataFetch();
  }, [
    selectRows?.[0]?.factory_code,
    selectRows?.[0]?.[parentKeyField],
    // isSearch,
    // searchData.length,
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
  const handleEditClose = async () => {
    try {
      if (selectAcReqOrder.length === 1) {
        const record = selectAcReqOrder[0];
        const freshRecord = await fetchAcReqOrderRecordFromDB(record);
        const { FACTORY, BASIC_DATA_CATEGORY, CATEGORY, ...unlockedRecord } =
          freshRecord;
        if (freshRecord?.locked_information === user?.clientInfo) {
          const unlockData = {
            ...unlockedRecord,
            locked_information: null,
          };
          await editAcReqOrder(
            user?.factory,
            user?.department,
            user?.user_code,
            subAuthentication?.find((item) => item.field === "query_level")
              ?.title,
            unlockData,
            currentAROPageSize,
          );
          await fetchDataByReqNo(false).then(() => {
            setData((prevData) => {
              if (prevData?.[0]?.data?.length > 0) {
                const updatedBD = prevData[0].data.find(
                  (item) =>
                    `${item.factory_code}-${item.req_no}-${item.req_seq}` ===
                    `${record.factory_code}-${record.req_no}-${record.req_seq}`,
                );
                if (updatedBD) {
                  setSelectAcReqOrder([updatedBD]);
                }
              }
              return prevData;
            });
          });
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
          "Please unconfirm first!",
        );
        return;
      }

      const record = selectAcReqOrder[0];
      const freshRecord = await fetchAcReqOrderRecordFromDB(record);

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
            "noti_edit_fail_2",
            ` Cannot edit!Present status: ${statusNames[freshRecord.status]}`,
            {
              status: statusNames[freshRecord?.status] || "Unknown",
            },
          );
          setData((prevData) => {
            return prevData.map((table) => ({
              ...table,
              data: table.data.map((item) =>
                `${item.factory_code}-${item.req_no}-${item.req_seq}` ===
                `${freshRecord.factory_code}-${freshRecord.req_no}-${freshRecord.req_seq}`
                  ? freshRecord
                  : item,
              ),
            }));
          });

          setSelectAcReqOrder([freshRecord]);
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
      setSelectAcReqOrder([lockData]);
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

    if (selectAcReqOrder.length !== 1) return;

    try {
      const record = selectAcReqOrder[0];

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
            "noti_fail_permission_action",
            `You don't have permission to ${actionName}!`,
          );
          return;
        }
      }

      const freshRecord = await fetchAcReqOrderRecordFromDB(record);

      if (
        freshRecord.locked_information &&
        freshRecord.locked_information !== "null" &&
        freshRecord.locked_information !== "undefined" &&
        freshRecord.locked_information !== "" &&
     freshRecord.locked_information !==user?.clientInfo &&
        freshRecord.locked_information !== user?.clientInfo
      ) {
        showErrorToast(
          getControlLabel,
          "noti_fail_2",
          "Cannot {actionName}!\\n\\nRecord is edited by: {user}\\n\\nWait for user to finish!",
          {
            actionName: actionName,
            user: freshRecord.locked_information,
          },
          { toastId: `locked-${actionName}` },
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

        setData((prevData) => {
          return prevData.map((table) => ({
            ...table,
            data: table.data.map((item) =>
              `${item.factory_code}-${item.req_no}-${item.req_seq}` ===
              `${freshRecord.factory_code}-${freshRecord.req_no}-${freshRecord.req_seq}`
                ? freshRecord
                : item,
            ),
          }));
        });

        setSelectAcReqOrder([freshRecord]);
        setJumpToRow(freshRecord);
        return;
      }

      const { FACTORY, CATEGORY, ...clearData } = freshRecord;
      const updateData = {
        ...clearData,
        status: newStatus,
        last_user: user.user_code,
        last_date: new Date().toISOString(),
      };

      const response = await editAcReqOrder(
        user?.factory,
        user?.department,
        user?.user_code,
        subAuthentication?.find((item) => item.field === "query_level")?.title,
        updateData,
        currentAROPageSize,
      );

      if (response.success) {
        showSuccessToast(getControlLabel, `noti_success_${actionName}`);
        setData((prevData) => {
          return prevData.map((table) => ({
            ...table,
            data: table.data.map((item) =>
              `${item.factory_code}-${item.req_no}-${item.req_seq}` ===
              `${updateData.factory_code}-${updateData.req_no}-${updateData.req_seq}`
                ? updateData
                : item,
            ),
          }));
        });

        setSelectAcReqOrder([updateData]);
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

  const handleSelectChoose = (rows) => {
    setSelectAcReqOrder(rows);
  };
  const handlePDF = async () => {
    await exportPDFBasicData();
  };
  const handleEdit = async (updateRow, title, skipTimestamp = false) => {
    const { statusText, ...update } = updateRow;
    update.last_user = user.user_code;
    update.last_date = new Date().toISOString();
    const result = await editAcReqOrder(
      user?.factory,
      user?.department,
      user?.user_code,
      subAuthentication?.find((item) => item.field === "query_level")?.title,
      update,
      currentAROPageSize,
    );
    if (result.success) {
      const successMessage =
        typeof title === "string" && title
          ? title
          : `${getControlLabel(
              "noti_success_edit",
              "Edit successfully with id",
            )} ${updateRow.req_seq}!`;

      if (!skipTimestamp) {
        showSuccessToast(getControlLabel, "noti_success_edit", successMessage);
      }
      setData((prevData) => {
        if (!prevData.length) {
          return prevData;
        }

        const { factory_code, req_no, req_seq } = update;
        const itemKey = `${factory_code}-${req_no}-${req_seq}`;

        const filterPermission = prevData.map((table) => ({
          ...table,
          data: table.data.map((p) => {
            const eachKey = `${p.factory_code}-${p.req_no}-${p.req_seq}`;
            return eachKey === itemKey ? { ...p, ...update } : p;
          }),
        }));

        return filterPermission;
      });

      setSelectAcReqOrder([update]);

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
  const handleDelete = async () => {
    const result = await deleteAcReqOrder(
      user?.factory,
      selectAcReqOrder[0]?.req_no,
      selectAcReqOrder[0]?.req_seq,
    );
    if (result?.success) {
      showSuccessToast(getControlLabel, "noti_delete_success", result?.message);
      await fetchDataByReqNo(true);
      handleDeleteClose();
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

  const freshRecord = await fetchAcReqOrderRecordFromDB(selectAcReqOrder[0]);

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
          `${item.factory_code}-${item.req_no}-${item.req_seq}` ===
          `${freshRecord.factory_code}-${freshRecord.req_no}-${freshRecord.req_seq}`
            ? freshRecord
            : item,
        ),
      })),
    );
    setSelectAcReqOrder([freshRecord]);
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
  let columns = 1;
  if (isLgUp) columns = 3;
  else if (isMdUp) columns = 2;
  else if (isSmUp) columns = 1;
  else columns = 1;
  const itemWidth =
    data.length > 0 ? `${100 / data.length}%` : `${100 / columns}%`;
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
              tableName={"AC_REQ_ORDER"}
              //onChecked={handleChecked}
              selectRows={selectAcReqOrder}
              onSelectChange={handleSelectChoose}
              onSelectModify={handleSelectModify}
              onSelectQuery={handleSelectQuery}
              onAdd={handleOpenAdd}
              onEdit={handleOpenEdit}
              onCancel={handleCancel}
              onConfirm={handleConfirm}
              onUnconfirm={handleUnconfirm}
              onClose={handleClose}
              onDetail={(row) => {
                handleDetailModal(row);
              }}
              // onSearch={handleSearchByCode}
              onPDF={handlePDF}
              popupOpen={openEdit}
              columnTranslations={columnTranslations}
              controlTranslations={controlTranslations}
              language={language}
              getControlLabel={getControlLabel}
              getColumnLabel={getColumnLabel}
              jumpToRow={jumpToRow}
              isSubTable={true}
              isHide={isHide}
              onPageChange={onAROPageChange}
              currentPage={currentAROPage}
              currentPageSize={currentAROPageSize}
              totalData={totalAROData || 0}
              hasMore={hasMore}
              isSearch={isSearch}
              isToolbar={parentKeyField === "req_no" ? true : false}
              onDelete={handleDeleteOpen}
            />
          </div>
        </Stack>
      </Box>
      <EditAcReqOrderPage
        open={openEdit}
        onClose={handleEditClose}
        acReqOrder={selectAcReqOrder.length > 0 ? selectAcReqOrder[0] : null}
        handleEdit={handleEdit}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        selectRows={selectRows.length > 0 ? selectRows : []}
      />
      <DeleteAcReqOrder
        openLink={openDelete}
        onClose={handleDeleteClose}
        onDelete={handleDelete}
        getColumnLabel={getColumnLabel}
        getControlLabel={getControlLabel}
        selectRows={selectAcReqOrder.length > 0 ? selectAcReqOrder : []}
      />
    </>
  );
};
export default AcReqOrder;
