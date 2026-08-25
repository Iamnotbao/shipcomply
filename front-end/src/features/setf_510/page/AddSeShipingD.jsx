import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  Paper,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import Dropdown from "../../../component/dropdown/Dropdown";
import { Controller, useForm } from "react-hook-form";
import { fetchBasicDataDropDownByCate } from "../../../service/basic_data/basicDataService";

const AddSeShippingD = ({
  open,
  onClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  language,
  user,
  selectRows, // Master record (SE_SHIPPING_M)
  auth,
}) => {
  const { register, handleSubmit, reset, setValue, control, watch } = useForm({
    defaultValues: {
      factory_code: user?.factory || "",
      cust_id: "",
      si_seq: "",
      si_type: "1",
      bl: "",
      bl_adress: "",
      nb: "",
      nb_adress: "",
      two_nb: "",
      co: "",
      p_adress: "",
      agent: "",
      col1: "",
      col2: "",
      remark: "",
    },
  });

  const [dropdownValues, setDropdownValues] = useState({
    p_adress: "",
    agent: "",
    col1: "",
  });

  const seShippingM = selectRows?.[0] || {};

  useEffect(() => {
    if (open) {
      setValue("factory_code", user?.factory);
      setValue("cust_id", seShippingM?.cust_id || "");
      setValue("si_seq", seShippingM?.si_seq || "");
    } else {
      reset();
      setDropdownValues({
        p_adress: "",
        agent: "",
        col1: "",
      });
    }
  }, [open, reset]);

  // Dropdown callback cho Basic Data với category code
  const createDropdownCallback = (categoryCode) => {
    return async (page, pageSize, searchText) => {
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
        return {
          data: [],
          total: 0,
          pageSize: pageSize,
        };
      }
    };
  };

  const renderField = (
    fieldName,
    label,
    gridSize = 6,
    extraProps = {},
    type = "text",
  ) => {
    // SI_TYPE select (hardcoded: 1-SEA; 2-AIR; 3-SEA-AIR; 4-RAIL)
    if (fieldName === "si_type") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <TextField
            fullWidth
            select
            label={getColumnLabel(fieldName, label)}
            InputLabelProps={{ shrink: true }}
            {...register(fieldName)}
            {...extraProps}
            defaultValue={"1"}
          >
            <MenuItem value="1">1-SEA</MenuItem>
            <MenuItem value="2">2-AIR</MenuItem>
            <MenuItem value="3">3-SEA-AIR</MenuItem>
            <MenuItem value="4">4-RAIL</MenuItem>
          </TextField>
        </Grid>
      );
    }

    // P_ADRESS dropdown (category_code='2111')
    if (fieldName === "p_adress") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createDropdownCallback("2111")}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.code_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({ ...prev, p_adress: value }));
                }}
                select={field.value || dropdownValues.p_adress || ""}
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

    // AGENT dropdown (category_code='2117')
    if (fieldName === "agent") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createDropdownCallback("2117")}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.code_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({ ...prev, agent: value }));
                }}
                select={field.value || dropdownValues.agent || ""}
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

    // COL1 (國別) dropdown (category_code='5006')
    if (fieldName === "col1") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createDropdownCallback("5006")}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.code_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({ ...prev, col1: value }));
                }}
                select={field.value || dropdownValues.col1 || ""}
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
              {getControlLabel("ttl_d_add", "Add SE_SHIPPING_D")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Factory & Master Info Section */}
            <fieldset
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <legend style={{ padding: "0 8px", fontWeight: "bold" }}>
                {getControlLabel(
                  "ftxt_m_fac_dept",
                  "Factory and Master Information",
                )}
              </legend>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("factory_code", "Factory Code")}
                    value={user?.factory || ""}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("cust_id", "Customer ID")}
                    value={seShippingM?.cust_id || ""}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("si_seq", "SI Seq")}
                    value={seShippingM?.si_seq || ""}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
              </Grid>
            </fieldset>

            {/* Main Form Fields */}
            <Box mt={4}>
              {/* Row 1 */}
              <Grid container spacing={2} mb={2}>
                {renderField("si_type", "SI Type", 6)}
                {renderField("bl", "BL (暫不使用)", 6, { disabled: true })}

                {renderField("bl_adress", "BL Address", 6, {
                  multiline: true,
                  rows: 2,
                })}
                {renderField("nb", "NB (提單通知人)", 6)}
              </Grid>
              {/* Row 3 */}
              <Grid container spacing={2} mb={2}>
                {renderField("nb_adress", "NB Address", 6, {
                  multiline: true,
                  rows: 2,
                })}
                {renderField("two_nb", "Second NB", 6)}

                {renderField("co", "CO (產地證明之收貨人)", 6, {
                  multiline: true,
                  rows: 2,
                })}
                {renderField("p_adress", "P Address (出貨目的地)", 6)}
              </Grid>

              {/* Row 5 */}
              <Grid container spacing={2} mb={2}>
                {renderField("agent", "Agent (船務代理)", 6)}
                {renderField("col1", "Country (國別)", 6)}

                {renderField("col2", "Col2 (暫不使用)", 6, { disabled: true })}
                {renderField("remark", "Remark", 6, {
                  multiline: true,
                  rows: 3,
                })}
              </Grid>
            </Box>

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

export default AddSeShippingD;
