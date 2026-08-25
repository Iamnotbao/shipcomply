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
} from "../../../service/vw_cont_imp/VwContImpService";
import { fetchFieldDropdownByASB } from "../../../service/ac_send_base/AcSendBaseService";
import { getSum } from "../../../service/ac_chg_d/acChgD";
import {
  fetchFieldDropdownByIMT,
  getComInvoice,
  getSort,
} from "../../../service/ac_imp_material_tracking/AcImpMaterialTrackingService";
import { checkDuplicateAGO } from "../../../service/ac_chg_m/acChgM";

const EditAcChgM = ({
  open,
  onClose,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  selectedRow,
  isEditInCurrate,
  language='en'
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
  console.log("isEditable",isEditInCurrate);
  
  const [dropdownValues, setDropdownValues] = useState({
    d_type: "2",
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
    if (open && selectedRow) {
      // Reset form với data từ selectedRow
      reset({
        ...selectedRow,
        d_type: selectedRow.d_type || "2",
      });

      // Set dropdown values
      setDropdownValues({
        d_type: selectedRow.d_type || "2",
        cont_no: selectedRow.cont_no || "",
        com_invoice: selectedRow.com_invoice || "",
        chg_type: selectedRow.chg_type || "",
        license: selectedRow.license || "",
        in_port: selectedRow.in_port || "",
        unload_port: selectedRow.unload_port || "",
        trade: selectedRow.trade || "",
        min_cont: selectedRow.min_cont || "",
        out_country: selectedRow.out_country || "",
        b_unit: selectedRow.b_unit || "",
        stoc_type: selectedRow.stoc_type || "",
      });

      // Load sum data (tax, add_tax, sum_money)
      loadSumData(selectedRow.ac_no);
    } else if (!open) {
      // Reset về giá trị mặc định khi đóng dialog
      reset({
        factory_code: "",
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
        status: "1",
      });

      setDropdownValues({
        d_type: "2",
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
  }, [open, selectedRow, reset]);

  // Load sum data (tax, add_tax, sum_money)
  const loadSumData = async (ac_no) => {
    try {
      const [tax, addTax, sumMoney] = await Promise.all([
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
      ]);

      setValue("tax", tax?.data || 0);
      setValue("add_tax", addTax?.data|| 0);
      setValue("sum_money", sumMoney?.data|| 0);
    } catch (error) {
      console.error("Error loading sum data:", error);
    }
  };
  const loadDataFromInvoice = async (sort, invoice) => {
    try {
      const [
        arrDate,
        deliver,
        transDate,
        inPort,
        unLoadPort,
        peice,
        gross,
        outCountry,
        bUnit,
      ] = await Promise.all([
        fetchFieldDropdownByIMT(
          user?.factory,
          user?.department,
          user?.user_code,
          auth?.find((item) => item.field === "query_level")?.title,
          "estimated_arrival_date",
          invoice,
          sort,
          "1",
          "10",
          "",
        ),
        fetchFieldDropdownByIMT(
          user?.factory,
          user?.department,
          user?.user_code,
          auth?.find((item) => item.field === "query_level")?.title,
          "b_l",
          invoice,
          sort,
          "1",
          "10",
          "",
        ),
        fetchFieldDropdownByIMT(
          user?.factory,
          user?.department,
          user?.user_code,
          auth?.find((item) => item.field === "query_level")?.title,
          "estimated_delivery_date",
          invoice,
          sort,
          "1",
          "10",
          "",
        ),
        fetchFieldDropdownByIMT(
          user?.factory,
          user?.department,
          user?.user_code,
          auth?.find((item) => item.field === "query_level")?.title,
          "loading_port",
          invoice,
          sort,
          "1",
          "10",
          "",
        ),
        fetchFieldDropdownByIMT(
          user?.factory,
          user?.department,
          user?.user_code,
          auth?.find((item) => item.field === "query_level")?.title,
          "unloading_port",
          invoice,
          sort,
          "1",
          "10",
          "",
        ),
        fetchFieldDropdownByIMT(
          user?.factory,
          user?.department,
          user?.user_code,
          auth?.find((item) => item.field === "query_level")?.title,
          "qty_of_pieces",
          invoice,
          sort,
          "1",
          "10",
          "",
        ),
        fetchFieldDropdownByIMT(
          user?.factory,
          user?.department,
          user?.user_code,
          auth?.find((item) => item.field === "query_level")?.title,
          "gross_weight",
          invoice,
          sort,
          "1",
          "10",
          "",
        ),
        fetchFieldDropdownByIMT(
          user?.factory,
          user?.department,
          user?.user_code,
          auth?.find((item) => item.field === "query_level")?.title,
          "shipside",
          invoice,
          sort,
          "1",
          "10",
          "",
        ),
        fetchFieldDropdownByIMT(
          user?.factory,
          user?.department,
          user?.user_code,
          auth?.find((item) => item.field === "query_level")?.title,
          "packaging_unit",
          invoice,
          sort,
          "1",
          "10",
          "",
        ),
      ]);
      setValue("deliver", deliver?.data[0]?.b_l || "");
      setValue("trans_date", transDate?.data[0]?.estimated_delivery_date || "");
      setValue("in_port", inPort?.data[0]?.loading_port || "");
      setValue("unload_port", unLoadPort?.data[0]?.unloading_port || "");
      setValue("peice", peice?.data[0]?.qty_of_pieces || "");
      setValue("gross", gross?.data[0]?.gross_weight || "");
      setValue("out_country", outCountry?.data[0]?.shipside || "");
      setValue("b_unit", bUnit?.data[0]?.packaging_unit || "");
      setDropdownValues((prev) => ({
        ...prev,
        arr_date: arrDate?.estimated_arrival_date || "",
        deliver: deliver?.b_l || "",
        trans_date: transDate?.estimated_delivery_date || "",
        in_port: inPort?.loading_port || "",
        unload_port: unLoadPort?.unloading_port || "",
        out_country: outCountry?.shipside || "",
        b_unit: bUnit?.b_unit || "",
        peice: peice?.qty_of_pieces || "",
        gross: gross?.gross_weight || "",
      }));
    } catch (error) {
      console.error("Error loading data from invoice:", error);
    }
  };
  const loadDataFromContNo = async (contNo) => {
    try {
      const [orgAddr, custAddr, currNo, payment, vendNo] = await Promise.all([
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
          "vend_no",
          contNo,
          "1",
          "10",
          "",
        ),
      ]);
      setValue("org_addr", orgAddr?.data?.b_addr || "");
      setValue("cust_addr", custAddr?.data?.s_addr || "");
      setValue("rec_addr", custAddr?.data?.s_addr || "");
      setValue("curr_no", currNo?.data?.currency || "");
      setValue("payment", payment?.data?.pay_term || "");
      if (vendNo?.vend_no) {
        const venderResult = await fetchFieldByPoVenderMDropDown(
          user?.access_token,
          user?.factory,
          "",
          "",
          false,
          user?.department,
          user?.user_code,
          allow,
          "tax_code",
          page,
          pageSize,
          searchText,
        );
        setValue("cust_tax", venderResult?.data?.vend_no || "");
      }
    } catch (error) {
      console.error("Error loading data from cont_no:", error);
    }
  };
  const fetchSort = async (invoice) => {
    const sortResult = await getSort(
      user?.factory,
      invoice,
      user?.department,
      user?.user_code,
      auth?.find((item) => item.field === "query_level")?.title,
    );
    const sort = sortResult?.data?.sort || "";
    setValue("sort", sort);
    setDropdownValues((prev) => ({ ...prev, sort }));
    loadDataFromInvoice(sort, invoice);
  };
  const fetchStocType = async (d_type) => {
    const sortResult = await fetchFieldDropdownByASB(
      user?.factory,
      user?.department,
      user?.user_code,
      auth?.find((item) => item.field === "query_level")?.title,
      "stoc_type",
      d_type,
      "1",
      "1",
      "",
    );
    const stoc_type = sortResult?.data[0]?.stoc_type || "";
    setValue("stoc_type", stoc_type);
    setAutoFields((prev) => ({ ...prev, stoc_type }));
    setDropdownValues((prev) => ({ ...prev, stoc_type }));
  };
  // Auto-generate ac_chgno when ac_chgs/ac_chgn/ac_chgo change
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
        );

        if (!check?.success) {
          hasDuplicateRef.current = true;
          setError("ac_chgno", {
            type: "manual",
            message:
              check?.message ||
              "AC Change No. already exists in a previous year.",
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
  useEffect(() => {
    if (com_invoice) {
      fetchSort(com_invoice);
    }
  }, [com_invoice]);
  useEffect(() => {
    if (d_type && open) {
      fetchStocType(d_type);
    }
  }, [d_type, open]);
  // ========== CALLBACK FUNCTIONS ==========
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
        console.error("Error fetching cont_no:", error);
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
        console.error("Error fetching com_invoice:", error);
        return { data: [], total: 0, pageSize };
      }
    };
  };
  const createChgTypeCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";

        const result = await fetchBasicDataDropDownByCate(
          user?.factory,
          "5002",
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
        console.error("Error fetching chg_type:", error);
        return { data: [], total: 0, pageSize };
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

  // Submit form
const onSubmit = async (data) => {
  if (hasDuplicateRef.current) {
    setError("ac_chgno", {
      type: "manual",
      message: watch("ac_chgno") 
        ? `AC Change No. "${watch("ac_chgno")}" already exists in a previous year.`
        : "AC Change No. already exists in a previous year.",
    });
    return;
  }

  handleEdit(data);
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
    const static_selects = {
      d_type: [
        { d_type: "2", value: "2-Direct Import" },
        { d_type: "4", value: "4-Direct Imp A12" },
        { d_type: "6", value: "6-Others" },
      ],
      stoc_type: [
        { stoc_type: "1", value: "1-Non-bonded" },
        { stoc_type: "2", value: "2-Bonded" },
        { stoc_type: "3", value: "3-NONE" },
        { stoc_type: "4", value: "4-VAT" },
      ],
    };
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
                table="VW_CONT_IMP"
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
    // CHG_TYPE (category 5002)
    if (fieldName === "chg_type") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createChgTypeCallback()}
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
                table="VW_CONT_IMP"
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

    // OUT_COUNTRY (category 5006)
    if (fieldName === "out_country") {
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
                  setDropdownValues((prev) => ({
                    ...prev,
                    out_country: value,
                  }));
                }}
                select={field.value || dropdownValues.out_country || ""}
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
    // B_UNIT (category 1008)
    if (fieldName === "b_unit") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createBasicDataCallback("1108")}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.code_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({
                    ...prev,
                    b_unit: value,
                  }));
                }}
                select={field.value || dropdownValues.b_unit || ""}
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
    <Dialog open={open} onClose={() => onClose(null)} maxWidth="xl" fullWidth>
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
              {getControlLabel("ttl_edit", "Edit AC_CHG_M")}
            </Typography>
            <Button onClick={() => onClose(null)} variant="contained" color="error">
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
              {renderField("cont_no", "Cont No", 2.4, {
                disabled: true,
              })}
              {renderField("d_type", "D Type", 2.4)}
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={2}>
              {/* {renderField("ac_chgs", "AC CHGS", 2.4)}
              {renderField("ac_chgn", "AC CHGN", 2.4)}
              {renderField("ac_chgo", "AC CHGO", 2.4)} */}
              {renderField("out_date", "Out Date", 2.4, {}, "date")}
             {renderField("ac_chgno", "AC CHGNO", 2.4, {
                error: !!errors.ac_chgno,
                helperText: errors.ac_chgno?.message || "",
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
                />
              </Grid>
            </Grid>

            {/* Row 3 */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("org_tax", "Org Tax")}
                  InputLabelProps={{ shrink: true }}
                  {...register("org_tax")}
                  inputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              {renderField("org_addr", "Org Address", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
              {renderField("cust_tax", "Customer Tax", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
              {renderField("cust_addr", "Customer Address", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
              {renderField("rec_addr", "Receive Address", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
            </Grid>

            {/* Row 4 */}
            <Grid container spacing={2} mb={2}>
              {renderField("agent_make", "Agent Make", 2.4)}
              {renderField("chg_type", "Charge Type", 2.4)}
              {renderField("license", "License", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
              {renderField(
                "lic_date",
                "License Date",
                2.4,
                {
                  inputProps: {
                    readOnly: true,
                  },
                },
                "date",
              )}
              {renderField(
                "lic_edate",
                "License End Date",
                2.4,
                {
                  inputProps: {
                    readOnly: true,
                  },
                },
                "date",
              )}
            </Grid>

            {/* Row 5 */}
            <Grid container spacing={2} mb={2}>
              {renderField("com_invoice", "Com Invoice", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
              {renderField("sort", "Sort", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
              {/*   {renderField("trans_name", "Transport Name", 2.4)}*/}
              {renderField("vehicle_no", "Vehicle No", 2.4)}

              {renderField("arr_date", "Arrival Date", 2.4, {}, "date")}
              {renderField("deliver", "Deliver", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
            </Grid>
            {/* Row 6 */}
            <Grid container spacing={2} mb={2}>
              {renderField("trans_type", "Transport Type", 2.4)}
              {renderField("trans_date", "Transport Date", 2.4, {}, "date")}
              {renderField("in_port", "In Port", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
              {renderField("unload_port", "Unload Port", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
            </Grid>

            {/* Row 7 */}
            <Grid container spacing={2} mb={2}>
              {/* {renderField("out_port", "Out Port", 2.4)}*/}
              {renderField("curr_no", "Currency No", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
              {renderField(
                "curr_rate",
                "Currency Rate",
                2.4,
                {
                  inputProps: {
                    step: "0.00000001",
                    min: 0,
                    onChange: handleDecimalInput(8),
                  },
                  disabled: isEditInCurrate? false : true,
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
            </Grid>

            {/* Row 8 */}
            <Grid container spacing={2} mb={2}>
              {renderField(
                "add_tax",
                "Additional Tax",
                2.4,
                {
                  inputProps: {
                    readOnly: true,
                  },
                },
                "number",
              )}
              {renderField("oth_cost", "Other Cost", 2.4, {}, "number")}
              {renderField(
                "peice",
                "Piece",
                2.4,
                {
                  inputProps: {
                    readOnly: true,
                  },
                },
                "number",
              )}
              {/*  {renderField("sum_qty", "Sum Quantity", 2.4, {}, "number")} */}
              {renderField("suttle", "Suttle", 2.4, {}, "number")}
            </Grid>

            {/* Row 9 */}
            <Grid container spacing={2} mb={2}>
              {renderField(
                "gross",
                "Gross",
                2.4,
                {
                  inputProps: {
                    readOnly: true,
                  },
                },
                "number",
              )}
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
              {renderField("min_cont", "Min Cont", 2.4)}
              {/* {renderField("in_country", "In Country", 2.4)} */}
            </Grid>

            {/* Row 10 */}
            <Grid container spacing={2} mb={2}>
              {renderField("out_country", "Out Country", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
              {renderField("b_unit", "B Unit", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
              {renderField("com_date", "Com Date", 2.4, {}, "date")}
              {/*   {renderField("old_no", "Old No", 2.4)} */}
            </Grid>

            {/* Row 11 */}
            <Grid container spacing={2} mb={2}>
              {renderField("lation", "Lation", 2.4)}
              {renderField("js_no", "JS No", 2.4)}
              {renderField("js_date", "JS Date", 2.4, {}, "date")}
              {renderField("soso", "SOSO", 2.4)}
              {/*   {renderField("complete_type", "Complete Type", 2.4)} */}
            </Grid>

            {/* Row 12 */}
            <Grid container spacing={2} mb={2}>
              {/*  {renderField("pass_date", "Pass Date", 2.4, {}, "date")}*/}
              {renderField("stoc_type", "Stock Type", 2.4)}
              {/*  {renderField("ac_row", "AC Row", 2.4)}*/}
              {/*  {renderField("ac_bom", "AC BOM", 2.4)}*/}
              {/*  {renderField("shoe_id", "Shoe ID", 2.4)}*/}
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

export default EditAcChgM;
