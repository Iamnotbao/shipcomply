import { useEffect, useState } from "react";
import DataTable from "../../../component/table/DataTable";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material";
import {
  showErrorToast,
  showWarningToast,
  showSuccessToast,
} from "../../../utils/notification/Notification";

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
import EditAcItemRef from "../page/EditAcItemRef";
import AddAcItemRef from "../page/AddAcItemRef";
const AcItemRef = ({
  isSearch = false,
  selectRows,
  selectFactory,
  subAuthentication = [],
  handleSearchByCode,
  searchData,
  fetchAcItemRefRecordFromDB,
  data,
  setData,
  fetchDataByIAcno,
  selectAcItemRef,
  setSelectAcItemRef,
  jumpToRow,
  setJumpToRow,
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
      const [columns, controls] = await fnQuery([
        () =>
          fetchTableColumnTranslations(
            "ACTF_020",
            "detail",
            "ac_item_m",
            "AC_ITEM_REF",
          ),
        () => fetchTableControlTranslations("ACTF_020"),
      ]);
      if (columns) {
        setColumnTranslations(columns?.data);
      }
      if (controls) {
        setControlTranslations(controls?.data);
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
      // Kiểm tra có selectRows hợp lệ không
      if (
        !selectRows ||
        selectRows.length === 0 ||
        !selectRows[0]?.factory_code ||
        !selectRows[0]?.item_acno
      ) {
        setData([{ tableName: "AC_ITEM_REF", data: [] }]);
        setSelectAcItemRef([]);
        return;
      }

      const selectedParentRow = selectRows[0];
      await fetchDataByIAcno();
      if (isSearch && searchData.length > 0) {
        // Đợi state update xong (do fetchDataByIAcno là async và update state)
        // Chúng ta sẽ filter trong useEffect riêng phía dưới
      }
    };
    handleDataFetch();
  }, [selectRows?.[0]?.factory_code, selectRows?.[0]?.item_acno, isSearch]);
  useEffect(() => {
    if (
      isSearch &&
      searchData.length > 0 &&
      data?.[0]?.data &&
      data[0].data.length > 0
    ) {
      const selectedParentRow = selectRows[0];
      if (!selectedParentRow) return;
      // Lấy tất cả con từ searchData thuộc cha đang chọn
      const searchResultsForParent = searchData.filter(
        (item) =>
          item?.factory_code === selectedParentRow?.factory_code &&
          item?.item_acno === selectedParentRow?.item_acno,
      );
      // Nếu có kết quả search cho cha này
      if (searchResultsForParent.length > 0) {
        // Lấy toàn bộ data đã fetch
        const allChildren = data[0].data;
        // Lọc: Chỉ hiển thị những con có trong searchData
        const filteredChildren = allChildren.filter((child) =>
          searchResultsForParent.some(
            (searchItem) =>
              searchItem.factory_code === child.factory_code &&
              searchItem.item_acno === child.item_acno &&
              searchItem.item_no === child.item_no,
          ),
        );
        // Update data với filtered results
        setData([{ tableName: "AC_ITEM_REF", data: filteredChildren }]);
        // Select item đầu tiên hoặc item đang được chọn
        if (filteredChildren.length > 0) {
          const currentSelected = selectAcItemRef[0];
          const matchedRow = filteredChildren.find(
            (item) =>
              currentSelected &&
              item.factory_code === currentSelected.factory_code &&
              item.item_acno === currentSelected.item_acno &&
              item.item_no === currentSelected.item_no,
          );
          setSelectAcItemRef(matchedRow ? [matchedRow] : [filteredChildren[0]]);
        }
      }
      // Nếu không có search results cho cha này, giữ nguyên toàn bộ data đã fetch
    }
  }, [
    isSearch,
    searchData,
    searchData.length,
    data?.[0]?.data?.length,
    selectRows?.[0]?.factory_code,
    selectRows?.[0]?.item_acno,
  ]);

  const handleAddClose = () => {
    setOpenAdd(false);
  };
  const handleOpenAdd = () => {
    if (selectRows.length === 0) {
      showErrorToast(
        getControlLabel,
        "noti_fail_no_parent",
        "Please choose factory before list all permission!",
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
        "Please unconfirm first!",
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
  const handleEditClose = async (data) => {
    try {
      if (selectAcItemRef.length === 1) {
        const record = data || selectAcItemRef[0];

        if (record?.locked_information === user?.clientInfo) {
          const unlockData = {
            ...record,
            locked_information: null,
          };

          await editAcItemRef(unlockData);
          await fetchDataByIAcno().then(() => {
            setData((prevData) => {
              if (prevData?.[0]?.data?.length > 0) {
                const updatedBD = prevData[0].data.find(
                  (item) =>
                    `${item.factory_code}-${item.item_acno}-${item.item_no}` ===
                    `${record.factory_code}-${record.item_acno}-${record.item_no}`,
                );
                if (updatedBD) {
                  setSelectAcItemRef([updatedBD]);
                }
              }
              return prevData;
            });
          });
          setJumpToRow(unlockData);
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

      const record = selectAcItemRef[0];
      const freshRecord = await fetchAcItemRefRecordFromDB(record);

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
                `${item.factory_code}-${item.item_acno}-${item.item_no}` ===
                `${freshRecord.factory_code}-${freshRecord.item_acno}-${freshRecord.item_no}`
                  ? freshRecord
                  : item,
              ),
            }));
          });

          setSelectAcItemRef([freshRecord]);
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
        freshRecord.locked_information !== user?.clientInfo
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

      const { FACTORY, ITEM_ACNO, ...clearData } = freshRecord;
      const lockData = {
        ...clearData,
        locked_information: user?.clientInfo,
      };

      await handleEdit(lockData, "", true);
      setSelectAcItemRef([lockData]);
      setOpenEdit(true);
    } catch (error) {
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

    if (selectAcItemRef.length !== 1) return;

    try {
      const record = selectAcItemRef[0];

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

      const freshRecord = await fetchAcItemRefRecordFromDB(record);

      if (
        freshRecord.locked_information &&
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
              `${item.factory_code}-${item.item_acno}-${item.item_no}` ===
              `${freshRecord.factory_code}-${freshRecord.item_acno}-${freshRecord.item_no}`
                ? freshRecord
                : item,
            ),
          }));
        });

        setSelectAcItemRef([freshRecord]);
        setJumpToRow(freshRecord);
        return;
      }

      const { FACTORY, ITEM_ACNO, ...clearData } = freshRecord;
      const updateData = {
        ...clearData,
        status: newStatus,
        last_user: user.user_code,
        last_date: new Date().toISOString(),
      };

      const response = await editAcItemRef(updateData);

      if (response.success) {
        showSuccessToast(getControlLabel, `noti_success_${actionName}`);

        setData((prevData) => {
          return prevData.map((table) => ({
            ...table,
            data: table.data.map((item) =>
              `${item.factory_code}-${item.item_acno}-${item.item_no}` ===
              `${updateData.factory_code}-${updateData.item_acno}-${updateData.item_no}`
                ? updateData
                : item,
            ),
          }));
        });

        setSelectAcItemRef([updateData]);
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

  const handleCheck = () => {
    handleStatusChange(2, "check", [1]);
  };

  const handleAdd = async (data) => {
    try {
      const response = await addAcItemRef(
        user?.factory,
        user.department,
        user.user_code,
        subAuthentication.find((item) => item.field === "query_level")?.title,
        data,
        "10",
      );
      if (response.success) {
        toast.success(
          `${getControlLabel("noti_success_add", "Add successfully with id")} ${
            addData.item_no
          }!`,
        );
        handleAddClose();

        const allow = Array.isArray(subAuthentication)
          ? subAuthentication.find((item) => item.field === "query_level")
              ?.title
          : null;

        const refreshedData = await fetchDataByItemAcno(
          selectRows[0]?.factory_code,
          selectRows[0]?.item_acno,
          user.department,
          user.user_code,
          allow || "1",
        );

        if (refreshedData && refreshedData.data) {
          setData([{ tableName: "AC_ITEM_REF", data: refreshedData.data }]);
          const addedItem = refreshedData.data.find(
            (item) =>
              `${item.factory_code}-${item.item_acno}-${item.item_no}` ===
              `${addData.factory_code}-${addData.item_acno}-${addData.item_no}`,
          );
          if (addedItem) {
            setSelectAcItemRef([addedItem]);
            setJumpToRow(addedItem);
          } else if (refreshedData.data.length > 0) {
            setSelectAcItemRef([refreshedData.data[0]]);
            setJumpToRow(refreshedData.data[0]);
          }
        }
      } else {
        toast.dismiss("error-duplicate");
        showErrorToast(
          getControlLabel,
          "noti_fail_duplicate_add",
          "Cannot duplicate id!",
        );
      }
    } catch (error) {
      console.log("error", error);

      toast.error(
        `Add failed: ${error?.response?.data?.message || error.message}`,
      );
    }
  };

  const handleSelectChoose = (rows) => {
    setSelectAcItemRef(rows);
  };
  const handlePDF = async () => {
    await exportPDFBasicData();
  };
  const handleEdit = async (updateRow, title, skipTimestamp = false) => {
    const { statusText, ...update } = updateRow;
    if (!skipTimestamp) {
      update.last_user = user.user_code;
      update.last_date = new Date().toISOString();
    }
    const result = await editAcItemRef(update);
    if (result.success) {
      const successMessage =
        typeof title === "string" && title
          ? title
          : `${getControlLabel(
              "noti_success_edit",
              "Edit successfully with id",
            )} ${updateRow.item_no}!`;
      if (!skipTimestamp) {
        toast.success(successMessage, {
          toastId: `${data.code_no}-${data.status}-${Date.now()}`,
        });
      }
      setData((prevData) => {
        if (!prevData.length) {
          return prevData;
        }
        const { factory_code, item_acno, item_no } = update;
        const itemKey = `${factory_code}-${item_acno}-${item_no}`;

        const filterPermission = prevData.map((table) => ({
          ...table,
          data: table.data
            .map((p) => {
              const eachKey = `${p.factory_code}-${p.item_acno}-${p.item_no}`;
              return eachKey === itemKey ? { ...p, ...update } : p;
            })
            .filter(
              (item, index, self) =>
                index ===
                self.findIndex(
                  (t) =>
                    `${t.factory_code}-${t.item_acno}-${t.item_no}` ===
                    `${item.factory_code}-${item.item_acno}-${item.item_no}`,
                ),
            ),
        }));
        return filterPermission;
      });
      setSelectAcItemRef([update]);
      if (!skipTimestamp) {
        handleEditClose(update);
      }
      setJumpToRow(update);
      toast.success(
        `${getControlLabel(
          "noti_success_grant",
          "Grant Priviliage for user",
        )} ${user.user_code}!`,
      );
    } else {
      toast.error(
        `${getControlLabel(
          "noti_success_grant",
          "Cannot grant Privilage for user",
        )} ${user.user_code}!`,
      );
    }
  };
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
      <DataTable
        data={data[0]?.data}
        tableName={"AC_ITEM_REF"}
        onChecked={handleChecked}
        selectRows={selectAcItemRef}
        onSelectChange={handleSelectChoose}
        onDelete={(row) => {
          handleModal(row);
        }}
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
        hasMore={hasMore}
      />
      <AddAcItemRef
        open={openAdd}
        handleAdd={handleAdd}
        handleClose={handleAddClose}
        selectRows={selectRows.length > 0 ? selectRows[0] : {}}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        language={language}
        user={user}
        auth={subAuthentication}
      />
      <EditAcItemRef
        open={openEdit}
        onClose={handleEditClose}
        acItemRef={selectAcItemRef.length > 0 ? selectAcItemRef[0] : null}
        factory={selectFactory}
        handleEdit={handleEdit}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
      />
    </>
  );
};
export default AcItemRef;
