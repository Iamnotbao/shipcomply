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
import { fetchInAcnoDropdown } from "../../../service/vw_ac_chgsum/vwAcChgSum";

const EditAcChgD = ({
  open,
  onClose,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  selectRows,
  selectParentRows,
  selectMasterRows,
}) => {
  const rowData = selectRows?.[0] || {};
  const { register, handleSubmit, reset, setValue, control, watch } = useForm({
    defaultValues: {
      factory_code: rowData?.factory_code || "",
      conf_seq: rowData?.conf_seq || "",
      matd_seq: rowData?.matd_seq || "",
      issue_seq: rowData?.issue_seq || "",
      src: rowData?.src || "",
      in_acno: rowData?.in_acno || "",
      ac_date: rowData?.ac_date ? rowData.ac_date.substring(0, 10) : "",
      d_type: rowData?.d_type || "",
      qty: rowData?.qty || "",
      status: rowData?.status || "",
      // read-only fields
      out_acno: rowData?.out_acno || "",
      prod_no: rowData?.prod_no || "",
      matd_no: rowData?.matd_no || "",
      unit: rowData?.unit || "",
      price: rowData?.price || "",
      pairs: rowData?.pairs || "",
      unit_qty: rowData?.unit_qty || "",
      loss_per: rowData?.loss_per || "",
      over_qty: rowData?.over_qty || "",
      money: rowData?.money || "",
      col1: rowData?.col1 || "",
    },
  });

  const [dropdownValues, setDropdownValues] = useState({
    src: rowData?.src || "",
    in_acno: rowData?.in_acno || "",
  });

  useEffect(() => {
    if (open && rowData) {
      setValue("factory_code", rowData.factory_code || "");
      setValue("conf_seq", rowData.conf_seq || "");
      setValue("matd_seq", rowData.matd_seq || "");
      setValue("issue_seq", rowData.issue_seq || "");
      setValue("src", rowData.src || "");
      setValue("in_acno", rowData.in_acno || "");
      setValue(
        "ac_date",
        rowData.ac_date ? rowData.ac_date.substring(0, 10) : "",
      );
      setValue("d_type", rowData.d_type || "");
      setValue("qty", rowData.qty || "");
      setValue("out_acno", rowData.out_acno || "");
      setValue("prod_no", rowData.prod_no || "");
      setValue("matd_no", rowData.matd_no || "");
      setValue("unit", rowData.unit || "");
      setValue("price", rowData.price || "");
      setValue("pairs", rowData.pairs || "");
      setValue("unit_qty", rowData.unit_qty || "");
      setValue("loss_per", rowData.loss_per || "");
      setValue("over_qty", rowData.over_qty || "");
      setValue("money", rowData.money || "");
      setValue("col1", rowData.col1 || "");
      setValue("status", rowData.status || "");
      setDropdownValues({
        src: rowData.src || "",
        in_acno: rowData.in_acno || "",
      });
    } else if (!open) {
      reset();
      setDropdownValues({ src: "", in_acno: "" });
    }
  }, [
    open,
    rowData?.factory_code,
    rowData?.conf_seq,
    rowData?.matd_seq,
    rowData?.issue_seq,
  ]);

  // SRC — static options
  const createSrcCallback = () => {
    return async (page, pageSize, searchText) => {
      const staticData = [
        { code_no: "1", code_name: "1-OverSea IMP" },
        { code_no: "2", code_name: "2-Invoice" },
        { code_no: "9", code_name: "9-Process IMP" },
        { code_no: "0", code_name: "0-Other" },
      ];
      const filtered = searchText
        ? staticData.filter(
            (d) =>
              d.code_no.includes(searchText) ||
              d.code_name.toLowerCase().includes(searchText.toLowerCase()),
          )
        : staticData;
      return { data: filtered, total: filtered.length, pageSize };
    };
  };

  // IN_ACNO — from VW_AC_CHGSUM filtered by src
  const createInAcnoCallback = (srcValue) => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchInAcnoDropdown(
          user?.factory,
          srcValue,
          selectParentRows?.[0]?.out_dtype || "",
          selectMasterRows?.[0]?.matd_no || "",
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
        console.error("Error fetching in_acno:", error);
        return { data: [], total: 0, pageSize };
      }
    };
  };

  const srcValue = watch("src");

  const renderReadOnlyField = (name, label, gridSize = 4) => (
    <Grid item xs={gridSize} key={name}>
      <TextField
        fullWidth
        label={getColumnLabel(name, label)}
        InputLabelProps={{ shrink: true }}
        disabled
        {...register(name)}
      />
    </Grid>
  );

  const onSubmit = (data) => {
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
  return (
    <Dialog open={open} onClose={() => onClose(null)} maxWidth="md" fullWidth>
      <DialogContent>
        <Paper sx={{ maxWidth: "800px", mx: "auto", p: 3 }}>
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
              {getControlLabel("ttl_d_2_edit", "Edit AC_CHK_T")}
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
            {/* Row 1 — PK fields (all disabled) */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  InputLabelProps={{ shrink: true }}
                  disabled
                  {...register("factory_code")}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("conf_seq", "Conf Seq")}
                  InputLabelProps={{ shrink: true }}
                  disabled
                  {...register("conf_seq")}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("matd_seq", "Matd Seq")}
                  InputLabelProps={{ shrink: true }}
                  disabled
                  {...register("matd_seq")}
                />
              </Grid>
            </Grid>

            {/* Row 2 — issue_seq (disabled in edit) + src + in_acno */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("issue_seq", "Issue Seq")}
                  type="number"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: "0.01", min: 0 }}
                  disabled
                  {...register("issue_seq")}
                  onChange={handleDecimalInput(2)}
                />
              </Grid>

              {/* SRC dropdown */}
              <Grid item xs={4}>
                <Controller
                  name="src"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      onFetchData={createSrcCallback()}
                      onSelect={(selectedItem) => {
                        const value = selectedItem?.code_no || "";
                        field.onChange(value);
                        setDropdownValues((prev) => ({ ...prev, src: value }));
                        // reset in_acno when src changes
                        setValue("in_acno", "");
                        setValue("ac_date", "");
                        setValue("d_type", "");
                        setDropdownValues((prev) => ({
                          ...prev,
                          src: value,
                          in_acno: "",
                        }));
                      }}
                      select={field.value || dropdownValues.src || ""}
                      table="BASIC_DATA"
                      option="basic_data"
                      getControlLabel={getControlLabel}
                      language={user?.language || "en"}
                      field={getColumnLabel("src", "Source")}
                      totalItems={4}
                      pageSize={10}
                    />
                  )}
                />
              </Grid>

              {/* IN_ACNO dropdown — auto-fills ac_date & d_type */}
              <Grid item xs={4}>
                <Controller
                  name="in_acno"
                  control={control}
                  render={({ field }) => (
                    <Dropdown
                      onFetchData={createInAcnoCallback(srcValue)}
                      onSelect={(selectedItem) => {
                        const value = selectedItem?.ac_no || "";
                        field.onChange(value);
                        setDropdownValues((prev) => ({
                          ...prev,
                          in_acno: value,
                        }));
                        setValue(
                          "ac_date",
                          selectedItem?.ac_date
                            ? selectedItem.ac_date.substring(0, 10)
                            : "",
                        );
                        setValue("d_type", selectedItem?.d_type || "");
                      }}
                      select={field.value || dropdownValues.in_acno || ""}
                      table="VW_AC_CHGSUM"
                      option="in_acno"
                      getControlLabel={getControlLabel}
                      language={user?.language || "en"}
                      field={getColumnLabel("in_acno", "In AC No")}
                      totalItems={0}
                      pageSize={10}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Row 3 — ac_date, d_type (editable), qty */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("ac_date", "AC Date")}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register("ac_date")}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("d_type", "D Type")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ max: 1 }}
                  {...register("d_type")}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("qty", "Qty")}
                  type="number"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: "0.00000001", min: 0 }}
                  {...register("qty", { valueAsNumber: true })}
                  onChange={handleDecimalInput(8)}
                />
              </Grid>
            </Grid>

            {/* Row 4-7 — Read-only fields from calculation */}
            <Grid container spacing={2} mb={2}>
              {renderReadOnlyField("out_acno", "Out AC No", 4)}
              {renderReadOnlyField("prod_no", "Prod No", 4)}
              {renderReadOnlyField("matd_no", "Matd No", 4)}
            </Grid>
            <Grid container spacing={2} mb={2}>
              {renderReadOnlyField("unit", "Unit", 4)}
              {renderReadOnlyField("price", "Price", 4)}
              {renderReadOnlyField("pairs", "Pairs", 4)}
            </Grid>
            <Grid container spacing={2} mb={2}>
              {renderReadOnlyField("unit_qty", "Unit Qty", 4)}
              {renderReadOnlyField("loss_per", "Loss %", 4)}
              {renderReadOnlyField("over_qty", "Over Qty", 4)}
            </Grid>
            <Grid container spacing={2} mb={2}>
              {renderReadOnlyField("money", "Money", 4)}
              {renderReadOnlyField("col1", "Col1", 4)}
            </Grid>

            {/* Buttons */}
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

export default EditAcChgD;
