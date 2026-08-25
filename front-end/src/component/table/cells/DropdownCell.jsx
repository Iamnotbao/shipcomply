import { Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';

/**
 * Render dropdown cell for level selection
 * Used for query_level and modify_level fields
 * Levels: 0, 1, 2, 3, 4
 */
const DropdownCell = ({ value, row, field, onChange, disabled = false }) => {
  const { t } = useTranslation();
  
  const levels = [0, 1, 2, 3, 4];

  const handleChange = (event) => {
    if (onChange) {
      onChange(row, field, event.target.value);
    }
  };

  return (
    <Select
      value={value || 0}
      onChange={handleChange}
      disabled={disabled}
      size="small"
      fullWidth
    >
      {levels.map((level) => (
        <MenuItem key={level} value={level}>
          {t(`Level ${level}`)}
        </MenuItem>
      ))}
    </Select>
  );
};

export default DropdownCell;
