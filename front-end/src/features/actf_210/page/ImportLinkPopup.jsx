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
  onImportLink3,
  onImportLink4,
  onImportLink5,
  onImportLink6,
  onImportLink7,
  onImportLink8,
  getControlLabel,
  onSearchFilter,
  selectVwContImp,
  selectRows,
}) => {
  console.log("how many ", selectRows?.length);

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
                  {selectRows?.length <= 3 ? (
                    <Box display="flex" gap={1}>
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={onImportLink}
                      >
                        {getControlLabel("btn_import_link", "ACTR_2181.rdf")}
                      </Button>
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={onImportLink1}
                      >
                        {getControlLabel("btn_import_link_1", "ACTR_2182.rdf")}
                      </Button>
                    </Box>
                  ) : (
                    <Box
                      display="flex"
                      flexDirection="column"
                      gap={2}
                      width="100%"
                    >
                      {/* 第一联 */}
                      <Box display="flex" gap={1} alignItems="center">
                        <Typography fontWeight="bold" sx={{ minWidth: 60 }}>
                          {getControlLabel("lbl_first_copy", "第一联")}
                        </Typography>
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={onImportLink2}
                        >
                          {getControlLabel("btn_import_link_2", "ACTR_2191.rdf")}
                        </Button>
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={onImportLink3}
                        >
                          {getControlLabel("btn_import_link_3", "ACTR_2201.rdf")}
                        </Button>
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={onImportLink4}
                        >
                          {getControlLabel("btn_import_link_4", "ACTR_2203.rdf")}
                        </Button>
                      </Box>
                      {/* 第二联 */}
                      <Box display="flex" gap={1} alignItems="center">
                        <Typography fontWeight="bold" sx={{ minWidth: 60 }}>
                          {getControlLabel("lbl_second_copy", "第二联")}
                        </Typography>
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={onImportLink5}
                        >
                          {getControlLabel("btn_import_link_5", "ACTR_2192.rdf")}
                        </Button>
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={onImportLink6}
                        >
                          {getControlLabel("btn_import_link_6", "ACTR_2200.rdf")}
                        </Button>
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={onImportLink7}
                        >
                          {getControlLabel("btn_import_link_7", "ACTR_2201.rdf")}
                        </Button>
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={onImportLink8}
                        >
                          {getControlLabel("btn_import_link_8", "ACTR_2203.rdf")}
                        </Button>
                      </Box>
                    </Box>
                  )}
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
