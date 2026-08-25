import {
  Box,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getDropdownCodeField,
  getDropdownDisplayLabel,
  getDropdownItemCode,
  getDropdownTitles,
  getDropdownWidth,
  getSelectedDropdownCode,
} from "./dropdownConfig";
import useDropdownData from "./useDropdownData";

const SEARCH_VALUE = "__search__";
const PAGINATION_VALUE = "__pagination__";

const Dropdown = ({
  data = [],
  onSelect,
  select = null,
  table = "FACTORY",
  option = "factory",
  isCentered = false,
  getControlLabel = (key, defaultValue) => defaultValue,
  language = "en",
  field = null,
  headerField = null,
  onFetchData,
  totalItems = 0,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  defaultValue = "",
  isSearchMode = false,
}) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const menuItemRefs = useRef({});
  const itemWasSelectedRef = useRef(false);

  const codeField = useMemo(
    () => getDropdownCodeField(table, headerField),
    [table, headerField],
  );

  const selectedCode = useMemo(
    () => getSelectedDropdownCode(select || defaultValue, table, codeField),
    [select, defaultValue, table, codeField],
  );

  const titles = useMemo(
    () => getDropdownTitles({ getControlLabel, t, field }),
    [getControlLabel, t, field],
  );

  const {
    loading,
    localData,
    apiTotalItems,
    apiPageSize,
    setApiPageSize,
    enableApiSearch,
  } = useDropdownData({
    data,
    onFetchData,
    table,
    currentPage,
    pageSize,
    searchText,
    isOpen,
    totalItems,
  });

  const getDisplayLabel = (item) =>
    getDropdownDisplayLabel({
      item,
      table,
      option,
      codeField,
      headerField,
      language,
    });

  const filteredData = useMemo(() => {
    if (enableApiSearch) return localData;
    if (!searchText) return localData;

    const query = searchText.toLowerCase();
    return localData.filter((item) =>
      getDropdownDisplayLabel({
        item,
        table,
        option,
        codeField,
        headerField,
        language,
      })
        .toLowerCase()
        .includes(query),
    );
  }, [
    enableApiSearch,
    localData,
    searchText,
    table,
    option,
    codeField,
    headerField,
    language,
  ]);

  const totalPages = enableApiSearch
    ? Math.ceil(apiTotalItems / Math.max(apiPageSize, 1))
    : Math.ceil(filteredData.length / Math.max(pageSize, 1));

  const selectedItem = useMemo(() => {
    const source = localData.length > 0 ? localData : Array.isArray(data) ? data : [];
    return source.find(
      (item) => getDropdownItemCode(item, table, codeField) === selectedCode,
    );
  }, [localData, data, table, codeField, selectedCode]);

  useEffect(() => {
    if (enableApiSearch && searchText !== "") {
      setCurrentPage(1);
    }
  }, [searchText, enableApiSearch]);

  useEffect(() => {
    if (!isOpen || filteredData.length === 0) return;

    const selectedIndex = filteredData.findIndex(
      (item) => getDropdownItemCode(item, table, codeField) === selectedCode,
    );
    setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [isOpen, filteredData, selectedCode, table, codeField]);

  useEffect(() => {
    if (!isOpen) return;
    menuItemRefs.current[focusedIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [focusedIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (filteredData.length === 0) return;
      if (!["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) return;

      event.preventDefault();
      event.stopPropagation();

      if (event.key === "ArrowDown") {
        if (focusedIndex < filteredData.length - 1) {
          setFocusedIndex((previous) => previous + 1);
        } else if (currentPage < totalPages) {
          setCurrentPage((previous) => previous + 1);
          setFocusedIndex(0);
        }
      }

      if (event.key === "ArrowUp") {
        if (focusedIndex > 0) {
          setFocusedIndex((previous) => previous - 1);
        } else if (currentPage > 1) {
          setCurrentPage((previous) => previous - 1);
          setFocusedIndex(0);
        }
      }

      if (event.key === "Enter") {
        menuItemRefs.current[focusedIndex]?.click();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, filteredData, focusedIndex, currentPage, totalPages]);

  const resetTransientState = () => {
    setSearchText("");
    setCurrentPage(1);
    setFocusedIndex(0);
  };

  const handleClose = () => {
    if (
      isSearchMode &&
      searchText.trim() !== "" &&
      !itemWasSelectedRef.current
    ) {
      onSelect?.({ [codeField]: searchText.trim() });
    }

    itemWasSelectedRef.current = false;
    setIsOpen(false);
    resetTransientState();
  };

  const handleChange = (event) => {
    const value = event.target.value;
    if (value === SEARCH_VALUE || value === PAGINATION_VALUE) return;

    itemWasSelectedRef.current = true;
    const item = localData.find(
      (entry) => getDropdownItemCode(entry, table, codeField) === value,
    );

    onSelect?.(item || { [codeField]: value });
  };

  const handlePageSizeChange = (event) => {
    event.stopPropagation();
    setApiPageSize(Number.parseInt(event.target.value, 10));
    setCurrentPage(1);
    setFocusedIndex(0);
  };

  const movePage = (event, direction) => {
    event.stopPropagation();
    setCurrentPage((previous) => {
      const next = previous + direction;
      return Math.min(Math.max(next, 1), Math.max(totalPages, 1));
    });
    setFocusedIndex(0);
  };

  const renderSelectedValue = (selected) => {
    if (!selected || selected === SEARCH_VALUE || selected === PAGINATION_VALUE) {
      return "";
    }

    if (selectedItem) {
      if (table === "AC_CONT_D_1" && option === "price") {
        return String(selectedItem.price ?? "");
      }
      if (table === "AC_CONT_D_1" && option === "ac_itemno") {
        return String(selectedItem.goods_code ?? "");
      }
      if (table === "SD_PACK_M") return String(selectedItem.se_id ?? "");
      return getDisplayLabel(selectedItem);
    }

    if (typeof selected === "string" && selected.includes("__")) {
      return selected.split("__")[0];
    }
    return selected;
  };

  if (!onSelect) {
    return (
      <TextField
        fullWidth
        value={selectedItem ? getDisplayLabel(selectedItem) : ""}
        label={titles[option]}
        slotProps={{ input: { readOnly: true } }}
      />
    );
  }

  const globalFocusedIndex =
    filteredData.length > 0
      ? (currentPage - 1) * apiPageSize + focusedIndex + 1
      : 0;

  return (
    <FormControl
      size="small"
      sx={{
        minWidth: 110,
        width: getDropdownWidth(table),
        display: "flex",
        ml: "auto",
        mt: isCentered ? "6px" : 0,
      }}
    >
      <InputLabel id={`dropdown-${table}-${option}-label`}>
        {titles[option]}
      </InputLabel>

      <Select
        labelId={`dropdown-${table}-${option}-label`}
        value={selectedCode}
        label={titles[option]}
        onOpen={() => setIsOpen(true)}
        onClose={handleClose}
        onChange={handleChange}
        renderValue={renderSelectedValue}
        MenuProps={{
          autoFocus: false,
          marginThreshold: 48,
          PaperProps: {
            sx: {
              maxHeight: { xs: "calc(100vh - 100px)", sm: "calc(100vh - 96px)" },
              "& .MuiList-root": { p: 0 },
            },
          },
        }}
      >
        <MenuItem
          value={SEARCH_VALUE}
          disableRipple
          onMouseDown={(event) => event.preventDefault()}
          onKeyDown={(event) => {
            if (!["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) {
              event.stopPropagation();
            }
          }}
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            p: 1,
            bgcolor: "background.paper !important",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <TextField
            size="small"
            fullWidth
            autoFocus
            placeholder={t("Search...") || "Search..."}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (!["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) {
                event.stopPropagation();
              }
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </MenuItem>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : filteredData.length > 0 ? (
          filteredData.map((item, index) => {
            const itemCode = getDropdownItemCode(item, table, codeField);
            const isSelected = itemCode === selectedCode;
            const isFocused = index === focusedIndex;

            return (
              <MenuItem
                key={`${itemCode}-${index}`}
                value={itemCode}
                ref={(element) => {
                  if (element) menuItemRefs.current[index] = element;
                }}
                onClick={(event) => event.stopPropagation()}
                sx={{
                  bgcolor: isFocused
                    ? "action.hover"
                    : isSelected
                      ? "action.selected"
                      : "transparent",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                {getDisplayLabel(item)}
              </MenuItem>
            );
          })
        ) : (
          <MenuItem disabled>
            <Typography>{t("No results found") || "No results"}</Typography>
          </MenuItem>
        )}

        {enableApiSearch && totalPages > 0 && (
          <MenuItem
            value={PAGINATION_VALUE}
            disableRipple
            onMouseDown={(event) => event.preventDefault()}
            sx={{
              position: "sticky",
              bottom: 0,
              zIndex: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
              p: "8px 12px",
              bgcolor: "background.paper !important",
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Select
              size="small"
              value={apiPageSize}
              onChange={handlePageSizeChange}
              onClick={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
              sx={{ minWidth: 64, height: 28, "& .MuiSelect-select": { py: 0.5 } }}
            >
              {pageSizeOptions.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                size="small"
                disabled={currentPage <= 1 || loading}
                onClick={(event) => movePage(event, -1)}
              >
                <NavigateBeforeIcon fontSize="small" />
              </IconButton>

              <Typography variant="caption" sx={{ minWidth: 100, textAlign: "center" }}>
                {globalFocusedIndex} / {apiTotalItems}
              </Typography>

              <IconButton
                size="small"
                disabled={currentPage >= totalPages || loading}
                onClick={(event) => movePage(event, 1)}
              >
                <NavigateNextIcon fontSize="small" />
              </IconButton>
            </Box>
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default Dropdown;
