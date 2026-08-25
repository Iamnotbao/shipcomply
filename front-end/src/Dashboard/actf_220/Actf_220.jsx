import { useEffect, useState } from "react";
import DataTable from "../../component/table/DataTable";
import {
  Box,
  Container,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { fnQuery } from "../../utils/fnQuery";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import { fetchTablePermission } from "../../service/users_permission/UsersPermission";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../utils/notification/Notification";
import AcProdD from "../../features/actf_220/component/AcProcD";
import AcDescProc from "../../features/actf_220/component/AcDescProc";
import AddAcProcM from "../../features/actf_220/page/AddAcProcM";
import EditAcProcM from "../../features/actf_220/page/EditAcProcM";
import {
  fetchAPDByID,
  fetchAllAPDByAcno,
} from "../../service/ac_proc_d/AcProcDService";
import {
  fetchAllAcProcM,
  searchAcProcMByFilter,
  activate,
  addAPCM,
  cancelActivate,
  close,
  editAPCM,
  exportExcelVwProcM,
  fetchAPCMByID,
  voidAll,
  confirmAll,
} from "../../service/ac_proc_m/AcProcMService";
import {
  fetchADPByID,
  fetchAllADPByAcno,
} from "../../service/ac_desc_proc/AcDescProcService";
import AcProcD from "../../features/actf_220/component/AcProcD";
import VwAcReqD from "../../features/actf_220/component/VwAcReqD";
import ModifyLationPopup from "../../features/actf_220/page/ModifyLationPopup";
import ImportLinkPopup from "../../features/actf_220/page/ImportLinkPopup";

const Actf220 = () => {
  const [data, setData] = useState([]);
  const [aPDData, setAPDData] = useState([]);
  const [selectAPD, setSelectAPD] = useState([]);
  const [jumpToRowAPD, setJumpToRowAPD] = useState(null);
  const [aDPData, setADPData] = useState([]);
  const [selectADP, setSelectADP] = useState([]);
  const [jumpToRowADP, setJumpToRowADP] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [searchFilter, setSearchFilter] = useState({});
  const [isAPDSearch, setIsAPDSearch] = useState(false);
  const [searchAPDData, setSearchAPDData] = useState([]);
  const [searchAPDFilter, setSearchAPDFilter] = useState(null);
  const [isADPSearch, setIsADPSearch] = useState(false);
  const [searchADPData, setSearchADPData] = useState([]);
  const [searchADPFilter, setSearchADPFilter] = useState(null);
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectRow, setSelectRow] = useState(null);
  const [selectRows, setSelectRows] = useState([]);
  const [authorization, setAuthorizations] = useState([]);
  const [filter, setFilter] = useState("");
  const [file, setFile] = useState(null);
  const [jumpToRow, setJumpToRow] = useState(null);
  const [totalData, setTotalData] = useState(0);
  const [totalAPDData, setTotalAPDData] = useState(0);
  const [totalADPData, setTotalADPData] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(5);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [currentAPDPage, setCurrentAPDPage] = useState(0);
  const [currentAPDPageSize, setCurrentAPDPageSize] = useState(10);
  const [currentAPDOffset, setCurrentAPDOffset] = useState(0);
  const [currentADPPage, setCurrentADPPage] = useState(0);
  const [currentADPPageSize, setCurrentADPPageSize] = useState(10);
  const [currentADPOffset, setCurrentADPOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasAPDMore, setHasAPDMore] = useState(false);
  const [hasADPMore, setHasADPMore] = useState(false);
  const [openModifyLation, setOpenModifyLation] = useState(false);
  const [isEditInCurrate, setIsEditInCurrate] = useState(true);
  const [openImportLink, setOpenImportLink] = useState(false);
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const { user } = useAuth();
  const {
    fetchTableControlTranslations,
    fetchTableColumnTranslations,
    language,
  } = useColumnTranslation();
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const [errorControlTranslations, setErrorControlTranslations] = useState([]);

  //========== FETCH DATA SECTION ================
  const fetchAll = async (authData = null, pageSize = 5, offset = 0) => {
    const authToUse = authData || authorization;

    const allow = Array.isArray(authToUse)
      ? authToUse.find((item) => item.field === "query_level")?.title
      : null;

    setCurrentPage(0);
    setCurrentPageSize(pageSize);
    setCurrentOffset(0);
    const combinedData = await fnQuery([
      () =>
        fetchAllAcProcM(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          language,
          pageSize,
          offset,
        ),
    ]);
    setData([{ tableName: "AC_PROC_M", data: combinedData[0].data }]);
    setHasMore(combinedData[0]?.hasMore);
    if (combinedData?.[0]?.data?.length > 0) {
      setSelectRows([combinedData[0].data[0]]);
      setJumpToRow(combinedData[0].data[0]);
    }
  };

  const fetchAllTranslations = async () => {
    try {
      const columns = await fetchTableColumnTranslations(
        "ACTF_220",
        "master",
        "ac_proc_m",
      );
      const controls = await fetchTableControlTranslations("ACTF_220");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user?.factory,
        user?.department,
        user?.user_code,
        "ACTF_220",
      );
      const mergedControls = [...controls?.data, ...sysMessages?.data];
      if (mergedControls.length > 0) {
        setControlTranslations(mergedControls);
      }
      const mergedComplexColumn = [...controls?.data, ...columns?.data];
      if (mergedComplexColumn.length > 0)
        setColumnTranslations(mergedComplexColumn);
      if (auth) setAuthorizations(auth?.data);
      return auth?.data || [];
    } catch (error) {
      console.error(" Error:", error);
      return [];
    }
  };

  const fetchAPDByAcno = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    try {
      if (!selectRows || selectRows.length === 0) {
        setAPDData([{ tableName: "AC_PROC_D", data: [] }]);
        setSelectAPD([]);
        return;
      }
      const offset = shouldResetPagination
        ? 0
        : explicitOffset !== null
          ? explicitOffset
          : currentAPDOffset;
      const pageSize =
        explicitPageSize !== null ? explicitPageSize : currentAPDPageSize;
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const response = await fetchAllAPDByAcno(
        selectRows[0]?.factory_code,
        selectRows[0]?.ac_no,
        user.department,
        user.user_code,
        allow || "1",
        language,
        pageSize,
        offset,
      );

      if (response && response.data) {
        let childrenData = response.data;
        if (isSearch && searchData.length > 0) {
          const selectedParent = selectRows[0];
          if (response.total !== undefined && response.total !== null) {
            setTotalAPDData(response.total);
          }
          if (shouldResetPagination) {
            setCurrentAPDPage(0);
            setCurrentAPDOffset(0);
          }
          childrenData = response.data.filter((child) =>
            searchData.some(
              (searchItem) =>
                searchItem.factory_code === selectedParent.factory_code &&
                searchItem.ac_no === selectedParent.ac_no &&
                searchItem.seq === child.seq,
            ),
          );
        }
        setAPDData([{ tableName: "AC_PROC_D", data: childrenData }]);
        setHasAPDMore(response.hasMore);
        if (childrenData.length > 0) {
          setSelectAPD([childrenData[0]]);
        } else {
          setSelectAPD([]);
        }
      }
    } catch (error) {
      console.error(" Error fetching AC_PROC_D by ac_no:", error);
      showErrorToast(getControlLabel, "noti_load_fail", "Fail to load data");
    }
  };

  const fetchADPByAcno = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    try {
      if (!selectRows || selectRows.length === 0) {
        setADPData([{ tableName: "AC_DESC_PROC", data: [] }]);
        setSelectADP([]);
        return;
      }
      const offset = shouldResetPagination
        ? 0
        : explicitOffset !== null
          ? explicitOffset
          : currentADPOffset;
      const pageSize =
        explicitPageSize !== null ? explicitPageSize : currentADPPageSize;
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const response = await fetchAllADPByAcno(
        selectRows[0]?.factory_code,
        selectRows[0]?.ac_no,
        user.department,
        user.user_code,
        allow || "1",
        language,
        pageSize,
        offset,
      );

      if (response && response.data) {
        let childrenData = response.data;
        if (isSearch && searchData.length > 0) {
          const selectedParent = selectRows[0];
          if (response.total !== undefined && response.total !== null) {
            setTotalADPData(response.total);
          }
          if (shouldResetPagination) {
            setCurrentADPPage(0);
            setCurrentADPOffset(0);
          }
          childrenData = response.data.filter((child) =>
            searchData.some(
              (searchItem) =>
                searchItem.factory_code === selectedParent.factory_code &&
                searchItem.ac_no === selectedParent.ac_no &&
                searchItem.seq === child.seq,
            ),
          );
        }
        setADPData([{ tableName: "AC_DESC_PROC", data: childrenData }]);
        setHasADPMore(response.hasMore);
        if (childrenData.length > 0) {
          setSelectADP([childrenData[0]]);
        } else {
          setSelectADP([]);
        }
      }
    } catch (error) {
      console.error(" Error fetching AC_DESC_PROC by ac_no:", error);
      showErrorToast(getControlLabel, "noti_load_fail", "Fail to load data");
    }
  };

  const fetchRecordFromDB = async (record) => {
    try {
      const response = await fetchAPCMByID(
        selectRows[0]?.factory_code,
        selectRows[0]?.ac_no,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };

  const fetchAPDRecordFromDB = async (record) => {
    try {
      const response = await fetchAPDByID(
        selectAPD[0]?.factory_code,
        selectAPD[0]?.ac_no,
        selectAPD[0]?.seq,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };

  const fetchADPRecordFromDB = async (record) => {
    try {
      const response = await fetchADPByID(
        selectADP[0]?.factory_code,
        selectADP[0]?.ac_no,
        selectADP[0]?.seq,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };

  const refreshCurrentData = async () => {
    const currentSelection = selectRows.length > 0 ? selectRows[0] : null;

    if (isSearch && searchFilter) {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;

      const response = await searchAcProcMByFilter(
        searchFilter,
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        language,
        currentPageSize,
        currentOffset,
      );

      if (response && response.data) {
        setData([{ tableName: response.tableName, data: response.data }]);
        setHasMore(response?.hasMore); //  thêm dòng này

        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${currentSelection.ac_no}`;
          const foundRecord = response.data.find(
            (item) => `${item.factory_code}-${item.ac_no}` === currentKey,
          );

          if (foundRecord) {
            setSelectRows([foundRecord]);
            // không setJumpToRow khi đã tìm thấy (giống 210)
          } else if (response.data.length > 0) {
            setSelectRows([response.data[0]]);
            setJumpToRow(response.data[0]);
          } else {
            setSelectRows([]);
          }
        }
      }
    } else {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;

      const responseData = await fetchAllAcProcM(
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        language,
        currentPageSize,
        currentOffset,
      );

      if (responseData && responseData.data) {
        setData([{ tableName: "AC_PROC_M", data: responseData.data }]);
        setHasMore(responseData.hasMore);

        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${currentSelection.ac_no}`;
          const updatedRecord = responseData.data.find(
            (item) => `${item.factory_code}-${item.ac_no}` === currentKey,
          );

          if (updatedRecord) {
            setSelectRows([updatedRecord]);
            setJumpToRow(updatedRecord); //  thêm dòng này — giống Actf210
          } else if (responseData.data.length > 0) {
            setSelectRows([responseData.data[0]]);
            setJumpToRow(responseData.data[0]);
          }
        }
      }
    }
  };
  //========== END FETCH DATA SECTION ================

  // ========== USEEFFECT SECTION ==========
  useEffect(() => {
    fetchAllTranslations();
  }, [language]);

  useEffect(() => {
    const init = async () => {
      if (!user?.factory) {
        return;
      }
      const authData = await fetchAllTranslations();
      await fetchAll(authData);
    };
    init();
  }, [language, user?.factory]);

  useEffect(() => {
    if (jumpToRow) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow]);
  // ========== END USEEFFECT SECTION ==========

  //========== HANDLER SECTION ================
  const handleSelectChoose = (rows) => {
    setSelectRows(rows);
  };

  const handleEditClose = async (data) => {
    try {
      if (selectRows.length === 1) {
        const record = data || selectRows[0];
        if (record?.locked_information === user?.clientInfo) {
          const unlockData = {
            ...record,
            locked_information: null,
          };
          const {
            d_type_name,
            stoc_type_name,
            curr_name,
            sta_date,
            end_date,
            outer,
            in_set,
            out_name,
            intype_name,
            out_set,
            sort_name,
            grt_deptname,
            grt_username,
            last_username,
            ...finalLock
          } = unlockData;
          await editAPCM(
            user?.access_token,
            user?.factory,
            user?.department,
            user?.user_code,
            authorization?.find((item) => item.field === "query_level")?.title,
            currentPageSize,
            finalLock,
          );
          await refreshCurrentData();
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

          await refreshCurrentData();
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
        Object.keys(freshRecord).includes("locked_information") &&
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
      if (aPDData && aPDData[0]?.data.length > 0) {
        const flag = aPDData[0]?.data.find((item) => {
          if (item?.status > 0) {
            return item;
          }
        });
        if (flag !== null && flag !== undefined) {
          setIsEditInCurrate(false);
        } else {
          setIsEditInCurrate(true);
        }
      } else {
        setIsEditInCurrate(true);
      }
      const { FACTORY, statusText, ...clearData } = freshRecord;
      const lockData = {
        ...clearData,
        locked_information: user?.clientInfo,
      };

      await handleEditAPCM(lockData, "", true);
      setSelectRows([lockData]);
      setOpenEdit(true);
    } catch (error) {
      console.error(" Error opening edit:", error);
      showErrorToast(
        getControlLabel,
        "noti_error_open_edit",
        "This has error when open form edit!",
      );
    }
  };

  const handleAddClose = () => setOpenAdd(false);

  const handleOpenAdd = () => {
    const allowAdd = authorization?.find(
      (item) => item.field === "allow_add",
    )?.title;
    if (user?.user_code !== "admin" && allowAdd === "N") {
      return;
    }
    setOpenAdd(true);
  };

  const handleModal = (row) => {
    setSelectRow(row);
    setOpen(true);
  };

  const handleDetailModal = (row) => {
    setSelectRow(row);
    setOpenDetail(true);
  };

  const onSetFilter = (filter) => {
    setFilter(filter);
  };

  const handleAdd = async (newData) => {
    const addData = {
      ...newData,
      factory_code: user.factory,
      grt_user: user.user_code,
      grt_date: new Date().toISOString(),
      grt_dept: user.department,
      status: 1,
    };

    try {
      const response = await addAPCM(
        user.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        currentPageSize,
        addData,
      );

      if (response.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_add",
          `Add successfully with id ${addData.ac_no}!`,
        );
        const allow = Array.isArray(authorization)
          ? authorization.find((item) => item.field === "query_level")?.title
          : null;

        const responseData = await fetchAllAcProcM(
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
            tableName: "AC_PROC_M",
            data: responseData.data || [],
          },
        ]);
        setHasMore(responseData?.hasMore);

        setSelectRows([response?.data]);
        setJumpToRow(response.data);
        setCurrentPage(response.page);
        setCurrentPageSize(response.size);
        setCurrentOffset(response.offset);
        setIsSearch(false);
        setSearchFilter(null);
        setTotalData((prevTotal) => prevTotal + 1);
        handleAddClose();
      } else {
        showErrorToast(
          getControlLabel,
          "noti_fail_add_2",
          `Added successfully but failed to refresh data`,
        );
        handleAddClose();
      }
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
      console.log(`${error.response?.data?.message}`);
    }
  };

  const handleEditAPCM = async (updateRow, title, skipTimestamp = false) => {
    try {
      const {
        statusText,
        d_type_name,
        stoc_type_name,
        curr_name,
        sta_date,
        end_date,
        outer,
        in_set,
        out_name,
        intype_name,
        out_set,
        sort_name,
        grt_deptname,
        grt_username,
        last_username,
        ...cleanData
      } = updateRow;
      if (!skipTimestamp) {
        cleanData.last_user = user.user_code;
        cleanData.last_date = new Date().toISOString();
      }
      const result = await editAPCM(
        user?.access_token,
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        currentPageSize,
        cleanData,
      );
      if (result.success) {
        const successMessage =
          typeof title === "string" && title
            ? title
            : `Edit record with code(${cleanData.ac_no}) successfully !!!`;
        if (!skipTimestamp) {
          showSuccessToast(
            getControlLabel,
            "noti_success_edit",
            successMessage,
          );
        }
        if (isSearch) {
          if (
            !skipTimestamp &&
            cleanData.locked_information === user?.clientInfo
          ) {
            const unlockData = {
              ...cleanData,
              locked_information: null,
            };
            await editAPCM(
              user?.access_token,
              user?.factory,
              user?.department,
              user?.user_code,
              authorization?.find((item) => item.field === "query_level")
                ?.title,
              currentPageSize,
              unlockData,
            );
          }

          await refreshCurrentData();
        } else {
          const resultPage =
            result.size !== undefined
              ? Math.floor(result.position / result.size)
              : currentPage;
          const resultOffset =
            result.offset !== undefined ? result.offset : currentOffset;

          if (resultPage !== currentPage) {
            const allow = Array.isArray(authorization)
              ? authorization.find((item) => item.field === "query_level")
                  ?.title
              : null;

            const responseData = await fetchAllAcProcM(
              user?.factory,
              user?.department,
              user?.user_code,
              allow || "1",
              language,
              currentPageSize,
              resultOffset,
            );

            if (responseData && responseData.data) {
              setData([
                {
                  tableName: "AC_PROC_M",
                  data: responseData.data,
                },
              ]);
              setHasMore(responseData?.hasMore);
              setCurrentPage(resultPage);
              setCurrentOffset(resultOffset);

              const editedRecord = responseData.data.find(
                (item) =>
                  `${item.factory_code}-${item.ac_no}` ===
                  `${cleanData.factory_code}-${cleanData.ac_no}`,
              );

              if (editedRecord) {
                setSelectRows([editedRecord]);
                setJumpToRow(editedRecord);
              }
            }
          } else {
            if (
              !skipTimestamp &&
              cleanData.locked_information === user?.clientInfo
            ) {
              const unlockData = {
                ...cleanData,
                locked_information: null,
              };
              await editAPCM(
                user?.access_token,
                user?.factory,
                user?.department,
                user?.user_code,
                authorization?.find((item) => item.field === "query_level")
                  ?.title,
                currentPageSize,
                unlockData,
              );
            }
            await refreshCurrentData();
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
    } catch (error) {
      showErrorToast(
        getControlLabel,
        "noti_edit_fail_3",
        `Cannot edit successfully for user ${user.user_code}!`,
        {
          user: user?.user_code,
        },
      );
      console.log("data has been problem", error);
    }
  };

  const handleSearchByFilter = async (
    filteredData,
    pageSize = 5,
    offset = 0,
  ) => {
    try {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;
      const search = filteredData.search || {};
      const keys = Object.keys(search);
      if (keys.length === 0) {
        setCurrentPage(0);
        setCurrentPageSize(10);
        setCurrentOffset(0);
        setIsSearch(false);
        setSearchData([]);
        setSelectRows([]);
        setSearchFilter(null);
        await fetchAll();
        return;
      }
      if (offset === 0) {
        setCurrentPage(0);
        setCurrentPageSize(pageSize);
        setCurrentOffset(0);
      }
      setIsSearch(true);
      setSearchFilter(filteredData);
      const isNewFilter =
        JSON.stringify(filteredData) !== JSON.stringify(searchFilter);
      const actualOffset = isNewFilter ? 0 : (offset ?? currentOffset);
      const response = await searchAcProcMByFilter(
        filteredData,
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        language,
        pageSize,
        actualOffset,
      );

      if (response && response.data) {
        if (response.data.length === 0) {
          setSelectRows([]);
          setCurrentOffset(0);
          setCurrentPage(0);
          setCurrentPageSize(pageSize);
          setTotalData(0);
          setHasMore(false);
          setData([{ tableName: "AC_PROC_M", data: response.data }]);
        } else {
          setSelectRows([response.data[0]]);
          if (offset === 0 && response.data.length > 0) {
            setTotalData(response.total);
          }
          setData([{ tableName: "AC_PROC_M", data: response.data }]);
        }
      }
    } catch (error) {
      console.log("cannot search because", error);
    }
  };

  const handleStatusChange = async (
    actionName,
    allowedFromStatuses = [],
    fetchAction,
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
      }
      const freshRecord = await fetchRecordFromDB(record);
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
        await refreshCurrentData();
        return;
      }
      await fetchAction();
      showSuccessToast(getControlLabel, `noti_success_${actionName}`);
      await refreshCurrentData();
    } catch (error) {
      console.error(` Error in ${actionName}:`, error);
      showErrorToast(getControlLabel, "noti_error_lation", error?.message);
    }
  };

  const handleConfirm = async () => {
    try {
      await handleStatusChange("confirm", [1, 2], handleUpdateConfirm);
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_confirm", error.message);
    }
  };

  const handleUnconfirm = async () => {
    try {
      await handleStatusChange("unconfirm", [1, 7], async () => {
        await cancelActivate(
          user?.factory,
          user?.user_code,
          selectRows[0]?.ac_no,
          language,
        );
      });
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_unconfirm", error.message);
    }
  };
  const handleClose = async () => {
    try {
      await handleStatusChange("close", [1, 7], async () => {
        await close(user?.factory, selectRows[0]?.ac_no, user?.user_code);
      });
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_close", error.message);
    }
  };
  const handleCancel = async () => {
    await handleStatusChange("cancel", [1, 2], async () => {
      try {
        await voidAll(
          user?.factory,
          selectRows[0]?.ac_no,
          user?.user_code,
          language,
        );
      } catch (error) {
        if (error?.code === 500053) {
          showErrorToast(getControlLabel, "noti_fail_cancel_1", error.message);
          throw error;
        }
        if (error?.code === 500107) {
          setOpenModifyLation(true);
          throw error;
        } else {
          showErrorToast(getControlLabel, "noti_fail_cancel_2", error.message);
          throw error;
        }
      }
    });
  };
  const handleCheck = () => {
    handleStatusChange(2, "check", [1]);
  };
  const handleUpdateConfirm = async () => {
    {
      try {
        const res = await activate(
          user?.factory,
          user?.user_code,
          selectRows[0]?.ac_no,
          selectRows[0]?.curr_rate || 1,
          language,
        );
        if (res && res.success) {
          try {
            const result = await confirmAll(
              user?.factory,
              user?.department,
              user?.user_code,
              authorization?.find((item) => item.field === "query_level")
                ?.title,
              selectRows[0]?.ac_no,
            );
            if (result && result.success) {
              await Promise.all([fetchADPByAcno(true), fetchAPDByAcno(true)]);
            }
          } catch (error) {
            console.log("error in fetch confirm all", error);
            showErrorToast(getControlLabel, "noti_fail_confirm", error.message);
          }
        }
      } catch (error) {
        console.log("error in activate", error);
        showErrorToast(getControlLabel, "noti_fail_confirm", error.message);
      }
    }
  };
  const handleExport = async () => {
    const allow = authorization.find(
      (item) => item.field === "query_level",
    )?.title;
    const excel = await exportExcelVwProcM(
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
      language,
      searchFilter,
    );
  };
  const handleFile = (e) => {
    const selectedFiled = e.target.files[0];
    if (selectedFiled) {
      setFile(selectedFiled);
    }
  };
  const handleCloseModifyLation = () => setOpenModifyLation(false);
  const handleSaveModifyLation = async (e) => {
    e.preventDefault();
    const col2 = e.target.col2.value;
    const {
      curr_name,
      sta_date,
      end_date,
      outer,
      in_set,
      out_name,
      intype_name,
      out_set,
      sort_name,
      grt_deptname,
      grt_username,
      last_username,
      ...newSaveData
    } = selectRows[0];

    await handleEditAPCM({ ...newSaveData, col2 });
    await handleCancel();
    handleCloseModifyLation();
  };
  const handlePageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentPage(newPage);
    setCurrentPageSize(newPageSize);
    setCurrentOffset(newOffset);
    if (isSearch && searchFilter) {
      await handleSearchByFilter(searchFilter, newPageSize, newOffset);
      return;
    }
    const allow = authorization.find(
      (item) => item.field === "query_level",
    )?.title;
    const responseData = await fetchAllAcProcM(
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
      language,
      newPageSize,
      newOffset,
    );
    setData([{ tableName: "AC_PROC_M", data: responseData.data || [] }]);
    setHasMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectRows([responseData.data[0]]);
    }
  };
  const handleAPDPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentAPDPage(newPage);
    setCurrentAPDPageSize(newPageSize);
    setCurrentAPDOffset(newOffset);
    await fetchAPDByAcno(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.ac_no) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
  };
  const handleADPPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentADPPage(newPage);
    setCurrentADPPageSize(newPageSize);
    setCurrentADPOffset(newOffset);
    await fetchADPByAcno(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.ac_no) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
  };
  const handleOpenImportLink = () => {
    setOpenImportLink(true);
  };
  const handleCloseImportLink = () => {
    setOpenImportLink(false);
  };
  const handleImportLink = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_220`, "_blank");
  };
  const handleImportLink1 = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_221`, "_blank");
  };
  const handleImportLink2 = () => {
    window.open(`${import.meta.env.VITE_LINK_IMP_URL}/actr_222`, "_blank");
  };
  //==========END HANDLER SECTION ================
  //========== LABEL TRANSLATION HANDLER ==============
  const getControlLabel = (fieldCode, fallback) => {
    if (!controlTranslations || controlTranslations.length === 0) {
      return fallback;
    }
    const translation = controlTranslations.find(
      (item) => item.field === fieldCode,
    );
    return translation?.title || fallback;
  };
  const getErrorControlLabel = (fieldCode, fallback) => {
    if (!errorControlTranslations || errorControlTranslations.length === 0) {
      return fallback;
    }
    const translation = errorControlTranslations.find(
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
  return (
    <>
      <Container maxWidth="xxl">
        <Stack direction="row" flexWrap="wrap" sx={{ rowGap: 1 }}>
          <Paper
            sx={{
              width: "100%",
              maxWidth: "100%",
              height: "100%",
              boxSizing: "border-box",
              overflow: "auto",
              overflowX: "auto",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                mt: 1,
                width: "100%",
              }}
            >
              {/* Bảng chính và AC_PROC_D - chiếm 60% */}
              <Box
                sx={{
                  flex: "0 0 60%",
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="h5"
                  textAlign={"center"}
                  fontWeight={"bold"}
                >
                  {/*  {getControlLabel("ttl_table_m", "AC_PROC_M")}*/}
                </Typography>
                <DataTable
                  data={data[0]?.data}
                  tableName={"AC_PROC_M"}
                  onAdd={handleOpenAdd}
                  onEdit={handleOpenEdit}
                  onSetFilter={onSetFilter}
                  filter={filter}
                  onSearch={handleSearchByFilter}
                  onSelectChange={handleSelectChoose}
                  selectRows={selectRows}
                  onDelete={(row) => {
                    handleModal(row);
                  }}
                  onDeleteAll={(row) => {
                    handleModal(row);
                  }}
                  onCancel={handleCancel}
                  onConfirm={handleConfirm}
                  onUnconfirm={handleUnconfirm}
                  onClose={handleClose}
                  onDetail={(row) => {
                    handleDetailModal(row);
                  }}
                  onCheck={handleCheck}
                  onPDF={handleExport}
                  onFile={handleFile}
                  file={file}
                  columnTranslations={columnTranslations}
                  controlTranslations={controlTranslations}
                  language={language}
                  getControlLabel={getControlLabel}
                  getColumnLabel={getColumnLabel}
                  jumpToRow={jumpToRow}
                  totalData={totalData || 0}
                  onPageChange={handlePageChange}
                  currentPage={currentPage}
                  currentPageSize={currentPageSize}
                  hasMore={hasMore}
                  isSearch={isSearch}
                  onImportLink={handleOpenImportLink}
                />
                <AcProcD
                  data={aPDData}
                  setData={setAPDData}
                  setSelectAPD={setSelectAPD}
                  selectAPD={selectAPD.length > 0 ? selectAPD : []}
                  setJumpToRow={setJumpToRowAPD}
                  jumpToRow={jumpToRowAPD}
                  selectRows={selectRows}
                  subAuthentication={authorization}
                  isSearch={isAPDSearch}
                  searchData={searchAPDData}
                  fetchDataByAcNo={fetchAPDByAcno}
                  fetchAPDRecordFromDB={fetchAPDRecordFromDB}
                  totalData={totalAPDData || 0}
                  onPageChange={handleAPDPageChange}
                  currentOffset={currentAPDOffset}
                  currentPage={currentAPDPage}
                  currentPageSize={currentAPDPageSize}
                  setCurrentPage={setCurrentAPDPage}
                  setCurrentOffset={setCurrentAPDOffset}
                  setCurrentPageSize={setCurrentAPDPageSize}
                  setTotalData={setTotalAPDData}
                  setSearchData={setSearchAPDData}
                  searchFilter={searchAPDFilter}
                  hasMore={hasAPDMore}
                  setHasMore={setHasAPDMore}
                />
              </Box>
              {/* AC_DESC_PROC - chiếm 30% */}
              <Box
                sx={{
                  flex: "0 0 40%",
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <AcDescProc
                  data={aDPData}
                  setData={setADPData}
                  setSelectADP={setSelectADP}
                  selectADP={selectADP.length > 0 ? selectADP : []}
                  setJumpToRow={setJumpToRowADP}
                  jumpToRow={jumpToRowADP}
                  selectRows={selectRows}
                  subAuthentication={authorization}
                  isSearch={isADPSearch}
                  searchData={searchADPData}
                  fetchDataByAcNo={fetchADPByAcno}
                  fetchADPRecordFromDB={fetchADPRecordFromDB}
                  totalData={totalADPData || 0}
                  onPageChange={handleADPPageChange}
                  currentOffset={currentADPOffset}
                  currentPage={currentADPPage}
                  currentPageSize={currentADPPageSize}
                  setCurrentPage={setCurrentADPPage}
                  setCurrentOffset={setCurrentADPOffset}
                  setCurrentPageSize={setCurrentADPPageSize}
                  setTotalData={setTotalADPData}
                  setSearchData={setSearchADPData}
                  searchFilter={searchADPFilter}
                  hasMore={hasADPMore}
                  setHasMore={setHasADPMore}
                />
                {/* <VwAcReqD
                  data={vwAcReqDData}/> */}
              </Box>
            </Box>
          </Paper>
        </Stack>
      </Container>
      {/* ========== MODAL/DIALOG COMPONENTS ========== */}
      <AddAcProcM
        open={openAdd}
        onClose={handleAddClose}
        handleAdd={handleAdd}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={authorization}
        language={language}
      />
      <EditAcProcM
        open={openEdit}
        onClose={handleEditClose}
        selectedRow={selectRows.length > 0 ? selectRows[0] : null}
        handleEdit={handleEditAPCM}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={authorization}
        isEditInCurrate={isEditInCurrate}
        language={language}
      />
      <ModifyLationPopup
        openLink={openModifyLation}
        onClose={handleCloseModifyLation}
        getControlLabel={getControlLabel}
        onSave={handleSaveModifyLation}
      />
      <ImportLinkPopup
        openLink={openImportLink}
        onClose={handleCloseImportLink}
        onImportLink={handleImportLink}
        onImportLink1={handleImportLink1}
        onImportLink2={handleImportLink2}
        getControlLabel={getControlLabel}
      />
    </>
  );
};
export default Actf220;
