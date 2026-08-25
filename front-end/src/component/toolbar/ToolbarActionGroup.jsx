import { Box } from "@mui/material";
import ToolbarActionButton from "./ToolbarActionButton";

export default function ToolbarActionGroup({ actions = [], sx }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        flexWrap: "wrap",
        gap: 0.75,
        ...sx,
      }}
    >
      {actions.map((action, index) => (
        <ToolbarActionButton
          key={action.key || `${action.actionKey}-${index}`}
          actionKey={action.actionKey}
          label={action.label}
          onClick={action.onClick}
          loading={action.loading || action.isLoading}
          disabled={action.disabled}
          startIcon={action.startIcon}
          sx={action.sx}
        />
      ))}
    </Box>
  );
}
