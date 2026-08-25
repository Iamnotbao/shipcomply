import { forwardRef, useImperativeHandle, useState } from "react";
import { Box, Divider, Toolbar, Typography } from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import { useTranslation } from "react-i18next";
import ToolbarSearchFields from "./ToolbarSearchFields";
import ToolbarActionGroup from "./ToolbarActionGroup";
import {
  createBaseToolbarActions,
  createToolbarAction,
  filterHiddenToolbarActions,
} from "./createToolbarActions";
import {
  createCoreToolbarTableConfig,
  isCoreToolbarTable,
} from "./toolbarCoreTableConfig";
import { sanitizeToolbarSearch } from "./toolbarUtils";
import ToolbarLegacy from "./ToolbarLegacy";

const ToolbarModern = forwardRef((props, ref) => {
  const {
    table,
    subTable,
    getControlLabel,
    onSearch,
    onAdd,
    onEdit,
    onConfirm,
    onUnconfirm,
    onPDF,
    onCancel,
    onClose,
    onBom,
    onCustomExport,
    onMaterialExport,
    onLink,
    onCopy,
    onDelete,
    onImportLink,
    onGeneratePM,
    isLoadingBom,
    language,
    getFetchData = {},
    dropDownValues,
    setDropdownValues,
    isCheckMax,
    onCheckMax,
    fileInputRef,
    onImport,
  } = props;
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState({});

  useImperativeHandle(
    ref,
    () => ({
      setSearchValue,
      setDropdownValues,
      getSearchValue: () => searchValue,
    }),
    [searchValue, setDropdownValues],
  );

  if (subTable || !isCoreToolbarTable(table)) {
    return <ToolbarLegacy {...props} ref={ref} />;
  }

  const tableConfigMap = createCoreToolbarTableConfig({ getControlLabel });
  const tableConfig = tableConfigMap[table] || { filters: [], hideButtons: [] };

  const handleSearch = () => {
    onSearch?.({
      searchTable: table,
      search: sanitizeToolbarSearch(searchValue),
    });
  };

  const baseActions = createBaseToolbarActions({
    getControlLabel,
    onSearch: handleSearch,
    onAdd,
    onEdit,
    onConfirm,
    onUnconfirm,
    onPDF,
    onCancel,
    onClose,
  });

  const extraActions = [];

  if (table === "PERMISSION") {
    extraActions.push(
      createToolbarAction(
        "copy",
        getControlLabel("btn_copy", "Copy"),
        onCopy,
      ),
    );
  }

  if (table === "AC_IMP_MATERIAL_TRACKING") {
    extraActions.push(
      createToolbarAction(
        "export",
        getControlLabel("btn_export_custom", "Export Custom"),
        onCustomExport,
      ),
      createToolbarAction(
        "export",
        getControlLabel("btn_export_material", "Export Material"),
        onMaterialExport,
      ),
      createToolbarAction(
        "import",
        getControlLabel("btn_import_link", "Import Link"),
        onImportLink,
      ),
    );
  }

  if (table === "AC_ITEM_M") {
    extraActions.push(
      createToolbarAction(
        "link",
        getControlLabel("btn_link", "Link"),
        onLink,
      ),
      createToolbarAction(
        "import",
        getControlLabel("btn_import", "Import Order"),
        () => fileInputRef?.current?.click(),
      ),
    );
  }

  if (table === "AC_SHOE_M") {
    extraActions.push(
      createToolbarAction(
        "generate",
        getControlLabel("btn_bom", "BOM"),
        onBom,
        { loading: isLoadingBom },
      ),
      createToolbarAction(
        "import",
        getControlLabel("btn_import", "Import Order"),
        () => fileInputRef?.current?.click(),
      ),
    );
  }

  if (table === "AC_PLAN_SIZE") {
    extraActions.push(
      createToolbarAction(
        "generate",
        getControlLabel("btn_generate_shoe", "Generate Shoe"),
        onGeneratePM,
      ),
    );
  }

  if (["AC_ITEM_REF", "AC_SHOE_REF"].includes(table)) {
    extraActions.push(
      createToolbarAction(
        "delete",
        getControlLabel("btn_delete", "Delete"),
        onDelete,
      ),
    );
  }

  const actions = filterHiddenToolbarActions(
    [...baseActions, ...extraActions],
    tableConfig.hideButtons,
  ).filter((item) => typeof item.onClick === "function");

  const hasFilters = tableConfig.filters.length > 0;

  return (
    <Box
      sx={{
        mx: 0.5,
        mb: 1,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        backgroundColor: "background.paper",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
        overflow: "hidden",
      }}
    >
      <Toolbar
        sx={{
          minHeight: "auto !important",
          maxHeight: 280,
          overflow: "auto",
          display: "flex",
          alignItems: "stretch",
          gap: 1.5,
          py: 1.25,
          px: 1.5,
          "&::-webkit-scrollbar": { height: 8, width: 8 },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#cbd5e1",
            borderRadius: 8,
          },
        }}
      >
        {hasFilters && (
          <Box
            sx={{
              flex: "1 1 auto",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: 0.9,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.65,
                color: "text.secondary",
              }}
            >
              <TuneRoundedIcon sx={{ fontSize: 16 }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 750,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Filters
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1,
              }}
            >
              <ToolbarSearchFields
                filters={tableConfig.filters}
                table={table}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                getControlLabel={getControlLabel}
                language={language}
                getFetchData={getFetchData}
                dropDownValues={dropDownValues}
                setDropdownValues={setDropdownValues}
                isCheckMax={isCheckMax}
                onCheckMax={onCheckMax}
              />
            </Box>
          </Box>
        )}

        {hasFilters && <Divider orientation="vertical" flexItem />}

        <Box
          sx={{
            flex: "0 0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 0.9,
            minWidth: { xs: "100%", md: 260 },
            maxWidth: { xs: "100%", xl: 680 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.65,
              color: "text.secondary",
            }}
          >
            <BoltRoundedIcon sx={{ fontSize: 16 }} />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 750,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Actions
            </Typography>
          </Box>

          <ToolbarActionGroup
            actions={actions.map((item) => ({ ...item, label: t(item.label) }))}
            sx={{
              justifyContent: "flex-start",
              alignContent: "flex-start",
            }}
          />
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: "none" }}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImport?.(file);
            event.target.value = "";
          }}
        />
      </Toolbar>
    </Box>
  );
});

ToolbarModern.displayName = "ToolbarModern";

export default ToolbarModern;
