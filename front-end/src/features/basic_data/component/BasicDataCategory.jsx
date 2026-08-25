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
import {
  addBasicData,
  editBasicData,
  exportPDFBasicData,
  fetchBasicDataByCate,
} from "../../../service/basic_data/basicDataService";
import {
  addAcItemRef,
  fetchDataByItemAcno,
} from "../../../service/ac_item_ref/AcItemRefService";
import AddBasicDataCategory from "../page/AddBasicDataCategory";
import EditBasicDataCategory from "../page/EditBasicDataCategory";
import { set } from "react-hook-form";
const BasicDataCategory = ({
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
  totalAIRData,
  onPageChange,
  currentAIRPage,
  currentAIRPageSize,
  currentAIROffset,
  setCurrentAIROffset,
  setCurrentAIRPageSize,
  setCurrentAcItemRPage,
  setTotalAIRData,
  setSearchData,
  hasMore,
  setHasMore,
  setIsSearch,
  setSearchFilter,
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
            "BASIC_DATA",
            "detail",
            "basic_data_category",
            "BASIC_DATA",
          ),
        () => fetchTableControlTranslations("BASIC_DATA"),
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
        !selectRows[0]?.category_code
      ) {
        setData([{ tableName: "BASIC_DATA", data: [] }]);
        setSelectAcItemRef([]);
        return;
      }

      const selectedParentRow = selectRows[0];
    

      // KIỂM TRA: Nếu đang search, KHÔNG GỌI API
      if (isSearch && searchData.length > 0) {
      
        //  Lọc details từ searchData
        const masterDetails = searchData.filter(
          (detail) =>
            detail.factory_code === selectedParentRow.factory_code &&
            detail.category_code === selectedParentRow.category_code,
        );

        //  Phân trang
        const detailPageSize = currentAIRPageSize || 10;
        const paginatedDetails = masterDetails.slice(0, detailPageSize);

        setData([{ tableName: "BASIC_DATA", data: paginatedDetails }]);
        setTotalAIRData(masterDetails.length);
        setCurrentAcItemRPage(0);
        setCurrentAIROffset(0);

        if (paginatedDetails.length > 0) {
          setSelectAcItemRef([paginatedDetails[0]]);
          setJumpToRow(paginatedDetails[0]);
        } else {
          setSelectAcItemRef([]);
          setJumpToRow(null);
        }

        return; 
      }

      //  Không search - gọi API như bình thường
      setCurrentAcItemRPage(0);
      setCurrentAIROffset(0);
      setCurrentAIRPageSize(10);
      await fetchDataByIAcno(true, 0, 10);
    };

    handleDataFetch();
  }, [
    selectRows?.[0]?.factory_code,
    selectRows?.[0]?.category_code,
    isSearch,
    searchData.length,
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
        //  QUAN TRỌNG: Luôn lấy fresh data từ selectAcItemRef, không dùng param `data`
        // Vì khi user đóng popup không save, `data` = undefined
        const record = selectAcItemRef[0];

        //  CRITICAL: Fetch fresh record từ DB để đảm bảo có locked_information mới nhất
        const freshRecord = await fetchAcItemRefRecordFromDB(record);
        const { FACTORY, BASIC_DATA_CATEGORY, CATEGORY, ...unlockedRecord } =
          freshRecord;

        // LUÔN unlock nếu record bị lock bởi user hiện tại
        if (freshRecord?.locked_information === user?.clientInfo) {
          const unlockData = {
            ...unlockedRecord,
            locked_information: null,
          };

          await editBasicData(
            user?.factory,
            user?.department,
            user?.user_code,
            subAuthentication?.find((item) => item.field === "query_level")
              ?.title,
            unlockData,
            currentAIRPageSize,
          );

          // CẬP NHẬT searchData NẾU ĐANG SEARCH
          if (
            isSearch &&
            searchData.length > 0 &&
            typeof setSearchData === "function"
          ) {
            const updatedSearchData = searchData.map((item) => {
              const itemKey = `${item.factory_code}-${item.category_code}-${item.code_no}`;
              const unlockKey = `${unlockData.factory_code}-${unlockData.category_code}-${unlockData.code_no}`;

              return itemKey === unlockKey ? { ...item, ...unlockData } : item;
            });

            setSearchData(updatedSearchData);

            // Update UI từ searchData (không gọi API)
            const selectedMaster = selectRows[0];
            const masterDetails = updatedSearchData.filter(
              (detail) =>
                detail.factory_code === selectedMaster.factory_code &&
                detail.category_code === selectedMaster.category_code,
            );

            const detailPageSize = currentAIRPageSize || 10;
            const currentOffset = currentAIRPage * detailPageSize;
            const paginatedDetails = masterDetails.slice(
              currentOffset,
              currentOffset + detailPageSize,
            );

            setData([{ tableName: "BASIC_DATA", data: paginatedDetails }]);

            //  Tìm và select record đã unlock
            const unlockedInPage = paginatedDetails.find(
              (item) =>
                `${item.factory_code}-${item.category_code}-${item.code_no}` ===
                `${unlockData.factory_code}-${unlockData.category_code}-${unlockData.code_no}`,
            );

            if (unlockedInPage) {
              setSelectAcItemRef([unlockedInPage]);
            }
          } else {
            //  Không search - fetch lại từ API
            await fetchDataByIAcno(false).then(() => {
              setData((prevData) => {
                if (prevData?.[0]?.data?.length > 0) {
                  const updatedBD = prevData[0].data.find(
                    (item) =>
                      `${item.factory_code}-${item.category_code}-${item.code_no}` ===
                      `${record.factory_code}-${record.category_code}-${record.code_no}`,
                  );
                  if (updatedBD) {
                    setSelectAcItemRef([updatedBD]);
                  }
                }
                return prevData;
              });
            });
          }
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
                `${item.factory_code}-${item.category_code}-${item.code_no}` ===
                `${freshRecord.factory_code}-${freshRecord.category_code}-${freshRecord.code_no}`
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
        freshRecord.locked_information !== "null" &&
        freshRecord.locked_information !== "undefined" &&
        freshRecord.locked_information !== "" &&
     freshRecord.locked_information !==user?.clientInfo
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
              `${item.factory_code}-${item.category_code}-${item.code_no}` ===
              `${freshRecord.factory_code}-${freshRecord.category_code}-${freshRecord.code_no}`
                ? freshRecord
                : item,
            ),
          }));
        });

        setSelectAcItemRef([freshRecord]);
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

      const response = await editBasicData(
        user?.factory,
        user?.department,
        user?.user_code,
        subAuthentication?.find((item) => item.field === "query_level")?.title,
        updateData,
        currentAIRPageSize,
      );

      if (response.success) {
        showSuccessToast(
          getControlLabel,
          `noti_success_${actionName}`,
          "Success!",
        );
        if (
          isSearch &&
          searchData.length > 0 &&
          typeof setSearchData === "function"
        ) {
          const updatedSearchData = searchData.map((item) => {
            const itemKey = `${item.factory_code}-${item.category_code}-${item.code_no}`;
            const updateKey = `${updateData.factory_code}-${updateData.category_code}-${updateData.code_no}`;

            return itemKey === updateKey ? { ...item, ...updateData } : item;
          });
          setSearchData(updatedSearchData);
        }
        setData((prevData) => {
          return prevData.map((table) => ({
            ...table,
            data: table.data.map((item) =>
              `${item.factory_code}-${item.category_code}-${item.code_no}` ===
              `${updateData.factory_code}-${updateData.category_code}-${updateData.code_no}`
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

  const handleAdd = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const addData = Object.fromEntries(form.entries());
    addData.factory_code = user.factory;
    addData.category_code = selectRows[0].category_code;
    addData.grt_dept = user.department;
    addData.grt_user = user.user_code;
    addData.grt_date = new Date().toISOString();
    try {
      const response = await addBasicData(
        user?.factory,
        user?.department,
        user?.user_code,
        subAuthentication?.find((item) => item.field === "query_level")?.title,
        addData,
        currentAIRPageSize,
      );
      if (response.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_add",
          `Add successfully with id ${addData.code_no}!`,
        );
        handleAddClose();
        try {
          const allow = Array.isArray(subAuthentication)
            ? subAuthentication.find((item) => item.field === "query_level")
                ?.title
            : null;
          const responseData = await fetchBasicDataByCate(
            user?.factory,
            selectRows[0]?.category_code,
            user?.department,
            user?.user_code,
            allow,
            response.size,
            response.offset,
          );
          setData([
            {
              tableName: "BASIC_DATA",
              data: responseData.data || [],
            },
          ]);
          setSelectAcItemRef([response.data]);
          setHasMore(responseData?.hasMore);
          setJumpToRow(response.data);
          setCurrentAcItemRPage(response?.page);
          setCurrentAIRPageSize(response.size);
          setCurrentAIROffset(response.offset);
          setIsSearch(false);
          setSearchFilter(null);
          handleAddClose();
          setTotalAIRData((prevTotal) => prevTotal + 1);
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
      }
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
    }
  };

  const handleSelectChoose = (rows) => {
    setSelectAcItemRef(rows);
  };
  const handlePDF = async () => {
    await exportPDFBasicData();
  };
  const handleEdit = async (updateRow, title, skipTimestamp = false) => {
    const { statusText, FACTORY, CATEGORY, ...update } = updateRow;

    if (!skipTimestamp) {
      update.last_user = user.user_code;
      update.last_date = new Date().toISOString();
    }

    const result = await editBasicData(
      user?.factory,
      user?.department,
      user?.user_code,
      subAuthentication?.find((item) => item.field === "query_level")?.title,
      update,
      currentAIRPageSize,
    );

    if (result.success) {
      const successMessage =
        typeof title === "string" && title
          ? title
          : `${getControlLabel(
              "noti_success_edit",
              "Edit successfully with id",
            )} ${updateRow.code_no}!`;

      if (!skipTimestamp) {
        showSuccessToast(getControlLabel, "noti_success_edit", successMessage);
      }
      if (isSearch && searchData.length > 0) {
        const updatedSearchData = searchData.map((item) => {
          const itemKey = `${item.factory_code}-${item.category_code}-${item.code_no}`;
          const updateKey = `${update.factory_code}-${update.category_code}-${update.code_no}`;

          return itemKey === updateKey ? { ...item, ...update } : item;
        });

        //  GỌI CALLBACK ĐỂ UPDATE searchData Ở PARENT
        // (Thêm prop mới setSearchData từ parent)
        if (typeof setSearchData === "function") {
          setSearchData(updatedSearchData);
        }
      }
      setData((prevData) => {
        if (!prevData.length) {
          return prevData;
        }

        const { factory_code, category_code, code_no } = update;
        const itemKey = `${factory_code}-${category_code}-${code_no}`;

        const filterPermission = prevData.map((table) => ({
          ...table,
          data: table.data.map((p) => {
            const eachKey = `${p.factory_code}-${p.category_code}-${p.code_no}`;
            return eachKey === itemKey ? { ...p, ...update } : p;
          }),
        }));

        return filterPermission;
      });
      setSelectAcItemRef([update]);
      setJumpToRow(update);
      if (!skipTimestamp) {
        handleEditClose(update);
      }
    } else {
      showErrorToast(
        getControlLabel,
        "noti_fail_grant",
        `Cannot grant Privilage for user ${user.user_code}!`,
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
  const mapLanguageToColumn = (language) => {
    const languageMap = {
      zh: "_t", // Chinese
      en: "_e", // English
      vi: "_l", // Vietnamese
    };

    return languageMap[language] || "_e"; // Default English
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
        tableName={"BASIC_DATA"}
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
        totalData={totalAIRData}
        onPageChange={onPageChange}
        currentPage={currentAIRPage}
        currentPageSize={currentAIRPageSize}
        hasMore={hasMore}
        isSearch={isSearch}
      />
      <AddBasicDataCategory
        open={openAdd}
        handleAdd={handleAdd}
        handleClose={handleAddClose}
        selectRows={selectAcItemRef.length > 0 ? selectAcItemRef[0] : {}}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        language={language}
        user={user}
        table="name"
        mapLanguageToColumn={mapLanguageToColumn}
      />
      <EditBasicDataCategory
        open={openEdit}
        onClose={handleEditClose}
        basicData={selectAcItemRef.length > 0 ? selectAcItemRef[0] : null}
        handleEdit={handleEdit}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        language={language}
        table="name"
        mapLanguageToColumn={mapLanguageToColumn}
      />
    </>
  );
};
export default BasicDataCategory;
