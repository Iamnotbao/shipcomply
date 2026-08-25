import { Stack, TextField } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";

const EditFactoryPage = ({
  open,
  onClose,
  factory,
  handleEdit,
  getControlLabel,
  getColumnLabel,
}) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      ...factory,
    },
  });

  const getStatusText = (status) => {
    if (status === 1) return "New-1";
    if (status === 0) return "Cancel-0";
    return "New-1";
  };

  useEffect(() => {
    if (factory?.factory_code) {
      reset({
        ...factory,
        statusText: getStatusText(factory.status),
      });
    }
  }, [factory?.factory_code, factory?.status, reset]);

  const onSubmit = (data) => {
    const { statusText, ...submitData } = data;
    handleEdit(submitData);
  };

  const submitForm = handleSubmit(onSubmit);

  return (
    <FormDialogShell
      open={open}
      onClose={() => onClose(null)}
      onSubmit={submitForm}
      title={getControlLabel("ttl_edit", "Edit Factory Information")}
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      maxWidth="md"
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
        <FormSection title="Basic information">
          <FormGrid>
            <TextField
              fullWidth
              label={getColumnLabel("factory_code", "factory_code")}
              {...register("factory_code")}
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
              label={getColumnLabel(
                "factory_abbreviation",
                "factory_abbreviation",
              )}
              {...register("factory_abbreviation")}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Factory names">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getColumnLabel("factory_name_t", "Factory Name T")}
              {...register("factory_name_t")}
            />
            <TextField
              fullWidth
              label={getColumnLabel("factory_name_e", "factory_name_e")}
              {...register("factory_name_e")}
            />
            <TextField
              fullWidth
              label={getColumnLabel("factory_name_l", "factory_name_l")}
              {...register("factory_name_l")}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Business information">
          <FormGrid>
            <TextField
              fullWidth
              label={getColumnLabel("factory_tax_no", "factory_tax_no")}
              {...register("factory_tax_no")}
            />
            <TextField
              fullWidth
              label={getColumnLabel("factory_address", "factory_address")}
              {...register("factory_address")}
            />
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default EditFactoryPage;
