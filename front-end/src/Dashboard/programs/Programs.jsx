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
  deleteAllUsers,
  exportExcelUser,
  importExcelUser,
} from "../../service/user/userService";

import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify";
import AcShoeMDeletePage from "../../features/ac_shoe_m/page/AcShoeMDeletePage";
import {
  deleteFactory,
} from "../../service/factory/factoryService";

import {
  addPrograms,
  editPrograms,
  exportPDFPrograms,
  fetchPrograms,
  searchProgramsByFilter,
} from "../../service/program/programService";
import AddProgramPage from "../../features/programs/page/AddProgramPage";
import EditProgramPage from "../../features/programs/page/EditProgramPage";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import { fetchTablePermission } from "../../service/users_permission/UsersPermission";
const Program = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectRow, setSelectRow] = useState(null);
  const [selectRows, setSelectRows] = useState([]);
  const [filter, setFilter] = useState("");
  const [file, setFile] = useState(null);
  const [jumpToRow, setJumpToRow] = useState(null);
  const [authorization, setAuthorizations] = useState({});
  const {
    fetchTableControlTranslations,
    fetchTableColumnTranslations,
    language,
  } = useColumnTranslation();
  const [columnTranslations, setColumnTranslations] = useState([]);
  const [controlTranslations, setControlTranslations] = useState([]);
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const { user } = useAuth();
 

  const fetchF = async () => {
    const combinedData = await fnQuery([() => fetchPrograms(user?.access_token)]);
    setData(combinedData);
    if (combinedData?.[0]?.data?.length > 0) {
      setSelectRows([combinedData[0].data[0]]);
    }
  };
  useEffect(() => {
    fetchF();
  }, []);
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
  const handleEditClose = () => {
    setOpenEdit(false);
  };

  const handleOpenEdit = () => {
    if (selectRows.length === 1) {
      const allow = authorization?.find(
        (item) => item.field === "allow_modify"
      )?.title;
      if (user?.user_code !== "admin" && allow === "N") {
        return;
      }
      setOpenEdit(true);
    }
  };
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
  const handleClose = () => setOpen(false);
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
  const handleAdd = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = Object.fromEntries(form.entries());
    data.grt_user = user.user_code;
    data.grt_dept = user.department_code;
    try {
      const response = await addPrograms(user.access_token, data);
      if (response.success) {
        toast.success("Add successfully !!!");
        handleAddClose();
        try {
          const combinedData = await fnQuery([() => fetchPrograms(user?.access_token)]);
          if (combinedData && combinedData[0]?.data) {
            setData(combinedData);
            const addedP = combinedData[0].data.find(
              (item) => item.program_code === data.program_code
            );
            if (addedP) {
              setSelectRows([addedP]);
              setJumpToRow(addedP);
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
      toast.error(`${error.response?.data?.message}`);
    }
  };
  const handleEditProgram = async (data, title) => {
    try {
      data.last_user = user.user_code;
      data.last_date = new Date().toISOString();
      const { statusText, ...res } = data;

      const response = await editPrograms(user.access_token, res);
      if (response.success) {
        const successMessage =
          typeof title === "string" && title
            ? title
            : `Edit program with code(${res.program_code}) successfully !!!`;
        toast.success(successMessage, {
          toastId: `${res.program_code}-${res.status}-${Date.now()}`,
        });
        setData((prevData) => {
          if (!prevData.length) return prevData;
          const { program_code } = res;
          const uniqueKey = program_code;
          const updateData = prevData.map((table) => ({
            ...table,
            data: table.data.map((item) => {
              const itemKey = item.program_code;
              return itemKey === uniqueKey ? { ...item, ...res } : item;
            }),
          }));
          return updateData;
        });
        setSelectRows([res]);
        handleEditClose(close);
      } else {
        toast.error(`${response?.data?.message}(${data.factory_code}`);
      }
    } catch (error) {
      toast.error(`${error.response?.data?.message}`);
      console.log("data has been problem", error);
    }
  };
  const handleSingleDelete = async () => {
    const result = await deleteFactory(user.access_token, selectRow);
    if (result.success) {
      await fetchF();
      toast.success(
        `Delete factory with program code(${res.factory_code}) successfully !!!`
      );
      handleClose();
    } else {
      toast.error(`${response?.data?.message}(${data.factory_code}`);
      handleClose();
    }
  };
  const handleDeleteAll = async () => {
    try {
      const deleteAll = await deleteAllUsers(selectRows, user.access_token);
      if (deleteAll.success) {
        await fetchF();
        toast.success("Delete all item successfully");
        handleClose();
      }
    } catch (error) {
      console.log("Can't delete all because :", error);
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
  const handleSearchByFilter = async (filteredShoe) => {
    try {
      const response = await searchProgramsByFilter(
        filteredShoe,
        user.access_token
      );
      if (response && response.data) {
        if (response.data.length === 0) {
          setSelectRows([]);
          setData([{ tableName: "PROGRAM", data: response.data }]);
        } else {
          setSelectRows([response.data[0]]);
          setData([{ tableName: response.tableName, data: response.data }]);
        }
      }
    } catch (error) {
      console.log("cannot search because", error);
    }
  };
  const handleCancel = async () => {
    if (selectRows.length === 1) {
      const allow = authorization?.find(
        (item) => item.field === "allow_cancel"
      )?.title;
      if (user?.user_code !== "admin" && allow === "N") {
        return;
      }
      const updateCancel = { ...selectRows[0], status: 0 };
      await handleEditProgram(updateCancel, "status");
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
      const updateCancel = { ...selectRows[0], status: 1 };
      await handleEditProgram(updateCancel, "status");
    }
  };
  const handleImport = async () => {
    const form = new FormData();
    form.append("file", file);
    try {
      const result = await importExcelUser(user.access_token, form);
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
  const handleExport = async () => {
    const excel = await exportExcelUser(user.access_token);
  };
  const handlePDF = async () => {
    await exportPDFPrograms();
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

  const getColumnLabel = (fieldCode, fallback) => {
    if (!columnTranslations || columnTranslations.length === 0) {
      return fallback;
    }

    const translation = columnTranslations.find(
      (item) => item.field === fieldCode
    );
    return translation?.title || fallback;
  };
  const fetchAllTranslations = async () => {
    try {
      const [columns, controls, auth] = await fnQuery([
        () => fetchTableColumnTranslations("PROGRAM"),
        () => fetchTableControlTranslations("PROGRAM"),
        () =>
          fetchTablePermission(
            user.factory,
            user.department,
            user.user_code,
            "PROGRAM"
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
                      tableName={"PROGRAM"}
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
                  </div>
                </Paper>
              ))}
          </Stack>
        </Container>
      </Box>

      {data.length === 0 && (
        <Stack direction="row" flexWrap="wrap" sx={{ rowGap: 1 }}>
          <div style={{ width: itemWidth, minWidth: 0 }}>
            <Skeleton animation="wave" variant="rectangular" height={600} />
          </div>
        </Stack>
      )}
      <AddProgramPage
        open={openAdd}
        onClose={handleAddClose}
        handleAdd={handleAdd}
        getControlLabel={getControlLabel}
        getColumnLabel={getColumnLabel}
      />
      <EditProgramPage
        open={openEdit}
        onClose={handleEditClose}
        program={selectRows.length > 0 ? selectRows[0] : null}
        handleEdit={handleEditProgram}
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
export default Program;
