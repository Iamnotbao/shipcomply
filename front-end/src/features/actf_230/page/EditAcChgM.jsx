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
  fetchFieldDropdown,
  fetchMinContDropdown,
  getContno,
} from "../../../service/vw_cont_exp/VwContExp";
import { getSum } from "../../../service/ac_chg_d/acChgD";
import { getComInvoice } from "../../../service/ac_imp_material_tracking/AcImpMaterialTrackingService";
import { checkDuplicateAGO } from "../../../service/ac_chg_m/acChgM";

const EditAcChgExp = ({
  open,
  onClose,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  selectedRow,
  isEditInCurrate,
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
  } = useForm({});

  const [dropdownValues, setDropdownValues] = useState({
    d_type: "1",
    cont_no: "",
    com_invoice: "",
    chg_type: "",
    trade: "",
    min_cont: "",
    in_country: "",
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
  const cont_no = watch("cont_no");
  const d_type = watch("d_type");

  useEffect(() => {
    if (open && selectedRow) {
      reset({
        ...selectedRow,
        d_type: selectedRow.d_type || "1",
      });

      setDropdownValues({
        d_type: selectedRow.d_type || "1",
        cont_no: selectedRow.cont_no || "",
        com_invoice: selectedRow.com_invoice || "",
        chg_type: selectedRow.chg_type || "",
        trade: selectedRow.trade || "",
        min_cont: selectedRow.min_cont || "",
        in_country: selectedRow.in_country || "",
        sort: selectedRow.sort || "",
      });

      loadSumData(selectedRow.ac_no);
    } else if (!open) {
      reset({});
      setDropdownValues({
        d_type: "1",
        cont_no: "",
        com_invoice: "",
        chg_type: "",
        trade: "",
        min_cont: "",
        in_country: "",
        sort: "",
      });
    }
  }, [open, selectedRow, reset]);

  const loadSumData = async (ac_no) => {
    try {
      const [tax, sumMoney] = await Promise.all([
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
          "money",
          ac_no,
        ),
      ]);
      setValue("tax", tax?.data || 0);
      setValue("sum_money", sumMoney?.data || 0);
    } catch (error) {
      console.error("Error loading sum data:", error);
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

  // Auto-generate ac_chgno
  useEffect(() => {
    if (ac_chgs || ac_chgn || ac_chgo) {
      setValue(
        "ac_chgno",
        `${ac_chgs || ""}/${ac_chgn || ""}/${ac_chgo || ""}`,
      );
    }
  }, [watch("ac_chgs"), watch("ac_chgn"), watch("ac_chgo")]);
  useEffect(() => {
    if (!ac_chgno_watch || !out_date_watch) {
      clearErrors("ac_chgno");
      return;
    }

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
  // Auto pass_date from out_date
  useEffect(() => {
    const out_date = watch("out_date");
    if (out_date) {
      setValue("pass_date", new Date(out_date).toISOString().split("T")[0]);
    }
  }, [watch("out_date")]);

  useEffect(() => {
    if (cont_no) {
      loadDataFromContNo(cont_no);
    }
  }, [cont_no]);

  // ========== HELPERS ==========
  const handleDecimalInput =
    (decimals = 8) =>
    (e) => {
      e.target.value = e.target.value.replace(
        new RegExp(`(\\.\\d{${decimals}})\\d+`),
        "$1",
      );
    };

  // ========== CALLBACKS ==========
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
        const result = await getContno(
          user?.factory,
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
        console.error("Error fetching cont_no:", error);
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
        console.error("Error fetching com_invoice:", error);
        return { data: [], total: 0, pageSize };
      }
    };
  };

  // 5. Cập nhật onSubmit
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
    handleEdit(data);
  };

  // ========== RENDER FIELD ==========
  const renderField = (
    fieldName,
    label,
    gridSize = 3,
    extraProps = {},
    type = "text",
  ) => {
    // CONT_NO - Dropdown
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
                  setDropdownValues((prev) => ({ ...prev, cont_no: value }));
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

    // COM_INVOICE - Dropdown
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

    // D_TYPE - Static select
    if (fieldName === "d_type") {
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
              >
                <MenuItem value="1">{getControlLabel("ddl_d_type_1", "1-外銷")}</MenuItem>
                <MenuItem value="2">{getControlLabel("ddl_d_type_2", "2-內銷")}</MenuItem>
              </TextField>
            )}
          />
        </Grid>
      );
    }

    // CHG_TYPE
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
       // OUT_PORT
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
    // TRADE
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

    // SORT
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

    // IN_COUNTRY
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
          label={getColumnLabel(fieldName, label)}
          type={type}
          InputLabelProps={{ shrink: true }}
          inputProps={
            type === "number"
              ? {
                  step: fieldName === "curr_rate" ? "0.00000001" : "0.0001",
                  min: 0,
                  onChange:
                    fieldName === "curr_rate"
                      ? handleDecimalInput(8)
                      : handleDecimalInput(4),
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
              {getControlLabel("ttl_edit", "Edit AC_CHG_EXP")}
            </Typography>
            <Button onClick={()=>onClose(null)} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Row 1: factory_code, ac_no, out_date, d_type, ac_chgs */}
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
              {renderField("out_date", "Out Date", 2.4, {}, "date")}
              {renderField("d_type", "D Type", 2.4)}
            </Grid>

            {/* Row 2: ac_chgn, ac_chgo, ac_chgno, ac_unit, ac_addr */}
            <Grid container spacing={2} mb={2}>
              {renderField("ac_chgno", "AC CHG No", 2.4, {
                error: !!errors.ac_chgno,
                helperText: errors.ac_chgno?.message || "Auto: CHGS/CHGN/CHGO",
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
                  inputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("ac_addr", "AC Address")}
                  InputLabelProps={{ shrink: true }}
                  {...register("ac_addr")}
                  inputProps={{ readOnly: true }}
                />
              </Grid>
              {renderField("pass_date", "Pass Date", 2.4, {}, "date")}
            </Grid>

            {/* Row 3: cont_no, min_cont, org_tax, ac_bom, org_addr, com_invoice, cust_tax, ac_row */}
            <Grid container spacing={2} mb={2}>
              {renderField("cont_no", "Cont No", 2.4)}
              {renderField("min_cont", "Min Cont", 2.4)}
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("org_tax", "Org Tax")}
                  InputLabelProps={{ shrink: true }}
                  {...register("org_tax")}
                  inputProps={{ readOnly: true }}
                />
              </Grid>
              {renderField("ac_bom", "AC BOM", 2.4, {
                inputProps: { readOnly: true },
              })}
              {renderField("org_addr", "Org Address", 2.4, {
                inputProps: { readOnly: true },
              })}
              {renderField("com_invoice", "Com Invoice", 2.4)}
              {renderField("cust_tax", "Customer Tax", 2.4, {
               
              })}
              {renderField("ac_row", "AC Row", 2.4, {
                inputProps: { readOnly: true },
              })}
            </Grid>

            {/* Row 4: cust_addr, rec_addr, agent_make, chg_type */}
            <Grid container spacing={2} mb={2}>
              {renderField("cust_addr", "Customer Address", 2.4, {
                inputProps: { readOnly: true },
              })}
              {renderField("rec_addr", "Receive Address", 2.4, {
                
              })}
              {renderField("agent_make", "Agent Make", 2.4)}
              {renderField("chg_type", "Charge Type", 2.4)}
            </Grid>

            {/* Row 5: sort, trans_type, out_port, curr_no */}
            <Grid container spacing={2} mb={2}>
              {renderField("sort", "Sort", 2.4, {
                inputProps: { readOnly: true },
              })}
              {renderField("trans_type", "Transport Type", 2.4)}
              {renderField("out_port", "Out Port", 2.4)}
              {renderField("curr_no", "Currency No", 2.4, {
                inputProps: { readOnly: true },
              })}
            </Grid>

            {/* Row 6: curr_rate, payment, tax, peice, gross */}
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
                  disabled: isEditInCurrate ? false : true,
                },
                "number",
              )}
              {renderField("payment", "Payment", 2.4, {
                inputProps: { readOnly: true },
              })}
              {renderField(
                "tax",
                "Tax",
                2.4,
                { inputProps: { readOnly: true } },
                "number",
              )}
              {renderField("peice", "Piece", 2.4, {}, "number")}
              {renderField("gross", "Gross", 2.4, {}, "number")}
            </Grid>

            {/* Row 7: sum_money, trade, in_country, old_no, pass_date */}
            <Grid container spacing={2} mb={2}>
              {renderField(
                "sum_money",
                "Sum Money",
                2.4,
                { inputProps: { readOnly: true } },
                "number",
              )}
              {renderField("trade", "Trade", 2.4)}
              {renderField("in_country", "In Country", 2.4)}
              {renderField("old_no", "Old No", 2.4)}
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

export default EditAcChgExp;
