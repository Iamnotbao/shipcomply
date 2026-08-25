import { Box, Stack, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import Dropdown from "../../../component/dropdown/Dropdown";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";
import ReadOnlyField from "../../../component/form/ReadOnlyField";
import { fetchFieldDropdown } from "../../../service/ac_item_m/AcItemMService";
import { fetchBasicDataByCate } from "../../../service/basic_data/basicDataService";

const AddAcBomMPage = ({
  open,
  onClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  language,
}) => {
  const [dropdownData, setDropdownData] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});
  const { control } = useForm({ defaultValues: { item_acno: "" } });

  const mapDropdown = {
    ac_type: "CDC",
  };

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
      }
    };

    fetchAllDropdowns();
  }, [auth, open, user?.department, user?.factory, user?.user_code]);

  const createItemAcnoCallback = () =>
    async (page, pageSize, searchText) => {
      try {
        const allow =
          auth?.find((item) => item.field === "query_level")?.title || "1";
        const result = await fetchFieldDropdown(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          language,
          null,
          page,
          pageSize,
          searchText,
        );
        return {
          data: result?.data || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error("Error fetching ac_item:", error);
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

  const renderAcType = () => (
    <Box sx={{ minWidth: 0 }}>
      <Dropdown
        data={dropdownData.ac_type || []}
        onSelect={(selectedItem) => {
          setDropdownValues((prev) => ({
            ...prev,
            ac_type: selectedItem?.code_no || "",
          }));
        }}
        select={dropdownValues.ac_type || ""}
        table="BASIC_DATA"
        option="basic_data"
        getControlLabel={getControlLabel}
        language={language || user?.language || "en"}
        field={getColumnLabel("ac_type", "AC Type")}
      />
      <input type="hidden" name="ac_type" value={dropdownValues.ac_type || ""} />
    </Box>
  );

  const renderItemAcno = () => (
    <Box sx={{ minWidth: 0 }}>
      <Controller
        name="item_acno"
        control={control}
        render={({ field }) => (
          <Dropdown
            onFetchData={createItemAcnoCallback()}
            onSelect={(selectedItem) => {
              const displayValue = selectedItem
                ? `${selectedItem.ac_item || ""}-${selectedItem.item_acno || ""}-${selectedItem.itemnm || ""}`
                : "";
              const saveValue = selectedItem?.item_acno || "";
              field.onChange(saveValue);
              setDropdownValues((prev) => ({
                ...prev,
                ac_item: displayValue,
                item_acno: saveValue,
                ac_type: selectedItem?.ac_type || "",
              }));
            }}
            select={dropdownValues.item_acno || ""}
            table="AC_ITEM_M"
            option="ac_item"
            getControlLabel={getControlLabel}
            language={language || user?.language || "en"}
            field={getColumnLabel("item_acno", "Item Acno")}
            totalItems={0}
            pageSize={10}
          />
        )}
      />
      <input type="hidden" name="item_acno" value={dropdownValues.item_acno || ""} />
    </Box>
  );

  const numericField = (name, label, decimals = 8) => (
    <TextField
      fullWidth
      label={getColumnLabel(name, label)}
      name={name}
      type="number"
      InputLabelProps={{ shrink: true }}
      inputProps={{
        step: decimals === 4 ? "0.0001" : "0.00000001",
        min: 0,
        onInput: handleDecimalInput(decimals),
      }}
    />
  );

  return (
    <FormDialogShell
      open={open}
      onClose={onClose}
      onSubmit={handleAdd}
      title={getControlLabel("ttl_m_3_add", "Add Ac Bom M Information")}
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      maxWidth="xl"
    >
      <Stack spacing={2}>
        <FormSection title="BOM identity">
          <FormGrid columns={3}>
            <ReadOnlyField
              label={getColumnLabel("factory_code", "Factory Code")}
              value={user?.factory}
            />
            <TextField
              fullWidth
              label={getColumnLabel("prod_acno", "Prod Acno No")}
              name="prod_acno"
              required
            />
            {renderItemAcno()}
          </FormGrid>
        </FormSection>

        <FormSection title="Consumption information">
          <FormGrid columns={3}>
            {numericField("unit_qty", "Unit Quantity")}
            {numericField("loss_per", "Loss Percent", 4)}
            {numericField("fact_qty", "Factory Quantity")}
            <TextField
              fullWidth
              label={getColumnLabel("note", "Note")}
              name="note"
            />
            {renderAcType()}
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default AddAcBomMPage;
