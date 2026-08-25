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
  fetchItemNoList,
  fetchUnitListByItemNo,
} from "../../../service/ac_inm_d/acInmD";

const EditAcInmD = ({
  open,
  onClose,
  basicData,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
}) => {
  const { register, handleSubmit, reset, setValue, control, watch } = useForm({
    defaultValues: {
      ...basicData,
    },
  });

  const [dropdownValues, setDropdownValues] = useState({
    item_no: "",
    in_unit: "",
  });

  const item_no = watch("item_no");
  const in_qty = watch("in_qty");
  const hs_qty = watch("hs_qty");

  // Reset form khi basicData thay đổi
  useEffect(() => {
    if (basicData && Object.keys(basicData).length > 0) {
      const statusText = getStatusText(basicData.status);
      reset({
        ...basicData,
        statusText: statusText,
      });
      setDropdownValues({
        item_no: basicData.item_no || "",
        in_unit: basicData.in_unit || "",
      });
    }
  }, [basicData, reset]);

  // Reset khi đóng dialog
  useEffect(() => {
    if (!open) {
      setDropdownValues({
        item_no: "",
        in_unit: "",
      });
    }
  }, [open]);

  // Reset in_unit khi item_no thay đổi (không phải lần đầu load)
  useEffect(() => {
    if (item_no !== basicData?.item_no && item_no !== dropdownValues.item_no) {
      setValue("in_unit", "");
      setDropdownValues((prev) => ({
        ...prev,
        in_unit: "",
      }));
    }
  }, [item_no, setValue, basicData?.item_no]);
  useEffect(() => {
    const calculated = (Number(in_qty) || 0) - (Number(hs_qty) || 0);
    setValue("n_qty", calculated);
  }, [in_qty, hs_qty, setValue]);
  const getStatusText = (status) => {
    if (status === 1) return "Active-1";
    if (status === 0) return "Inactive-0";
    if (status === 7) return "Confirmed-7";
    if (status === 9) return "Closed-9";
    return "Active-1";
  };

  const createItemNoCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";

        const result = await fetchItemNoList(
          user?.access_token,
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          user?.language || "en",
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
        console.error(" Error fetching item_no:", error);
        return {
          data: [],
          total: 0,
          pageSize: pageSize,
        };
      }
    };
  };

  //  Callback cho Unit Dropdown (phụ thuộc item_no)
  const createUnitCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        if (!dropdownValues.item_no) {
          return {
            data: [],
            total: 0,
            pageSize: pageSize,
          };
        }

        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";

        const result = await fetchUnitListByItemNo(
          user?.access_token,
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          user?.language || "en",
          dropdownValues.item_no,
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
        console.error(" Error fetching in_unit:", error);
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
    console.log("📤 Edit form data:", data);
    handleEdit(data);
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
    gridSize = 6,
    extraProps = {},
    type = "text",
  ) => {
    //  Item No Dropdown
    if (fieldName === "item_no") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Dropdown
                onFetchData={createItemNoCallback()}
                onSelect={(selectedItem) => {
                  const value =
                    selectedItem?.item_acno || selectedItem?.code_no || "";

                  field.onChange(value);
                  setDropdownValues((prev) => ({
                    ...prev,
                    item_no: value,
                    in_unit: "", // Reset in_unit
                  }));
                  setValue("in_unit", ""); // Reset in_unit trong form
                }}
                select={field.value || dropdownValues.item_no || ""}
                table="AC_ITEM_M"
                option="ac_item_m_1"
                getControlLabel={getControlLabel}
                language={user?.language || "en"}
                field={getColumnLabel(fieldName, label)}
                totalItems={0}
                pageSize={10}
              />
            )}
          />
        </Grid>
      );
    }

    //  In Unit Dropdown (phụ thuộc item_no)
    if (fieldName === "in_unit") {
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
                    selectedItem?.unit ||
                    selectedItem?.unit_code ||
                    selectedItem?.code_no ||
                    "";

                  field.onChange(value);
                  setDropdownValues((prev) => ({
                    ...prev,
                    in_unit: value,
                  }));
                }}
                select={field.value || dropdownValues.in_unit || ""}
                table="AC_ITEMUNIT"
                option="unit"
                getControlLabel={getControlLabel}
                language={user?.language || "en"}
                field={getColumnLabel(fieldName, label)}
                totalItems={0}
                pageSize={10}
                disabled={!dropdownValues.item_no}
                helperText={
                  !dropdownValues.item_no ? "Please select Item No first" : ""
                }
              />
            )}
          />
        </Grid>
      );
    }

      return (
      <Grid item xs={gridSize} key={fieldName}>
        <TextField
          fullWidth
          label={getColumnLabel(fieldName, label)}
          type={type}
          InputLabelProps={{ shrink: true }}
          inputProps={
            type === "number"
              ? {
                  step: "0.0001",
                  min: 0,
                  onChange: handleDecimalInput(4),
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
              {getControlLabel("ttl_d_edit", "Edit Ac Inm D")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Row 1: Factory Code + Seq */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  value={user?.factory}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={getColumnLabel("seq", "Seq")}
                  type="number"
                  InputLabelProps={{ shrink: true }}
                  {...register("seq")}
                  disabled
                />
              </Grid>
            </Grid>

            {/* Row 2: Item No + In Unit */}
            <Grid container spacing={2} mb={3}>
              {renderField("item_no", "Item No (海關材料編碼)", 6)}
              {renderField("in_unit", "In Unit (公文申請號)", 6)}
            </Grid>

            {/* Row 3: In Qty + In Money */}
            <Grid container spacing={2} mb={3}>
              {renderField("in_qty", "In Qty", 6, {}, "number")}
              {renderField("in_money", "In Money", 6, {}, "number")}
            </Grid>

            {/* Row 4: HS Qty + N Qty */}
            <Grid container spacing={2} mb={3}>
              {renderField("hs_qty", "HS Qty", 6, {disabled: true}, "number")}
              {renderField(
                "n_qty",
                "N Qty (未報關數)",
                6,
                {
                  disabled: true,
                  sx: {
                    "& .MuiInputBase-input": { backgroundColor: "#f0f0f0" },
                  },
                  InputLabelProps: { shrink: true },
                },
                "number",
              )}
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

export default EditAcInmD;
