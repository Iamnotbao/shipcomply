import { Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";
import { fetchFactory } from "../../../service/factory/factoryService";
import {
  fetchDepartmentByFac,
  fetchDepartments,
} from "../../../service/factory_departments/FacDepartmentService";
import { fnQuery } from "../../../utils/fnQuery";
import { generateNameFields } from "../../../utils/table/formFieldHelper";

const AddBasicDataCategory = ({
  open,
  handleClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  language,
  user,
  selectRows,
  table = "",
  mapLanguageToColumn,
}) => {
  const [selectFactory] = useState({});
  const [selectDepartment] = useState({});
  const [, setFactories] = useState([]);
  const [, setDepartments] = useState([]);

  const visibleColumn = mapLanguageToColumn(language);
  const nameFields = generateNameFields(table);
  void visibleColumn;

  useEffect(() => {
    const fetchAll = async () => {
      const [fact, dept] = await fnQuery([
        () => fetchFactory(),
        () => fetchDepartments(),
      ]);

      if (fact) {
        setFactories([{ tableName: fact.tableName, data: fact.data }]);
      }
      if (dept) {
        setDepartments([{ tableName: dept.tableName, data: dept.data }]);
      }
    };

    fetchAll();
  }, []);

  useEffect(() => {
    if (!selectFactory?.factory_code) return;

    const handleDeptByFactory = async () => {
      const response = await fetchDepartmentByFac(selectFactory.factory_code);
      if (response) {
        setDepartments([{ tableName: response.tableName, data: response.data }]);
      }
    };

    handleDeptByFactory();
  }, [selectFactory]);

  const handleSubmit = (event) => {
    event.preventDefault();
    handleAdd(
      event,
      selectFactory.factory_code,
      selectDepartment.department_code,
    );
  };

  return (
    <FormDialogShell
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={getControlLabel("ttl_d_add", "Add Basic Data Information")}
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      maxWidth="lg"
    >
      <Stack spacing={2}>
        <FormSection
          title={getControlLabel(
            "ftxt_d_fac_dept",
            "Factory and Department Information",
          )}
        >
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getControlLabel("txt_d_factory_code", "factory_code")}
              name="factory_code"
              value={user?.factory || ""}
              InputLabelProps={{ shrink: true }}
              disabled
            />
            <TextField
              fullWidth
              label={getControlLabel(
                "txt_d_department_code",
                "department_code",
              )}
              name="department_code"
              value={user?.department || ""}
              InputLabelProps={{ shrink: true }}
              disabled
            />
            <TextField
              fullWidth
              label={getControlLabel("txt_d_category_code", "category_code")}
              name="category_code"
              value={selectRows?.category_code || ""}
              InputLabelProps={{ shrink: true }}
              disabled
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Item information">
          <FormGrid>
            <TextField
              fullWidth
              label={getColumnLabel("code_no", "code_no")}
              name="code_no"
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Localized names">
          <FormGrid columns={3}>
            {nameFields.map((field) => (
              <TextField
                key={field.key}
                fullWidth
                label={getColumnLabel(field.name, field.label)}
                name={field.name}
              />
            ))}
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default AddBasicDataCategory;
