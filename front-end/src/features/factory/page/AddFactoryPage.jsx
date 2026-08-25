import { Stack, TextField } from "@mui/material";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";

const AddFactoryPage = ({
  open,
  onClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
}) => {
  return (
    <FormDialogShell
      open={open}
      onClose={onClose}
      onSubmit={handleAdd}
      title={getControlLabel("ttl_add", "Add Factory Information")}
      description="Create the factory identity, localized names, and business information."
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      maxWidth="md"
    >
      <Stack spacing={2}>
        <FormSection title="Basic information">
          <FormGrid>
            <TextField
              fullWidth
              label={getColumnLabel("factory_code", "factory_code")}
              name="factory_code"
            />
            <TextField
              fullWidth
              label={getColumnLabel(
                "factory_abbreviation",
                "factory_abbreviation",
              )}
              name="factory_abbreviation"
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Factory names">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getColumnLabel("factory_name_t", "factory_name_t")}
              name="factory_name_t"
            />
            <TextField
              fullWidth
              label={getColumnLabel("factory_name_e", "factory_name_e")}
              name="factory_name_e"
            />
            <TextField
              fullWidth
              label={getColumnLabel("factory_name_l", "factory_name_l")}
              name="factory_name_l"
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Business information">
          <FormGrid>
            <TextField
              fullWidth
              label={getColumnLabel("factory_tax_no", "factory_tax_no")}
              name="factory_tax_no"
            />
            <TextField
              fullWidth
              label={getColumnLabel("factory_address", "factory_address")}
              name="factory_address"
            />
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default AddFactoryPage;
