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
import { Controller, useForm, useWatch } from "react-hook-form";
import Dropdown from "../../../component/dropdown/Dropdown";
import {
  fetchAllByField,
  fetchAllByFieldDropDown,
} from "../../../service/ac_srcorder_m/AcSrcorderMService";
import { fetchFieldDropDown } from "../../../service/vw_ac_allchk/VwAcAllChkService";

const EditAcReqOrderPage = ({
  open,
  onClose,
  acReqOrder,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  language,
  selectRows,
}) => {
  const { register, handleSubmit, reset, setValue, control, watch } = useForm({
    defaultValues: { ...acReqOrder },
  });
  const [dropdownData, setDropdownData] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});
  const [loading, setLoading] = useState(true);
  console.log("chk_no",getControlLabel("chk_no"));
  
  const mapDropdown = {
    order_type: "order_type",
    src_id: "src_id",
    order_date: "order_date",
    order_no: "order_no",
    order_seq: "order_seq",
    ac_send: "ac_send",
    cont_no: "cont_no",
    ac_code: "ac_code",
    item_acno: "item_acno",
    order_acqty: "order_acqty",
    currency: "currency",
    price: "price",
    chk_no: "chk_no",
    chk_seq: "chk_seq",
  };
  const price = watch("price");
  const req_qty = watch("req_qty");
  // Reset form và set dropdown values khi acReqOrder thay đổi
  useEffect(() => {
    if (acReqOrder) {
      reset({
        ...acReqOrder,
      });

      // Set dropdown values từ data hiện tại
      const initialDropdownValues = {};
      Object.keys(mapDropdown).forEach((fieldName) => {
        if (acReqOrder[fieldName]) {
          initialDropdownValues[fieldName] = acReqOrder[fieldName];
        }
      });
      setDropdownValues(initialDropdownValues);
    }
  }, [acReqOrder, reset]);

  useEffect(() => {
    if (price && req_qty) {
      const amount = parseFloat(price) * parseFloat(req_qty);
      setValue("amount", amount.toFixed(4));
    }
  }, [price, req_qty]);
  // Tạo callback cho dropdown với pagination và search
  const createDropdownCallback = (fieldName) => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";
        const result = await fetchAllByFieldDropDown(
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
        console.error(`Error fetching dropdown ${fieldName}:`, error);
        return {
          data: [],
          total: 0,
          pageSize: pageSize,
        };
      }
    };
  };
  const createDropdownVAACallback = (fieldName) => {
    return async (page, pageSize, searchText) => {
      try {
        const allow = Array.isArray(auth)
          ? auth.find((item) => item.field === "query_level")?.title
          : "1";
        const result = await fetchFieldDropDown(
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
        console.error(`Error fetching dropdown ${fieldName}:`, error);
        return {
          data: [],
          total: 0,
          pageSize: pageSize,
        };
      }
    };
  };
  const onSubmit = (data) => {
    const finalData = {
      ...data,
      ...dropdownValues,
    };
    handleEdit(finalData);
  };

  const renderField = (fieldName, label, gridSize = 2.4, extraProps = {}) => {
    const hasDropdown = mapDropdown.hasOwnProperty(fieldName);
    const dropdownOptions = dropdownData[fieldName] || [];

    if (hasDropdown) {
      if (fieldName === "chk_no") {
        return (
          <Grid item xs={gridSize} key={fieldName}>
            <Controller
              name={fieldName}
              control={control}
              render={({ field }) => (
                <Dropdown
                  onFetchData={createDropdownVAACallback(
                    mapDropdown[fieldName],
                  )}
                  onSelect={(selectedItem) => {
                    const chkNo = selectedItem?.chk_no || "";
                    const chkSeq = selectedItem?.chk_seq || "";

                    field.onChange({ chk_no: chkNo, chk_seq: chkSeq }); // object để build composite key
                    setValue("chk_seq", chkSeq);
                    setDropdownValues((prev) => ({
                      ...prev,
                      chk_no: chkNo,
                      chk_seq: chkSeq,
                    }));
                  }}
                  select={{
                    // object → Dropdown tự build "chkNo__chkSeq"
                    chk_no: field?.value?.chk_no || field?.value || "",
                    chk_seq: watch("chk_seq") || "",
                  }} 
                  table="VW_AC_ALLCHK"
                  option="vw_ac_allchk"
                  headerField={"chk_no"}
                  totalItems={0}
                  pageSize={10}
                  field={getColumnLabel("chk_no", "Check Number")}
                />
              )}
            />
          </Grid>
        );
      }
      if (fieldName === "chk_seq") {
        return (
          <Grid item xs={gridSize} key={fieldName}>
            <TextField
              fullWidth
              label={getColumnLabel(fieldName, label)}
              {...register(fieldName)}
              disabled
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        );
      }
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Dropdown
                onFetchData={createDropdownCallback(mapDropdown[fieldName])}
                onSelect={(selectedItem) => {
                  const value = selectedItem?.[mapDropdown[fieldName]] || "";
                  console.log("cha cah", value);
                  field.onChange(value);
                  setDropdownValues((prev) => ({
                    ...prev,
                    [fieldName]: value,
                  }));
                }}
                select={field?.value}
                table="AC_SRCORDER_M"
                option="ac_srcorder_m"
                getControlLabel={getControlLabel}
                language={user?.language || "en"}
                field={getColumnLabel(fieldName, label)}
                headerField={mapDropdown[fieldName]}
                totalItems={0}
                pageSize={10}
              />
            )}
          />
        </Grid>
      );
    }

    return (
      <Grid item xs={gridSize}>
        <TextField
          fullWidth
          label={getColumnLabel(fieldName, label)}
          {...register(fieldName)}
          {...extraProps}
        />
      </Grid>
    );
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
              {getControlLabel("ttl_d_2_edit_1", "Edit Ac Req Order Information")}
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
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  {...register("factory_code")}
                  disabled
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("req_no", "Req No")}
                  {...register("req_no")}
                  disabled
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("req_seq", "Req Seq")}
                  {...register("req_seq")}
                  type="text"
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
              {renderField("order_type", "Order Type")}
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={3}>
              {renderField("src_id", "Src Id")}
              {renderField("order_no", "Order No")}
              {renderField("order_seq", "Order Seq")}
              {renderField("ac_send", "Ac Send")}
            </Grid>

            {/* Row 3 */}
            <Grid container spacing={2} mb={3}>
              {renderField("cont_no", "Cont No")}
              {renderField("ac_code", "AC Code")}
              {renderField("item_acno", "Item Acno")}
              {renderField("order_acqty", "Order Acqty")}
            </Grid>

            {/* Row 4 */}
            <Grid container spacing={2} mb={3}>
              {renderField("order_date", "Order date")}
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("req_acqty", "Req Acqty")}
                  {...register("req_acqty")}
                  type="number"
                  inputProps={{ step: "0.0001", min: 0 }}
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("chge_qty", "Chge Qty")}
                  {...register("chge_qty")}
                  type="number"
                  inputProps={{ step: "0.0001", min: 0 }}
                />
              </Grid>
              {renderField("currency", "Currency")}
            </Grid>

            {/* Row 5 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("rcpt_qty", "Rcpt Qty")}
                  {...register("rcpt_qty")}
                  type="number"
                  inputProps={{ step: "0.0001", min: 0 }}
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("pass_qty", "Pass Qty")}
                  {...register("pass_qty")}
                  type="number"
                  inputProps={{ step: "0.0001", min: 0 }}
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("req_qc", "Req Qc")}
                  {...register("req_qc")}
                  type="number"
                  inputProps={{ step: "0.0001", min: 0 }}
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("req_qty", "Req Qty")}
                  {...register("req_qty")}
                  type="number"
                  inputProps={{ step: "0.0001", min: 0 }}
                />
              </Grid>
            </Grid>

            {/* Row 6 */}
            <Grid container spacing={2} mb={3}>
              {renderField("price", "Price")}
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("amount", "Amount")}
                  {...register("amount")}
                  type="number"
                  inputProps={{ step: "0.0001", min: 0 }}
                />
              </Grid>
              {selectRows[0]?.ac_type === "3" && (
                <>
                  {renderField("chk_no", "CHK No")}
                  {renderField("chk_seq", "CHK Seq")}
                </>
              )}
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

export default EditAcReqOrderPage;
