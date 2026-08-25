import { Stack, TextField } from "@mui/material";
import Dropdown from "../../../component/dropdown/Dropdown";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";

const AddUserPermission = ({
  open,
  handleClose,
  handleAdd,
  selectFactory,
  selectDepartment,
  selectProgram,
  onSelectProgram,
  programs,
  getControlLabel,
  language,
}) => {
  const nameBasedOnLanguage = {
    DEPARTMENTS: {
      en: "department_name_e",
      vi: "department_name_l",
      zh: "department_name_t",
    },
    FACTORY: {
      en: "factory_name_e",
      vi: "factory_name_l",
      zh: "factory_name_t",
    },
    PROGRAM: {
      en: "program_name_e",
      vi: "program_name_l",
      zh: "program_name_t",
    },
  };

  const factoryNameKey = nameBasedOnLanguage.FACTORY[language] || "factory_name_e";
  const departmentNameKey =
    nameBasedOnLanguage.DEPARTMENTS[language] || "department_name_e";
  const programNameKey = nameBasedOnLanguage.PROGRAM[language] || "program_name_e";
  const readOnlyProps = {
    InputLabelProps: { shrink: true },
    InputProps: { readOnly: true },
  };

  return (
    <FormDialogShell
      open={open}
      onClose={handleClose}
      onSubmit={handleAdd}
      title={getControlLabel("ttl_add", "Add Permission Information")}
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      maxWidth="lg"
    >
      <Stack spacing={2}>
        <FormSection title="Assignment context">
          <FormGrid>
            <TextField
              fullWidth
              label={getControlLabel("txt_factory_code", "factory_code")}
              name="factory_code"
              value={selectFactory?.factory_code || ""}
              {...readOnlyProps}
            />
            <TextField
              fullWidth
              label={getControlLabel("txt_factory_name", "factory_name")}
              name="factory_name_e"
              value={selectFactory?.[factoryNameKey] || ""}
              {...readOnlyProps}
            />
            <TextField
              fullWidth
              label={getControlLabel("txt_department_code", "department_code")}
              name="department_code"
              value={selectDepartment?.department_code || ""}
              {...readOnlyProps}
            />
            <TextField
              fullWidth
              label={getControlLabel("txt_department_name", "department_name")}
              name="department_name_e"
              value={selectDepartment?.[departmentNameKey] || ""}
              {...readOnlyProps}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Program access">
          <FormGrid>
            <Dropdown
              key={selectProgram?.program_code || "program"}
              select={selectProgram}
              data={programs?.[0]?.data}
              onSelect={onSelectProgram}
              table="PROGRAM"
              option="program"
              getControlLabel={getControlLabel}
              language={language}
            />
            <TextField
              fullWidth
              label={getControlLabel("txt_program_name", "program_name")}
              name="program_name_e"
              value={selectProgram?.[programNameKey] || ""}
              {...readOnlyProps}
            />
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default AddUserPermission;
