import {
  AddRounded,
  AutoAwesomeRounded,
  CalculateRounded,
  CancelOutlined,
  CheckCircleOutlineRounded,
  CloseRounded,
  ContentCopyRounded,
  DeleteOutlineRounded,
  EditOutlined,
  FileDownloadOutlined,
  FileUploadOutlined,
  LinkRounded,
  PrintOutlined,
  RefreshRounded,
  ReplayRounded,
  RestartAltRounded,
  SearchRounded,
  TaskAltRounded,
  TimelineRounded,
  UndoRounded,
  VerifiedOutlined,
} from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";
import { getToolbarActionMeta } from "./toolbarActionMeta";

const ACTION_ICONS = {
  search: SearchRounded,
  add: AddRounded,
  edit: EditOutlined,
  confirm: CheckCircleOutlineRounded,
  undo: UndoRounded,
  close: CloseRounded,
  cancel: CancelOutlined,
  delete: DeleteOutlineRounded,
  export: FileDownloadOutlined,
  import: FileUploadOutlined,
  copy: ContentCopyRounded,
  link: LinkRounded,
  refresh: RefreshRounded,
  generate: AutoAwesomeRounded,
  calculate: CalculateRounded,
  report: TimelineRounded,
  transfer: ReplayRounded,
  extend: TimelineRounded,
  print: PrintOutlined,
  select: TaskAltRounded,
  restore: RestartAltRounded,
  verify: VerifiedOutlined,
  clear: RestartAltRounded,
  plan: TimelineRounded,
  auto: AutoAwesomeRounded,
};

const TONE_PROPS = {
  primary: { color: "primary", variant: "contained" },
  secondary: { color: "secondary", variant: "contained" },
  success: { color: "success", variant: "contained" },
  warning: { color: "warning", variant: "contained" },
  error: { color: "error", variant: "contained" },
  neutral: { color: "inherit", variant: "outlined" },
};

export default function ToolbarActionButton({
  actionKey,
  label,
  onClick,
  loading = false,
  disabled = false,
  startIcon,
  sx,
}) {
  const meta = getToolbarActionMeta(actionKey);
  const Icon = startIcon || ACTION_ICONS[meta.icon] || TaskAltRounded;
  const toneProps = TONE_PROPS[meta.tone] || TONE_PROPS.neutral;

  return (
    <Button
      {...toneProps}
      size="small"
      onClick={onClick}
      disabled={disabled || loading}
      startIcon={
        loading ? <CircularProgress size={15} color="inherit" /> : <Icon fontSize="small" />
      }
      sx={{
        minWidth: "auto",
        minHeight: 34,
        px: 1.35,
        gap: 0.25,
        ...(meta.tone === "neutral" && {
          color: "text.secondary",
          borderColor: "divider",
          backgroundColor: "background.paper",
          "&:hover": {
            borderColor: "primary.main",
            color: "primary.main",
            backgroundColor: "action.hover",
          },
        }),
        ...sx,
      }}
    >
      {label}
    </Button>
  );
}
