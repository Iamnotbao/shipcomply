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
import { fetchGoodsCodeListDropdownWithFunc } from "../../../service/ac_cont_d/AcContDService";
import { fetchGroupFieldDropdown } from "../../../service/ac_item_m/AcItemMService";

const EditAcProcD = ({
  open,
  onClose,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  selectRows,
  selectAcProcM,
  language,
}) => {
  const editData = selectRows?.[0] || {};
  const ac_proc_m = selectAcProcM?.[0] || {};;
  
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
      rb_money: editData?.rb_money || 0,
      in_unit: editData?.in_unit || "",
      ac_qty: editData?.ac_qty || 0,
      ac_item: editData?.ac_item || "",
      over_qty: editData?.over_qty || 0,
      out_unit: editData?.out_unit || "",
      req_no: editData?.req_no || "",
      in_crate: editData?.in_crate || 0,
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
    out_unit: "",
    ac_item: "",
  });

  // Watch for fields that trigger calculations
  const price = watch("price");
  const money = watch("money");
  const tax_rate = watch("tax_rate");
  const rb_money = watch("rb_money");
  const atax_rate = watch("atax_rate");
  const ac_itemno = watch("ac_itemno");
  const ac_qty = watch("ac_qty");

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
      setValue("rb_money", editData.rb_money);
      setValue("in_unit", editData.in_unit);
      setValue("ac_qty", editData.ac_qty);
      setValue("ac_item", editData.ac_item);
      setValue("over_qty", editData.over_qty);
      setValue("out_unit", editData.out_unit);
      setValue("req_no", editData.req_no);
      setValue("in_crate", editData.in_crate);
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
        out_unit: editData.out_unit || "",
        ac_item: editData.ac_item || "",
      });
    } else {
      reset();
      setDropdownValues({
        ac_itemno: "",
        country: "",
        in_unit: "",
        out_unit: "",
        ac_item: "",
      });
    }
  }, [open]);


  // Auto-calculate MONEY = AC QTY * PRICE
  useEffect(() => {
    const calculatedMoney = Math.round((ac_qty || 0) * (price || 0)*10000)/10000 ;
    setValue("money", calculatedMoney);
  }, [ac_qty, price]);

  // Auto-calculate RB_MONEY = ROUND(MONEY * IN_CRATE)
  useEffect(() => {
    console.log("ine",ac_proc_m?.in_crate);
    
    const inCrate = ac_proc_m?.in_crate || 1;
    const calculatedRbMoney = Math.round((money || 0) * inCrate);
    setValue("rb_money", calculatedRbMoney);
  }, [money, ac_proc_m?.in_crate]);

  // Auto-calculate TAX = ROUND(TAX_RATE / 100 * RB_MONEY)
  useEffect(() => {
    const calculatedTax = Math.round(((tax_rate || 0) / 100) * (rb_money || 0));
    setValue("tax", calculatedTax);
  }, [tax_rate, rb_money]);

  // Auto-calculate ADD_TAX = ROUND(ATAX_RATE / 100 * RB_MONEY)
  useEffect(() => {
    const calculatedAddTax = Math.round(
      ((atax_rate || 0) / 100) * (rb_money || 0),
    );
    setValue("add_tax", calculatedAddTax);
  }, [atax_rate, rb_money]);

  // Fetch TAX_RATE when AC_ITEMNO changes
  useEffect(() => {
    const fetchTaxRate = async () => {
      if (ac_itemno && ac_itemno !== editData.ac_itemno) {
        try {
          // TODO: Implement API call to get tax rate
          // const taxRateResult = await gf_ac_itemtax_per(user?.factory, ac_itemno);
          // setValue("tax_rate", taxRateResult?.data?.tax_rate || 0);
          console.log("Need to implement gf_ac_itemtax_per API");
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
          ac_proc_m?.in_cont,
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

  const createOutUnitCallback = () => {
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
        console.error("Error fetching out_unit:", error);
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
const handleDecimalInput = (decimals = 8) => (e) => {
  e.target.value = e.target.value.replace(
    new RegExp(`(\\.\\d{${decimals}})\\d+`), "$1"
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
                : (field.value || "")  // ← hiển thị ac_itemno string trực tiếp
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
              {getControlLabel("ttl_d_1_edit", "Edit AC_PROC_D")}
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
            {/* Row 1: Basic Information */}
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
              {renderField(
                "seq",
                "Seq",
                3,
                {
                  disabled: true,
                  helperText: "自動增號",
                },
                "number",
              )}
            </Grid>

            {/* Row 2: Item Details */}
            <Grid container spacing={2} mb={2}>
            {/*   {renderField("color", "Color", 3, {
                helperText: "暫不使用",
                disabled: true,
              })}*/}
              {/* {renderField("country", "Country", 3, {
                helperText: "暫不使用",
                disabled: true,
              })}*/}
            {/*  {renderField("unit", "Customs Unit", 3, {
                helperText: "暫不使用",
                disabled: true,
              })}*/}
            </Grid>

            {/* Row 3: Quantities and Tax */}
            <Grid container spacing={2} mb={2}>
               {renderField("ac_itemno", "Customs Material Code", 3)}
               {renderField(
                "price",
                "Unit Price",
                3,
                {
                   inputProps:{
                    step:"0.00000001",
                    min:0,
                    onChange:handleDecimalInput(8)
                  }
                },
                "number",
              )}
              {renderField(
                "qty",
                "Import Quantity",
                3,
                {
                  disabled:true
                },
                "number",
              )}
            </Grid>

            {/* Row 4: Money Calculations */}
            <Grid container spacing={2} mb={2}>
                            {renderField(
                "tax_rate",
                "Customs Tax Rate %",
                3,
                {
                  inputProps: { readOnly: true },
                  helperText: "Auto from gf_ac_itemtax_per",
                },
                "number",
              )}
              {renderField(
                "tax",
                "Tax Amount",
                3,
                {
                  inputProps: { readOnly: true },
                  helperText: "Auto: ROUND(TAX_RATE/100 * RB_MONEY)",
                },
                "number",
              )}
              {renderField(
                "money",
                "Import Amount",
                3,
                {
                  inputProps: { readOnly: true },
                  helperText: "Auto: AC QTY * PRICE",
                },
                "number",
              )}
              {renderField(
                "rb_money",
                "Local Currency Amount",
                3,
                {
                  inputProps: { readOnly: true },
                  helperText: "Auto: ROUND(MONEY * IN_CRATE)",
                },
                "number",
              )}
                {renderField(
                "ac_qty",
                "Customs Quantity",
                3,
                {
                  required: true,
                  helperText: "Cannot null",
                },
                "number",
              )}
             {renderField(
                "atax_rate",
                "Additional Tax Rate %",
                3,
                {
                },
                "number",
              )}
            </Grid>

            {/* Row 5: Additional Info */}
            <Grid container spacing={2} mb={2}>
             {/*  {renderField("breadth", "Breadth", 3, {
                helperText: "用戶可輸入",
              })}*/}
           {/*   {renderField("in_unit", "Import Quantity Unit", 3, {
                helperText: "暫不使用",
                disabled: true,
              })} */}
               {renderField(
                "add_tax",
                "Additional Tax Amount",
                3,
                {
                  inputProps: { readOnly: true },
                  helperText: "Auto: ROUND(ATAX_RATE/100 * RB_MONEY)",
                },
                "number",
              )}  
              {renderField("ac_item", "Customs Tax Code", 3)}
              {renderField(
                "over_qty",
                "Export Declaration Quantity",
                3,
                {
                  inputProps: { readOnly: true },
                },
                "number",
              )}
            </Grid>

            {/* Row 6: Reference and Other */}
            <Grid container spacing={2} mb={2}>
            {/*  {renderField("out_unit", "Out Unit", 3, {
                helperText: "暫不使用",
                disabled: true,
              })}*/}
             {/*  {renderField("req_no", "Request No", 3, {
                helperText: "暫不使用",
                disabled: true,
              })}*/}
             {/*  {renderField(
                "in_crate",
                "In Crate",
                3,
                {
                  helperText: "暫不使用",
                  disabled: true,
                },
                "number",
              )}*/}
              {renderField(
                "ref_price",
                "Reference Price",
                3,
                {
                  inputProps: { readOnly: true },
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
                  {getControlLabel("btn_save", "Update")}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default EditAcProcD;
