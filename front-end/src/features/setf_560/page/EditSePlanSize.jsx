import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  Paper,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const EditSePlanSizeCtns = ({
  open,
  onClose,
  sePlanSize,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
}) => {
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      ctns: 0,
    },
  });

  const [validationInfo, setValidationInfo] = useState(null);
  const currentCtns = watch("ctns");

  // Reset form khi mở dialog
  useEffect(() => {
    if (open && sePlanSize && Object.keys(sePlanSize).length > 0) {
      reset({
        ctns: sePlanSize.ctns || 0,
      });
      setValidationInfo(null);
    }
  }, [sePlanSize, open, reset]);

  // Check if CTNS changed
  const hasCtnsChanged = () => {
    const originalCtns = parseFloat(sePlanSize?.ctns) || 0;
    const newCtns = parseFloat(currentCtns) || 0;
    return originalCtns !== newCtns;
  };

  const onSubmit = (data) => {
    // Chỉ submit nếu CTNS thay đổi
    if (!hasCtnsChanged()) {
      setValidationInfo({
        type: "warning",
        message: getControlLabel("noti_no_change", "No changes detected"),
      });
      return;
    }

    // Prepare update data
    const updateData = {
      ...sePlanSize, // Giữ nguyên các field khác
      ctns: parseFloat(data.ctns) || 0,
      last_user: user.user_code,
      last_date: new Date().toISOString(),
    };

    handleEdit(updateData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <Paper sx={{ p: 3 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={3}
          >
            <Typography variant="h5" fontWeight={600}>
              {getControlLabel("ttl_d_edit", "Edit CTNS")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error" size="small">
              <CloseIcon />
            </Button>
          </Box>

          {validationInfo && (
            <Alert severity={validationInfo.type} sx={{ mb: 2 }}>
              {validationInfo.message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Read-only Info */}
            <fieldset
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <legend style={{ padding: "0 8px", fontWeight: "bold" }}>
                {getControlLabel("ftxt_m_fac_dept", "Information")}
              </legend>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("factory_code", "Factory Code")}
                    value={user?.factory || ""}
                    InputLabelProps={{ shrink: true }}
                    disabled
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("se_id", "SE ID")}
                    value={sePlanSize?.se_id || ""}
                    InputLabelProps={{ shrink: true }}
                    disabled
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("pack_gu", "Pack GU")}
                    value={sePlanSize?.pack_gu || ""}
                    InputLabelProps={{ shrink: true }}
                    disabled
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("pk_seq", "PK Seq")}
                    value={sePlanSize?.pk_seq || ""}
                    InputLabelProps={{ shrink: true }}
                    disabled
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("current_cbm", "Current CBM")}
                    value={sePlanSize?.cbm || "0.0000"}
                    InputLabelProps={{ shrink: true }}
                    disabled
                    size="small"
                  />
                </Grid>
              </Grid>
            </fieldset>

            {/* Editable CTNS Field */}
            <Box mb={3}>
              <TextField
                fullWidth
                label={getColumnLabel("ttl_ctns", "CTNS (計劃數)")}
                type="number"
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  step: "0.0001",
                  min: 0,
                }}
                {...register("ctns", {
                  valueAsNumber: true,
                  required: getControlLabel("err_ctns_required", "CTNS is required"),
                  min: {
                    value: 0,
                    message: getControlLabel("err_ctns_min", "CTNS must be >= 0"),
                  },
                })}
                helperText={
                  hasCtnsChanged()
                    ? getControlLabel(
                        "info_ctns_changed",
                        `Original: ${sePlanSize?.ctns || 0} → New: ${currentCtns || 0}`,
                      )
                    : getControlLabel("info_no_change", "No changes")
                }
              />
            </Box>

            {/* Action Buttons */}
            <Grid container spacing={2} justifyContent="flex-end">
              <Grid item>
                <Button variant="outlined" onClick={onClose}>
                  {getControlLabel("btn_cancel", "Cancel")}
                </Button>
              </Grid>
              <Grid item>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!hasCtnsChanged()}
                >
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

export default EditSePlanSizeCtns;