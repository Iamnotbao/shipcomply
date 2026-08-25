import { MenuItem, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Dropdown from "../../../component/dropdown/Dropdown";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";
import {
  fetchSingleUser,
  fetchUserByDepartment,
} from "../../../service/user/userService";

const EditUserPage = ({
  open,
  onClose,
  handleEdit,
  handleSelectSupervisor,
  selectUser,
  selectSupervisor,
  getColumnLabel,
  getControlLabel,
  language = "en",
}) => {
  const [factory, setFactory] = useState({});
  const [department, setDepartment] = useState({});
  const [users, setUsers] = useState([]);

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: {
      ...selectUser,
      allow_authorization: selectUser?.allow_authorization ?? "Y",
      factory_code: selectUser?.factory ?? "",
      department_code: selectUser?.department_code ?? "",
    },
  });

  useEffect(() => {
    if (selectUser) {
      reset({
        ...selectUser,
        allow_authorization: selectUser?.allow_authorization ?? "Y",
        factory_code: selectUser?.factory_code ?? "",
        department_code: selectUser?.department_code ?? "",
      });
    }
  }, [selectUser, reset]);

  useEffect(() => {
    if (
      !selectUser?.factory_code ||
      !selectUser?.department_code ||
      !selectUser?.user_code
    ) {
      return;
    }

    const loadContext = async () => {
      const [singleUserResponse, usersResponse] = await Promise.all([
        fetchSingleUser(
          selectUser.factory_code,
          selectUser.department_code,
          selectUser.user_code,
        ),
        fetchUserByDepartment(
          selectUser.factory_code,
          selectUser.department_code,
        ),
      ]);

      if (singleUserResponse?.data) {
        const { FACTORY, DEPARTMENT } = singleUserResponse.data;
        setFactory(FACTORY || {});
        setDepartment(DEPARTMENT || {});
      }

      if (usersResponse) {
        setUsers([
          { tableName: usersResponse.tableName, data: usersResponse.data },
        ]);
      }
    };

    loadContext();
  }, [
    selectUser?.department_code,
    selectUser?.factory_code,
    selectUser?.user_code,
  ]);

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
      title={getControlLabel("ttl_edit", "Edit User Information")}
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      maxWidth="lg"
    >
      <Stack spacing={2}>
        <FormSection title={getControlLabel("mtxt_factory", "Factory Information")}>
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

        <FormSection
          title={getControlLabel("mtxt_department", "Department Information")}
        >
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getControlLabel(
                "txt_department_name_t",
                "department_name_t",
              )}
              value={department?.department_name_t || ""}
              {...readOnlyProps}
            />
            <TextField
              fullWidth
              label={getControlLabel(
                "txt_department_name_e",
                "department_name_e",
              )}
              value={department?.department_name_e || ""}
              {...readOnlyProps}
            />
            <TextField
              fullWidth
              label={getControlLabel(
                "txt_department_name_l",
                "department_name_l",
              )}
              value={department?.department_name_l || ""}
              {...readOnlyProps}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="User information">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getColumnLabel("user_name_t", "user_name_t")}
              {...register("user_name_t")}
            />
            <TextField
              fullWidth
              label={getColumnLabel("user_name_e", "user_name_e")}
              {...register("user_name_e")}
            />
            <TextField
              fullWidth
              label={getColumnLabel("user_name_l", "user_name_l")}
              {...register("user_name_l")}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Authorization">
          <FormGrid>
            <Dropdown
              data={users?.[0]?.data?.filter(
                (user) => user.user_code !== selectUser?.user_code,
              )}
              select={selectSupervisor}
              onSelect={handleSelectSupervisor}
              table="USER"
              option="user"
              getControlLabel={getControlLabel}
              language={language}
            />
            <Controller
              name="allow_authorization"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  fullWidth
                  label={getColumnLabel(
                    "allow_authorization",
                    "allow_authorization",
                  )}
                  {...field}
                >
                  <MenuItem value="Y">Y</MenuItem>
                  <MenuItem value="N">N</MenuItem>
                </TextField>
              )}
            />
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default EditUserPage;
