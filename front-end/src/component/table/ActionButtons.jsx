import { Box, Button } from "@mui/material";
import { useTranslation } from "react-i18next";

const ActionButtons = ({
  row,
  onEdit,
  onDelete,
  onDetail,
  onQr,
  onBar,
  tableName,
}) => {
  const { t } = useTranslation();
  return (
    
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        gap: 1,
      }}
    >
      {tableName !== "USER_PERMISSION" && (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => onEdit(row)}
        >
          {t("Edit")}
        </Button>
      )}
      <Button
        variant="contained"
        color="error"
        size="small"
        onClick={() => onDelete(row)}
      >
        {t("Delete")}
      </Button>
      {tableName !== "USER_PERMISSION" && (
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={() => onDetail(row)}
        >
          {t("Detail")}
        </Button>
      )}
      <Button
        variant="outlined"
        color="secondary"
        size="small"
        onClick={() => onQr(row)}
      >
        {t("QR")}
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        size="small"
        onClick={() => onBar(row)}
      >
        {t("BARCODE")}
      </Button>
    </Box>
  );
};

export default ActionButtons;
