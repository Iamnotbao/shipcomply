import { useEffect, useState } from "react";
import DataTable from "../../../component/table/DataTable";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material";

import { toast } from "react-toastify";
import { fnQuery } from "../../../utils/fnQuery";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import useAuth from "../../../hooks/useAuth";
import { exportPDFBasicData } from "../../../service/basic_data/basicDataService";
import AddAcProdM from "../page/AddAcProdM";
import EditAcProdM from "../page/EditAcProdM";
import {
  addAcProdM,
  editAcProdM,
  fetchAllAcProdM,
  fetchAllAcProdMByShoe,
  searchAPMByFilter,
} from "../../../service/ac_prod_m/AcProdMService";
import AcItemProdMLink from "../page/AcProdMLink";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../../utils/notification/Notification";
const AcProdM = ({
  data,
  setData,
  setSelectAcProdM,
  selectAcProdM,
  isSearch = false,
  selectRows,
  selectFactory,
  handleSearchByAcProdM,
  subAuthentication = [],
  searchData,
  rdSizeDData,
  setRdSizeDData,
  selectRdSizeD,
  setSelectRdSizeD,
  hanldeSearchForRDSizeD,
  fetchDataByShoe,
  openSizeLink,
  setOpenSizeLink,
  onOpenSizeLink,
  onCloseSizeLink,
  onDataRSDBySize,
  fetchAcProdMRecordFromDB,
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
  setSearchData,
  searchFilter,
  totalRSDData,
  onRSDPageChange,
  currentRSDOffset,
  currentRSDPage,
  currentRSDPageSize,
  setCurrentRSDPage,
  setCurrentRSDOffset,
  setCurrentRSDPageSize,
  setTotalRSDData,
  setRSDSearchData,
  searchRSDFilter,
  hasMore,
  setHasMore,
  setIsSearch,
  hasRSDMore,
  setHasRSDMore,
  isRSDSearch,
}) => {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const theme = useTheme();
  const [openDetail, setOpenDetail] = useState(false);
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const [selectedItemRefs, setSelectedItemRefs] = useState([]);
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
            "ACTF_020",
            "detail",
            "ac_shoe_m",
            "AC_PROD_M",
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
            `${item.factory_code}-${item.customs_shoe_id}-${item.prod_acno}` ===
            `${updatedRecord.factory_code}-${updatedRecord.customs_shoe_id}-${updatedRecord.prod_acno}`
              ? updatedRecord
              : item,
          ),
        })),
      );
      setSelectAcProdM([updatedRecord]);
      return;
    }

    //  Nếu KHÔNG có updatedRecord → fetch từ API (logic cũ)
    const currentSelection = selectAcProdM.length > 0 ? selectAcProdM[0] : null;

    if (isSearch && searchFilter) {
      const allow = subAuthentication?.find(
        (item) => item.field === "query_level",
      )?.title;

      const response = await searchAPMByFilter(
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
          const currentKey = `${currentSelection.factory_code}-${currentSelection.customs_shoe_id}-${currentSelection.prod_acno}`;
          const foundRecord = response.data.find(
            (item) =>
              `${item.factory_code}-${item.customs_shoe_id}-${item.prod_acno}` ===
              currentKey,
          );

          if (foundRecord) {
            setSelectAcProdM([foundRecord]);
          } else if (response.data.length > 0) {
            setSelectAcProdM([response.data[0]]);
            setJumpToRow(response.data[0]);
          } else {
            setSelectAcProdM([]);
          }
        }
      }
    } else {
      const allow = subAuthentication?.find(
        (item) => item.field === "query_level",
      )?.title;

      const responseData = await fetchAllAcProdMByShoe(
        user.factory,
        selectRows[0]?.customs_shoe_id,
        user.department,
        user.user_code,
        allow || "1",
        currentPageSize,
        currentOffset,
      );

      if (responseData && responseData.data) {
        setData([{ tableName: "AC_PROD_M", data: responseData.data }]);
        setHasMore(responseData?.hasMore);
        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${currentSelection.customs_shoe_id}-${currentSelection.prod_acno}`;
          const updatedRecord = responseData.data.find(
            (item) =>
              `${item.factory_code}-${item.customs_shoe_id}-${item.prod_acno}` ===
              currentKey,
          );

          if (updatedRecord) {
            setSelectAcProdM([updatedRecord]);
          } else if (responseData.data.length > 0) {
            setSelectAcProdM([responseData.data[0]]);
            setJumpToRow(responseData.data[0]);
          }
        }
      }
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
        !selectRows[0]?.customs_shoe_id
      ) {
        setData([{ tableName: "AC_PROD_M", data: [] }]);
        setSelectAcProdM([]);
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
      if (selectAcProdM.length === 1) {
        const record = data || selectAcProdM[0];
        if (record?.locked_information === user?.clientInfo) {
          const unlockData = {
            ...record,
            locked_information: null,
          };
          await editAcProdM(
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
      console.error("Error closing edit:", error);
      setOpenEdit(false);
    }
  };
  const handleOpenEdit = async () => {
    try {
      const record = selectAcProdM[0];
      const freshRecord = await fetchAcProdMRecordFromDB(record);
      const { SHOE, FACTORY } = freshRecord;

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
      setSelectAcProdM([lockData]);
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
    if (selectAcProdM.length !== 1) return;

    try {
      const record = selectAcProdM[0];
      const freshRecord = await fetchAcProdMRecordFromDB(record);
      const { SHOE, FACTORY } = freshRecord;

      //  Kiểm tra SHOE status từ freshRecord
      if (SHOE?.status !== 1) {
        showErrorToast(
          getControlLabel,
          "noti_fail_parent_status",
          "this category is invalid to edit!",
        );
        return;
      }

      //  Permission checks
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

      //  Lock check
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

      //  Status validation
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
        setData((prevData) =>
          prevData.map((table) => ({
            ...table,
            data: table.data.map((item) =>
              `${item.factory_code}-${item.customs_shoe_id}-${item.prod_acno}` ===
              `${freshRecord.factory_code}-${freshRecord.customs_shoe_id}-${freshRecord.prod_acno}`
                ? freshRecord
                : item,
            ),
          })),
        );
        setSelectAcProdM([freshRecord]);
        setJumpToRow(freshRecord);
        return;
      }

      //  Update status
      const { SHOE: _, FACTORY: __, ...clearData } = freshRecord;
      const updateData = {
        ...clearData,
        status: newStatus,
        last_user: user.user_code,
        last_date: new Date().toISOString(),
      };

      const response = await editAcProdM(
        user?.factory,
        user?.department,
        user?.user_code,
        subAuthentication?.find((item) => item.field === "query_level")?.title,
        updateData,
        currentPageSize,
      );

      if (response.success) {
        showSuccessToast(getControlLabel, `noti_success_${actionName}`);

        setData((prevData) =>
          prevData.map((table) => ({
            ...table,
            data: table.data.map((item) =>
              `${item.factory_code}-${item.customs_shoe_id}-${item.prod_acno}` ===
              `${updateData.factory_code}-${updateData.customs_shoe_id}-${updateData.prod_acno}`
                ? updateData
                : item,
            ),
          })),
        );
        setSelectAcProdM([updateData]);
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
  const handleLink = async () => {
    setOpenLink(true);
  };
  const handleLinkClose = () => {
    setOpenLink(false);
  };
  const handleSave = async (size) => {
    const { statusText, ...updateAPM } = selectAcProdM[0];
    const updateSave = { ...updateAPM, bang_ke_size: size?.size_no };
    await handleEdit(updateSave, "Confirmed successfully!");
  };
  const handleAdd = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const addData = Object.fromEntries(form.entries());
    addData.customs_shoe_id = selectRows[0]?.customs_shoe_id;
    addData.factory_code = user.factory;
    addData.item_acno = selectRows[0].item_acno;
    addData.grt_dept = user.department;
    addData.grt_user = user.user_code;
    addData.grt_date = new Date().toISOString();

    const numericFields = ["s_seq", "e_seq", "pt_per"];
    numericFields.forEach((field) => {
      if (addData[field]) {
        addData[field] = Number(addData[field]);
      }
    });

    try {
      const response = await addAcProdM(
        user?.factory,
        user?.department,
        user?.user_code,
        subAuthentication?.find((item) => item.field === "query_level")?.title,
        addData,
        currentPageSize,
      );

      if (response.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_add",
          `Add successfully with id ${addData.customs_shoe_id}!`,
        );
        handleAddClose();

        const allow = Array.isArray(subAuthentication)
          ? subAuthentication.find((item) => item.field === "query_level")
              ?.title
          : null;

        //  GỌI API với pageSize và offset từ RESPONSE (backend tính toán)
        const responseData = await fetchAllAcProdMByShoe(
          selectRows[0]?.factory_code,
          selectRows[0]?.customs_shoe_id,
          user.department,
          user.user_code,
          allow || "1",
          response.size, // ← Dùng response.size
          response.offset, // ← Dùng response.offset
        );

        if (responseData && responseData.data) {
          //  UPDATE STATE PAGINATION TRƯỚC
          setCurrentPage(response?.page || 0);
          setCurrentPageSize(response.size);
          setCurrentOffset(response.offset);
          setTotalData(responseData.total || totalData + 1); // ← Dùng total từ response
          setData([{ tableName: "AC_PROD_M", data: responseData.data }]);
          setIsSearch(false);
          setHasMore(responseData?.hasMore);
          const addedItem = responseData.data.find(
            (item) =>
              `${item.factory_code}-${item.customs_shoe_id}-${item.prod_acno}` ===
              `${addData.factory_code}-${addData.customs_shoe_id}-${addData.prod_acno}`,
          );

          if (addedItem) {
            setSelectAcProdM([addedItem]);
            setJumpToRow(addedItem);
          } else if (responseData.data.length > 0) {
            setSelectAcProdM([responseData.data[0]]);
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
    setSelectAcProdM(rows);
  };
  const handlePDF = async () => {
    await exportPDFBasicData();
  };
  const handleEdit = async (updateRow, title, skipTimestamp = false) => {
    const { statusText, ...cleanData } = updateRow;
    if (!skipTimestamp) {
      cleanData.last_user = user.user_code;
      cleanData.last_date = new Date().toISOString();
    }

    const result = await editAcProdM(
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

      if (isSearch) {
        //  Search mode: Update local với cleanData
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
          await editAcProdM(
            user?.factory,
            user?.department,
            user?.user_code,
            subAuthentication?.find((item) => item.field === "query_level")
              ?.title,
            unlockData,
            currentPageSize,
          );

          //  Update lại với unlockData
          await refreshCurrentData(unlockData);
        }
      } else {
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

          const responseData = await fetchAllAcProdMByShoe(
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
                `${item.factory_code}-${item.customs_shoe_id}-${item.prod_acno}` ===
                `${cleanData.factory_code}-${cleanData.customs_shoe_id}-${cleanData.prod_acno}`,
            );

            if (editedRecord) {
              setSelectAcProdM([editedRecord]);
              setJumpToRow(editedRecord);
            }
          }
        } else {
          //  Same page: Update local với cleanData
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
            await editAcProdM(
              user?.factory,
              user?.department,
              user?.user_code,
              subAuthentication?.find((item) => item.field === "query_level")
                ?.title,
              unlockData,
              currentPageSize,
            );

            //  Update lại với unlockData
            await refreshCurrentData(unlockData);
          }
        }
      }

      if (!skipTimestamp) {
        handleEditClose(cleanData);
      }
      setOpenSizeLink(false);
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
              tableName={"AC_PROD_M"}
              onChecked={handleChecked}
              selectRows={selectAcProdM}
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
              onLink={handleLink}
              onDetail={(row) => {
                handleDetailModal(row);
              }}
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
              hasMore={hasMore}
              setHasMore={setHasMore}
              isSearch={isSearch}
            />
          </div>
        </Stack>
      </Box>
      <AddAcProdM
        open={openAdd}
        handleAdd={handleAdd}
        onClose={handleAddClose}
        selectRows={selectRows.length > 0 ? selectRows : {}}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        language={language}
        user={user}
      />
      <EditAcProdM
        open={openEdit}
        onClose={handleEditClose}
        acProdM={selectAcProdM.length > 0 ? selectAcProdM[0] : null}
        factory={selectFactory}
        handleEdit={handleEdit}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        selectRows={selectRows.length > 0 ? selectRows : {}}
        user={user}
      />
      <AcItemProdMLink
        openLink={openLink}
        onClose={handleLinkClose}
        basicDataCategory={selectRows}
        factory={selectFactory}
        searchData={searchData}
        handleSearchByAcProdM={handleSearchByAcProdM}
        handleLink={handleLink}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        checkboxSelection={true}
        subAuthentication={subAuthentication}
        user={user}
        selectRows={selectRows.length > 0 ? selectRows : []}
        selectedItemRefs={selectedItemRefs}
        onSelectionChange={setSelectedItemRefs}
        rdSizeDData={rdSizeDData}
        setRdSizeDData={setRdSizeDData}
        selectRdSizeD={selectRdSizeD}
        setSelectRdSizeD={setSelectRdSizeD}
        hanldeSearchForRDSizeD={hanldeSearchForRDSizeD}
        onSave={handleSave}
        openSizeLink={openSizeLink}
        setOpenSizeLink={setOpenSizeLink}
        onOpenSizeLink={onOpenSizeLink}
        onCloseSizeLink={onCloseSizeLink}
        onDataRSDBySize={onDataRSDBySize}
        selectAcProdM={selectAcProdM}
        setSelectAcProdM={setSelectAcProdM}
        language={language}
        totalRSDData={totalRSDData || 0}
        onRSDPageChange={onRSDPageChange}
        currentRSDOffset={currentRSDOffset}
        currentRSDPage={currentRSDPage}
        currentRSDPageSize={currentRSDPageSize}
        setCurrentRSDPage={setCurrentRSDPage}
        setCurrentRSDOffset={setCurrentRSDOffset}
        setCurrentRSDPageSize={setCurrentRSDPageSize}
        setTotalRSDData={setTotalRSDData}
        setRSDSearchData={setRSDSearchData}
        searchRSDFilter={searchRSDFilter}
        hasRSDMore={hasRSDMore}
        setHasRSDMore={setHasRSDMore}
        isRSDSearch={isRSDSearch}
      />
    </>
  );
};
export default AcProdM;
