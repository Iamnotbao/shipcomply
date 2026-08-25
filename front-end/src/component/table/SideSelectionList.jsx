import { Box, List, ListItemButton, ListItemText, Typography } from "@mui/material";

export default function SideSelectionList({
  title,
  items = [],
  getKey,
  isSelected,
  onSelect,
  getPrimary,
  getSecondary,
  Icon,
}) {
  return (
    <Box
      sx={{
        minHeight: "100%",
        px: 1,
        py: 1.25,
        borderRight: { md: "1px solid" },
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          px: 0.75,
          pb: 1,
          mb: 0.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {Icon && <Icon sx={{ fontSize: 18, color: "primary.main" }} />}
        <Typography
          variant="subtitle2"
          sx={{
            color: "text.primary",
            fontWeight: 750,
            fontSize: "0.78rem",
            letterSpacing: "0.02em",
          }}
        >
          {title}
        </Typography>
        <Box
          component="span"
          sx={{
            ml: "auto",
            px: 0.7,
            py: 0.15,
            borderRadius: 10,
            backgroundColor: "action.hover",
            color: "text.secondary",
            fontSize: "0.68rem",
            fontWeight: 700,
          }}
        >
          {items.length}
        </Box>
      </Box>

      <List disablePadding sx={{ display: "grid", gap: 0.35 }}>
        {items.map((item) => {
          const selected = isSelected?.(item) ?? false;

          return (
            <ListItemButton
              key={getKey(item)}
              selected={selected}
              onClick={() => onSelect?.(item)}
              sx={{
                position: "relative",
                minHeight: 48,
                px: 1.15,
                py: 0.65,
                borderRadius: 1.5,
                border: "1px solid transparent",
                alignItems: "center",
                transition:
                  "background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease, transform 80ms ease",
                "&:hover": {
                  backgroundColor: "action.hover",
                  borderColor: "divider",
                },
                "&.Mui-selected": {
                  backgroundColor: "#ecfdf5",
                  borderColor: "rgba(15, 118, 110, 0.20)",
                  boxShadow: "inset 3px 0 0 #0f766e",
                },
                "&.Mui-selected:hover": {
                  backgroundColor: "#d1fae5",
                  borderColor: "rgba(15, 118, 110, 0.28)",
                },
                "&:active": {
                  transform: "translateY(1px)",
                },
              }}
            >
              <ListItemText
                primary={getPrimary?.(item) ?? ""}
                secondary={getSecondary?.(item) ?? ""}
                slotProps={{
                  primary: {
                    noWrap: true,
                    sx: {
                      fontSize: "0.78rem",
                      fontWeight: selected ? 750 : 650,
                      color: selected ? "primary.dark" : "text.primary",
                    },
                  },
                  secondary: {
                    noWrap: true,
                    sx: {
                      mt: 0.15,
                      fontSize: "0.71rem",
                      color: "text.secondary",
                    },
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {items.length === 0 && (
        <Box
          sx={{
            px: 1,
            py: 2.5,
            textAlign: "center",
            color: "text.secondary",
            fontSize: "0.75rem",
          }}
        >
          No data
        </Box>
      )}
    </Box>
  );
}
