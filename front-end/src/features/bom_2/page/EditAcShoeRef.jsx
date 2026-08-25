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
import { Controller, useForm } from "react-hook-form";
import {
  fetchAllAcShoeRefByID,
  fetchAllViewProdNo,
} from "../../../service/ac_shoe_ref/AcShoeRefService";

const EditacShoeRef = ({
  open,
  onClose,
  acShoeRef,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  auth,
  user,
}) => {
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      ...acShoeRef,
    },
  });

  const { t } = useTranslation();
  const [factory, setFactory] = useState({});
  const [acShoeM, setAcShoeM] = useState({});
  const [dropdownData, setDropdownData] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});
  const [loading, setLoading] = useState(true);

  const acShoeRefKey = acShoeRef
    ? `${acShoeRef.factory_code || ''}_${acShoeRef.customs_shoe_id || ''}_${acShoeRef.prod_no || ''}`
    : '';
  const getStatusText = (status) => {
    if (status === 1) return "New-1";
    if (status === 0) return "Cancel-0";
    if (status === 7) return "Confirm-7";
    if (status === 9) return "Close-9";
    return "New-1";
  };

  const mapDropdown = {
    prod_no: 1001,
    prod_unit: 1108,
  };
  const fetchByID = async () => {
    try {
   

      const response = await fnQuery([
        () =>
          fetchAllAcShoeRefByID(
            acShoeRef.factory_code,
            acShoeRef.customs_shoe_id,
            acShoeRef.prod_no
          ),
      ]);


      if (response[0]?.success) {
        const { FACTORY, ACSHOEM } = response[0].data;
        setFactory(FACTORY || {});
        setAcShoeM(ACSHOEM || {});
      } else {
        console.error(" fetchByID failed:", response[0]);
      }
    } catch (error) {
      console.error("Error in fetchByID:", error);
    }
  };

  const fetchAllDropdowns = async () => {
    try {
      const allow = Array.isArray(auth)
        ? auth.find((item) => item.field === "query_level")?.title
        : null;

      console.log("🔍 Fetching dropdowns with allow:", allow);
      setLoading(true);

      const apiFetchers = {
        prod_no: async () => {
          const response = await fetchAllViewProdNo(
            user?.factory,
            user?.department,
            user?.user_code,
            allow
          );
          return response?.data?.rows || [];
        },
      };

      const promises = Object.entries(mapDropdown).map(
        async ([fieldName, categoryCode]) => {
          try {
            const fetcher = apiFetchers[fieldName];
            const data = fetcher ? await fetcher(categoryCode) : [];

            console.log(` Dropdown ${fieldName}:`, data);

            return { fieldName, data };
          } catch (error) {
            console.error(
              ` Error fetching ${fieldName} (${categoryCode}):`,
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
      console.error(" Error fetching dropdowns:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (acShoeRef && Object.keys(acShoeRef).length > 0) {
      const statusText = getStatusText(acShoeRef.status);
      reset({
        ...acShoeRef,
        statusText: statusText,
        is_valid: acShoeRef?.is_valid ?? "Y",
      });
    }
  }, [acShoeRef, reset]);

  useEffect(() => {
    if (open && acShoeRefKey) {
      fetchByID();
      fetchAllDropdowns();
    }

    if (!open) {
      setFactory({});
      setAcShoeM({});
      setDropdownData({});
      setDropdownValues({});
    }
  }, [open, acShoeRefKey]); 
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
              {getControlLabel("ttl_d_2_edit_2", "Edit Ac Shoe Ref Information")}
            </Typography>
            <Button onClick={() => onClose(null)} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          {/* Factory Information */}
          <Box mt={4}>
            <fieldset
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
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
                    disabled
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
                    disabled
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
                    disabled
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
                    disabled
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
                    disabled
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
                    disabled
                  />
                </Grid>
              </Grid>
            </fieldset>
          </Box>

          {/* Shoe Information */}
           <Box mt={4}>
            <fieldset
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <legend style={{ padding: "0 8px", fontWeight: "bold" }}>
                {getControlLabel("ftxt_ac_shoe_m", "Ac Shoe M Information")}
              </legend>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel(
                      "txt_customs_shoe_name_l",
                      "customs_shoe_name_l"
                    )}
                    value={acShoeM?.customs_shoe_name_l || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel(
                      "txt_customs_shoe_name_t",
                      "customs_shoe_name_t"
                    )}
                    value={acShoeM?.customs_shoe_name_t || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getControlLabel(
                      "txt_customs_shoe_name_e",
                      "customs_shoe_name_e"
                    )}
                    value={acShoeM?.customs_shoe_name_e || ""}
                    InputLabelProps={{ shrink: true }}
                    aria-readonly
                  />
                </Grid>
              </Grid>
            </fieldset>
          </Box>

          {/* Edit Form */}
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
                  label={getColumnLabel("prod_no", "prod_no")}
                  name="prod_no"
                  InputLabelProps={{ shrink: true }}
                  {...register("prod_no")}
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("prod_unit", "prod_unit")}
                  name="prod_unit"
                  InputLabelProps={{ shrink: true }}
                  {...register("prod_unit")}
                  disabled
                />
              </Grid>
            </Grid>

            <Box mt={4}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Controller
                    name="is_valid"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        select
                        sx={{ width: "150px" }}
                        label={getColumnLabel("is_valid","is_valid")}
                        {...field}
                      >
                        <MenuItem value={"Y"}>Y</MenuItem>
                        <MenuItem value={"N"}>N</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("valid_date", "valid_date")}
                    name="valid_date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    {...register("valid_date")}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("unval_date", "unval_date")}
                    name="unval_date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    {...register("unval_date")}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box mt={4} display={"flex"} gap={"6px"}>
              <Button type="submit" variant="contained" color="primary">
                {getControlLabel("btn_save", "Save")}
              </Button>
              <Button onClick={onClose} variant="outlined" color="secondary">
                {getControlLabel("btn_cancel", "Cancel")}
              </Button>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default EditacShoeRef;