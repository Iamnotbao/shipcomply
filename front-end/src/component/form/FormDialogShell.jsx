import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  formDialogActionsSx,
  formDialogContentSx,
  formDialogHeaderSx,
  formDialogSx,
} from "./formLayoutStyles";

export default function FormDialogShell({
  open,
  onClose,
  title,
  description,
  children,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  submitDisabled = false,
  maxWidth = "md",
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      sx={formDialogSx}
    >
      <Box sx={formDialogHeaderSx}>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, lineHeight: 1.25, color: "text.primary" }}
          >
            {title}
          </Typography>
          {description ? (
            <Typography
              variant="body2"
              sx={{ mt: 0.5, color: "text.secondary", maxWidth: 720 }}
            >
              {description}
            </Typography>
          ) : null}
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{ mt: -0.25, flexShrink: 0 }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider />

      <Box component="form" onSubmit={onSubmit}>
        <DialogContent sx={formDialogContentSx}>{children}</DialogContent>
        <Divider />
        <DialogActions sx={formDialogActionsSx}>
          <Stack direction="row" spacing={1}>
            <Button type="button" variant="outlined" onClick={onClose}>
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitDisabled}
            >
              {submitLabel}
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
