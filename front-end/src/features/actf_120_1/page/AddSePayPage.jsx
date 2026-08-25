import { useEffect, useState } from "react";
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
import { useForm } from "react-hook-form";

const AddSePay = ({
  open,
  onClose,
  sePay,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
}) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: sePay || {},
  });

  useEffect(() => {
    if (open && sePay) {
      reset(sePay);
    }
  }, [open, sePay, reset]);

  useEffect(() => {
    if (!open) {
      reset({});
    }
  }, [open, reset]);

  const onSubmit = (data) => {
    console.log("📤 Form data being submitted:", data);
    handleAdd(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
              {getControlLabel("ttl_m_add", "Add SE Pay Information")}
            </Typography>
            <Button
              onClick={() => onClose(null)}
              variant="contained"
              color="error"
            >
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Row 1 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("pay_no", "Pay No")}
                  {...register("pay_no")}
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("name_s", "Name (Simplified)")}
                  {...register("name_s")}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("name_t", "Name (Traditional)")}
                  {...register("name_t")}
                />
              </Grid>
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("name_e", "Name (English)")}
                  {...register("name_e")}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("dt_pct", "DT PCT (%)")}
                  type="number"
                  inputProps={{
                    step: "0.01",
                    min: 0,
                    max: 100,
                  }}
                  {...register("dt_pct", {
                    valueAsNumber: true,
                  })}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("cal_days", "Cal Days")}
                  type="number"
                  inputProps={{
                    step: "1",
                    min: 0,
                  }}
                  {...register("cal_days", {
                    valueAsNumber: true,
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={getColumnLabel("note", "Note")}
                  {...register("note")}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>

            {/* Submit Button */}
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

export default AddSePay;
