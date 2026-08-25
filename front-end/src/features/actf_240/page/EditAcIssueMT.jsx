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

const EditAcIssueMT = ({
  open,
  onClose,
  handleEdit,
  getControlLabel,
  getColumnLabel,
  user,
  selectRows,  
  auth,
}) => {
  // col1
  const [col1, setCol1] = useState("");
  const [col1IsDuplicate, setCol1IsDuplicate] = useState(false);
  const [col1IsChecking, setCol1IsChecking] = useState(false);
  console.log('adada',selectRows);
  
  // ─────────────────────────────────────────────
  // Khi mở dialog → fill data từ selectRows vào form
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (open && selectRows) {
      setCol1(selectRows.col1 || "");
      setCol1IsDuplicate(false);
      setCol1IsChecking(false);
    }
  }, [open, selectRows]);

  useEffect(() => {
    if (!open) {
      setCol1("");
      setCol1IsDuplicate(false);
      setCol1IsChecking(false);
    }
  }, [open]);

  // ─────────────────────────────────────────────
  // col1: validate khi blur
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
    if (col1IsChecking || col1IsDuplicate) return;

    const rawData = Object.fromEntries(new FormData(e.target));
    const editData = {
      ...rawData,
      col1,
    };

    handleEdit(editData);
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <Dialog open={open} onClose={()=>onClose(null)} maxWidth="lg" fullWidth>
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
              {getControlLabel("ttl_m_edit", "Edit Ac Issue M T Information")}
            </Typography>
            <Button onClick={()=>onClose(null)} variant="contained" color="error">
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
                    value={user?.factory || ""}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("ac_no", "報關ID")}
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
                    defaultValue={selectRows?.conf_seq || ""}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{readOnly:true}}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("conf_date", "生效日期")}
                    value={selectRows?.conf_date || ""}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("lock_date", "計算日期")}
                    value={selectRows?.lock_date || ""}
                    InputLabelProps={{ shrink: true }}
                    disabled
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("lock_seq", "優先序號")}
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
                {getControlLabel("ftxt_m_user_input", "User Input")}
              </legend>
              <Grid container spacing={2}>

                {/* acbom_no */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("acbom_no", "海關BOM編號")}
                    name="acbom_no"
                    defaultValue={selectRows?.acbom_no || ""}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* col1 — onBlur validate */}
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
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      endAdornment: col1IsChecking ? <CircularProgress size={16} /> : null,
                    }}
                  />
                </Grid>

                {/* col3 */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("col3", "報關單/年度序 (col3)")}
                    name="col3"
                    defaultValue={selectRows?.col3 || ""}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* col2 */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("col2", "作廢公文號")}
                    name="col2"
                    defaultValue={selectRows?.col2 || ""}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* col4 */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={getColumnLabel("col4", "col4")}
                    name="col4"
                    type="date"
                    defaultValue={
                      selectRows?.col4
                        ? selectRows.col4.substring(0, 10)
                        : ""
                    }
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
                disabled={col1IsDuplicate || col1IsChecking}
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

export default EditAcIssueMT;