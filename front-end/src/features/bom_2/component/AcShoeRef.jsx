import { useEffect, useState } from "react";
import DataTable from "../../../component/table/DataTable";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material";

import { toast } from "react-toastify";
import { fnQuery } from "../../../utils/fnQuery";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import useAuth from "../../../hooks/useAuth";
import { exportPDFBasicData } from "../../../service/basic_data/basicDataService";
import AddAcShoeRef from "../page/AddAcShoeRef";
import EditAcShoeRef from "../page/EditAcShoeRef";
import {
  addAcShoeRef,
  deleteAcShoeRef,
  editAcShoeRef,
  fetchAllAcShoeRefByShoe,
} from "../../../service/ac_shoe_ref/AcShoeRefService";
import { searchASMByFilter } from "../../../service/ac_shoe_m/AcShoeMService";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../../utils/notification/Notification";
import DeleteAcShoeRef from "../page/DeleteAcShoeRef";
const AcShoeRef = ({
  data,
  setData,
  setSelectAcShoeRef,
  selectAcShoeRef,
  isSearch = false,
  selectRows,
  selectFactory,
  subAuthentication = [],
  handleSearchByCode,
  searchData,
  fetchDataByShoe,
  fetchAcShoeRefRecordFromDB,
  jumpToRow,
  setJumpToRow,
  totalData,
  onPageChange,
  currentOffset,
  currentPage,
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
      const [columns, controls] = await fnQuery([
        () =>
          fetchTableColumnTranslations(
            "ACTF_020",
            "detail",
            "ac_shoe_m",
            "AC_SHOE_REF",
          ),
        () => fetchTableControlTranslations("ACTF_020"),
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
  const refreshCurrentData = async (updatedRecord = null) => {
    //  Nếu có updatedRecord → update local data (không gọi API)
    if (updatedRecord) {
      setData((prevData) =>
        prevData.map((table) => ({
          ...table,
          data: table.data.map((item) =>
            `${item.factory_code}-${item.customs_shoe_id}-${item.prod_no}` ===
            `${updatedRecord.factory_code}-${updatedRecord.customs_shoe_id}-${updatedRecord.prod_no}`
              ? updatedRecord
              : item,
          ),
        })),
      );
      setSelectAcShoeRef([updatedRecord]);
      return;
    }

    //  Nếu KHÔNG có updatedRecord → fetch từ API (logic cũ)
    const currentSelection =
      selectAcShoeRef.length > 0 ? selectAcShoeRef[0] : null;

    if (isSearch && searchFilter) {
      const allow = subAuthentication?.find(
        (item) => item.field === "query_level",
      )?.title;

      const response = await searchASMByFilter(
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
          const currentKey = `${currentSelection.factory_code}-${currentSelection.customs_shoe_id}-${currentSelection.prod_no}`;
          const foundRecord = response.data.find(
            (item) =>
              `${item.factory_code}-${item.customs_shoe_id}-${item.prod_no}` ===
              currentKey,
          );

          if (foundRecord) {
            setSelectAcShoeRef([foundRecord]);
          } else if (response.data.length > 0) {
            setSelectAcShoeRef([response.data[0]]);
            setJumpToRow(response.data[0]);
          } else {
            setSelectAcShoeRef([]);
          }
        }
      }
    } else {
      const allow = subAuthentication?.find(
        (item) => item.field === "query_level",
      )?.title;

      const responseData = await fetchAllAcShoeRefByShoe(
        user.factory,
        selectRows[0]?.customs_shoe_id,
        user.department,
        user.user_code,
        allow || "1",
        currentPageSize,
        currentOffset,
      );

      if (responseData && responseData.data) {
        setData([{ tableName: "AC_SHOE_REF", data: responseData.data }]);
        setHasMore(responseData?.hasMore);
        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${currentSelection.customs_shoe_id}-${currentSelection.prod_no}`;
          const updatedRecord = responseData.data.find(
            (item) =>
              `${item.factory_code}-${item.customs_shoe_id}-${item.prod_no}` ===
              currentKey,
          );

          if (updatedRecord) {
            setSelectAcShoeRef([updatedRecord]);
          } else if (responseData.data.length > 0) {
            setSelectAcShoeRef([responseData.data[0]]);
            setJumpToRow(responseData.data[0]);
          }
        }
      }
    }
  };
  useEffect(() => {
    fetchAllTranslations();
  }, [language]);
  //selectRows - Luôn fetch data theo shoe đang chọn, không quan tâm search
  useEffect(() => {
    const handleDataFetch = async () => {
      if (
        !selectRows ||
        selectRows.length === 0 ||
        !selectRows[0]?.factory_code ||
        !selectRows[0]?.customs_shoe_id
      ) {
        setData([{ tableName: "AC_SHOE_REF", data: [] }]);
        setSelectAcShoeRef([]);
        return;
      }

      const selectedParentRow = selectRows[0];
      //  KIỂM TRA: Nếu đang search, KHÔNG GỌI API
      if (!isSearch) {
        setCurrentPage(0);
        setCurrentOffset(0);
        setCurrentPageSize(10);
        await fetchDataByShoe(true, 0, 10);
      }
    };

    handleDataFetch();
  }, [
    selectRows?.[0]?.factory_code,
    selectRows?.[0]?.customs_shoe_id,
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
        "this category is invalid to edit!",
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
      if (selectAcShoeRef.length === 1) {
        const record = data || selectAcShoeRef[0];

        if (record?.locked_information === user?.clientInfo) {
          const unlockData = {
            ...record,
            locked_information: null,
          };

          await editAcShoeRef(
            user?.factory,
            user?.department,
            user?.user_code,
            subAuthentication?.find((item) => item.field === "query_level")
              ?.title,
            unlockData,
            currentPageSize,
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
      const record = selectAcShoeRef[0];
      const freshRecord = await fetchAcShoeRefRecordFromDB(record);
      const { SHOE } = freshRecord;

      if (SHOE?.status === 0 || SHOE?.status === 7 || SHOE?.status === 9) {
        showErrorToast(
          getControlLabel,
          "noti_fail_parent_status",
          "this category is invalid to edit!",
        );
        return;
      }

      if (isSearch && SHOE?.status !== 1) {
        showErrorToast(
          getControlLabel,
          "noti_fail_parent_status",
          "this category is invalid to edit!",
        );
        return;
      }

      if (!isSearch && selectRows[0]?.status !== 1) {
        showErrorToast(
          getControlLabel,
          "noti_fail_parent_status",
          "this category is invalid to edit!",
        );
        return;
      }

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

          //  Gọi với updatedRecord
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
        freshRecord.locked_information !== user?.clientInfo &&
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

      const { SHOE: _, FACTORY: __, ACSHOEM, ...clearData } = freshRecord;
      const lockData = {
        ...clearData,
        locked_information: user?.clientInfo,
      };

      await handleEdit(lockData, "", true);
      setSelectAcShoeRef([lockData]);
      setOpenEdit(true);
    } catch (error) {
      showErrorToast(
        getControlLabel,
        "noti_error_open_edit",
        "This has error when open form edit!",
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
    if (selectAcShoeRef.length !== 1) return;
    try {
      const record = selectAcShoeRef[0];
      const parentRecord = selectRows[0];
      if (parentRecord?.status !== 1) {
        showErrorToast(
          getControlLabel,
          "noti_fail_parent_status",
          "this category is invalid to edit!",
        );
        return;
      }
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

      const freshRecord = await fetchAcShoeRefRecordFromDB(record);
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

        //  Update local data, không fetch lại
        setData((prevData) => {
          return prevData.map((table) => ({
            ...table,
            data: table.data.map((item) =>
              `${item.factory_code}-${item.customs_shoe_id}-${item.prod_no}` ===
              `${freshRecord.factory_code}-${freshRecord.customs_shoe_id}-${freshRecord.prod_no}`
                ? freshRecord
                : item,
            ),
          }));
        });
        setSelectAcShoeRef([freshRecord]);
        setJumpToRow(freshRecord);
        return;
      }
      const { FACTORY, ACSHOEM, ...clearData } = freshRecord;
      const updateData = {
        ...clearData,
        status: newStatus,
        last_user: user.user_code,
        last_date: new Date().toISOString(),
      };

      const response = await editAcShoeRef(
        user?.factory,
        user?.department,
        user?.user_code,
        subAuthentication?.find((item) => item.field === "query_level")?.title,
        updateData,
        currentPageSize,
      );

      if (response.success) {
        showSuccessToast(getControlLabel, `noti_success_${actionName}`);

        //  Update local data, không fetch lại
        setData((prevData) => {
          return prevData.map((table) => ({
            ...table,
            data: table.data.map((item) =>
              `${item.factory_code}-${item.customs_shoe_id}-${item.prod_no}` ===
              `${updateData.factory_code}-${updateData.customs_shoe_id}-${updateData.prod_no}`
                ? updateData
                : item,
            ),
          }));
        });
        setSelectAcShoeRef([updateData]);
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

  const handleDelete = async () => {
    const result = await deleteAcShoeRef(
      user?.access_token,
      user?.factory,
      selectRows[0]?.customs_shoe_id,
      selectAcShoeRef[0]?.prod_no,
    );
    if (result?.success) {
      showSuccessToast(getControlLabel, "noti_delete_success", result?.message);
      await fetchDataByShoe(true);
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

    const freshRecord = await fetchAcShoeRefRecordFromDB(selectAcShoeRef[0]);

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
            `${item.factory_code}-${item.customs_shoe_id}-${item.prod_no}` ===
            `${freshRecord.factory_code}-${freshRecord.customs_shoe_id}-${freshRecord.prod_no}`
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
  const handleAdd = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const addData = Object.fromEntries(form.entries());
    addData.factory_code = user.factory;
    addData.customs_shoe_id = selectRows[0].customs_shoe_id;
    addData.grt_dept = user.department;
    addData.grt_user = user.user_code;
    addData.grt_date = new Date().toISOString();

    try {
      const response = await addAcShoeRef(
        user?.factory,
        user?.department,
        user?.user_code,
        subAuthentication?.find((item) => item.field === "query_level")?.title,
        addData,
        "10",
      );
      if (response.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_add",
          `Add successfully with id ${addData.prod_no}!`,
        );
        handleAddClose();

        const allow = Array.isArray(subAuthentication)
          ? subAuthentication.find((item) => item.field === "query_level")
              ?.title
          : null;

        //  GỌI API với pageSize và offset từ RESPONSE (backend tính toán)
        const responseData = await fetchAllAcShoeRefByShoe(
          selectRows[0]?.factory_code,
          selectRows[0]?.customs_shoe_id,
          user.department,
          user.user_code,
          allow || "1",
          response.size,
          response.offset,
        );

        if (responseData && responseData.data) {
          //  UPDATE STATE PAGINATION TRƯỚC
          setCurrentPage(response?.page || 0);
          setCurrentPageSize(response.size);
          setCurrentOffset(response.offset);
          setTotalData(responseData.total || totalData + 1);

          //  UPDATE DATA
          setData([{ tableName: "AC_SHOE_REF", data: responseData.data }]);
          setHasMore(responseData?.hasMore);
          //  TÌM VÀ SELECT RECORD VỪA ADD
          const addedItem = responseData.data.find(
            (item) =>
              `${item.factory_code}-${item.customs_shoe_id}-${item.prod_no}` ===
              `${addData.factory_code}-${addData.customs_shoe_id}-${addData.prod_no}`,
          );

          if (addedItem) {
            setSelectAcShoeRef([addedItem]);
            setJumpToRow(addedItem);
          } else if (responseData.data.length > 0) {
            setSelectAcShoeRef([responseData.data[0]]);
            setJumpToRow(responseData.data[0]);
          }
        }
      } else {
        showErrorToast(
          getControlLabel,
          "noti_fail_duplicate_add",
          "Cannot add duplicate id!",
        );
      }
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
    }
  };

  const handleSelectChoose = (rows) => {
    setSelectAcShoeRef(rows);
  };
  const handlePDF = async () => {
    await exportPDFBasicData();
  };
  const handleEdit = async (updateRow, title, skipTimestamp = false) => {
    const { statusText, ACSHOEM, ...cleanData } = updateRow;
    if (!skipTimestamp) {
      cleanData.last_user = user.user_code;
      cleanData.last_date = new Date().toISOString();
    }

    const result = await editAcShoeRef(
      user?.factory,
      user?.department,
      user?.user_code,
      subAuthentication?.find((item) => item.field === "query_level")?.title,
      cleanData,
      currentPageSize,
    );

    if (result.success) {
      const successMessage =
        typeof title === "string" && title
          ? title
          : `Edit successfully for user ${user.user_code}!`;

      if (!skipTimestamp) {
        showSuccessToast(getControlLabel, "noti_success_edit", successMessage);
      }
      // Normal mode
      const resultPage =
        result.size !== undefined
          ? Math.floor(result.position / result.size)
          : currentPage;
      const resultOffset =
        result.offset !== undefined ? result.offset : currentOffset;

      if (resultPage !== currentPage) {
        // Record chuyển page - phải fetch
        const allow = Array.isArray(subAuthentication)
          ? subAuthentication.find((item) => item.field === "query_level")
              ?.title
          : null;

        const responseData = await fetchAllAcShoeRefByShoe(
          user?.factory,
          selectRows[0]?.customs_shoe_id,
          user?.department,
          user?.user_code,
          allow || "1",
          currentPageSize,
          resultOffset,
        );

        if (responseData && responseData.data) {
          setData([{ tableName: "AC_PROD_M", data: responseData.data }]);
          setCurrentPage(resultPage);
          setCurrentOffset(resultOffset);
          setHasMore(responseData?.hasMore);
          const editedRecord = responseData.data.find(
            (item) =>
              `${item.factory_code}-${item.customs_shoe_id}-${item.prod_no}` ===
              `${cleanData.factory_code}-${cleanData.customs_shoe_id}-${cleanData.prod_no}`,
          );

          if (editedRecord) {
            setSelectAcShoeRef([editedRecord]);
            setJumpToRow(editedRecord);
          }
        }
      } else {
        await refreshCurrentData(cleanData);

        // Unlock nếu cần
        if (
          !skipTimestamp &&
          cleanData.locked_information === user?.clientInfo
        ) {
          const unlockData = {
            ...cleanData,
            locked_information: null,
          };
          await editAcShoeRef(
            user?.factory,
            user?.department,
            user?.user_code,
            subAuthentication?.find((item) => item.field === "query_level")
              ?.title,
            unlockData,
            currentPageSize,
          );

          await refreshCurrentData(unlockData);
        }
      }

      if (!skipTimestamp) {
        handleEditClose(cleanData);
      }
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
              tableName={"AC_SHOE_REF"}
              onChecked={handleChecked}
              selectRows={selectAcShoeRef}
              onSelectChange={handleSelectChoose}
              onSelectModify={handleSelectModify}
              onSelectQuery={handleSelectQuery}
              onAdd={handleOpenAdd}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteOpen}
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
              totalData={totalData || 0}
              onPageChange={onPageChange}
              currentPage={currentPage}
              currentPageSize={currentPageSize}
              hasMore={hasMore}
              setHasMore={setHasMore}
            />
          </div>
        </Stack>
      </Box>
      <AddAcShoeRef
        open={openAdd}
        handleAdd={handleAdd}
        onClose={handleAddClose}
        selectRows={selectRows.length > 0 ? selectRows : {}}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        language={language}
        user={user}
      />
      <EditAcShoeRef
        open={openEdit}
        onClose={handleEditClose}
        acShoeRef={selectAcShoeRef.length > 0 ? selectAcShoeRef[0] : null}
        factory={selectFactory}
        handleEdit={handleEdit}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        auth={subAuthentication}
        user={user}
      />
      <DeleteAcShoeRef
        openLink={openDelete}
        onClose={handleDeleteClose}
        onDelete={handleDelete}
        getColumnLabel={getColumnLabel}
        getControlLabel={getControlLabel}
        selectRows={selectAcShoeRef.length > 0 ? selectAcShoeRef : []}
      />
    </>
  );
};
export default AcShoeRef;
