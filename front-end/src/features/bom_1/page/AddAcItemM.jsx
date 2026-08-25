import { Box, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import Dropdown from "../../../component/dropdown/Dropdown";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";
import ReadOnlyField from "../../../component/form/ReadOnlyField";
import {
  fetchBasicDataByCate,
  fetchBasicDataDropDownByCate,
} from "../../../service/basic_data/basicDataService";
import { fetchFactory } from "../../../service/factory/factoryService";
import {
  fetchDepartmentByFac,
  fetchDepartments,
} from "../../../service/factory_departments/FacDepartmentService";
import { fnQuery } from "../../../utils/fnQuery";

const AddAcItemM = ({
  open,
  handleClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  language,
  user,
  auth,
}) => {
  const [selectFactory] = useState({});
  const [selectDepartment] = useState({});
  const [, setFactories] = useState([]);
  const [, setDepartments] = useState([]);
  const [dropdownData, setDropdownData] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});
  const [loading, setLoading] = useState(true);

  const mapDropdown = {
    ac_type: "CDC",
    unit: 1108,
  };

  useEffect(() => {
    const fetchAll = async () => {
      const [fact, dept] = await fnQuery([
        () => fetchFactory(),
        () => fetchDepartments(),
      ]);

      if (fact) setFactories([{ tableName: fact.tableName, data: fact.data }]);
      if (dept) setDepartments([{ tableName: dept.tableName, data: dept.data }]);
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

  useEffect(() => {
    if (!open) {
      setDropdownValues({});
      return;
    }

    const fetchAllDropdowns = async () => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : null;
        setLoading(true);
        const results = await Promise.all(
          Object.entries(mapDropdown).map(async ([fieldName, categoryCode]) => {
            try {
              const response = await fetchBasicDataByCate(
                user?.factory,
                categoryCode,
                user?.department,
                user?.user_code,
                allow,
              );
              return { fieldName, data: response?.data || [] };
            } catch (error) {
              console.error(`Error fetching ${fieldName}:`, error);
              return { fieldName, data: [] };
            }
          }),
        );
        setDropdownData(
          Object.fromEntries(results.map(({ fieldName, data }) => [fieldName, data])),
        );
      } catch (error) {
        console.error("Error fetching dropdowns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDropdowns();
  }, [auth, open, user?.department, user?.factory, user?.user_code]);

  const createDropdownCallback = (categoryCode) =>
    async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";
        const result = await fetchBasicDataDropDownByCate(
          user?.factory,
          categoryCode,
          user?.department,
          user?.user_code,
          allow,
          page,
          pageSize,
          searchText,
          true,
          language,
        );
        return {
          data: result?.data || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error(`Error fetching dropdown ${categoryCode}:`, error);
        return { data: [], total: 0, pageSize };
      }
    };

  const handleDecimalInput =
    (decimals = 8) =>
    (event) => {
      event.target.value = event.target.value.replace(
        new RegExp(`(\\.\\d{${decimals}})\\d+`),
        "$1",
      );
    };

  const renderField = (fieldName, label, extraProps = {}, type = "text") => {
    if (Object.prototype.hasOwnProperty.call(mapDropdown, fieldName)) {
      const categoryCode = mapDropdown[fieldName];
      return (
        <Box key={fieldName} sx={{ minWidth: 0 }}>
          <Dropdown
            onFetchData={createDropdownCallback(categoryCode)}
            onSelect={(selectedItem) => {
              setDropdownValues((prev) => ({
                ...prev,
                [fieldName]: selectedItem?.code_no || "",
              }));
            }}
            select={dropdownValues[fieldName] || extraProps.defaultValue || ""}
            data={dropdownData[fieldName] || []}
            table="BASIC_DATA"
            option="basic_data"
            getControlLabel={getControlLabel}
            language={language || user?.language || "en"}
            field={getColumnLabel(fieldName, label)}
            totalItems={0}
            pageSize={10}
          />
          <input
            type="hidden"
            name={fieldName}
            value={dropdownValues[fieldName] || extraProps.defaultValue || ""}
          />
        </Box>
      );
    }

    return (
      <TextField
        key={fieldName}
        fullWidth
        InputLabelProps={{ shrink: true }}
        label={getColumnLabel(fieldName, label)}
        name={fieldName}
        type={type}
        inputProps={
          type === "number"
            ? {
                step: "0.00000001",
                min: 0,
                onInput: handleDecimalInput(8),
                ...extraProps.inputProps,
              }
            : extraProps.inputProps
        }
        {...extraProps}
      />
    );
  };

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
      title={getControlLabel("ttl_m_1_add", "Add Ac Item Material Information")}
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      submitDisabled={loading}
      maxWidth="lg"
    >
      <Stack spacing={2}>
        <FormSection
          title={getControlLabel(
            "ftxt_m_fac_dept",
            "Factory and Department Information",
          )}
        >
          <FormGrid>
            <ReadOnlyField
              label={getControlLabel("txt_factory_code", "factory_code")}
              value={user?.factory}
            />
            <ReadOnlyField
              label={getControlLabel("txt_department_code", "department_code")}
              value={user?.department}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Item identity and names">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getControlLabel("txt_item_acno", "item_acno")}
              name="item_acno"
              required
            />
            <TextField
              fullWidth
              label={getControlLabel("txt_item_acname_t", "item_acname_t")}
              name="item_acname_t"
            />
            <TextField
              fullWidth
              label={getControlLabel("txt_item_acname_e", "item_acname_e")}
              name="item_acname_e"
            />
            <TextField
              fullWidth
              label={getControlLabel("txt_item_acname_l", "item_acname_l")}
              name="item_acname_l"
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Customs and usage information">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getColumnLabel("ac_item", "ac_item")}
              name="ac_item"
            />
            {renderField("unit", "Unit")}
            {renderField(
              "tax_per",
              "Tax Percent%",
              {
                inputProps: {
                  step: "0.01",
                  min: 0,
                  onInput: handleDecimalInput(2),
                },
              },
              "number",
            )}
            {renderField(
              "loss_per",
              "Loss Percent%",
              {
                inputProps: {
                  step: "0.01",
                  min: 0,
                  onInput: handleDecimalInput(2),
                },
              },
              "number",
            )}
            {renderField("ac_type", "Ac Type")}
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default AddAcItemM;
