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
import {  useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect } from "react";

const EditFactoryPage = ({ open, onClose, factory, handleEdit, getControlLabel, getColumnLabel }) => {
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      ...factory,
    },
  });
  const getStatusText = (status) => {
    if (status === 1) return "New-1";
    if (status === 0) return "Cancel-0";
    return "New-1"; 
  };
  
  useEffect(() => {
    if (factory?.factory_code) {
      const statusText = getStatusText(factory.status);
      
      reset({
        ...factory,
        statusText: statusText,
      });
    }
  }, [factory?.factory_code, factory?.status, reset]);

  const onSubmit = (data) => {
    // Xóa statusText trước khi submit vì nó chỉ dùng để hiển thị
    const { statusText, ...submitData } = data;
    handleEdit(submitData);
  };
  
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
              {getControlLabel("ttl_edit","Edit Factory Information")}
            </Typography>
            <Button
              onClick={()=>onClose(null)}
              variant="contained"
              color="error"
            >
              <CloseIcon />
            </Button>
          </Box>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(onSubmit)();
              }
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code","factory_code")}
                  name="factory_code"
                  {...register("factory_code")}
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_name_t","Factory Name T")}
                  name="factory_name_t"
                  {...register("factory_name_t")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_name_e","factory_name_e")}
                  name="factory_name_e"
                  {...register("factory_name_e")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_name_l","factory_name_l")}
                  name="factory_name_l"
                  {...register("factory_name_l")}
                />
              </Grid>
            </Grid>

            <Box mt={4}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("factory_address","factory_address")}
                    name="factory_address"
                    {...register("factory_address")}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("factory_abbreviation","factory_abbreviation")}
                    name="factory_abbreviation"
                    {...register("factory_abbreviation")}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("factory_tax_no","factory_tax_no")}
                    name="factory_tax_no"
                    {...register("factory_tax_no")}
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
export default EditFactoryPage;