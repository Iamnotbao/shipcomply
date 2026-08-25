import { lazy, useEffect, useState } from "react";

import {
  Box,
  Grid,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { fnQuery } from "../../utils/fnQuery";
import {
  deleteAllUsers,
  deleteUser,
  exportExcelUser,
  fetchUsers,
  importExcelUser,
  searchUserByFilter,
} from "../../service/user/userService";

import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  deleteFactory,
  fetchFactory,
} from "../../service/factory/factoryService";
import { fetchDepartmentByFac } from "../../service/factory_departments/FacDepartmentService";
import UserPage from "../../features/users/page/UserPage";
const FactoryUsers = () => {
  const [factories, setFactories] = useState([]);
  const [department, setDepartment] = useState([]);
  const [open, setOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectFactory, setSelectFactory] = useState({});
  const [selectDepartment, setSelectDepartment] = useState({});
  const [selectRow, setSelectRow] = useState({});
  const [selectRows, setSelectRows] = useState([]);
  const [filter, setFilter] = useState("");
  const [file, setFile] = useState(null);
  const [showDepartment, setShowDepartment] = useState(false);
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
  const { user } = useAuth();

  const navigation = useNavigate();
  const fetchF = async () => {
    const combinedfactories = await fnQuery([() => fetchFactory()]);
    setFactories(combinedfactories);
  };
  const fetchD = async () => {
    const combinedDepartment = await fnQuery([
      () => fetchDepartmentByFac(selectFactory.factory_code),
    ]);
    setDepartment(combinedDepartment);
  };
  useEffect(() => {
    fetchF();
  }, []);
  useEffect(() => {
    if (factories && factories.length > 0) {
      setSelectFactory(factories[0]?.data?.[0]);
    }
  }, [factories]);

  useEffect(() => {
    if (selectFactory) {
      fetchD();
    }
  }, [selectFactory]);
  useEffect(() => {
    if (department && department.length > 0) {
      setSelectDepartment(department[0]?.data?.[0]);
    }
  }, [department]);

  const handleSelectFactory = (fac) => {
    setSelectFactory(fac);
  };
  const handleSelectDepartment = (dept) => {
    setSelectDepartment(dept);
  };
  const handleSelectChoose = (rows) => {
    setSelectRows(rows);
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
  const handleDetailClose = () => setOpenDetail(false);
  const onSetFilter = (filter) => {
    setFilter(filter);
  };
  const handleSingleDelete = async () => {
    const result = await deleteFactory(user.access_token, selectRow);
    if (result.success) {
      await fetchF();
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
      const response = await searchUserByFilter(
        filteredShoe,
        user.access_token
      );
      if (response && response.factories) {
        setfactories([
          { tableName: response.tableName, factories: response.factories },
        ]);
      }
    } catch (error) {
      console.log("cannot search because", error);
    }
  };
  const handleImport = async () => {
    const form = new Formfactories();
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
  const handleFile = (e) => {
    const selectedFiled = e.target.files[0];
    if (selectedFiled) {
      setFile(selectedFiled);
    }
  };
  const handleDepartmentDetail = async (row) => {
    setSelectRow(row);
    setShowDepartment(true);
  };
  const handleDepartmentsDetailClose = async () => {
    setShowDepartment(false);
  };
  let columns = 1;
  if (isLgUp) columns = 3;
  else if (isMdUp) columns = 2;
  else if (isSmUp) columns = 1;
  else columns = 1;
  const itemWidth =
    factories.length > 0 ? `${100 / factories.length}%` : `${100 / columns}%`;
  return (
    <Box sx={{ p: 2 }}>
      <Typography
        variant="h4"
        fontWeight={"bold"}
        gutterBottom
        component="div"
        textAlign={"center"}
        sx={{ mb: 2 }}
      >
       User
      </Typography>

      <Grid
        container
        spacing={2}
        sx={{ display: "flex", justifyContent: "center", height: "500px" }}
      >
        {/* <Grid item xs={12} md={2} lg={4}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              *Factory
            </Typography>
            <List>
              {factories[0]?.data.map((fac) => (
                <ListItem key={fac.factory_code} disablePadding>
                  <ListItemButton
                    selected={selectFactory?.factory_code === "2010"}
                    onClick={() => handleSelectFactory(fac)}
                  >
                    <ListItemText primary={fac.factory_name_e} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={2} lg={4}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              *Department
            </Typography>
            <List>
              {department[0]?.data.map((dept) => (
                <ListItem key={dept.department_code} disablePadding>
                  <ListItemButton
                    selected={selectDepartment?.department_code === "2010"}
                    onClick={() => handleSelectDepartment(dept)}
                  >
                    <ListItemText primary={dept.department_name_e} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid> */}

        {/* BÊN PHẢI */}
          {factories.length > 0 ? (
            <UserPage/>
          ) : (
            <Skeleton animation="wave" variant="rectangular" height={600} />
          )}
      </Grid>
    </Box>
  );
};
export default FactoryUsers;
