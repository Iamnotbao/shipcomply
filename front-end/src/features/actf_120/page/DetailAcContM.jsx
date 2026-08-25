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

const DetailAcContM = ({
  open,
  onClose,
  acContM,
  getControlLabel,
  getColumnLabel,
  user,
}) => {
  const renderField = (fieldName, label, gridSize = 4, extraProps = {}) => {
    return (
      <Grid item xs={gridSize} key={fieldName}>
        <TextField
          fullWidth
          label={getColumnLabel(fieldName, label)}
          value={acContM?.[fieldName] || ""}
          aria-readonly
          {...extraProps}
        />
      </Grid>
    );
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
              {getControlLabel("ttl_m_detail", "Ac Cont M Details")}
            </Typography>
            <Button
              onClick={() => onClose(null)}
              variant="contained"
              color="error"
            >
              <CloseIcon />
            </Button>
          </Box>

          {/* Form - Read Only */}
          <Box>
            {/* Row 1 */}
            <Grid container spacing={2} mb={3}>
              {renderField("factory_code", "Factory Code", 4)}
              {renderField("cont_no", "Cont No", 4)}
              {renderField("cont_type", "Cont Type", 4)}
              {renderField("issued_date", "Issued Date", 4, {
                type: "date",
                InputLabelProps: { shrink: true },
              })}
              {renderField("expire_date", "Expire Date", 4, {
                type: "date",
                InputLabelProps: { shrink: true },
              })}
            </Grid>

            {/* Row 2 */}
            <Grid container spacing={2} mb={3}>
              {renderField("last_edate", "Last E-Date", 4, {
                type: "date",
                InputLabelProps: { shrink: true },
              })}
              {renderField("vend_no", "Vend No", 4)}
              {renderField("seller", "Seller", 4)}
              {renderField("p_seller", "P Seller", 4)}
              {renderField("s_addr", "Seller Address", 4)}
            </Grid>

            {/* Row 5 */}
            <Grid container spacing={2} mb={3}>
              {renderField("s_accno", "Seller Acc No", 4)}
              {renderField("bvend_no", "Buyer Vend No", 4)}
              {renderField("buyer", "Buyer", 4)}
              {renderField("s_pic", "Seller PIC", 4)}
              {renderField("s_position", "Seller Position", 4)}
            </Grid>

            {/* Row 6 */}
            <Grid container spacing={2} mb={3}>
              {renderField("b_addr", "Buyer Address", 4)}
              {renderField("b_pic", "Buyer PIC", 4)}
              {renderField("b_position", "Buyer Position", 4)}
              {renderField("b_accno", "Buyer Acc No", 4)}
              {renderField("sum_qty", "Sum Qty", 4)}
            </Grid>

            {/* Row 8 */}
            <Grid container spacing={2} mb={3}>
              {renderField("freight", "Freight", 4)}
              {renderField("insurance", "Insurance", 4)}
              {renderField("term_pay", "Term Pay", 4)}
              {renderField("sum_money", "Sum Money", 4)}
              {renderField("pay_term", "Pay Term", 4)}
            </Grid>

            {/* Row 9 */}
            <Grid container spacing={2} mb={3}>
              {renderField("time_delive", "Time Delivery", 4, {
                type: "date",
                InputLabelProps: { shrink: true },
              })}
              {renderField("goods_origin", "Goods Origin", 4)}
              {renderField("port_dis", "Port Discharge", 4)}
              {renderField("bank", "Bank", 4)}
              {renderField("bank_ic", "Bank IC", 4)}
            </Grid>

            {/* Row 11 */}
            <Grid container spacing={2} mb={3}>
              {renderField("bank_addr", "Bank Address", 4)}
              {renderField("note", "Note", 4)}
              {renderField("d_type", "D Type", 4)}
              {renderField("currency", "Currency", 4)}
              {renderField("cont_category_name", "Cont Category", 4)}
              {renderField("big_contno", "Big Cont No", 4)}
            </Grid>
            {/* Close Button */}
            <Box mt={4} display="flex" justifyContent="center">
              <Button
                onClick={onClose}
                variant="contained"
                color="primary"
                size="large"
              >
                {getControlLabel("btn_close", "Close")}
              </Button>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default DetailAcContM;
