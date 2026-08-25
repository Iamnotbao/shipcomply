import { TextField } from "@mui/material";

export default function ReadOnlyField({ value, ...props }) {
  return (
    <TextField
      fullWidth
      value={value ?? ""}
      InputLabelProps={{ shrink: true, ...props.InputLabelProps }}
      InputProps={{ readOnly: true, ...props.InputProps }}
      {...props}
    />
  );
}
