import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import CloseIcon from "@mui/icons-material/Close";
import Dropdown from "../../../component/dropdown/Dropdown";
import {
  fetchAllAcNo,
  fetchAllInvoiceNo,
} from "../../../service/ac_req_m/AcReqMService";

const EditImport_2Page = ({
  open,
  vwAcSrcorder,
  onClose,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
}) => {
  const getStatusText = (status) => {
    return status || "";
  };
  console.log("check the exist âcdad", vwAcSrcorder);

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      ...vwAcSrcorder,
    },
  });
  useEffect(() => {
    if (vwAcSrcorder && open) {
      const statusText = getStatusText(vwAcSrcorder.status);
      reset({
        ...vwAcSrcorder,
        factory_code: user?.factory || vwAcSrcorder.factory_code,
        statusText: statusText,
        bl_qty: vwAcSrcorder.bl_qty || 0,
        ac_req: vwAcSrcorder.ac_req || 0,
      });
    }
  }, [vwAcSrcorder, open, reset]);

  // Xử lý submit
  const onSubmit = (data) => {
    console.log("cc t nef", data);
    handleEdit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl">
      <DialogContent>
        <Paper sx={{ maxWidth: "1400px", mx: "auto", p: 3 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={2}
          >
            <Typography
              variant="h4"
              textTransform="uppercase"
              fontWeight={600}
              textAlign="center"
              flex={1}
              mb={0}
            >
              {getControlLabel("ttl_edit", "Edit Vw Ac Srcorder Information")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <Controller
                  name="factory_code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={getColumnLabel("factory_code", "Factory Code")}
                      disabled
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="bl_qty"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={getColumnLabel("bl_qty", "BL Qty")}
                      type="number"
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => field.onChange(Number(e.target.value))} // parse về number
                    />
                  )}
                />
              </Grid>

              <Grid item xs={6}>
                <Controller
                  name="ac_req"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={getColumnLabel("ac_req", "AC Req")}
                      type="number"
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Box mt={4} display="flex" justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                {getControlLabel("btn_save", "Save")}
              </Button>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default EditImport_2Page;
