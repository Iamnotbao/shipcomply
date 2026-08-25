import { Box, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Dropdown from "../../../component/dropdown/Dropdown";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";
import ReadOnlyField from "../../../component/form/ReadOnlyField";
import { fetchAcItemMByID } from "../../../service/ac_item_m/AcItemMService";
import {
  fetchBasicDataByCate,
  fetchBasicDataDropDownByCate,
} from "../../../service/basic_data/basicDataService";
import { fnQuery } from "../../../utils/fnQuery";

const EditAcItemM = ({
  open,
  auth,
  user,
  onClose,
  acItemM,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  language = "en",
}) => {
  const [dropdownData, setDropdownData] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});
  const [factory, setFactory] = useState({});
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: { ...acItemM },
  });

  const mapDropdown = {
    ac_type: "CDC",
    unit: 1108,
  };

  const getStatusText = (status) => {
    if (status === 1) return "New-1";
    if (status === 0) return "Cancel-0";
    if (status === 7) return "Confirm-7";
    if (status === 9) return "Close-9";
    return "New-1";
  };

  useEffect(() => {
    if (!open || !acItemM || Object.keys(acItemM).length === 0) return;

    reset({
      ...acItemM,
      statusText: getStatusText(acItemM.status),
    });
    setDropdownValues({
      ac_type: acItemM.ac_type || "",
      unit: acItemM.unit || "",
    });
  }, [acItemM, open, reset]);

  useEffect(() => {
    if (!open || !acItemM?.factory_code || !acItemM?.item_acno) return;

    const fetchByID = async () => {
      const response = await fnQuery([
        () => fetchAcItemMByID(acItemM.factory_code, acItemM.item_acno),
      ]);
      if (response?.[0]?.success) {
        setFactory(response[0].data?.FACTORY || {});
      }
    };

    fetchByID();
  }, [acItemM, open]);

  useEffect(() => {
    if (!open) {
      setDropdownValues({});
      return;
    }

    const fetchAllDropdowns = async () => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : null;
        const results = await Promise.all(
          Object.entries(mapDropdown).map(async ([fieldName, categoryCode]) => {
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
          }),
        );
        setDropdownData(
          Object.fromEntries(results.map(({ fieldName, data }) => [fieldName, data])),
        );
      } catch (error) {
        console.error("Error fetching dropdowns:", error);
      }
    };

    fetchAllDropdowns();
  }, [auth, open, user?.department, user?.factory, user?.user_code]);

  const createDropdownCallback = (categoryCode) =>
    async (page, pageSize, searchText) => {
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

  const handleDecimalInput =
    (decimals = 8) =>
    (event) => {
      event.target.value = event.target.value.replace(
        new RegExp(`(\\.\\d{${decimals}})\\d+`),
        "$1",
      );
    };

  const renderField = (fieldName, label, extraProps = {}, type = "text") => {
    if (Object.prototype.hasOwnProperty.call(mapDropdown, fieldName)) {
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
        type={type}
        inputProps={
          type === "number"
            ? {
                step: "0.0001",
                min: 0,
                onChange: handleDecimalInput(4),
                ...extraProps.inputProps,
              }
            : extraProps.inputProps
        }
        {...register(fieldName, {
          setValueAs: (value) =>
            type === "number"
              ? value === "" || value === undefined
                ? null
                : Number(value)
              : value,
        })}
        {...extraProps}
      />
    );
  };

  const submitForm = handleSubmit(handleEdit);

  return (
    <FormDialogShell
      open={open}
      onClose={() => onClose(null)}
      onSubmit={submitForm}
      title={getControlLabel("ttl_m_1_edit", "Edit Ac Item M Information")}
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      maxWidth="lg"
    >
      <Stack
        spacing={2}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            submitForm();
          }
        }}
      >
        <FormSection
          title={getControlLabel("ftxt_m_fac_dept", "Factory Information")}
        >
          <FormGrid columns={3}>
            <ReadOnlyField
              label={getControlLabel("txt_m_factory_name_t", "factory_name_t")}
              value={factory?.factory_name_t}
            />
            <ReadOnlyField
              label={getControlLabel("txt_m_factory_name_e", "factory_name_e")}
              value={factory?.factory_name_e}
            />
            <ReadOnlyField
              label={getControlLabel("txt_m_factory_name_l", "factory_name_l")}
              value={factory?.factory_name_l}
            />
            <ReadOnlyField
              label={getControlLabel("txt_m_factory_address", "factory_address")}
              value={factory?.factory_address}
            />
            <ReadOnlyField
              label={getControlLabel(
                "txt_m_factory_abbreviation",
                "factory_abbreviation",
              )}
              value={factory?.factory_abbreviation}
            />
            <ReadOnlyField
              label={getControlLabel("txt_m_factory_tax_no", "factory_tax_no")}
              value={factory?.factory_tax_no}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Item identity and names">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getColumnLabel("item_acno", "item_acno")}
              {...register("item_acno")}
              InputLabelProps={{ shrink: true }}
              disabled
            />
            <TextField
              fullWidth
              label={getColumnLabel("status", "status")}
              {...register("statusText")}
              InputLabelProps={{ shrink: true }}
              disabled
            />
            <TextField
              fullWidth
              label={getColumnLabel("item_acname_t", "item_acname_t")}
              {...register("item_acname_t")}
            />
            <TextField
              fullWidth
              label={getColumnLabel("item_acname_e", "item_acname_e")}
              {...register("item_acname_e")}
            />
            <TextField
              fullWidth
              label={getColumnLabel("item_acname_l", "item_acname_l")}
              {...register("item_acname_l")}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Customs and usage information">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getColumnLabel("ac_item", "ac_item")}
              {...register("ac_item")}
            />
            {renderField("unit", "Unit")}
            {renderField(
              "tax_per",
              "Tax Percent",
              {
                inputProps: {
                  step: "0.01",
                  min: 0,
                  onInput: handleDecimalInput(2),
                },
              },
              "number",
            )}
            {renderField(
              "loss_per",
              "Loss Percent",
              {
                inputProps: {
                  step: "0.01",
                  min: 0,
                  onInput: handleDecimalInput(2),
                },
              },
              "number",
            )}
            {renderField("ac_type", "Ac Type")}
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default EditAcItemM;
