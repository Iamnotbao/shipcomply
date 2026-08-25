import { lazy, useEffect, useState } from "react";
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
  addABomM,
  fetchAcBomM,
  editABomM,
  searchABomMByFilter,
  exportPDFABM,
} from "../../service/ac_bom_m/AcBomMService";
import AddAcBomMPage from "../../features/bom_3/page/AddAcBomMPage";
import EditAcBomMPage from "../../features/bom_3/page/EditAcBomMPage";
import {
  exportPDFVwAcShoeBom,
  fetchViewAcShoeBom,
  searchVwAcShoeBomByFilter,
} from "../../service/vw_ac_shoebom/ViewAcShoeBomService";
import {
  exportExcelVwContImp,
  fetchViewContImp,
  searchVwAcContImpByFilter,
} from "../../service/vw_cont_imp/VwContImpService";
import { fetchAllAcContDWithView } from "../../service/ac_cont_d/acContDService";
const Actf1102 = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectRow, setSelectRow] = useState(null);
  const [selectRows, setSelectRows] = useState([]);
  const [searchFilter, setSearchFilter] = useState({});

  const [authorization, setAuthorizations] = useState([]);
  const [filter, setFilter] = useState("");
  const [file, setFile] = useState(null);
  const [jumpToRow, setJumpToRow] = useState(null);
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

  const fetchAll = async (authData = null) => {
    const authToUse = authData || authorization;

    const allow = Array.isArray(authToUse)
      ? authToUse.find((item) => item.field === "query_level")?.title
      : null;

    const combinedData = await fnQuery([
      () =>
        fetchAllAcContDWithView(
          user.factory,
          user.department,
          user.user_code,
          allow,
          language
        ),
    ]);
    const responseData = combinedData[0];
    let dataArray;
    if (Array.isArray(responseData)) {
      dataArray = responseData;
    } else if (responseData?.data) {
      dataArray = Array.isArray(responseData.data)
        ? responseData.data
        : responseData.data.rows || [];
    } else if (responseData?.rows) {
      dataArray = responseData.rows;
    } else {
      dataArray = [];
    }
    setData(dataArray);
    if (Array.isArray(dataArray) && dataArray.length > 0) {
      setSelectRows([dataArray[0]]);
      setJumpToRow(dataArray[0]);
      localStorage.setItem("selectAcContD", JSON.stringify(dataArray[0]));
    } else {
      console.log("No data to set selectRows, dataArray:", dataArray);
      setSelectRows([]);
    }
  };
  //fetch all translation of factory
  const fetchAllTranslations = async () => {
    try {
      const controls = await fetchTableControlTranslations("ACTF_110");
      const auth = await fetchTablePermission(
        user.factory,
        user.department,
        user.user_code,
        "ACTF_1102"
      );

      if (controls) setColumnTranslations(controls?.data);
      if (auth) setAuthorizations(auth?.data);
      1;
      return auth?.data || [];
    } catch (error) {
      console.error(" Error:", error);
      return [];
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
  //  UseEffect #3: Jump to Row animation
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
    localStorage.setItem(
      "selectAcContD",
      JSON.stringify(rows[rows.length - 1])
    );
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
            (item) => item.field === "modify_level"
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
            (item) => item.field === "allow_modify"
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
      (item) => item.field === "allow_add"
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
        //  Update local data - VW_AC_SHOE_BOM dùng array thường
        setData((prevData) => {
          if (!prevData.length) {
            return [newIMT];
          }
          return [...prevData, newIMT];
        });
        setJumpToRow(newIMT);
        setSelectRows([newIMT]);
        toast.success(
          `Add material with factory code(${user?.factory}) successfully !!!`
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
  const handleSearchByFilter = async (filteredShoe) => {
    try {
      const allow = authorization?.find(
        (item) => item.field === "query_level"
      )?.title;
      const response = await searchVwAcContImpByFilter(
        filteredShoe,
        user.factory,
        user.department,
        user.user_code,
        allow || "1"
      );
      setSearchFilter(filteredShoe?.search);
      if (response && response.data) {
        if (response.data.length === 0) {
          setSelectRows([]);
          setData(response.data);
        } else {
          setSelectRows([response.data[0]]);
          setJumpToRow(response.data[0]);
          setData(response.data);
        }
      }
    } catch (error) {
      console.log("cannot search because", error);
    }
  };
  //handler cancel
  const handleCancel = async () => {
    if (selectRows.length === 1) {
      if (user.user_code !== "admin") {
        const allowModify = authorization?.find(
          (item) => item.field === "modify_level"
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
          (item) => item.field === "allow_modify"
        )?.title;
        if (user?.user_code !== "admin" && allow === "N") {
          return;
        }
        const allowP = authorization?.find(
          (item) => item.field === "allow_cancel"
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
          (item) => item.field === "modify_level"
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
          (item) => item.field === "allow_modify"
        )?.title;
        if (user?.user_code !== "admin" && allow === "N") {
          return;
        }
        const allowP = authorization?.find(
          (item) => item.field === "allow_confirm"
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
          (item) => item.field === "modify_level"
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
          (item) => item.field === "allow_modify"
        )?.title;
        if (user?.user_code !== "admin" && allow === "N") {
          return;
        }
        const allowP = authorization?.find(
          (item) => item.field === "allow_unconfirm"
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
          (item) => item.field === "modify_level"
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
          (item) => item.field === "allow_modify"
        )?.title;
        if (user?.user_code !== "admin" && allow === "N") {
          return;
        }
        const allowP = authorization?.find(
          (item) => item.field === "allow_close"
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
          (item) => item.field === "modify_level"
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
          (item) => item.field === "allow_modify"
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
      (item) => item.field === "query_level"
    )?.title;
    await exportExcelVwContImp(
      user?.factory,
      user?.department,
      user?.user_code,
      allow || "1",
      searchFilter || {}
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
  //==========END HANDLER SECTION ================

  //========== LABEL TRANSLATION HANDLER ==============
  //handler translation by control ui
  const getControlLabel = (fieldCode, fallback) => {
    if (!controlTranslations || controlTranslations.length === 0) {
      return fallback;
    }
    const translation = controlTranslations.find(
      (item) => item.field === fieldCode
    );
    return translation?.title || fallback;
  };

  //handler translation by column table
  const getColumnLabel = (fieldCode, fallback) => {
    if (!columnTranslations || columnTranslations.length === 0) {
      return fallback;
    }

    const translation = columnTranslations.find(
      (item) => item.field === fieldCode
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
      <Box sx={{ p: 2 }}>
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
                data={
                  data.length === 0
                    ? [
                        {
                          factory_code: "2010",
                          cont_no: "CON001",
                          goods_code: "G001",
                          seq: 1,
                        },
                      ]
                    : data
                }
                tableName={"AC_CONT_D"}
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
              />
            </Paper>
          </Stack>
        </Container>
      </Box>

      {/* ========== MODAL/DIALOG COMPONENTS ========== */}

      {/*  Add Factory Modal */}
      {/* - Mở khi user click "Add" button */}
      {/* - Gọi handleAdd khi submit form */}
      <AddAcBomMPage
        open={openAdd}
        onClose={handleAddClose}
        handleAdd={handleAdd}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={authorization}
      />
      {/*  Edit Factory Modal */}
      {/* - Mở khi user click "edit" button */}
      {/* - Gọi handleEditABM khi submit form */}
      <EditAcBomMPage
        open={openEdit}
        onClose={handleEditClose}
        acImp={selectRows.length > 0 ? selectRows[0] : null}
        handleEdit={handleEditABM}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        user={user}
        auth={authorization}
      />
      {/*  Delete Confirmation Modal */}
      {/* - Mở khi user click "Delete" button */}
      {/* - Gọi handleDelete (single hoặc multiple) khi confirm */}
      {/* - Xóa hàng được chọn từ selectRow hoặc selectRows */}
    </>
  );
};
export default Actf1102;
