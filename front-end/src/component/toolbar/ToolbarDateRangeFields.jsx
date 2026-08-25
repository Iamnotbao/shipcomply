import { Box, TextField, Typography } from "@mui/material";
import { getToolbarDateRangeConfig } from "./toolbarDateConfig";

const DateRangeRow = ({ index, label, searchValue, setSearchValue }) => {
  const startKey = `s_date_${index}`;
  const endKey = `e_date_${index}`;

  const updateValue = (key) => (event) => {
    setSearchValue((prev) => ({
      ...prev,
      [key]: event.target.value,
    }));
  };

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <Typography fontSize="13px" fontWeight="bold" sx={{ flexShrink: 0 }}>
        {label}
      </Typography>
      <TextField
        type="date"
        size="small"
        sx={{ width: 140 }}
        value={searchValue[startKey] || ""}
        onChange={updateValue(startKey)}
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>-</Typography>
      <TextField
        type="date"
        size="small"
        sx={{ width: 140 }}
        value={searchValue[endKey] || ""}
        onChange={updateValue(endKey)}
        slotProps={{ inputLabel: { shrink: true } }}
      />
    </Box>
  );
};

export default function ToolbarDateRangeFields({
  table,
  getControlLabel,
  searchValue,
  setSearchValue,
}) {
  const { rows } = getToolbarDateRangeConfig(table, getControlLabel);

  return (
    <Box
      sx={{
        flexBasis: "100%",
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 1,
        alignItems: "center",
        flex: "1 1 auto",
        minWidth: 0,
      }}
    >
      {rows.map((row, index) => (
        <DateRangeRow
          key={`${table}-date-range-${index + 1}`}
          index={index + 1}
          label={row.label}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      ))}
    </Box>
  );
}
