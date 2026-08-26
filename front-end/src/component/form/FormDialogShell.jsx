import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Paper,
  Typography,
} from "@mui/material";

export default function FormDialogShell({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = "Save",
  submitDisabled = false,
  maxWidth,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={Boolean(maxWidth)}>
      <DialogContent>
        <Paper sx={{ maxWidth: "1200px", mx: "auto", p: 3 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={2}
          >
            <Typography
              variant="h4"
              textTransform="uppercase"
              fontWeight={600}
              gutterBottom
              textAlign="center"
              flex={1}
              mb={0}
            >
              {title}
            </Typography>
            <Button onClick={onClose} variant="contained" color="error">
              <CloseIcon />
            </Button>
          </Box>

          <Box component="form" onSubmit={onSubmit}>
            {children}
            <Box mt={4}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitDisabled}
              >
                {submitLabel}
              </Button>
            </Box>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
}
