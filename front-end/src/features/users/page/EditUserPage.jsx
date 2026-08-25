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
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Dropdown from "../../../component/dropdown/Dropdown";
import CloseIcon from "@mui/icons-material/Close";
import {
  fetchSingleUser,
  fetchUserByDepartment,
} from "../../../service/user/userService";
import { useEffect, useState } from "react";

const EditUserPage = ({
  open,
  onClose,
  handleEdit,
  handleSelectSupervisor,
  selectUser,
  selectSupervisor,
  getColumnLabel,
  getControlLabel,
  language="en"
}) => {
  const [factory, setFactory] = useState({});
  const [department, setDepartment] = useState({});
  const [users, setUsers] = useState([]);

 
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      ...selectUser,
      allow_authorization: selectUser?.allow_authorization ?? "Y",
      factory_code: selectUser?.factory ?? "",
      department_code: selectUser?.department_code ?? "",
    },
  });
  useEffect(() => {
    if (selectUser) {
      reset({
        ...selectUser,
        allow_authorization: selectUser?.allow_authorization ?? "Y",
        factory_code: selectUser?.factory_code ?? "",
        department_code: selectUser?.department_code ?? "",
      });
    }
  }, [selectUser, reset]);
  const getSingleUser = async () => {
    const response = await fetchSingleUser(
      selectUser.factory_code,
      selectUser.department_code,
      selectUser.user_code
    );
    if (response) {
      console.log("re", response);

      const { FACTORY, DEPARTMENT } = response.data;
      setFactory(FACTORY);
      setDepartment(DEPARTMENT);
    }
  };
  const fetchUserByDept = async () => {
    const response = await fetchUserByDepartment(
      selectUser.factory_code,
      selectUser.department_code
    );
    if (response) {
      setUsers([{ tableName: response.tableName, data: response.data }]);
    }
  };

  useEffect(() => {
    if (selectUser) {
      getSingleUser();
      fetchUserByDept();
    }
  }, [selectUser]);
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
              sx={{ flex: 1 }}
              mb={"0"}
            >
              {getControlLabel("ttl_edit","Edit User Information")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>
          <Box component="form" onSubmit={handleSubmit(handleEdit)}>
            <fieldset
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              {" "}
              <legend style={{ padding: "0 8px", fontWeight: "bold" }}>
                {getControlLabel("mtxt_factory","Factory Information")}
              </legend>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_factory_name_t","factory_name_t")}
                    value={factory?.factory_name_t || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_factory_name_e","factory_name_e")}
                    value={factory?.factory_name_e || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_factory_name_l","factory_name_l")}
                    value={factory?.factory_name_l || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_factory_address","factory_address")}
                    value={factory?.factory_address || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_factory_abbreviation","factory_abbreviation")}
                    value={factory?.factory_abbreviation || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel("txt_factory_tax_no","factory_tax_no")}
                    value={factory?.factory_tax_no || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
              </Grid>
            </fieldset>
            <Box mt={4}>
              <fieldset
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "24px",
                }}
              >
                {" "}
                <legend style={{ padding: "0 8px", fontWeight: "bold" }}>
                  {getControlLabel("mtxt_department","Department Information")}
                </legend>
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label={getControlLabel("txt_department_name_t","department_name_t")}
                      value={department?.department_name_t || ""}
                      InputLabelProps={{ shrink: true }}
                      aria-readonly
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label={getControlLabel("txt_department_name_e","department_name_e")}
                      value={department?.department_name_e || ""}
                      InputLabelProps={{ shrink: true }}
                      aria-readonly
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label={getControlLabel("txt_department_name_l","department_name_l")}
                      value={department?.department_name_l || ""}
                      InputLabelProps={{ shrink: true }}
                      aria-readonly
                    />
                  </Grid>
                </Grid>
              </fieldset>
            </Box>
            <Box mt={4}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("user_name_t","user_name_t")}
                    name="user_name_t"
                    {...register("user_name_t")}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("user_name_e","user_name_e")}
                    name="user_name_e"
                    {...register("user_name_e")}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("user_name_l","user_name_l")}
                    name="user_name_l"
                    {...register("user_name_l")}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box mt={4}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Dropdown
                    data={users[0]?.data?.filter(user => user.user_code !== selectUser?.user_code)}
                    select={selectSupervisor}
                    onSelect={handleSelectSupervisor}
                    table="USER"
                    option="user"
                    getControlLabel={getControlLabel}
                    language={language}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Controller
                    name="allow_authorization"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        select={field.value}
                        sx={{ width: "150px" }}
                        label={getColumnLabel("allow_authorization","allow_authorization")}
                        {...field}
                      >
                        <MenuItem value={"Y"}>Y</MenuItem>
                        <MenuItem value={"N"}>N</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box mt={4} display={"flex"} gap={"6px"}>
              <Button type="submit" variant="contained" color="primary">
                {getControlLabel("btn_save","Save")}
              </Button>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};
export default EditUserPage;
