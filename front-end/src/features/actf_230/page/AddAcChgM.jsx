import { useEffect, useRef, useState } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import { Controller, useForm } from "react-hook-form";
import Dropdown from "../../../component/dropdown/Dropdown";
import { fetchBasicDataDropDownByCate } from "../../../service/basic_data/basicDataService";
import {
  checkDuplicateAGO,
  createAcno,
} from "../../../service/ac_chg_m/acChgM";
import {
  fetchBankDropDown,
  fetchFieldByPoVenderMDropDown,
} from "../../../service/ac_cont_m/AcContMService";
import {
  fetchFieldDropdown,
  fetchMinContDropdown,
  getContno,
} from "../../../service/vw_cont_exp/VwContExp";
import {
  fetchFieldDropdownByIMT,
  getComInvoice,
  getSort,
} from "../../../service/ac_imp_material_tracking/AcImpMaterialTrackingService";
import { fetchFieldDropdownByASB } from "../../../service/ac_send_base/AcSendBaseService";
import { getSum } from "../../../service/ac_chg_d/acChgD";

const AddAcChgM = ({
  open,
  onClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
}) => {
  const allowedFactory = [
    "3000",
    "3010",
    "3020",
    "3030",
    "3040",
    "3050",
    "3060",
    "3070",
    "3080",
    "3090",
  ];
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      factory_code: user?.factory || "",
      ac_no: "",
      d_type: "2",
      ac_chgno: "",
      ac_chgs: "",
      ac_chgn: "",
      ac_chgo: "",
      ac_unit: "",
      ac_addr: "",
      org_tax: "",
      org_addr: "",
      cust_tax: "",
      cust_addr: "",
      rec_addr: "",
      cont_no: "",
      com_invoice: "",
      chg_type: "",
      license: "",
      lic_date: "",
      lic_edate: "",
      sort: "",
      arr_date: "",
      deliver: "",
      trans_date: "",
      in_port: "",
      unload_port: "",
      curr_no: "",
      payment: "",
      peice: "",
      gross: "",
      trade: "",
      min_cont: "",
      out_country: "",
      b_unit: "",
      stoc_type: "",
      curr_rate: allowedFactory.includes(user?.factory) ? 1 : 0,
      out_port: allowedFactory.includes(user?.factory) ? "KH2" : "",
      status: "1",
    },
  });
  const [dropdownValues, setDropdownValues] = useState({
    d_type: allowedFactory.includes(user?.factory) ? "1" : "2",
    cont_no: "",
    com_invoice: "",
    chg_type: "",
    license: "",
    in_port: "",
    unload_port: "",
    trade: "",
    min_cont: "",
    out_country: "",
    b_unit: "",
    stoc_type: "",
    in_country: "",
  });

  const [autoFields, setAutoFields] = useState({
    ac_no: "",
    ac_chgno: "",
    ac_unit: "",
    ac_addr: "",
    org_tax: "",
    lic_date: "",
    lic_edate: "",
    sort: "",
  });
  const ac_chgno_watch = watch("ac_chgno");
  const out_date_watch = watch("out_date");
  const debounceRef = useRef(null);
  const ac_chgs = watch("ac_chgs");
  const ac_chgn = watch("ac_chgn");
  const ac_chgo = watch("ac_chgo");
  let ac_chgno = "";
  const hasDuplicateRef = useRef(false);
  const d_type = watch("d_type");
  const cont_no = watch("cont_no");
  const com_invoice = watch("com_invoice");
  useEffect(() => {
    if (open) {
      loadAutoFields();
    } else {
      reset();
      setDropdownValues({
        d_type: allowedFactory.includes(user?.factory) ? "1" : "2",
        cont_no: "",
        com_invoice: "",
        chg_type: "",
        license: "",
        in_port: "",
        unload_port: "",
        trade: "",
        min_cont: "",
        out_country: "",
        b_unit: "",
        stoc_type: "",
      });
    }
  }, [open, reset]);

  // Load AC_NO và các param values
  const loadAutoFields = async () => {
    try {
      const acNoResult = await createAcno(
        user?.factory,
        user?.department,
        user?.user_code,
        auth?.find((item) => item.field === "query_level")?.title,
        "",
        "2",
      );
      const ac_no = acNoResult?.data || "";
      setValue("ac_no", ac_no);
      setAutoFields((prev) => ({ ...prev, ac_no }));
      const [orgTax, acUnit, acAddr, tax, addTax, sumMoney] = await Promise.all(
        [
          fetchBankDropDown(user?.access_token, user?.factory, "org_tax"),
          fetchBankDropDown(user?.access_token, user?.factory, "ac_unit"),
          fetchBankDropDown(user?.access_token, user?.factory, "ac_addr"),
          getSum(
            user?.factory,
            user?.department,
            user?.user_code,
            auth?.find((item) => item.field === "query_level")?.title,
            "tax",
            ac_no,
          ),
          getSum(
            user?.factory,
            user?.department,
            user?.user_code,
            auth?.find((item) => item.field === "query_level")?.title,
            "add_tax",
            ac_no,
          ),
          getSum(
            user?.factory,
            user?.department,
            user?.user_code,
            auth?.find((item) => item.field === "query_level")?.title,
            "money",
            ac_no,
          ),
        ],
      );
      setValue("org_tax", orgTax?.data[0]?.org_tax || "");
      setValue("ac_unit", acUnit?.data[0]?.ac_unit || "");
      setValue("ac_addr", acAddr?.data[0]?.ac_addr || "");
      setValue("tax", tax?.data?.total || 0);
      setValue("add_tax", addTax?.data?.total || 0);
      setValue("sum_money", sumMoney?.data?.total || 0);
      setAutoFields((prev) => ({
        ...prev,
        ac_unit: acUnit?.data?.ac_unit || "",
        ac_addr: acAddr?.data?.ac_addr || "",
        org_tax: orgTax?.data?.org_tax || "",
        tax: tax?.data?.total || 0,
        add_tax: addTax?.data?.total || 0,
        sum_money: sumMoney?.data?.total || 0,
      }));
    } catch (error) {
      console.error("Error loading auto fields:", error);
    }
  };
  const loadDataFromContNo = async (contNo) => {
    try {
      const [acBom, orgAddr, acRow, custAddr, currNo, payment, trade] =
        await Promise.all([
          fetchFieldDropdown(
            user?.factory,
            user?.department,
            user?.user_code,
            auth?.find((item) => item.field === "query_level")?.title,
            "seller",
            contNo,
            "1",
            "10",
            "",
          ),
          fetchFieldDropdown(
            user?.factory,
            user?.department,
            user?.user_code,
            auth?.find((item) => item.field === "query_level")?.title,
            "s_addr",
            contNo,
            "1",
            "10",
            "",
          ),
          fetchFieldDropdown(
            user?.factory,
            user?.department,
            user?.user_code,
            auth?.find((item) => item.field === "query_level")?.title,
            "buyer",
            contNo,
            "1",
            "10",
            "",
          ),
          fetchFieldDropdown(
            user?.factory,
            user?.department,
            user?.user_code,
            auth?.find((item) => item.field === "query_level")?.title,
            "b_addr",
            contNo,
            "1",
            "10",
            "",
          ),
          fetchFieldDropdown(
            user?.factory,
            user?.department,
            user?.user_code,
            auth?.find((item) => item.field === "query_level")?.title,
            "currency",
            contNo,
            "1",
            "10",
            "",
          ),
          fetchFieldDropdown(
            user?.factory,
            user?.department,
            user?.user_code,
            auth?.find((item) => item.field === "query_level")?.title,
            "pay_term",
            contNo,
            "1",
            "10",
            "",
          ),
          fetchFieldDropdown(
            user?.factory,
            user?.department,
            user?.user_code,
            auth?.find((item) => item.field === "query_level")?.title,
            "term_pay",
            contNo,
            "1",
            "10",
            "",
          ),
        ]);
      setValue("ac_bom", acBom?.data?.seller || "");
      setValue("org_addr", orgAddr?.data?.s_addr || "");
      setValue("ac_row", acRow?.data?.buyer || "");
      setValue("cust_addr", custAddr?.data?.b_addr || "");
      setValue("curr_no", currNo?.data?.currency || "");
      setValue("payment", payment?.data?.pay_term || "");
      setValue("trade", trade?.data?.term_pay || "");
    } catch (error) {
      console.error("Error loading data from cont_no:", error);
    }
  };
  const loadDefaultMinCont = async (contNo) => {
    try {
      const allow = Array.isArray(auth)
        ? auth.find((item) => item.field === "query_level")?.title
        : "1";

      const result = await fetchMinContDropdown(
        user?.factory,
        user?.department,
        user?.user_code,
        allow,
        "cont_no",
        contNo,
        1,
        10,
        "",
      );

      const lastItem = result?.data?.[result?.data?.length - 1] || {};
      const value = lastItem?.cont_no || lastItem?.code_no || "";

      setValue("min_cont", value);
      setDropdownValues((prev) => ({ ...prev, min_cont: value }));
    } catch (error) {
      console.error("Error loading default min_cont:", error);
    }
  };
  useEffect(() => {
    if (!ac_chgs && !ac_chgn && !ac_chgo) {
      setValue("ac_chgno", "");
      return;
    }

    if (ac_chgs || ac_chgn || ac_chgo) {
      ac_chgno = `${ac_chgs || ""}/${ac_chgn || ""}/${ac_chgo || ""}`;
      setValue("ac_chgno", ac_chgno);
    }
  }, [watch("ac_chgs"), watch("ac_chgn"), watch("ac_chgo")]);

  useEffect(() => {
    // Chỉ check khi có đủ cả 2 giá trị
    if (!ac_chgno_watch || !out_date_watch) {
      clearErrors("ac_chgno");
      return;
    }
    // Clear debounce cũ nếu user vẫn đang gõ
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const check = await checkDuplicateAGO(
          user?.factory,
          user?.department,
          user?.user_code,
          auth?.find((item) => item.field === "query_level")?.title,
          ac_chgno_watch,
          out_date_watch,
          watch("ac_no"),
          "2"
        );

        if (!check?.success) {
          hasDuplicateRef.current = true;
          setError("ac_chgno", {
            type: "manual",
            message: check?.message || "already exists in a previous year.",
          });
        } else {
          hasDuplicateRef.current = false;
          clearErrors("ac_chgno");
        }
      } catch (err) {
        console.error("Debounce check error:", err);
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [ac_chgno_watch, out_date_watch]);
  useEffect(() => {
    if (cont_no) {
      loadDataFromContNo(cont_no);
    }
  }, [cont_no]);
  // ========== CALLBACK FUNCTIONS ==========
  useEffect(() => {
    const out_date = watch("out_date");
    if (out_date) {
      const passDate = new Date(out_date);
      const formattedDate = passDate.toISOString().split("T")[0];
      setValue("pass_date", formattedDate);
    }
  }, [watch("out_date")]);

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
        console.error(`Error fetching basic data ${categoryCode}:`, error);
        return { data: [], total: 0, pageSize };
      }
    };
  };

  const createMinContCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";

        const result = await fetchMinContDropdown(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          "cont_no",
          dropdownValues?.cont_no,
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
        console.error("Error fetching min_cont:", error);
        return { data: [], total: 0, pageSize };
      }
    };
  };
  const createContNoCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";

        const result = await getContno(
          user?.factory,
          user?.department,
          user?.user_code,
          auth?.find((item) => item.field === "query_level")?.title,
          page,
          pageSize,
          searchText,
        );
        //   loadDataFromContNo(cont_no);
        return {
          data: result?.data || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error("Error fetching license:", error);
        return { data: [], total: 0, pageSize };
      }
    };
  };
  const createComInvoiceCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";

        const result = await getComInvoice(
          user?.factory,
          "d_type",
          d_type,
          user?.department,
          user?.user_code,
          auth?.find((item) => item.field === "query_level")?.title,
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
        console.error("Error fetching license:", error);
        return { data: [], total: 0, pageSize };
      }
    };
  };
  // Submit form
  const onSubmit = (data) => {
    if (hasDuplicateRef.current) {
      setError("ac_chgno", {
        type: "manual",
        message: watch("ac_chgno")
          ? `"${watch("ac_chgno")}" already exists in a same year.`
          : "already exists in a previous year.",
      });
      return;
    }
    handleAdd(data);
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
    // ===== DROPDOWN FIELDS =====
    if (fieldName === "cont_no") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createContNoCallback()}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.cont_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({
                    ...prev,
                    cont_no: value,
                    min_cont: "",
                  }));
                  setValue("min_cont", "");

                  if (value) {
                    loadDefaultMinCont(value);
                  }
                }}
                select={field.value || dropdownValues.cont_no || ""}
                table="VW_CONT_EXP"
                option="cont_no"
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

    if (fieldName === "com_invoice") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createComInvoiceCallback()}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.invoice_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({ ...prev, invoice_no: value }));
                }}
                select={field.value || dropdownValues.invoice_no || ""}
                table="AC_IMP_MATERIAL_TRACKING"
                option="invoice_no"
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
    // D_TYPE - Static select
    if (fieldName === "d_type") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <TextField
            select
            fullWidth
            label={getColumnLabel(fieldName, label)}
            InputLabelProps={{ shrink: true }}
            {...register(fieldName)}
            defaultValue="2"
          >
            {" "}
            <MenuItem value="1">
              {getControlLabel("ddl_d_type_1", "1-外銷")}
            </MenuItem>
            <MenuItem value="2">
              {getControlLabel("ddl_d_type_2", "2-內銷")}
            </MenuItem>
          </TextField>
        </Grid>
      );
    }

    // CHG_TYPE (category 5002)
    if (fieldName === "chg_type") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createBasicDataCallback("5002")}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.code_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({ ...prev, chg_type: value }));
                }}
                select={field.value || dropdownValues.chg_type || ""}
                table="BASIC_DATA"
                option="basic_data"
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
    // OUT_PORT (category 5002)
    if (fieldName === "out_port") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createBasicDataCallback("2116")}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.code_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({ ...prev, out_port: value }));
                }}
                select={field.value || dropdownValues.out_port || ""}
                table="BASIC_DATA"
                option="basic_data"
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
    // TRADE (category TRANSACTION_WAY)
    if (fieldName === "trade") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createBasicDataCallback("TRANSACTION_WAY")}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.code_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({ ...prev, trade: value }));
                }}
                select={field.value || dropdownValues.trade || ""}
                table="BASIC_DATA"
                option="basic_data"
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

    // MIN_CONT
    if (fieldName === "min_cont") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createMinContCallback()}
                onSelect={(selectedItem) => {
                  const value =
                    selectedItem?.cont_no || selectedItem?.code_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({ ...prev, min_cont: value }));
                }}
                select={field.value || dropdownValues.min_cont || ""}
                table="VW_CONT_EXP"
                option="min_cont"
                getControlLabel={getControlLabel}
                language={user?.language || "en"}
                field={getColumnLabel(fieldName, label)}
                totalItems={0}
                pageSize={10}
                disabled={!cont_no}
                helperText={!cont_no ? "Please select Cont No first" : ""}
              />
            )}
          />
        </Grid>
      );
    }
    // Sort (category 5008)
    if (fieldName === "sort") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createBasicDataCallback("5008")}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.code_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({ ...prev, sort: value }));
                }}
                select={field.value || dropdownValues.sort || ""}
                table="BASIC_DATA"
                option="basic_data"
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
    // In country (category 5008)
    if (fieldName === "in_country") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createBasicDataCallback("5006")}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.code_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({ ...prev, in_country: value }));
                }}
                select={field.value || dropdownValues.in_country || ""}
                table="BASIC_DATA"
                option="basic_data"
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

    // ===== REGULAR FIELDS =====
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogContent>
        <Paper sx={{ maxWidth: "1600px", mx: "auto", p: 3 }}>
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
              {getControlLabel("ttl_add", "Add AC_CHG_M")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Row 1 */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  value={user?.factory}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("ac_no", "AC No")}
                  InputLabelProps={{ shrink: true }}
                  {...register("ac_no")}
                  disabled
                  helperText="Auto generated"
                />
              </Grid>
              {renderField("out_date", "Out Date", 2.4, {}, "date")}
              {renderField("d_type", "D Type", 2.4)}
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={2}>
              {renderField("ac_chgno", "AC CHGNO", 2.4, {
                error: !!errors.ac_chgno,
                helperText: errors.ac_chgno?.message || "",
                sx: {
                  "& .MuiFormHelperText-root": {
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    overflow: "hidden",
                  },
                },
              })}
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("ac_unit", "AC Unit")}
                  InputLabelProps={{ shrink: true }}
                  {...register("ac_unit")}
                  inputProps={{
                    readOnly: true,
                  }}
                  helperText="From Param"
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("ac_addr", "AC Address")}
                  InputLabelProps={{ shrink: true }}
                  {...register("ac_addr")}
                  inputProps={{
                    readOnly: true,
                  }}
                  helperText="From Param"
                />
              </Grid>
              {renderField("pass_date", "Pass Date", 2.4, {}, "date")}
            </Grid>

            {/* Row 3 */}
            <Grid container spacing={2} mb={2}>
              {renderField("cont_no", "Cont No", 2.4, {
                disabled: true,
              })}
              {renderField("min_cont", "Min Cont", 2.4)}
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("org_tax", "Org Tax")}
                  InputLabelProps={{ shrink: true }}
                  {...register("org_tax")}
                  helperText="From Param"
                  inputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              {renderField("ac_bom", "AC BOM", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
              {renderField("org_addr", "Org Address", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
              {renderField("com_invoice", "Com Invoice", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
              {renderField("cust_tax", "Customer Tax", 2.4, {})}
              {renderField("ac_row", "AC Row", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
            </Grid>

            {/* Row 4 */}
            <Grid container spacing={2} mb={2}>
              {renderField("cust_addr", "Customer Address", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
              {renderField("rec_addr", "Receive Address", 2.4, {})}
              {renderField("agent_make", "Agent Make", 2.4)}
              {renderField("chg_type", "Charge Type", 2.4)}
            </Grid>

            {/* Row 7 */}
            <Grid container spacing={2} mb={2}>
              {renderField("sort", "Sort", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
              {renderField("trans_type", "Transport Type", 2.4)}
              {renderField("out_port", "Out Port", 2.4)}
              {renderField("curr_no", "Currency No", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
            </Grid>

            {/* Row 8 */}
            <Grid container spacing={2} mb={2}>
              {renderField(
                "curr_rate",
                "Currency Rate",
                2.4,
                {
                  inputProps: {
                    step: 0.00000001,
                    min: 0,
                    onChange: handleDecimalInput(8),
                  },
                },
                "number",
              )}
              {renderField("payment", "Payment", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
              {renderField(
                "tax",
                "Tax",
                2.4,
                {
                  inputProps: {
                    readOnly: true,
                  },
                },
                "number",
              )}
              {renderField(
                "peice",
                "Piece",
                2.4,
                 {
                  inputProps: {
                    step: 0.0001,
                    min: 0,
                    onChange: handleDecimalInput(4),
                  },
                },
                "number",
              )}
              {renderField(
                "gross",
                "Gross",
                2.4,
                {
                  inputProps: {
                    step: 0.0001,
                    min: 0,
                    onChange: handleDecimalInput(4),
                  },
                },
                "number",
              )}
            </Grid>

            {/* Row 10 */}
            <Grid container spacing={2} mb={2}>
              {renderField(
                "sum_money",
                "Sum Money",
                2.4,
                {
                  inputProps: {
                    readOnly: true,
                  },
                },
                "number",
              )}
              {renderField("trade", "Trade", 2.4)}
              {renderField("in_country", "In Country", 2.4)}
              {renderField("old_no", "Old No", 2.4)}
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

export default AddAcChgM;
