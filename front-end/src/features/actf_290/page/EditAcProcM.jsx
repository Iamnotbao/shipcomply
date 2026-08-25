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
  fetchBankDropDown,
  fetchFieldByPoVenderMDropDown,
} from "../../../service/ac_cont_m/AcContMService";
import {
  fetchFieldDropdown,
  fetchInContDropdown,
  fetchMinContDropdown,
} from "../../../service/vw_cont_imp/VwContImpService";
import {
  fetchFieldDropdownByIMT,
  getCol4,
  getComInvoice,
  getSort,
} from "../../../service/ac_imp_material_tracking/AcImpMaterialTrackingService";
import { fetchFieldDropdownByASB } from "../../../service/ac_send_base/AcSendBaseService";
import { getSum } from "../../../service/ac_proc_d/AcProcDService";

const EditAcProcM = ({
  open,
  onClose,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  selectedRow,
  language,
  isEditInCurrate,
}) => {
  const { register, handleSubmit, reset, setValue, control, watch } = useForm({
    defaultValues: {
      factory_code: "",
      ac_no: "",
      d_type: "1",
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
      out_crate: 0,
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
      mark: "B",
      vend_no: "",
      status: 1,
    },
  });

  const [dropdownValues, setDropdownValues] = useState({
    d_type: "1",
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
    vend_no: "",
  });

  const d_type = watch("d_type");
  const vend_no = watch("vend_no");
  const in_cont = watch("in_cont");
  const com_invoice = watch("com_invoice");
  const sort = watch("sort");
  const ac_chgs = watch("ac_chgs");
  const ac_chgn = watch("ac_chgn");
  const ac_chgo = watch("ac_chgo");
  const prevInContRef = useRef("");
  useEffect(() => {
    if (open && selectedRow) {
      // Load data từ selectedRow vào form
      Object.keys(selectedRow).forEach((key) => {
        setValue(key, selectedRow[key] || "");
      });

      // Set dropdown values
      setDropdownValues({
        d_type: selectedRow.d_type || "1",
        in_cont: selectedRow.in_cont || "",
        out_type: selectedRow.out_type || "",
        in_type: selectedRow.in_type || "",
        com_invoice: selectedRow.com_invoice || "",
        sort: selectedRow.sort || "",
        out_settle: selectedRow.out_settle || "",
        out_curr: selectedRow.out_curr || "",
        ac_chgo: selectedRow.ac_chgo || "",
        ac_chgn: selectedRow.ac_chgn || "",
        min_cont: selectedRow.min_cont || "",
        stoc_type: selectedRow.stoc_type || "1",
        vend_no: selectedRow.vend_no || "",
      });

      // Load sum data (tax, add_tax, sum_money, sum_qty)
      loadSumData(selectedRow.ac_no);
    } else if (!open) {
      reset();
      setDropdownValues({
        d_type: "1",
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
        vend_no: "",
      });
    }
  }, [open, selectedRow, reset, setValue]);
  useEffect(() => {
    if (in_cont && open && in_cont !== prevInContRef.current) {
      prevInContRef.current = in_cont;
      loadDataFromInCont(in_cont);
    }
  }, [in_cont, open]);
  // Load sum data
  const loadSumData = async (ac_no) => {
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
            "ac_qty",
            ac_no,
          ),
        ]);

      setValue("tax", taxResult?.data || 0);
      setValue("add_tax", addTaxResult?.data || 0);
      setValue("sum_money", sumMoneyResult?.data || 0);
      setValue("sum_qty", sumQtyResult?.data || 0);
    } catch (error) {
      console.error("Error loading sum data:", error);
    }
  };

  const loadDataFromInCont = async (contNo) => {
    try {
      const allow =
        auth?.find((item) => item.field === "query_level")?.title || "1";

      const [acOuter, recPerson, inCurr] = await Promise.all([
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
      ]);

      setValue("ac_outer", acOuter?.data?.s_addr || "");
      setValue("rec_person", recPerson?.data?.p_seller || "");
      setValue("in_curr", inCurr?.data?.currency || "");
    } catch (error) {
      console.error("Error loading data from in_cont:", error);
    }
  };

  // Load data when com_invoice changes
  useEffect(() => {
    if (com_invoice && open) {
      loadDataFromComInvoice(com_invoice);
    }
  }, [com_invoice]);

  const loadDataFromComInvoice = async (com_invoice) => {
    try {
      const allow =
        auth?.find((item) => item.field === "query_level")?.title || "1";

      const stocTypeResult = await getCol4(
        user?.factory,
        "vend_no",
        vend_no,
        com_invoice,
        user?.department,
        user?.user_code,
        allow,
      );
      setValue("col4", stocTypeResult?.data?.invoice_id || "");
    } catch (error) {
      console.error("Error loading col4:", error);
    }
  };

  // Load data when com_invoice + sort changes
  useEffect(() => {
    if (com_invoice && sort && open) {
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

      // setValue("peice", peiceResult?.data?.peice || 0);
      // setValue("gross", grossResult?.data?.gross || 0);
    } catch (error) {
      console.error("Error loading data from invoice + sort:", error);
    }
  };

  // Load stoc_type when d_type changes
  useEffect(() => {
    if (d_type && open) {
      loadStocType(d_type);
    }
  }, [d_type]);

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
        "10",
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

  // Auto-generate ac_chgeno
  useEffect(() => {
    if (ac_chgs || ac_chgn || ac_chgo) {
      const ac_chgeno = `${ac_chgs || ""}/${ac_chgn || ""}/${ac_chgo || ""}`;
      setValue("ac_chgeno", ac_chgeno);
    }
  }, [ac_chgs, ac_chgn, ac_chgo]);

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
          "B",
          vend_no,
          d_type,
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

  const createVendNoCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchFieldByPoVenderMDropDown(
          user?.access_token,
          user?.factory,
          "",
          "",
          "",
          user.department,
          user?.user_code,
          auth?.find((item) => item.field === "query_level")?.title,
          "vend_no",
          page,
          pageSize,
          searchText,
          language,
        );
        return {
          data: result?.data || [],
          total: result?.total || 0,
          pageSize: result?.pageSize || pageSize,
        };
      } catch (error) {
        console.error("Error fetching vend_no:", error);
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
          "vend_no",
          vend_no,
          user?.department,
          "",
          "",
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
  const onSubmit = (data) => {
    const numericFields = [
      "out_crate",
      "in_crate",
      "tax",
      "add_tax",
      "oth_cost",
      "peice",
      "sum_qty",
      "suttle",
      "gross",
      "sum_money",
      "out_crate",
    ];
    const cleaned = { ...data };
    numericFields.forEach((field) => {
      if (cleaned[field] === "" || isNaN(cleaned[field])) {
        cleaned[field] = null;
      }
    });
    handleEdit(cleaned);
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
    const controled_fields = ["in_settle", "in_curr"];
    const static_selects = {
      d_type: [
        { d_type: "1", value: "1-Local VAT" },
        { d_type: "5", value: "5-None" },
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
                field={"in_cont"}
                totalItems={0}
                pageSize={10}
              />
            )}
          />
        </Grid>
      );
    }

    // SORT dropdown (category 5008)
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

    // VEND_NO dropdown
    if (fieldName === "vend_no") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createVendNoCallback()}
                onSelect={(selectedItem) => {
                  const displayValue = selectedItem
                    ? `${selectedItem.vend_no || ""}-${selectedItem.vend_name || ""}`
                    : "";
                  const saveValue = selectedItem?.vend_no || "";
                  field.onChange(saveValue);
                  setDropdownValues((prev) => ({
                    ...prev,
                    vend_no: displayValue,
                    vend_no_save: saveValue,
                  }));
                }}
                select={dropdownValues.vend_no || ""}
                table="PO_VENDER_M"
                option="po_vender_m"
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

    // COM_INVOICE
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
    <Dialog open={open} onClose={() => onClose(null)} maxWidth="lg" fullWidth>
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
              {getControlLabel("ttl_edit", "Edit AC_PROC_M")}
            </Typography>
            <Button onClick={()=>onClose(null)} variant="contained" color="error">
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
                  {...register("factory_code")}
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
                />
              </Grid>
              {renderField("d_type", "D Type", 2.4)}
              {renderField("ac_date", "AC Date", 2.4, {}, "date")}
              {renderField("in_cont", "In Cont", 2.4)}
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={2}>
              {renderField("vend_no", "Vend No", 2.4)}
              {renderField("ac_outer", "AC Outer", 2.4, {})}
              {renderField("rec_addr", "Receive Address", 2.4)}
              {renderField("rec_person", "Receive Person", 2.4, {})}
            </Grid>

            {/* Row 3 */}
            <Grid container spacing={2} mb={2}>
              {renderField("in_curr", "In Currency", 2.4, {})}
              {renderField(
                "in_crate",
                "In Currency Rate",
                2.4,
                {
                  disabled: isEditInCurrate ? false : true,
                },
                "number",
              )}
              {/*   {renderField("in_settle", "In Settle", 2.4, { inputProps: { readOnly: true } })}*/}
              {renderField("out_org", "Out Org", 2.4)}
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
              {/*   {renderField("out_type", "Out Type", 2.4, { inputProps: { readOnly: true } })}
              {renderField("out_license", "Out License", 2.4)}
              {renderField("out_date", "Out Date", 2.4, {}, "date")}*/}
            </Grid>

            {/* Row 5 */}
            <Grid container spacing={2} mb={2}>
              {/*    {renderField("in_vdate", "In VDate", 2.4, {}, "date")} */}
              {/*    {renderField("vat_invoice", "VAT Invoice", 2.4)}*/}
              {renderField("com_invoice", "Com Invoice", 2.4)}
              {renderField("sort", "Sort", 2.4)}
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("tax", "Tax")}
                  type="number"
                  InputLabelProps={{ shrink: true }}
                  {...register("tax", { valueAsNumber: true })}
                  inputProps={{ readOnly: true }}
                  helperText="Auto calculated"
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("add_tax", "Add Tax")}
                  type="number"
                  InputLabelProps={{ shrink: true }}
                  {...register("add_tax", { valueAsNumber: true })}
                  inputProps={{ readOnly: true }}
                  helperText="Auto calculated"
                />
              </Grid>
              {/* {renderField("out_settle", "Out Settle", 2.4, { inputProps: { readOnly: true } })}*/}
            </Grid>

            {/* Row 7 */}
            <Grid container spacing={2} mb={2}>
              {/*   <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("peice", "Piece")}
                  type="number"
                  InputLabelProps={{ shrink: true }}
                  {...register("peice", { valueAsNumber: true })}
                  inputProps={{ readOnly: true }}
                  helperText="From invoice + sort"
                />
              </Grid>*/}
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
              {/*<Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("gross", "Gross")}
                  type="number"
                  InputLabelProps={{ shrink: true }}
                  {...register("gross", { valueAsNumber: true })}
                  inputProps={{ readOnly: true }}
                  helperText="From invoice + sort"
                />
              </Grid>*/}
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
              {renderField("col1", "Col1 (Seller Tax)", 2.4)}
              {renderField("col2", "Col2 (Cancel Doc)", 2.4)}
              {/*     {renderField("col3", "Col3", 2.4)}*/}
              {renderField("col4", "Col4", 2.4)}
            </Grid>

            {/* Row 12 */}
            <Grid container spacing={2} mb={2}>
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
                  helperText="Fixed: B"
                  value="B"
                />
              </Grid>
              {/*   {renderField("complete_type", "Complete Type", 2.4)}*/}
              {/*  {renderField("ac_type", "AC Type", 2.4)}*/}
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

export default EditAcProcM;
