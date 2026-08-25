import { Stack, TextField } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";

const EditProgramPage = ({
  open,
  onClose,
  program,
  handleEdit,
  getControlLabel,
  getColumnLabel,
}) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      ...program,
    },
  });

  useEffect(() => {
    if (program?.program_code) {
      reset({ ...program });
    }
  }, [program, reset]);

  const submitForm = handleSubmit(handleEdit);

  return (
    <FormDialogShell
      open={open}
      onClose={onClose}
      onSubmit={submitForm}
      title={getControlLabel("ttl_edit", "Edit Program Information")}
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
        <FormSection title="Program information">
          <FormGrid>
            <TextField
              fullWidth
              label={getColumnLabel("program_code", "program_code")}
              {...register("program_code")}
              disabled
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Program names">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getColumnLabel("program_name_t", "program_name_t")}
              {...register("program_name_t")}
            />
            <TextField
              fullWidth
              label={getColumnLabel("program_name_e", "program_name_e")}
              {...register("program_name_e")}
            />
            <TextField
              fullWidth
              label={getColumnLabel("program_name_l", "program_name_l")}
              {...register("program_name_l")}
            />
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default EditProgramPage;
