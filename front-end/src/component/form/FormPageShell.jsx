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
        borderColor: "#d9e2e7",
        borderRadius: 2.25,
        overflow: "hidden",
        bgcolor: "#f1f5f6",
        boxShadow: "0 4px 16px rgba(15, 23, 42, 0.055)",
      }}
    >
      <Box
        sx={{
          px: { xs: 1.75, md: 2 },
          py: 1.3,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          bgcolor: "#f8fbfb",
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
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: "1.05rem" }}
          >
            {title}
          </Typography>
          {description ? (
            <Typography
              variant="body2"
              sx={{ mt: 0.2, color: "text.secondary", lineHeight: 1.35 }}
            >
              {description}
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Divider />

      <Box component="form" onSubmit={onSubmit}>
        <Stack
          spacing={1.25}
          sx={{
            p: { xs: 1.5, md: 1.75 },
            bgcolor: "#f1f5f6",
            "& .MuiInputBase-root": { bgcolor: "#fff" },
          }}
        >
          {children}
        </Stack>

        <Divider />
        <Box
          sx={{
            px: { xs: 1.75, md: 2 },
            py: 1.15,
            display: "flex",
            justifyContent: "flex-end",
            bgcolor: "#f8fbfb",
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
