import { lazy, useEffect, useState } from "react";
import DataTable from "../../../component/table/DataTable";
import {
  Box,
  Container,
  Paper,
  Skeleton,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { fnQuery } from "../../../utils/fnQuery";
import {
  exportExcelUser,
  importExcelUser,
} from "../../../service/user/userService";

import useAuth from "../../../hooks/useAuth";
import { toast } from "react-toastify";
import { useColumnTranslation } from "../../../context/ColumnTranslationContext";
import { fetchTablePermission } from "../../../service/users_permission/UsersPermission";
import { getTempTextTable } from "../../../service/se_plan_ord/sePlanOrd";

const TextImport = ({
  data,
  setData,
  selectRows,
  setSelectRows,
  setJumpToRow,
  jumpToRow,
  hasMore,
  setHasMore,
}) => {
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectRow, setSelectRow] = useState(null);
  // Debug log để kiểm tra selectRows
  useEffect(() => {
    console.log("📊 selectRows changed:", selectRows);
  }, [selectRows]);
  const [authorization, setAuthorizations] = useState([]);
  const [filter, setFilter] = useState("");
  const [file, setFile] = useState(null);
  const [isSearch, setIsSearch] = useState(false);
  const [searchFilter, setSearchFilter] = useState(null);
  const [totalData, setTotalData] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(5);
  const [currentOffset, setCurrentOffset] = useState(0);
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
  //========== FETCH DATA SECTION ================
  //fetch all factory
  console.log("dataraaa", data);

  const fetchAll = async (authData = null, pageSize = 5, offset = 0) => {
    const authToUse = authData || authorization;

    const allow = Array.isArray(authToUse)
      ? authToUse.find((item) => item.field === "query_level")?.title
      : null;

    setCurrentPage(0);
    setCurrentPageSize(pageSize);
    setCurrentOffset(0);
    const combinedData = await fnQuery([
      () => getTempTextTable(user?.access_token, pageSize, offset),
    ]);
    console.log("comommo", combinedData[0]?.data);

    setData([{ tableName: "TEXT_IMPORT", data: combinedData[0].data }]);
    setHasMore(combinedData[0]?.hasMore);
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
      const controls = await fetchTableControlTranslations("ACTF_022");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user.factory,
        user.department,
        user.user_code,
        "ACTF_022",
      );
      const mergedControls = [...controls?.data, ...sysMessages?.data];
      if (mergedControls.length > 0) {
        setControlTranslations(mergedControls);
        setColumnTranslations(controls?.data);
      }
      if (auth) setAuthorizations(auth?.data);
      return auth?.data || [];
    } catch (error) {
      console.error(" Error:", error);
      return [];
    }
  };
  //========== END FETCH DATA SECTION ================

  // ========== USEEFFECT SECTION ==========
  // 🔵 UseEffect #1: Language thay đổi - Fetch lại translations
  // - Chạy khi language (VN/EN/...) thay đổi
  // - Fetch column translations, control translations, và permissions
  // - Update UI labels theo ngôn ngữ mới
  useEffect(() => {
    fetchAllTranslations();
  }, [language]);
  // 🔵 UseEffect #2: Khởi tạo - Fetch tất cả factory
  // - Chạy 1 lần khi component mount
  // - Gọi fetchF() để load dữ liệu
  // - Select row đầu tiên nếu có data
  useEffect(() => {
    const init = async () => {
      if (!user?.factory) {
        console.log(" User not ready yet");
        return;
      }
      console.log("🔵 [UseEffect] INITIAL LOAD");
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
  const handleEditClose = () => {
    setOpenEdit(false);
    // setSelectRows([]);
  };
  //handler close edit popup
  const handleOpenEdit = async () => {
    try {
      if (selectRows.length === 1) {
        if (user.user_code !== "admin") {
          const allowModify = authorization?.find(
            (item) => item.field === "modify_level",
          )?.title;
          const allowStatus = selectRows[0]?.status;
          if (
            allowModify === "2" &&
            selectRows[0]?.grt_dept !== user.department
          ) {
            return;
          }
          if (
            allowModify === "3" &&
            selectRows[0]?.grt_user !== user.user_code
          ) {
            return;
          }
          if (allowStatus === 7 || allowStatus === 0 || allowStatus === 9) {
            return;
          }
          const allow = authorization?.find(
            (item) => item.field === "allow_modify",
          )?.title;
          if (user?.user_code !== "admin" && allow === "N") {
            return;
          }
        }
        const lockInfo = {
          ...selectRows[0],
          locked_information: user?.clientInfo,
        };
        if (user?.clientInfo) {
          await handleEditABM(lockInfo);
        }
        setOpenEdit(true);
      }
    } catch (error) {
      console.log("error when open the edit popup", error);
      toast.error("An error occurred while opening edit form!");
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
      const response = await addABomM(data);
      if (response.success) {
        const newIMT = response.data || data;
        setData((prevData) => {
          if (!prevData.length) {
            return [newIMT];
          }
          return [...prevData, newIMT];
        });
        setJumpToRow(newIMT);
        setSelectRows([newIMT]);
        toast.success(
          `Add material with factory code(${user?.factory}) successfully !!!`,
        );
        handleAddClose();
      } else {
        toast.error(response.error);
        handleAddClose();
      }
    } catch (error) {
      toast.error(`${error.response?.data?.message}`);
    }
  };
  const handleEditABM = async (update, title) => {
    try {
      const { statusText, ...data } = update;
      data.last_user = user.user_code;
      data.last_date = new Date().toISOString();
      const response = await editABomM(data);
      if (response.success) {
        const successMessage =
          typeof title === "string" && title
            ? title
            : `Edit bom with code(${data.item_no}) successfully !!!`;
        toast.success(successMessage, {
          toastId: `${data.item_no}-${data.status}-${Date.now()}`,
        });
        //  Update local data - VW_AC_SHOE_BOM dùng array thường
        setData((prevData) => {
          if (!prevData.length) return prevData;
          const { factory_code, prod_acno, item_no } = data;
          const uniqueKey = `${factory_code}-${prod_acno}-${item_no}`;
          return prevData.map((item) => {
            const itemKey = `${item.factory_code}-${item.prod_acno}-${item.item_no}`;
            return itemKey === uniqueKey ? { ...item, ...data } : item;
          });
        });
        setSelectRows([data]);
        handleEditClose(close);
      } else {
        toast.error(`${response?.data?.message}(${data.invoice_no}`);
      }
    } catch (error) {
      toast.error(`${error.response?.data?.message}`);
      console.log("data has been problem", error);
    }
  };

  //handler search by filter
  const handleSearchByFilter = async (
    filteredShoe,
    pageSize = 10,
    offset = 0,
  ) => {
    try {
      const search = filteredShoe?.search || {};
      const keys = Object.keys(search);
      if (keys.length === 0) {
        setIsSearch(false);
        setSearchFilter(null);
        await fetchAll();
        return;
      }
      setIsSearch(true);
      setSearchFilter(filteredShoe);
      const allow = authorization?.find(
        (item) => item.field === "query_level",
      )?.title;
      if (offset === 0) {
        setCurrentPage(0);
        setCurrentPageSize(pageSize);
        setCurrentOffset(0);
      }
      const isNewFilter =
        JSON.stringify(filteredShoe) !== JSON.stringify(searchFilter);
      const actualOffset = isNewFilter ? 0 : (offset ?? currentOffset);
      const response = await searchVwAcShoeBomByFilter(
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
          setData([]);
          setCurrentOffset(0);
          setCurrentPage(0);
          setCurrentPageSize(0);
          setTotalData(0);
        } else {
          setSelectRows([response.data[0]]);
          if (offset === 0 && response.data.length > 0) {
            setTotalData(response.total);
          }
          setData([{ tableName: "TEXT_IMPORT", data: response.data }]);
        }
      }
    } catch (error) {
      console.log("cannot search because", error);
      setIsSearch(false);
      setSearchFilter(null);
    }
  };
  //handler cancel
  const handleCancel = async () => {
    if (selectRows.length === 1) {
      if (user.user_code !== "admin") {
        const allowModify = authorization?.find(
          (item) => item.field === "modify_level",
        )?.title;
        const allowStatus = selectRows[0]?.status;
        console.log("ct", allowStatus, typeof allowStatus);
        if (
          allowModify === "2" &&
          selectRows[0]?.grt_dept !== user.department
        ) {
          return;
        }
        if (allowModify === "3" && selectRows[0]?.grt_user !== user.user_code) {
          return;
        }
        if (allowStatus === 7 || allowStatus === 0 || allowStatus === 9) {
          return;
        }
        const allow = authorization?.find(
          (item) => item.field === "allow_modify",
        )?.title;
        if (user?.user_code !== "admin" && allow === "N") {
          return;
        }
        const allowP = authorization?.find(
          (item) => item.field === "allow_cancel",
        )?.title;
        if (user?.user_code !== "admin" && allowP === "N") {
          return;
        }
      }
      const updateCancel = { ...selectRows[0], status: 0 };
      console.log("after cancel", updateCancel);
      await handleEditABM(updateCancel, "status");
    }
  };
  //handler confirm
  const handleConfirm = async () => {
    if (selectRows.length === 1) {
      if (user.user_code !== "admin") {
        const allowModify = authorization?.find(
          (item) => item.field === "modify_level",
        )?.title;
        const allowStatus = selectRows[0]?.status;
        console.log("ct", allowStatus, typeof allowStatus);
        if (
          allowModify === "2" &&
          selectRows[0]?.grt_dept !== user.department
        ) {
          return;
        }
        if (allowModify === "3" && selectRows[0]?.grt_user !== user.user_code) {
          return;
        }
        if (allowStatus === 7 || allowStatus === 0 || allowStatus === 9) {
          return;
        }
        const allow = authorization?.find(
          (item) => item.field === "allow_modify",
        )?.title;
        if (user?.user_code !== "admin" && allow === "N") {
          return;
        }
        const allowP = authorization?.find(
          (item) => item.field === "allow_confirm",
        )?.title;
        if (user?.user_code !== "admin" && allowP === "N") {
          return;
        }
      }
      const updateCancel = { ...selectRows[0], status: 7 };
      await handleEditABM(updateCancel, "status");
      setSelectRows([updateCancel]);
    }
  };
  const handleUnconfirm = async () => {
    if (selectRows.length === 1) {
      if (user.user_code !== "admin") {
        const allowModify = authorization?.find(
          (item) => item.field === "modify_level",
        )?.title;
        const allowStatus = selectRows[0]?.status;
        if (
          allowModify === "2" &&
          selectRows[0]?.grt_dept !== user.department
        ) {
          return;
        }
        if (allowModify === "3" && selectRows[0]?.grt_user !== user.user_code) {
          return;
        }
        if (allowStatus === 9 || allowStatus === 0 || allowStatus === 1) {
          return;
        }
        const allow = authorization?.find(
          (item) => item.field === "allow_modify",
        )?.title;
        if (user?.user_code !== "admin" && allow === "N") {
          return;
        }
        const allowP = authorization?.find(
          (item) => item.field === "allow_unconfirm",
        )?.title;
        if (user?.user_code !== "admin" && allowP === "N") {
          return;
        }
      }
      const updateCancel = { ...selectRows[0], status: 1 };
      await handleEditABM(updateCancel, "status");
    }
  };
  //handler cancel
  const handleClose = async () => {
    if (selectRows.length === 1) {
      if (user.user_code !== "admin") {
        const allowModify = authorization?.find(
          (item) => item.field === "modify_level",
        )?.title;
        const allowStatus = selectRows[0]?.status;
        console.log("ct", allowStatus, typeof allowStatus);
        if (
          allowModify === "2" &&
          selectRows[0]?.grt_dept !== user.department
        ) {
          return;
        }
        if (allowModify === "3" && selectRows[0]?.grt_user !== user.user_code) {
          return;
        }
        if (allowStatus === 0 || allowStatus === 9) {
          return;
        }
        const allow = authorization?.find(
          (item) => item.field === "allow_modify",
        )?.title;
        if (user?.user_code !== "admin" && allow === "N") {
          return;
        }
        const allowP = authorization?.find(
          (item) => item.field === "allow_close",
        )?.title;
        if (user?.user_code !== "admin" && allowP === "N") {
          return;
        }
      }
      const updateCancel = { ...selectRows[0], status: 9 };
      console.log("after close", updateCancel);
      await handleEditABM(updateCancel, "status");
    }
  };
  const handleCheck = async () => {
    if (selectRows.length === 1) {
      if (user.user_code !== "admin") {
        const allowModify = authorization?.find(
          (item) => item.field === "modify_level",
        )?.title;
        const allowStatus = selectRows[0]?.status;
        console.log("ct", allowStatus, typeof allowStatus);
        if (
          allowModify === "2" &&
          selectRows[0]?.grt_dept !== user.department
        ) {
          return;
        }
        if (allowModify === "3" && selectRows[0]?.grt_user !== user.user_code) {
          return;
        }
        if (allowStatus === 0 || allowStatus === 9 || allowStatus === 7) {
          return;
        }
        const allow = authorization?.find(
          (item) => item.field === "allow_modify",
        )?.title;
        if (user?.user_code !== "admin" && allow === "N") {
          return;
        }
      }
      const updateCancel = { ...selectRows[0], status: 2 };
      console.log("after close", updateCancel);
      await handleEditABM(updateCancel, "status");
    }
  };
  //handler import Excel
  const handleImport = async () => {
    const form = new FormData();
    form.append("file", file);
    try {
      const result = await importExcelUser(user.access_token, form);
      console.log("tt: ", result);
      if (result.importRows.success) {
        await fetchU(user.access_token);
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
    console.log("done: ", excel);
  };
  const handleCustomExport = async () => {
    const exportFile = {
      factory_code: user?.factory,
      invoice_no: selectRows[0]?.invoice_no,
    };
    const customExcel = await exportCustomExcel(exportFile);
    console.log("done custom", customExcel);
  };
  const handleMaterialExport = async () => {
    const exportFile = {
      factory_code: user?.factory,
      invoice_no: selectRows[0]?.invoice_no,
    };
    const materialExcel = await exportMaterialExcel(exportFile);
    console.log("done material", materialExcel);
  };
  //handler export PDF
  const handlePDF = async () => {
    const allow = authorization?.find(
      (item) => item.field === "query_level",
    )?.title;
    await exportPDFVwAcShoeBom(
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
      console.log("check select file : ", selectedFiled);
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

    //  CASE 3: Không search
    console.log(" Normal fetch all with offset:", newOffset);
    const responseData = await getTempTextTable(
      user?.access_token,
      newPageSize,
      newOffset,
    );
    console.log("oelele", responseData.data);

    setData([{ tableName: "VW_AC_SHOE_BOM", data: responseData.data || [] }]);
    setHasMore(responseData?.hasMore);
    if (responseData.data && responseData.data.length > 0) {
      setSelectRows([responseData.data[0]]);
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
        <Container maxWidth="xl">
          <Stack direction="row" flexWrap="wrap" sx={{ rowGap: 1 }}>
            <Paper
              sx={{
                width: "100%",
                maxWidth: "100%",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              <DataTable
                data={data[0]?.data}
                tableName={"TEXT_IMPORT"}
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
                onExport={handleExport}
                onImport={handleImport}
                onCheck={handleCheck}
                onCustomExport={handleCustomExport}
                onMaterialExport={handleMaterialExport}
                onPDF={handlePDF}
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
              />
            </Paper>
          </Stack>
        </Container>
      </Box>
    </>
  );
};
export default TextImport;
