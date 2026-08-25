import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Dropdown from "../../../component/dropdown/Dropdown";
import CloseIcon from "@mui/icons-material/Close";
import { fetchFactory } from "../../../service/factory/factoryService";
import { use, useEffect, useState } from "react";
import { fnQuery } from "../../../utils/fnQuery";
import { fetchDepartmentByFac } from "../../../service/factory_departments/FacDepartmentService";
const AddUserPage = ({
  open,
  handleClose,
  handleAdd,
  users,
  selectUser,
  selectFactory,
  selectDepartment,
  handleSelectFactory,
  handleSelectDepartment,
  handleSelectUser,
  getColumnLabel,
  getControlLabel,
  language = "en",
}) => {
  const { t } = useTranslation();
  const [factories, setFactories] = useState([]);
  const [departments, setDepartments] = useState([]);
  console.log("add pop up", factories);
  const fetchF = async () => {
    const [factories] = await fnQuery([() => fetchFactory()]);
    if (factories) {
      setFactories(factories);
    }
  };
  const fetchD = async () => {
    const [departments] = await fnQuery([
      () => fetchDepartmentByFac(selectFactory.factory_code),
    ]);
    if (departments) {
      setDepartments(departments);
    }
  };
  useEffect(() => {
    fetchF();
  }, []);
  useEffect(() => {
    fetchD();
  }, [selectFactory]);
  // const fetchUser = async () => {
  //   const result = await fetchUserByDepartment(
  //     user.access_token,
  //     selectFactory,
  //     selectDepartment
  //   );
  //   if (result.success) {
  //     setUsers(result);
  //   }
  // };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogContent>
        <Paper sx={{ maxWidth: "1200px", mx: "auto", p: 3 }}>
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
              {getControlLabel("ttl_add", "Add User Information")}
            </Typography>
            <Button onClick={handleClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>
          <Box component="form" onSubmit={handleAdd}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Dropdown
                  key={selectFactory}
                  select={selectFactory}
                  data={factories?.data}
                  onSelect={handleSelectFactory}
                  getControlLabel={getControlLabel}
                  language={language}
                />
              </Grid>
              <Grid item xs={6}>
                <Dropdown
                  key={selectDepartment}
                  select={selectDepartment}
                  data={departments?.data}
                  onSelect={handleSelectDepartment}
                  language={language}
                  table="DEPARTMENTS"
                  option="department"
                  getControlLabel={getControlLabel}
                />
              </Grid>
              <Grid item xs={6}>
                <Dropdown
                  key={selectUser}
                  select={selectUser}
                  data={users[0]?.data}
                  onSelect={handleSelectUser}
                  getControlLabel={getControlLabel}
                  language={language}
                  table="USER"
                  option="user"
                />
              </Grid>
            </Grid>
            <Box mt={4}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("user_code", "user_code")}
                    name="user_code"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    type="password"
                    fullWidth
                    label={getColumnLabel("user_password", "user_password")}
                    name="user_password"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    select
                    sx={{ width: "150px" }}
                    label={getColumnLabel(
                      "allow_authorization",
                      "allow_authorization"
                    )}
                    name="allow_authorization"
                    defaultValue={"Y"}
                  >
                    <MenuItem value={"Y"}>Y</MenuItem>
                    <MenuItem value={"N"}>N</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Box>
            <Box mt={4}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("user_name_t", "user_name_t")}
                    name="user_name_t"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("user_name_l", "user_name_l")}
                    name="user_name_l"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("user_name_e", "user_name_e")}
                    name="user_name_e"
                  />
                </Grid>
              </Grid>
            </Box>
            <Box mt={4}>
              <Button type="submit" variant="contained" color="primary">
                {getControlLabel("btn_save", "Save")}
              </Button>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};
export default AddUserPage;
