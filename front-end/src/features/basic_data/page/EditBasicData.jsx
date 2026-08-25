import { Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";
import { fetchBasicDataCategoryByID } from "../../../service/basic_data_category/basicDataCategoryService";
import { fnQuery } from "../../../utils/fnQuery";
import { generateNameFields } from "../../../utils/table/formFieldHelper";

const EditBasicData = ({
  open,
  onClose,
  basicDataCategory,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  table,
  language,
  mapLanguageToColumn,
}) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      ...basicDataCategory,
    },
  });
  const [factory, setFactory] = useState({});

  const visibleColumn = mapLanguageToColumn(language);
  const nameFields = generateNameFields(table);
  void visibleColumn;

  const getStatusText = (status) => {
    if (status === 1) return "New-1";
    if (status === 0) return "Cancel-0";
    if (status === 7) return "Confirm-7";
    if (status === 9) return "Close-9";
    return "New-1";
  };

  useEffect(() => {
    if (basicDataCategory && Object.keys(basicDataCategory).length > 0) {
      reset({
        ...basicDataCategory,
        statusText: getStatusText(basicDataCategory.status),
      });
    }
  }, [basicDataCategory, reset]);

  useEffect(() => {
    if (
      !open ||
      !basicDataCategory?.factory_code ||
      !basicDataCategory?.category_code
    ) {
      return;
    }

    const fetchByID = async () => {
      const response = await fnQuery([
        () =>
          fetchBasicDataCategoryByID(
            basicDataCategory.factory_code,
            basicDataCategory.category_code,
          ),
      ]);

      if (response?.[0]?.success) {
        setFactory(response[0].data?.FACTORY || {});
      }
    };

    fetchByID();
  }, [open, basicDataCategory]);

  const submitForm = handleSubmit(handleEdit);
  const readOnlyProps = {
    InputLabelProps: { shrink: true },
    InputProps: { readOnly: true },
  };

  return (
    <FormDialogShell
      open={open}
      onClose={() => onClose(null)}
      onSubmit={submitForm}
      title={getControlLabel(
        "ttl_m_edit",
        "Edit Basic Data Category Information",
      )}
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
        <FormSection title={getControlLabel("ftxt_m_factory", "Factory Information")}>
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getControlLabel("txt_m_factory_name_t", "factory_name_t")}
              value={factory?.factory_name_t || ""}
              {...readOnlyProps}
            />
            <TextField
              fullWidth
              label={getControlLabel("txt_m_factory_name_e", "factory_name_e")}
              value={factory?.factory_name_e || ""}
              {...readOnlyProps}
            />
            <TextField
              fullWidth
              label={getControlLabel("txt_m_factory_name_l", "factory_name_l")}
              value={factory?.factory_name_l || ""}
              {...readOnlyProps}
            />
            <TextField
              fullWidth
              label={getControlLabel("txt_m_factory_address", "factory_address")}
              value={factory?.factory_address || ""}
              {...readOnlyProps}
            />
            <TextField
              fullWidth
              label={getControlLabel(
                "txt_m_factory_abbreviation",
                "factory_abbreviation",
              )}
              value={factory?.factory_abbreviation || ""}
              {...readOnlyProps}
            />
            <TextField
              fullWidth
              label={getControlLabel("txt_m_factory_tax_no", "factory_tax_no")}
              value={factory?.factory_tax_no || ""}
              {...readOnlyProps}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Category information">
          <FormGrid>
            <TextField
              fullWidth
              label={getColumnLabel("category_code", "category_code")}
              {...register("category_code")}
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
          </FormGrid>
        </FormSection>

        <FormSection title="Localized names">
          <FormGrid columns={3}>
            {nameFields.map((field) => (
              <TextField
                key={field.key}
                fullWidth
                label={getColumnLabel(field.name, field.label)}
                {...register(field.name)}
                InputLabelProps={{ shrink: true }}
              />
            ))}
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default EditBasicData;
