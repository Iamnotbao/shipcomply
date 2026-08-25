import { useEffect, useState } from "react";
import DataTable from "../../../component/table/DataTable";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  useMediaQuery,
  useTheme,
  Typography,
} from "@mui/material";

import { toast } from "react-toastify";
import { fnQuery } from "../../../utils/fnQuery";
import AddBasicDataCategory from "./AddAcItemRef";
import EditBasicDataCategory from "./EditAcItemRef";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import useAuth from "../../../hooks/useAuth";
import CloseIcon from "@mui/icons-material/Close";
import {
  addBasicData,
  editBasicData,
  fetchBasicDataByCate,
} from "../../../service/basic_data/basicDataService";
import {
  fetchDataByItemAcno,
  searchAcItemRefByFilter,
} from "../../../service/ac_item_ref/AcItemRefService";
import { exportExcelAcItemM } from "../../../service/ac_item_m/AcItemMService";
const AcItemMLink = ({
  openLink = false,
  onClose,
  selectRows,
  subAuthentication = [],
  selectedItemRefs,
  groupDetailsByMaster,
}) => {
  const [data, setData] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const theme = useTheme();
  const [selectPermission, setSelectPermission] = useState([]);
  const [openDetail, setOpenDetail] = useState(false);
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [jumpToRow, setJumpToRow] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const [searchData, setSearchData] = useState({});
  const [searchFilter, setSearchFilter] = useState(null);
  const {
    fetchTableControlTranslations,
    fetchTableColumnTranslations,
    language,
  } = useColumnTranslation();
  const { user } = useAuth();
const fetchDataByIAcno = async (
    shouldResetPagination = false,
    explicitOffset = null,
    explicitPageSize = null
  ) => {
    const allow = Array.isArray(subAuthentication)
      ? subAuthentication.find((item) => item.field === "query_level")?.title
      : null;
    const offset = shouldResetPagination
      ? 0
      : explicitOffset !== null
      ? explicitOffset
      : currentOffset;
    const pageSize =
      explicitPageSize !== null ? explicitPageSize : currentPageSize;
    const response = await fetchDataByItemAcno(
      selectRows[0]?.factory_code,
      selectRows[0]?.item_acno,
      user.department,
      user.user_code,
      allow,
      pageSize,
      offset
    );
    if (response && response.data) {
      let childrenData = response.data;
      if (isSearch && searchData.length > 0) {
        const selectedParent = selectRows[0];
        if (response.total !== undefined && response.total !== null) {
          setTotalData(response.total);
        }
        if (shouldResetPagination) {
          setCurrentPage(0);
          setCurrentOffset(0);
        }
        childrenData = response.data.filter((child) =>
          searchData.some(
            (searchItem) =>
              searchItem.factory_code === selectedParent.factory_code &&
              searchItem.item_acno === selectedParent.item_acno &&
              searchItem.item_no === child.item_no
          )
        );
      }
      setData([{ tableName: "AC_ITEM_REF", data: childrenData }]);
      if (response.total !== undefined && response.total !== null) {
        setTotalData(response.total);
      }
      if (childrenData.length > 0) {
        setSelectPermission([childrenData[0]]);
      } else {
        setSelectPermission([]);
      }
    }
  };
  const fetchAllTranslations = async () => {
    try {
      const [columns, controls, auth] = await fnQuery([
        () =>
          fetchTableColumnTranslations(
            "ACTF_020",
            "detail",
            "ac_item_m",
            "AC_ITEM_REF"
          ),
        () => fetchTableControlTranslations("ACTF_020"),
      ]);
      // combinedData[0] = column translations
      // combinedData[1] = control translations
      if (columns) {
        setColumnTranslations(columns?.data);
      }
      if (controls) {
        setControlTranslations(controls?.data);
      }
      console.log("all column",columns);
      
    } catch (error) {
      console.error(" Error fetching translations:", error);
    }
  };

  useEffect(() => {
    fetchAllTranslations();
  },[openLink]);
  useEffect(() => {
    const handleDataFetch = async () => {
      // Kiểm tra có selectRows hợp lệ không
      if (
        !selectRows ||
        selectRows.length === 0 ||
        !selectRows[0]?.factory_code ||
        !selectRows[0]?.item_acno
      ) {
        console.log("[AcItemRef] No valid parent selected");
        setData([{ tableName: "AC_ITEM_REF", data: [] }]);
        setSelectPermission([]);
        return;
      }

      const selectedParentRow = selectRows[0];
      console.log("🔵 [AcItemRef] Processing for parent:", {
        factory: selectedParentRow.factory_code,
        item_acno: selectedParentRow.item_acno,
        isSearch,
        searchDataLength: searchData.length,
      });

      //  KIỂM TRA: Nếu đang search, KHÔNG GỌI API
      if (isSearch && searchData.length > 0) {
        console.log(
          "🔍 [AcItemRef] Search mode: Skip API, filter from searchData"
        );

        //  Lọc details từ searchData
        const masterDetails = searchData.filter(
          (detail) =>
            detail.factory_code === selectedParentRow.factory_code &&
            detail.item_acno === selectedParentRow.item_acno
        );

        console.log(`📄 Found ${masterDetails.length} details in searchData`);

        //  Phân trang
        const detailPageSize = currentPageSize || 10;
        const paginatedDetails = masterDetails.slice(0, detailPageSize);

        setData([{ tableName: "AC_ITEM_REF", data: paginatedDetails }]);
        setTotalData(masterDetails.length);
        setCurrentPage(0);
        setCurrentOffset(0);

        if (paginatedDetails.length > 0) {
          setSelectPermission([paginatedDetails[0]]);
          setJumpToRow(paginatedDetails[0]);
        } else {
          setSelectPermission([]);
          setJumpToRow(null);
        }

        return; //  DỪNG TẠI ĐÂY, không chạy fetchDataByIAcno
      }

      //  Không search - gọi API như bình thường
      console.log("⚪ [AcItemRef] Normal mode: Call fetchDataByIAcno API");
      await fetchDataByIAcno();
    };

    handleDataFetch();
  }, [
    selectRows?.[0]?.factory_code,
    selectRows?.[0]?.item_acno,
    isSearch,
    searchData.length,
    openLink,
  ]);

  useEffect(() => {
    if (jumpToRow) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow]);

  const handleSelectChoose = (rows) => {
    setSelectPermission(rows);
  };
  const handlePDF = async () => {
    if (selectedItemRefs.length === 0) {
      toast.warning("Please select items to export!");
      return;
    }

    try {
      const cleanedData = selectedItemRefs.map(
        ({ statusText, ...cleanItem }) => {
          return cleanItem;
        }
      );
      await exportExcelAcItemM(cleanedData);
      toast.success("Export successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export failed!");
    }
  };

  const handleSearch = async (newFilter, pageSize = 10, offset = 0) => {
    try {
      const allow = Array.isArray(subAuthentication)
        ? subAuthentication.find((item) => item.field === "query_level")?.title
        : null;

      if (offset === 0) {
        setCurrentPage(0);
        setCurrentPageSize(10);
        setCurrentOffset(0);
      }

      const filter = {
        ...newFilter,
        search: {
          ...newFilter.search,
          item_acno: selectRows[0]?.item_acno,
          factory_code: selectRows[0]?.factory_code,
        },
      };

      const response = await searchAcItemRefByFilter(
        filter,
        user.factory,
        user.department,
        user.user_code,
        allow,
        pageSize,
        offset
      );
      setIsSearch(true);
      setSearchData(response.data);
      if (response && response.data && response.data.length > 0) {
        const grouped = groupDetailsByMaster(response.data);
        const firstMaster = grouped[0];
        const firstMasterAllDetails = firstMaster.details;
        const detailPageSize = currentPageSize || 10;
        const paginatedFirstMasterDetails = firstMasterAllDetails.slice(
          0,
          detailPageSize
        );
        setData([
          {
            tableName: "AC_ITEM_REF",
            data: paginatedFirstMasterDetails,
          },
        ]);
        setTotalData(firstMasterAllDetails.length);
        setCurrentPage(0);
        setCurrentPageSize(detailPageSize);
        setCurrentOffset(0);
        if (paginatedFirstMasterDetails.length > 0) {
          setSelectPermission([paginatedFirstMasterDetails[0]]);
          setJumpToRow(paginatedFirstMasterDetails[0]);
        } else {
          setSelectPermission([]);
          setJumpToRow(null);
        }
      } else {
        setData([{ tableName: "AC_ITEM_REF", data: [] }]);
        setSelectPermission([]);
        setTotalData(0);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSelectPermission([]);
      await fetchDataByIAcno();
    }
  };
  const handlePageChange = async (newPage, newPageSize) => {
    const newOffset = newPage * newPageSize;
    setCurrentPage(newPage);
    setCurrentPageSize(newPageSize);
    setCurrentOffset(newOffset);

    if (isSearch && searchData.length > 0 && selectRows.length > 0) {
      console.log("📄 [Search Details] Client-side pagination");

      const selectedMaster = selectRows[0];

      const allMasterDetails = searchData.filter(
        (detail) =>
          detail.factory_code === selectedMaster.factory_code &&
          detail.item_acno === selectedMaster.item_acno
      );

      const paginatedDetails = allMasterDetails.slice(
        newOffset,
        newOffset + newPageSize
      );
      console.log("  Total details for master:", allMasterDetails.length);
      console.log("  Page size:", newPageSize);
      console.log("  Offset:", newOffset);
      console.log("  Details in page:", paginatedDetails.length);

      setData([
        {
          tableName: "AC_ITEM_REF",
          data: paginatedDetails,
        },
      ]);

      //  Select detail đầu tiên của page mới
      if (paginatedDetails.length > 0) {
        setSelectPermission([paginatedDetails[0]]);
        setJumpToRow(paginatedDetails[0]);
      } else {
        setSelectPermission([]);
      }

      return;
    }

    if (!selectRows.length || !selectRows[0]?.item_acno) {
      console.warn(" No master selected, skipping detail fetch");
      return;
    }
    const allow = Array.isArray(subAuthentication)
      ? subAuthentication.find((item) => item.field === "query_level")?.title
      : null;
    const responseData = await fetchDataByItemAcno(
      selectRows[0]?.factory_code,
      selectRows[0]?.item_acno,
      user?.department,
      user?.user_code,
      allow || "1",
      newPageSize,
      newOffset
    );

    if (responseData && responseData.data) {
      setData([
        {
          tableName: "AC_ITEM_REF",
          data: responseData.data || [],
        },
      ]);

      if (responseData.data.length > 0) {
        setSelectPermission([responseData.data[0]]);
        setJumpToRow(responseData.data[0]);
      } else {
        setSelectPermission([]);
      }
    }
  };
  const getControlLabel = (fieldCode, fallback) => {
    if (!controlTranslations || controlTranslations.length === 0) {
      return fallback;
    }
    const translation = controlTranslations.find(
      (item) => item.field === fieldCode
    );
    return translation?.title || fallback;
  };

  const getColumnLabel = (fieldCode, fallback) => {
    if (!columnTranslations || columnTranslations.length === 0) {
      return fallback;
    }

    const translation = columnTranslations.find(
      (item) => item.field === fieldCode
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
      <Dialog open={openLink} onClose={onClose} maxWidth="xl">
        <DialogContent>
          <Box>
            <Box
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
              mb={2}
            >
              <Typography
                variant="h4"
                textTransform={"uppercase"}
                fontWeight={600}
                gutterBottom
                textAlign={"center"}
                flex={1}
                mb={"0"}
              >
                {getControlLabel("ttl_m_detail", "Details Of Material")}
              </Typography>
              <Button onClick={onClose} variant="contained" color="error">
                <CloseIcon />
              </Button>
            </Box>
            <Stack
              direction="row"
              flexWrap="wrap"
              sx={{ rowGap: 1, width: "100%" }}
            >
              <div style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                <DataTable
                  data={data[0]?.data}
                  tableName={"AC_ITEM_REF"}
                  selectRows={selectPermission}
                  onSelectChange={handleSelectChoose}
                  onSearch={handleSearch}
                  onPDF={handlePDF}
                  popupOpen={openEdit}
                  columnTranslations={columnTranslations}
                  controlTranslations={controlTranslations}
                  language={language}
                  getControlLabel={getControlLabel}
                  getColumnLabel={getColumnLabel}
                  jumpToRow={jumpToRow}
                  isSubTable={true}
                  isPopup={true}
                  totalData={totalData}
                  onPageChange={handlePageChange}
                  currentPage={currentPage}
                  currentPageSize={currentPageSize}
                />
              </div>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default AcItemMLink;
