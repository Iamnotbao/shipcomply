import { Switch } from '@mui/material';

/**
 * Render switch cell for boolean values
 * Used for permission fields (allow_*)
 */
const SwitchCell = ({ value, row, field, onChange, disabled = false }) => {
  const handleChange = (event) => {
    if (onChange) {
      onChange(row, field, event.target.checked);
    }
  };

  return (
    <Switch
      checked={Boolean(value)}
      onChange={handleChange}
      disabled={disabled}
      size="small"
    />
  );
};

export default SwitchCell;
