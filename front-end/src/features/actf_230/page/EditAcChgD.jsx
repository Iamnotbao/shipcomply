import { useEffect, useRef, useState } from "react";
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
import {
  fetchGroupFieldDropdown,
  fetchFieldWithFunction,
} from "../../../service/ac_item_m/AcItemMService";
import { fetchAcItemno } from "../../../service/ac_shoe_m/AcShoeMService";

const EditAcChgD = ({
  open,
  onClose,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  selectRows,
  selectAcChgM,
  language,
}) => {
  const editData = selectRows?.[0] || {};
  const ac_chg_m = selectAcChgM?.[0] || {};
  const { register, handleSubmit, reset, setValue, control, watch } = useForm({
    defaultValues: {
      factory_code: editData?.factory_code || user?.factory || "",
      ac_no: editData?.ac_no || "",
      seq: editData?.seq || "",
      ac_itemno: editData?.ac_itemno || "",
      unit: editData?.unit || "",
      price: editData?.price || 0,
      qty: editData?.qty || 0,
      tax_rate: editData?.tax_rate || 0,
      tax: editData?.tax || 0,
      money: editData?.money || 0,
      shoe_id: editData?.shoe_id || "",
      status: editData?.status || 1,
      is_ref: editData?.is_ref || "Y",
    },
  });

  const [dropdownValues, setDropdownValues] = useState({
    ac_itemno: "",
  });

  const qty = watch("qty");
  const price = watch("price");
  const money = watch("money");
  const tax_rate = watch("tax_rate");
  const ac_itemno = watch("ac_itemno");

useEffect(() => {
  if (open && editData) {
    reset({
      factory_code: editData.factory_code || user?.factory || "",
      ac_no: editData.ac_no || "",
      seq: editData.seq || "",
      ac_itemno: editData.ac_itemno || "",
      unit: editData.unit || "",
      price: editData.price || 0,
      qty: editData.qty || 0,
      tax_rate: editData.tax_rate || 0,
      tax: editData.tax || 0,
      money: editData.money || 0,
      shoe_id: editData.shoe_id || "",
      status: editData.status || 1,
      is_ref: editData.is_ref || "Y",
    });

    setDropdownValues({ ac_itemno: editData.ac_itemno || "" });
  } else {
    reset();
    setDropdownValues({ ac_itemno: "" });
  }
}, [open]);

const prevValuesRef = useRef({
  price: editData?.price || 0,
  qty: editData?.qty || 0,
  money: editData?.money || 0,
});

useEffect(() => {
  const prev = prevValuesRef.current;
  const qtyChanged = qty !== prev.qty;
  const priceChanged = price !== prev.price;
  const moneyChanged = money !== prev.money;

  let nextPrice = price;
  let nextMoney = money;

  if (moneyChanged && !priceChanged) {
    // User sửa MONEY trực tiếp → tính lại đơn giá theo tổng tiền mới
    nextPrice = qty ? Math.round((money / qty) * 1e8) / 1e8 : 0;
    if (nextPrice !== price) setValue("price", nextPrice);
  } else if (priceChanged || qtyChanged) {
    // User sửa PRICE, hoặc sửa QTY (giữ nguyên đơn giá) → tính lại MONEY
    nextMoney = qty ? Math.round(price * qty * 1e8) / 1e8 : 0;
    if (nextMoney !== money) setValue("money", nextMoney);
  }

  // Chốt lại giá trị sau khi tính, để lần re-render tiếp theo (do setValue gây ra)
  // không bị coi là "user vừa sửa" nữa → tránh chạy lặp vô hạn
  prevValuesRef.current = { price: nextPrice, qty, money: nextMoney };
}, [price, qty, money]);
  // Auto-calculate TAX = ROUND(MONEY * TAX_RATE / 100)
  useEffect(() => {
    const calculatedTax = Math.round(((money || 0) * (tax_rate || 0)) / 100, 2);
    setValue("tax", calculatedTax);
  }, [money, tax_rate]);

  // Fetch UNIT + SHOE_ID khi AC_ITEMNO thay đổi
  useEffect(() => {
    const fetchUnit = async () => {
      if (ac_itemno && ac_itemno !== editData.ac_itemno) {
        try {
          const unitResult = await fetchFieldWithFunction(
            user?.factory,
            ac_itemno,
            user?.department,
            user?.user_code,
            auth?.find((item) => item.field === "query_level")?.title,
            "unit",
            "2",
          );
          setValue("unit", unitResult?.data?.unit || "");
        } catch (error) {
          console.error("Error fetching unit:", error);
        }
      }
    };

    const fetchShoeId = async () => {
      if (ac_itemno && ac_itemno !== editData.ac_itemno) {
        try {
          const shoeResult = await fetchFieldWithFunction(
            user?.factory,
            ac_itemno,
            user?.department,
            user?.user_code,
            auth?.find((item) => item.field === "query_level")?.title,
            "shoe_id",
            "2",
          );
          setValue("shoe_id", shoeResult?.data?.shoe_id || "");
        } catch (error) {
          console.error("Error fetching shoe_id:", error);
        }
      }
    };

    fetchUnit();
    fetchShoeId();
  }, [ac_itemno]);

  // Fetch TAX_RATE khi AC_ITEMNO thay đổi
  useEffect(() => {
    const fetchTaxRate = async () => {
      if (ac_itemno && ac_itemno !== editData.ac_itemno) {
        try {
          const taxRateResult = await fetchFieldWithFunction(
            user?.factory,
            ac_itemno,
            user?.department,
            user?.user_code,
            auth?.find((item) => item.field === "query_level")?.title,
            "tax_rate",
          );
          setValue("tax_rate", taxRateResult?.data?.tax_rate || 0);
        } catch (error) {
          console.error("Error fetching tax_rate:", error);
        }
      }
    };
    fetchTaxRate();
  }, [ac_itemno]);

  const createAcItemnoCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchAcItemno(
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
        console.error("Error fetching ac_itemno:", error);
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
    gridSize = 3,
    extraProps = {},
    type = "text",
  ) => {
    if (fieldName === "ac_itemno") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createAcItemnoCallback()}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.prod_acno || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({ ...prev, prod_acno: value }));
                }}
                select={field.value || dropdownValues.prod_acno || ""}
                table="AC_PROD_M"
                option="ac_itemno"
                getControlLabel={getControlLabel}
                language={user?.language || "en"}
                field={getControlLabel('lbl_ac_itemno', label)}
                totalItems={0}
                pageSize={10}
                {...extraProps}
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
          InputLabelProps={{ shrink: true }}
          label={getColumnLabel(fieldName, label)}
          type={type}
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
            setValueAs: (v) =>
              type === "number"
                ? v === "" || v === undefined
                  ? null
                  : Number(v)
                : v,
            validate:
              type === "number"
                ? (value) =>
                    value === null || value === undefined || !isNaN(value)
                      ? true
                      : "Vui lòng nhập số hợp lệ"
                : undefined,
          })}
          {...extraProps}
        />
      </Grid>
    );
  };

  const onSubmit = (data) => {
    handleEdit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
              {getControlLabel("ttl_d_1_edit", "Edit AC_CHG_D")}
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
            {/* Row 1 */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  value={editData?.factory_code || user?.factory}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("ac_no", "AC No")}
                  value={editData?.ac_no || ""}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
              {renderField("ac_itemno", "AC Item No", 3)}
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={2}>
              {renderField("unit", "Unit", 3)}
              {renderField(
                "price",
                "Price",
                3,
                {
                  inputProps: {
                    step: 0.00000001,
                    min: 0,
                    onChange: handleDecimalInput(8),
                    readOnly: true
                  },
                  helperText: "Auto: MONEY / QTY",
                },
                "number",
              )}
              {renderField("shoe_id", "Shoe ID", 3)}
            </Grid>

            {/* Row 3 */}
            <Grid container spacing={2} mb={2}>
              {renderField("qty", "Quantity", 3, {

                inputProps: { readOnly: true },
              }, "number")}
              {renderField(
                "tax",
                "Tax",
                3,
                {
                  inputProps: { readOnly: true },
                  helperText: "Auto calculated",
                },
                "number",
              )}
            {renderField("money", "Money", 3, {

              inputProps: { readOnly: true },
            }, "number")}
            </Grid>

            {/* Submit Button */}
            <Grid container spacing={2} justifyContent="flex-end" mt={3}>
              <Grid item>
                <Button variant="outlined" onClick={() => onClose(null)}>
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

export default EditAcChgD;
