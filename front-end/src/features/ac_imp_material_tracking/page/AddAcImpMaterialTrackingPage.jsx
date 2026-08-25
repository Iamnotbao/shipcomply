import { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
} from "@mui/material";
import Dropdown from "../../../component/dropdown/Dropdown";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";
import ReadOnlyField from "../../../component/form/ReadOnlyField";
import {
  fetchBasicDataByCate,
  fetchBasicDataDropDownByCate,
} from "../../../service/basic_data/basicDataService";

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
    if (!open) return;

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

    fetchAllDropdowns();
  }, [auth, open, user?.department, user?.factory, user?.user_code]);

  useEffect(() => {
    if (!open) {
      setDropdownValues({});
      setIsAc(false);
    }
  }, [open]);

  const handleDecimalInput =
    (decimals = 8) =>
    (event) => {
      event.target.value = event.target.value.replace(
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
          language,
        );
        return {
          data: result?.data || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error(`Error fetching dropdown ${categoryCode}:`, error);
        return { data: [], total: 0, pageSize };
      }
    };
  };

  const renderField = (
    fieldName,
    label,
    extraProps = {},
    type = "text",
  ) => {
    const hasDropdown = Object.prototype.hasOwnProperty.call(
      mapDropdown,
      fieldName,
    );

    if (hasDropdown) {
      const categoryCode = mapDropdown[fieldName];
      return (
        <Box key={fieldName} sx={{ minWidth: 0 }}>
          <Dropdown
            onFetchData={createDropdownCallback(categoryCode)}
            onSelect={(selectedItem) => {
              setDropdownValues((prev) => ({
                ...prev,
                [fieldName]: selectedItem?.code_no || "",
              }));
            }}
            select={dropdownValues[fieldName] || extraProps.defaultValue || ""}
            data={dropdownData[fieldName] || []}
            table="BASIC_DATA"
            option="basic_data"
            getControlLabel={getControlLabel}
            language={language || "en"}
            field={getColumnLabel(fieldName, label)}
            totalItems={0}
            pageSize={10}
          />
          <input
            type="hidden"
            name={fieldName}
            value={dropdownValues[fieldName] || extraProps.defaultValue || ""}
          />
        </Box>
      );
    }

    return (
      <TextField
        key={fieldName}
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
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    formData.set("is_ac", isAc ? "Y" : "N");
    handleAdd(event, formData, {
      ...dropdownValues,
      is_ac: isAc ? "Y" : "N",
    });
  };

  return (
    <FormDialogShell
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={getControlLabel("ttl_add", "Add Material Tracking")}
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      maxWidth="xl"
    >
      <Stack spacing={2}>
        <FormSection title="Declaration information">
          <FormGrid columns={3}>
            <ReadOnlyField
              label={getColumnLabel("factory_code", "Factory Code")}
              value={user?.factory}
            />
            <TextField
              fullWidth
              label={getColumnLabel("invoice_no", "Invoice No")}
              name="invoice_no"
              required
            />
            {renderField("sort", "Sort")}
            {renderField("declaration_category", "Declaration Category")}
            {renderField("loading_way", "Loading Way")}
            {renderField("exporting_countries", "Exporting Countries")}
          </FormGrid>
        </FormSection>

        <FormSection title="Shipment information">
          <FormGrid columns={3}>
            {renderField("b_l", "B/L")}
            {renderField("loading_port", "Loading Port")}
            {renderField("unloading_port", "Unloading Port")}
            <TextField
              fullWidth
              label={getColumnLabel(
                "bill_of_lading_no",
                "Bill of Lading No",
              )}
              name="bill_of_lading_no"
            />
            {renderField("shipside", "Shipside")}
            <TextField
              fullWidth
              label={getColumnLabel(
                "shipping_payment_way",
                "Shipping Payment Way",
              )}
              name="shipping_payment_way"
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Quantity, package and value">
          <FormGrid columns={3}>
            {renderField(
              "qty_of_pieces",
              "Qty of Pieces",
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
            <TextField
              fullWidth
              label={getColumnLabel(
                "material_description",
                "Material Description",
              )}
              name="material_description"
            />
            <TextField
              fullWidth
              label={getColumnLabel(
                "factory_materials",
                "Factory Materials",
              )}
              name="factory_materials"
            />
            {renderField(
              "container_quantity",
              "Container Quantity",
              {
                inputProps: {
                  step: "0.00000001",
                  min: 0,
                  onChange: handleDecimalInput(8),
                },
              },
              "number",
            )}
            {renderField(
              "invoice_amount",
              "Invoice Amount",
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
            {renderField("exchange_rate", "Exchange Rate", {}, "number")}
          </FormGrid>
        </FormSection>

        <FormSection title="Schedule and delivery dates">
          <FormGrid columns={3}>
            {[
              ["estimated_arrival_date", "Est. Arrival Date"],
              ["actual_arrival_date", "Actual Arrival Date"],
              ["record_date", "Record Date"],
              ["departure_date", "Departure Date"],
              ["estimated_delivery_date", "Est. Delivery Date"],
              ["actual_delivery_date", "Actual Delivery Date"],
            ].map(([name, label]) => (
              <TextField
                key={name}
                fullWidth
                label={getColumnLabel(name, label)}
                name={name}
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            ))}
          </FormGrid>
        </FormSection>

        <FormSection title="Completion and control">
          <FormGrid columns={3}>
            {renderField("import_delay_reason", "Import Delay Reason")}
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAc}
                  onChange={(event) => setIsAc(event.target.checked)}
                  color="primary"
                />
              }
              label={getColumnLabel("is_ac", "IS AC")}
              sx={{
                minHeight: 40,
                px: 1,
                m: 0,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1.5,
                bgcolor: "background.paper",
              }}
            />
            <input type="hidden" name="is_ac" value={isAc ? "Y" : "N"} />
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default AddAcImpMaterialTrackingPage;
