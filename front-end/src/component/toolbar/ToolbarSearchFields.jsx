import { Box, Checkbox, MenuItem, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import Dropdown from "../dropdown/Dropdown";
import SearchBar from "../search/SearchBar";
import ToolbarDateRangeFields from "./ToolbarDateRangeFields";
import {
  TOOLBAR_DATE_FIELDS,
  getToolbarDropdownValue,
} from "./toolbarUtils";

export default function ToolbarSearchFields({
  filters = [],
  table,
  searchValue,
  setSearchValue,
  getControlLabel,
  language,
  getFetchData = {},
  dropDownValues,
  setDropdownValues,
  isCheckMax,
  onCheckMax,
}) {
  const { t } = useTranslation();

  const statusOptions = [
    { label: getControlLabel("ddl_New-1", "New-1") || "New-1", value: "New" },
    {
      label: getControlLabel("ddl_Cancel-0", "Cancel-0") || "Cancel-0",
      value: "Cancel",
    },
    {
      label: getControlLabel("ddl_Confirm-7", "Confirm-7") || "Confirm-7",
      value: "Confirm",
    },
    {
      label: getControlLabel("ddl_Close-9", "Close-9") || "Close-9",
      value: "Close",
    },
  ];

  const fieldBoxStyles = {
    display: "flex",
    flexDirection: "column",
    gap: 0.5,
    minWidth: 150,
  };

  return filters.map((field, index) => {
    if (field.type === "dropdown" && field.name === "status") {
      return (
        <Box key={`${field.name}-${index}`} sx={fieldBoxStyles}>
          <TextField
            select
            fullWidth
            label={field.title}
            size="small"
            value={searchValue[field.name] || ""}
            onChange={(event) =>
              setSearchValue((prev) => ({
                ...prev,
                [field.name]: event.target.value,
              }))
            }
          >
            <MenuItem value="">{getControlLabel("ddl_None", "None")}</MenuItem>
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {t(option.label)}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      );
    }

    if (field.type === "date" && TOOLBAR_DATE_FIELDS.has(field.name)) {
      return (
        <Box key={`${field.name}-${index}`} sx={fieldBoxStyles}>
          <Typography variant="body2" fontWeight="bold" fontSize="12px">
            {field.title}
          </Typography>
          <TextField
            type="date"
            size="small"
            fullWidth
            value={searchValue[field.name] || ""}
            onChange={(event) =>
              setSearchValue((prev) => ({
                ...prev,
                [field.name]: event.target.value,
              }))
            }
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
      );
    }

    if (field.type === "dateRangeGroup") {
      return (
        <ToolbarDateRangeFields
          key={`${field.name}-${index}`}
          table={table}
          getControlLabel={getControlLabel}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      );
    }

    if (field.name === "is_max") {
      return (
        <Box key={`${field.name}-${index}`} sx={{ display: "flex", alignItems: "center" }}>
          <Typography display="flex" alignItems="center">
            {field.title}
          </Typography>
          <Checkbox checked={isCheckMax === "Y"} onChange={onCheckMax} />
        </Box>
      );
    }

    if (field.type === "dropdown" && field.fetchKey && getFetchData[field.fetchKey]) {
      return (
        <Box key={`${field.name}-${index}`} sx={fieldBoxStyles}>
          <Dropdown
            onFetchData={getFetchData[field.fetchKey]}
            onSelect={(selectedItem) => {
              const value = getToolbarDropdownValue(field.name, selectedItem);

              setSearchValue((prev) => ({
                ...prev,
                [field.name]: value,
                ...(field.name === "packing_seid" && {
                  packing_seid: selectedItem?.se_id ?? "",
                  pack_gu: selectedItem?.pack_gu ?? "",
                  ship_seq: selectedItem?.ship_seq ?? "",
                }),
              }));

              setDropdownValues((prev) => ({
                ...prev,
                [field.name]: value,
              }));
            }}
            defaultValue=""
            select={dropDownValues?.[field.name] || ""}
            table={field.tableName}
            option={field.name}
            getControlLabel={getControlLabel}
            language={language || "E"}
            field={field.title}
            headerField={
              field.name === "cont_no" && field.tableName === "VW_CONT_IMP"
                ? "cont_no_1"
                : field.name
            }
            totalItems={0}
            pageSize={10}
            isSearchMode
          />
        </Box>
      );
    }

    return (
      <Box key={`${field.name}-${index}`} sx={fieldBoxStyles}>
        <SearchBar
          title={field.title}
          name={field.name}
          value={searchValue}
          onChange={setSearchValue}
          type={field.typeInput || "text"}
        />
      </Box>
    );
  });
}
