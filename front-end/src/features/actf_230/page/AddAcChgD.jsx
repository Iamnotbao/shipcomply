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

import { fetchGroupFieldDropdown } from "../../../service/ac_item_m/AcItemMService";
import { fetchAcItemno } from "../../../service/ac_shoe_m/AcShoeMService";
import { fetchFieldWithFunction } from "../../../service/ac_cont_d/acContDService";
import { fetchMoneyBySeId } from "../../../service/se_plan_ord/sePlanOrd";

const AddAcChgD = ({
  open,
  onClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  selectRows,
  language,
  selectAcPlanOrd,
}) => {
  const { register, handleSubmit, reset, setValue, control, watch } = useForm({
    defaultValues: {
      factory_code: user?.factory || "",
      ac_no: selectRows?.[0]?.ac_no || "",
      ac_itemno: "",
      color: "",
      country: "",
      unit: "",
      price: 0,
      qty: 0,
      breadth: "",
      tax_rate: 0,
      tax: 0,
      money: 0,
      atax_rate: 0,
      add_tax: 0,
      shoe_id: "",
      remark: "",
      in_qty: 0,
      in_unit: "",
      ac_item: "",
      over_qty: 0,
      is_ref: "Y",
      cmoney: 0,
      req_no: "",
      ref_price: 0,
    },
  });

  const [dropdownValues, setDropdownValues] = useState({
    ac_itemno: "",
    country: "",
    in_unit: "",
    ac_item: "",
    price: "",
  });

  // Watch for fields that trigger calculations
  const qty = watch("qty");
  const price = watch("price");
  const money = watch("money");
  const tax_rate = watch("tax_rate");
  const cmoney = watch("cmoney");
  const atax_rate = watch("atax_rate");
  const ac_itemno = watch("ac_itemno");

  const ac_chg_m = selectRows?.[0] || {};

  useEffect(() => {
    if (open && selectAcPlanOrd && selectAcPlanOrd.length > 0) {
      fetchMoney();
    }
  }, [open, selectAcPlanOrd?.se_id]);
  useEffect(() => {
    if (open) {
      setValue("factory_code", user?.factory);
      setValue("ac_no", ac_chg_m?.ac_no || "");
    } else {
      reset();
      setDropdownValues({
        ac_itemno: "",
        country: "",
        in_unit: "",
        ac_item: "",
        price: "",
      });
    }
  }, [open, reset]);

  // Auto-calculate PRICE = MONEY/QTY
  useEffect(() => {
    const calculatedPrice = qty ? Math.round((money / qty) * 1e8) / 1e8 : 0;
    setValue("price", calculatedPrice);
  }, [money, qty]);

  // Auto-calculate TAX = ROUND(MONEY * TAX_RATE / 100)
  useEffect(() => {
    const calculatedTax = Math.round(((money || 0) * (tax_rate || 0)) / 100, 2);
    setValue("tax", calculatedTax);
  }, [money, tax_rate]);

  // Auto-calculate CMONEY = ROUND(CURR_RATE * MONEY)
  useEffect(() => {
    const currRate = ac_chg_m?.curr_rate || 1;
    const calculatedCMoney = Math.round(currRate * (money || 0));
    setValue("cmoney", calculatedCMoney);
  }, [money, ac_chg_m?.curr_rate]);

  // Auto-calculate ADD_TAX = ROUND(CMONEY * ATAX_RATE / 100)
  useEffect(() => {
    const calculatedAddTax = Math.round(
      ((cmoney || 0) * (atax_rate || 1)) / 100,
    );
    setValue("add_tax", calculatedAddTax);
  }, [cmoney, atax_rate]);

  // Auto-calculate REF_PRICE = ROUND(PRICE * REQ_QTY * CURR_RATE, 2)
  useEffect(() => {
    const reqQty = ac_chg_m?.req_qty || 0;
    const currRate = ac_chg_m?.curr_rate || 1;
    const calculatedRefPrice =
      Math.round((price || 0) * reqQty * currRate * 100) / 100;
    setValue("ref_price", calculatedRefPrice);
  }, [price, ac_chg_m?.req_qty, ac_chg_m?.curr_rate]);

  // Fetch UNIT when AC_ITEMNO changes
  useEffect(() => {
    const fetchUnit = async () => {
      if (ac_itemno) {
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
      if (ac_itemno) {
        try {
          const unitResult = await fetchFieldWithFunction(
            user?.factory,
            ac_itemno,
            user?.department,
            user?.user_code,
            auth?.find((item) => item.field === "query_level")?.title,
            "shoe_id",
            "2",
          );
          setValue("shoe_id", unitResult?.data?.shoe_id || "");
        } catch (error) {
          console.error("Error fetching unit:", error);
        }
      }
    };
    fetchUnit();
    fetchShoeId();
  }, [ac_itemno]);

  // Fetch TAX_RATE when AC_ITEMNO changes
  useEffect(() => {
    const fetchTaxRate = async () => {
      if (ac_itemno) {
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
  //Fetch Money when selectAcPlanOrd changes
  const fetchMoney = async () => {
    try {
      const result = await fetchMoneyBySeId(
        user?.factory,
        selectAcPlanOrd[0]?.se_id,
        user?.department,
        user?.user_code,
        auth?.find((item) => item.field === "query_level")?.title,
      );
      setValue("money", result?.data?.money || 0);
    } catch (error) {
      console.error("Error fetching money:", error);
    }
  };

  // Callback functions for dropdowns
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

  const createCountryCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow =
          auth?.find((item) => item.field === "query_level")?.title || "1";
        const result = await fetchBasicDataDropDownByCate(
          user?.factory,
          "5006",
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
        console.error("Error fetching country:", error);
        return { data: [], total: 0, pageSize };
      }
    };
  };

  const createInUnitCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow =
          auth?.find((item) => item.field === "query_level")?.title || "1";
        const result = await fetchBasicDataDropDownByCate(
          user?.factory,
          "1108",
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
        console.error("Error fetching in_unit:", error);
        return { data: [], total: 0, pageSize };
      }
    };
  };

  const createAcItemCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow =
          auth?.find((item) => item.field === "query_level")?.title || "1";
        const result = await fetchGroupFieldDropdown(
          user?.factory,
          ac_itemno,
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
    gridSize = 3,
    extraProps = {},
    type = "text",
  ) => {
    // AC_ITEMNO dropdown
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

    // COUNTRY dropdown
    if (fieldName === "country") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createCountryCallback()}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.code_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({ ...prev, country: value }));
                }}
                select={field.value || dropdownValues.country || ""}
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

    // IN_UNIT dropdown
    if (fieldName === "in_unit") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createInUnitCallback()}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.code_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({ ...prev, in_unit: value }));
                }}
                select={field.value || dropdownValues.in_unit || ""}
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

    // AC_ITEM dropdown
    if (fieldName === "ac_item") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createAcItemCallback()}
                onSelect={(selectedItem) => {
                  // Display value: ac_item-item_acno-itemnm
                  const displayValue = selectedItem
                    ? `${selectedItem.ac_item || ""}-${selectedItem.item_acno || ""}-${selectedItem.itemnm || ""}`
                    : "";

                  // Save value: only ac_item
                  const saveValue = selectedItem?.ac_item || "";

                  // Update form value (what gets saved)
                  field.onChange(saveValue);

                  // Update display value
                  setDropdownValues((prev) => ({
                    ...prev,
                    ac_item: displayValue,
                    ac_item_save: saveValue,
                  }));
                }}
                select={dropdownValues.ac_item || ""}
                table="AC_ITEM_M"
                option="ac_item"
                getControlLabel={getControlLabel}
                language={user?.language || "en"}
                field={getColumnLabel(fieldName, label)}
                totalItems={0}
                pageSize={10}
                disabled={!ac_itemno}
                helperText={!ac_itemno ? "Please select AC Item No first" : ""}
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
    handleAdd(data);
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
              {getControlLabel("ttl_d_1_add", "Add AC_CHG_D")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
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
                  value={user?.factory}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("ac_no", "AC No")}
                  value={ac_chg_m?.ac_no || ""}
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
                  },
                  helperText: "Auto: MONEY / QTY",
                },
                "number",
              )}
              {renderField("shoe_id", "Shoe ID", 3)}
            </Grid>

            {/* Row 3 */}
            <Grid container spacing={2} mb={2}>
              {renderField("qty", "Quantity", 3, {}, "number")}
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
              {renderField(
                "money",
                "Money",
                3,
                {
                },
                "number",
              )}
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

export default AddAcChgD;
