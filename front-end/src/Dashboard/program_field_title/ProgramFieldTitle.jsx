import { useEffect, useState, useRef } from "react";
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
  deleteDepartment,
  fetchDepartments,
} from "../../service/factory_departments/FacDepartmentService";
import {
  fetchPrograms,
  searchProgramsByFilter,
} from "../../service/program/programService";
import {
  addProgramFieldTitle,
  editProgramFieldTitle,
  exportPDFProgramFieldTitle,
  fetchProgramFieldTitle,
  fetchProgramFieldTitleByProgram,
  searchProgramFieldTitleByFilter,
} from "../../service/program_field_title/programFieldTitleService";
import AddProgramFieldTitlePage from "../../features/program_field_title/page/AddProgramFieldTitle";
import EditProgramFieldTitlePage from "../../features/program_field_title/page/EditProgramFieldTitle";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import { fetchTablePermission } from "../../service/users_permission/UsersPermission";

const ProgramFieldTitle = () => {
  const today = new Date().toISOString().slice(0, 19).replace("T", " ");
  new Date().toISOString().split("T")[0];
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [programs, setProgram] = useState([]);
  const [selectProgram, setSelectProgram] = useState({});
  const [isSearch, setIsSearch] = useState(false);
  const [isProgramSearch, setIsProgramSearch] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const skipNextFetchRef = useRef(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectRow, setSelectRow] = useState({});
  const [selectRows, setSelectRows] = useState([]);
  const [filter, setFilter] = useState({});
  const [file, setFile] = useState(null);
  const [jumpToRow, setJumpToRow] = useState(null);
  const [authorization, setAuthorizations] = useState({});
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));

  const {
    fetchTableControlTranslations,
    fetchTableColumnTranslations,
    language,
  } = useColumnTranslation();
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const { user } = useAuth();

  const fetchAllD = async () => {
    try {
      const combinedData = await fnQuery([() => fetchProgramFieldTitle()]);
      await fetchS();
      setData(combinedData);
      setSelectRows([combinedData[0].data[0]]);
      setIsSearch(false);
    } catch (err) {
      console.error("fetchAllD error: ", err);
    }
  };

  const fetchS = async () => {
    const combinedData = await fnQuery([() => fetchPrograms()]);
    setProgram(combinedData);
    if (combinedData?.[0]?.data?.length > 0) {
      setSelectProgram(combinedData[0].data[0]);
    }
  };

  const fetchD = async () => {
    const combinedData = await fnQuery([
      () => fetchProgramFieldTitleByProgram(selectProgram.program_code),
    ]);
    setSelectRows([combinedData[0].data[0]]);
    setData(combinedData);
  };
  const fetchAllTranslations = async () => {
    try {
      const [columns, controls, auth] = await fnQuery([
        () => fetchTableColumnTranslations("PROGRAM_FIELD_TITLE"),
        () => fetchTableControlTranslations("PROGRAM_FIELD_TITLE"),
        () =>
          fetchTablePermission(
            user.factory,
            user.department,
            user.user_code,
            "PROGRAM_FIELD_TITLE"
          ),
      ]);
      // combinedData[0] = column translations
      // combinedData[1] = control translations
      if (columns) {
        setColumnTranslations(columns?.data);
      }
      if (controls) {
        setControlTranslations(controls?.data);
      }
      if (auth) {
        setAuthorizations(auth?.data);
      }
    } catch (error) {
      console.error(" Error fetching translations:", error);
    }
  };
  useEffect(() => {
    fetchAllTranslations();
  }, [language]);
  useEffect(() => {
    fetchS();
  }, []);

  useEffect(() => {
    if (isEditing) {
      return;
    }
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    if (isSearch) {
      if (selectProgram?.program_code) {

        const filteredData = searchData.filter(
          (d) => d.program_code === selectProgram.program_code
        );
        setSelectRows([filteredData[0]]);
        // setSelectProgram(programs[0].data[0]);
        setData([{ tableName: "PROGRAM_FIELD_TITLE", data: filteredData }]);
      } else {
        setData([{ tableName: "PROGRAM_FIELD_TITLE", data: searchData }]);
      }
    } else {
      if (selectProgram?.program_code) {
        fetchD();
      } else {
        fetchAllD();
      }
    }
  }, [selectProgram, isSearch, searchData, isEditing]);
  useEffect(() => {
    if (jumpToRow) {
      const timer = setTimeout(() => {
        setJumpToRow(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [jumpToRow]);
  const handleSelectChoose = (rows) => {
    setSelectRows(rows);
  };

  const handleSelectProgram = (fac) => {
    setSelectProgram(fac);
  };

  const handleClose = () => setOpen(false);
  const handleAddClose = () => setOpenAdd(false);
  const handleOpenAdd = () => {
    const allowAdd = authorization?.find(
      (item) => item.field === "allow_add"
    )?.title;
    if (user?.user_code !== "admin" && allowAdd === "N") {
      return;
    }
    setOpenAdd(true);
  };
  const handleEditClose = () => {
    setOpenEdit(false);
  };

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

  const handleAdd = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const formData = Object.fromEntries(form.entries());
    formData.grt_dept = user.department_code;
    formData.grt_user = user.user_code;
    formData.grt_date = today;

    if (typeof selectProgram !== "object") {
      formData.program_code = selectProgram;
    } else {
      formData.program_code = selectProgram.program_code;
    }
    try {
      const response = await addProgramFieldTitle(user.access_token, formData);

      if (response.success) {
        toast.success("Add successfully !!!");
        handleAddClose();
        try {
          const combinedData = await fnQuery([
            () => fetchProgramFieldTitleByProgram(formData.program_code),
          ]);

          if (combinedData && combinedData[0]?.data) {
            setData(combinedData);

            const addedPFT = combinedData[0].data.find(
              (item) =>
                `${item.program_code}-${item.field_code}` ===
                `${formData.program_code}-${formData.field_code}`
            );
            if (addedPFT) {
              setSelectRows([addedPFT]);
              setJumpToRow(addedPFT);
            }
          }
        } catch (fetchError) {
          console.error("Error fetching data after add:", fetchError);
          toast.warning("Added successfully but failed to refresh data");
        }
      } else {
        toast.dismiss("error-duplicate");
        toast.error(response.data?.message || "Add failed !!!", {
          toastId: "error-duplicate",
        });
      }
    } catch (error) {
      console.error("Add error:", error);
      toast.error(error.response?.data?.message || "Server error !!!");
    }
  };

  const handleEditDepartment = async (edit, title) => {
    try {
      setIsEditing(true);
      edit.last_user = user.user_code;
      edit.last_date = new Date().toISOString();
      const { statusText, ...cleanData } = edit;
      const response = await editProgramFieldTitle(
        user.access_token,
        cleanData
      );

      if (response.success) {
        const successMessage =
          typeof title === "string" && title
            ? title
            : `Edit department with code(${cleanData.field_code}) successfully !!!`;
        toast.success(successMessage, {
          toastId: `${cleanData.field_code}-${
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
          const { program_code, field_code } = cleanData;
          const uniqueKey = `${program_code}-${field_code}`;
          const updatedData = prevData.map((table) => ({
            ...table,
            data: table.data.map((item) => {
              const itemKey = `${item.program_code}-${item.field_code}`;
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
          const { program_code, field_code } = cleanData;
          const uniqueKey = `${program_code}-${field_code}`;
          return prevSearchData.map((item) => {
            const itemKey = `${item.program_code}-${item.field_code}`;
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

  const handleCancel = async () => {
    if (selectRows.length === 1) {
      const allow = authorization?.find(
        (item) => item.field === "allow_confirm"
      )?.title;
      if (user?.user_code !== "admin" && allow === "N") {
        return;
      }
      const updateCancel = { ...selectRows[0], status: 0 };
      await handleEditDepartment(updateCancel, "Canceled successfully!");
    }
  };

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

  const handleSearch = async (newFilter) => {
    try {
      const response = await searchProgramFieldTitleByFilter(
        newFilter,
        user.access_token
      );

      if (response && response.data) {
        setIsSearch(true);
        setIsProgramSearch(false);
        setSearchData(response.data);

        // Get unique factory codes từ search results
        const factoryCodes = [
          ...new Set(response.data.map((dept) => dept.program_code)),
        ];

        // Fetch tất cả programs
        const allFactoryCombined = await fnQuery([() => fetchPrograms()]);
        const allprograms = allFactoryCombined?.[0]?.data || [];

        // Filter programs có trong search results
        const filteredprograms = allprograms.filter((fac) =>
          factoryCodes.includes(fac.program_code)
        );

        setProgram([{ tableName: "PROGRAM", data: filteredprograms }]);

        // QUAN TRỌNG: Kiểm tra selectProgram hiện tại có departments trong kết quả không
        const currentFactoryHasData = response.data.some(
          (dept) => dept.program_code === selectProgram?.program_code
        );

        if (!currentFactoryHasData && filteredprograms.length > 0) {
          // selectProgram hiện tại KHÔNG có departments trong kết quả
          // → Tự động chọn factory đầu tiên và hiển thị departments của nó
          const firstFactory = filteredprograms[0];
          setSelectProgram(firstFactory);

          const filteredData = response.data.filter(
            (d) => d.program_code === firstFactory.program_code
          );
          setData([{ tableName: "DEPARTMENTS", data: filteredData }]);
          setSelectRows(filteredData.length > 0 ? [filteredData[0]] : []);
        } else if (selectProgram?.program_code) {
          // SelectProgram hiện tại CÓ departments trong kết quả
          // → Giữ nguyên và hiển thị departments của nó
          const filteredData = response.data.filter(
            (d) => d.program_code === selectProgram.program_code
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

  const handleSearchFactory = async (newFilter) => {
    try {
      const response = await searchProgramsByFilter(
        newFilter,
        user.access_token
      );
      if (response.success) {
        setProgram([response]);
        const allDeptsCombined = await fnQuery([
          () => fetchProgramFieldTitle(),
        ]);
        const allDepts = allDeptsCombined?.[0]?.data || [];
        const factoryCodes = response.data.map((fac) => fac.program_code);
        const filteredDepts = allDepts.filter((dept) =>
          factoryCodes.includes(dept.program_code)
        );
        setIsSearch(true);
        setIsProgramSearch(true);
        setSelectProgram(response.data[0]);
        setSearchData(filteredDepts);
        setSelectRows([filteredDepts[0]]);
        setData([{ tableName: "PROGRAM_FIELD_TITLE", data: filteredDepts }]);
        setFilter(newFilter); // Lưu filter để dùng sau
      }
    } catch (error) {
      console.error("handleSearchFactory error:", error);
    }
  };

  const handleSearchByFilter = async (filteredShoe) => {
    try {
      const search = filteredShoe.search || {};
      const keys = Object.keys(search);
      if (keys.length === 0) {
        setIsSearch(false);
        setSearchData([]);
        if (isProgramSearch) {
          setIsProgramSearch(false);
        }
        await fetchS();
        if (selectProgram?.program_code) {
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
      const hasFactory = search.program_code || search.program_name;
      const hasOther = keys.some(
        (k) => k !== "program_code" && k !== "program_name"
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

  const handleImport = async () => {
    const form = new FormData();
    form.append("file", file);
    try {
      const result = await importExcelUser(user.access_token, form);
      console.log("tt: ", result);
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

  const handleExport = async () => {
    const excel = await exportExcelUser(user.access_token);
    if (excel) {
      toast.success("Export EXCEL successfully!");
    }
  };

  const handleExportPDF = async () => {
    const pdf = await exportPDFProgramFieldTitle();
    if (pdf) {
      toast.success("Export PDF successfully!");
    }
  };

  const handleFile = (e) => {
    const selectedFiled = e.target.files[0];
    if (selectedFiled) {
      setFile(selectedFiled);
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

  //  Helper function để lấy label từ columns
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
      <Box sx={{ p: 2 }}>
        <Container maxWidth="xl">
          <Stack
            direction="row"
            flexWrap="wrap"
            sx={{ rowGap: 1, width: "100%" }}
          >
            {data.length > 0 &&
              data.map((item, index) => (
                <Paper
                  sx={{
                    width: "100%",
                    maxWidth: "100%",
                    height: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    key={index}
                    style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}
                  >
                    <DataTable
                      data={item.data}
                      tableName={"PROGRAM_FIELD_TITLE"}
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
                      programs={programs}
                      selectProgram={selectProgram}
                      onSelectProgram={handleSelectProgram}
                      columnTranslations={columnTranslations}
                      controlTranslations={controlTranslations}
                      language={language}
                      getControlLabel={getControlLabel}
                      getColumnLabel={getColumnLabel}
                      jumpToRow={jumpToRow}
                    />
                  </div>
                </Paper>
              ))}
          </Stack>
        </Container>
      </Box>

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
      <AddProgramFieldTitlePage
        open={openAdd}
        onClose={handleAddClose}
        handleAdd={handleAdd}
        selectProgram={selectProgram}
        handleSelectProgram={setSelectProgram}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
        language={language}
      />
      <EditProgramFieldTitlePage
        open={openEdit}
        onClose={handleEditClose}
        programFieldTitle={selectRows.length > 0 ? selectRows[0] : null}
        handleEdit={handleEditDepartment}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
      />
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
export default ProgramFieldTitle;
