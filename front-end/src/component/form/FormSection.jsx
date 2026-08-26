import { Box, Stack, Typography } from "@mui/material";
import { formSectionSx } from "./formLayoutStyles";

export default function FormSection({ title, description, children, sx }) {
  return (
    <Box sx={{ ...formSectionSx, ...sx }}>
      {(title || description) && (
        <Stack spacing={0.2} sx={{ mb: 1.1 }}>
          {title ? (
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                color: "#0f3f3a",
                fontSize: "0.82rem",
                letterSpacing: "0.01em",
              }}
            >
              {title}
            </Typography>
          ) : null}
          {description ? (
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", lineHeight: 1.35 }}
            >
              {description}
            </Typography>
          ) : null}
        </Stack>
      )}
      {children}
    </Box>
  );
}
