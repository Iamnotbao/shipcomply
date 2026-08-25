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
const InvoicePrintPopup = ({
  openLink = false,
  onClose,
  onCustomDeclaration,
  onItemDetails,
  getControlLabel,
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
                {getControlLabel("ttl_invoice_print", "Invoice Print")}
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
                  <Box>
                    <Button
                      variant="contained"
                      color="warning"
                //      onClick={onCustomDeclaration}
                    >
                     {getControlLabel("ttl_print_1", "Print Stamp")}
                    </Button>
                  </Box>
                  <Box>
                    <Button
                      variant="contained"
                      color="warning"
                    //  onClick={onCustomDeclaration}
                    >
                      {getControlLabel("ttl_print_2", "No Stamp")}
                    </Button>
                  </Box>
                  <Box>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={onItemDetails}
                    >
                        {getControlLabel("ttl_print_3", "First Sales Invoice")}
                    </Button>
                  </Box>
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
export default InvoicePrintPopup;
