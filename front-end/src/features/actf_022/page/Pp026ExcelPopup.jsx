import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  Typography,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Dropdown from "../../../component/dropdown/Dropdown";

const Pp026ExcelPopup = ({
  openLink = false,
  onClose,
  getControlLabel,
  getColumnLabel,
  handleExport,
  pp026ExcelForm,
  setPP026ExcelForm,
  onFetchMatCode,
}) => {
  const handleChange = (field, value) => {
    setPP026ExcelForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleExport(pp026ExcelForm);
  };

  return (
    <Dialog open={openLink} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <Box>
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
              {getControlLabel("ttl_pp026_excel", "報產資料轉EXCEL")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <Stack spacing={2}>
              {/* 報產日期起迄 */}
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  sx={{ minWidth: 100 }}
                >
                  {getControlLabel("lbl_budat", "報產日期")}
                  <span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField
                  label={getControlLabel("lbl_start_date", "Start Date")}
                  type="date"
                  size="small"
                  required
                  InputLabelProps={{ shrink: true }}
                  value={pp026ExcelForm.s_date_1 || ""}
                  onChange={(e) => handleChange("s_date_1", e.target.value)}
                  sx={{ width: 180 }}
                />
                <Typography variant="body2">~</Typography>
                <TextField
                  label={getControlLabel("lbl_end_date", "End Date")}
                  type="date"
                  size="small"
                  required
                  InputLabelProps={{ shrink: true }}
                  value={pp026ExcelForm.e_date_1 || ""}
                  onChange={(e) => handleChange("e_date_1", e.target.value)}
                  sx={{ width: 180 }}
                />
              </Box>
              {/* 料號 mat_code */}
              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  sx={{ minWidth: 100 }}
                >
                  {getControlLabel("lbl_mat_code", "料號")}
                </Typography>
                <Dropdown
                  table="MM_ITEM"
                  option="mm_item"
                  field={getControlLabel("lbl_mat_code", "料號")}
                  select={pp026ExcelForm.mat_code || ""}
                  onFetchData={onFetchMatCode}
                  onSelect={(item) =>
                    handleChange("mat_code", item?.item_no || "")
                  }
                  getControlLabel={getControlLabel}
                />
              </Box>
              {/* plan_date — giữ nguyên như cũ */}
              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  sx={{ minWidth: 100 }}
                >
                  {getControlLabel("ttl_plan_date", "Plan Date")}
                  <span style={{ color: "red" }}>*</span>
                </Typography>
                <TextField
                  label={getColumnLabel("plan_date", "Plan Date")}
                  type="date"
                  size="small"
                  required
                  InputLabelProps={{ shrink: true }}
                  value={pp026ExcelForm.plan_date || ""}
                  onChange={(e) => handleChange("plan_date", e.target.value)}
                  sx={{ width: 180 }}
                />
              </Box>
              {/* Buttons */}
              <Box display="flex" justifyContent="space-between" pt={1}>
                <Button type="submit" variant="contained" color="primary">
                  {getControlLabel("btn_export", "Export Excel")}
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  color="error"
                  onClick={onClose}
                >
                  {getControlLabel("btn_cancel", "Return")}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default Pp026ExcelPopup;
