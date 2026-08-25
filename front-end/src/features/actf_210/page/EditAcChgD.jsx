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
import {
  fetchGoodsCodeListDropdownWithFunc,
  fetchContPrice,
} from "../../../service/ac_cont_d/AcContDService";
import {
  fetchGroupFieldDropdown,
  fetchFieldWithFunction,
} from "../../../service/ac_item_m/AcItemMService";
import { calculateRefPrice } from "../../../service/ac_chg_d/acChgD";

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
  console.log("check the details", editData);

  const { register, handleSubmit, reset, setValue, control, watch } = useForm({
    defaultValues: {
      factory_code: editData?.factory_code || user?.factory || "",
      ac_no: editData?.ac_no || "",
      seq: editData?.seq || "",
      ac_itemno: editData?.ac_itemno || "",
      color: editData?.color || "",
      country: editData?.country || "",
      unit: editData?.unit || "",
      price: editData?.price || 0,
      qty: editData?.qty || 0,
      breadth: editData?.breadth || "",
      tax_rate: editData?.tax_rate || 0,
      tax: editData?.tax || 0,
      money: editData?.money || 0,
      atax_rate: editData?.atax_rate || 0,
      add_tax: editData?.add_tax || 0,
      shoe_id: editData?.shoe_id || "",
      remark: editData?.remark || "",
      in_qty: editData?.in_qty || 0,
      in_unit: editData?.in_unit || "",
      ac_item: editData?.ac_item || "",
      over_qty: editData?.over_qty || 0,
      is_ref: editData?.is_ref || "",
      cmoney: editData?.cmoney || 0,
      req_no: editData?.req_no || "",
      ref_price: editData?.ref_price || 0,
      grt_date: editData?.grt_date || "",
      grt_dept: editData?.grt_dept || "",
      grt_user: editData?.grt_user || "",
      status: "1",
    },
  });

  const [dropdownValues, setDropdownValues] = useState({
    ac_itemno: "",
    country: "",
    in_unit: "",
    ac_item: "",
    price: "",
    price_cont_no: editData.cont_no || "",
    price_seq: editData.seq || "",
  });

  // Watch for fields that trigger calculations
  const price = watch("price");
  const money = watch("money");
  const tax_rate = watch("tax_rate");
  const cmoney = watch("cmoney");
  const atax_rate = watch("atax_rate");
  const ac_itemno = watch("ac_itemno");
  const in_qty = watch("in_qty");

  useEffect(() => {
    if (open && editData) {
      // Set form values
      setValue("factory_code", editData.factory_code || user?.factory);
      setValue("ac_no", editData.ac_no);
      setValue("seq", editData.seq);
      setValue("ac_itemno", editData.ac_itemno);
      setValue("color", editData.color);
      setValue("country", editData.country);
      setValue("unit", editData.unit);
      setValue("price", editData.price);
      setValue("qty", editData.qty);
      setValue("breadth", editData.breadth);
      setValue("tax_rate", editData.tax_rate);
      setValue("tax", editData.tax);
      setValue("money", editData.money);
      setValue("atax_rate", editData.atax_rate);
      setValue("add_tax", editData.add_tax);
      setValue("shoe_id", editData.shoe_id);
      setValue("remark", editData.remark);
      setValue("in_qty", editData.in_qty);
      setValue("in_unit", editData.in_unit);
      setValue("ac_item", editData.ac_item);
      setValue("over_qty", editData.over_qty);
      setValue("is_ref", editData.is_ref);
      setValue("cmoney", editData.cmoney);
      setValue("req_no", editData.req_no);
      setValue("ref_price", editData.ref_price);
      setValue("grt_date", editData?.grt_date);
      setValue("grt_dept", editData?.grt_dept);
      setValue("grt_user", editData?.grt_user);
      setValue("status", editData.status);

      // Set dropdown display values
      setDropdownValues({
        ac_itemno: editData.ac_itemno || "",
        country: editData.country || "",
        in_unit: editData.in_unit || "",
        ac_item: editData.ac_item || "",
        price: editData.price ? String(editData.price) : 0.0,
        price_cont_no: "",
        price_seq: "",
      });
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
  }, [open]);

  // Auto-calculate MONEY = QTY * PRICE
  useEffect(() => {
    const calculatedMoney = Math.round((in_qty || 0) * (price || 0)*10000)/10000;
    setValue("money", calculatedMoney);
  }, [in_qty, price]);

  // Auto-calculate TAX = ROUND(CURR_RATE * MONEY * TAX_RATE / 100)
  useEffect(() => {
    const currRate = ac_chg_m?.curr_rate || 1;
    const calculatedTax = Math.round(
      (currRate * (money || 0) * (tax_rate || 0)) / 100,
    );
    setValue("tax", calculatedTax);
  }, [money, tax_rate, ac_chg_m?.curr_rate]);

  // Auto-calculate CMONEY = ROUND(CURR_RATE * MONEY)
  useEffect(() => {
    const currRate = ac_chg_m?.curr_rate || 1;
    const calculatedCMoney = Math.round(currRate * (money || 0));
    setValue("cmoney", calculatedCMoney);
  }, [money, ac_chg_m?.curr_rate]);

  // Auto-calculate ADD_TAX = ROUND(CMONEY * ATAX_RATE / 100)
  useEffect(() => {
    const calculatedAddTax = Math.round(
      ((cmoney || 0) * (atax_rate || 0)) / 100,
    );
    setValue("add_tax", calculatedAddTax);
  }, [cmoney, atax_rate]);


  // Fetch UNIT when AC_ITEMNO changes
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
          );
          setValue("unit", unitResult?.data?.unit || "");
        } catch (error) {
          console.error("Error fetching unit:", error);
        }
      }
    };
      const fetchRefPrice = async () => {
      const result = await calculateRefPrice(
        user?.factory,
        selectParentRows[0]?.com_invoice,
        ac_itemno,
      );
      setValue("ref_price", result?.ref_price || 0);
    };
    fetchRefPrice();
    fetchUnit();
  }, [ac_itemno]);

  // Fetch TAX_RATE when AC_ITEMNO changes
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

  // Callback functions for dropdowns
  const createAcItemnoCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow =
          auth?.find((item) => item.field === "query_level")?.title || "1";
        const result = await fetchGoodsCodeListDropdownWithFunc(
          user?.access_token,
          user?.factory,
          ac_chg_m?.cont_no,
          user?.department,
          user?.user_code,
          allow,
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
          true,
          language
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
          user?.language,
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

  const createPriceCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow =
          auth?.find((item) => item.field === "query_level")?.title || "1";
        const result = await fetchContPrice(
          user?.access_token,
          user?.factory,
          ac_chg_m?.min_cont,
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
        console.error("Error fetching price:", error);
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
                  const value = selectedItem?.goods_code || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({
                    ...prev,
                    ac_itemno_cont_no: selectedItem?.cont_no || "",
                    ac_itemno_seq: selectedItem?.seq || "",
                  }));
                }}
                // ← KEY FIX: nếu có cont_no thì dùng object, không thì fallback string
                select={
                  dropdownValues.ac_itemno_cont_no
                    ? {
                        cont_no: dropdownValues.ac_itemno_cont_no,
                        seq: dropdownValues.ac_itemno_seq,
                      }
                    : field.value || "" // ← hiển thị ac_itemno string trực tiếp
                }
                table="AC_CONT_D_1"
                option={fieldName}
                headerField={"ac_itemno"}
                totalItems={0}
                pageSize={10}
                field={getColumnLabel("ac_itemno", "AC ITEMNO")}
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
                  const displayValue = selectedItem
                    ? `${selectedItem.ac_item || ""}-${selectedItem.item_acno || ""}-${selectedItem.itemnm || ""}`
                    : "";
                  const saveValue = selectedItem?.ac_item || "";
                  field.onChange(saveValue);
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

    // PRICE dropdown
    if (fieldName === "price") {
      // Khi edit và backend không trả cont_no → hiển thị TextField read-only
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createPriceCallback()}
                onSelect={(selectedItem) => {
                  const contNo = selectedItem?.cont_no || "";
                  const seq = selectedItem?.seq || "";
                  const priceValue = parseFloat(selectedItem?.price || 0);
                  field.onChange(priceValue);
                  setValue("cont_no", contNo);
                  setDropdownValues((prev) => ({
                    ...prev,
                    price_cont_no: contNo,
                    price_seq: seq,
                  }));
                }}
                select={
                  dropdownValues.price_cont_no
                    ? {
                        cont_no: dropdownValues.price_cont_no,
                        seq: dropdownValues.price_seq,
                      }
                    : String(watch("price") || 0.0)
                }
                table="AC_CONT_D_1"
                option="price"
                headerField={"cont_no"}
                totalItems={0}
                pageSize={10}
                field={getColumnLabel("price", "Price")}
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
    const { cont_no, ...rest } = data;
    handleEdit(rest);
  };
  const handleDecimalInput =
    (decimals = 8) =>
    (e) => {
      e.target.value = e.target.value.replace(
        new RegExp(`(\\.\\d{${decimals}})\\d+`),
        "$1",
      );
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
              {/*   {renderField("color", "Color", 3)}*/}
              {renderField("country", "Country", 3)}
              {renderField("unit", "Unit", 3, {
                inputProps: { readOnly: true },
                helperText: "Auto from AC_ITEMNO",
              })}
              {renderField("price", "Price", 3)}
            </Grid>

            {/* Row 3 */}
            <Grid container spacing={2} mb={2}>
              {renderField("qty", "Quantity", 3, {disabled: true}, "number")}
              {renderField("breadth", "Breadth", 3)}
              {renderField(
                "tax_rate",
                "Tax Rate (%)",
                3,
                {
                  helperText: "Auto from AC_ITEMNO",
                },
                "number",
              )}
            </Grid>

            {/* Row 4 */}
            <Grid container spacing={2} mb={2}>
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
                  inputProps: { readOnly: true },
                  helperText: "Auto: QTY * PRICE",
                },
                "number",
              )}
              {renderField(
                "atax_rate",
                "Additional Tax Rate (%)",
                3,
                {},
                "number",
              )}
              {/*   {renderField("shoe_id", "Shoe ID", 3)} */}
            </Grid>

            {/* Row 5 */}
            <Grid container spacing={2} mb={2}>
              {renderField(
                "add_tax",
                "Additional Tax",
                3,
                {
                  inputProps: { readOnly: true },
                  helperText: "Auto calculated",
                },
                "number",
              )}
              {renderField("remark", "Remark", 6)}
              {renderField("in_qty", "In Quantity", 3, {}, "number")}
            </Grid>

            {/* Row 6 */}
            <Grid container spacing={2} mb={2}>
              {renderField("in_unit", "In Unit", 3)}
              {renderField("ac_item", "AC Item", 3)}
              {renderField("over_qty", "Over Quantity", 3, {}, "number")}
              {/*    {renderField("is_ref", "Is Ref", 3)}*/}
            </Grid>

            {/* Row 7 */}
            <Grid container spacing={2} mb={2}>
              {/*   {renderField("req_no", "Request No", 3)}*/}
              {renderField(
                "cmoney",
                "CMoney",
                3,
                {
                  inputProps: { readOnly: true },
                  helperText: "Auto calculated",
                },
                "number",
              )}
              {renderField(
                "ref_price",
                "Reference Price",
                3,
                {
                  inputProps: { readOnly: true },
                  helperText: "Auto calculated",
                },
                "number",
              )}
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
