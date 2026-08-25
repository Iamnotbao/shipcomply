import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { fetchBasicDataByCate } from "../../../service/basic_data/basicDataService";
import Dropdown from "../../../component/dropdown/Dropdown";
import { fetchFieldDropdown } from "../../../service/ac_item_m/AcItemMService";
import { useForm, Controller } from "react-hook-form";

const AddAcBomMPage = ({
  open,
  onClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  language
}) => {
  const [dropdownData, setDropdownData] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});

  const mapDropdown = {
    ac_type: "CDC",
  };
  const { register, handleSubmit, reset, setValue, control, watch } = useForm({
    defaultValues: {
      item_acno: "",
    },
  });
  useEffect(() => {
    if (open) {
      fetchAllDropdowns();
    }
  }, [open]);
  useEffect(() => {
    if (!open) {
      setDropdownValues({});
    }
  }, [open]);
  const item_acno = watch("item_acno");
  const fetchAllDropdowns = async () => {
    try {
      const allow = Array.isArray(auth)
        ? auth.find((item) => item.field === "query_level")?.title
        : null;
      const promises = Object.entries(mapDropdown).map(
        async ([fieldName, categoryCode]) => {
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
            console.error(
              `Error fetching ${fieldName} (${categoryCode}):`,
              error,
            );
            return { fieldName, data: [] };
          }
        },
      );
      const results = await Promise.all(promises);
      const dataMap = {};
      results.forEach(({ fieldName, data }) => {
        dataMap[fieldName] = data;
      });
      setDropdownData(dataMap);
    } catch (error) {
      console.error("Error fetching dropdowns:", error);
    }
  };
  const createItemAcnoCallback = () => {
    return async (page, pageSize, searchText) => {
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
  };
  const handleDecimalInput =
    (decimals = 8) =>
    (e) => {
      e.target.value = e.target.value.replace(
        new RegExp(`(\\.\\d{${decimals}})\\d+`),
        "$1",
      );
    };
  const renderField = (
    fieldName,
    label,
    gridSize = 2.4,
    extraProps = {},
    type = "text",
  ) => {
    const hasDropdown = mapDropdown.hasOwnProperty(fieldName);
    const dropdownOptions = dropdownData[fieldName] || [];

    if (hasDropdown) {
      return (
        <Grid item xs={gridSize}>
          <Dropdown
            data={dropdownOptions}
            onSelect={(selectedItem) => {
              setDropdownValues((prev) => ({
                ...prev,
                [fieldName]: selectedItem?.code_no || "",
              }));
            }}
            select={dropdownValues[fieldName] || extraProps.defaultValue || ""}
            table="BASIC_DATA"
            option={"basic_data"}
            getControlLabel={getControlLabel}
            language={user?.language || "en"}
            field={getColumnLabel(fieldName, label)}
          />
          {/* Hidden input để form submit */}
          <input
            type="hidden"
            name={fieldName}
            value={dropdownValues[fieldName] || extraProps.defaultValue || ""}
          />
        </Grid>
      );
    }
  if (fieldName === "item_acno") {
  return (
    <Grid item xs={gridSize}>
      <Controller
        name={fieldName}
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
            language={user?.language || "en"}
            field={getColumnLabel(fieldName, label)}
            totalItems={0}
            pageSize={10}
            {...extraProps}
          />
        )}
      />
      {/* Hidden input để form submit */}
      <input
        type="hidden"
        name={fieldName}
        value={dropdownValues.item_acno || ""}
      />
    </Grid>
  );
}
    return (
      <Grid item xs={gridSize} key={fieldName}>
        <TextField
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
      </Grid>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogContent>
        <Paper sx={{ maxWidth: "1400px", mx: "auto", p: 3 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={2}
          >
            <Typography
              variant="h4"
              textTransform="uppercase"
              fontWeight={600}
              textAlign="center"
              flex={1}
              mb={0}
            >
              {getControlLabel("ttl_m_3_add", "Add Ac Bom M Information")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleAdd}>
            {/* Row 1 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  name="factory_code"
                  value={user?.factory}
                  disabled
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("prod_acno", "prod Acno No")}
                  name="prod_acno"
                  required
                />
              </Grid>
              {renderField("item_acno", "Item Acno")}
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                {renderField("unit_qty", "Unit Quantity", 2.4, {}, "number")}
              </Grid>
              <Grid item xs={2.4}>
                {renderField(
                  "loss_per",
                  "Loss Percent",
                  2.4,
                  {
                    inputProps: {
                      step: "0.0001",
                      min: 0,
                      onInput: handleDecimalInput(4),
                    },
                  },
                  "number",
                )}
              </Grid>
              <Grid item xs={2.4}>
                {renderField("fact_qty", "Factory Quantity", 2.4, {}, "number")}
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("note", "Note")}
                  name="note"
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} mb={3}>
              {renderField("ac_type", "AC Type", 2.4)}
            </Grid>
            {/* Submit Button */}
            <Box mt={4} display="flex" justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                {getControlLabel("btn_save", "Save")}
              </Button>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default AddAcBomMPage;
