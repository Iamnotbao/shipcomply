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
const ExportVwAcAllChkPopup = ({
  openLink = false,
  onClose,
  onSave,
  getControlLabel,
}) => {
  console.log("click", openLink);

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
                {getControlLabel("ttl_detail", "Export File Name")}
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
                    alignItems={"flex-start"}
                    gap={1}
                    flexDirection={"column"}
                  >
                    <Box
                      display={"flex"}
                      alignItems={"center"}
                      flexDirection={"row"}
                    >
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        fontSize="14px"
                      >
                        {getControlLabel("ttl_file_export", "REQ NO:")}
                      </Typography>
                      <Paper
                        sx={{
                          p: "2px 4px",
                          display: "flex",
                          alignItems: "center",
                          width: 200,
                          marginLeft: 1,
                        }}
                      >
                        <InputBase
                          sx={{ ml: 1, flex: 1 }}
                          placeholder={"..."}
                          inputProps={{ "aria-label": "name" }}
                          name={"req_no"}
                          type={"text"}
                        />
                      </Paper>
                      <Box>
                        <Button variant="contained" color="warning">
                          ...
                        </Button>
                      </Box>
                    </Box>
                    <Box
                      display={"flex"}
                      alignItems={"center"}
                      flexDirection={"row"}
                    >
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        fontSize="14px"
                      >
                        {getControlLabel("ttl_file_export", "VEND NO:")}
                      </Typography>
                      <Paper
                        sx={{
                          p: "2px 4px",
                          display: "flex",
                          alignItems: "center",
                          width: 200,
                          marginLeft: 1,
                        }}
                      >
                        <InputBase
                          sx={{ ml: 1, flex: 1 }}
                          placeholder={"..."}
                          inputProps={{ "aria-label": "name" }}
                          name={"vend_no"}
                          type={"text"}
                        />
                      </Paper>
                      <Box>
                        <Button variant="contained" color="warning">
                          ...
                        </Button>
                      </Box>
                    </Box>
                    <Box
                      display={"flex"}
                      flexDirection={"row"}
                      alignItems={"center"}
                    >
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        fontSize="14px"
                      >
                        {getControlLabel("ttl_date_duration", "DATE DURATION:")}
                      </Typography>
                      <Paper
                        sx={{
                          p: "2px 4px",
                          display: "flex",
                          alignItems: "center",
                          marginLeft: 1,
                        }}
                      >
                        <InputBase
                          sx={{ ml: 1, flex: 1 }}
                          placeholder={"..."}
                          inputProps={{ "aria-label": "name" }}
                          name={"s_date"}
                          type={"date"}
                        />
                      </Paper>
                      <Box>
                        <Button variant="contained" color="warning">
                          ...
                        </Button>
                      </Box>
                      <Box display={"flex"} alignItems={"center"}>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          fontSize="14px"
                          paddingLeft={"5px"}
                          paddingRight={"5px"}
                        >
                          --
                        </Typography>
                      </Box>
                      <Paper
                        sx={{
                          p: "2px 4px",
                          display: "flex",
                          alignItems: "center",
                          marginLeft: 1,
                        }}
                      >
                        <InputBase
                          sx={{ ml: 1, flex: 1 }}
                          placeholder={"..."}
                          inputProps={{ "aria-label": "name" }}
                          name={"e_date"}
                          type={"date"}
                        />
                      </Paper>
                      <Box>
                        <Button variant="contained" color="warning">
                          ...
                        </Button>
                      </Box>
                    </Box>
                    <Box
                      display={"flex"}
                      alignItems={"center"}
                      flexDirection={"row"}
                    >
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        fontSize="14px"
                      >
                        {getControlLabel("ttl_file_export", "FILE EXPORT:")}
                      </Typography>
                      <Paper
                        sx={{
                          p: "2px 4px",
                          display: "flex",
                          alignItems: "center",
                          width: 200,
                          marginLeft: 1,
                        }}
                      >
                        <InputBase
                          sx={{ ml: 1, flex: 1 }}
                          placeholder={"..."}
                          inputProps={{ "aria-label": "name" }}
                          name={"filename"}
                          type={"text"}
                        />
                      </Paper>
                      <Box>
                        <Button variant="contained" color="warning">
                          ...
                        </Button>
                      </Box>
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
                      {getControlLabel("btn_excel", "To Excel")}
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
export default ExportVwAcAllChkPopup;
