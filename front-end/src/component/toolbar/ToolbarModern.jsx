import { forwardRef, useImperativeHandle, useState } from "react";
import { Box, Divider, Toolbar } from "@mui/material";
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

  return (
    <Toolbar
      sx={{
        minHeight: "auto !important",
        maxHeight: 260,
        overflow: "auto",
        display: "flex",
        alignItems: "stretch",
        gap: 2,
        py: tableConfig.filters.length ? 1.25 : 0.75,
        px: 1.25,
      }}
    >
      {tableConfig.filters.length > 0 && (
        <Box
          sx={{
            flex: "1 1 auto",
            minWidth: 0,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 1.25,
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
      )}

      {tableConfig.filters.length > 0 && <Divider orientation="vertical" flexItem />}

      <ToolbarActionGroup
        actions={actions.map((item) => ({ ...item, label: t(item.label) }))}
        sx={{
          flex: "0 0 auto",
          alignContent: "flex-start",
          maxWidth: { xs: "100%", lg: 620 },
        }}
      />

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
  );
});

ToolbarModern.displayName = "ToolbarModern";

export default ToolbarModern;
