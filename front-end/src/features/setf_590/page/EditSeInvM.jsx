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
import { Controller, useForm } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import Dropdown from "../../../component/dropdown/Dropdown";
import { fetchFieldDropdown } from "../../../service/se_pay/SePay";
import { fetchBasicDataDropDownByCate } from "../../../service/basic_data/basicDataService";
// import { fetchSePayDropDown } from "../../../service/se_pay/SePayService";    // SE_PAY

const EditSeInvM = ({
  open,
  onClose,
  rowData,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  language,
  auth
}) => {
  const { register, handleSubmit, reset, setValue, control } = useForm({
    defaultValues: {},
  });
  console.log("rowdata", rowData);

  const [dropdownValues, setDropdownValues] = useState({});
  const isNew = rowData?.status === 1; // chỉ status 1-NEW mới cho edit

  useEffect(() => {
    if (open && rowData) {
      reset({ ...rowData });
      setDropdownValues({
        exp_port: rowData.exp_port || "",
        dest_port: rowData.dest_port || "",
        trade: rowData.trade || "",
      });
    }
  }, [open, rowData, reset]);

  useEffect(() => {
    if (!open) {
      setDropdownValues({});
      reset({});
    }
  }, [open]);

  const createCdCodeCallback = (category) => {
    return async (page, pageSize, searchText) => {
      try {
        const result = await fetchBasicDataDropDownByCate(
          user?.factory,
          category,
          user?.department,
          user?.user_code,
          auth.find((item) => item.field === "query_level")?.title,
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
        console.error(" Error fetching unit:", error);
        return {
          data: [],
          total: 0,
          pageSize: pageSize,
        };
      }
    };
  };
  // TODO: callback trade - SE_PAY

  const createSePayCallback = () => {
    return async (page, pageSize, searchText) => {
      try {
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
        console.error(" Error fetching unit:", error);
        return {
          data: [],
          total: 0,
          pageSize: pageSize,
        };
      }
    };
  };
  const onSubmit = (data) => {
    handleEdit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogContent>
        <Paper sx={{ maxWidth: "1400px", mx: "auto", p: 3 }}>
          {/* Header */}
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
              {getControlLabel("ttl_m_edit", "Edit SE INV M Information")}
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
            {/* Row 1: factory_code | ac_no | invoice_id | invoice_no | status (all readonly) */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  value={rowData?.factory_code || ""}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("ac_no", "AC No")}
                  value={rowData?.ac_no || ""}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("invoice_id", "Invoice ID")}
                  value={rowData?.invoice_id || ""}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("invoice_no", "Invoice No")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: !isNew }}
                  {...register("invoice_no")}
                />
              </Grid>
            </Grid>

            {/* Row 2: invoice_date (+sync btn) | fcr_date | sort | payment */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <Controller
                  name="invoice_date"
                  control={control}
                  defaultValue=""
                  render={({ field: { value, onChange } }) => (
                    <Box display="flex" gap={1} alignItems="center">
                      <TextField
                        fullWidth
                        label={getColumnLabel("invoice_date", "Invoice Date")}
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ readOnly: !isNew }}
                        value={value ? value.toString().substring(0, 10) : ""}
                        onChange={(e) => onChange(e.target.value)}
                      />
                    </Box>
                  )}
                />
              </Grid>

              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("fcr_date", "FCR Date")}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: true }}
                  value={
                    rowData?.fcr_date
                      ? rowData.fcr_date.toString().substring(0, 10)
                      : ""
                  }
                />
              </Grid>

              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("sort", "Sort")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: true }}
                  value={rowData?.sort || ""}
                />
              </Grid>

              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("payment", "Payment")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: true }}
                  value={rowData?.payment || ""}
                />
              </Grid>
            </Grid>

            {/* Row 3: per | sailing_date | exp_port | dest_port | trade */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("per", "Per (航次)")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: !isNew }}
                  {...register("per")}
                />
              </Grid>

              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("sailing_date", "Sailing Date")}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: !isNew }}
                  {...register("sailing_date")}
                />
              </Grid>

              {/* exp_port - dropdown khi isNew, readonly khi không */}
              <Grid item xs={2.4}>
                {isNew ? (
                  <Controller
                    name="exp_port"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <Dropdown
                        onFetchData={createCdCodeCallback("2111")}
                        onSelect={(selectedItem) => {
                          const value = selectedItem?.code_no || "";
                          field.onChange(value);
                          setDropdownValues((prev) => ({
                            ...prev,
                            exp_port: value,
                          }));
                        }}
                        select={field.value || dropdownValues["exp_port"] || ""}
                        table="BASIC_DATA"
                        option="basic_data"
                        getControlLabel={getControlLabel}
                        language={user?.language || "en"}
                        field={getColumnLabel("exp_port", "Exp Port")}
                        totalItems={0}
                        pageSize={10}
                      />
                    )}
                  />
                ) : (
                  <TextField
                    fullWidth
                    label={getColumnLabel("exp_port", "Exp Port")}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ readOnly: true }}
                    value={rowData?.exp_port || ""}
                  />
                )}
              </Grid>

              {/* dest_port - dropdown khi isNew */}
              <Grid item xs={2.4}>
                {isNew ? (
                  <Controller
                    name="dest_port"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <Dropdown
                        onFetchData={createCdCodeCallback("2111")}
                        onSelect={(selectedItem) => {
                          const value = selectedItem?.code_no || "";
                          field.onChange(value);
                          setDropdownValues((prev) => ({
                            ...prev,
                            dest_port: value,
                          }));
                        }}
                        select={
                          field.value || dropdownValues["dest_port"] || ""
                        }
                        table="BASIC_DATA"
                        option="basic_data"
                        getControlLabel={getControlLabel}
                        language={user?.language || "en"}
                        field={getColumnLabel("dest_port", "Dest Port")}
                        totalItems={0}
                        pageSize={10}
                      />
                    )}
                  />
                ) : (
                  <TextField
                    fullWidth
                    label={getColumnLabel("dest_port", "Dest Port")}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ readOnly: true }}
                    value={rowData?.dest_port || ""}
                  />
                )}
              </Grid>

              {/* trade - dropdown khi isNew */}
              <Grid item xs={2.4}>
                {isNew ? (
                  <Controller
                    name="trade"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <Dropdown
                        onFetchData={createSePayCallback()}
                        onSelect={(selectedItem) => {
                          const value = selectedItem?.pay_no || "";
                          field.onChange(value);
                          setDropdownValues((prev) => ({
                            ...prev,
                            trade: value,
                          }));
                        }}
                        select={field.value || dropdownValues["trade"] || ""}
                        table="SE_PAY"
                        option="se_pay"
                        getControlLabel={getControlLabel}
                        language={user?.language || "en"}
                        field={getColumnLabel("trade", "Trade")}
                        totalItems={0}
                        pageSize={10}
                      />
                    )}
                  />
                ) : (
                  <TextField
                    fullWidth
                    label={getColumnLabel("trade", "Trade")}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ readOnly: true }}
                    value={rowData?.trade || ""}
                  />
                )}
              </Grid>
            </Grid>

            {/* Row 4: nw | gw | shipment_no | submission_date | account_addr */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("nw", "NW (凈重)")}
                  type="number"
                  inputProps={{ step: "0.0001", min: 0, readOnly: !isNew }}
                  InputLabelProps={{ shrink: true }}
                  {...register("nw", { valueAsNumber: true })}
                />
              </Grid>

              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("gw", "GW (毛重)")}
                  type="number"
                  inputProps={{ step: "0.0001", min: 0, readOnly: !isNew }}
                  InputLabelProps={{ shrink: true }}
                  {...register("gw", { valueAsNumber: true })}
                />
              </Grid>

              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("shipment_no", "Shipment No")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: !isNew }}
                  {...register("shipment_no")}
                />
              </Grid>

              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("submission_date", "Submission Date")}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: !isNew }}
                  {...register("submission_date")}
                />
              </Grid>

              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("account_addr", "Account Addr")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: !isNew }}
                  {...register("account_addr")}
                />
              </Grid>
            </Grid>

            {/* Row 5: bank_name | goods_desc | cdc_no | cdc_date */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("bank_name", "Bank Name")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: !isNew }}
                  {...register("bank_name")}
                />
              </Grid>

              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("goods_desc", "Goods Desc")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: !isNew }}
                  {...register("goods_desc")}
                />
              </Grid>

              <Grid item xs={2.4}>
                <Controller
                  name="hs_code"
                  control={control}
                  defaultValue=""
                  render={({ field: { value, onChange } }) => (
                    <Box display="flex" gap={1} alignItems="center">
                      <TextField
                        fullWidth
                        label={getColumnLabel("hs_code", "HS Code")}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ readOnly: !isNew }}
                        value={value ? value.toString().substring(0, 10) : ""}
                        onChange={(e) => onChange(e.target.value)}
                      />
                    </Box>
                  )}
                />
              </Grid>

              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("cdc_no", "CDC No")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: !isNew }}
                  {...register("cdc_no")}
                />
              </Grid>

              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("cdc_date", "CDC Date")}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: !isNew }}
                  {...register("cdc_date")}
                />
              </Grid>
            </Grid>

            {/* Row 6: via */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("via", "Via")}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ readOnly: !isNew }}
                  {...register("via")}
                />
              </Grid>
            </Grid>

            {/* Submit - chỉ hiện khi status = 1-NEW */}
            {isNew && (
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
            )}
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default EditSeInvM;
