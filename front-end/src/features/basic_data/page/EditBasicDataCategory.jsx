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
import { fetchBasicDataByID } from "../../../service/basic_data/basicDataService";
import { generateNameFields } from "../../../utils/table/formFieldHelper";

const EditbasicData = ({
  open,
  onClose,
  basicData,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  table,
  language,
  mapLanguageToColumn,
}) => {
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      ...basicData,
    },
  });

  const { t } = useTranslation();
  const [factory, setFactory] = useState({});
  const [category, setCategory] = useState({});
  const visibleColumn = mapLanguageToColumn(language);
  const nameFields = generateNameFields(table)
  // .filter(
  //   (field) => field.key === visibleColumn
  // );
  const getStatusText = (status) => {
    console.log("check the status", status);

    if (status === 1) return "New-1";
    if (status === 0) return "Cancel-0";
    if (status === 7) return "Confirm-7";
    if (status === 9) return "Close-9";
    return "New-1";
  };
  useEffect(() => {
    if (basicData && Object.keys(basicData).length > 0) {
      const statusText = getStatusText(basicData.status);
      reset({
        ...basicData,
        statusText: statusText,
      });
    }
  }, [basicData, reset]);
  const fetchByID = async () => {
    const response = await fnQuery([
      () =>
        fetchBasicDataByID(
          basicData.factory_code,
          basicData.category_code,
          basicData.code_no
        ),
    ]);
    if (response[0].success) {
      const { FACTORY, CATEGORY } = response[0].data;
      if (FACTORY) {
        setFactory(FACTORY);
      }
      if (CATEGORY) {
        setCategory(CATEGORY);
      }
    }
  };
  useEffect(() => {
    if (
      open &&
      basicData?.factory_code &&
      basicData?.category_code &&
      basicData?.category_code
    ) {
      fetchByID();
    }
  }, [open, basicData]);

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
                "ttl_d_edit",
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
                {getControlLabel("ftxt_m_factory", "Factory Information")}
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
                {getControlLabel("ftxt_m_category", "Category Information")}
              </legend>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel(
                      "txt_d_category_name_t",
                      "category_name_t"
                    )}
                    value={category?.category_name_t || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel(
                      "txt_d_category_name_e",
                      "category_name_e"
                    )}
                    value={category?.category_name_e || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel(
                      "txt_d_category_name_l",
                      "category_name_l"
                    )}
                    value={category?.category_name_l || ""}
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
                  label={getColumnLabel("code_no", "code_no")}
                  name="code_no"
                  InputLabelProps={{ shrink: true }}
                  {...register("code_no")}
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
                {nameFields.map((field) => (
                  <Grid item xs={6} key={field.key}>
                    <TextField
                      fullWidth
                      label={getColumnLabel(field.name, field.label)}
                      {...register(field.name)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                ))}
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
export default EditbasicData;
