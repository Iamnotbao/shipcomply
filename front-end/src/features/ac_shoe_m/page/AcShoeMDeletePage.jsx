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
const AcShoeMDeletePage = ({
  shoe,
  open,
  onClose,
  onConfirm,
  selectRows = [],
  tableName,
  title,
  message,
}) => {
  const { t } = useTranslation();
  const titleDelete = {
    DEPARTMENTS: ["department_code", "factory_code"], 
    FACTORY: ["factory_code"],
    USER: ["user_code"],
    SHOES: ["customs_shoe_id"],
  };

 const fields = titleDelete[tableName] || [];
 const value = fields.map((f) => shoe?.[f]).filter(Boolean).join(" - "); 
  console.log("fie", tableName);
  return (
    <Dialog open={open} onClose={onClose}>
      <Box display={"flex"} alignItems={"center"}>
        <DialogTitle
          sx={{ flex: "1" }}
          variant="h5"
          fontWeight={"bold"}
          color="red"
        >
          {selectRows.length > 1
            ? `Delete all IDs: ${selectRows
                .map((item) => item.customs_shoe_id)
                .join(", ")}`
            : `${t(title)}(${value})`}
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
          {t(message)}
          <span style={{ fontWeight: "bold", color: "black" }}>
            {selectRows.length > 1 && shoe.user_code}?
          </span>
        </Typography>
        <br />
        <Typography variant="h6">{t("Are you sure")}?</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={onConfirm}>
          {t("Confirm")}
        </Button>
        <Button variant="contained" color="primary" onClick={onClose}>
          {t("Cancel")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default AcShoeMDeletePage;
