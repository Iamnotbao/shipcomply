import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  useMediaQuery,
  useTheme,
  Typography,
  InputBase,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
const ExchangeRatePopup = ({
  openLink = false,
  onClose,
  onExchangeRate,
  getControlLabel,
  selectRow = {},
}) => {
  return (
    <>
      <Dialog open={openLink} onClose={onClose} maxWidth="xl">
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
                {getControlLabel("ttl_detail", "Exchange Rate Information")}
              </Typography>
              <Button onClick={onClose} variant="contained" color="error">
                <CloseIcon />
              </Button>
            </Box>
            <Box
              component="form"
              direction="row"
              flexWrap="wrap"
              onSubmit={onExchangeRate}
              sx={{ rowGap: 10, width: "100%" }}
            >
              <Box
                display={"flex"}
                alignContent={"center"}
                justifyContent={"center"}
                flexDirection={"column"}
                gap={2}
              >
                <Box
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  gap={1}
                >
                  <Typography variant="body2" fontWeight="bold" fontSize="14px">
                    {getControlLabel("ttl_old_in_crate", "Old In Crate:")}
                  </Typography>
                  <Paper
                    sx={{
                      p: "2px 4px",
                      display: "flex",
                      alignItems: "center",
                      width: 200,
                    }}
                  >
                    <InputBase
                      sx={{ ml: 1, flex: 1 }}
                      placeholder={"..."}
                      inputProps={{ "aria-label": "name" }}
                      name={"old_in_crate"}
                      value={selectRow?.in_crate ?? ""}
                      type={"text"}
                      disabled
                    />
                  </Paper>
                </Box>
                <Box
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  gap={1}
                >
                  <Typography variant="body2" fontWeight="bold" fontSize="14px">
                    {getControlLabel("ttl_new_in_crate", "New In Crate:")}
                  </Typography>
                  <Paper
                    sx={{
                      p: "2px 4px",
                      display: "flex",
                      alignItems: "center",
                      width: 200,
                    }}
                  >
                    <InputBase
                      sx={{ ml: 1, flex: 1 }}
                      placeholder={"..."}
                      inputProps={{ "aria-label": "name" }}
                      name={"in_crate"}
                      type={"number"}
                    />
                  </Paper>
                </Box>
              </Box>
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
                    {getControlLabel("btn_save", "Save")}
                  </Button>
                </Box>
                <Box>
                  <Button variant="contained" color="error" onClick={onClose}>
                    {getControlLabel("btn_return", "Return")}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default ExchangeRatePopup;
