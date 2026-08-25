import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  FormControlLabel,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import {
  fetchBasicDataByCate,
  fetchBasicDataDropDownByCate,
} from "../../../service/basic_data/basicDataService";
import Dropdown from "../../../component/dropdown/Dropdown";

const EditAcImpMaterialTrackingPage = ({
  open,
  onClose,
  acImp,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  language,
}) => {
  const { register, handleSubmit, reset, setValue, control } = useForm({
    defaultValues: { ...acImp },
  });
  const [dropdownData, setDropdownData] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});
  const [loading, setLoading] = useState(true);

  const mapDropdown = {
    sort: 5008,
    declaration_category: "CDC",
    exporting_countries: 5006,
    loading_way: 2118,
    b_l: "BL",
    loading_port: 5007,
    unloading_port: 5003,
    shipside: "SHIPSIDE",
    currency: 1105,
    packaging_unit: 1108,
    import_delay_reason: 2120,
  };

  useEffect(() => {
    if (open) {
      fetchAllDropdowns();
    }
  }, [open]);

  useEffect(() => {
    if (acImp) {
      const statusText = getStatusText(acImp.status);
      reset({
        ...acImp,
        statusText: statusText,
        is_ac: acImp.is_ac === "Y" || acImp.is_ac === true,
        estimated_arrival_date: acImp?.estimated_arrival_date?.split("T")[0] || "",
        actual_arrival_date: acImp?.actual_arrival_date?.split("T")[0] || "",
        record_date: acImp?.record_date?.split("T")[0] || "",
        departure_date: acImp?.departure_date?.split("T")[0] || "",
        estimated_delivery_date: acImp?.estimated_delivery_date?.split("T")[0] || "",
        actual_delivery_date: acImp?.actual_delivery_date?.split("T")[0] || "",
        date_completion_procedures: acImp?.date_completion_procedures?.split("T")[0] || "",
        declaration_retrieve_date: acImp?.declaration_retrieve_date?.split("T")[0] || "",
      });

      const initialDropdownValues = {};
      Object.keys(mapDropdown).forEach((fieldName) => {
        if (acImp[fieldName]) {
          initialDropdownValues[fieldName] = acImp[fieldName];
        }
      });
      setDropdownValues(initialDropdownValues);
    }
  }, [acImp, reset]);

  const fetchAllDropdowns = async () => {
    try {
      const allow = Array.isArray(auth)
        ? auth.find((item) => item.field === "query_level")?.title
        : null;

      setLoading(true);
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
            console.error(`Error fetching ${fieldName}:`, error);
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
    } finally {
      setLoading(false);
    }
  };

  const createDropdownCallback = (categoryCode) => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";
        const result = await fetchBasicDataDropDownByCate(
          user?.factory,
          categoryCode,
          user?.department,
          user?.user_code,
          allow,
          page,
          pageSize,
          searchText,
          true,
          language
        );
        return {
          data: result?.data || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error(`Error fetching dropdown ${categoryCode}:`, error);
        return { data: [], total: 0, pageSize: pageSize };
      }
    };
  };

  const handleDecimalInput =
    (decimals = 8) =>
    (e) => {
      e.target.value = e.target.value.replace(
        new RegExp(`(\\.\\d{${decimals}})\\d+`),
        "$1"
      );
    };

  const onSubmit = (data) => {
    const finalData = {
      ...data,
      ...dropdownValues,
      //  Chuyển boolean → "Y"/"N" trước khi gửi lên server
      is_ac: data.is_ac ? "Y" : "N",
      locked_information: acImp?.locked_information,
    };
    handleEdit(finalData);
  };

  const renderField = (fieldName, label, gridSize = 2.4, extraProps = {}) => {
    const hasDropdown = mapDropdown.hasOwnProperty(fieldName);

    if (hasDropdown) {
      const categoryCode = mapDropdown[fieldName];
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Dropdown
            onFetchData={createDropdownCallback(categoryCode)}
            onSelect={(selectedItem) => {
              const value = selectedItem?.code_no || "";
              setDropdownValues((prev) => ({ ...prev, [fieldName]: value }));
              setValue(fieldName, value);
            }}
            select={dropdownValues[fieldName] || ""}
            table="BASIC_DATA"
            option="basic_data"
            getControlLabel={getControlLabel}
            language={language || "en"}
            field={getColumnLabel(fieldName, label)}
            totalItems={0}
            pageSize={10}
          />
        </Grid>
      );
    }

    return (
      <Grid item xs={gridSize} key={fieldName}>
        <TextField
          fullWidth
          label={getColumnLabel(fieldName, label)}
          {...register(fieldName)}
          {...extraProps}
        />
      </Grid>
    );
  };

  const getStatusText = (status) => {
    if (status === 1) return "New-1";
    if (status === 2) return "Checked-2";
    if (status === 0) return "Cancel-0";
    if (status === 7) return "Confirm-7";
    if (status === 9) return "Close-9";
    return "New-1";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
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
              {getControlLabel("ttl_edit", "Edit Material Tracking")}
            </Typography>
            <Button onClick={() => onClose(null)} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Row 1 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  {...register("factory_code")}
                  disabled
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("invoice_no", "Invoice No")}
                  {...register("invoice_no")}
                  disabled
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("sort", "Sort")}
                  {...register("sort")}
                  disabled
                />
              </Grid>
              {renderField("declaration_category", "Declaration Category")}
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={3}>
              {renderField("loading_way", "Loading Way")}
              {renderField("exporting_countries", "Exporting Countries")}
              {renderField("b_l", "B/L")}
              {renderField("loading_port", "Loading Port")}
              {renderField("unloading_port", "Unloading Port")}
            </Grid>

            {/* Row 3 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("qty_of_pieces", "Qty of Pieces")}
                  {...register("qty_of_pieces", {
                    setValueAs: (v) =>
                      v === "" || v === undefined ? null : Number(v),
                  })}
                  type="number"
                  inputProps={{ step: "0.01", min: 0, onChange: handleDecimalInput(2) }}
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("gross_weight", "Gross Weight")}
                  {...register("gross_weight", {
                    setValueAs: (v) =>
                      v === "" || v === undefined ? null : Number(v),
                  })}
                  type="number"
                  inputProps={{ step: "0.01", min: 0, onChange: handleDecimalInput(2) }}
                />
              </Grid>
              {renderField("packaging_unit", "Packaging Unit")}
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("material_description", "Material Description")}
                  {...register("material_description")}
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_materials", "Factory Materials")}
                  {...register("factory_materials")}
                />
              </Grid>
            </Grid>

            {/* Row 4 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("bill_of_lading_no", "Bill of Lading No")}
                  {...register("bill_of_lading_no")}
                />
              </Grid>
              {renderField("shipside", "Shipside")}
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("invoice_amount", "Invoice Amount")}
                  {...register("invoice_amount", {
                    setValueAs: (v) =>
                      v === "" || v === undefined ? null : Number(v),
                  })}
                  type="number"
                  inputProps={{ step: "0.0001", min: 0, onChange: handleDecimalInput(4) }}
                />
              </Grid>
              {renderField("currency", "Currency")}
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("exchange_rate", "Exchange Rate")}
                  {...register("exchange_rate", {
                    setValueAs: (v) =>
                      v === "" || v === undefined ? null : Number(v),
                  })}
                  type="number"
                  inputProps={{ step: "0.00000001", min: 0, onChange: handleDecimalInput(8) }}
                />
              </Grid>
            </Grid>

            {/* Row 5 - Dates */}
            <Grid container spacing={2} mb={3}>
              {[
                ["estimated_arrival_date", "Est. Arrival Date"],
                ["actual_arrival_date", "Actual Arrival Date"],
                ["record_date", "Record Date"],
                ["departure_date", "Departure Date"],
                ["estimated_delivery_date", "Est. Delivery Date"],
                ["actual_delivery_date", "Actual Delivery Date"],
              ].map(([name, label]) => (
                <Grid item xs={2.4} key={name}>
                  <TextField
                    fullWidth
                    label={getColumnLabel(name, label)}
                    {...register(name)}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Row 6 */}
            <Grid container spacing={2} mb={3} alignItems="center">
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("shipping_payment_way", "Shipping Payment Way")}
                  {...register("shipping_payment_way")}
                />
              </Grid>
              {renderField("import_delay_reason", "Import Delay Reason")}
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("container_quantity", "Container Quantity")}
                  {...register("container_quantity", {
                    setValueAs: (v) =>
                      v === "" || v === undefined ? null : Number(v),
                  })}
                  type="number"
                  inputProps={{ step: "0.00000001", min: 0, onChange: handleDecimalInput(8) }}
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("date_completion_procedures", "Date Completion")}
                  {...register("date_completion_procedures")}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("declaration_retrieve_date", "Declaration Retrieve Date")}
                  {...register("declaration_retrieve_date")}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/*  is_ac — Checkbox dùng Controller để tích hợp với react-hook-form */}
              <Grid item xs={2.4}>
                <Controller
                  name="is_ac"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={getColumnLabel("is_ac", "IS AC")}
                      sx={{
                        border: "1px solid rgba(0,0,0,0.23)",
                        borderRadius: 1,
                        px: 1.5,
                        py: 0.5,
                        width: "100%",
                        m: 0,
                        height: "56px",
                      }}
                    />
                  )}
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
                disabled={loading}
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

export default EditAcImpMaterialTrackingPage;