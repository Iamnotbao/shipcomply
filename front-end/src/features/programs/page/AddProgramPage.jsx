import { Stack, TextField } from "@mui/material";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";

const AddProgramPage = ({
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
      title={getControlLabel("ttl_add", "Add Program Information")}
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      maxWidth="md"
    >
      <Stack spacing={2}>
        <FormSection title="Program information">
          <FormGrid>
            <TextField
              fullWidth
              label={getColumnLabel("program_code", "program_code")}
              name="program_code"
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Program names">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getColumnLabel("program_name_t", "program_name_t")}
              name="program_name_t"
            />
            <TextField
              fullWidth
              label={getColumnLabel("program_name_e", "program_name_e")}
              name="program_name_e"
            />
            <TextField
              fullWidth
              label={getColumnLabel("program_name_l", "program_name_l")}
              name="program_name_l"
            />
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default AddProgramPage;
