import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import { createExpectId } from "../../../service/ac_expect_m/acExpectM";

const AddAcExpectM = ({
  open,
  onClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
}) => {
  const [loadingId, setLoadingId] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      factory_code: user?.factory || "",
      expect_id: "",
      type: "1",
      s_date1: "",
      e_date1: "",
      s_date2: "",
      e_date2: "",
      status: 7,
    },
  });

  useEffect(() => {
    if (open) {
      setValue("factory_code", user?.factory || "");
      setValue("type", "1");
      setValue("status", 7);

      // Fetch next expect_id from API when dialog opens
      const loadExpectId = async () => {
        setLoadingId(true);
        try {
          const nextId = await createExpectId(user?.factory);
          setValue("expect_id", nextId?.data ?? "");
        } catch (error) {
          console.error("Error fetching expect_id:", error);
          setValue("expect_id", "");
        } finally {
          setLoadingId(false);
        }
      };

      loadExpectId();
    } else {
      reset({
        factory_code: user?.factory || "",
        expect_id: "",
        type: "1",
        s_date1: "",
        e_date1: "",
        s_date2: "",
        e_date2: "",
        status: 7,
      });
    }
  }, [open, reset, setValue, user]);

  const onSubmit = (data) => {
    handleAdd(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
              {getControlLabel("ttl_add_expect_m", "Add AC Expect")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Row 1: factory_code / expect_id / type */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  value={user?.factory || ""}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("expect_id", "Expect ID")}
                  InputLabelProps={{ shrink: true }}
                  disabled
                  inputProps={{
                    endAdornment: loadingId ? (
                      <CircularProgress size={16} />
                    ) : null,
                  }}
                  {...register("expect_id")}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("type", "Type")}
                  value="1"
                  InputLabelProps={{ shrink: true }}
                  disabled
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
                <Button variant="outlined" onClick={onClose}>
                  {getControlLabel("btn_cancel", "Cancel")}
                </Button>
              </Grid>
              <Grid item>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loadingId}
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

export default AddAcExpectM;
