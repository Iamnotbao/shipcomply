import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  Typography,
  InputBase,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
const CopyPopup = ({
  openLink = false,
  onClose,
  onOpenSizeLink,
  onSave,
  getControlLabel,
  selectVwContImp,
  onSearchFilter,
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
                {getControlLabel("ttl_detail", "Copy Contract Information")}
              </Typography>
              <Button onClick={onClose} variant="contained" color="error">
                <CloseIcon />
              </Button>
            </Box>
            <Box component="form" onSubmit={onSave}>
              <Stack
                direction="row"
                flexWrap="wrap"
                sx={{ rowGap: 10, width: "100%" }}
              >
                <div style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                  <Box
                    display={"flex"}
                    alignItems={"center"}
                    gap={1}
                    flexDirection={"column"}
                  >
                    <Box
                      display={"flex"}
                      flexDirection={"row"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      padding={2}
                      gap={3}
                    >
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        fontSize="14px"
                      >
                        {getControlLabel("ttl_cont_no", "Contract No:")}
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
                          value={selectVwContImp?.cont_no}
                          disabled
                        />
                      </Paper>
                    </Box>
                    <Box
                      display={"flex"}
                      flexDirection={"row"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      padding={2}
                      gap={2}
                    >
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        fontSize="14px"
                      >
                        {getControlLabel("ttl_new_cont_no", "New Contract No:")}
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
                          name="new_cont_no"
                          type="text"
                        />
                      </Paper>
                    </Box>
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
export default CopyPopup;
