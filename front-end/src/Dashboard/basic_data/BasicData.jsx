import { useEffect, useState } from "react";
import DataTable from "../../component/table/DataTable";
import { Box, Container, Paper, Stack } from "@mui/material";
import { fnQuery } from "../../utils/fnQuery";
import { fetchTablePermission } from "../../service/users_permission/UsersPermission";
import { toast } from "react-toastify";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import useAuth from "../../hooks/useAuth";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../utils/notification/Notification";
import { exportPDFAcItemM } from "../../service/ac_item_m/AcItemMService";
import {
  addBasicDataCategory,
  editBasicDataCategory,
  exportPDFBasicDataCategory,
  fetchBasicDataCategory,
  fetchBasicDataCategoryByID,
  searchBasicDataCategoryByFilter,
} from "../../service/basic_data_category/basicDataCategoryService";
import {
  exportPDFBasicData,
  fetchAllConfirmedBasicData,
  fetchBasicDataByCate,
  fetchBasicDataByID,
  searchBasicDataByFilter,
} from "../../service/basic_data/basicDataService";
import AddBasicData from "../../features/basic_data/page/AddBasicData";
import EditBasicData from "../../features/basic_data/page/EditBasicData";
import BasicDataCategory from "../../features/basic_data/component/BasicDataCategory";

const BasicData = () => {
  const [data, setData] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [acItemRefData, setAcItemRefData] = useState([]);
  const [selectAcItemRef, setSelectAcItemRef] = useState([]);
  const [searchFilter, setSearchFilter] = useState(null);
  const [factories, setFactories] = useState([]);
  const [selectFactory, setSelectFactory] = useState({});
  const [isSearch, setIsSearch] = useState(false);
  const [isDetailSearch, setIsDetailSearch] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [selectRows, setSelectRows] = useState([]);
  const [selectedItemRefs, setSelectedItemRefs] = useState([]);
  const [jumpToRow, setJumpToRow] = useState(null);
  const [jumpToRowAcItemRef, setJumpToRowAcItemRef] = useState(null);
  const [authorization, setAuthorizations] = useState([]);
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const [, setOpenExportPopup] = useState(false);
  const [totalData, setTotalData] = useState(0);
  const [currentAIMPage, setCurrentAcItemMPage] = useState(0);
  const [currentAIMPageSize, setCurrentAIMPageSize] = useState(5);
  const [currentAIMOffset, setCurrentAIMOffset] = useState(0);
  const [currentAIRPage, setCurrentAcItemRPage] = useState(0);
  const [currentAIRPageSize, setCurrentAIRPageSize] = useState(10);
  const [currentAIROffset, setCurrentAIROffset] = useState(0);
  const [totalAIRData, setTotalAIRData] = useState(0);
  const [groupedSearchData, setGroupedSearchData] = useState([]);
  const {
    fetchTableControlTranslations,
    fetchTableColumnTranslations,
    language,
  } = useColumnTranslation();
  const [hasMore, setHasMore] = useState(false);
  const [hasBDMore, setHasBDMore] = useState(false);
  const { user } = useAuth();

  const fetchAll = async (authData = null, pageSize = 5, offset = 0) => {
    const authToUse = authData || authorization;
    const allow = Array.isArray(authToUse)
      ? authToUse.find((item) => item.field === "query_level")?.title
      : null;


    setCurrentAcItemMPage(0);
    setCurrentAIMPageSize(pageSize);
    setCurrentAIMOffset(0);

    let basicData;
    [basicData] = await fnQuery([
      () =>
        fetchBasicDataCategory(
          user.factory,
          user.department,
          user.user_code,
          allow || "1",
          pageSize,
          offset,
        ),
    ]);

    if (basicData) {
      // if (basicData.total !== undefined && basicData.total !== null) {
      //   setTotalData(basicData.total);
      // }
      setHasMore(basicData?.hasMore);
      setData([
        {
          tableName: "BASIC_DATA_CATEGORY",
          data: basicData.data || [],
        },
      ]);

      if (basicData.data && basicData.data.length > 0) {
        setSelectRows([basicData.data[0]]);
        setJumpToRow(basicData.data[0]);
      }
    }
  };
  //fetch all translation by user
  const fetchAllTranslations = async () => {
    try {
      const columns = await fetchTableColumnTranslations(
        "BASIC_DATA",
        "master",
        "basic_data_category",
      );
      const controls = await fetchTableControlTranslations("BASIC_DATA");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user.factory,
        user.department,
        user.user_code,
        "BASIC_DATA",
      );
      if (columns) setColumnTranslations(columns?.data);
      const mergedControls = [...controls?.data, ...sysMessages?.data];
      if (mergedControls.length > 0) {
        setControlTranslations(mergedControls);
      }
      if (auth) setAuthorizations(auth?.data);
      1;
      return auth?.data || [];
    } catch (error) {
      console.error(" Error:", error);
      return [];
    }
  };
  const fetchRecordFromDB = async (record) => {
    try {
      const response = await fetchBasicDataCategoryByID(
        selectRows[0]?.factory_code,
        selectRows[0]?.category_code,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };
  const fetchAcItemRefRecordFromDB = async (record) => {
    try {
      const response = await fetchBasicDataByID(
        record?.factory_code,
        record?.category_code,
        record?.code_no,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };
  const fetchDataByIAcno = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;
    const offset = shouldResetPagination
      ? 0
      : explicitOffset !== null
        ? explicitOffset
        : currentAIROffset;
    const pageSize =
      explicitPageSize !== null ? explicitPageSize : currentAIRPageSize;
    const response = await fetchBasicDataByCate(
      selectRows[0]?.factory_code,
      selectRows[0]?.category_code,
      user.department,
      user.user_code,
      allow,
      pageSize,
      offset,
    );
    if (response && response.data) {
      let childrenData = response.data;
      if (isSearch && searchData.length > 0) {
        const selectedParent = selectRows[0];
        // if (response.total !== undefined && response.total !== null) {
        //   setTotalAIRData(response.total);
        // }
        setHasBDMore(response?.hasMore);
        childrenData = response.data.filter((child) =>
          searchData.some(
            (searchItem) =>
              searchItem.factory_code === selectedParent.factory_code &&
              searchItem.category_code === selectedParent.category_code &&
              searchItem.code_no === child.code_no,
          ),
        );
      }
      setAcItemRefData([{ tableName: "BASIC_DATA", data: childrenData }]);
      // if (response.total !== undefined && response.total !== null) {
      //   setTotalAIRData(response.total);
      // }
      setHasBDMore(response?.hasMore);
      if (childrenData.length > 0) {
        setSelectAcItemRef([childrenData[0]]);
      } else {
        setSelectAcItemRef([]);
      }
    }
  };
  //========== END FETCH DATA SECTION ================

  // ========== USEEFFECT SECTION ==========
  useEffect(() => {
    const init = async () => {
      const authData = await fetchAllTranslations();
      await fetchAll(authData);
    };
    init();
  }, [language]);
  useEffect(() => {
    if (jumpToRow && jumpToRowAcItemRef) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
        setJumpToRowAcItemRef(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow, jumpToRowAcItemRef]);
  // ========== END USEEFFECT SECTION ==========

  //========== HANDLER SECTION ================
  // Thêm vào AcItemM.jsx, sau hàm fetchDataByIAcno
  const refreshCurrentAcItemM = async () => {
    const currentSelection = selectRows.length > 0 ? selectRows[0] : null;

    if (isSearch && searchFilter) {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;

      //  PHÂN BIỆT: Search Master vs Search Details
      const search = searchFilter.search || {};
      const hasAIM = "status" in search || "category_code" in search;
      const hasOther = Object.keys(search).some(
        (k) => k !== "status" && k !== "category_code" && k !== "category_name",
      );

      let response;

      //  CASE 1: Search MASTER (dùng searchAcItemMByFilter)
      if (hasAIM && !hasOther) {
        response = await searchBasicDataCategoryByFilter(
          searchFilter,
          user.factory,
          user.department,
          user.user_code,
          allow,
          currentAIMPageSize,
          currentAIMOffset,
        );

        if (response && response.data) {
          setData([{ tableName: "BASIC_DATA_CATEGORY", data: response.data }]);

          if (currentSelection) {
            const currentKey = `${currentSelection.factory_code}-${currentSelection.category_code}`;
            const foundRecord = response.data.find(
              (item) =>
                `${item.factory_code}-${item.category_code}` === currentKey,
            );

            if (foundRecord) {
              setSelectRows([foundRecord]);
              setJumpToRow(foundRecord);
            } else if (response.data.length > 0) {
              setSelectRows([response.data[0]]);
              setJumpToRow(response.data[0]);
            } else {
              setSelectRows([]);
            }
          }
        }
      }
      //  CASE 2: Search DETAILS (dùng searchAcItemRefByFilter)
      else {
        response = await searchBasicDataByFilter(
          searchFilter,
          user.factory,
          user.department,
          user.user_code,
          allow,
          currentAIMPageSize,
          currentAIMOffset,
        );

        if (response && response.data && response.data.length > 0) {
      

          //  QUAN TRỌNG: Tái tạo masterData giống handleSearch
          let masterData;

          if (response.masterInfo && response.masterInfo.length > 0) {
            const grouped = groupDetailsByMaster(response.data);

            masterData = response.masterInfo.map((masterInfo) => {
              const group = grouped.find(
                (g) =>
                  g.factory_code === masterInfo.factory_code &&
                  g.category_code === masterInfo.category_code,
              );

              return {
                ...masterInfo,
                detailCount: group?.detailCount || 0,
              };
            });
          } else {
            const grouped = groupDetailsByMaster(response.data);

            masterData = grouped.map((group) => ({
              factory_code: group.factory_code,
              category_code: group.category_code,
              detailCount: group.detailCount,
            }));
          }

          setData([{ tableName: "BASIC_DATA_CATEGORY", data: masterData }]);
          if (currentSelection) {
            const currentKey = `${currentSelection.factory_code}-${currentSelection.category_code}`;
            const foundRecord = masterData.find(
              (item) =>
                `${item.factory_code}-${item.category_code}` === currentKey,
            );

            if (foundRecord) {
              setSelectRows([foundRecord]);
              setJumpToRow(foundRecord);
            } else {
              if (masterData.length > 0) {
                setSelectRows([masterData[0]]);
                setJumpToRow(masterData[0]);
              } else {
                setSelectRows([]);
              }
            }
          }

          setSearchData(response.data);
        }
      }
    } else {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;

      const responseData = await fetchBasicDataCategory(
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        currentAIMPageSize,
        currentAIMOffset,
      );

      if (responseData && responseData.data) {
        setData([
          { tableName: "BASIC_DATA_CATEGORY", data: responseData.data },
        ]);
        setHasMore(responseData?.hasMore);
        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${currentSelection.category_code}`;
          const updatedRecord = responseData.data.find(
            (item) =>
              `${item.factory_code}-${item.category_code}` === currentKey,
          );

          if (updatedRecord) {
            setSelectRows([updatedRecord]);
            setJumpToRow(updatedRecord);
          } else if (responseData.data.length > 0) {
            setSelectRows([responseData.data[0]]);
            setJumpToRow(responseData.data[0]);
          }
        }
      }
    }
  };

  //handler search by code
  const handleSearch = async (newFilter, pageSize = 5, offset = 0) => {
    try {
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;

      if (offset === 0) {
        setCurrentAcItemRPage(0);
        setCurrentAIRPageSize(10);
        setCurrentAIROffset(0);
        setCurrentAcItemMPage(0);
        setCurrentAIMPageSize(pageSize);
        setCurrentAIMOffset(0);
      }
      const response = await searchBasicDataByFilter(
        newFilter,
        user.factory,
        user.department,
        user.user_code,
        allow,
        pageSize,
        offset,
      );
      setIsDetailSearch(true);
      if (response && response.data && response.data.length > 0) {
        //  KIỂM TRA: Backend có trả masterInfo không?
        let masterData;
        if (response.masterInfo && response.masterInfo.length > 0) {
          //  CASE 1: Backend trả về masterInfo (cách MỚI - đầy đủ fields)
          const grouped = groupDetailsByMaster(response.data);

          masterData = response.masterInfo.map((masterInfo) => {
            const group = grouped.find(
              (g) =>
                g.factory_code === masterInfo.factory_code &&
                g.category_code === masterInfo.category_code,
            );

            return {
              ...masterInfo,
              detailCount: group?.detailCount || 0,
            };
          });
        } else {
          //  CASE 2: Backend KHÔNG trả masterInfo (cách CŨ - fallback)

          const grouped = groupDetailsByMaster(response.data);

          masterData = grouped.map((group) => ({
            factory_code: group.factory_code,
            category_code: group.category_code,
            detailCount: group.detailCount,
          }));
        }
        //  Set data cho AC_ITEM_M
        setData([{ tableName: "BASIC_DATA_CATEGORY", data: masterData }]);
        setTotalData(response.totalMasters);

        const masterPage = Math.floor(offset / pageSize);
        setCurrentAcItemMPage(masterPage);
        setCurrentAIMPageSize(pageSize);
        setCurrentAIMOffset(offset);

        //  Details của master đầu tiên
        const grouped = groupDetailsByMaster(response.data);
        const firstMaster = grouped[0];
        const firstMasterAllDetails = firstMaster.details;

        const detailPageSize = currentAIRPageSize || 10;
        const paginatedFirstMasterDetails = firstMasterAllDetails.slice(
          0,
          detailPageSize,
        );

        setAcItemRefData([
          {
            tableName: "BASIC_DATA",
            data: paginatedFirstMasterDetails,
          },
        ]);

        setTotalAIRData(firstMasterAllDetails.length);
        setCurrentAcItemRPage(0);
        setCurrentAIRPageSize(detailPageSize);
        setCurrentAIROffset(0);

        //  Select master đầu tiên
        setSelectRows([masterData[0]]);
        setJumpToRow(masterData[0]);

        if (paginatedFirstMasterDetails.length > 0) {
          setSelectAcItemRef([paginatedFirstMasterDetails[0]]);
          setJumpToRowAcItemRef(paginatedFirstMasterDetails[0]);
        } else {
          setSelectAcItemRef([]);
          setJumpToRowAcItemRef(null);
        }

        setIsSearch(true);
        setSearchData(response.data); 
      } else {
        setIsSearch(true);
        setSearchData([]);
        setData([{ tableName: "BASIC_DATA_CATEGORY", data: [] }]);
        setAcItemRefData([{ tableName: "BASIC_DATA", data: [] }]);
        setSelectRows([]);
        setSelectAcItemRef([]);
        setTotalData(0);
        setTotalAIRData(0);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchData([]);
      setSelectRows([]);
      setSelectAcItemRef([]);
      await fetchAll();
    }
  };
  //handler close add popup
  const handleAddClose = () => {
    setOpenAdd(false);
  };
  //handler open add popup
  const handleOpenAdd = () => {
    const allowAdd = authorization?.find(
      (item) => item.field === "allow_add",
    )?.title;
    if (user?.user_code !== "admin" && allowAdd === "N") {
      return;
    }
    setOpenAdd(true);
  };
  const groupDetailsByMaster = (details) => {
    const grouped = details.reduce((acc, detail) => {
      const masterKey = `${detail.factory_code}-${detail.category_code}`;
      if (!acc[masterKey]) {
        acc[masterKey] = {
          masterKey: masterKey,
          factory_code: detail.factory_code,
          category_code: detail.category_code,
          details: [],
          detailCount: 0,
        };
      }

      acc[masterKey].details.push(detail);
      acc[masterKey].detailCount = acc[masterKey].details.length;
      return acc;
    }, {});

    return Object.values(grouped);
  };
  const handleEditClose = async (data) => {
    try {
      if (selectRows.length === 1) {
        const record = data || selectRows[0];
        if (record?.locked_information === user?.clientInfo) {
          const { detailCount, ...unlockRecord } = record;
          const unlockData = {
            ...unlockRecord,
            locked_information: null,
          };
          await editBasicDataCategory(
            user?.factory,
            user?.department,
            user?.user_code,
            authorization?.find((item) => item.field === "query_level")?.title,
            unlockData,
            currentAIMPageSize,
          );
          await refreshCurrentAcItemM();
        }
      }
      setOpenEdit(false);
    } catch (error) {
      console.error("Error closing edit:", error);
      setOpenEdit(false);
    }
  };
  //handler open edit popup
  const handleOpenEdit = async () => {
    try {
      if (selectRows.length !== 1) return;
      const record = selectRows[0];

      const freshRecord = await fetchRecordFromDB(record);

      if (user.user_code !== "admin") {
        const allowModify = authorization?.find(
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
          return;
        }
        const allow = authorization?.find(
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
        //await refreshCurrentAcItemM();
        return;
      }
      const { FACTORY, ...clearData } = freshRecord;
      const lockData = {
        ...clearData,
        locked_information: user?.clientInfo,
      };

      await handleEdit(lockData, "", true);
      setSelectRows([lockData]);
      setOpenEdit(true);
    } catch (error) {
      console.error("Error opening edit:", error);
      showErrorToast(
        getControlLabel,
        "noti_error_open_edit",
        "An error occurred while opening edit form!",
      );
    }
    setOpenEdit(true);
  };
  const handleExportClose = () => {
    setOpenExportPopup(false);
  };
  //handler add permission
  const handleAdd = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const addData = Object.fromEntries(form.entries());
    addData.factory_code = user.factory;
    addData.grt_date = new Date().toISOString();
    addData.grt_user = user.user_code;
    addData.grt_dept = user.department;
    try {
      const response = await addBasicDataCategory(
        user.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        addData,
        currentAIMPageSize,
      );

      if (response.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_add",
          `Add successfully with id ${addData.category_code}!`,
        );
        try {
          const allow = Array.isArray(authorization)
            ? authorization.find((item) => item.field === "query_level")?.title
            : null;
          const responseData = await fetchBasicDataCategory(
            user?.factory,
            user?.department,
            user?.user_code,
            allow,
            response.size,
            response.offset,
          );
          setData([
            {
              tableName: "BASIC_DATA_CATEGORY",
              data: responseData.data || [],
            },
          ]);
          setSelectRows([response.data]);
          setJumpToRow(response.data);
          setCurrentAcItemMPage(response?.page);
          setCurrentAIMPageSize(response.size);
          setCurrentAIMOffset(response.offset);
          handleAddClose();
          setHasMore(responseData?.hasMore);
          setIsSearch(false);
          setSearchFilter(null);
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
      }
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
    }
  };
  //handler edit permission
  const handleEdit = async (updateRow, title, skipTimestamp = false) => {
    const { statusText, FACTORY, detailCount, ...cleanData } = updateRow;

    if (!skipTimestamp) {
      cleanData.last_user = user.user_code;
      cleanData.last_date = new Date().toISOString();
    }

    const result = await editBasicDataCategory(
      user?.factory,
      user?.department,
      user?.user_code,
      authorization?.find((item) => item.field === "query_level")?.title,
      cleanData,
      currentAIMPageSize,
    );

    if (result.success) {
      const successMessage =
        typeof title === "string" && title
          ? title
          : `${getControlLabel(
              "noti_success_edit",
              "Edit successfully with id",
            )} ${updateRow.category_code}!`;

      if (!skipTimestamp) {
        showSuccessToast(getControlLabel, "noti_success_edit", successMessage);
      }

      //  Nếu đang search, KHÔNG dùng resultPage/resultOffset từ backend
      if (isSearch) {
        // Unlock trước (nếu cần)
        if (
          !skipTimestamp &&
          cleanData.locked_information === user?.clientInfo
        ) {
          const unlockData = {
            ...cleanData,
            locked_information: null,
          };
          await editBasicDataCategory(
            user?.factory,
            user?.department,
            user?.user_code,
            authorization?.find((item) => item.field === "query_level")?.title,
            unlockData,
            currentAIMPageSize,
          );
        }

        // Refresh với current page/offset
        await refreshCurrentAcItemM();
      } else {
        // Không search - dùng resultPage/resultOffset từ backend
        const resultPage =
          result.size !== undefined
            ? Math.floor(result.position / result.size)
            : currentAIMPage;
        const resultOffset =
          result.offset !== undefined ? result.offset : currentAIMOffset;

        if (resultPage !== currentAIMPage) {
          // Record chuyển page
          const allow = Array.isArray(authorization)
            ? authorization.find((item) => item.field === "query_level")?.title
            : null;

          const responseData = await fetchBasicDataCategory(
            user?.factory,
            user?.department,
            user?.user_code,
            allow || "1",
            currentAIMPageSize,
            resultOffset,
          );

          if (responseData && responseData.data) {
            setData([
              { tableName: "BASIC_DATA_CATEGORY", data: responseData.data },
            ]);
            setCurrentAcItemMPage(resultPage);
            setCurrentAIMOffset(resultOffset);
            setHasMore(responseData?.hasMore);
            const editedRecord = responseData.data.find(
              (item) =>
                `${item.factory_code}-${item.category_code}` ===
                `${cleanData.factory_code}-${cleanData.category_code}`,
            );

            if (editedRecord) {
              setSelectRows([editedRecord]);
              setJumpToRow(editedRecord);
            }
          }
        } else {
          //  Unlock trước (nếu cần)
          if (
            !skipTimestamp &&
            cleanData.locked_information === user?.clientInfo
          ) {
            const unlockData = {
              ...cleanData,
              locked_information: null,
            };
            await editBasicDataCategory(
              user?.factory,
              user?.department,
              user?.user_code,
              authorization?.find((item) => item.field === "query_level")
                ?.title,
              unlockData,
              currentAIMPageSize,
            );
          }

          //  Refresh với current page/offset
          await refreshCurrentAcItemM();
        }
      }

      if (!skipTimestamp) {
        setOpenEdit(false);
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
  const handleStatusChange = async (
    newStatus,
    actionName,
    allowedFromStatuses = [],
  ) => {
    if (selectRows.length !== 1) return;
    try {
      const record = selectRows[0];
      if (user.user_code !== "admin") {
        const allowModify = authorization?.find(
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
        const allow = authorization?.find(
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
        const allowAction = authorization?.find(
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
      const freshRecord = await fetchRecordFromDB(record);
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

        await refreshCurrentAcItemM();
        return;
      }
      const { FACTORY, ...clearData } = freshRecord;
      const updateData = {
        ...clearData,
        status: newStatus,
        last_user: user.user_code,
        last_date: new Date().toISOString(),
      };

      const response = await editBasicDataCategory(
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        updateData,
        currentAIMPageSize,
      );

      if (response.success) {
        showSuccessToast(getControlLabel, `noti_success_${actionName}`);

        setData((prevData) => {
          return prevData.map((table) => ({
            ...table,
            data: table.data.map((item) =>
              `${item.factory_code}-${item.category_code}` ===
              `${updateData.factory_code}-${updateData.category_code}`
                ? updateData
                : item,
            ),
          }));
        });
        setSelectRows([updateData]);
        setJumpToRow(updateData);
      }
      if (actionName === "confirm") {
        await handleUpdateConfirm();
        setTimeout(() => {
          setData((prevData) => {
            if (prevData?.[0]?.data?.length > 0) {
              const updatedRow = prevData[0].data.find(
                (item) =>
                  `${item.factory_code}-${item.category_code}` ===
                  `${updateData.factory_code}-${updateData.category_code}`,
              );
              if (updatedRow) {
                setSelectRows([updatedRow]);
                setJumpToRow(updatedRow);
              }
            }
            return prevData;
          });
        }, 100);
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
  const handleUpdateConfirm = async () => {
    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;

    try {
      await fetchAllConfirmedBasicData(
        user?.factory,
        selectRows[0]?.category_code,
        user?.department,
        user?.user_code,
        allow,
        isSearch && searchData.length > 0 ? searchData : [],
      );
      const response = await fetchBasicDataByCate(
        selectRows[0]?.factory_code,
        selectRows[0]?.category_code,
        user.department,
        user.user_code,
        allow,
        currentAIRPageSize,
        currentAIROffset,
      );
      if (response && response.data) {
        if (isSearch && searchData.length > 0) {
          const selectedParent = selectRows[0];
          const filteredData = response.data.filter((item) =>
            searchData.some(
              (search) =>
                search.factory_code === item.factory_code &&
                search.category_code === item.category_code &&
                search.item_no === item.item_no,
            ),
          );
          setSearchData((prevSearchData) => {
            // Xóa data cũ của cha này
            const otherParentsData = prevSearchData.filter(
              (item) =>
                !(
                  item.factory_code === selectedParent.factory_code &&
                  item.category_code === selectedParent.category_code
                ),
            );
            return [...otherParentsData, ...filteredData];
          });
          setAcItemRefData([
            {
              tableName: "BASIC_DATA",
              data: filteredData,
            },
          ]);
          if (filteredData.length > 0) {
            const currentItem = selectAcItemRef[0];
            const matchedItem = filteredData.find(
              (item) =>
                item.factory_code === currentItem?.factory_code &&
                item.category_code === currentItem?.category_code &&
                item.item_no === currentItem?.item_no,
            );

            const itemToSelect = matchedItem || filteredData[0];
            setSelectAcItemRef([itemToSelect]);
            setJumpToRowAcItemRef(itemToSelect);
          } else {
            setSelectAcItemRef([]);
          }
        } else {
          setAcItemRefData([{ tableName: "BASIC_DATA", data: response.data }]);

          if (response.data.length > 0) {
            const currentItem = selectAcItemRef[0];
            const matchedItem = response.data.find(
              (item) =>
                item.factory_code === currentItem?.factory_code &&
                item.category_code === currentItem?.category_code &&
                item.item_no === currentItem?.item_no,
            );

            const itemToSelect = matchedItem || response.data[0];
            setSelectAcItemRef([itemToSelect]);
            setJumpToRowAcItemRef(itemToSelect);
          }
        }
      }
    } catch (error) {
      console.error(" Error in handleUpdateConfirm:", error);
      showErrorToast(
        getControlLabel,
        "noti_fail_confirm_all",
        "Failed to auto-confirm BASIC_DATA!",
      );
    }
  };
  const handleCancel = () => {
    handleStatusChange(0, "cancel", [1, 2]);
  };
  const handleConfirm = async () => {
    if (selectRows.length !== 1) return;
    await handleStatusChange(7, "confirm", [1, 2]);
  };
  const handleUnconfirm = () => {
    handleStatusChange(1, "unconfirm", [7]);
  };

  const handleClose = () => {
    handleStatusChange(9, "close", [1, 7]);
  };
  const handleLink = async () => {
    setOpenLink(true);
  };
  const handleLinkClose = async () => {
    setOpenLink(false);
  };
  //handler search by category
  const handleSearchMaster = async (newFilter, pageSize = 10, offset = 0) => {
    try {
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      if (offset === 0) {
        setCurrentAcItemMPage(0);
        setCurrentAIMPageSize(pageSize);
        setCurrentAIMOffset(0);
      }
      const response = await searchBasicDataCategoryByFilter(
        newFilter,
        user.factory,
        user.department,
        user.user_code,
        allow,
        pageSize,
        offset,
      );
      setIsSearch(true);
      setIsDetailSearch(false);
      if (response && response.data && response.data.length > 0) {
        setSearchData([]);
        setData([{ tableName: "BASIC_DATA_CATEGORY", data: response.data }]);
        setSelectRows([response.data[0]]);
        setJumpToRow(response.data[0]);

        // Thêm log sau một chút để check có bị override không
        if (offset === 0 && response.data.length > 0) {
          setTotalData(response.total);
        }
        const airResponse = await fetchBasicDataByCate(
          response.data[0]?.factory_code,
          response.data[0]?.category_code,
          user.department,
          user.user_code,
          allow,
          currentAIRPageSize,
          currentAIROffset,
        );
        if (airResponse && airResponse.data) {
          setAcItemRefData([
            { tableName: "BASIC_DATA", data: airResponse.data },
          ]);
          if (airResponse.data.length > 0) {
            setSelectAcItemRef([airResponse.data[0]]);
            setJumpToRowAcItemRef(airResponse.data[0]);
          } else {
            setSelectAcItemRef([]);
            setJumpToRowAcItemRef(null);
          }
        }
      } else {
        setIsSearch(true);
        setSearchData([]);
        setData([]);
        setSelectRows([]);
        setSelectRows([]);
        setAcItemRefData([{ tableName: "AC_ITEM_REF", data: [] }]);
        setSelectAcItemRef([]);
        setCurrentAIMOffset(0);
        setCurrentAIMPageSize(0);
        setTotalData(0);
        setTotalAIRData(0);
        setCurrentAcItemMPage(0);
        setCurrentAIROffset(0);
        setCurrentAcItemRPage(0);
        setCurrentAIMPageSize(pageSize);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Search error:", error);
      // setIsSearch(false);
      setSearchData([]);
      setSelectRows([]);
      setAcItemRefData([]);
    }
  };

  const handleSearchByFilter = async (filteredShoe, pageSize, offset) => {
    try {
      const search = filteredShoe.search || {};
      const keys = Object.keys(search);

      if (keys.length === 0) {
        setCurrentAcItemMPage(0);
        setCurrentAIMPageSize(10);
        setCurrentAIMOffset(0);
        setIsSearch(false);
        setSearchData([]);
        setSelectRows([]);
        setSearchFilter(null);
        await fetchAll();
        return;
      }
      const isNewFilter =
        JSON.stringify(filteredShoe) !== JSON.stringify(searchFilter);
      const actualPageSize = pageSize ?? currentAIMPageSize;
      const actualOffset = isNewFilter ? 0 : (offset ?? currentAIMOffset);

      const actualAIRPageSize = pageSize ?? currentAIRPageSize;
      const actualAIROffset = isNewFilter ? 0 : (offset ?? currentAIROffset);

      setSearchFilter(filteredShoe);
      const hasAIM =
        "status" in search ||
        "category_name" in search ||
        "category_code" in search;
      const hasOther = keys.some(
        (k) => k !== "status" && k !== "category_code" && k !== "category_name",
      );
      if (hasAIM && !hasOther) {
        await handleSearchMaster(filteredShoe, actualPageSize, actualOffset);
      } else {
        await handleSearch(filteredShoe, 5, actualAIROffset);
      }
    } catch (error) {
      console.log("cannot search because", error);
      // setIsSearch(false);
      setSelectRows([]);
      await fetchAll();
    }
  };

  //handler select row permission
  const handleSelectChoose = (rows) => {
    setSelectRows([...rows]);

    if (isSearch && searchData.length > 0 && rows.length > 0) {
      //  CASE 1: Search DETAILS - Có searchData

      const selectedMaster = rows[0];

      //  Tìm details từ searchData
      const masterDetails = searchData.filter(
        (detail) =>
          detail.factory_code === selectedMaster.factory_code &&
          detail.category_code === selectedMaster.category_code,
      );

     

      //  Reset detail pagination về trang đầu
      setCurrentAcItemRPage(0);
      setCurrentAIROffset(0);

      // Phân trang details
      const detailPageSize = currentAIRPageSize || 10;
      const paginatedDetails = masterDetails.slice(0, detailPageSize);

      setAcItemRefData([{ tableName: "AC_ITEM_REF", data: paginatedDetails }]);
      setTotalAIRData(masterDetails.length);

      if (paginatedDetails.length > 0) {
        setSelectAcItemRef([paginatedDetails[0]]);
        setJumpToRowAcItemRef(paginatedDetails[0]);
      } else {
        setSelectAcItemRef([]);
        setJumpToRowAcItemRef(null);
      }
    } else if (isSearch && rows.length > 0) {
      //  CASE 2: Search MASTER - Không có searchData  Gọi API
      // Trigger useEffect trong AcItemRef để fetch details
      // hoặc gọi trực tiếp fetchDataByIAcno()
    }
    // CASE 3: Không search - sẽ được xử lý bởi useEffect trong AcItemRef
  };

  const handlePageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;

    setCurrentAcItemMPage(newPage);
    setCurrentAIMPageSize(newPageSize);
    setCurrentAIMOffset(newOffset);

    if (isSearch && searchFilter) {
      const search = searchFilter.search || {};
      const hasAIM =
        "status" in search || "vend_no" in search || "category_code" in search;
      const hasOther = Object.keys(search).some(
        (k) =>
          k !== "status" &&
          k !== "category_code" &&
          k !== "category_name" &&
          k !== "ac_item",
      );

      //  CASE 1: Search Master
      if (hasAIM && !hasOther) {
        await handleSearchMaster(searchFilter, newPageSize, newOffset);
        return;
      }

      //  CASE 2: Search Details - GỌI LẠI API
      else {

        const allow = Array.isArray(authorization)
          ? authorization.find((item) => item.field === "query_level")?.title
          : null;

        //  GỌI LẠI handleSearch với offset mới
        await handleSearch(searchFilter, newPageSize, newOffset);

        return;
      }
    }

    //  CASE 3: Không search
    const responseData = await fetchBasicDataCategory(
      user?.factory,
      user?.department,
      user?.user_code,
      authorization?.find((item) => item.field === "query_level")?.title,
      newPageSize,
      newOffset,
    );
    setData([
      {
        tableName: "BASIC_DATA_CATEGORY",
        data: responseData.data || [],
      },
    ]);
    setHasMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectRows([responseData.data[0]]);
      setJumpToRow(responseData.data[0]);
    }
  };
  const handleAIRPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentAcItemRPage(newPage);
    setCurrentAIRPageSize(newPageSize);
    setCurrentAIROffset(newOffset);

    if (isSearch && searchData.length > 0 && selectRows.length > 0) {

      const selectedMaster = selectRows[0];

      //  Lọc tất cả details của master đang chọn từ searchData
      const allMasterDetails = searchData.filter(
        (detail) =>
          detail.factory_code === selectedMaster.factory_code &&
          detail.category_code === selectedMaster.category_code,
      );

      //  Phân trang client-side
      const paginatedDetails = allMasterDetails.slice(
        newOffset,
        newOffset + newPageSize,
      );



      //  Update data với details đã phân trang
      setAcItemRefData([
        {
          tableName: "BASIC_DATA",
          data: paginatedDetails,
        },
      ]);

      //  Select detail đầu tiên của page mới
      if (paginatedDetails.length > 0) {
        setSelectAcItemRef([paginatedDetails[0]]);
        setJumpToRowAcItemRef(paginatedDetails[0]);
      } else {
        setSelectAcItemRef([]);
      }

      return; 
    }

    //  KHÔNG search HOẶC search MASTER (searchData = [])
    //  Gọi API để fetch details
    await fetchDataByIAcno(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.category_code) {
      return;
    }

    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;

    const responseData = await fetchBasicDataByCate(
      selectRows[0]?.factory_code,
      selectRows[0]?.category_code,
      user?.department,
      user?.user_code,
      allow || "1",
      newPageSize,
      newOffset,
    );

    if (responseData && responseData.data) {
      setAcItemRefData([
        {
          tableName: "BASIC_DATA",
          data: responseData.data || [],
        },
      ]);

      if (responseData.data.length > 0) {
        setSelectAcItemRef([responseData.data[0]]);
        setJumpToRowAcItemRef(responseData.data[0]);
      } else {
        setSelectAcItemRef([]);
      }
    }
  };
  //handler export pdf
  const handlePDF = async () => {
    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;
    await exportPDFBasicDataCategory(
      user?.factory,
      user?.department,
      user?.user_code,
      allow,
    );
  };
  //==========END HANDLER SECTION ================

  //========== LABEL TRANSLATION HANDLER ==============

  //handler translation by control ui
  const getControlLabel = (fieldCode, fallback) => {
    if (!controlTranslations || controlTranslations.length === 0) {
      return fallback;
    }
    const translation = controlTranslations.find(
      (item) => item.field === fieldCode,
    );
    return translation?.title || fallback;
  };
  //handler translation by column table
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
  //========== END LABEL TRANSLATION HANDLER ==============
  return (
    <>
      {/* ========== MAIN CONTENT AREA ========== */}
      <Box>
        <Container maxWidth="xl">
          <Stack
            direction="row"
            flexWrap="wrap"
            sx={{ rowGap: 1, width: "100%" }}
          >
            <Paper
              sx={{
                width: "100%",
                maxWidth: "100%",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <Box style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                <Box>
                  <DataTable
                    data={data[0]?.data}
                    tableName={"BASIC_DATA_CATEGORY"}
                    selectRows={selectRows}
                    onSelectChange={handleSelectChoose}
                    onSearch={handleSearchByFilter}
                    onAdd={handleOpenAdd}
                    onEdit={handleOpenEdit}
                    onCancel={handleCancel}
                    onConfirm={handleConfirm}
                    onUnconfirm={handleUnconfirm}
                    onLink={handleLink}
                    popupOpen={openLink}
                    onClose={handleClose}
                    factories={factories}
                    selectFactory={selectFactory}
                    onSelectFactory={setSelectFactory}
                    onPDF={handlePDF}
                    isSearch={isSearch}
                    searchData={searchData}
                    columnTranslations={columnTranslations}
                    controlTranslations={controlTranslations}
                    language={language}
                    getControlLabel={getControlLabel}
                    getColumnLabel={getColumnLabel}
                    jumpToRow={jumpToRow}
                    subAuthentication={authorization}
                    handleSearchByCode={handleSearch}
                    fetchAcItemRefRecordFromDB={fetchAcItemRefRecordFromDB}
                    totalData={totalData || 0}
                    onPageChange={handlePageChange}
                    currentPage={currentAIMPage}
                    currentPageSize={currentAIMPageSize}
                    hasMore={hasMore}
                  />
                </Box>
                <Box>
                  <BasicDataCategory
                    jumpToRow={jumpToRowAcItemRef}
                    setJumpToRow={setJumpToRowAcItemRef}
                    data={acItemRefData}
                    setData={setAcItemRefData}
                    selectAcItemRef={selectAcItemRef}
                    setSelectAcItemRef={setSelectAcItemRef}
                    fetchDataByIAcno={fetchDataByIAcno}
                    subAuthentication={authorization}
                    factory_code={selectRows[0]?.factory_code}
                    selectRows={selectRows.length > 0 ? selectRows : []}
                    isSearch={isDetailSearch}
                    searchData={searchData}
                    handleSearchByCode={handleSearch}
                    fetchAcItemRefRecordFromDB={fetchAcItemRefRecordFromDB}
                    totalAIRData={totalAIRData || 0}
                    onPageChange={handleAIRPageChange}
                    currentAIRPage={currentAIRPage}
                    currentAIRPageSize={currentAIRPageSize}
                    currentAIROffset={currentAIROffset}
                    setCurrentAIROffset={setCurrentAIROffset}
                    setCurrentAIRPageSize={setCurrentAIRPageSize}
                    setCurrentAcItemRPage={setCurrentAcItemRPage}
                    setTotalAIRData={setTotalAIRData}
                    setSearchData={setSearchData}
                    hasMore={hasBDMore}
                    setHasMore={setHasBDMore}
                    setIsSearch={setIsDetailSearch}
                    setSearchFilter={setSearchFilter}
                  />
                </Box>
              </Box>
            </Paper>
          </Stack>
        </Container>
      </Box>
      <AddBasicData
        open={openAdd}
        handleAdd={handleAdd}
        handleClose={handleAddClose}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        language={language}
        mapLanguageToColumn={mapLanguageToColumn}
        user={user}
        table="category_name"
      />
      <EditBasicData
        open={openEdit}
        onClose={handleEditClose}
        basicDataCategory={selectRows.length > 0 ? selectRows[0] : null}
        factory={selectFactory}
        handleEdit={handleEdit}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        language={language}
        mapLanguageToColumn={mapLanguageToColumn}
        table="category_name"
      />
    </>
  );
};

export default BasicData;
