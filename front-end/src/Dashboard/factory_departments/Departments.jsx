import {  useEffect, useState, useRef } from "react";
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
  deleteAllUsers,
  exportExcelUser,
  importExcelUser,
} from "../../service/user/userService";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import AcShoeMDeletePage from "../../features/ac_shoe_m/page/AcShoeMDeletePage";
import {
  addDepartment,
  deleteDepartment,
  editDepartment,
  exportPDFDepartment,
  fetchDepartmentByFac,
  fetchDepartments,
  searchDepartmentByFilter,
} from "../../service/factory_departments/FacDepartmentService";
import {
  fetchFactory,
  searchFactoryByFilter,
} from "../../service/factory/factoryService";
import AddDepartmentPage from "../../features/factory_departments/page/AddDepartmentPage";
import EditDepartmentPage from "../../features/factory_departments/page/EditDepartmentPage";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import { fetchTablePermission } from "../../service/users_permission/UsersPermission";

const Departments = () => {
  const today = new Date().toISOString().slice(0, 19).replace("T", " ");
  new Date().toISOString().split("T")[0];
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [factories, setFactories] = useState([]);
  const [selectFactory, setSelectFactory] = useState({});
  const [isSearch, setIsSearch] = useState(false);
  const [isFactorySearch, setIsFactorySearch] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const skipNextFetchRef = useRef(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectRow, setSelectRow] = useState({});
  const [selectRows, setSelectRows] = useState([]);
  const [filter, setFilter] = useState({});
  const [jumpToRow, setJumpToRow] = useState(null);
  const [file, setFile] = useState(null);
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const [authorization, setAuthorizations] = useState({});
  const {
    fetchTableControlTranslations,
    fetchTableColumnTranslations,
    language,
  } = useColumnTranslation();
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));

  const { user } = useAuth();

  //========== FETCH DATA SECTION ================

  //fetch all departments and factories
  const fetchAllD = async () => {
    try {
      const combinedData = await fnQuery([() => fetchDepartments()]);
      await fetchS();
      setData(combinedData);
      setSelectRows([combinedData[0].data[0]]);
      setIsSearch(false);
    } catch (err) {
      console.error("fetchAllD error: ", err);
    }
  };
  //fetch all factories
  const fetchS = async () => {
    const combinedData = await fnQuery([() => fetchFactory()]);
    setFactories(combinedData);
    if (combinedData?.[0]?.data?.length > 0) {
      setSelectFactory(combinedData[0].data[0]);
    }
  };
  //fetch deparment by factory code
  const fetchD = async () => {
    const combinedData = await fnQuery([
      () => fetchDepartmentByFac(selectFactory.factory_code),
    ]);
    setSelectRows([combinedData[0].data[0]]);
    setData(combinedData);
  };
  //fetch all translation of department
   const fetchAllTranslations = async () => {
    try {
    const columns = await fetchTableColumnTranslations(
        "DEPARTMENTS",
        "master",
        "departments",
      );
      const controls = await fetchTableControlTranslations("DEPARTMENTS");
      const sysMessages = await fetchTableControlTranslations("SYS_MESG");
      const auth = await fetchTablePermission(
        user.factory,
        user.department,
        user.user_code,
        "DEPARTMENTS",
      );
      const mergedControls = [...controls?.data, ...sysMessages?.data];
      if (mergedControls.length > 0) {
        setControlTranslations(mergedControls);
      }
      if (columns) setColumnTranslations(columns?.data);

      if (auth) setAuthorizations(auth?.data);
      return auth?.data || [];
    } catch (error) {
      console.error(" Error fetching translations:", error);
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
  //  UseEffect #2: Khởi tạo - Fetch tất cả departments
  // - Chạy 1 lần khi component mount
  // - Gọi fetchF() để load dữ liệu
  // - Select row đầu tiên nếu có data
  useEffect(() => {
    fetchS();
  }, []);
  //  UseEffect #3: fetch data base on 2 case : search and dont search
  // - Không chạy lại khi mà isEditing = true (đang edit)
  // - Chạy khi selectFactory hoặc isSearch hoặc searchData thay đổi, data phụ thuộc vào searchData
  useEffect(() => {
    if (isEditing) {
      return;
    }
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    if (isSearch) {
      if (selectFactory?.factory_code) {

        const filteredData = searchData.filter(
          (d) => d.factory_code === selectFactory.factory_code
        );
        setSelectRows([filteredData[0]]);
        // setSelectFactory(factories[0].data[0]);
        setData([{ tableName: "DEPARTMENTS", data: filteredData }]);
      } else {
        setData([{ tableName: "DEPARTMENTS", data: searchData }]);
      }
    } else {
      if (selectFactory?.factory_code) {
        fetchD();
      } else {
        fetchAllD();
      }
    }
  }, [selectFactory, isSearch, searchData, isEditing]);
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
  //handler selectFactory
  const handleSelectFactory = (fac) => {
    setSelectFactory(fac);
  };

  const handleClose = () => setOpen(false);

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
  //handler close edit popup
  const handleEditClose = () => {
    setOpenEdit(false);
  };
  //handler open edit popup
  const handleOpenEdit = () => {
    if (data[0]?.data.length > 0) {
      const allow = authorization?.find(
        (item) => item.field === "allow_modify"
      )?.title;
      if (user?.user_code !== "admin" && allow === "N") {
        return;
      }
      setOpenEdit(true);
    }
  };

  const handleModal = (row) => {
    setSelectRow(row);
    setOpen(true);
  };

  const onSetFilter = (filter) => {
    setFilter(filter);
  };
  //handler add department
  const handleAdd = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = Object.fromEntries(form.entries());
    data.grt_dept = user.department_code;
    data.grt_user = user.user_code;
    data.grt_date = today;

    if (typeof selectFactory !== "object") {
      data.factory_code = selectFactory;
    } else {
      data.factory_code = selectFactory.factory_code;
    }

    try {
      const response = await addDepartment(user.access_token, data);
      if (response.success) {
        const combinedData = await fnQuery([
          () => fetchDepartmentByFac(selectFactory.factory_code),
        ]);
        const addedDept = combinedData[0].data.find(
          (item) =>
            item.department_code === data.department_code &&
            item.factory_code === data.factory_code
        );
        setData(combinedData);

        if (addedDept) {
          setTimeout(() => {
            setSelectRows([addedDept]);
            setJumpToRow(addedDept);
            setTimeout(() => setJumpToRow(null), 500);
          }, 100);
        }
        toast.success("Add successfully !!!");
        handleAddClose();
      } else {
        toast.dismiss("error-duplicate");
        toast.error(response.data?.message || "Add failed !!!", {
          toastId: "error-duplicate",
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Server error !!!");
    }
  };
  //handler edit department
  const handleEditDepartment = async (edit, title) => {
    try {
      setIsEditing(true);
      edit.last_user = user.user_code;
      edit.last_date = new Date().toISOString();
      const { statusText, ...cleanData } = edit;
      const response = await editDepartment(user.access_token, cleanData);
      if (response.success) {
        const successMessage =
          typeof title === "string" && title
            ? title
            : `Edit department with code(${cleanData.department_code}) successfully !!!`;
        toast.success(successMessage, {
          toastId: `${cleanData.department_code}-${
            cleanData.status
          }-${Date.now()}`,
        });

        // Tạo dataWithStatusText
        const dataWithStatusText = {
          ...cleanData,
        };

        // Update data state
        setData((prevData) => {
          if (!prevData.length) return prevData;
          const { factory_code, department_code } = cleanData;
          const uniqueKey = `${factory_code}-${department_code}`;
          const updatedData = prevData.map((table) => ({
            ...table,
            data: table.data.map((item) => {
              const itemKey = `${item.factory_code}-${item.department_code}`;
              return itemKey === uniqueKey
                ? { ...item, ...dataWithStatusText }
                : item;
            }),
          }));
          return updatedData;
        });

        // Update searchData state
        setSearchData((prevSearchData) => {
          if (!Array.isArray(prevSearchData)) return prevSearchData;
          const { factory_code, department_code } = cleanData;
          const uniqueKey = `${factory_code}-${department_code}`;
          return prevSearchData.map((item) => {
            const itemKey = `${item.factory_code}-${item.department_code}`;
            return itemKey === uniqueKey
              ? { ...item, ...dataWithStatusText }
              : item;
          });
        });

        // Update selectRows - GIỮ NGUYÊN selection
        setSelectRows([dataWithStatusText]);

        handleEditClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Server error !!!");
    } finally {
      // BẬT FLAG để skip useEffect lần kế tiếp
      skipNextFetchRef.current = true;
      setIsEditing(false);
    }
  };
  //handler cancel department
  const handleCancel = async () => {
    if (selectRows.length === 1) {
      const allow = authorization?.find(
        (item) => item.field === "allow_cancel"
      )?.title;
      if (user?.user_code !== "admin" && allow === "N") {
        return;
      }
      const updateCancel = { ...selectRows[0], status: 0 };
      await handleEditDepartment(updateCancel, "Canceled successfully!");
    }
  };
  //handler confirm department
  const handleConfirm = async () => {
    if (selectRows.length === 1) {
      const allow = authorization?.find(
        (item) => item.field === "allow_confirm"
      )?.title;
      if (user?.user_code !== "admin" && allow === "N") {
        return;
      }
      const updateConfirm = { ...selectRows[0], status: 1 };
      await handleEditDepartment(updateConfirm, "Confirmed successfully!");
    }
  };

  const handleSingleDelete = async () => {
    const result = await deleteDepartment(user.access_token, selectRow);
    if (result.success) {
      await fetchD();
      toast.success("Delete user successfully!");
      handleClose();
    } else {
      toast.error("Cannot delete");
      handleClose();
    }
  };

  const handleDeleteAll = async () => {
    try {
      const deleteAll = await deleteAllUsers(selectRows, user.access_token);
      if (deleteAll.success) {
        await fetchD();
        toast.success("Delete all item successfully");
        handleClose();
      }
    } catch (error) {
      toast.error("Cannot delete all something wrong !");
    }
  };

  const handleDelete = async () => {

    if (selectRows.length > 1) {
      handleDeleteAll();
    } else {
      handleSingleDelete();
    }
  };
  //handler search department
  const handleSearch = async (newFilter) => {
    try {
      const response = await searchDepartmentByFilter(
        newFilter,
        user.access_token
      );

      if (response && response.data) {
        setIsSearch(true);
        setIsFactorySearch(false);
        setSearchData(response.data);

        // Get unique factory codes từ search results
        const factoryCodes = [
          ...new Set(response.data.map((dept) => dept.factory_code)),
        ];

        // Fetch tất cả factories
        const allFactoryCombined = await fnQuery([() => fetchFactory()]);
        const allFactories = allFactoryCombined?.[0]?.data || [];

        // Filter factories có trong search results
        const filteredFactories = allFactories.filter((fac) =>
          factoryCodes.includes(fac.factory_code)
        );

        setFactories([{ tableName: "FACTORY", data: filteredFactories }]);

        // QUAN TRỌNG: Kiểm tra selectFactory hiện tại có departments trong kết quả không
        const currentFactoryHasData = response.data.some(
          (dept) => dept.factory_code === selectFactory?.factory_code
        );

        if (!currentFactoryHasData && filteredFactories.length > 0) {
          // SelectFactory hiện tại KHÔNG có departments trong kết quả
          // → Tự động chọn factory đầu tiên và hiển thị departments của nó
          const firstFactory = filteredFactories[0];
          setSelectFactory(firstFactory);

          const filteredData = response.data.filter(
            (d) => d.factory_code === firstFactory.factory_code
          );
          setData([{ tableName: "DEPARTMENTS", data: filteredData }]);
          setSelectRows(filteredData.length > 0 ? [filteredData[0]] : []);
        } else if (selectFactory?.factory_code) {
          // SelectFactory hiện tại CÓ departments trong kết quả
          // → Giữ nguyên và hiển thị departments của nó
          const filteredData = response.data.filter(
            (d) => d.factory_code === selectFactory.factory_code
          );
          setData([{ tableName: "DEPARTMENTS", data: filteredData }]);
          setSelectRows(filteredData.length > 0 ? [filteredData[0]] : []);
        } else {
          // Không có factory nào được chọn → Hiển thị tất cả
          setData([{ tableName: response.tableName, data: response.data }]);
          setSelectRows(response.data.length > 0 ? [response.data[0]] : []);
        }

        setFilter(newFilter);
      }
    } catch (error) {
      console.log("cannot search because", error);
    }
  };
  //handler search department by factory
  const handleSearchFactory = async (newFilter) => {
    try {
      const response = await searchFactoryByFilter(
        newFilter,
        user.access_token
      );
      if (response.success) {
        setFactories([response]);
        const allDeptsCombined = await fnQuery([() => fetchDepartments()]);
        const allDepts = allDeptsCombined?.[0]?.data || [];
        const factoryCodes = response.data.map((fac) => fac.factory_code);
        const filteredDepts = allDepts.filter((dept) =>
          factoryCodes.includes(dept.factory_code)
        );
        setIsSearch(true);
        setIsFactorySearch(true);
        setSelectFactory(response.data[0]);
        setSearchData(filteredDepts);
        setSelectRows([filteredDepts[0]]);
        setData([{ tableName: "DEPARTMENTS", data: filteredDepts }]);
        setFilter(newFilter); // Lưu filter để dùng sau
      }
    } catch (error) {
      console.error("handleSearchFactory error:", error);
    }
  };
  //handler search filter
  const handleSearchByFilter = async (filteredShoe) => {
    try {
      const search = filteredShoe.search || {};
      const keys = Object.keys(search);
      if (keys.length === 0) {
        setIsSearch(false);
        setSearchData([]);
        if (isFactorySearch) {
          setIsFactorySearch(false);
        }
        await fetchS();
        if (selectFactory?.factory_code) {
          await fetchD();
        } else {
          const combinedData = await fnQuery([() => fetchDepartments()]);
          setData(combinedData);
          if (combinedData?.[0]?.data?.length > 0) {
            setSelectRows([combinedData[0].data[0]]);
          }
        }
        return;
      }
      // Có search filter
      const hasFactory = search.factory_code || search.factory_name;
      const hasOther = keys.some(
        (k) => k !== "factory_code" && k !== "factory_name"
      );

      if (hasFactory && !hasOther) {
        await handleSearchFactory(filteredShoe);
      } else {
        await handleSearch(filteredShoe);
      }
    } catch (error) {
      console.log("cannot search because", error);
    }
  };
  //handler import excel
  const handleImport = async () => {
    const form = new FormData();
    form.append("file", file);
    try {
      const result = await importExcelUser(user.access_token, form);
      if (result.importRows.success) {
        await fetchD(user.access_token);
      }
    } catch (error) {
      if (error.message.includes("ERR_UPLOAD_FILE_CHANGED")) {
        toast.error("Please choose again !");
        setFile("");
      }
    }
  };
  //handler export excel
  const handleExport = async () => {
    const excel = await exportExcelUser(user.access_token);
    if (excel) {
      toast.success("Export EXCEL successfully!");
    }
  };
  //handler export pdf
  const handleExportPDF = async () => {
    const pdf = await exportPDFDepartment(user.access_token);
    if (pdf) {
      toast.success("Export PDF successfully!");
    }
  };
  //handler image file
  const handleFile = (e) => {
    const selectedFiled = e.target.files[0];
    if (selectedFiled) {
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
              {data.length > 0 &&
                data.map((item, index) => (
                  <div
                    key={index}
                    style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}
                  >
                    <DataTable
                      data={item.data}
                      tableName={item.tableName}
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
                      onDetail={(row) => {
                        handleDetailModal(row);
                      }}
                      onExport={handleExport}
                      onImport={handleImport}
                      onPDF={handleExportPDF}
                      onFile={handleFile}
                      file={file}
                      factories={factories}
                      selectFactory={selectFactory}
                      onSelectFactory={handleSelectFactory}
                      columnTranslations={columnTranslations}
                      controlTranslations={controlTranslations}
                      language={language}
                      getControlLabel={getControlLabel}
                      getColumnLabel={getColumnLabel}
                      jumpToRow={jumpToRow}
                    />
                  </div>
                ))}
            </Paper>
          </Stack>
        </Container>
      </Box>
      {/* ========== LOADING SKELETON ========== */}
      {data.length === 0 && (
        <Stack direction="row" flexWrap="wrap" sx={{ rowGap: 1 }}>
          <div style={{ width: itemWidth, minWidth: 0 }}>
            <Skeleton
              animation="wave"
              variant="rectangular"
              height={600}
              width={1400}
            />
          </div>
        </Stack>
      )}
      {/* ========== MODAL/DIALOG COMPONENTS ========== */}
      {/*  Add Department Modal */}
      {/* - Mở khi user click "Add" button */}
      {/* - Gọi handleAdd khi submit form */}
      <AddDepartmentPage
        open={openAdd}
        onClose={handleAddClose}
        handleAdd={handleAdd}
        selectFactory={selectFactory}
        handleSelectFactory={setSelectFactory}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        language={language}
      />
      {/*  Edit Department Modal */}
      {/* - Mở khi user click "edit" button */}
      {/* - Gọi handleEditDepartment khi submit form */}
      <EditDepartmentPage
        open={openEdit}
        onClose={handleEditClose}
        department={selectRows.length > 0 ? selectRows[0] : null}
        factory={selectFactory}
        handleEdit={handleEditDepartment}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
      />
      {/*  Delete Confirmation Modal */}
      {/* - Mở khi user click "Delete" button */}
      {/* - Gọi handleDelete (single hoặc multiple) khi confirm */}
      {/* - Xóa hàng được chọn từ selectRow hoặc selectRows */}
      <AcShoeMDeletePage
        shoe={selectRow}
        open={open}
        onClose={handleClose}
        onConfirm={handleDelete}
        title={"Delete Shoe"}
        message={"Do you want to delete this ?"}
      />
    </>
  );
};
export default Departments;
