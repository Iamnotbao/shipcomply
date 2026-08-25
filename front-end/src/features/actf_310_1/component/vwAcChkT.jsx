import { useEffect, useState } from "react";
import DataTable from "../../../component/table/DataTable";
import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { fnQuery } from "../../../utils/fnQuery";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import { exportPDFBasicData } from "../../../service/basic_data/basicDataService";
import { fetchTablePermission } from "../../../service/users_permission/UsersPermission";
const VwAcChkT = ({
  jumpToRow,
  setJumpToRow,
  data = [],
  setData,
  setSelectVwAcChkT,
  selectVwAcChkT = [],
  selectRows = [],
  isSearch = false,
  handleSearchByCode,
  user,
  handleVCUChange,
  currentPage,
  setCurrentPage,
  currentPageSize,
  setCurrentPageSize,
  setCurrentOffset,
  currentOffset,
  totalData,
  handlePageChange,
  fetchDataByAcno,
  hasMore,
  setHasMore,
}) => {
  const [openEdit, setOpenEdit] = useState(false);
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
      const controls = await fetchTableControlTranslations("ACTF_310");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user.factory,
        user.department,
        user.user_code,
        "ACTF_3101",
      );
      if (controls) setColumnTranslations(controls?.data);
      const mergedControls = [...controls?.data, ...sysMessages?.data];
      if (mergedControls.length > 0) {
        setControlTranslations(mergedControls);
      }

    } catch (error) {
      console.error("Error:", error);
      return [];
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
        !selectRows[0]?.org_id ||
        !selectRows[0]?.ac_no ||
        !selectRows[0]?.ac_itemno
      ) {
        setData([{ tableName: "VW_AC_CHK_T", data: [] }]);
        setSelectVwAcChkT([]);
        return;
      }
      setCurrentPage(0);
      setCurrentOffset(0);
      setCurrentPageSize(10);
      await fetchDataByAcno(true, 0, 10);
    };

    handleDataFetch();
  }, [
    selectRows?.[0]?.org_id,
    selectRows?.[0]?.ac_no,
    selectRows?.[0]?.ac_itemno,
  ]);
  useEffect(() => {
    if (jumpToRow) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow]);

  const handlePDF = async () => {
    await exportPDFBasicData();
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
  return (
    <>

      <DataTable
        data={data[0]?.data}
        tableName={"VW_AC_CHK_T"}
        selectRows={selectVwAcChkT}
        onSelectChange={setSelectVwAcChkT}
        onSearch={handleSearchByCode}
        onPDF={handlePDF}
        columnTranslations={columnTranslations}
        controlTranslations={controlTranslations}
        language={language}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        jumpToRow={jumpToRow}
        isSubTable={true}
        onPageChange={handlePageChange}
        totalData={totalData || 0}
        currentPage={currentPage}
        currentPageSize={currentPageSize}
        hasMore={hasMore}
        isToolbar={false}
      />
    </>
  );
};
export default VwAcChkT;
