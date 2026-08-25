import { Box, Stack, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import Dropdown from "../../../component/dropdown/Dropdown";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";
import {
  fetchBasicDataByCate,
} from "../../../service/basic_data/basicDataService";
import { fetchFieldDropdown } from "../../../service/ac_item_m/AcItemMService";

const EditAcBomMPage = ({
  open,
  onClose,
  acImp,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  language,
}) => {
  const { register, handleSubmit, reset, setValue, control } = useForm({
    defaultValues: { ...acImp },
  });
  const [dropdownData, setDropdownData] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});
  const [loading, setLoading] = useState(true);

  const mapDropdown = { ac_type: "CDC" };

  const getStatusText = (status) => {
    if (status === 1) return "New-1";
    if (status === 2) return "Checked-2";
    if (status === 0) return "Cancel-0";
    if (status === 7) return "Confirm-7";
    if (status === 9) return "Close-9";
    return "New-1";
  };

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

  const fetchItemAcnoDetail = async (itemAcno) => {
    try {
      const allow =
        auth?.find((item) => item.field === "query_level")?.title || "1";
      const result = await fetchFieldDropdown(
        user?.factory,
        user?.department,
        user?.user_code,
        allow,
        language,
        "item_acno",
        1,
        10,
        itemAcno,
      );
      const matched = (result?.data || []).find(
        (item) => item.item_acno === itemAcno,
      );

      if (matched) {
        const displayValue = `${matched.ac_item || ""}-${matched.item_acno || ""}-${matched.itemnm || ""}`;
        setDropdownValues((prev) => ({
          ...prev,
          ac_item: displayValue,
          item_acno: matched.item_acno,
          ac_type: matched.ac_type || "",
        }));
        setValue("ac_type", matched.ac_type || "");
      } else {
        setDropdownValues((prev) => ({
          ...prev,
          ac_item: itemAcno,
          item_acno: itemAcno,
        }));
      }
    } catch (error) {
      console.error("Error fetching item_acno detail:", error);
    }
  };

  useEffect(() => {
    if (!open) {
      setDropdownValues({});
      setDropdownData({});
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

  useEffect(() => {
    if (!acImp) return;

    reset({
      ...acImp,
      statusText: getStatusText(acImp.status),
    });
    setDropdownValues({
      ac_item: acImp.ac_item
        ? `${acImp.ac_item || ""}-${acImp.item_acno || ""}-${acImp.itemnm || ""}`
        : "",
      item_acno: acImp.item_acno || "",
      ac_type: acImp.ac_type || "",
    });

    if (acImp.item_acno) {
      fetchItemAcnoDetail(acImp.item_acno);
    }
  }, [acImp, reset]);

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
          const value = selectedItem?.code_no || "";
          setDropdownValues((prev) => ({ ...prev, ac_type: value }));
          setValue("ac_type", value);
        }}
        select={dropdownValues.ac_type || ""}
        table="BASIC_DATA"
        option="basic_data"
        getControlLabel={getControlLabel}
        language={language || user?.language || "en"}
        field={getColumnLabel("ac_type", "Ac Type")}
      />
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
              setValue("ac_type", selectedItem?.ac_type || "");
            }}
            select={dropdownValues.ac_item || ""}
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
    </Box>
  );

  const numericField = (name, label, decimals = 8) => (
    <TextField
      fullWidth
      label={getColumnLabel(name, label)}
      type="number"
      InputLabelProps={{ shrink: true }}
      inputProps={{
        step: decimals === 4 ? "0.0001" : "0.00000001",
        min: 0,
        onInput: handleDecimalInput(decimals),
      }}
      {...register(name, {
        setValueAs: (value) =>
          value === "" || value === undefined ? null : Number(value),
      })}
    />
  );

  const onSubmit = (data) => {
    const { ac_item, ...restDropdownValues } = dropdownValues;
    void ac_item;
    handleEdit({ ...data, ...restDropdownValues });
  };

  return (
    <FormDialogShell
      open={open}
      onClose={() => onClose(null)}
      onSubmit={handleSubmit(onSubmit)}
      title={getControlLabel("ttl_m_3_edit", "Edit Ac Bom M Information")}
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      submitDisabled={loading}
      maxWidth="xl"
    >
      <Stack spacing={2}>
        <FormSection title="BOM identity">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getColumnLabel("factory_code", "Factory Code")}
              {...register("factory_code")}
              disabled
            />
            <TextField
              fullWidth
              label={getColumnLabel("prod_acno", "Prod Acno")}
              {...register("prod_acno")}
              InputLabelProps={{ shrink: true }}
              disabled
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
              {...register("note")}
            />
            {renderAcType()}
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default EditAcBomMPage;
