import { useEffect } from "react";
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

const EditAcIssueMatdT = ({
  open,
  onClose,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  selectRows,
}) => {
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      factory_code: "",
      conf_seq: "",
      matd_seq: "",
      prod_no: "",
      matd_no: "",
      unit_qty: "",
      loss: "",
      req_qty: "",
      req_issue: "",
      issue_qty: "",
      remark: "",
      status: 1,
    },
  });

  const selectedRow = selectRows?.[0] || {};

  useEffect(() => {
    if (open && selectedRow) {
      setValue("factory_code", selectedRow.factory_code || "");
      setValue("conf_seq", selectedRow.conf_seq || "");
      setValue("matd_seq", selectedRow.matd_seq || "");
      setValue("prod_no", selectedRow.prod_no || "");
      setValue("matd_no", selectedRow.matd_no || "");
      setValue("unit_qty", selectedRow.unit_qty || "");
      setValue("loss", selectedRow.loss || "");
      setValue("req_qty", selectedRow.req_qty || "");
      setValue("req_issue", selectedRow.req_issue || "");
      setValue("issue_qty", selectedRow.issue_qty || "");
      setValue("remark", selectedRow.remark || "");
      setValue("status", selectedRow.status || "");
    } else {
      reset();
    }
  }, [open]);

  const onSubmit = (data) => {
    handleEdit(data);
  };

  return (
    <Dialog open={open} onClose={() => onClose(null)} maxWidth="md" fullWidth>
      <DialogContent>
        <Paper sx={{ maxWidth: "900px", mx: "auto", p: 3 }}>
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
              {getControlLabel("ttl_d_1_edit", "Edit AC_ISSUE_MATD_T")}
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
            {/* Row 1 - Read only fields */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: true }}
                  {...register("factory_code")}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("conf_seq", "Conf Seq")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: true }}
                  {...register("conf_seq")}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("matd_seq", "Matd Seq")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: true }}
                  {...register("matd_seq")}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("prod_no", "Prod No")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: true }}
                  {...register("prod_no")}
                />
              </Grid>
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("matd_no", "Matd No")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: true }}
                  {...register("matd_no")}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("unit_qty", "Unit Qty")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: true }}
                  helperText="Auto calculated"
                  {...register("unit_qty")}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("loss", "Loss")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: true }}
                  helperText="Auto calculated"
                  {...register("loss")}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("req_qty", "Req Qty")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: true }}
                  helperText="Auto calculated"
                  {...register("req_qty")}
                />
              </Grid>
            </Grid>

            {/* Row 3 */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("req_issue", "Req Issue")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: true }}
                  helperText="Y/N"
                  {...register("req_issue")}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("issue_qty", "Issue Qty")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: true }}
                  helperText="Auto calculated"
                  {...register("issue_qty")}
                />
              </Grid>

              {/* ONLY EDITABLE FIELD */}
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("remark", "Remark")}
                  InputLabelProps={{ shrink: true }}
                  helperText="User input"
                  {...register("remark")}
                />
              </Grid>
            </Grid>

            {/* Submit Button */}
            <Grid container spacing={2} justifyContent="flex-end" mt={3}>
              <Grid item>
                <Button variant="outlined" onClick={onClose}>
                  {getControlLabel("btn_cancel", "Cancel")}
                </Button>
              </Grid>
              <Grid item>
                <Button type="submit" variant="contained" color="primary">
                  {getControlLabel("btn_save", "Save")}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default EditAcIssueMatdT;
