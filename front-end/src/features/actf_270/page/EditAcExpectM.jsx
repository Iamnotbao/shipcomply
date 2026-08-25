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

const EditAcExpectM = ({
  open,
  onClose,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  selectRows,
}) => {
  const selectedRow = selectRows?.[0] || {};

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      factory_code: "",
      expect_id: "",
      type: "1",
      grt_user: "",
      grt_date: "",
      grt_dept: "",
      type_name: "",
      s_date1: "",
      e_date1: "",
      s_date2: "",
      e_date2: "",
      status: 7,
    },
  });

  useEffect(() => {
    if (open && selectedRow) {
      setValue("factory_code", selectedRow.factory_code || user?.factory || "");
      setValue("expect_id", selectedRow.expect_id || "");
      setValue("type", selectedRow.type || "1");
      setValue("type_name", selectedRow.type_name || "1");
      setValue(
        "s_date1",
        selectedRow.s_date1 ? selectedRow.s_date1.slice(0, 10) : "",
      );
      setValue(
        "e_date1",
        selectedRow.e_date1 ? selectedRow.e_date1.slice(0, 10) : "",
      );
      setValue(
        "s_date2",
        selectedRow.s_date2 ? selectedRow.s_date2.slice(0, 10) : "",
      );
      setValue(
        "e_date2",
        selectedRow.e_date2 ? selectedRow.e_date2.slice(0, 10) : "",
      );
      setValue("status", selectedRow.status ?? 7);
      setValue("grt_user", selectedRow.grt_user || "");
      setValue("grt_date", selectedRow.grt_date || "");
      setValue("grt_dept", selectedRow.grt_dept || "");
    } else {
      reset({
        factory_code: "",
        expect_id: "",
        type: "1",
        type_name: "",
        s_date1: "",
        e_date1: "",
        s_date2: "",
        e_date2: "",
        status: 7,
      });
    }
  }, [open, selectRows]);

  const onSubmit = (data) => {
    handleEdit(data);
  };

  return (
    <Dialog open={open} onClose={() => onClose(null)} maxWidth="md" fullWidth>
      <DialogContent>
        <Paper sx={{ maxWidth: "800px", mx: "auto", p: 3 }}>
          {/* Title */}
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
              {getControlLabel("ttl_edit_expect_m", "Edit AC Expect")}
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
            {/* Row 1: factory_code / expect_id / type — all disabled (PK + fixed) */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  InputLabelProps={{ shrink: true }}
                  disabled
                  {...register("factory_code")}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("expect_id", "Expect ID")}
                  InputLabelProps={{ shrink: true }}
                  disabled
                  {...register("expect_id")}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("type", "Type")}
                  InputLabelProps={{ shrink: true }}
                  disabled
                  {...register("type_name")}
                />
              </Grid>
            </Grid>

            {/* Row 2: s_date1 / e_date1 - Order First CFM Date */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel(
                    "s_date1",
                    "Order First CFM Date (From)",
                  )}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register("s_date1")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("e_date1", "Order First CFM Date (To)")}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register("e_date1")}
                />
              </Grid>
            </Grid>

            {/* Row 3: s_date2 / e_date2 - Customs Date */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("s_date2", "Customs Date (From)")}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register("s_date2")}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("e_date2", "Customs Date (To)")}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register("e_date2")}
                />
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Grid container spacing={2} justifyContent="flex-end" mt={3}>
              <Grid item>
                <Button variant="outlined" onClick={() => onClose(null)}>
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

export default EditAcExpectM;
