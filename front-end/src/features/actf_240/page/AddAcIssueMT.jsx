import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Grid,
  Paper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState, useRef } from "react";
//import { validateCol1AcChg } from "../../../service/ac_chg/AcChgService";

const AddAcItemRef = ({
  open,
  onClose,
  handleAdd,
  getControlLabel,
  getColumnLabel,
  user,
  selectRows,
  auth,
}) => {
  const [dropdownValues, setDropdownValues] = useState({});



  // col1
   const [isChecking, setIsChecking] = useState(false);
  const [col1, setCol1] = useState("");
  const [col1IsDuplicate, setCol1IsDuplicate] = useState(false);
  const [col1IsChecking, setCol1IsChecking] = useState(false);

  // col4 (date picker)
  const [col4, setCol4] = useState(null);

  const debounceTimer = useRef(null);
  const abortControllerRef = useRef(null);
  const latestRequestId = useRef(0);


  // ─────────────────────────────────────────────
  // col1: validate khi blur → API xử lý CHG_NO + update AC_CHG_M
  // ─────────────────────────────────────────────
  const validateCol1 = async (value) => {
    if (!value?.trim()) return;
    try {
      setCol1IsChecking(true);
      const response = await validateCol1AcChg({
        factory_code: user?.factory,
        ac_no: selectRows?.ac_no,
        col1: value,
      });
      setCol1IsDuplicate(response?.data?.isDuplicate ?? false);
    } catch (err) {
      console.error("Error validating col1:", err);
      setCol1IsDuplicate(false);
    } finally {
      setCol1IsChecking(false);
    }
  };

  // ─────────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (col1IsChecking || col1IsDuplicate) return;
    const rawData = Object.fromEntries(new FormData(e.target));
    const addData = {
      ...rawData,
      col1,
      col4: col4 ? col4.toISOString() : null,
    };
    handleAdd(addData);
  };

  // ─────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setDropdownValues({});
      setIsChecking(false);
      setCol1("");
      setCol1IsDuplicate(false);
      setCol1IsChecking(false);
      setCol4(null);
      latestRequestId.current = 0;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    }
  }, [open]);

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogContent>
        <Paper sx={{ maxWidth: "1200px", mx: "auto", p: 3 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
            <Typography
              variant="h4"
              textTransform="uppercase"
              fontWeight={600}
              textAlign="center"
              flex={1}
            >
              {getControlLabel("ttl_m_add", "Add Ac Item Ref Information")}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>

            {/* ── Thông tin hệ thống (read-only) ── */}
            <fieldset style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "16px", marginBottom: "24px" }}>
              <legend style={{ padding: "0 8px", fontWeight: "bold" }}>
                {getControlLabel("ftxt_m_fac_dept", "System Information")}
              </legend>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("factory_code", "工廠代碼")}
                    name="factory_code"
                    value={user?.factory || ""}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("ac_no", "報關ID")}
                    name="ac_no"
                    value={selectRows?.ac_no || ""}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("conf_seq", "核銷序號")}
                    name="conf_seq"
                    InputLabelProps={{ shrink: true }}
                    //disabled
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("conf_date", "生效日期")}
                    name="conf_date"
                    value={selectRows?.conf_date || ""}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("lock_date", "計算日期")}
                    name="lock_date"
                    value={selectRows?.lock_date || ""}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("lock_seq", "優先序號")}
                    name="lock_seq"
                    value={selectRows?.lock_seq || ""}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
              </Grid>
            </fieldset>

            {/* ── User input fields ── */}
            <fieldset style={{ border: "1px solid #ccc", borderRadius: "8px", padding: "16px", marginBottom: "24px" }}>
              <legend style={{ padding: "0 8px", fontWeight: "bold" }}>
                {getControlLabel("ftxt_user_input", "User Input")}
              </legend>
              <Grid container spacing={2}>
                {/* acbom_no */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("acbom_no", "海關BOM編號")}
                    name="acbom_no"
                  />
                </Grid>

                {/* col1 — user sửa, onBlur validate */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("col1", "報關單/年度序")}
                    name="col1"
                    value={col1}
                    onChange={(e) => {
                      setCol1(e.target.value);
                      if (col1IsDuplicate) setCol1IsDuplicate(false);
                    }}
                    onBlur={() => validateCol1(col1)}
                    error={col1IsDuplicate}
                    helperText={
                      col1IsDuplicate
                        ? getControlLabel("err_col1_duplicate", "Số tờ khai đã tồn tại!")
                        : ""
                    }
                    inputProps={{
                      endAdornment: col1IsChecking ? <CircularProgress size={16} /> : null,
                    }}
                  />
                </Grid>

                {/* col3 — user tự gõ */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("col3", "報關單/年度序 (col3)")}
                    name="col3"
                  />
                </Grid>

                {/* col2 — user tự gõ */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("col2", "作廢公文號")}
                    name="col2"
                  />
                </Grid>

               <Grid item xs={6}>
                 <TextField
                    fullWidth
                    label={getColumnLabel("col4", "col4")}
                    name="col4"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

              </Grid>
            </fieldset>

            <Box mt={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={col1IsDuplicate || col1IsChecking || isChecking}
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

export default AddAcItemRef;