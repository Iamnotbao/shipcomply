import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { fetchDeptByID } from "../../../service/factory_departments/FacDepartmentService";
import { useEffect, useState } from "react";
import { fnQuery } from "../../../utils/fnQuery";
import CloseIcon from "@mui/icons-material/Close";

const EditDepartmentPage = ({ open, onClose, department, handleEdit,getControlLabel,getColumnLabel }) => {
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      ...department,
    },
  });
  
  const { t } = useTranslation();
  const [factory, setFactory] = useState({});
   const getStatusText = (status) => {
    if (status === 1) return "New-1";
    if (status === 0) return "Cancel-0";
    return "New-1"; 
  };
  useEffect(() => {
    if (department && Object.keys(department).length > 0) {
      const statusText = getStatusText(department.status);
      reset({
        ...department,
        statusText: statusText,
      });
    }
  }, [department, reset]);
  const fetchDepartmentByID = async () => {
    const response = await fnQuery([
      () => fetchDeptByID(department.factory_code, department.department_code),
    ]);
    if (response[0].success) {
      const { FACTORY } = response[0].data;
      setFactory(FACTORY);
    }
  };
  useEffect(() => {
    if (open && department?.factory_code && department?.department_code) {
      fetchDepartmentByID();
    }
  }, [open, department]);

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
              {getControlLabel("ttl_edit","Edit Department Information")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>{" "}
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
                {getControlLabel("ftxt_factory","Factory Information")}
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
          </Box>
          <Box component="form" 
          onSubmit={handleSubmit(handleEdit)}
           onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(handleEdit)();
              }}}
          >
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("department_code","department_code")}
                  name="department_code"
                  InputLabelProps={{ shrink: true }}
                  {...register("department_code")}
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                 <TextField
                    fullWidth
                    label={getColumnLabel("status","status")}
                    name="status"
                    {...register("statusText")}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
              </Grid>
            </Grid>
            <Box mt={4}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("department_name_t","department_name_t")}
                    name="department_name_t"
                    InputLabelProps={{ shrink: true }}
                    {...register("department_name_t")}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("department_name_e","department_name_e")}
                    name="department_name_e"
                    InputLabelProps={{ shrink: true }}
                    {...register("department_name_e")}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("department_name_l","department_name_l")}
                    name="department_name_l"
                    InputLabelProps={{ shrink: true }}
                    {...register("department_name_l")}
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
export default EditDepartmentPage;
