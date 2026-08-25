import { Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";
import { fetchDeptByID } from "../../../service/factory_departments/FacDepartmentService";
import { fnQuery } from "../../../utils/fnQuery";

const EditDepartmentPage = ({
  open,
  onClose,
  department,
  handleEdit,
  getControlLabel,
  getColumnLabel,
}) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      ...department,
    },
  });
  const [factory, setFactory] = useState({});

  const getStatusText = (status) => {
    if (status === 1) return "New-1";
    if (status === 0) return "Cancel-0";
    return "New-1";
  };

  useEffect(() => {
    if (department && Object.keys(department).length > 0) {
      reset({
        ...department,
        statusText: getStatusText(department.status),
      });
    }
  }, [department, reset]);

  useEffect(() => {
    if (!open || !department?.factory_code || !department?.department_code) {
      return;
    }

    const fetchDepartmentByID = async () => {
      const response = await fnQuery([
        () => fetchDeptByID(department.factory_code, department.department_code),
      ]);

      if (response?.[0]?.success) {
        setFactory(response[0].data?.FACTORY || {});
      }
    };

    fetchDepartmentByID();
  }, [open, department]);

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
      title={getControlLabel("ttl_edit", "Edit Department Information")}
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
        <FormSection title={getControlLabel("ftxt_factory", "Factory Information")}>
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getControlLabel("txt_factory_name_t", "factory_name_t")}
              value={factory?.factory_name_t || ""}
              {...readOnlyProps}
            />
            <TextField
              fullWidth
              label={getControlLabel("txt_factory_name_e", "factory_name_e")}
              value={factory?.factory_name_e || ""}
              {...readOnlyProps}
            />
            <TextField
              fullWidth
              label={getControlLabel("txt_factory_name_l", "factory_name_l")}
              value={factory?.factory_name_l || ""}
              {...readOnlyProps}
            />
            <TextField
              fullWidth
              label={getControlLabel("txt_factory_address", "factory_address")}
              value={factory?.factory_address || ""}
              {...readOnlyProps}
            />
            <TextField
              fullWidth
              label={getControlLabel(
                "txt_factory_abbreviation",
                "factory_abbreviation",
              )}
              value={factory?.factory_abbreviation || ""}
              {...readOnlyProps}
            />
            <TextField
              fullWidth
              label={getControlLabel("txt_factory_tax_no", "factory_tax_no")}
              value={factory?.factory_tax_no || ""}
              {...readOnlyProps}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Department information">
          <FormGrid>
            <TextField
              fullWidth
              label={getColumnLabel("department_code", "department_code")}
              {...register("department_code")}
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

        <FormSection title="Department names">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getColumnLabel("department_name_t", "department_name_t")}
              {...register("department_name_t")}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label={getColumnLabel("department_name_e", "department_name_e")}
              {...register("department_name_e")}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label={getColumnLabel("department_name_l", "department_name_l")}
              {...register("department_name_l")}
              InputLabelProps={{ shrink: true }}
            />
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default EditDepartmentPage;
