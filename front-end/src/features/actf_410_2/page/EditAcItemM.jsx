import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { fnQuery } from "../../../utils/fnQuery";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import { fetchAcItemMByID } from "../../../service/ac_item_m/AcItemMService";
import { fetchBasicDataByCate } from "../../../service/basic_data/basicDataService";
import Dropdown from "../../../component/dropdown/Dropdown";

const EditAcItemM = ({
  open,
  auth,
  user,
  onClose,
  acItemM,
  handleEdit,
  getControlLabel,
  getColumnLabel,
}) => {
  const [dropdownData, setDropdownData] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});
  const { register, handleSubmit, control, reset,setValue } = useForm({
    defaultValues: {
      ...acItemM,
    },
  });
  const mapDropdown = {
    ac_type: "CDC",
    unit: 1108,
  };
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
    if (open && acItemM && Object.keys(acItemM).length > 0) {
      const statusText = getStatusText(acItemM.status);
      reset({
        ...acItemM,
        statusText: statusText,
      });
      const initialDropdownValues = {
        ac_type: acItemM.ac_type || "",
        unit: acItemM.unit || "",
      };
      setDropdownValues(initialDropdownValues);
    }
  }, [open, acItemM, reset]);
  const fetchByID = async () => {
    const response = await fnQuery([
      () => fetchAcItemMByID(acItemM.factory_code, acItemM.item_acno),
    ]);
    if (response[0].success) {
      const { FACTORY } = response[0].data;
      setFactory(FACTORY);
    }
  };
  useEffect(() => {
    if (open && acItemM?.factory_code && acItemM?.item_acno) {
      fetchByID();
    }
  }, [open, acItemM]);
  useEffect(() => {
    if (!open) {
      setDropdownValues({});
    } else {
      fetchAllDropdowns();
    }
  }, [open]);
  const renderField = (fieldName, label, gridSize = 2.4, extraProps = {}) => {
    const hasDropdown = mapDropdown.hasOwnProperty(fieldName);
    const dropdownOptions = dropdownData[fieldName] || [];

    if (hasDropdown) {
      return (
        <Grid item xs={gridSize}>
          <Dropdown
            data={dropdownOptions}
            onSelect={(selectedItem) => {
              setDropdownValues((prev) => ({
                ...prev,
                [fieldName]: selectedItem?.code_no || "",
              }));
              setValue(fieldName, selectedItem?.code_no);
            }}
            select={dropdownValues[fieldName]  || ""}
            table="BASIC_DATA"
            option={"basic_data"}
            getControlLabel={getControlLabel}
            language={user?.language || "en"}
            field={getColumnLabel(fieldName, label)}
          />
          <input
            type="hidden"
            name={fieldName}
            value={dropdownValues[fieldName] || extraProps.defaultValue || ""}
          />
        </Grid>
      );
    }

    return (
      <Grid item xs={gridSize}>
        <TextField
          fullWidth
          label={getColumnLabel(fieldName, label)}
          name={fieldName}
          {...extraProps}
        />
      </Grid>
    );
  };
  const fetchAllDropdowns = async () => {
    try {
      const allow = Array.isArray(auth)
        ? auth.find((item) => item.field === "query_level")?.title
        : null;
      console.log("check allow", allow);
      const promises = Object.entries(mapDropdown).map(
        async ([fieldName, categoryCode]) => {
          try {
            const response = await fetchBasicDataByCate(
              user?.factory,
              categoryCode,
              user?.department,
              user?.user_code,
              allow
            );
            return { fieldName, data: response?.data || [] };
          } catch (error) {
            console.error(
              `Error fetching ${fieldName} (${categoryCode}):`,
              error
            );
            return { fieldName, data: [] };
          }
        }
      );
      const results = await Promise.all(promises);
      const dataMap = {};
      results.forEach(({ fieldName, data }) => {
        dataMap[fieldName] = data;
      });
      setDropdownData(dataMap);
    } catch (error) {
      console.error("Error fetching dropdowns:", error);
    }
  };
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
              {getControlLabel("ttl_m_1_edit", "Edit Ac Item M Information")}
            </Typography>
            <Button onClick={()=>onClose(null)} variant="contained" color="error">
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
                {getControlLabel("ftxt_m_fac_dept", "Factory Information")}
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
                  label={getColumnLabel("item_acno", "item_acno")}
                  name="item_acno"
                  InputLabelProps={{ shrink: true }}
                  {...register("item_acno")}
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
                    label={getColumnLabel("item_acname_t", "item_acname_t")}
                    name="item_acnoname_t"
                    InputLabelProps={{ shrink: true }}
                    {...register("item_acname_t")}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("item_acname_e", "item_acname_e")}
                    name="item_acname_e"
                    InputLabelProps={{ shrink: true }}
                    {...register("item_acname_e")}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("item_acname_l", "item_acname_l")}
                    name="item_acname_l"
                    InputLabelProps={{ shrink: true }}
                    {...register("item_acname_l")}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box mt={4}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("ac_item", "ac_item")}
                    name="ac_item"
                    InputLabelProps={{ shrink: true }}
                    {...register("ac_item")}
                  />
                </Grid>
                <Grid item xs={6}>
                  {renderField("unit", "Unit")}
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("tax_per", "tax_per")}
                    name="tax_per"
                    type="number"
                    inputProps={{ step: "0.01", min: 0 }}
                    InputLabelProps={{ shrink: true }}
                    {...register("tax_per")}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box mt={4}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("loss_per", "loss_per")}
                    name="loss_per"
                    type="number"
                    inputProps={{ step: "0.01", min: 0 }}
                    InputLabelProps={{ shrink: true }}
                    {...register("loss_per")}
                  />
                </Grid>
                <Grid item xs={6}>
                  {renderField("ac_type", "Ac Type")}
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
export default EditAcItemM;
