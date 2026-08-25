import { Box, Stack, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import Dropdown from "../../../component/dropdown/Dropdown";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";
import {
  fetchBasicDataByCate,
  fetchBasicDataDropDownByCate,
} from "../../../service/basic_data/basicDataService";
import { fetchFieldDropdown } from "../../../service/rd_size_m/RdSizeM";

const EditAcShoeM = ({
  open,
  onClose,
  acShoeM,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  language,
}) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { ...acShoeM },
  });
  const [dropdownData, setDropdownData] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});
  const [loading, setLoading] = useState(true);

  const getStatusText = (status) => {
    if (status === 1) return "New-1";
    if (status === 2) return "Checked-2";
    if (status === 0) return "Cancel-0";
    if (status === 7) return "Confirm-7";
    if (status === 9) return "Close-9";
    return "New-1";
  };

  useEffect(() => {
    if (!open || !acShoeM) return;

    reset({ ...acShoeM, statusText: getStatusText(acShoeM.status) });
    setDropdownValues({
      unit: acShoeM.unit || "",
      size_type: acShoeM.size_type || "",
    });
  }, [acShoeM, open, reset]);

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
        const response = await fetchBasicDataByCate(
          user?.factory,
          1108,
          user?.department,
          user?.user_code,
          allow,
        );
        setDropdownData({ unit: response?.data || [] });
      } catch (error) {
        console.error("Error fetching dropdowns:", error);
        setDropdownData({ unit: [] });
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

  const createSizeCallback = () =>
    async (page, pageSize, searchText) => {
      try {
        const result = await fetchFieldDropdown(
          user?.factory,
          language,
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
        console.error("Error fetching size type:", error);
        return { data: [], total: 0, pageSize };
      }
    };

  const renderUnit = () => (
    <Box sx={{ minWidth: 0 }}>
      <Dropdown
        onFetchData={createDropdownCallback(1108)}
        onSelect={(selectedItem) => {
          setDropdownValues((prev) => ({
            ...prev,
            unit: selectedItem?.code_no || "",
          }));
        }}
        select={dropdownValues.unit || ""}
        data={dropdownData.unit || []}
        table="BASIC_DATA"
        option="basic_data"
        getControlLabel={getControlLabel}
        language={language || user?.language || "en"}
        field={getColumnLabel("unit", "Unit")}
        totalItems={0}
        pageSize={10}
      />
    </Box>
  );

  const renderSizeType = () => (
    <Box sx={{ minWidth: 0 }}>
      <Dropdown
        onFetchData={createSizeCallback()}
        onSelect={(selectedItem) => {
          setDropdownValues((prev) => ({
            ...prev,
            size_type: selectedItem?.size_type || "",
          }));
        }}
        select={dropdownValues.size_type || ""}
        table="RD_SIZE_M"
        option="size_type"
        getControlLabel={getControlLabel}
        language={language || user?.language || "en"}
        field={getColumnLabel("size_type", "Size Type")}
        totalItems={0}
        pageSize={10}
      />
    </Box>
  );

  const onSubmit = (data) => {
    handleEdit({ ...data, ...dropdownValues });
  };

  return (
    <FormDialogShell
      open={open}
      onClose={() => onClose(null)}
      onSubmit={handleSubmit(onSubmit)}
      title={getControlLabel("ttl_m_2_edit", "Edit Ac Shoe M Information")}
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      submitDisabled={loading}
      maxWidth="xl"
    >
      <Stack spacing={2}>
        <FormSection title="Shoe identity and names">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getColumnLabel("factory_code", "Factory Code")}
              {...register("factory_code")}
              disabled
            />
            <TextField
              fullWidth
              label={getColumnLabel("customs_shoe_id", "Custom Shoe ID")}
              {...register("customs_shoe_id")}
              disabled
            />
            <TextField
              fullWidth
              label={getColumnLabel(
                "customs_shoe_name_l",
                "Custom Shoe Name L",
              )}
              {...register("customs_shoe_name_l")}
            />
            <TextField
              fullWidth
              label={getColumnLabel(
                "customs_shoe_name_e",
                "Custom Shoe Name E",
              )}
              {...register("customs_shoe_name_e")}
            />
            <TextField
              fullWidth
              label={getColumnLabel(
                "customs_shoe_name_t",
                "Custom Shoe Name T",
              )}
              {...register("customs_shoe_name_t")}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Customs and size information">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getColumnLabel("customs_tariff", "Custom Tariff")}
              {...register("customs_tariff")}
            />
            {renderSizeType()}
            {renderUnit()}
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default EditAcShoeM;
