import { Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import Dropdown from "../../../component/dropdown/Dropdown";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";
import { fetchFactory } from "../../../service/factory/factoryService";
import {
  fetchDepartmentByFac,
  fetchDepartments,
} from "../../../service/factory_departments/FacDepartmentService";
import { fnQuery } from "../../../utils/fnQuery";

const AddFacDept = ({
  open,
  handleClose,
  handleAdd,
  getControlLabel,
  language,
}) => {
  const [selectFactory, setSelectFactory] = useState({});
  const [selectDepartment, setSelectDepartment] = useState({});
  const [factories, setFactories] = useState([]);
  const [departments, setDepartments] = useState([]);

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
  };

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
        setSelectDepartment(response.data?.[0] || {});
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

  const factoryNameKey = nameBasedOnLanguage.FACTORY[language] || "factory_name_e";
  const departmentNameKey =
    nameBasedOnLanguage.DEPARTMENTS[language] || "department_name_e";

  return (
    <FormDialogShell
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit}
      title={getControlLabel("ttl_add", "Add Factory & Department")}
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      maxWidth="md"
    >
      <Stack spacing={2}>
        <FormSection
          title={getControlLabel(
            "ftxt_fac_dept",
            "Factory and Department Information",
          )}
        >
          <FormGrid>
            <Dropdown
              key={selectFactory?.factory_code || "factory"}
              select={selectFactory}
              data={factories[0]?.data}
              onSelect={setSelectFactory}
              table="FACTORY"
              option="factory"
              getControlLabel={getControlLabel}
              language={language}
            />
            <TextField
              fullWidth
              label={getControlLabel("txt_factory_name", "factory_name")}
              name="factory_name"
              value={selectFactory?.[factoryNameKey] || ""}
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: true }}
            />
            <Dropdown
              key={selectDepartment?.department_code || "department"}
              select={selectDepartment}
              data={departments[0]?.data}
              onSelect={setSelectDepartment}
              table="DEPARTMENTS"
              option="department"
              getControlLabel={getControlLabel}
              language={language}
            />
            <TextField
              fullWidth
              label={getControlLabel("txt_department_name", "department_name")}
              name="department_name"
              value={selectDepartment?.[departmentNameKey] || ""}
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: true }}
            />
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default AddFacDept;
