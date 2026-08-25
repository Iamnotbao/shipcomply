import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Controller, useForm } from "react-hook-form";
import Dropdown from "../../../component/dropdown/Dropdown";
import { fetchBasicDataDropDownByCate } from "../../../service/basic_data/basicDataService";

const AddAcChgA = ({
  open,
  onClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  selectRows, // AC_CHG_M data,
  language
}) => {
  const { register, handleSubmit, reset, setValue, control, watch } = useForm({
    defaultValues: {
      factory_code: user?.factory || "",
      ac_no: selectRows?.[0]?.ac_no || "",
      desc_item: "",
      ori: "",
      addo: "",
    },
  });

  const [dropdownValues, setDropdownValues] = useState({
    desc_item: "",
  });

  const ac_chg_m = selectRows?.[0] || {};

  useEffect(() => {
    if (open) {
      setValue("factory_code", user?.factory);
      setValue("ac_no", ac_chg_m?.ac_no || "");
    } else {
      reset();
      setDropdownValues({
        desc_item: "",
      });
    }
  }, [open, reset]);

  // Callback function for DESC_ITEM dropdown
  const createDescItemCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = auth?.find((item) => item.field === "query_level")?.title || "1";
        const result = await fetchBasicDataDropDownByCate(
          user?.factory,
          "5009",
          user?.department,
          user?.user_code,
          allow,
          page,
          pageSize,
          searchText,
          true,
          language
        );
        return {
          data: result?.data || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error("Error fetching desc_item:", error);
        return { data: [], total: 0, pageSize };
      }
    };
  };

  const renderField = (
    fieldName,
    label,
    gridSize = 4,
    extraProps = {},
    type = "text"
  ) => {
    // DESC_ITEM dropdown
    if (fieldName === "desc_item") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createDescItemCallback()}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.code_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({ ...prev, desc_item: value }));
                }}
                select={field.value || dropdownValues.desc_item || ""}
                table="BASIC_DATA"
                option="basic_data"
                getControlLabel={getControlLabel}
                language={user?.language || "en"}
                field={getColumnLabel(fieldName, label)}
                totalItems={0}
                pageSize={10}
                {...extraProps}
              />
            )}
          />
        </Grid>
      );
    }

    // Regular fields
    return (
      <Grid item xs={gridSize} key={fieldName}>
        <TextField
          fullWidth
          label={getColumnLabel(fieldName, label)}
          type={type}
          InputLabelProps={{ shrink: true }}
          inputProps={
            type === "number"
              ? { step: "0.01", min: 0, ...extraProps.inputProps }
              : extraProps.inputProps
          }
          {...register(fieldName, {
            valueAsNumber: type === "number",
          })}
          {...extraProps}
        />
      </Grid>
    );
  };

  const onSubmit = (data) => {
    handleAdd(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        <Paper sx={{ maxWidth: "800px", mx: "auto", p: 3 }}>
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
              {getControlLabel("ttl_d_2_add", "Add AC_CHG_A")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Row 1 */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  value={user?.factory}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("ac_no", "AC No")}
                  value={ac_chg_m?.ac_no || ""}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
               {renderField("desc_item", "Description Item", 12)}
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={2}>
              {renderField("ori", "ORI", 12, {
                multiline: true,
                rows: 3
              })}
                {renderField("addo", "ADDO", 12, {
                multiline: true,
                rows: 3
              })}
            </Grid>
            {/* Submit Button */}
            <Grid container spacing={2} justifyContent="flex-end" mt={3}>
              <Grid item>
                <Button variant="outlined" onClick={onClose}>
                  {getControlLabel("btn_cancel", "Cancel")}
                </Button>
              </Grid>
              <Grid item>
                <Button type="submit" variant="contained" color="primary">
                  {getControlLabel("btn_save", "Save")}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default AddAcChgA;