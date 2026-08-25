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
import { useEffect, useState } from "react";
import {
  fetchBasicDataByCate,
  fetchBasicDataDropDownByCate,
} from "../../../service/basic_data/basicDataService";
import Dropdown from "../../../component/dropdown/Dropdown";
import { fetchFactory } from "../../../service/factory/factoryService";
import {
  fetchBankDropDown,
  fetchFieldByPoVenderMDropDown,
  fetchBigContNoByAcContMDropDown,
} from "../../../service/ac_cont_m/AcContMService";

const AddAcContM = ({
  open,
  onClose,
  acShoeM,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  language='en'
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
    defaultValues: { cont_type: "1", ...acShoeM },
  });
  const [dropdownValues, setDropdownValues] = useState({});
  const [formValues, setFormValues] = useState({});

  // Mapping dropdown fields với category codes
  const mapDropdown = {
    vend_no: "",
    bvend_no: "",
    big_contno: "",
    pay_term: "PAYMENT_WAY",
    port_dis: "5003",
    d_type: "CDC",
    term_pay: "TRANSACTION_WAY",
    //seller:"1105",
   // s_addr: "1105",
    currency: "1105",
    // bank: "bank",
    // bank_ic: "bank_ic",
    // bank_addr: "bank_addr",
    cont_type: "1",
  };

  useEffect(() => {
    if (open && acShoeM) {
      reset({ cont_type: "1", ...acShoeM });

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
        cont_type: acShoeM.cont_type || "1",
      });
    }
  }, [open, acShoeM, reset]);

  useEffect(() => {
    if (!open) {
      setDropdownValues({});
      setFormValues({});
    }
  }, [open]);

  // CREATE DROPDOWN CALLBACKS cho từng loại API
  const createVendNoCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";
        const result = await fetchFieldByPoVenderMDropDown(
          user?.access_token,
          user?.factory,
          "",
          "",
          true,
          user?.department,
          user?.user_code,
          allow,
          "vend_no",
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
      if (
        !formValues.d_type ||
        !formValues.expire_date ||
        !formValues.issued_date ||
        !formValues.vend_no
      ) {
        return { data: [], total: 0, pageSize: pageSize };
      }

      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";

        const payload = {
          factory_code: user?.factory,
          d_type: formValues.d_type,
          expire_date: formValues.expire_date,
          issued_date: formValues.issued_date,
          vend_no: formValues.vend_no,
        };

        const result = await fetchBigContNoByAcContMDropDown(
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
        console.error(`Error fetching ${fieldName}:`, error);
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
          true,
          language
        );
        return {
          data: result?.data || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error(`Error fetching dropdown ${categoryCode}:`, error);
        return { data: [], total: 0, pageSize: pageSize };
      }
    };
  };

  const handleVendorSelect = (selectedVendor) => {
    const vendNo = selectedVendor?.code_no || selectedVendor?.vend_no || "";

    setValue("vend_no", vendNo, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setDropdownValues((prev) => ({
      ...prev,
      vend_no: vendNo,
    }));

    setFormValues((prev) => ({
      ...prev,
      vend_no: vendNo,
    }));

    if (selectedVendor?.FULLNM_E || selectedVendor?.fullnm_e) {
      const newValues = {
        seller: selectedVendor?.fullnm_e || selectedVendor?.FULLNM_E || "",
        s_addr: selectedVendor?.address_e || selectedVendor?.ADDRESS_E || "",
        currency: selectedVendor?.pay_cur || selectedVendor?.PAY_CUR || "",
        term_pay: selectedVendor?.pay_no || selectedVendor?.PAY_NO || "",
      };

      Object.entries(newValues).forEach(([key, value]) => {
        setValue(key, value, {
          shouldValidate: true,
          shouldDirty: true,
        });
      });

      setFormValues((prev) => ({ ...prev, ...newValues }));
      setDropdownValues((prev) => ({ ...prev, ...newValues }));
    }
  };

  const handleBuyerVendorSelect = (selectedBuyer) => {
    const buyerNo = selectedBuyer?.factory_code || selectedBuyer?.code_no || "";

    setDropdownValues((prev) => ({
      ...prev,
      bvend_no: buyerNo,
    }));
    setValue("bvend_no", buyerNo);

    const newValues = {
      buyer: selectedBuyer?.factory_name_e || selectedBuyer?.name || "",
      b_addr: selectedBuyer?.factory_address || selectedBuyer?.address || "",
    };

    setFormValues((prev) => ({ ...prev, ...newValues }));

    Object.entries(newValues).forEach(([key, value]) => {
      setValue(key, value);
    });
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
    gridSize = 2.4,
    extraProps = {},
    type = "text",
  ) => {
    const hasDropdown = mapDropdown.hasOwnProperty(fieldName);

    if (hasDropdown) {
      const canBeAutoFilled = ["seller", "s_addr", "currency", "term_pay"];
      const isAutoFilled =
        canBeAutoFilled.includes(fieldName) && formValues[fieldName];

      let tableName = "BASIC_DATA";
      let optionName = "basic_data";
      let callback = null;
      let header_field = fieldName;

      // Xác định callback và metadata cho từng field
      if (fieldName === "vend_no") {
        tableName = "PO_VENDER_M";
        optionName = "po_vender_m";
        callback = createVendNoCallback();
      } else if (fieldName === "bvend_no") {
        tableName = "FACTORY";
        optionName = "bvend_no";
        callback = createBvendNoCallback();
      } else if (fieldName === "big_contno") {
        tableName = "AC_CONT_M";
        optionName = "ac_cont_m";
        callback = createBigContNoCallback();
      } 
      else if (fieldName === "bank") {
        tableName = "AC_CONT_M";
        optionName = "bank_param";
        callback = createBankCallback(fieldName);
        header_field = "bank";
      } else if (fieldName === "bank_ic") {
        tableName = "AC_CONT_M";
        optionName = "bank_param";
        callback = createBankCallback(fieldName);
        header_field = "bank_ic";
      } else if (fieldName === "bank_addr") {
        tableName = "AC_CONT_M";
        optionName = "bank_param";
        callback = createBankCallback(fieldName);
        header_field = "bank_addr";
      } 
      
      else {
        // Basic data fields
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
                    value =
                      selectedItem?.code_no || selectedItem?.vend_no || "";
                  } else if (fieldName === "bvend_no") {
                    handleBuyerVendorSelect(selectedItem);
                    value = selectedItem?.factory_code || "";
                  } else if (fieldName === "big_contno") {
                    value = selectedItem?.cont_no || "";
                  } else if (fieldName === "bank") {
                    value = selectedItem?.bank || "";
                  } else if (fieldName === "bank_ic") {
                    value = selectedItem?.bank_ic || "";
                  } else if (fieldName === "bank_addr") {
                    value = selectedItem?.bank_addr || "";
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
                field={getColumnLabel(fieldName, label)}
                disabled={isAutoFilled}
                totalItems={0}
                pageSize={10}
                headerField={header_field}
              />
            )}
          />
        </Grid>
      );
    }

    const alwaysAutoFillFields = ["buyer", "b_addr"];

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
          <TextField
            select
            fullWidth
            label={getColumnLabel(fieldName, label)}
            InputLabelProps={{ shrink: true }}
            {...register(fieldName)}
            defaultValue="1"
          >
            <MenuItem value="1">{getControlLabel("ddl_cont_category_1","1-小合同")}</MenuItem>
            <MenuItem value="2">{getControlLabel("ddl_cont_category_2","2-大合同")}</MenuItem>
          </TextField>
        </Grid>
      );
    }
    if (fieldName === "expire_date") {
      return (
        <Grid item xs={2.4}>
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
                    "Expiration date > effective date",
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
    return (
      <Grid item xs={gridSize} key={fieldName}>
        <TextField
          fullWidth
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
    console.log("Form data being submitted:", data);
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
              {getControlLabel("ttl_m_add", "Add Ac Cont M Information")}
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
            <Grid container spacing={2} mb={3}>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  value={user?.factory}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("cont_no", "cont_no")}
                  {...register("cont_no")}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label={getColumnLabel("cont_type", "Cont Type")}
                  {...register("cont_type")}
                  value="1"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
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
                        setTimeout(() => trigger("expire_date"), 0);
                      }}
                    />
                  )}
                />
              </Grid>

              {renderField(
                "expire_date",
                "Expire Date",
                2.4,
                {
                  LabelInpuProps: { shrink: true },
                },
                "date",
              )}

              {renderField(
                "last_edate",
                "Last Edate",
                2.4,
                {
                  inputProps: {
                    readOnly: true,
                  },
                  InputLabelProps: {
                    shrink: true,
                  },
                },
                "date",
              )}

              {renderField("vend_no", "Vend no", 2.4)}
              {renderField("seller", "seller",2.4,{InputLabelProps:{shrink:true}})}
            </Grid>

            {/* Row 3 */}
            <Grid container spacing={2} mb={3}>
              {renderField("p_seller", "p_seller", 2.4)}
              {renderField("s_addr", "s_addr", 2.4,{InputLabelProps:{shrink:true}})}
              {renderField("s_pic", "s_pic", 2.4)}
              {renderField("s_position", "s_position", 2.4)}
              {renderField("s_accno", "s_accno", 2.4)}
            </Grid>

            {/* Row 4 */}
            <Grid container spacing={2} mb={3}>
              {renderField("bvend_no", "bvend_no", 2.4)}
              {renderField("buyer", "buyer", 2.4)}
              {renderField("b_addr", "b_addr", 2.4)}
              {renderField("b_pic", "b_pic", 2.4)}
              {renderField("b_position", "b_position", 2.4)}
            </Grid>

            <Grid container spacing={2} mb={3}>
              {renderField("b_accno", "b_accno", 2.4)}
              {renderField("sum_qty", "sum_qty", 2.4, {}, "number")}
              {renderField("sum_money", "sum_money", 2.4, {}, "number")}
              {renderField("currency", "currency", 2.4)}
              {renderField("freight", "freight", 2.4, {}, "number")}
            </Grid>

            {/* Row 5 */}
            <Grid container spacing={2} mb={3}>
              {renderField("insurance", "insurance", 2.4, {}, "number")}
              {renderField("term_pay", "term_pay", 2.4)}
              {renderField("pay_term", "pay_term", 2.4)}
              {renderField("time_delive", "time_delive", 2.4, {
                type: "date",
                InputLabelProps: { shrink: true },
              })}
              {renderField("goods_origin", "goods_origin", 2.4)}
            </Grid>

            {/* Row 6 */}
            <Grid container spacing={2} mb={3}>
              {renderField("port_dis", "port_dis", 2.4)}
              {renderField("note", "note", 2.4)}
              {renderField("bank", "bank", 4)}
              {renderField("bank_ic", "bank_ic", 4)}
              {renderField("bank_addr", "bank_addr", 4)}
            </Grid>

            {/* Row 7 */}
            <Grid container spacing={2} mb={3}>
              {renderField("d_type", "d_type", 2.4)}
              {renderField("cont_category", "cont_category", 2.4)}
              {renderField("big_contno", "big_contno", 2.4)}
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

export default AddAcContM;
