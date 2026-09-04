import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const NotificationPermission = ({
  open,
  onClose,
  onConfirm,
  getControlLabel,
  selectFactory,
  selectDepartment,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    fullWidth
    maxWidth="sm"
    PaperProps={{ sx: { borderRadius: 2.5 } }}
  >
    <DialogTitle sx={{ pr: 6, pb: 1 }}>
      <Typography variant="h6" fontWeight={700}>
        {getControlLabel("ttl_notification", "Program Not Found!")}
      </Typography>
      <IconButton
        aria-label={getControlLabel("btn_cancel", "Close")}
        onClick={onClose}
        size="small"
        sx={{ position: "absolute", right: 12, top: 12 }}
      >
        <CloseRoundedIcon fontSize="small" />
      </IconButton>
    </DialogTitle>

    <DialogContent sx={{ pt: 1 }}>
      <Alert severity="warning" variant="outlined">
        <AlertTitle sx={{ fontWeight: 700 }}>
          {getControlLabel(
            "msg_notification",
            "You do not have any available program in this workspace.",
          )}
        </AlertTitle>
        <Typography variant="body2">
          {selectFactory?.factory_code || "-"} -{" "}
          {selectDepartment?.department_code || "-"}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.75 }}>
          {getControlLabel(
            "sub_msg_notification",
            "Please choose another factory or department.",
          )}
        </Typography>
      </Alert>
    </DialogContent>

    <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
      <Button onClick={onClose} color="inherit">
        {getControlLabel("btn_cancel", "Cancel")}
      </Button>
      <Button variant="contained" onClick={onConfirm}>
        {getControlLabel("btn_confirm", "Confirm")}
      </Button>
    </DialogActions>
  </Dialog>
);

export default NotificationPermission;
