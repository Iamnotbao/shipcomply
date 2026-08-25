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
import { fetchBankDropDown } from "../../../service/ac_cont_m/AcContMService";
import {
  checkDuplicateAGEO,
  createAcno,
} from "../../../service/ac_proc_m/AcProcMService";
import {
  fetchFieldDropdown,
  fetchInContDropdown,
  fetchMinContDropdown,
} from "../../../service/vw_cont_imp/VwContImpService";
import {
  fetchFieldDropdownByIMT,
  getComInvoice,
  getSort,
} from "../../../service/ac_imp_material_tracking/AcImpMaterialTrackingService";
import { fetchFieldDropdownByASB } from "../../../service/ac_send_base/AcSendBaseService";
import { getSum } from "../../../service/ac_proc_d/AcProcDService";

const AddAcProcM = ({
  open,
  onClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  language={language}
}) => {
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
      d_type: "3",
      ac_date: "",
      in_cont: "",
      ac_outer: "",
      rec_addr: "",
      rec_person: "",
      in_curr: "",
      in_crate: "",
      in_settle: "",
      out_org: "",
      out_type: "",
      out_license: "",
      out_date: "",
      out_cont: "",
      out_vdate: "",
      in_type: "",
      in_license: "",
      in_date: "",
      in_vdate: "",
      vat_invoice: "",
      com_invoice: "",
      sort: "",
      out_settle: "",
      out_curr: "",
      out_crate: "",
      tax: 0,
      add_tax: 0,
      oth_cost: 0,
      peice: 0,
      sum_qty: 0,
      suttle: 0,
      gross: 0,
      sum_money: 0,
      ac_chgo: "",
      ac_chgn: "",
      ac_chgs: "",
      ac_chgeno: "",
      ex_user: "",
      col1: "",
      col2: "",
      col3: "",
      col4: "",
      com_date: "",
      vat_date: "",
      col6: "",
      in_port: "",
      unload_port: "",
      min_cont: "",
      b_unit: "",
      trans_date: "",
      arr_date: "",
      out_country: "",
      deliver: "",
      js_no: "",
      js_date: "",
      soso: "",
      complete_type: "",
      ac_type: "",
      ac_inner: "",
      stoc_type: "1",
      mark: "A",
      vend_no: "",
      status: 1,
    },
  });

  const [dropdownValues, setDropdownValues] = useState({
    d_type: "3",
    in_cont: "",
    out_type: "",
    in_type: "",
    com_invoice: "",
    sort: "",
    out_settle: "",
    out_curr: "",
    ac_chgo: "",
    ac_chgn: "",
    min_cont: "",
    stoc_type: "1",
  });
  const ac_chgeno_watch = watch("ac_chgeno");
  const out_date_watch = watch("out_date");
  const debounceRef = useRef(null);
  const ac_chgs = watch("ac_chgs");
  const ac_chgn = watch("ac_chgn");
  const ac_chgo = watch("ac_chgo");
  let ac_chgeno = "";
  const hasDuplicateRef = useRef(false);
  const d_type = watch("d_type");
  const in_cont = watch("in_cont");
  const com_invoice = watch("com_invoice");
  const sort = watch("sort");

  useEffect(() => {
    if (open) {
      loadAutoFields();
    } else {
      reset();
      setDropdownValues({
        d_type: "3",
        in_cont: "",
        out_type: "",
        in_type: "",
        com_invoice: "",
        sort: "",
        out_settle: "",
        out_curr: "",
        ac_chgo: "",
        ac_chgn: "",
        min_cont: "",
        stoc_type: "1",
      });
    }
  }, [open, reset]);

  // Auto-generate AC_NO and load in_license
  const loadAutoFields = async () => {
    try {
      const allow =
        auth?.find((item) => item.field === "query_level")?.title || "1";

      // Generate AC_NO
      const acNoResult = await createAcno(
        user?.factory,
        user?.department,
        user?.user_code,
        allow,
      );
      const ac_no = acNoResult?.data || "";
      setValue("ac_no", ac_no);

      // Get in_license from GF_PARAM_VALUE
      const inLicenseResult = await fetchBankDropDown(
        user?.access_token,
        user?.factory,
        "license",
      );
      setValue("in_license", inLicenseResult?.data[0]?.license || "");

      // Load tax and add_tax
      await loadTaxFields(ac_no);
    } catch (error) {
      console.error("Error loading auto fields:", error);
    }
  };
  // Load tax and add_tax from AC_PROC_D
  const loadTaxFields = async (ac_no) => {
    try {
      const allow =
        auth?.find((item) => item.field === "query_level")?.title || "1";

      const [taxResult, addTaxResult, sumMoneyResult, sumQtyResult] =
        await Promise.all([
          getSum(
            user?.factory,
            user?.department,
            user?.user_code,
            allow,
            "tax",
            ac_no,
          ),
          getSum(
            user?.factory,
            user?.department,
            user?.user_code,
            allow,
            "add_tax",
            ac_no,
          ),
          getSum(
            user?.factory,
            user?.department,
            user?.user_code,
            allow,
            "money",
            ac_no,
          ),
          getSum(
            user?.factory,
            user?.department,
            user?.user_code,
            allow,
            "qty",
            ac_no,
          ),
        ]);

      setValue("tax", taxResult?.data?.total || 0);
      setValue("add_tax", addTaxResult?.data?.total || 0);
      setValue("sum_money", sumMoneyResult?.data?.total || 0);
      setValue("sum_qty", sumQtyResult?.data?.total || 0);
    } catch (error) {
      console.error("Error loading tax fields:", error);
    }
  };

  // Load data when in_cont changes
  useEffect(() => {
    if (in_cont) {
      loadDataFromInCont(in_cont);
    }
  }, [in_cont]);

  const loadDataFromInCont = async (contNo) => {
    try {
      const allow =
        auth?.find((item) => item.field === "query_level")?.title || "1";

      const [acOuter, recPerson, inCurr, inSettle, outSettle] =
        await Promise.all([
          fetchFieldDropdown(
            user?.factory,
            user?.department,
            user?.user_code,
            allow,
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
            allow,
            "p_seller",
            contNo,
            "1",
            "10",
            "",
          ),
          fetchFieldDropdown(
            user?.factory,
            user?.department,
            user?.user_code,
            allow,
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
            allow,
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
            allow,
            "pay_term",
            contNo,
            "1",
            "10",
            "",
          ),
        ]);

      setValue("ac_outer", acOuter?.data?.s_addr || "");
      setValue("rec_person", recPerson?.data?.p_seller || "");
      setValue("in_curr", inCurr?.data?.currency || "");
      setValue("in_settle", inSettle?.data?.pay_term || "");
      setValue("out_settle", outSettle?.data?.pay_term || "");
    } catch (error) {
      console.error("Error loading data from in_cont:", error);
    }
  };

  const loadSortFromInvoice = async (invoice) => {
    try {
      const allow =
        auth?.find((item) => item.field === "query_level")?.title || "1";

      const sortResult = await getSort(
        user?.factory,
        invoice,
        user?.department,
        user?.user_code,
        allow,
      );

      const sortValue = sortResult?.data?.sort || "";
      setValue("sort", sortValue);
      setDropdownValues((prev) => ({ ...prev, sort: sortValue }));
    } catch (error) {
      console.error("Error loading sort:", error);
    }
  };
  useEffect(() => {
    if (com_invoice) {
      loadSortFromInvoice(com_invoice);
    }
  }, [com_invoice]);
  // Load data when com_invoice + sort changes
  useEffect(() => {
    if (com_invoice && sort) {
      loadDataFromInvoiceSort(com_invoice, sort);
    }
  }, [com_invoice, sort]);

  const loadDataFromInvoiceSort = async (invoice, sortValue) => {
    try {
      const allow =
        auth?.find((item) => item.field === "query_level")?.title || "1";

      const [peiceResult, grossResult] = await Promise.all([
        fetchFieldDropdownByIMT(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          "qty_of_pieces",
          invoice,
          sortValue,
          "1",
          "10",
          "",
        ),
        fetchFieldDropdownByIMT(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          "gross_weight",
          invoice,
          sortValue,
          "1",
          "10",
          "",
        ),
      ]);

      setValue("peice", peiceResult?.data[0]?.qty_of_pieces || 0);
      setValue("gross", grossResult?.data[0]?.gross_weight || 0);
    } catch (error) {
      console.error("Error loading data from invoice + sort:", error);
    }
  };

  // Load stoc_type when d_type changes
  useEffect(() => {
    if (d_type && open) {
      loadStocType(d_type);
    }
  }, [d_type, open]);

  const loadStocType = async (dtype) => {
    try {
      const allow =
        auth?.find((item) => item.field === "query_level")?.title || "1";

      const stocTypeResult = await fetchFieldDropdownByASB(
        user?.factory,
        user?.department,
        user?.user_code,
        allow,
        "stoc_type",
        dtype,
        "1",
        "1",
        "",
      );
      setValue("stoc_type", stocTypeResult?.data[0]?.stoc_type || "");
      setDropdownValues((prev) => ({
        ...prev,
        stoc_type: stocTypeResult?.data[0]?.stoc_type || "",
      }));
    } catch (error) {
      console.error("Error loading stoc_type:", error);
    }
  };

  // Auto-generate ac_chgeno when ac_chgs/ac_chgn/ac_chgo change
  useEffect(() => {
    if (!ac_chgs && !ac_chgn && !ac_chgo) {
      setValue("ac_chgeno", "");
      return;
    }

    if (ac_chgs || ac_chgn || ac_chgo) {
      ac_chgeno = `${ac_chgs || ""}/${ac_chgn || ""}/${ac_chgo || ""}`;
      setValue("ac_chgeno", ac_chgeno);
    }
  }, [watch("ac_chgs"), watch("ac_chgn"), watch("ac_chgo")]);
  useEffect(() => {
    // Chỉ check khi có đủ cả 2 giá trị
    if (!ac_chgeno_watch || !out_date_watch) {
      clearErrors("ac_chgeno");
      return;
    }
    // Clear debounce cũ nếu user vẫn đang gõ
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const check = await checkDuplicateAGEO(
          user?.factory,
          user?.department,
          user?.user_code,
          auth?.find((item) => item.field === "query_level")?.title,
          ac_chgeno_watch,
          out_date_watch,
          watch("ac_no"),
        );

        if (!check?.success) {
          hasDuplicateRef.current = true;
          setError("ac_chgeno", {
            type: "manual",
            message:
              check?.message ||
              "AC Change No. already exists in a previous year.",
          });
        } else {
          hasDuplicateRef.current = false;
          clearErrors("ac_chgeno");
        }
      } catch (err) {
        console.error("Debounce check error:", err);
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [ac_chgeno_watch, out_date_watch]);

  // Dropdown callbacks
  const createInContCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow =
          auth?.find((item) => item.field === "query_level")?.title || "1";
        const result = await fetchInContDropdown(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          "cont_no",
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
        console.error("Error fetching in_cont:", error);
        return { data: [], total: 0, pageSize };
      }
    };
  };

  const createBasicDataCallback = (categoryCode) => {
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
          true,
          language
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
        const allow =
          auth?.find((item) => item.field === "query_level")?.title || "1";
        const result = await fetchMinContDropdown(
          user?.factory,
          user?.department,
          user?.user_code,
          allow,
          "cont_no",
          in_cont,
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
  const createComInvoiceCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
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
        console.error("Error fetching min_cont:", error);
        return { data: [], total: 0, pageSize };
      }
    };
  };

  const onSubmit = async (data) => {
    if (hasDuplicateRef.current) {
      setError("ac_chgeno", {
        type: "manual",
        message: watch("ac_chgeno")
          ? `AC Change No. "${watch("ac_chgeno")}" already exists in a previous year.`
          : "AC Change No. already exists in a previous year.",
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
    const controled_fields = ["in_settle", "in_curr", "in_settle"];
    const static_selects = {
      d_type: [
        { d_type: "3", value: "3-Import VN" },
        { d_type: "6", value: "6-Others" },
      ],
      stoc_type: [
        { stoc_type: "1", value: "1-Non-bonded" },
        { stoc_type: "2", value: "2-Bonded" },
        { stoc_type: "3", value: "3-NONE" },
        { stoc_type: "4", value: "4-VAT" },
      ],
    };

    // IN_CONT dropdown
    if (fieldName === "in_cont") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createInContCallback()}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.cont_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({ ...prev, in_cont: value }));
                }}
                select={field.value || dropdownValues.in_cont || ""}
                table="VW_CONT_IMP"
                option="in_cont"
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

    // OUT_TYPE, IN_TYPE dropdown (category 5002)
    if (fieldName === "out_type" || fieldName === "in_type") {
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
                  setDropdownValues((prev) => ({
                    ...prev,
                    [fieldName]: value,
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
              />
            )}
          />
        </Grid>
      );
    }

    // OUT_SETTLE dropdown (category 5001)
    if (fieldName === "out_settle") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createBasicDataCallback("5001")}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.code_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({ ...prev, out_settle: value }));
                }}
                select={field.value || dropdownValues.out_settle || ""}
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
                  setDropdownValues((prev) => ({
                    ...prev,
                    com_invoice: value,
                  }));
                }}
                select={field.value || dropdownValues.com_invoice || ""}
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
    // OUT_CURR dropdown (category 1105)
    if (fieldName === "out_curr") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createBasicDataCallback("1105")}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.code_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({ ...prev, out_curr: value }));
                }}
                select={field.value || dropdownValues.out_curr || ""}
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

    // AC_CHGO, AC_CHGN dropdown (category 5002)
    if (fieldName === "ac_chgo" || fieldName === "ac_chgn") {
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
                  setDropdownValues((prev) => ({
                    ...prev,
                    [fieldName]: value,
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
              />
            )}
          />
        </Grid>
      );
    }

    // MIN_CONT dropdown
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
                  const value = selectedItem?.cont_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({ ...prev, min_cont: value }));
                }}
                select={field.value || dropdownValues.min_cont || ""}
                table="VW_CONT_IMP"
                option="min_cont"
                getControlLabel={getControlLabel}
                language={user?.language || "en"}
                field={getColumnLabel(fieldName, label)}
                totalItems={0}
                pageSize={10}
                disabled={!in_cont}
                helperText={!in_cont ? "Please select In Cont first" : ""}
              />
            )}
          />
        </Grid>
      );
    }

    if (controled_fields.includes(fieldName)) {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <TextField
                fullWidth
                label={getColumnLabel(fieldName, label)}
                InputLabelProps={{ shrink: true }}
                type={type}
                {...field}
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    type === "number" ? Number(e.target.value) : e.target.value,
                  )
                }
                {...extraProps}
              />
            )}
          />
        </Grid>
      );
    }
    if (static_selects[fieldName]) {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <TextField
                select
                fullWidth
                label={getColumnLabel(fieldName, label)}
                InputLabelProps={{ shrink: true }}
                {...field}
                value={field.value || static_selects[fieldName][0][fieldName]}
              >
                {static_selects[fieldName].map((opt) => (
                  <MenuItem key={opt[fieldName]} value={opt[fieldName]}>
                    {opt.value}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
      );
    }
    // Regular text fields
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
              {getControlLabel("ttl_add", "Add AC_PROC_M")}
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
              {renderField("d_type", "D Type", 2.4)}
              {renderField("ac_date", "AC Date", 2.4, {}, "date")}
              {renderField("in_cont", "In Cont", 2.4)}
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={2}>
              {renderField("ac_outer", "AC Outer", 2.4, {})}
              {renderField("rec_addr", "Receive Address", 2.4)}
              {renderField("rec_person", "Receive Person", 2.4, {})}
              {renderField("in_curr", "In Currency", 2.4, {})}
              {renderField("in_crate", "In Currency Rate", 2.4, {}, "number")}
            </Grid>

            {/* Row 3 */}
            <Grid container spacing={2} mb={2}>
              {renderField("in_settle", "In Settle", 2.4, {})}
              {renderField("out_org", "Out Org", 2.4)}
              {renderField("out_type", "Out Type", 2.4)}
              {renderField("out_license", "Out License", 2.4)}
            </Grid>

            {/* Row 4 */}
            <Grid container spacing={2} mb={2}>
              {renderField("out_cont", "Out Cont", 2.4)}
              {renderField("out_vdate", "Out VDate", 2.4, {}, "date")}
              {renderField("in_type", "In Type", 2.4)}
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("in_license", "In License")}
                  InputLabelProps={{ shrink: true }}
                  {...register("in_license")}
                  inputProps={{ readOnly: true }}
                  helperText="From GF_PARAM_VALUE"
                />
              </Grid>
              {renderField("in_date", "In Date", 2.4, {}, "date")}
            </Grid>

            {/* Row 5 */}
            <Grid container spacing={2} mb={2}>
              {renderField("in_vdate", "In VDate", 2.4, {}, "date")}
              {renderField("vat_invoice", "VAT Invoice", 2.4)}
              {renderField("com_invoice", "Com Invoice", 2.4)}
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("sort", "Sort")}
                  InputLabelProps={{ shrink: true }}
                  {...register("sort")}
                  inputProps={{ readOnly: true }}
                  helperText="Auto from invoice"
                />
              </Grid>
            </Grid>

            {/* Row 6 */}
            <Grid container spacing={2} mb={2}>
              {renderField("out_settle", "Out Settle", 2.4)}
              {renderField("out_curr", "Out Currency", 2.4)}
              {renderField("out_crate", "Out Currency Rate", 2.4, {}, "number")}
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("tax", "Tax")}
                  type="number"
                  InputLabelProps={{ shrink: true }}
                  {...register("tax", { valueAsNumber: true })}
                  disabled
                  helperText="Auto calculated"
                />
              </Grid>
              {/*  {renderField("oth_cost", "Other Cost", 2.4, {}, "number")}*/}
            </Grid>

            {/* Row 7 */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("add_tax", "Add Tax")}
                  type="number"
                  InputLabelProps={{ shrink: true }}
                  {...register("add_tax", { valueAsNumber: true })}
                  disabled
                  helperText="Auto calculated"
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("peice", "Piece")}
                  type="number"
                  InputLabelProps={{ shrink: true }}
                  {...register("peice", { valueAsNumber: true })}
                  inputProps={{ readOnly: true }}
                  helperText="From invoice + sort"
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("sum_qty", "Sum Quantity")}
                  type="number"
                  InputLabelProps={{ shrink: true }}
                  {...register("sum_qty", { valueAsNumber: true })}
                  inputProps={{ readOnly: true }}
                  helperText="Auto calculated"
                />
              </Grid>
              {/*  {renderField("suttle", "Suttle", 2.4, {}, "number")}*/}
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("gross", "Gross")}
                  type="number"
                  InputLabelProps={{ shrink: true }}
                  {...register("gross", { valueAsNumber: true })}
                  inputProps={{ readOnly: true }}
                  helperText="From invoice + sort"
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("sum_money", "Sum Money")}
                  type="number"
                  InputLabelProps={{ shrink: true }}
                  {...register("sum_money", { valueAsNumber: true })}
                  inputProps={{ readOnly: true }}
                  helperText="Auto calculated"
                />
              </Grid>
            </Grid>

            {/* Row 8 */}
            <Grid container spacing={2} mb={2}>
              {renderField("out_date", "Out Date", 2.4, {}, "date")}
              {renderField("ac_chgeno", "AC CHGENO", 2.4, {
                error: !!errors.ac_chgeno,
                helperText: errors.ac_chgeno?.message || "",
              })}
              {renderField("ex_user", "Ex User", 2.4)}
              {renderField("col1", "Col1 (Seller Tax)", 2.4)}
              {renderField("col2", "Col2 (Cancel Doc)", 2.4)}
              {/*  {renderField("col3", "Col3", 2.4)}*/}
              {/*   {renderField("col4", "Col4", 2.4)}*/}
            </Grid>

            {/* Row 12 */}
            <Grid container spacing={2} mb={2}>
              {renderField("com_date", "Com Date", 2.4, {}, "date")}
              {renderField("vat_date", "VAT Date", 2.4, {}, "date")}
              {renderField("min_cont", "Min Cont (Annex)", 2.4)}
              {renderField("js_no", "JS No", 2.4)}
              {renderField("js_date", "JS Date", 2.4, {}, "date")}
              {renderField("soso", "SOSO", 2.4)}
              {renderField("stoc_type", "Stock Type", 2.4)}
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("mark", "Mark")}
                  InputLabelProps={{ shrink: true }}
                  {...register("mark")}
                  inputProps={{ readOnly: true }}
                  helperText="Fixed: A"
                  value="A"
                />
              </Grid>
              {/*    {renderField("complete_type", "Complete Type", 2.4)}*/}
              {/*    {renderField("ac_type", "AC Type", 2.4)}*/}
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
export default AddAcProcM;
