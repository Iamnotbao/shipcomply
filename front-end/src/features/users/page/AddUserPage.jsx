import { MenuItem, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import Dropdown from "../../../component/dropdown/Dropdown";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";
import { fetchFactory } from "../../../service/factory/factoryService";
import { fetchDepartmentByFac } from "../../../service/factory_departments/FacDepartmentService";
import { fnQuery } from "../../../utils/fnQuery";

const AddUserPage = ({
  open,
  handleClose,
  handleAdd,
  users,
  selectUser,
  selectFactory,
  selectDepartment,
  handleSelectFactory,
  handleSelectDepartment,
  handleSelectUser,
  getColumnLabel,
  getControlLabel,
  language = "en",
}) => {
  const [factories, setFactories] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchF = async () => {
      const [factoryResponse] = await fnQuery([() => fetchFactory()]);
      if (factoryResponse) {
        setFactories(factoryResponse);
      }
    };

    fetchF();
  }, []);

  useEffect(() => {
    if (!selectFactory?.factory_code) {
      setDepartments([]);
      return;
    }

    const fetchD = async () => {
      const [departmentResponse] = await fnQuery([
        () => fetchDepartmentByFac(selectFactory.factory_code),
      ]);
      if (departmentResponse) {
        setDepartments(departmentResponse);
      }
    };

    fetchD();
  }, [selectFactory?.factory_code]);

  return (
    <FormDialogShell
      open={open}
      onClose={handleClose}
      onSubmit={handleAdd}
      title={getControlLabel("ttl_add", "Add User Information")}
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      maxWidth="md"
    >
      <Stack spacing={2}>
        <FormSection title="Assignment">
          <FormGrid columns={3}>
            <Dropdown
              key={selectFactory?.factory_code || "factory"}
              select={selectFactory}
              data={factories?.data}
              onSelect={handleSelectFactory}
              getControlLabel={getControlLabel}
              language={language}
            />
            <Dropdown
              key={selectDepartment?.department_code || "department"}
              select={selectDepartment}
              data={departments?.data}
              onSelect={handleSelectDepartment}
              language={language}
              table="DEPARTMENTS"
              option="department"
              getControlLabel={getControlLabel}
            />
            <Dropdown
              key={selectUser?.user_code || "user"}
              select={selectUser}
              data={users?.[0]?.data}
              onSelect={handleSelectUser}
              getControlLabel={getControlLabel}
              language={language}
              table="USER"
              option="user"
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Account information">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getColumnLabel("user_code", "user_code")}
              name="user_code"
            />
            <TextField
              type="password"
              fullWidth
              label={getColumnLabel("user_password", "user_password")}
              name="user_password"
            />
            <TextField
              select
              fullWidth
              label={getColumnLabel(
                "allow_authorization",
                "allow_authorization",
              )}
              name="allow_authorization"
              defaultValue="Y"
            >
              <MenuItem value="Y">Y</MenuItem>
              <MenuItem value="N">N</MenuItem>
            </TextField>
          </FormGrid>
        </FormSection>

        <FormSection title="User names">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getColumnLabel("user_name_t", "user_name_t")}
              name="user_name_t"
            />
            <TextField
              fullWidth
              label={getColumnLabel("user_name_e", "user_name_e")}
              name="user_name_e"
            />
            <TextField
              fullWidth
              label={getColumnLabel("user_name_l", "user_name_l")}
              name="user_name_l"
            />
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default AddUserPage;
