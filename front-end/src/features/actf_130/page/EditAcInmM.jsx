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
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { fnQuery } from "../../../utils/fnQuery";
import CloseIcon from "@mui/icons-material/Close";
import { fetchBasicDataCategoryByID } from "../../../service/basic_data_category/basicDataCategoryService";
import { useForm } from "react-hook-form";
import { generateNameFields } from "../../../utils/table/formFieldHelper";
import { fetchAcInmMByID } from "../../../service/ac_inm_m/acInmM";

const EditAcInmM = ({
  open,
  onClose,
  acInmM,
  handleEdit,
  getControlLabel,
  getColumnLabel,
}) => {
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      ...acInmM,
    },
  });

  const { t } = useTranslation();
  const [factory, setFactory] = useState({});

  const getStatusText = (status) => {
    if (status === 1) return "New-1";
    if (status === 0) return "Cancel-0";
    if (status === 7) return "Confirm-7";
    if (status === 9) return "Close-9";
    return "New-1";
  };
  useEffect(() => {
    if (acInmM && Object.keys(acInmM).length > 0) {
      const statusText = getStatusText(acInmM.status);
      reset({
        ...acInmM,
        statusText: statusText,
      });
    }
  }, [acInmM, reset]);
  const fetchByID = async () => {
    const response = await fnQuery([
      () => fetchAcInmMByID(acInmM.factory_code, acInmM.inm_no),
    ]);
    if (response[0].success) {
      const { FACTORY } = response[0].data;
      setFactory(FACTORY);
    }
  };
  useEffect(() => {
    if (open && acInmM?.factory_code && acInmM?.inm_no) {
      fetchByID();
    }
  }, [open, acInmM]);

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
              {getControlLabel(
                "ttl_m_edit",
                "Edit Basic Data Category Information"
              )}
            </Typography>
            <Button
              onClick={() => onClose(null)}
              variant="contained"
              color="error"
            >
              <CloseIcon />
            </Button>
          </Box>{" "}
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
                <TextField
                  fullWidth
                  label={getColumnLabel("inm_no", "inm_no")}
                  name="inm_no"
                  InputLabelProps={{ shrink: true }}
                  {...register("inm_no")}
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("status", "status")}
                  name="status"
                  {...register("statusText")}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("issued_date", "issued_date")}
                    name="issued_date"
                    {...register("issued_date")}
                    InputLabelProps={{ shrink: true }}
                    type="date"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("expire_date", "expire_date")}
                    name="expire_date"
                    {...register("expire_date")}
                    InputLabelProps={{ shrink: true }}
                    type="date"
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("req_no", "req_no")}
                    name="req_no"
                    {...register("req_no")}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("commno", "commno")}
                    name="commno"
                    {...register("commno")}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("note", "note")}
                    name="note"
                    {...register("note")}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Grid>
        
            <Box mt={4} display={"flex"} gap={"6px"}>
              <Button type="submit" variant="contained" color="primary">
                {getControlLabel("btn_save", "Save")}
              </Button>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};
export default EditAcInmM;
