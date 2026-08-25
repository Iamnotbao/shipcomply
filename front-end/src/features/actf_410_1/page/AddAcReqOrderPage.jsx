import { useEffect, useState } from "react";
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
import Dropdown from "../../../component/dropdown/Dropdown";
import {
  fetchAllAcNo,
  fetchAllInvoiceNo,
  getReqNo,
} from "../../../service/ac_req_m/AcReqMService";
import { fetchAllByField } from "../../../service/ac_srcorder_m/AcSrcorderMService";

const AddAcReqOrderPage = ({
  open,
  onClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
  auth,
  selectRows,
}) => {
  const [dropdownData, setDropdownData] = useState({});
  const [dropdownValues, setDropdownValues] = useState({});
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
    chk_no: "order_no",
    chk_seq: "order_seq",
  };

  const fetchAllDropdowns = async () => {
    try {
      const allow = Array.isArray(auth)
        ? auth.find((item) => item.field === "query_level")?.title
        : null;
      console.log("check allow", allow);
      const promises = Object.entries(mapDropdown).map(
        async ([fieldName, categoryCode]) => {
          try {
            const response = await fetchAllByField(user?.factory, fieldName);
            return { fieldName, data: response?.data || [] };
          } catch (error) {
            console.error(
              `Error fetching ${fieldName} (${categoryCode}):`,
              error
            );
            return { fieldName, data: [] };
          }
        }
      );
      const results = await Promise.all(promises);
      const dataMap = {};
      results.forEach(({ fieldName, data }) => {
        dataMap[fieldName] = data;
      });
      setDropdownData(dataMap);
    } catch (error) {
      console.error("Error fetching dropdowns:", error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAllDropdowns();
    } else {
      setDropdownData({});
      setDropdownValues({});
    }
  }, [open]);
  const renderField = (fieldName, label, gridSize = 3, extraProps = {}) => {
    const hasDropdown = mapDropdown.hasOwnProperty(fieldName);
    const dropdownOptions = dropdownData[fieldName] || [];

    if (hasDropdown) {
      return (
        <Grid item xs={gridSize} key={fieldName}>
          <Dropdown
            data={dropdownOptions}
            onSelect={(selectedItem) => {
              console.log(`Dropdown ${fieldName} selected:`, selectedItem);
              setDropdownValues((prev) => {
                const newValues = {
                  ...prev,
                  [fieldName]: selectedItem?.fieldName || "",
                };
                console.log("Updated dropdown values:", newValues);
                return newValues;
              });
            }}
            select={dropdownValues[fieldName] || extraProps.defaultValue || ""}
            table="AC_SRCORDER_M"
            option={"ac_srcorder_m"}
            getControlLabel={getControlLabel}
            language={user?.language || "en"}
            field={getColumnLabel(fieldName, label)}
          />
          {/* Hidden input để form submit */}
          <input
            type="hidden"
            name={fieldName}
            value={dropdownValues[fieldName] || extraProps.defaultValue || ""}
          />
        </Grid>
      );
    }

    return (
      <Grid item xs={gridSize}>
        <TextField
          fullWidth
          label={getColumnLabel(fieldName, label)}
          name={fieldName}
          {...extraProps}
        />
      </Grid>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl">
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
              {getControlLabel("ttl_add", "Add Ac Req Order Information")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleAdd}>
            {/* Row 1 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("factory_code", "Factory Code")}
                  name="factory_code"
                  value={user?.factory}
                  disabled
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("req_no", "Req No")}
                  name="req_no"
                  value={selectRows?.req_no || ""}
                  disabled
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("req_seq", "Req Seq")}
                  name="req_seq"
                  type="text"
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              {renderField("order_type", "Order Type")}
            </Grid>
            {/* Row 3 */}
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
              {renderField("req_acqty", "Req Acqty")}
              {renderField("chge_qty", "Chge Qty")}
              {renderField("currency", "Currency")}
            </Grid>
            {/* Row 5 */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("rcpt_qty", "Rcpt Qty")}
                  name="rcpt_qty"
                  type="number"
                  inputProps={{ step: "0.0001", min: 0 }}
                />
              </Grid>
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("pass_qty", "Pass Qty")}
                  name="pass_qty"
                  type="number"
                  inputProps={{ step: "0.0001",min: 0  }}
                />
              </Grid>
              {renderField("req_qc", "Req Qc")}
              {renderField("req_qty", "Req Qty")}
            </Grid>
            {/* Row 6 */}
            <Grid container spacing={2} mb={3}>
              {renderField("price", "Price")}
              <Grid item xs={2.4}>
                <TextField
                  fullWidth
                  label={getColumnLabel("pass_qty", "Pass Qty")}
                  name="rcpt_qty"
                />
              </Grid>
              {renderField("chk_no", "CHK No")}
              {renderField("chk_seq", "CHK Seq")}
            </Grid>
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

export default AddAcReqOrderPage;
