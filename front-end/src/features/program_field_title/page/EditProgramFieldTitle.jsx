import { Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";
import { fetchProgramFieldTitleByID } from "../../../service/program_field_title/programFieldTitleService";
import { fnQuery } from "../../../utils/fnQuery";

const EditProgramFieldTitlePage = ({
  open,
  onClose,
  programFieldTitle,
  handleEdit,
  getControlLabel,
  getColumnLabel,
}) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      ...programFieldTitle,
    },
  });
  const [program, setProgram] = useState({});

  const getStatusText = (status) => {
    if (status === 1) return "New-1";
    if (status === 0) return "Cancel-0";
    return "New-1";
  };

  useEffect(() => {
    if (programFieldTitle && Object.keys(programFieldTitle).length > 0) {
      reset({
        ...programFieldTitle,
        statusText: getStatusText(programFieldTitle.status),
      });
    }
  }, [programFieldTitle, reset]);

  useEffect(() => {
    if (!open || !programFieldTitle?.program_code || !programFieldTitle?.field_code) {
      return;
    }

    const fetchPFTByID = async () => {
      const response = await fnQuery([
        () =>
          fetchProgramFieldTitleByID(
            programFieldTitle.program_code,
            programFieldTitle.field_code,
          ),
      ]);

      if (response?.[0]?.success) {
        setProgram(response[0].data?.PROGRAM || {});
      }
    };

    fetchPFTByID();
  }, [open, programFieldTitle]);

  const submitForm = handleSubmit(handleEdit);
  const readOnlyProps = {
    InputLabelProps: { shrink: true },
    InputProps: { readOnly: true },
  };

  return (
    <FormDialogShell
      open={open}
      onClose={onClose}
      onSubmit={submitForm}
      title={getControlLabel("ttl_edit", "Edit Program Language Information")}
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
        <FormSection title={getControlLabel("ftxt_program", "Program Information")}>
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getControlLabel("txt_program_name_t", "program_name_t")}
              value={program?.program_name_t || ""}
              {...readOnlyProps}
            />
            <TextField
              fullWidth
              label={getControlLabel("txt_program_name_e", "program_name_e")}
              value={program?.program_name_e || ""}
              {...readOnlyProps}
            />
            <TextField
              fullWidth
              label={getControlLabel("txt_program_name_l", "program_name_l")}
              value={program?.program_name_l || ""}
              {...readOnlyProps}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Field information">
          <FormGrid>
            <TextField
              fullWidth
              label={getColumnLabel("field_code", "field_code")}
              {...register("field_code")}
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

        <FormSection title="Localized titles">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getColumnLabel("title_name_t", "title_name_t")}
              {...register("title_name_t")}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label={getColumnLabel("title_name_e", "title_name_e")}
              {...register("title_name_e")}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label={getColumnLabel("title_name_l", "title_name_l")}
              {...register("title_name_l")}
              InputLabelProps={{ shrink: true }}
            />
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default EditProgramFieldTitlePage;
