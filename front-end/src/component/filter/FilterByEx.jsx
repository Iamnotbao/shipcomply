import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import TableColumns from "../table/TableColumns";
import { useTranslation } from "react-i18next";

const FilterByEx = ({ onSetFilter, table }) => {
  const { t } = useTranslation();
  return (
    <FormControl sx={{ minWidth: 120, mr: 2 }}>
      <InputLabel>{t("Status")}</InputLabel>
      <Select
        defaultValue=""
        label={t("Status")}
        onChange={(e) => onSetFilter(e.target.value)}
      >
        <MenuItem value="">{t("None")}</MenuItem>
        {TableColumns[table]?.map((col) => (
          <MenuItem key={col.field} value={col.field}>
            {col.headerName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FilterByEx;
