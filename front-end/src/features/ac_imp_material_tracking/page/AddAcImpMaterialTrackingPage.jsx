import { useEffect, useState } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import {
  fetchBasicDataByCate,
  fetchBasicDataDropDownByCate,
} from "../../../service/basic_data/basicDataService";
import Dropdown from "../../../component/dropdown/Dropdown";

const AddAcImpMaterialTrackingPage = ({
  open,
  onClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  language,
}) => {
  const [dropdownData, setDropdownData] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});
  const [isAc, setIsAc] = useState(false);

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
    if (!open) {
      setDropdownValues({});
      // Reset checkbox khi đóng dialog
      setIsAc(false);
    }
  }, [open]);

  const fetchAllDropdowns = async () => {
    try {
      const allow = Array.isArray(auth)
        ? auth.find((item) => item.field === "query_level")?.title
        : null;
      const promises = Object.entries(mapDropdown).map(
        async ([fieldName, categoryCode]) => {
          try {
            const response = await fetchBasicDataByCate(
              user?.factory,
              categoryCode,
              user?.department,
              user?.user_code,
              allow,
            );
            return { fieldName, data: response?.data || [] };
          } catch (error) {
            console.error(
              `Error fetching ${fieldName} (${categoryCode}):`,
              error,
            );
            return { fieldName, data: [] };
          }
        },
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

  const handleDecimalInput =
    (decimals = 8) =>
    (e) => {
      e.target.value = e.target.value.replace(
        new RegExp(`(\\.\\d{${decimals}})\\d+`),
        "$1",
      );
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

  const renderField = (
    fieldName,
    label,
    gridSize = 3,
    extraProps = {},
    type = "text",
  ) => {
    const hasDropdown = mapDropdown.hasOwnProperty(fieldName);

    if (hasDropdown) {
      const categoryCode = mapDropdown[fieldName];
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Dropdown
            onFetchData={createDropdownCallback(categoryCode)}
            onSelect={(selectedItem) => {
              setDropdownValues((prev) => ({
                ...prev,
                [fieldName]: selectedItem?.code_no || "",
              }));
            }}
            select={dropdownValues[fieldName] || extraProps.defaultValue || ""}
            table="BASIC_DATA"
            option={"basic_data"}
            getControlLabel={getControlLabel}
            language={language || "en"}
            field={getColumnLabel(fieldName, label)}
            totalItems={0}
            pageSize={10}
          />
          {/* Hidden input để form submit nhận giá trị dropdown */}
          <input
            type="hidden"
            name={fieldName}
            value={dropdownValues[fieldName] || extraProps.defaultValue || ""}
          />
        </Grid>
      );
    }

    return (
      <Grid item xs={gridSize} key={fieldName}>
        <TextField
          fullWidth
          InputLabelProps={{ shrink: true }}
          label={getColumnLabel(fieldName, label)}
          name={fieldName}
          type={type}
          inputProps={
            type === "number"
              ? {
                  step: "0.00000001",
                  min: 0,
                  onChange: handleDecimalInput(8),
                  ...extraProps.inputProps,
                }
              : extraProps.inputProps
          }
          {...extraProps}
        />
      </Grid>
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    // Ghi đè is_ac bằng giá trị checkbox state (FormData checkbox chỉ có value khi checked)
    formData.set("is_ac", isAc ? "Y" : "N");
    handleAdd(e, formData, { ...dropdownValues, is_ac: isAc ? "Y" : "N" });
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
              {getControlLabel("ttl_add", "Add Material Tracking")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            {/* Row 1 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  name="factory_code"
                  value={user?.factory}
                  disabled
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("invoice_no", "Invoice No")}
                  name="invoice_no"
                  required
                />
              </Grid>
              {renderField("sort", "Sort")}
              {renderField("declaration_category", "Declaration Category", 2.4)}
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={3}>
              {renderField("loading_way", "Loading Way")}
              {renderField("exporting_countries", "Exporting Countries")}
              {renderField("b_l", "B/L", 2.4)}
              {renderField("loading_port", "Loading Port")}
              {renderField("unloading_port", "Unloading Port")}
            </Grid>

            {/* Row 3 */}
            <Grid container spacing={2} mb={3}>
              {renderField(
                "qty_of_pieces",
                "Qty of Pieces",
                2.4,
                {
                  inputProps: {
                    step: "0.01",
                    min: 0,
                    onChange: handleDecimalInput(2),
                  },
                },
                "number",
              )}
              {renderField(
                "gross_weight",
                "Gross Weight",
                3,
                {
                   inputProps: {
                    step: "0.01",
                    min: 0,
                    onChange: handleDecimalInput(2),
                  },
                },
                "number",
              )}
              {renderField("packaging_unit", "Packaging Unit")}
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel(
                    "material_description",
                    "Material Description",
                  )}
                  name="material_description"
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel(
                    "factory_materials",
                    "Factory Materials",
                  )}
                  name="factory_materials"
                />
              </Grid>
            </Grid>

            {/* Row 4 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel(
                    "bill_of_lading_no",
                    "Bill of Lading No",
                  )}
                  name="bill_of_lading_no"
                />
              </Grid>
              {renderField("shipside", "Shipside")}
              {renderField(
                "invoice_amount",
                "Invoice Amount",
                3,
                {
                 inputProps: {
                    step: "0.0001",
                    min: 0,
                    onChange: handleDecimalInput(4),
                  },
                },
                "number",
              )}
              {renderField("currency", "Currency")}
              {renderField(
                "exchange_rate",
                "Exchange Rate",
                3,
                {
                  
                },
                "number",
              )}
            </Grid>

            {/* Row 5 */}
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
                    name={name}
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
                  label={getColumnLabel(
                    "shipping_payment_way",
                    "Shipping Payment Way",
                  )}
                  name="shipping_payment_way"
                />
              </Grid>
              {renderField("import_delay_reason", "Import Delay Reason")}
              {renderField(
                "container_quantity",
                "Container Quantity",
                2.4,
                {
                  inputProps: {
                    step: "0.00000001",
                    min: 0,
                    onChange: handleDecimalInput(8),
                  },
                },
                "number",
              )}
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel(
                    "date_completion_procedures",
                    "Date Completion",
                  )}
                  name="date_completion_procedures"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel(
                    "declaration_retrieve_date",
                    "Declaration Retrieve Date",
                  )}
                  name="declaration_retrieve_date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={2.4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isAc}
                      onChange={(e) => setIsAc(e.target.checked)}
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
                    height: "56px", // khớp chiều cao TextField
                  }}
                />
                {/* Hidden input để FormData submit nhận giá trị */}
                <input type="hidden" name="is_ac" value={isAc ? "Y" : "N"} />
              </Grid>
            </Grid>

            {/* Submit Button */}
            <Box mt={4} display="flex" justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
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

export default AddAcImpMaterialTrackingPage;