import { useEffect, useRef, useState } from "react";
import DataTable from "../../component/table/DataTable";
import {
  Box,
  Container,
  Paper,
  Skeleton,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { fnQuery } from "../../utils/fnQuery";
import {
  exportExcelUser,
  importExcelUser,
} from "../../service/user/userService";

import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import { fetchTablePermission } from "../../service/users_permission/UsersPermission";
import {
  exportCustomExcel,
  exportMaterialExcel,
} from "../../service/ac_imp_material_tracking/AcImpMaterialTrackingService";
import AcProdM from "../../features/bom_2/component/AcProdM";
import {
  addAcShoeM,
  editAcShoeM,
  exportExcelASM,
  fetchAllAcShoeM,
  fetchAllAcShoeMByID,
  importExcel,
  linktoBom,
  searchASMByFilter,
} from "../../service/ac_shoe_m/AcShoeMService";
import AddAcShoeM from "../../features/bom_2/page/AddAcShoeM";
import AcShoeRef from "../../features/bom_2/component/AcShoeRef";
import EditAcShoeM from "../../features/bom_2/page/EditAcShoeM";
import {
  fetchAllAcProdMByID,
  fetchAllAcProdMByShoe,
  fetchAllConfirmedAcProdM,
  searchAPMByFilter,
} from "../../service/ac_prod_m/AcProdMService";
import {
  fetchRSDBySize,
  searchRSDByFilter,
} from "../../service/rd_size_d/RdSizeDService";
import {
  fetchAllAcShoeRefByID,
  fetchAllAcShoeRefByShoe,
  fetchAllConfirmedAcShoeRef,
} from "../../service/ac_shoe_ref/AcShoeRefService";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../utils/notification/Notification";
const AcShoeM = () => {
  const [data, setData] = useState([]);
  const [acProdMData, setAcProdMData] = useState([]);
  const [selectAcProdM, setSelectAcProdM] = useState([]);
  const [jumpToRowAcProdM, setJumpToRowAcProdM] = useState(null);
  const [acShoeRefData, setAcShoeRefData] = useState([]);
  const [selectAcShoeRef, setSelectAcShoeRef] = useState([]);
  const [jumpToRowAcShoeRef, setJumpToRowAcShoeRef] = useState(null);
  const [rdSizeDData, setRdSizeDData] = useState([]);
  const [selectRdSizeD, setSelectRdSizeD] = useState([]);
  const [openSizeLink, setOpenSizeLink] = useState(false);
  const [isLoadingBom, setIsLoadingBom] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [searchFilter, setSearchFilter] = useState(null);
  const [isAPMSearch, setIsAPMSearch] = useState(false);
  const [searchAPMData, setSearchAPMData] = useState([]);
  const [searchAPMFilter, setSearchAPMFilter] = useState(null);
  const [isASRSearch, setIsASRSearch] = useState(false);
  const [searchASRData, setSearchASRData] = useState([]);
  const [searchASRFilter, setSearchASRFilter] = useState(null);
  const [isRSDSearch, setIsRSDSearch] = useState(false);
  const [searchRSDData, setSearchRSDData] = useState([]);
  const [searchRSDFilter, setSearchRSDFilter] = useState(null);
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectRow, setSelectRow] = useState(null);
  const [selectRows, setSelectRows] = useState([]);
  const [authorization, setAuthorizations] = useState([]);
  const [filter, setFilter] = useState("");
  const [jumpToRow, setJumpToRow] = useState(null);
  const [totalData, setTotalData] = useState(0);
  const [totalAPMData, setTotalAPMData] = useState(0);
  const [totalASRData, setTotalASRData] = useState(0);
  const [totalRSDData, setTotalRSDData] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(5);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [currentAPMPage, setCurrentAPMPage] = useState(0);
  const [currentAPMPageSize, setCurrentAPMPageSize] = useState(10);
  const [currentAPMOffset, setCurrentAPMOffset] = useState(0);
  const [currentASRPage, setCurrentASRPage] = useState(0);
  const [currentASRPageSize, setCurrentASRPageSize] = useState(10);
  const [currentASROffset, setCurrentASROffset] = useState(0);
  const [currentRSDPage, setCurrentRSDPage] = useState(0);
  const [currentRSDPageSize, setCurrentRSDPageSize] = useState(10);
  const [currentRSDOffset, setCurrentRSDOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [hasAPMMore, setHasAPMMore] = useState(false);
  const [hasASRMore, setHasASRMore] = useState(false);
  const [hasRSDMore, setHasRSDMore] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [importFileName, setImportFileName] = useState("");
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
  //fetch all factory

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
        fetchAllAcShoeM(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          pageSize,
          offset,
        ),
    ]);
    setHasMore(combinedData[0]?.hasMore);
    setData([{ tableName: "AC_SHOE_M", data: combinedData[0].data }]);
    if (
      combinedData?.[0]?.total !== undefined &&
      combinedData?.[0]?.total !== null
    ) {
      setTotalData(combinedData?.[0]?.total);
    }
    if (combinedData?.[0]?.data?.length > 0) {
      setSelectRows([combinedData[0].data[0]]);
      setJumpToRow(combinedData[0].data[0]);
    }
  };
  //fetch all translation of factory
  const fetchAllTranslations = async () => {
    try {
      const columns = await fetchTableColumnTranslations(
        "ACTF_020",
        "master",
        "ac_shoe_m",
      );
      const controls = await fetchTableControlTranslations("ACTF_020");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user?.factory,
        user?.department,
        user?.user_code,
        "ACTF_0201",
      );
      const mergedControls = [...controls?.data, ...sysMessages?.data];
      if (mergedControls.length > 0) {
        setControlTranslations(mergedControls);
      }
      if (columns) setColumnTranslations(columns?.data);
      if (auth) setAuthorizations(auth?.data);
      return auth?.data || [];
    } catch (error) {
      console.error(" Error:", error);
      return [];
    }
  };
  const fetchAcProdMByShoe = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    try {
      if (!selectRows || selectRows.length === 0) {
        setAcProdMData([{ tableName: "AC_PROD_M", data: [] }]);
        setSelectAcProdM([]);
        return;
      }
      const offset = shouldResetPagination
        ? 0
        : explicitOffset !== null
          ? explicitOffset
          : currentAPMOffset;
      const pageSize =
        explicitPageSize !== null ? explicitPageSize : currentAPMPageSize;
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;

      const response = await fetchAllAcProdMByShoe(
        selectRows[0]?.factory_code,
        selectRows[0]?.customs_shoe_id,
        user.department,
        user.user_code,
        allow || "1",
        pageSize,
        offset,
      );
      if (response && response.data) {
        let childrenData = response.data;
        if (isSearch && searchData.length > 0) {
          const selectedParent = selectRows[0];
          if (response.total !== undefined && response.total !== null) {
            setTotalAPMData(response.total);
          }
          if (shouldResetPagination) {
            setCurrentAPMPage(0);
            setCurrentAPMOffset(0);
          }
          childrenData = response.data.filter((child) =>
            searchData.some(
              (searchItem) =>
                searchItem.factory_code === selectedParent.factory_code &&
                searchItem.customs_shoe_id === selectedParent.customs_shoe_id &&
                searchItem.prod_acno === child.prod_acno,
            ),
          );
        }

        setAcProdMData([{ tableName: "AC_PROD_M", data: childrenData }]);
        setHasAPMMore(response?.hasMore);
        // if (response.total !== undefined && response.total !== null) {
        //   setTotalAPMData(response.total);
        // }
        if (childrenData.length > 0) {
          setSelectAcProdM([childrenData[0]]);
        } else {
          setSelectAcProdM([]);
        }
      }
    } catch (error) {
      console.error(" Error fetching AC_PROD_M by shoe:", error);
      showErrorToast(getControlLabel, "noti_load_fail", `Failed to load data`);
    }
  };
  const fetchAcShoeRefByShoe = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    try {
      if (!selectRows || selectRows.length === 0) {
        setAcShoeRefData([{ tableName: "AC_SHOE_REF", data: [] }]);
        setSelectAcShoeRef([]);
        return;
      }
      const offset = shouldResetPagination
        ? 0
        : explicitOffset !== null
          ? explicitOffset
          : currentASROffset;
      const pageSize =
        explicitPageSize !== null ? explicitPageSize : currentASRPageSize;
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const response = await fetchAllAcShoeRefByShoe(
        selectRows[0]?.factory_code,
        selectRows[0]?.customs_shoe_id,
        user.department,
        user.user_code,
        allow || "1",
        pageSize,
        offset,
      );

      if (response && response.data) {
        let childrenData = response.data;
        if (isSearch && searchData.length > 0) {
          const selectedParent = selectRows[0];
          // if (response.total !== undefined && response.total !== null) {
          //   setTotalASRData(response.total);
          // }
          setHasASRMore(response?.hasMore || false);
          if (shouldResetPagination) {
            setCurrentASRPage(0);
            setCurrentASROffset(0);
          }
          childrenData = response.data.filter((child) =>
            searchData.some(
              (searchItem) =>
                searchItem.factory_code === selectedParent.factory_code &&
                searchItem.customs_shoe_id === selectedParent.customs_shoe_id &&
                searchItem.prod_acno === child.prod_no,
            ),
          );
        }
        setAcShoeRefData([{ tableName: "AC_SHOE_REF", data: childrenData }]);
        if (response.total !== undefined && response.total !== null) {
          setTotalASRData(response.total);
        }
        if (childrenData.length > 0) {
          setSelectAcShoeRef([childrenData[0]]);
        } else {
          setSelectAcShoeRef([]);
        }
      }
    } catch (error) {
      console.error(" Error fetching AC_PROD_M by shoe:", error);
      showErrorToast(getControlLabel, "noti_load_fail", `Failed to load data`);
    }
  };
  const fetchDataRSDBySize = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null,
  ) => {
    try {
      if (!selectRows || selectRows.length === 0) {
        setRdSizeDData([{ tableName: "RD_SIZE_D", data: [] }]);
        setSelectRdSizeD([]);
        return;
      }
      const offset = shouldResetPagination
        ? 0
        : explicitOffset !== null
          ? explicitOffset
          : currentRSDOffset;
      const pageSize =
        explicitPageSize !== null ? explicitPageSize : currentRSDPageSize;
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const response = await fetchRSDBySize(
        selectRows[0]?.factory_code,
        selectRows[0]?.size_type,
        user.department,
        user.user_code,
        allow || "1",
        pageSize,
        offset,
      );

      if (response && response.data) {
        let childrenData = response.data;
        if (isSearch && searchData.length > 0) {
          const selectedParent = selectRows[0];
          if (response.total !== undefined && response.total !== null) {
            setTotalRSDData(response.total);
          }
          if (shouldResetPagination) {
            setCurrentRSDPage(0);
            setCurrentRSDOffset(0);
          }
          childrenData = response.data.filter((child) =>
            searchData.some(
              (searchItem) =>
                searchItem.factory_code === selectedParent.factory_code &&
                searchItem.size_type === selectedParent.size_type &&
                searchItem.size_no === child.size_no,
            ),
          );
        }
        setRdSizeDData([{ tableName: "RD_SIZE_D", data: childrenData }]);
        setHasRSDMore(response.hasMore || false);
        setTotalRSDData(0);
        if (childrenData.length > 0) {
          setSelectRdSizeD([childrenData[0]]);
        } else {
          setSelectRdSizeD([]);
        }
      }
    } catch (error) {
      console.error(" Error fetching AC_PROD_M by shoe:", error);
      showErrorToast(getControlLabel, "noti_load_fail", `Failed to load data`);
    }
  };

  const fetchRecordFromDB = async (record) => {
    try {
      const response = await fetchAllAcShoeMByID(
        selectRows[0]?.factory_code,
        selectRows[0]?.customs_shoe_id,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };
  const fetchAcProdMRecordFromDB = async (record) => {
    try {
      const response = await fetchAllAcProdMByID(
        selectAcProdM[0]?.factory_code,
        selectAcProdM[0]?.customs_shoe_id,
        selectAcProdM[0]?.prod_acno,
      );
      return response?.data;
    } catch (error) {
      console.error(" Error fetching record:", error);
      return record;
    }
  };
  const fetchAcShoeRefRecordFromDB = async (record) => {
    try {
      const response = await fetchAllAcShoeRefByID(
        selectAcShoeRef[0]?.factory_code,
        selectAcShoeRef[0]?.customs_shoe_id,
        selectAcShoeRef[0]?.prod_no,
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
          const currentKey = `${currentSelection.factory_code}-${currentSelection.customs_shoe_id}`;
          const foundRecord = response.data.find(
            (item) =>
              `${item.factory_code}-${item.customs_shoe_id}` === currentKey,
          );

          if (foundRecord) {
            setSelectRows([foundRecord]);
            // setJumpToRow(foundRecord);
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

      const responseData = await fetchAllAcShoeM(
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        currentPageSize,
        currentOffset,
      );

      if (responseData && responseData.data) {
        setData([{ tableName: "AC_SHOE_M", data: responseData.data }]);
        setHasMore(responseData?.hasMore);
        if (currentSelection) {
          const currentKey = `${currentSelection.factory_code}-${currentSelection.customs_shoe_id}`;
          const updatedRecord = responseData.data.find(
            (item) =>
              `${item.factory_code}-${item.customs_shoe_id}` === currentKey,
          );

          if (updatedRecord) {
             setSelectRows([updatedRecord]);
             setJumpToRow(updatedRecord);
          } else if (responseData.data.length > 0) {
            setSelectRows([responseData.data[0]]);
            setJumpToRow(responseData.data[0]);
          }
        }
        else{
           setSelectRows([responseData.data[0]]);
           setJumpToRow(responseData.data[0]);
        }
      }
    }
  };
  //========== END FETCH DATA SECTION ================

  // ========== USEEFFECT SECTION ==========
  //  UseEffect #1: Language thay đổi - Fetch lại translations
  // - Chạy khi language (VN/EN/...) thay đổi
  // - Fetch column translations, control translations, và permissions
  // - Update UI labels theo ngôn ngữ mới
  useEffect(() => {
    fetchAllTranslations();
  }, [language]);
  //  UseEffect #2: Khởi tạo - Fetch tất cả factory
  // - Chạy 1 lần khi component mount
  // - Gọi fetchF() để load dữ liệu
  // - Select row đầu tiên nếu có data
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
  // 🔵 UseEffect #3: Jump to Row animation
  // - Chạy khi jumpToRow thay đổi
  // - Highlight hàng mới được thêm trong 500ms
  // - Reset jumpToRow sau đó để xóa highlight
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
  //handler row choose
  const handleSelectChoose = (rows) => {
    setSelectRows(rows);
  };

  //handler open edit popup
  const handleEditClose = async (data) => {
    try {
      if (selectRows.length === 1) {
        const record = data || selectRows[0];
        if (record?.locked_information === user?.clientInfo) {
          const unlockData = {
            ...record,
            locked_information: null,
          };
          await editAcShoeM(
            unlockData,
            currentPageSize,
            user?.factory,
            user?.department,
            user?.user_code,
            authorization?.find((item) => item.field === "query_level")?.title,
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
  //handler close edit popup
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
      const { FACTORY, statusText, ...clearData } = freshRecord;
      const lockData = {
        ...clearData,
        locked_information: user?.clientInfo,
      };

      await handleEditASM(lockData, "", true);
      setSelectRows([lockData]);
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
  //handler close add popup
  const handleAddClose = () => setOpenAdd(false);
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

  const handleSizeLink = () => {
    setOpenSizeLink(true);
  };
  const handleSizeLinkClose = () => {
    setOpenSizeLink(false);
  };
  const handleBom = async () => {
    if (selectRows[0]?.status !== 7) {
      showErrorToast(
        getControlLabel,
        "noti_fail_bom_link_1",
        "Only confirmed shoe can link to bom!",
      );
      return;
    }
    if (!selectAcShoeRef[0]) {
      showErrorToast(
        getControlLabel,
        "noti_fail_choose_ref",
        "Please choose ac shoe ref first!",
      );
      return;
    }
    setIsLoadingBom(true);

    try {
      const allow = Array.isArray(authorization)
        ? authorization.find((item) => item.field === "query_level")?.title
        : null;
      const ip = user?.clientInfo.split("-")[3];
      const datetime = new Date().toISOString();

      const response = await linktoBom(
        user?.factory,
        selectRows[0]?.customs_shoe_id,
        selectAcProdM[0]?.prod_acno,
        selectAcShoeRef[0]?.prod_no,
        user?.department,
        user?.user_code,
        allow,
        ip,
        datetime,
      );
      if (response && response?.success) {
        if (response?.data[0]?.title === null) {
          showSuccessToast(
            getControlLabel,
            "noti_success_bom_link",
            "Link to bom with {id} successfully!",
            {
              id: `${selectRows[0]?.customs_shoe_id}-${selectAcProdM[0]?.prod_acno}-${selectAcShoeRef[0]?.prod_no}`,
            },
            {
              toastId: `bom-success-${Date.now()}`,
              autoClose: 1000,
            },
          );
        } else {
          const errorMessage = response?.data?.[0]?.title || "Unknown error";
          showErrorToast(
            getControlLabel,
            "noti_fail_bom_link",
            "Cannot link because these id cannot map to basic data: {error}",
            { error: errorMessage },
            {
              toastId: `bom-error-${Date.now()}`,
              autoClose: 1000,
            },
          );
        }
      }
    } catch (error) {
      console.error("Error in handleBom:", error);
      showErrorToast(
        getControlLabel,
        "noti_fail_bom_link_2",
        "Failed to link to BOM!",
      );
    } finally {
      setIsLoadingBom(false);
    }
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
  //handler add import material tracking
  const handleAdd = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = Object.fromEntries(form.entries());
    data.factory_code = user.factory;
    data.grt_user = user.user_code;
    data.grt_date = new Date().toISOString();
    data.grt_dept = user.department;
    data.status = 1;
    try {
      const response = await addAcShoeM(
        user.access_token,
        data,
        currentPageSize,
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
      );
      if (response.success) {
        showSuccessToast(
          getControlLabel,
          "noti_success_add",
          `Add successfully with id ${data.customs_shoe_id}!`,
        );
        const allow = Array.isArray(authorization)
          ? authorization.find((item) => item.field === "query_level")?.title
          : null;
        const responseData = await fetchAllAcShoeM(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          response.size,
          response.offset,
        );
        setData([
          {
            tableName: "AC_SHOE_M",
            data: responseData.data || [],
          },
        ]);
        setHasMore(responseData?.hasMore);
        setSelectRows([response.data]);
        setJumpToRow(response.data);
        setCurrentPage(response?.page);
        setCurrentPageSize(response.size);
        setCurrentOffset(response.offset);
        setIsSearch(false);
        setSearchFilter(null);
        setTotalData((prevTotal) => prevTotal + 1);
        handleAddClose();
      } else {
        showErrorToast(
          getControlLabel,
          "noti_fail_duplicate_add",
          "Cannot add duplicate id!",
        );
        handleAddClose();
      }
    } catch (error) {
      showErrorToast(getControlLabel, "noti_fail_add_1", `Failed to add`);
    }
  };
  const handleEditASM = async (updateRow, title, skipTimestamp = false) => {
    try {
      const { statusText, ...cleanData } = updateRow;
      if (!skipTimestamp) {
        cleanData.last_user = user.user_code;
        cleanData.last_date = new Date().toISOString();
      }
      const result = await editAcShoeM(
        cleanData,
        currentPageSize,
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
      );
      if (result.success) {
        const successMessage =
          typeof title === "string" && title
            ? title
            : `Edit bom with code(${cleanData.customs_shoe_id}) successfully !!!`;
        if (!skipTimestamp) {
          showSuccessToast(
            getControlLabel,
            "noti_success_edit",
            successMessage,
          );
        }
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
            await editAcShoeM(
              unlockData,
              currentPageSize,
              user?.factory,
              user?.department,
              user?.user_code,
              authorization?.find((item) => item.field === "query_level")
                ?.title,
            );
          }

          //  Refresh với current page/offset
          await refreshCurrentData();
        } else {
          //  Không search - dùng resultPage/resultOffset từ backend
          const resultPage =
            result.size !== undefined
              ? Math.floor(result.position / result.size)
              : currentPage;
          const resultOffset =
            result.offset !== undefined ? result.offset : currentOffset;

          if (resultPage !== currentPage) {
            // Record chuyển page
            const allow = Array.isArray(authorization)
              ? authorization.find((item) => item.field === "query_level")
                  ?.title
              : null;

            const responseData = await fetchAllAcShoeM(
              user?.factory,
              user?.department,
              user?.user_code,
              allow || "1",
              currentPageSize,
              resultOffset,
            );
            setHasMore(responseData?.hasMore);
            if (responseData && responseData.data) {
              setData([
                {
                  tableName: "AC_SHOE_M",
                  data: responseData.data,
                },
              ]);
              setCurrentPage(resultPage);
              setCurrentOffset(resultOffset);

              const editedRecord = responseData.data.find(
                (item) =>
                  `${item.factory_code}-${item.customs_shoe_id}` ===
                  `${cleanData.factory_code}-${cleanData.customs_shoe_id}`,
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
              await editAcShoeM(
                unlockData,
                currentPageSize,
                user?.factory,
                user?.department,
                user?.user_code,
                authorization?.find((item) => item.field === "query_level")
                  ?.title,
              );
            }

            //  Refresh với current page/offset
            await refreshCurrentData();
          }
        }
        if (!skipTimestamp) {
          handleEditClose(data);
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
    }
  };
  const handleUpdateConfirm = async () => {
    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;

    try {
      // Auto-confirm AC_PROD_M và AC_SHOE_REF
      // Filter searchData để lấy riêng AC_PROD_M
      const acProdMList =
        isSearch && searchData.length > 0
          ? searchData.filter((item) => item.prod_acno) // AC_PROD_M có prod_acno
          : [];

      await fetchAllConfirmedAcProdM(
        user?.factory,
        selectRows[0]?.customs_shoe_id,
        user?.department,
        user?.user_code,
        allow,
        acProdMList,
      );

      //  AC_SHOE_REF luôn confirm tất cả (không filter theo search)
      await fetchAllConfirmedAcShoeRef(
        user?.factory,
        selectRows[0]?.customs_shoe_id,
        user?.department,
        user?.user_code,
        allow,
        [], // Truyền [] để backend confirm tất cả AC_SHOE_REF của shoe này
      );

      //  Fetch lại data của 2 bảng con
      const acProdMResponse = await fetchAllAcProdMByShoe(
        selectRows[0]?.factory_code,
        selectRows[0]?.customs_shoe_id,
        user.department,
        user.user_code,
        allow,
        currentAPMPageSize,
        currentAPMOffset,
      );
      const acShoeRefResponse = await fetchAllAcShoeRefByShoe(
        selectRows[0]?.factory_code,
        selectRows[0]?.customs_shoe_id,
        user.department,
        user.user_code,
        allow,
        currentASRPageSize,
        currentASROffset,
      );

      //  Nếu đang search, merge vào searchData
      if (isSearch && searchData.length > 0) {
        const selectedParent = selectRows[0];

        // Filter AC_PROD_M theo searchData
        const filteredAcProdM =
          acProdMResponse?.data?.filter((item) =>
            searchData.some(
              (search) =>
                search.factory_code === item.factory_code &&
                search.customs_shoe_id === item.customs_shoe_id &&
                search.prod_acno === item.prod_acno,
            ),
          ) || [];

        // Filter AC_SHOE_REF theo searchData
        const filteredAcShoeRef =
          acShoeRefResponse?.data?.filter((item) =>
            searchData.some(
              (search) =>
                search.factory_code === item.factory_code &&
                search.customs_shoe_id === item.customs_shoe_id &&
                search.prod_no === item.prod_no,
            ),
          ) || [];

        //  ĐÚNG - Merge vào searchData, không replace
        setSearchData((prevSearchData) => {
          // Xóa data cũ của cha này
          const otherParentsData = prevSearchData.filter(
            (item) =>
              !(
                item.factory_code === selectedParent.factory_code &&
                item.customs_shoe_id === selectedParent.customs_shoe_id
              ),
          );
          // Merge AC_PROD_M và AC_SHOE_REF mới
          return [
            ...otherParentsData,
            ...filteredAcProdM,
            ...filteredAcShoeRef,
          ];
        });

        // Update AC_PROD_M
        setAcProdMData([{ tableName: "AC_PROD_M", data: filteredAcProdM }]);
        if (filteredAcProdM.length > 0) {
          const currentItem = selectAcProdM[0];
          const matchedItem = filteredAcProdM.find(
            (item) =>
              item.factory_code === currentItem?.factory_code &&
              item.customs_shoe_id === currentItem?.customs_shoe_id &&
              item.prod_acno === currentItem?.prod_acno,
          );
          const itemToSelect = matchedItem || filteredAcProdM[0];
          setSelectAcProdM([itemToSelect]);
          setJumpToRowAcProdM(itemToSelect);
        } else {
          setSelectAcProdM([]);
        }

        // Update AC_SHOE_REF
        setAcShoeRefData([
          { tableName: "AC_SHOE_REF", data: filteredAcShoeRef },
        ]);
        if (filteredAcShoeRef.length > 0) {
          const currentItem = selectAcShoeRef[0];
          const matchedItem = filteredAcShoeRef.find(
            (item) =>
              item.factory_code === currentItem?.factory_code &&
              item.customs_shoe_id === currentItem?.customs_shoe_id &&
              item.prod_no === currentItem?.prod_no,
          );
          const itemToSelect = matchedItem || filteredAcShoeRef[0];
          setSelectAcShoeRef([itemToSelect]);
          setJumpToRowAcShoeRef(itemToSelect);
        } else {
          setSelectAcShoeRef([]);
        }
      } else {
        // Không search - update bình thường
        // Update AC_PROD_M
        if (acProdMResponse && acProdMResponse.data) {
          setAcProdMData([
            { tableName: "AC_PROD_M", data: acProdMResponse.data },
          ]);

          if (acProdMResponse.data.length > 0) {
            const currentItem = selectAcProdM[0];
            const matchedItem = acProdMResponse.data.find(
              (item) =>
                item.factory_code === currentItem?.factory_code &&
                item.customs_shoe_id === currentItem?.customs_shoe_id &&
                item.prod_acno === currentItem?.prod_acno,
            );
            const itemToSelect = matchedItem || acProdMResponse.data[0];
            setSelectAcProdM([itemToSelect]);
            setJumpToRowAcProdM(itemToSelect);
          } else {
            setSelectAcProdM([]);
          }
        }

        // Update AC_SHOE_REF
        if (acShoeRefResponse && acShoeRefResponse.data) {
          setAcShoeRefData([
            { tableName: "AC_SHOE_REF", data: acShoeRefResponse.data },
          ]);

          if (acShoeRefResponse.data.length > 0) {
            const currentItem = selectAcShoeRef[0];
            const matchedItem = acShoeRefResponse.data.find(
              (item) =>
                item.factory_code === currentItem?.factory_code &&
                item.customs_shoe_id === currentItem?.customs_shoe_id &&
                item.prod_no === currentItem?.prod_no,
            );
            const itemToSelect = matchedItem || acShoeRefResponse.data[0];
            setSelectAcShoeRef([itemToSelect]);
            setJumpToRowAcShoeRef(itemToSelect);
          } else {
            setSelectAcShoeRef([]);
          }
        }
      }
    } catch (error) {
      console.error(" Error in handleUpdateConfirm:", error);
      showErrorToast(
        getControlLabel,
        "noti_fail_confirm_all",
        "Failed to auto-confirm child!",
      );
    }
  };
  //handler search by filter
  const handleSearchByFilter = async (
    filteredShoe,
    pageSize = 5,
    offset = 0,
  ) => {
    try {
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;
      if (offset === 0) {
        setCurrentPage(0);
        setCurrentPageSize(pageSize);
        setCurrentOffset(0);
      }
      const search = filteredShoe.search || {};
      const keys = Object.keys(search);
      if (keys.length === 0) {
        setSelectRows([]);
        setIsSearch(false);
        setCurrentOffset(0);
        setCurrentPage(0);
        setCurrentPageSize(0);
        setTotalData(0);
        setData([{ tableName: "AC_SHOE_M", data: [] }]);
        await fetchAll();
        return;
      }
      setIsSearch(true);
      setSearchFilter(filteredShoe);
      const isNewFilter =
        JSON.stringify(filteredShoe) !== JSON.stringify(searchFilter);
      const actualOffset = isNewFilter ? 0 : (offset ?? currentOffset);
      const response = await searchASMByFilter(
        filteredShoe,
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        pageSize,
        actualOffset,
      );

      if (response && response.data) {
        if (response.data.length === 0) {
          setSelectRows([]);
          setCurrentOffset(0);
          setCurrentPage(0);
          setCurrentPageSize(pageSize);
          setHasMore(false);
          setTotalData(0);
          setData([{ tableName: "AC_SHOE_M", data: response.data }]);
        } else {
          setSelectRows([response.data[0]]);
          if (offset === 0 && response.data.length > 0) {
            setTotalData(response.total);
          }
          setData([{ tableName: "AC_SHOE_M", data: response.data }]);
        }
      }
    } catch (error) {
      console.log("cannot search because", error);
    }
  };
  const handleSearchForAcProdM = async (
    filteredShoe,
    pageSize = 10,
    offset = 0,
  ) => {
    try {
      const search = filteredShoe?.search || {};
      const keys = Object.keys(search);
      if (keys.length === 0) {
        setIsAPMSearch(false);
        setSearchAPMData([]);
        setSearchAPMFilter(null);
        setTotalAPMData(0);
        await fetchAcProdMByShoe(true, 0, 10);
        return;
      }
      if (offset === 0) {
        setCurrentAPMPage(0);
        setCurrentAPMPageSize(pageSize);
        setCurrentAPMOffset(0);
      }
      setIsAPMSearch(true);
      setSearchAPMFilter(filteredShoe);
      const isNewFilter =
        JSON.stringify(filteredShoe) !== JSON.stringify(searchAPMFilter);
      const actualAPMOffset = isNewFilter ? 0 : (offset ?? currentAPMOffset);
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;
      const response = await searchAPMByFilter(
        filteredShoe,
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        pageSize,
        actualAPMOffset,
      );
      if (response && response.data) {
        if (response.data.length === 0) {
          setSelectAcProdM([]);
          setCurrentAPMOffset(0);
          setCurrentAPMPage(0);
          setCurrentAPMPageSize(pageSize);
          setTotalAPMData(0);
          setHasAPMMore(false);
          setAcProdMData([{ tableName: "AC_PROD_M", data: response.data }]);
        } else {
          setSelectAcProdM([response.data[0]]);
          if (offset === 0 && response.data.length > 0) {
            setTotalAPMData(response.total);
          }
          setAcProdMData([{ tableName: "AC_PROD_M", data: response.data }]);
        }
      }
    } catch (error) {
      console.log("Cannot search because:", error);
    }
  };
  const hanldeSearchForRDSizeD = async (
    filteredShoe,
    pageSize = 10,
    offset = 0,
  ) => {
    try {
      const search = filteredShoe?.search || {};
      const keys = Object.keys(search);

      if (keys.length === 0) {
        setIsRSDSearch(false);
        setSearchRSDData([]);
        setSearchRSDFilter(null);
        await fetchDataRSDBySize(true, 0, 10);
        return;
      }
      if (offset === 0) {
        setCurrentRSDPage(0);
        setCurrentRSDPageSize(pageSize);
        setCurrentRSDOffset(0);
      }
      setIsRSDSearch(true);
      setSearchRSDFilter(filteredShoe);
      const isNewFilter =
        JSON.stringify(filteredShoe) !== JSON.stringify(searchRSDFilter);
      const actualRSDOffset = isNewFilter ? 0 : (offset ?? currentRSDOffset);
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;
      const response = await searchRSDByFilter(
        filteredShoe,
        user.factory,
        user.department,
        user.user_code,
        allow || "1",
        pageSize,
        actualRSDOffset,
      );
      if (response && response.data) {
        if (response.data.length === 0) {
          setSelectRdSizeD([]);
          setCurrentRSDOffset(0);
          setCurrentRSDPage(0);
          setCurrentRSDPageSize(pageSize);
          setTotalRSDData(0);
          setAcProdMData([{ tableName: "RD_SIZE_D", data: response.data }]);
        } else {
          setSelectRdSizeD([response.data[0]]);
          if (response?.total !== null) {
            setTotalRSDData(response.total);
          }
          setRdSizeDData([{ tableName: "RD_SIZE_D", data: response.data }]);
        }
      }
    } catch (error) {
      console.log(" Cannot search because:", error);
    }
  };

  //handler cancel
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
      const { FACTORY, ...clearData } = freshRecord;
      const updateData = {
        ...clearData,
        status: newStatus,
        last_user: user.user_code,
        last_date: new Date().toISOString(),
      };

      const response = await editAcShoeM(
        updateData,
        currentPageSize,
        user?.factory,
        user?.department,
        user?.user_code,
        authorization?.find((item) => item.field === "query_level")?.title,
      );

      if (response.success) {
        showSuccessToast(getControlLabel, `noti_success_${actionName}`);
        await refreshCurrentData();
      }
      if (actionName === "confirm") {
        await handleUpdateConfirm();

        setTimeout(() => {
          setData((prevData) => {
            if (prevData?.[0]?.data?.length > 0) {
              const updatedRow = prevData[0].data.find(
                (item) =>
                  `${item.factory_code}-${item.customs_shoe_id}` ===
                  `${updateData.factory_code}-${updateData.customs_shoe_id}`,
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

  const handleCheck = () => {
    handleStatusChange(2, "check", [1]);
  };
  //handler import Excel
  const handleImport = async (file) => {
    if (!file) return;

    setImportFileName(file.name);
    const form = new FormData();
    form.append("import_file", file);
    try {
      const result = await importExcel(
        user.access_token,
        user?.factory_code,
        user?.user_code,
        user?.department_code,
        authorization?.find((item) => item.field === "query_level")?.title,
        form,
      );

      if (result) {
        if (result?.invalidRows && result?.invalidRows.length > 0) {
          const failedItems = result.invalidRows
            .map((item) => `${item.row}`)
            .join(", ");
          showWarningToast(
            getControlLabel,
            "noti_warning_import",
            "Rows ({items}) already exist in the system!",
            { items: failedItems },
            { autoClose: 5000 },
          );
        }
        if (result?.success) {
          await showSuccessToast(
            getControlLabel,
            "noti_success_import",
            "Import successfully!",
          );
          await refreshCurrentData();
        }
      }
    } catch (error) {
      if (error.message.includes("ERR_UPLOAD_FILE_CHANGED")) {
        toast.error("Please choose again !");
        setFile("");
      }
    }
  };
  //handler export Excel
  const handleExport = async () => {
    const excel = await exportExcelUser(user.access_token);
  };
  const handleCustomExport = async () => {
    const exportFile = {
      factory_code: user?.factory,
      invoice_no: selectRows[0]?.invoice_no,
    };
    const customExcel = await exportCustomExcel(exportFile);
  };
  const handleMaterialExport = async () => {
    const exportFile = {
      factory_code: user?.factory,
      invoice_no: selectRows[0]?.invoice_no,
    };
    const materialExcel = await exportMaterialExcel(exportFile);
  };
  //handler export PDF
  const handlePDF = async () => {
    const allow = Array.isArray(authorization)
      ? authorization.find((item) => item.field === "query_level")?.title
      : null;
    await exportExcelASM(
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
    );
  };
  //handler send file image
  const handleFile = (e) => {
    const selectedFiled = e.target.files[0];
    if (selectedFiled) {
      setFile(selectedFiled);
    }
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
    const responseData = await fetchAllAcShoeM(
      user?.factory,
      user?.department,
      user?.user_code,
      authorization?.find((item) => item.field === "query_level")?.title,
      newPageSize,
      newOffset,
    );

    setData([{ tableName: "AC_SHOE_M", data: responseData.data || [] }]);
    setHasMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectRows([responseData.data[0]]);
    }
  };
  const handleAPMPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;

    setCurrentAPMPage(newPage);
    setCurrentAPMPageSize(newPageSize);
    setCurrentAPMOffset(newOffset);

    if (isAPMSearch && searchAPMFilter) {
      await handleSearchForAcProdM(searchAPMFilter, newPageSize, newOffset);
      return;
    }

    await fetchAcProdMByShoe(false, newOffset, newPageSize);

    if (!selectRows.length || !selectRows[0]?.customs_shoe_id) {
      return;
    }
  };
  const handleASRPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentASRPage(newPage);
    setCurrentASRPageSize(newPageSize);
    setCurrentASROffset(newOffset);

    await fetchAcShoeRefByShoe(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.customs_shoe_id) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
  };
  const handleRSDPageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentRSDPage(newPage);
    setCurrentRSDPageSize(newPageSize);
    setCurrentRSDOffset(newOffset);

    if (isRSDSearch && searchRSDData) {
      await hanldeSearchForRDSizeD(searchRSDFilter, newPageSize, newOffset);
      return;
    }
    await fetchDataRSDBySize(false, newOffset, newPageSize);
    if (!selectRows.length || !selectRows[0]?.customs_shoe_id) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
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
  const getErrorControlLabel = (fieldCode, fallback) => {
    if (!errorControlTranslations || errorControlTranslations.length === 0) {
      return fallback;
    }
    const translation = errorControlTranslations.find(
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
  //========== END LABEL TRANSLATION HANDLER ==============
  //set width base on screen size
  let columns = 1;
  if (isLgUp) columns = 3;
  else if (isMdUp) columns = 2;
  else if (isSmUp) columns = 1;
  else columns = 1;
  const itemWidth =
    data.length > 0 ? `${100 / data.length}%` : `${100 / columns}%`;
  return (
    <>
      {/* ========== MAIN CONTENT AREA ========== */}
      <Box>
        <Container maxWidth="xxl">
          <Stack direction="row" flexWrap="wrap" sx={{ rowGap: 1 }}>
            <Paper
              sx={{
                width: "100%",
                maxWidth: "100%",
                height: "100%",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                }}
              >
                {/* Bảng chính - chiếm 60% */}
                <Box
                  sx={{
                    flex: "0 0 70%",
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <DataTable
                    data={data[0]?.data}
                    tableName={"AC_SHOE_M"}
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
                    onImport={handleImport}
                    onExport={handleExport}
                    onCheck={handleCheck}
                    onCustomExport={handleCustomExport}
                    onMaterialExport={handleMaterialExport}
                    onPDF={handlePDF}
                    onBom={handleBom}
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
                    isLoadingBom={isLoadingBom}
                    hasMore={hasMore}
                    setHasMore={setHasMore}
                    isSearch={isSearch}
                    file={file}
                    onFile={handleFile}
                    fileInputRef={fileInputRef}
                    importFileName={importFileName}
                    setImportFileName={setImportFileName}
                  />
                  <AcProdM
                    data={acProdMData}
                    setData={setAcProdMData}
                    setSelectAcProdM={setSelectAcProdM}
                    selectAcProdM={
                      selectAcProdM.length > 0 ? selectAcProdM : []
                    }
                    setJumpToRow={setJumpToRowAcProdM}
                    jumpToRow={jumpToRowAcProdM}
                    handleSearchByAcProdM={handleSearchForAcProdM}
                    selectRows={selectRows}
                    subAuthentication={authorization}
                    isSearch={isAPMSearch}
                    setIsSearch={setIsAPMSearch}
                    searchData={searchAPMData}
                    fetchDataByShoe={fetchAcProdMByShoe}
                    rdSizeDData={rdSizeDData}
                    setRdSizeDData={setRdSizeDData}
                    selectRdSizeD={selectRdSizeD}
                    setSelectRdSizeD={setSelectRdSizeD}
                    hanldeSearchForRDSizeD={hanldeSearchForRDSizeD}
                    openSizeLink={openSizeLink}
                    setOpenSizeLink={setOpenSizeLink}
                    onOpenSizeLink={handleSizeLink}
                    onCloseSizeLink={handleSizeLinkClose}
                    onDataRSDBySize={fetchDataRSDBySize}
                    fetchAcProdMRecordFromDB={fetchAcProdMRecordFromDB}
                    totalData={totalAPMData || 0}
                    onPageChange={handleAPMPageChange}
                    currentOffset={currentAPMOffset}
                    currentPage={currentAPMPage}
                    currentPageSize={currentAPMPageSize}
                    setCurrentPage={setCurrentAPMPage}
                    setCurrentOffset={setCurrentAPMOffset}
                    setCurrentPageSize={setCurrentAPMPageSize}
                    setTotalData={setTotalAPMData}
                    setSearchData={setSearchAPMData}
                    searchFilter={searchAPMFilter}
                    totalRSDData={totalRSDData || 0}
                    onRSDPageChange={handleRSDPageChange}
                    currentRSDOffset={currentRSDOffset}
                    currentRSDPage={currentRSDPage}
                    currentRSDPageSize={currentRSDPageSize}
                    setCurrentRSDPage={setCurrentRSDPage}
                    setCurrentRSDOffset={setCurrentRSDOffset}
                    setCurrentRSDPageSize={setCurrentRSDPageSize}
                    setTotalRSDData={setTotalRSDData}
                    setRSDSearchData={setSearchRSDData}
                    searchRSDFilter={searchRSDFilter}
                    hasMore={hasAPMMore}
                    setHasMore={setHasAPMMore}
                    hasRSDMore={hasRSDMore}
                    setHasRSDMore={setHasRSDMore}
                    isRSDSearch={isRSDSearch}
                  />
                </Box>
                <Box
                  sx={{
                    flex: "0 0 30%",
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <AcShoeRef
                    selectRows={selectRows}
                    data={acShoeRefData}
                    setData={setAcShoeRefData}
                    setSelectAcShoeRef={setSelectAcShoeRef}
                    selectAcShoeRef={selectAcShoeRef}
                    subAuthentication={authorization}
                    isSearch={isASRSearch}
                    searchData={searchASRData}
                    fetchDataByShoe={fetchAcShoeRefByShoe}
                    fetchAcShoeRefRecordFromDB={fetchAcShoeRefRecordFromDB}
                    jumpToRow={jumpToRowAcShoeRef}
                    setJumpToRow={setJumpToRowAcShoeRef}
                    totalData={totalASRData || 0}
                    onPageChange={handleASRPageChange}
                    currentOffset={currentASROffset}
                    currentPage={currentASRPage}
                    currentPageSize={currentASRPageSize}
                    setCurrentPage={setCurrentASRPage}
                    setCurrentOffset={setCurrentASROffset}
                    setCurrentPageSize={setCurrentASRPageSize}
                    setTotalData={setTotalASRData}
                    setSearchData={setSearchASRData}
                    searchFilter={searchASRFilter}
                    hasMore={hasASRMore}
                    setHasMore={setHasASRMore}
                  />
                </Box>
              </Box>
            </Paper>
          </Stack>
        </Container>
      </Box>
      {/* ========== MODAL/DIALOG COMPONENTS ========== */}

      {/*  Add Factory Modal */}
      {/* - Mở khi user click "Add" button */}
      {/* - Gọi handleAdd khi submit form */}
      <AddAcShoeM
        open={openAdd}
        onClose={handleAddClose}
        handleAdd={handleAdd}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={authorization}
        language={language}
      />
      {/*  Edit Factory Modal */}
      {/* - Mở khi user click "edit" button */}
      {/* - Gọi handleEditASM khi submit form */}
      <EditAcShoeM
        open={openEdit}
        onClose={handleEditClose}
        acShoeM={selectRows.length > 0 ? selectRows[0] : null}
        handleEdit={handleEditASM}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={authorization}
        language={language}
      />
    </>
  );
};
export default AcShoeM;
