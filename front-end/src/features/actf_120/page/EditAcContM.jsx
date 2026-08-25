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
import { Controller, useForm } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useRef, useState } from "react"; //  thêm useRef
import { fetchBasicDataDropDownByCate } from "../../../service/basic_data/basicDataService";
import Dropdown from "../../../component/dropdown/Dropdown";
import {
  fetchBankDropDown,
  fetchBigContNoByAcContMDropDown,
  fetchBigContNoExmpByAcContMDropDown,
} from "../../../service/ac_cont_m/AcContMService";
import {
  fetchFactory,
  fetchFactoryDropdown, //  thêm import
} from "../../../service/factory/factoryService";
import {
  fetchVendnoDropDown,
  fetchAllCustDropdown, //  thêm import
} from "../../../service/se_cust/seCust";
import { getSum } from "../../../service/ac_cont_d/acContDService";

const EditAcContM = ({
  open,
  onClose,
  acShoeM,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  language, //  thêm prop
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    trigger,
    getValues,
  } = useForm({
    defaultValues: { ...acShoeM },
  });
  const [dropdownValues, setDropdownValues] = useState({});
  const [formValues, setFormValues] = useState({});
  const formValuesRef = useRef(formValues);

  useEffect(() => {
    formValuesRef.current = formValues;
  }, [formValues]);

  const mapDropdown = {
    vend_no: "",
    bvend_no: "",
    big_contno: "",
    pay_term: "PAYMENT_WAY",
    port_dis: "5003",
    d_type: "CDC",
    term_pay: "TRANSACTION_WAY",
    currency: "1105",
    bank: "bank",
    bank_ic: "bank_ic",
    bank_addr: "bank_addr",
  };

  useEffect(() => {
    if (open && acShoeM) {
      reset({ ...acShoeM });

      const initialDropdownValues = {};
      Object.keys(mapDropdown).forEach((fieldName) => {
        if (acShoeM[fieldName]) {
          initialDropdownValues[fieldName] = acShoeM[fieldName];
        }
      });
      setDropdownValues(initialDropdownValues);

      setFormValues({
        seller: acShoeM.seller || "",
        s_addr: acShoeM.s_addr || "",
        currency: acShoeM.currency || "",
        term_pay: acShoeM.term_pay || "",
        buyer: acShoeM.buyer || "",
        b_addr: acShoeM.b_addr || "",
        bank: acShoeM.bank || "",
        bank_ic: acShoeM.bank_ic || "",
        bank_addr: acShoeM.bank_addr || "",
        d_type: acShoeM.d_type || "",
        expire_date: acShoeM.expire_date || "",
        issued_date: acShoeM.issued_date || "",
        vend_no: acShoeM.vend_no || "",
      });
      if (acShoeM.cont_no) {
        loadSumData(acShoeM.cont_no);
      }
    }
  }, [open, acShoeM, reset]);

  useEffect(() => {
    if (!open) {
      setDropdownValues({});
      setFormValues({});
    }
  }, [open]);

  // ========== DROPDOWN CALLBACKS ==========
  const createVendNoCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";
        const result = await fetchAllCustDropdown(
          //  dùng fetchAllCustDropdown
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          "vend_no",
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
        console.error("Error fetching vend_no:", error);
        return { data: [], total: 0, pageSize: pageSize };
      }
    };
  };

  const createBvendNoCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";
        const result = await fetchFactory(
          user?.factory,
          "",
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
        console.error("Error fetching bvend_no:", error);
        return { data: [], total: 0, pageSize: pageSize };
      }
    };
  };

  const createBigContNoCallback = () => {
    return async (page, pageSize, searchText) => {
      const current = formValuesRef.current;
      if (!current.expire_date || !current.issued_date || !current.vend_no) {
        return { data: [], total: 0, pageSize: pageSize };
      }
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";
        const payload = {
          factory_code: user?.factory,
          expire_date: current.expire_date,
          issued_date: current.issued_date,
          vend_no: current.vend_no,
        };
        const result = await fetchBigContNoExmpByAcContMDropDown(
          user.access_token,
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          payload,
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
        console.error("Error fetching big_contno:", error);
        return { data: [], total: 0, pageSize: pageSize };
      }
    };
  };

  const createBankCallback = (fieldName) => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchBankDropDown(
          user?.access_token,
          user?.factory,
          fieldName,
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
        return { data: [], total: 0, pageSize: pageSize };
      }
    };
  };

  const createBasicDataCallback = (categoryCode) => {
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
        return { data: [], total: 0, pageSize: pageSize };
      }
    };
  };

  // ========== LOAD AUTO FIELDS ==========
  const loadAutoFieldByVendNo = async (vendNo) => {
    try {
      const allow = Array.isArray(auth)
        ? auth.find((item) => item.field === "query_level")?.title
        : "1";

      const result = await fetchVendnoDropDown(
        user?.access_token,
        user?.factory,
        "",
        vendNo,
        true,
        user?.department,
        user?.user_code,
        allow,
        "vend_no",
        1,
        1,
        vendNo,
      );

      const vendorData = result?.data?.[0];
      if (!vendorData) return;

      const newValues = {
        buyer: vendorData.cust_name || "",
        b_addr: vendorData.address_e || "",
        currency: vendorData.pay_cur || "",
        term_pay: vendorData.pay_no || "",
      };

      Object.entries(newValues).forEach(([key, value]) => {
        setValue(key, value, { shouldValidate: true, shouldDirty: true });
      });
      setFormValues((prev) => ({ ...prev, ...newValues }));
      setDropdownValues((prev) => ({ ...prev, ...newValues }));
    } catch (error) {
      console.error("Error loading fields from vend_no:", error);
    }
  };

  const loadAutoFieldByBVendNo = async (bvendNo) => {
    try {
      const result = await fetchFactoryDropdown(
        bvendNo,
        "",
        language,
        1,
        1,
        bvendNo,
        true,
      );

      const bvendorData = result?.data?.[0];
      if (!bvendorData) return;

      const newValues = {
        seller: bvendorData.factory_name || "",
        s_addr: bvendorData.factory_address || "",
      };

      Object.entries(newValues).forEach(([key, value]) => {
        setValue(key, value, { shouldValidate: true, shouldDirty: true });
      });
      setFormValues((prev) => ({ ...prev, ...newValues }));
      setDropdownValues((prev) => ({ ...prev, ...newValues }));
    } catch (error) {
      console.error("Error loading fields from bvend_no:", error);
    }
  };
  const loadSumData = async (cont_no) => {
    try {
      const allow = Array.isArray(auth)
        ? auth.find((item) => item.field === "query_level")?.title
        : "1";

      const [sumMoney, sumQty] = await Promise.all([
        getSum(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          "cont_money",
          cont_no,
        ),
        getSum(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          "cont_qty",
          cont_no,
        ),
      ]);

      setValue("sum_money", sumMoney?.data ?? 0);
      setValue("sum_qty", sumQty?.data ?? 0);
    } catch (error) {
      console.error("Error loading sum data:", error);
    }
  };
  const handleDecimalInput =
    (decimals = 8) =>
    (e) => {
      e.target.value = e.target.value.replace(
        new RegExp(`(\\.\\d{${decimals}})\\d+`),
        "$1",
      );
    };
  // ========== RENDER FIELD ==========
  const renderField = (
    fieldName,
    label,
    gridSize = 4,
    extraProps = {},
    type = "text",
  ) => {
    const hasDropdown = mapDropdown.hasOwnProperty(fieldName);

   if (hasDropdown) {
      const canBeAutoFilled = ["currency"];
      const isAutoFilled =
        canBeAutoFilled.includes(fieldName) && formValues[fieldName];

      let tableName = "BASIC_DATA";
      let optionName = "basic_data";
      let callback = null;
      let fieldLabel = getColumnLabel(fieldName, label);

      // Xác định callback và metadata cho từng field
      if (fieldName === "vend_no") {
        tableName = "SE_CUST";
        optionName = "se_cust";
        callback = createVendNoCallback();
        fieldLabel = getControlLabel("vendno", label);
      } else if (fieldName === "bvend_no") {
        tableName = "FACTORY";
        optionName = "bvend_no";
        callback = createBvendNoCallback();
        fieldLabel = getControlLabel("lbl_bvend_no", label);
      } else if (fieldName === "big_contno") {
        tableName = "AC_CONT_M";
        optionName = "ac_cont_m";
        callback = createBigContNoCallback();
      } else if (
        fieldName === "bank" ||
        fieldName === "bank_ic" ||
        fieldName === "bank_addr"
      ) {
        tableName = "AC_CONT_M";
        optionName = "bank_param";
        callback = createBankCallback(fieldName);
      } else {
        const categoryCode = mapDropdown[fieldName];
        callback = createBasicDataCallback(categoryCode);
      }

      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Dropdown
                onFetchData={callback}
                onSelect={(selectedItem) => {
                  let value = "";
                  if (fieldName === "vend_no") {
                    handleVendorSelect(selectedItem);
                    value = selectedItem?.cust_id || "";
                  } else if (fieldName === "bvend_no") {
                    value = selectedItem?.factory_code || "";
                    setValue("bvend_no", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    setDropdownValues((prev) => ({ ...prev, bvend_no: value }));
                    setFormValues((prev) => ({ ...prev, bvend_no: value }));
                    if (value) {
                      loadAutoFieldByBVendNo(value);
                    }
                  } else if (fieldName === "b_addr") {
                    value = selectedItem?.b_addr || "";
                  } else {
                    value = selectedItem?.code_no || "";
                  }

                  field.onChange(value);
                  setDropdownValues((prev) => ({
                    ...prev,
                    [fieldName]: value,
                  }));
                  setFormValues((prev) => ({
                    ...prev,
                    [fieldName]: value,
                  }));
                }}
                select={field.value || dropdownValues[fieldName] || ""}
                table={tableName}
                option={optionName}
                getControlLabel={getControlLabel}
                language={user?.language || "en"}
                field={fieldLabel}
                disabled={isAutoFilled}
                totalItems={0}
                pageSize={10}
              />
            )}
          />
        </Grid>
      );
    }

    const alwaysAutoFillFields = ["seller"];
    if (alwaysAutoFillFields.includes(fieldName)) {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <TextField
            fullWidth
            label={getColumnLabel(fieldName, label)}
            value={formValues[fieldName] || ""}
            onChange={(e) => {
              setFormValues((prev) => ({
                ...prev,
                [fieldName]: e.target.value,
              }));
              setValue(fieldName, e.target.value);
            }}
            disabled
            {...extraProps}
          />
        </Grid>
      );
    }

    if (fieldName === "cont_category") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                select
                fullWidth
                label={getColumnLabel(fieldName, label)}
                InputLabelProps={{ shrink: true }}
                {...field}
                value={field.value || ""}
              >
                <MenuItem value="1">
                  {getControlLabel("ddl_cont_category_1", "1-小合同")}
                </MenuItem>
                <MenuItem value="2">
                  {getControlLabel("ddl_cont_category_2", "2-大合同")}
                </MenuItem>
              </TextField>
            )}
          />
        </Grid>
      );
    }

    if (fieldName === "expire_date") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name="expire_date"
            control={control}
            defaultValue=""
            rules={{
              validate: (value) => {
                const issuedDate = getValues("issued_date");
                if (!value) return true;
                if (issuedDate && value <= issuedDate) {
                  return getControlLabel(
                    "noti_expire_gt_issued",
                    "Expiration date > effective date.",
                  );
                }
                return true;
              },
            }}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <TextField
                value={value || ""}
                fullWidth
                label={getColumnLabel("expire_date", "expire date")}
                type="date"
                InputLabelProps={{ shrink: true }}
                error={!!error}
                helperText={error?.message}
                onChange={(e) => {
                  const newValue = e.target.value;
                  onChange(newValue);
                  setFormValues((prev) => ({ ...prev, expire_date: newValue }));
                  setValue("last_edate", newValue);
                  setFormValues((prev) => ({ ...prev, last_edate: newValue }));
                  setTimeout(() => trigger("expire_date"), 0);
                }}
              />
            )}
          />
        </Grid>
      );
    }

    if (fieldName === "term_pay") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name="term_pay"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Dropdown
                onFetchData={createBasicDataCallback("TRANSACTION_WAY")}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.code_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({ ...prev, term_pay: value }));
                  setFormValues((prev) => ({ ...prev, term_pay: value }));
                }}
                select={field.value || dropdownValues["term_pay"] || ""}
                table="BASIC_DATA"
                option="basic_data"
                getControlLabel={getControlLabel}
                language={user?.language || "en"}
                field={getColumnLabel("term_pay", "term_pay")}
                totalItems={0}
                pageSize={10}
              />
            )}
          />
        </Grid>
      );
    }

    const autoFillReadOnly = ["buyer", "b_addr"];
    if (autoFillReadOnly.includes(fieldName)) {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <TextField
            fullWidth
            label={getColumnLabel(fieldName, label)}
            value={formValues[fieldName] || ""}
            InputLabelProps={{ shrink: true }}
            inputProps={{ readOnly: true }}
            {...extraProps}
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
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
              {getControlLabel("ttl_m_edit", "Edit Ac Cont M Information")}
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
            {/* Row 1: Factory Code, Cont No, Cont Type */}
            <Grid container spacing={2} mb={3}>
              {renderField("factory_code", "Factory Code", 4, {
                disabled: true,
              })}
              {renderField("cont_no", "cont_no", 4, { disabled: true })}
              {renderField("cont_type", "Cont Type", 4, {
                inputProps: {
                  readOnly: true,
                },
              })}
              <Grid item xs={4}>
                <Controller
                  name="issued_date"
                  control={control}
                  defaultValue=""
                  render={({ field: { value, onChange } }) => (
                    <TextField
                      value={value || ""}
                      fullWidth
                      label={getColumnLabel("issued_date", "issued date")}
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        onChange(newValue);
                        setFormValues((prev) => ({
                          ...prev,
                          issued_date: newValue,
                        }));
                      }}
                    />
                  )}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    onChange(newValue);
                    setFormValues((prev) => ({
                      ...prev,
                      issued_date: newValue,
                    }));
                    setTimeout(() => trigger("expire_date"), 0);
                  }}
                />
              </Grid>

              {renderField(
                "expire_date",
                "expire_date",
                4,
                {
                  InputLabelProps: { shrink: true },
                },
                "date",
              )}
            </Grid>

            {/* Row 3: Vendor & Seller */}
            <Grid container spacing={2} mb={3}>
              {renderField(
                "last_edate",
                "last_edate",
                4,
                {
                  InputLabelProps: { shrink: true },
                  inputProps: {
                    readOnly: true,
                  },
                },
                "date",
              )}
              {renderField("bvend_no", "bvend_no", 4)}
              {renderField("seller", "seller", 4, {
                InputLabelProps: { shrink: true },
                inputProps: {
                  readOnly: true,
                },
              })}
              {renderField("s_addr", "s_addr", 4, {
                InputLabelProps: { shrink: true },
                inputProps: {
                  readOnly: true,
                },
              })}
              {/*  {renderField("p_seller", "p_seller", 4)}*/}
            </Grid>

            {/* Row 6: Buyer Info */}
            <Grid container spacing={2} mb={3}>
              {renderField("vend_no", "Vend no", 4)}
              {renderField("buyer", "buyer", 4)}
              {renderField("b_addr", "b_addr", 4)}
              {renderField("b_pic", "b_pic", 4)}
            </Grid>

            {/* Row 7: Amounts */}
            <Grid container spacing={2} mb={3}>
              {renderField("b_position", "b_position", 4)}
              {renderField("b_accno", "b_accno", 4)}
              {renderField(
                "sum_qty",
                "sum_qty",
                4,
                { disabled: true },
                "number",
              )}
              {renderField(
                "sum_money",
                "sum_money",
                4,
                { disabled: true },
                "number",
              )}
            </Grid>

            {/* Row 8: Payment Terms */}
            <Grid container spacing={2} mb={3}>
              {renderField("currency", "currency", 4)}
              {renderField("freight", "freight", 4, {}, "number")}
              {renderField("insurance", "insurance", 4, {}, "number")}
              {renderField("term_pay", "term_pay", 4)}
            </Grid>

            {/* Row 10: Origin & Port */}
            <Grid container spacing={2} mb={3}>
              {/*  {renderField("goods_origin", "goods_origin", 4)}
              {renderField("port_dis", "port_dis", 4)}*/}
              {renderField("pay_term", "pay_term", 4)}
              {renderField("note", "note", 4)}
              {renderField("cont_category", "cont_category", 4)}
              {renderField("big_contno", "big_contno", 4)}
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

export default EditAcContM;
