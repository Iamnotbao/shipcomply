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
const VerifyRemainPopup = ({
  openLink = false,
  onClose,
  onOpenSizeLink,
  onSave,
  getControlLabel,
  message,
  onUpdateQty,
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
                {message}
              </Typography>
              <Button onClick={onClose} variant="contained" color="error">
                <CloseIcon />
              </Button>
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
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onUpdateQty}
                >
                  {getControlLabel("btn_ok", "Ok")}
                </Button>
              </Box>
              <Box>
                <Button variant="contained" color="error" onClick={onClose}>
                  {getControlLabel("btn_cancel", "Cancel")}
                </Button>
              </Box>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default VerifyRemainPopup;
