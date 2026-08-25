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
import { useForm } from "react-hook-form";
import { fetchAcItemRefByID } from "../../../service/ac_item_ref/AcItemRefService";

const EditAcItemRef = ({
  open,
  onClose,
  acItemRef,
  handleEdit,
  getControlLabel,
  getColumnLabel,
}) => {
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      ...acItemRef,
    },
  });

  const { t } = useTranslation();
  const [factory, setFactory] = useState({});
  const [acItemM, setacItemM] = useState({});
  const getStatusText = (status) => {
    console.log("check the status", status);

    if (status === 1) return "New-1";
    if (status === 0) return "Cancel-0";
    if (status === 7) return "Confirm-7";
    if (status === 9) return "Close-9";
    return "New-1";
  };
  useEffect(() => {
    if (acItemRef && Object.keys(acItemRef).length > 0) {
      const statusText = getStatusText(acItemRef.status);
      reset({
        ...acItemRef,
        statusText: statusText,
      });
    }
  }, [acItemRef, reset]);
  const fetchByID = async () => {
    const response = await fnQuery([
      () =>
        fetchAcItemRefByID(
          acItemRef.factory_code,
          acItemRef.item_acno,
          acItemRef.item_no
        ),
    ]);
    if (response[0].success) {
      const { FACTORY, ITEM_ACNO } = response[0].data;
      if (FACTORY) {
        setFactory(FACTORY);
      }
      if (ITEM_ACNO) {
        setacItemM(ITEM_ACNO);
      }
    }
  };
  useEffect(() => {
    if (
      open &&
      acItemRef?.factory_code &&
      acItemRef?.item_acno &&
      acItemRef?.item_no
    ) {
      fetchByID();
    }
  }, [open, acItemRef]);

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
              {getControlLabel("ttl_d_1_edit", "Edit Ac Item Ref Information")}
            </Typography>
            <Button onClick={() => onClose()} variant="contained" color="error">
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
                {getControlLabel("ftxt_d_fac_dept", "Factory Information")}
              </legend>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel(
                      "txt_m_factory_name_t",
                      "factory_name_t"
                    )}
                    value={factory?.factory_name_t || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel(
                      "txt_m_factory_name_e",
                      "factory_name_e"
                    )}
                    value={factory?.factory_name_e || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel(
                      "txt_m_factory_name_l",
                      "factory_name_l"
                    )}
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
                    label={getControlLabel(
                      "txt_m_factory_address",
                      "factory_address"
                    )}
                    value={factory?.factory_address || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel(
                      "txt_m_factory_abbreviation",
                      "factory_abbreviation"
                    )}
                    value={factory?.factory_abbreviation || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel(
                      "txt_m_factory_tax_no",
                      "factory_tax_no"
                    )}
                    value={factory?.factory_tax_no || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
              </Grid>
            </fieldset>
          </Box>
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
                {getControlLabel("ftxt_ac_item_m", "Ac Item M Information")}
              </legend>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel(
                      "txt_item_acname_t",
                      "item_acname_t"
                    )}
                    value={acItemM?.item_acname_t || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel(
                      "txt_item_acname_e",
                      "item_acname_e"
                    )}
                    value={acItemM?.item_acname_e || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel(
                      "txt_item_acname_l",
                      "item_acname_l"
                    )}
                    value={acItemM?.item_acname_l || ""}
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
                <TextField
                  fullWidth
                  label={getColumnLabel("item_no", "item_no")}
                  name="item_no"
                  InputLabelProps={{ shrink: true }}
                  {...register("item_no")}
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
            </Grid>
            <Box mt={4}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("item_unit", "item_unit")}
                    name="item_unit"
                    InputLabelProps={{ shrink: true }}
                    {...register("item_unit")}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("formula", "formula")}
                    name="formula"
                    type="number"
                    inputProps={{ step: "0.0001", min: 0 }}
                    InputLabelProps={{ shrink: true }}
                    {...register("formula")}
                  />
                </Grid>
              </Grid>
            </Box>

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
export default EditAcItemRef;
