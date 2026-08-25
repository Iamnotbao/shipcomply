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
const ImportLinkPopup = ({
  openLink = false,
  onClose,
  onImportLink,
  onImportLink1,
  onImportLink2,
  getControlLabel,
  onSearchFilter,
  selectVwContImp,
  isSmall,
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
                {getControlLabel("ttl_import_link", "Import Link")}
              </Typography>
              <Button onClick={onClose} variant="contained" color="error">
                <CloseIcon />
              </Button>
            </Box>
            <Stack
              direction="row"
              flexWrap="wrap"
              sx={{ rowGap: 6, width: "100%" }}
            >
              <div style={{ minWidth: 0, width: "100%", maxWidth: "100%" }}>
                <Box
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  gap={1}
                >
                  {isSmall ? (
                    <Box>
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={onImportLink1}
                      >
                        {getControlLabel("ttl_import_link", "ACTR_220.rdf")}
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={onImportLink2}
                      >
                        {getControlLabel("ttl_import_link_1", "ACTR_221.rdf")}
                      </Button>
                    </Box>
                  )}

                  {/* <Box>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={onImportLink}
                    >
                      {getControlLabel("ttl_import_link_2", "ACTR_222.rdf")}
                    </Button>
                  </Box> */}
                </Box>
              </div>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  width: "100%",
                }}
              >
                <Box>
                  <Button variant="contained" color="error" onClick={onClose}>
                    {getControlLabel("btn_cancel", "Cancel")}
                  </Button>
                </Box>
              </Box>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default ImportLinkPopup;
