import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { useTranslation } from "react-i18next";
const NotificationPermission = ({
  open,
  onClose,
  onConfirm,
  getControlLabel,
  selectFactory,
  selectDepartment,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose}>
      <Box display={"flex"} alignItems={"center"}>
        <DialogTitle
          sx={{ flex: "1" }}
          variant="h5"
          fontWeight={"bold"}
          color="red"
        >
          {getControlLabel("ttl_notification","Program Not Found!")}
        </DialogTitle>
        <Box>
          <Button
            onClick={onClose}
            variant="contained"
            color="warning"
            size="small"
            sx={{ marginRight: "5px" }}
          >
            <ClearIcon />
          </Button>
        </Box>
      </Box>
      <DialogContent>
        <Typography variant="h6" fontWeight={"bold"}>
          {getControlLabel("msg_notification","You don't have any programn in")}({selectFactory?.factory_code} - {selectDepartment?.department_code})
        </Typography>
        <br />
        <Typography variant="h6">{getControlLabel("sub_msg_notification","Please choose another factory with another department")}!</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={onConfirm}>
          {getControlLabel("btn_confirm","Confirm")}
        </Button>
        <Button variant="contained" color="primary" onClick={onClose}>
          {getControlLabel("btn_cancel","Confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default NotificationPermission;
