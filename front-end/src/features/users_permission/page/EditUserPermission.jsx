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
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Controller, get, useForm } from "react-hook-form";
import { fetchPermissionByID } from "../../../service/users_permission/UsersPermission";

const EditUserPermission = ({
  open,
  onClose,
  userPermisison,
  selectFactory,
  selectDepartment,
  selectProgram,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  language
}) => {
  const [permissionData, setPermissionData] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      allow_close: "Y",
      query_level: "1",
    },
  });
  const { t } = useTranslation();
  const nameBasedOnLanguage = {
    DEPARTMENTS: {
      en: "department_name_e",
      vi: "department_name_l",
      zh: "department_name_t",
    },
    FACTORY: {
      en: "factory_name_e",
      vi: "factory_name_l",
      zh: "factory_name_t",
    },
     PROGRAM: {
      en: "program_name_e",
      vi: "program_name_l",
      zh: "program_name_t",
    },
  };
  const fetchPerById = async () => {
    if (!userPermisison) return;
    setLoading(true);
    try {
      const response = await fetchPermissionByID(
        userPermisison.factory_code,
        userPermisison.department_code,
        userPermisison.user_code,
        userPermisison.program_code
      );
      const data = response?.data || response;
      if (data) {
        setPermissionData(data);
        reset({
          ...data,
          status: data?.status ?? "0",
          allow_close: data?.allow_close ?? "Y",
          query_level: data?.query_level ?? "1",
        });
      }
    } catch (error) {
      console.error("Error fetching permission:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userPermisison && Object.keys(userPermisison).length > 0 && open) {
      fetchPerById();
    }
  }, [userPermisison, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth>
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
              {getControlLabel("ttl_edit","Edit User Permission Information")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="400px"
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box mt={4}>
                <fieldset
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <legend style={{ padding: "0 8px", fontWeight: "bold" }}>
                    {getControlLabel("ftxt_fac_dept","Factory and Deparment Information")}
                  </legend>
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label={getControlLabel("txt_factory_code","factory_code")}
                        value={
                          permissionData?.factory_code ||
                          selectFactory?.factory_code ||
                          ""
                        }
                        InputLabelProps={{ shrink: true }}
                        aria-readonly
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label={getControlLabel("txt_factory_name","factory_name")}
                        value={selectFactory?.[nameBasedOnLanguage["FACTORY"][language]]|| ""}
                        InputLabelProps={{ shrink: true }}
                        aria-readonly
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label={getControlLabel("txt_department_code","department_code")}
                        value={
                          permissionData?.department_code ||
                          selectDepartment?.department_code ||
                          ""
                        }
                        InputLabelProps={{ shrink: true }}
                        aria-readonly
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label={getControlLabel("txt_department_name","department_name")}
                        value={selectDepartment?.[nameBasedOnLanguage["DEPARTMENTS"][language]] || ""}
                        InputLabelProps={{ shrink: true }}
                        aria-readonly
                      />
                    </Grid>
                  </Grid>
                </fieldset>

                <fieldset
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <legend style={{ padding: "0 8px", fontWeight: "bold" }}>
                    {getControlLabel("ftxt_program","Program Information")}
                  </legend>
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label={getControlLabel("txt_program_code","program_code")}
                        value={
                          permissionData?.program_code ||
                          permissionData?.PROGRAM?.program_code ||
                          ""
                        }
                        InputLabelProps={{ shrink: true }}
                        aria-readonly
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label={getControlLabel("txt_program_name","program_name")}
                        value={permissionData?.PROGRAM?.[nameBasedOnLanguage["PROGRAM"][language]] || ""}
                        InputLabelProps={{ shrink: true }}
                        aria-readonly
                      />
                    </Grid>
                  </Grid>
                </fieldset>
              </Box>

              <Box
                component="form"
                onSubmit={handleSubmit(handleEdit)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit(handleEdit)();
                  }
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Controller
                      name="modify_level"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          select
                          sx={{ width: "150px" }}
                          label={getColumnLabel("modify_level","modify_level")}
                          {...field}
                        >
                          <MenuItem value="1">{getControlLabel("ddl_factory","Factory")}</MenuItem>
                          <MenuItem value="2">{getControlLabel("ddl_department","Department")}</MenuItem>
                          <MenuItem value="3">{getControlLabel("ddl_user","User")}</MenuItem>
                        </TextField>
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Controller
                      name="query_level"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          select
                          sx={{ width: "150px" }}
                          label={getColumnLabel("query_level","query_level")}
                          {...field}
                        >
                           <MenuItem value="1">{getControlLabel("ddl_factory","Factory")}</MenuItem>
                          <MenuItem value="2">{getControlLabel("ddl_department","Department")}</MenuItem>
                          <MenuItem value="3">{getControlLabel("ddl_user","User")}</MenuItem>
                        </TextField>
                      )}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Controller
                      name="allow_query"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          select
                          sx={{ width: "150px" }}
                          label={getColumnLabel("allow_query","allow_query")}
                          {...field}
                        >
                          <MenuItem value="Y">Y</MenuItem>
                          <MenuItem value="N">N</MenuItem>
                        </TextField>
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Controller
                      name="allow_add"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          select
                          sx={{ width: "150px" }}
                          label={getColumnLabel("allow_add","allow_add")}
                          {...field}
                        >
                          <MenuItem value={"Y"}>Y</MenuItem>
                          <MenuItem value={"N"}>N</MenuItem>
                        </TextField>
                      )}
                    />
                  </Grid>
                </Grid>

                <Box mt={4}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Controller
                        name="allow_modify"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            select
                            sx={{ width: "150px" }}
                            label={getColumnLabel("allow_modify","allow_modify")}
                            {...field}
                          >
                            <MenuItem value={"Y"}>Y</MenuItem>
                            <MenuItem value={"N"}>N</MenuItem>
                          </TextField>
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller
                        name="allow_delete"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            select
                            sx={{ width: "150px" }}
                            label={getColumnLabel("allow_delete","allow_delete")}
                            {...field}
                          >
                            <MenuItem value={"Y"}>Y</MenuItem>
                            <MenuItem value={"N"}>N</MenuItem>
                          </TextField>
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller
                        name="allow_cancel"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            select
                            sx={{ width: "150px" }}
                            label={getColumnLabel("allow_cancel","allow_cancel")}
                            {...field}
                          >
                            <MenuItem value={"Y"}>Y</MenuItem>
                            <MenuItem value={"N"}>N</MenuItem>
                          </TextField>
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller
                        name="allow_confirm"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            select
                            sx={{ width: "150px" }}
                            label={getColumnLabel("allow_confirm","allow_confirm")}
                            {...field}
                          >
                            <MenuItem value={"Y"}>Y</MenuItem>
                            <MenuItem value={"N"}>N</MenuItem>
                          </TextField>
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller
                        name="allow_close"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            select
                            sx={{ width: "150px" }}
                            label={getColumnLabel("allow_close","allow_close")}
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
            </>
          )}
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserPermission;
