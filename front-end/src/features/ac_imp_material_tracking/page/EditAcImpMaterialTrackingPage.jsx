import { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import Dropdown from "../../../component/dropdown/Dropdown";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";
import {
  fetchBasicDataByCate,
  fetchBasicDataDropDownByCate,
} from "../../../service/basic_data/basicDataService";

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

  const getStatusText = (status) => {
    if (status === 1) return "New-1";
    if (status === 2) return "Checked-2";
    if (status === 0) return "Cancel-0";
    if (status === 7) return "Confirm-7";
    if (status === 9) return "Close-9";
    return "New-1";
  };

  useEffect(() => {
    if (!open) return;

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
                allow,
              );
              return { fieldName, data: response?.data || [] };
            } catch (error) {
              console.error(`Error fetching ${fieldName}:`, error);
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
      } finally {
        setLoading(false);
      }
    };

    fetchAllDropdowns();
  }, [auth, open, user?.department, user?.factory, user?.user_code]);

  useEffect(() => {
    if (!acImp) return;

    reset({
      ...acImp,
      statusText: getStatusText(acImp.status),
      is_ac: acImp.is_ac === "Y" || acImp.is_ac === true,
      estimated_arrival_date: acImp?.estimated_arrival_date?.split("T")[0] || "",
      actual_arrival_date: acImp?.actual_arrival_date?.split("T")[0] || "",
      record_date: acImp?.record_date?.split("T")[0] || "",
      departure_date: acImp?.departure_date?.split("T")[0] || "",
      estimated_delivery_date: acImp?.estimated_delivery_date?.split("T")[0] || "",
      actual_delivery_date: acImp?.actual_delivery_date?.split("T")[0] || "",
      date_completion_procedures:
        acImp?.date_completion_procedures?.split("T")[0] || "",
      declaration_retrieve_date:
        acImp?.declaration_retrieve_date?.split("T")[0] || "",
    });

    const initialDropdownValues = {};
    Object.keys(mapDropdown).forEach((fieldName) => {
      if (acImp[fieldName]) {
        initialDropdownValues[fieldName] = acImp[fieldName];
      }
    });
    setDropdownValues(initialDropdownValues);
  }, [acImp, reset]);

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

  const handleDecimalInput =
    (decimals = 8) =>
    (event) => {
      event.target.value = event.target.value.replace(
        new RegExp(`(\\.\\d{${decimals}})\\d+`),
        "$1",
      );
    };

  const numericRegister = (fieldName) =>
    register(fieldName, {
      setValueAs: (value) =>
        value === "" || value === undefined ? null : Number(value),
    });

  const renderField = (fieldName, label, extraProps = {}) => {
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
              const value = selectedItem?.code_no || "";
              setDropdownValues((prev) => ({ ...prev, [fieldName]: value }));
              setValue(fieldName, value);
            }}
            select={dropdownValues[fieldName] || ""}
            data={dropdownData[fieldName] || []}
            table="BASIC_DATA"
            option="basic_data"
            getControlLabel={getControlLabel}
            language={language || "en"}
            field={getColumnLabel(fieldName, label)}
            totalItems={0}
            pageSize={10}
          />
        </Box>
      );
    }

    return (
      <TextField
        key={fieldName}
        fullWidth
        label={getColumnLabel(fieldName, label)}
        {...register(fieldName)}
        {...extraProps}
      />
    );
  };

  const onSubmit = (data) => {
    const finalData = {
      ...data,
      ...dropdownValues,
      is_ac: data.is_ac ? "Y" : "N",
      locked_information: acImp?.locked_information,
    };
    handleEdit(finalData);
  };

  const submitForm = handleSubmit(onSubmit);

  return (
    <FormDialogShell
      open={open}
      onClose={() => onClose(null)}
      onSubmit={submitForm}
      title={getControlLabel("ttl_edit", "Edit Material Tracking")}
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      submitDisabled={loading}
      maxWidth="xl"
    >
      <Stack spacing={2}>
        <FormSection title="Declaration information">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getColumnLabel("factory_code", "Factory Code")}
              {...register("factory_code")}
              disabled
            />
            <TextField
              fullWidth
              label={getColumnLabel("invoice_no", "Invoice No")}
              {...register("invoice_no")}
              disabled
            />
            <TextField
              fullWidth
              label={getColumnLabel("sort", "Sort")}
              {...register("sort")}
              disabled
            />
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
              label={getColumnLabel("bill_of_lading_no", "Bill of Lading No")}
              {...register("bill_of_lading_no")}
            />
            {renderField("shipside", "Shipside")}
            <TextField
              fullWidth
              label={getColumnLabel(
                "shipping_payment_way",
                "Shipping Payment Way",
              )}
              {...register("shipping_payment_way")}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Quantity, package and value">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getColumnLabel("qty_of_pieces", "Qty of Pieces")}
              {...numericRegister("qty_of_pieces")}
              type="number"
              inputProps={{
                step: "0.01",
                min: 0,
                onChange: handleDecimalInput(2),
              }}
            />
            <TextField
              fullWidth
              label={getColumnLabel("gross_weight", "Gross Weight")}
              {...numericRegister("gross_weight")}
              type="number"
              inputProps={{
                step: "0.01",
                min: 0,
                onChange: handleDecimalInput(2),
              }}
            />
            {renderField("packaging_unit", "Packaging Unit")}
            <TextField
              fullWidth
              label={getColumnLabel(
                "material_description",
                "Material Description",
              )}
              {...register("material_description")}
            />
            <TextField
              fullWidth
              label={getColumnLabel("factory_materials", "Factory Materials")}
              {...register("factory_materials")}
            />
            <TextField
              fullWidth
              label={getColumnLabel("container_quantity", "Container Quantity")}
              {...numericRegister("container_quantity")}
              type="number"
              inputProps={{
                step: "0.00000001",
                min: 0,
                onChange: handleDecimalInput(8),
              }}
            />
            <TextField
              fullWidth
              label={getColumnLabel("invoice_amount", "Invoice Amount")}
              {...numericRegister("invoice_amount")}
              type="number"
              inputProps={{
                step: "0.0001",
                min: 0,
                onChange: handleDecimalInput(4),
              }}
            />
            {renderField("currency", "Currency")}
            <TextField
              fullWidth
              label={getColumnLabel("exchange_rate", "Exchange Rate")}
              {...numericRegister("exchange_rate")}
              type="number"
              inputProps={{
                step: "0.00000001",
                min: 0,
                onChange: handleDecimalInput(8),
              }}
            />
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
                {...register(name)}
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
              {...register("date_completion_procedures")}
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label={getColumnLabel(
                "declaration_retrieve_date",
                "Declaration Retrieve Date",
              )}
              {...register("declaration_retrieve_date")}
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <Controller
              name="is_ac"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
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
              )}
            />
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default EditAcImpMaterialTrackingPage;
