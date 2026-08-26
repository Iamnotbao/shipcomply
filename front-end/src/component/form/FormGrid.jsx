import { Box } from "@mui/material";

export default function FormGrid({ children, columns = 2, sx }) {
  const desktopColumns = Math.max(1, columns);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          md: `repeat(${desktopColumns}, minmax(0, 1fr))`,
        },
        gap: 2,
        alignItems: "start",
        "& > *": { minWidth: 0 },
        "& > .MuiFormControl-root, & > .MuiAutocomplete-root": {
          width: "100%",
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
