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
import {
  fetchGoodsCodeListDropdown,
  fetchUnitByGoodsCodeDropdown,
} from "../../../service/ac_cont_d/acContDService";

const AddSeInvD = ({
  open,
  onClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  selectRows,
  language,
}) => {
  const { register, handleSubmit, reset, setValue, control, watch } = useForm({
    defaultValues: {
      factory_code: user?.factory || "",
      cont_no: selectRows?.[0]?.cont_no || "",
      seq: "",
      goods_code: "",
      unit: "",
      color: "",
      used_qty: 0,
      stock_qty: 0,
      shoe_id: "",
      cont_qty: 0,
      cont_price: 0,
      cont_money: 0,
      status: "1",
    },
  });

  const [dropdownValues, setDropdownValues] = useState({
    goods_code: "",
    unit: "",
  });

  const cont_qty = watch("cont_qty");
  const cont_price = watch("cont_price");
  const goods_code = watch("goods_code");

  useEffect(() => {
    const qty = parseFloat(cont_qty) || 0;
    const price = parseFloat(cont_price) || 0;
    const money = qty * price;
    setValue("cont_money", money.toFixed(4));
  }, [cont_qty, cont_price, setValue]);

  useEffect(() => {
    if (!open) {
      reset({
        factory_code: user?.factory || "",
        cont_no: selectRows?.[0]?.cont_no || "",
        seq: "",
        goods_code: "",
        unit: "",
        color: "",
        used_qty: 0,
        stock_qty: 0,
        shoe_id: "",
        cont_qty: 0,
        cont_price: 0,
        cont_money: 0,
        status: "1",
      });
      setDropdownValues({
        goods_code: "",
        unit: "",
      });
    }
  }, [open, reset, user?.factory, selectRows]);

  useEffect(() => {
    if (!goods_code) {
      setValue("unit", "");
      setDropdownValues((prev) => ({
        ...prev,
        unit: "",
      }));
    }
  }, [goods_code, setValue]);

  const createGoodsCodeCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";

        const result = await fetchGoodsCodeListDropdown(
          user?.access_token,
          user?.factory,
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
        console.error(" Error fetching goods_code:", error);
        return {
          data: [],
          total: 0,
          pageSize: pageSize,
        };
      }
    };
  };

  const createUnitCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        if (!dropdownValues.goods_code) {
          return {
            data: [],
            total: 0,
            pageSize: pageSize,
          };
        }

        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";

        const result = await fetchUnitByGoodsCodeDropdown(
          user?.access_token,
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          dropdownValues.goods_code,
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
        console.error(" Error fetching unit:", error);
        return {
          data: [],
          total: 0,
          pageSize: pageSize,
        };
      }
    };
  };

  // Submit form
  const onSubmit = (data) => {
    console.log("📤 Form data being submitted:", data);
    handleAdd(data);
  };

  const renderField = (
    fieldName,
    label,
    gridSize = 6,
    extraProps = {},
    type = "text",
  ) => {
    //  Goods Code Dropdown
    if (fieldName === "goods_code") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Dropdown
                onFetchData={createGoodsCodeCallback()}
                onSelect={(selectedItem) => {
                  const value =
                    selectedItem?.item_acno || selectedItem?.code_no || "";

                  field.onChange(value);
                  setDropdownValues((prev) => ({
                    ...prev,
                    goods_code: value,
                    unit: "", 
                  }));
                  setValue("unit", ""); // Reset unit trong form
                }}
                select={field.value || dropdownValues.goods_code || ""}
                table="AC_ITEM_M"
                option="goods_code"
                getControlLabel={getControlLabel}
                language={language || "en"}
                field={getColumnLabel(fieldName, label)}
                totalItems={0}
                pageSize={10}
              />
            )}
          />
        </Grid>
      );
    }

    //  Unit Dropdown (phụ thuộc goods_code)
    if (fieldName === "unit") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Dropdown
                onFetchData={createUnitCallback()}
                onSelect={(selectedItem) => {
                  const value =
                    selectedItem?.unit || selectedItem?.code_no || "";

                  field.onChange(value);
                  setDropdownValues((prev) => ({
                    ...prev,
                    unit: value,
                  }));
                }}
                select={field.value || dropdownValues.unit || ""}
                table="AC_ITEMUNIT"
                option="unit"
                getControlLabel={getControlLabel}
                language={language || "en"}
                field={getColumnLabel(fieldName, label)}
                totalItems={0}
                pageSize={10}
                disabled={!dropdownValues.goods_code}
                helperText={
                  !dropdownValues.goods_code
                    ? "Please select Goods Code first"
                    : ""
                }
              />
            )}
          />
        </Grid>
      );
    }

    //  Field thường
    return (
      <Grid item xs={gridSize} key={fieldName}>
        <TextField
          fullWidth
          label={getColumnLabel(fieldName, label)}
          type={type}
          inputProps={
            type === "number"
              ? {
                  step: "0.01",
                  min: 0,
                  ...extraProps.inputProps,
                }
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
              {getControlLabel("ttl_d_add", "Add AC_CONT_D Information")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Row 1: Factory Code + Cont No */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  value={user?.factory}
                  disabled
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("cont_no", "Cont No")}
                  {...register("cont_no")}
                  disabled
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            {/* Row 2: Seq + Color */}
            <Grid container spacing={2} mb={3}>
              {renderField("seq", "Seq", 6, {}, "number")}
              {renderField("color", "Color", 6, {})}
            </Grid>

            {/* Row 3: Used Qty + Stock Qty + Shoe Id */}
            <Grid container spacing={2} mb={3}>
              {renderField("used_qty", "Used Qty", 4, {}, "number")}
              {renderField("stock_qty", "Stock Qty", 4, {}, "number")}
              {renderField("shoe_id", "Shoe Id", 4, {})}
            </Grid>

            {/* Row 4: Goods Code + Unit */}
            <Grid container spacing={2} mb={3}>
              {renderField("goods_code", "Goods Code (海關材料編碼)", 6)}
              {renderField("unit", "Unit", 6)}
            </Grid>

            {/* Row 5: Cont Qty + Cont Price + Cont Money */}
            <Grid container spacing={2} mb={3}>
              {renderField("cont_qty", "Cont Qty", 4, {}, "number")}
              {renderField("cont_price", "Cont Price", 4, {}, "number")}
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("cont_money", "Cont Money")}
                  {...register("cont_money")}
                  disabled
                  InputLabelProps={{ shrink: true }}
                  helperText="Auto: Qty × Price"
                />
              </Grid>
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

export default AddSeInvD;
