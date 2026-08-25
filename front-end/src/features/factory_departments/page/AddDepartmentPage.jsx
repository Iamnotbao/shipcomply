import { Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import Dropdown from "../../../component/dropdown/Dropdown";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";
import { fetchFactory } from "../../../service/factory/factoryService";
import { fnQuery } from "../../../utils/fnQuery";

const AddDepartmentPage = ({
  open,
  onClose,
  handleAdd,
  selectFactory,
  handleSelectFactory,
  getControlLabel,
  getColumnLabel,
  language = "en",
}) => {
  const [factories, setFactories] = useState([]);

  useEffect(() => {
    const fetchF = async () => {
      const [factoryResponse] = await fnQuery([() => fetchFactory()]);
      if (factoryResponse) {
        setFactories(factoryResponse);
      }
    };

    fetchF();
  }, []);

  return (
    <FormDialogShell
      open={open}
      onClose={onClose}
      onSubmit={handleAdd}
      title={getControlLabel("ttl_add", "Add Department Information")}
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      maxWidth="md"
    >
      <Stack spacing={2}>
        <FormSection title={getControlLabel("ftxt_factory", "Factory Information")}>
          <FormGrid>
            <Dropdown
              key={selectFactory?.factory_code || "factory"}
              select={selectFactory}
              data={factories?.data}
              onSelect={handleSelectFactory}
              getControlLabel={getControlLabel}
              language={language}
            />
            <TextField
              fullWidth
              label={getColumnLabel("department_code", "department_code")}
              name="department_code"
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Department names">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getColumnLabel("department_name_t", "department_name_t")}
              name="department_name_t"
            />
            <TextField
              fullWidth
              label={getColumnLabel("department_name_e", "department_name_e")}
              name="department_name_e"
            />
            <TextField
              fullWidth
              label={getColumnLabel("department_name_l", "department_name_l")}
              name="department_name_l"
            />
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default AddDepartmentPage;
