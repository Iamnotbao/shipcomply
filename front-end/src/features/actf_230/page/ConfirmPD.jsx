import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  Typography,
  InputBase,
  Paper,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
const ConfirmPDPopup = ({
  openLink = false,
  onClose,
  onOpenSizeLink,
  onSave,
  getControlLabel,
  getColumnLabel,
  onSearchFilter,
  selectVwContImp,
}) => {
  return (
    <>
      <Dialog open={openLink} onClose={onClose} maxWidth="sm">
        <DialogContent>
          <Box>
            <Box
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
              mb={2}
            >
              <Typography
                variant="h4"
                textTransform={"uppercase"}
                fontWeight={600}
                gutterBottom
                textAlign={"center"}
                flex={1}
                mb={"0"}
              >
                {getControlLabel("ttl_extend_pd", "Extend pass date")}
              </Typography>
              <Button onClick={onClose} variant="contained" color="error">
                <CloseIcon />
              </Button>
            </Box>
            <Box component="form" onSubmit={onSave}>
              <Stack
                direction="row"
                flexWrap="wrap"
                sx={{ rowGap: 6, width: "100%" }}
              >
                <div style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                  <Box display={"flex"} alignItems={"center"} gap={1}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      fontSize="14px"
                    >
                      {getControlLabel("pass_date", "Pass Date")}
                      <span style={{ color: "red" }}>*</span>
                    </Typography>

                    <TextField
                      fullWidth
                      label={getColumnLabel("pass_date", "Pass Date")}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        readOnly: false,
                      }}
                      type="date"
                      name="pass_date"
                      required
                    />
                  </Box>
                </div>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Box>
                    <Button variant="contained" color="primary" type="submit">
                      {getControlLabel("btn_save", "Ok")}
                    </Button>
                  </Box>
                  <Box>
                    <Button variant="contained" color="error" onClick={onClose}>
                      {getControlLabel("btn_cancel", "Cancel")}
                    </Button>
                  </Box>
                </Box>
              </Stack>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default ConfirmPDPopup;
