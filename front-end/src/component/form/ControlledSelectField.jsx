import { MenuItem, TextField } from "@mui/material";
import { Controller } from "react-hook-form";

export default function ControlledSelectField({
  name,
  control,
  label,
  options = [],
  ...textFieldProps
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          select
          fullWidth
          label={label}
          {...field}
          {...textFieldProps}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
