import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Paper, Typography } from "@mui/material";

export default function FormPageShell({
  title,
  onBack,
  onSubmit,
  submitLabel = "Save",
  children,
  maxWidth = 1400,
}) {
  return (
    <Paper sx={{ maxWidth, mx: "auto", p: 3 }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb={2}
      >
        {onBack ? (
          <Button
            type="button"
            variant="contained"
            onClick={onBack}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </Button>
        ) : null}
        <Typography
          variant="h4"
          textTransform="uppercase"
          fontWeight={600}
          textAlign="center"
          flex={1}
          mb={0}
        >
          {title}
        </Typography>
      </Box>

      <Box component="form" onSubmit={onSubmit}>
        {children}
        <Box mt={4} display="flex" justifyContent="center">
          <Button type="submit" variant="contained" color="primary" size="large">
            {submitLabel}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
