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
import { fetchFieldDropdown } from "../../../service/rd_size_m/RdSizeM";

const AddAcShoeM = ({
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
  const [loading, setLoading] = useState(true);

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
      <input type="hidden" name="unit" value={dropdownValues.unit || ""} />
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
      <input type="hidden" name="size_type" value={dropdownValues.size_type || ""} />
    </Box>
  );

  return (
    <FormDialogShell
      open={open}
      onClose={onClose}
      onSubmit={handleAdd}
      title={getControlLabel("ttl_m_2_add", "Add Ac Shoe M")}
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      submitDisabled={loading}
      maxWidth="xl"
    >
      <Stack spacing={2}>
        <FormSection title="Shoe identity and names">
          <FormGrid columns={3}>
            <ReadOnlyField
              label={getColumnLabel("factory_code", "Factory Code")}
              value={user?.factory}
            />
            <TextField
              fullWidth
              label={getColumnLabel("customs_shoe_id", "Custom Shoe ID")}
              name="customs_shoe_id"
              required
            />
            <TextField
              fullWidth
              label={getColumnLabel(
                "customs_shoe_name_l",
                "Custom Shoe Name L",
              )}
              name="customs_shoe_name_l"
            />
            <TextField
              fullWidth
              label={getColumnLabel(
                "customs_shoe_name_e",
                "Custom Shoe Name E",
              )}
              name="customs_shoe_name_e"
            />
            <TextField
              fullWidth
              label={getColumnLabel(
                "customs_shoe_name_t",
                "Custom Shoe Name T",
              )}
              name="customs_shoe_name_t"
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Customs and size information">
          <FormGrid columns={3}>
            <TextField
              fullWidth
              label={getColumnLabel("customs_tariff", "Custom Tariff")}
              name="customs_tariff"
            />
            {renderSizeType()}
            {renderUnit()}
          </FormGrid>
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default AddAcShoeM;
