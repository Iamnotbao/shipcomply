import { Box, Stack, Typography } from "@mui/material";
import { formSectionSx } from "./formLayoutStyles";

export default function FormSection({ title, description, children, sx }) {
  return (
    <Box sx={{ ...formSectionSx, ...sx }}>
      {(title || description) && (
        <Stack spacing={0.35} sx={{ mb: 1.75 }}>
          {title ? (
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 800, color: "text.primary" }}
            >
              {title}
            </Typography>
          ) : null}
          {description ? (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {description}
            </Typography>
          ) : null}
        </Stack>
      )}
      {children}
    </Box>
  );
}
