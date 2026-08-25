import { Checkbox } from '@mui/material';

/**
 * Render checkbox cell for boolean values
 * Used for fields like is_default, req_qc
 * Value can be boolean, "Y"/"N", or truthy/falsy
 * 
 * @param {string|boolean} value - Current value ('Y'/'N' or true/false)
 * @param {object} row - Row data object
 * @param {string} field - Field name
 * @param {function} onChange - Callback (event, row, field)
 * @param {boolean} disabled - Disable checkbox
 */
const CheckboxCell = ({ value, row, field, onChange, disabled = false }) => {
  console.log("qa cel",onchange);
  
  const handleChange = (event) => {
    if (onChange) {
      // Match SwitchCell signature: (event, row, field)
      onChange(event, row, field);
    }
  };

  // Only check for "Y" string or true boolean
  const isChecked = value === "Y" || value === true;

  return (
    <Checkbox
      checked={isChecked}
      onChange={handleChange}
      disabled={disabled}
      size="small"
    />
  );
};

export default CheckboxCell;