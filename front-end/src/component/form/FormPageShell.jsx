import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";

export default function FormPageShell({
  title,
  description,
  onBack,
  onSubmit,
  submitLabel = "Save",
  children,
  maxWidth = 1200,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth,
        mx: "auto",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2.5,
        overflow: "hidden",
        bgcolor: "background.paper",
        boxShadow: "0 4px 18px rgba(15, 23, 42, 0.06)",
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 2.5 },
          py: 1.75,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          bgcolor: "#fbfdff",
        }}
      >
        {onBack ? (
          <Button
            type="button"
            variant="outlined"
            onClick={onBack}
            startIcon={<ArrowBackRoundedIcon />}
            sx={{ flexShrink: 0 }}
          >
            Back
          </Button>
        ) : null}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.25 }}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" sx={{ mt: 0.35, color: "text.secondary" }}>
              {description}
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Divider />

      <Box component="form" onSubmit={onSubmit}>
        <Stack spacing={2} sx={{ p: { xs: 2, md: 2.5 } }}>
          {children}
        </Stack>

        <Divider />
        <Box
          sx={{
            px: { xs: 2, md: 2.5 },
            py: 1.5,
            display: "flex",
            justifyContent: "flex-end",
            bgcolor: "#fbfdff",
          }}
        >
          <Button type="submit" variant="contained" color="primary">
            {submitLabel}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
