import { Box, Button, Dialog, DialogContent, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const DeleteSePlanOrd = ({
  openLink = false,
  onClose,
  getControlLabel,
  onDelete,
  selectRows = [],
  deleteKeys = [],
}) => {
  const selectedRow = selectRows?.[0];
  const recordId = deleteKeys
    .map((key) => selectedRow?.[key])
    .filter((value) => value !== undefined && value !== null)
    .join("-");

  const message = getControlLabel(
    "ttl_delete_content",
    `Do you want to delete the record with id:${recordId}?`
  );

  return (
    <Dialog open={openLink} onClose={onClose} maxWidth="sm">
      <DialogContent>
        <Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={2}
          >
            <Typography
              variant="h4"
              textTransform="uppercase"
              fontWeight="bold"
              color="red"
              textAlign="center"
              flex={1}
              mb={0}
            >
              {getControlLabel("ttl_delete", "Delete Master")}
            </Typography>

            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Box sx={{ width: "100%" }}>
            <Typography variant="h7" fontWeight="bold">
              {message}
              <span style={{ color: "red" }}>*</span>
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                mt: 2,
              }}
            >
              <Button
                onClick={onDelete}
                variant="contained"
                color="primary"
              >
                {getControlLabel("btn_confirm", "Confirm")}
              </Button>

              <Button
                type="button"
                variant="contained"
                color="error"
                onClick={onClose}
              >
                {getControlLabel("btn_cancel", "Cancel")}
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
export default DeleteSePlanOrd;