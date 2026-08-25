import { Box, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import Dropdown from "../../../component/dropdown/Dropdown";
import FormDialogShell from "../../../component/form/FormDialogShell";
import FormGrid from "../../../component/form/FormGrid";
import FormSection from "../../../component/form/FormSection";
import ReadOnlyField from "../../../component/form/ReadOnlyField";
import {
  fetchRSDByID,
  fetchRSDBySizeDropdown,
} from "../../../service/rd_size_d/RdSizeDService";

const AddAcProdM = ({
  open,
  onClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  selectRows,
}) => {
  const [dropdownValues, setDropdownValues] = useState({});

  useEffect(() => {
    if (!open) setDropdownValues({});
  }, [open]);

  const handleSizeSelect = async (selectedItem, fieldSize, fieldSubSize) => {
    const sizeNo = selectedItem?.size_no || "";
    const response = await fetchRSDByID(
      selectedItem?.factory_code,
      selectedItem?.size_type,
      sizeNo,
    );

    setDropdownValues((prev) => ({
      ...prev,
      [fieldSize]: sizeNo,
      [fieldSubSize]: response?.data?.size_seq || "",
    }));
  };

  const createDropdownCallback = () =>
    async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";
        const result = await fetchRSDBySizeDropdown(
          user?.factory,
          selectRows?.[0]?.size_type,
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
      } catch {
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

  const renderSizeDropdown = (fieldName, label) => {
    const subFieldName = fieldName === "start_size" ? "s_seq" : "e_seq";
    return (
      <Box key={fieldName} sx={{ minWidth: 0 }}>
        <Dropdown
          onFetchData={createDropdownCallback()}
          onSelect={(selectedItem) =>
            handleSizeSelect(selectedItem, fieldName, subFieldName)
          }
          select={dropdownValues[fieldName] || ""}
          table="AC_SHOE_M"
          option="ac_shoe_m"
          getControlLabel={getControlLabel}
          language={user?.language || "en"}
          field={getColumnLabel(fieldName, label)}
          totalItems={0}
          pageSize={10}
        />
        <input type="hidden" name={fieldName} value={dropdownValues[fieldName] || ""} />
      </Box>
    );
  };

  const renderSequence = (fieldName, label) => (
    <Box key={fieldName} sx={{ minWidth: 0 }}>
      <ReadOnlyField
        label={getColumnLabel(fieldName, label)}
        value={dropdownValues[fieldName] || ""}
        placeholder="Auto-filled when selecting size"
      />
      <input type="hidden" name={fieldName} value={dropdownValues[fieldName] || ""} />
    </Box>
  );

  return (
    <FormDialogShell
      open={open}
      onClose={onClose}
      onSubmit={handleAdd}
      title={getControlLabel("ttl_d_2_add_1", "Add Ac Prod M Information")}
      submitLabel={getControlLabel("btn_save", "Save")}
      cancelLabel={getControlLabel("btn_cancel", "Cancel")}
      maxWidth="xl"
    >
      <Stack spacing={2}>
        <FormSection title="Product identity">
          <FormGrid columns={3}>
            <ReadOnlyField
              label={getColumnLabel("factory_code", "Factory Code")}
              value={user?.factory}
            />
            <ReadOnlyField
              label={getColumnLabel("customs_shoe_id", "Custom Shoe ID")}
              value={selectRows?.[0]?.customs_shoe_id}
            />
            <TextField
              fullWidth
              label={getColumnLabel("prod_acno", "Prod Acno")}
              name="prod_acno"
              required
            />
            <TextField
              fullWidth
              label={getColumnLabel("pt_per", "Grading Ratio")}
              name="pt_per"
              type="number"
              InputLabelProps={{ shrink: true }}
              inputProps={{
                step: "0.01",
                min: 0,
                onInput: handleDecimalInput(2),
              }}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Size range">
          <FormGrid columns={2}>
            {renderSizeDropdown("start_size", "Start Size")}
            {renderSequence("s_seq", "S Seq")}
            {renderSizeDropdown("end_size", "End Size")}
            {renderSequence("e_seq", "E Seq")}
          </FormGrid>
        </FormSection>

        <FormSection title="Notes">
          <TextField
            fullWidth
            label={getColumnLabel("note", "Note")}
            name="note"
            multiline
            minRows={2}
          />
        </FormSection>
      </Stack>
    </FormDialogShell>
  );
};

export default AddAcProdM;
