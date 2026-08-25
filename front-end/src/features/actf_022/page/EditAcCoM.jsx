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
import { fetchFieldDropdown } from "../../../service/sd_pack_m/sdPackM";

const EditAcCoM = ({
  open,
  onClose,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  rowData, // dữ liệu row đang edit,
  language,
}) => {
  const { register, handleSubmit, reset, setValue, control } = useForm({
    defaultValues: {
      factory_code: "",
      co_id: "",
      cust_id: "",
      se_id: "",
      ship_seq: null,
      se_seq: null,
      se_ver: "",
      pack_gu: "",
      mer_po: "",
      po: "",
      fa_cbm: "",
      boat_company: "",
      destination: "",
      board_date: "",
      bl_no: "",
      sort: "",
      print_id: "",
      boat_cbm: "",
      otcbm: "",
      sorting_cbm: "",
      co_no: "",
      el_no: "",
      elno: "",
      is_prt: "Y",
      boat_name: "",
      ar_no: "",
      ws_no: "",
      ql_date: "",
      gross: "",
      by_out: "",
      ship_order: "",
      zip_invoice: "",
      invoice_no: "",
      net_weight: "",
      note: "",
      status: "",
      grt_dept: "",
      grt_user: "",
      grt_date: "",
    },
  });

  const [dropdownValues, setDropdownValues] = useState({
    boat_company: "",
    destination: "",
    sort: "",
    elno: "",
    se_id: "",
    se_ver: "",
  });

  // Khi mở dialog, load dữ liệu từ rowData vào form
  useEffect(() => {
    if (open && rowData) {
      const formatDate = (val) =>
        val ? new Date(val).toISOString().split("T")[0] : "";

      const fields = [
        "factory_code",
        "co_id",
        "cust_id",
        "se_id",
        "se_ver",
        "pack_gu",
        "mer_po",
        "po",
        "fa_cbm",
        "bl_no",
        "print_id",
        "boat_cbm",
        "otcbm",
        "sorting_cbm",
        "co_no",
        "el_no",
        "is_prt",
        "boat_name",
        "ar_no",
        "ws_no",
        "gross",
        "ship_order",
        "zip_invoice",
        "invoice_no",
        "net_weight",
        "note",
        "ship_seq",
        "se_seq",
        "status",
        "grt_dept",
        "grt_user",
      ];

      fields.forEach((field) => {
        setValue(field, rowData[field] ?? "");
      });

      // Date fields
      setValue("board_date", formatDate(rowData.board_date));
      setValue("by_out", formatDate(rowData.by_out));
      setValue("ql_date", formatDate(rowData.ql_date));
      setValue("grt_date", formatDate(rowData.grt_date));

      // Dropdown fields — set cả form value lẫn dropdownValues
      setValue("boat_company", rowData.boat_company || "");
      setValue("destination", rowData.destination || "");
      setValue("sort", rowData.sort || "");
      setValue("elno", rowData.elno || "");
      setValue("se_seq", rowData.se_seq != null ? Number(rowData.se_seq) : null);
      setValue("ship_seq", rowData.ship_seq != null ? Number(rowData.ship_seq) : null);
      setDropdownValues({
        boat_company: rowData.boat_company || "",
        destination: rowData.destination || "",
        sort: rowData.sort || "",
        elno: rowData.elno || "",
        se_id: rowData.se_id || "",
        se_ver: rowData.se_ver || "",
      });
    } else if (!open) {
      reset();
      setDropdownValues({
        boat_company: "",
        destination: "",
        sort: "",
        elno: "",
      });
    }
  }, [open, rowData]);

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
  const createSeIdCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";

        const result = await fetchFieldDropdown(
          user?.factory,
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
        console.error(`Error fetching basic data:`, error);
        return { data: [], total: 0, pageSize };
      }
    };
  };
  const onSubmit = (data) => {
    const numericFields = [
      "co_id",
      "se_ver",
      "pack_gu",
      "fa_cbm",
      "boat_cbm",
      "otcbm",
      "sorting_cbm",
      "gross",
      "net_weight",
      "se_seq",
      "ship_seq",
    ];
    const dateFields = ["board_date", "by_out", "ql_date"];

    const cleaned = { ...data };

    numericFields.forEach((field) => {
      if (cleaned[field] === "" || isNaN(cleaned[field])) {
        cleaned[field] = null;
      }
    });

    dateFields.forEach((field) => {
      if (cleaned[field] === "") {
        cleaned[field] = null;
      }
    });

    handleEdit({ ...cleaned, status: 1 });
  };

  const renderField = (
    fieldName,
    label,
    gridSize = 2.4,
    extraProps = {},
    type = "text",
  ) => {
    // BOAT_COMPANY (rule_no 2117)
    if (fieldName === "boat_company") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createBasicDataCallback("2117")}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.code_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({
                    ...prev,
                    boat_company: value,
                  }));
                }}
                select={field.value || dropdownValues.boat_company || ""}
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

    // DESTINATION (rule_no 2111)
    if (fieldName === "destination") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createBasicDataCallback("2111")}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.code_no || "";
                  field.onChange(value);
                  setDropdownValues((prev) => ({
                    ...prev,
                    destination: value,
                  }));
                }}
                select={field.value || dropdownValues.destination || ""}
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

    // SORT (rule_no 5008)
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

    // ELNO - 產證國別 (rule_no 5006)
    if (fieldName === "elno") {
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
                  setDropdownValues((prev) => ({ ...prev, elno: value }));
                }}
                select={field.value || dropdownValues.elno || ""}
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
    if (fieldName === "se_id") {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createSeIdCallback()}
                onSelect={(selectedItem) => {
                  console.log("toi da chon", selectedItem);

                  const value = selectedItem?.se_id || "";

                  field.onChange(value);

                  setDropdownValues((prev) => ({
                    ...prev,
                    se_id: selectedItem?.se_id || "",
                    se_ver: selectedItem?.se_ver || "",
                    pack_gu: selectedItem?.pack_gu || "",
                    se_seq: selectedItem?.se_seq || "",
                  }));
                }}
                select={{
                  se_id: dropdownValues.se_id || "",
                  se_ver: dropdownValues.se_ver || "",
                }}
                table="SD_PACK_M"
                option={fieldName}
                headerField={"se_id"}
                totalItems={0}
                pageSize={10}
                field={getColumnLabel("se_id", "SE ID")}
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
          label={getColumnLabel(fieldName, label)}
          type={type}
          InputLabelProps={{ shrink: true }}
          inputProps={
            type === "number"
              ? { step: "0.0001", min: 0, ...extraProps.inputProps }
              : extraProps.inputProps
          }
          {...register(fieldName, { valueAsNumber: type === "number" })}
          {...extraProps}
        />
      </Grid>
    );
  };

  return (
    <Dialog open={open} onClose={()=>onClose(null)} maxWidth="xl" fullWidth>
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
              {getControlLabel("ttl_edit", "Edit AC_CO_M")}
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
                  InputLabelProps={{ shrink: true }}
                  {...register("factory_code")}
                  disabled
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("co_id", "CO ID")}
                  InputLabelProps={{ shrink: true }}
                  {...register("co_id")}
                  disabled
                />
              </Grid>
              {renderField("cust_id", "客戶ID", 2.4, { disabled: true })}
              {renderField("se_id", "包裝訂單", 2.4)}
              {renderField("mer_po", "貿易商PO", 2.4)}
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={2}>
              {renderField("po", "下單客戶PO", 2.4)}
              {renderField("ship_order", "出貨單號", 2.4)}
              {renderField("invoice_no", "出貨發票號", 2.4)}
              {renderField("print_id", "海關單號", 2.4)}
              {renderField("bl_no", "提單號碼", 2.4)}
            </Grid>

            {/* Row 3 */}
            <Grid container spacing={2} mb={2}>
              {renderField("board_date", "裝船日", 2.4, {}, "date")}
              {renderField("by_out", "確認出口", 2.4, {}, "date")}
              {renderField("boat_company", "船公司", 2.4)}
              {renderField("destination", "目的港", 2.4)}
              {renderField("boat_name", "船名/航次", 2.4)}
            </Grid>

            {/* Row 4 */}
            <Grid container spacing={2} mb={2}>
              {renderField("sort", "大品名", 2.4)}
              {renderField("elno", "產證國別", 2.4)}
              {renderField("co_no", "C/O No", 2.4)}
              {renderField("el_no", "E/L No", 2.4)}
              {renderField("zip_invoice", "ZIV 發票", 2.4)}
            </Grid>

            {/* Row 5 - CBM & Weight */}
            <Grid container spacing={2} mb={2}>
              {renderField("fa_cbm", "工廠材積", 2.4, {}, "number")}
              {renderField("boat_cbm", "船公司材積", 2.4, {}, "number")}
              {renderField("otcbm", "OT材積", 2.4, {}, "number")}
              {renderField("sorting_cbm", "大品名材積", 2.4, {}, "number")}
              {renderField("gross", "毛重", 2.4, {}, "number")}
            </Grid>

            {/* Row 6 */}
            <Grid container spacing={2} mb={2}>
              {renderField("net_weight", "凈重", 2.4, {}, "number")}
              {renderField("ar_no", "請款編號", 2.4)}
              {renderField("ws_no", "完稅清理編號", 2.4)}
              {renderField("ql_date", "清理完稅日期", 2.4, {}, "date")}
              {renderField("note", "備注", 2.4)}
            </Grid>
            {/* Submit Buttons */}
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

export default EditAcCoM;
