import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  Paper,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import Dropdown from "../../../component/dropdown/Dropdown";
import { Controller, useForm } from "react-hook-form";
import { fetchBasicDataDropDownByCate } from "../../../service/basic_data/basicDataService";

const EditSePlanOrd = ({
  open,
  onClose,
  handleEdit,
  editData,
  getControlLabel,
  getColumnLabel,
  language,
  user,
  auth,
}) => {
  const { register, handleSubmit, reset, setValue, control, watch } = useForm({
    defaultValues: {
      factory_code: user?.factory || "",
      se_id: "",
      se_ver: "",
      se_seq: "",
      pack_gu: "",
      ship_seq: "",
      send_addr: "",
      send_type: "",
      ship_comp: "",
      column1: "",
      column2: "",
      cbm: "",
      p_shipdate: "",
      p_shipqty: "",
      p_exdate: "",
      col5: "",
      col6: "",
      column3: "N",
      column4: "",
      book_no: "",
      col7: "7",
      remark: "",
      sum_ctns: "",
    },
  });
  const se_id = watch("se_id");
  const se_ver = watch("se_ver");
  const se_seq = watch("se_seq");
  const pack_gu = watch("pack_gu");
  const ship_seq = watch("ship_seq");

  const mapBasicDataDropdown = {
    send_type: "2105",
    ship_comp: "2110",
    column1: "2116",
    col5: "2117",
    col6: "2111",
  };

  const [dropdownValues, setDropdownValues] = useState({});

  const onSubmit = (data) => {
    // Submit tất cả data bao gồm cả các field disabled
    handleEdit(data);
  };

  // Load data khi mở dialog edit
  useEffect(() => {
    if (open && editData) {
      // Set all form values from editData
      Object.keys(editData).forEach((key) => {
        setValue(key, editData[key]);
      });

      // Set dropdown values
      setDropdownValues({
        se_id: editData.se_id || "",
        se_ver: editData.se_ver || "",
        se_seq: editData.se_seq || "",
        pack_gu: editData.pack_gu || "",
        ship_seq: editData.ship_seq || "",
        send_addr: editData.send_addr || "",
        send_type: editData.send_type || "",
        ship_comp: editData.ship_comp || "",
        column1: editData.column1 || "",
        column2: editData.column2 || "",
        cbm: editData.cbm || "",
        col5: editData.col5 || "",
        col6: editData.col6 || "",
        sum_ctns: editData.sum_ctns || "",
      });
    }
  }, [open, editData, setValue]);

  useEffect(() => {
    if (!open) {
      reset();
      setDropdownValues({});
    }
  }, [open, reset]);

  const createBasicDropdownCallback = (categoryCode) => {
    return async (page, pageSize, searchText) => {
      try {
        const allow =
          auth?.find((item) => item.field === "query_level")?.title || "1";

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
        console.error(`Error fetching category ${categoryCode}:`, error);
        return { data: [], total: 0, pageSize };
      }
    };
  };

  const renderField = (
    fieldName,
    label,
    gridSize = 3,
    extraProps = {},
    type = "text",
  ) => {
    if (mapBasicDataDropdown.hasOwnProperty(fieldName)) {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createBasicDropdownCallback(
                  mapBasicDataDropdown[fieldName],
                )}
                onSelect={(selectedItem) => {
                  const newValue = selectedItem?.code_no || "";
                  field.onChange(newValue);
                  setDropdownValues((prev) => ({
                    ...prev,
                    [fieldName]: newValue,
                  }));
                }}
                select={field.value || dropdownValues[fieldName] || ""}
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

  return (
    <Dialog open={open} onClose={() => onClose(null)} maxWidth="xl" fullWidth>
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
              gutterBottom
              textAlign="center"
              flex={1}
              mb={0}
            >
              {getControlLabel("ttl_m_edit", "Edit Se Plan Ord Information")}
            </Typography>
            <Button
              onClick={() => onClose(null)}
              variant="contained"
              color="error"
            >
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Primary Keys - DISABLED but still submitted */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  name="factory_code"
                  value={user?.factory}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
              {renderField("p_shipdate", "P Shipdate", 3, { disabled: true }, "date")}
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("se_id", "SE ID")}
                  value={se_id}
                  InputLabelProps={{ shrink: true }}
                  disabled
                  {...register("se_id")}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("se_ver", "SE Ver")}
                  value={se_ver}
                  InputLabelProps={{ shrink: true }}
                  disabled
                  {...register("se_ver")}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("se_seq", "SE Seq")}
                  value={se_seq}
                  InputLabelProps={{ shrink: true }}
                  disabled
                  {...register("se_seq")}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("pack_gu", "Pack GU")}
                  value={pack_gu}
                  InputLabelProps={{ shrink: true }}
                  disabled
                  {...register("pack_gu")}
                />
              </Grid>
            </Grid>

            {/* Editable Fields */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("ship_seq", "Ship Seq")}
                  value={ship_seq}
                  InputLabelProps={{ shrink: true }}
                  disabled
                  {...register("ship_seq")}
                  type="number"
                />
              </Grid>
              {renderField("send_addr", "Send Addr", 6)}
              {renderField("send_type", "Send Type", 3)}
              {renderField("ship_comp", "Ship Comp", 3)}
              {renderField("column1", "Column1 (貨櫃場/倉庫)", 3)}
            </Grid>

            <Grid container spacing={2} mb={3}>
              {renderField("column2", "Invoice No", 3, { disabled: true })}
              {renderField("cbm", "CBM", 3)}
              {renderField(
                "p_shipqty",
                "P Shipqty",
                3,
                { disabled: true },
                "number",
              )}
               {renderField(
                "sum_ctns",
                "CTNS",
                3,
                { disabled: true },
                "number",
              )}
              {renderField("p_exdate", "P Exdate", 3, {}, "date")}
              {renderField("col5", "Col5 (航務代理)", 3)}
            </Grid>

            <Grid container spacing={2} mb={3}>
              {renderField("col6", "Col6 (目的地)", 3)}
             {/* {renderField("column3", "Column3 (生效?)", 3)}*/}
              {renderField("column4", "ETD", 3, {}, "date")}
              {renderField("book_no", "Booking No", 3)}
              {renderField("col7", "Col7 (轉海關)", 3,{
                inputProps: { readOnly: true },
              })}
              {renderField("remark", "Remark", 12, {
                multiline: true,
                rows: 3,
              })}
            </Grid>

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

export default EditSePlanOrd;
