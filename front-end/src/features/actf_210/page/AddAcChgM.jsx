import { useEffect, useState, useRef } from "react";
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
} from "../../../service/vw_cont_imp/VwContImpService";
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
  language,
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
    },
  });

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
  const d_type = watch("d_type");
  const cont_no = watch("cont_no");
  const com_invoice = watch("com_invoice");
  const hasDuplicateRef = useRef(false);
  useEffect(() => {
    if (open) {
      loadAutoFields();
    } else {
      reset();
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
  }, [open, reset]);

  // Load AC_NO và các param values
  const loadAutoFields = async () => {
    try {
      const acNoResult = await createAcno(
        user?.factory,
        user?.department,
        user?.user_code,
        auth?.find((item) => item.field === "query_level")?.title,
      );
      const ac_no = acNoResult?.data || "";
      setValue("ac_no", ac_no);
      setAutoFields((prev) => ({ ...prev, ac_no }));
      const [
        orgTax,
        acUnit,
        acAddr,
        licDate,
        licEdate,
        license,
        tax,
        addTax,
        sumMoney,
      ] = await Promise.all([
        fetchBankDropDown(user?.access_token, user?.factory, "org_tax"),
        fetchBankDropDown(user?.access_token, user?.factory, "ac_unit"),
        fetchBankDropDown(user?.access_token, user?.factory, "ac_addr"),
        fetchBankDropDown(user?.access_token, user?.factory, "lic_date"),
        fetchBankDropDown(user?.access_token, user?.factory, "lic_edate"),
        fetchBankDropDown(user?.access_token, user?.factory, "license"),
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
      setValue("org_tax", orgTax?.data[0]?.org_tax || "");
      setValue("ac_unit", acUnit?.data[0]?.ac_unit || "");
      setValue("ac_addr", acAddr?.data[0]?.ac_addr || "");
      setValue("lic_date", licDate?.data[0]?.lic_date || "");
      setValue("lic_edate", licEdate?.data[0]?.lic_edate || "");
      setValue("license", license?.data[0]?.license || "");
      setValue("tax", tax?.data?.total || 0);
      setValue("add_tax", addTax?.data?.total || 0);
      setValue("sum_money", sumMoney?.data?.total || 0);
      setAutoFields((prev) => ({
        ...prev,
        ac_unit: acUnit?.data?.ac_unit || "",
        ac_addr: acAddr?.data?.ac_addr || "",
        org_tax: orgTax?.data?.org_tax || "",
        lic_date: licDate?.data?.lic_date || "",
        lic_edate: licEdate?.data?.lic_edate || "",
        license: license?.data?.license || "",
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

      if (vendNo?.data?.vend_no) {
        const venderResult = await fetchFieldByPoVenderMDropDown(
          user?.access_token,
          user?.factory,
          "",
          vendNo?.data?.vend_no,
          false,
          user?.department,
          user?.user_code,
          auth?.find((item) => item.field === "query_level")?.title,
          "tax_code",
          1,
          10,
          "",
          language,
          false,
        );
        console.log("van lun v thoi ", venderResult?.data[0]?.code_no);

        setValue("cust_tax", venderResult?.data[0]?.code_no || "");
      }
    } catch (error) {
      console.error("Error loading data from cont_no:", error);
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
      setValue("arr_date", arrDate?.data[0]?.estimated_arrival_date || "");
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
        b_unit: bUnit?.packaging_unit || "",
        peice: peice?.qty_of_pieces || "",
        gross: gross?.gross_weight || "",
      }));
    } catch (error) {
      console.error("Error loading data from invoice:", error);
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
    setAutoFields((prev) => ({ ...prev, sort }));
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
              "already exists in a previous year.",
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
    // ===== DROPDOWN FIELDS =====
    // CHG_TYPE (category 5002)
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
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
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
            </Grid>

            {/* Row 3 */}
            <Grid container spacing={2} mb={2}>
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
              {/*  {renderField("trans_name", "Transport Name", 2.4)}*/}
              {renderField("vehicle_no", "Vehicle No", 2.4)}
              {renderField(
                "arr_date",
                "Arrival Date",
                2.4,
                {
                  inputProps: {
                    readOnly: true,
                  },
                },
                "date",
              )}
              {renderField("deliver", "Deliver", 2.4, {
                inputProps: {
                  readOnly: true,
                },
              })}
            </Grid>

            {/* Row 6 */}
            <Grid container spacing={2} mb={2}>
              {renderField("trans_type", "Transport Type", 2.4)}
              {renderField(
                "trans_date",
                "Transport Date",
                2.4,
                {
                  inputProps: {
                    readOnly: true,
                  },
                },
                "date",
              )}
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
              {/*   {renderField("out_port", "Out Port", 2.4)}*/}
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
                  disabled: true,
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
                  disabled: true,
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
              {/*   {renderField("sum_qty", "Sum Quantity", 2.4, {}, "number")}*/}
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
              {/*  {renderField("in_country", "In Country", 2.4)}*/}
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
              {/*  {renderField("old_no", "Old No", 2.4)} */}
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
              {/*   {renderField("pass_date", "Pass Date", 2.4, {}, "date")} */}
              {renderField("stoc_type", "Stock Type", 2.4)}
              {/*    {renderField("ac_row", "AC Row", 2.4)}*/}
              {/*   {renderField("ac_bom", "AC BOM", 2.4)}*/}
              {/* {renderField("shoe_id", "Shoe ID", 2.4)}*/}
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
