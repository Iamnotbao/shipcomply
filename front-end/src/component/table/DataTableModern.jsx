import { Box, IconButton, MenuItem, Select, Typography } from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { DataGrid } from "@mui/x-data-grid";
import React, { useCallback, useMemo, useRef, useState } from "react";
import moment from "moment/moment";
import ToolbarKit from "../toolbar/Toolbar";
import { getRowId as getRowIdUtil } from "../../utils/table";
import { getPageSizeOptions, getTableHeight } from "../../constants/table";
import useAuth from "../../hooks/useAuth";
import useTableData from "./hooks/useTableData";
import useTableSelection from "./hooks/useTableSelection";
import useTablePagination from "./hooks/useTablePagination";
import useTableKeyboardNavigation from "./hooks/useTableKeyboardNavigation";
import useModernTableColumns from "./hooks/useModernTableColumns.jsx";

function ModernFooter({
  selectedRow,
  getColumnLabel,
  paginationModel,
  rowsLength,
  totalData,
  hasMore,
  tableName,
  onPaginationModelChange,
}) {
  const fields = [
    ["grt_dept", "grt_dept"],
    ["grt_user", "grt_user"],
    ["grt_date", "grt_date"],
    ["last_user", "last_user"],
    ["last_date", "last_date"],
  ];
  const pageSizeOptions = getPageSizeOptions(tableName);
  const currentPage = paginationModel.page;
  const currentPageSize = paginationModel.pageSize;
  const knownPageCount = totalData > 0 ? Math.ceil(totalData / currentPageSize) : null;
  const canGoNext = knownPageCount
    ? currentPage < knownPageCount - 1
    : hasMore || rowsLength >= currentPageSize;

  return (
    <Box
      sx={{
        minHeight: 48,
        px: 1.25,
        py: 0.75,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        flexWrap: "wrap",
        borderTop: "1px solid",
        borderColor: "divider",
        backgroundColor: "#fbfdff",
      }}
    >
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", minWidth: 0 }}>
        {fields.map(([key, fallback]) => {
          const rawValue = selectedRow?.[key];
          const value =
            rawValue && key.endsWith("date")
              ? moment(rawValue).format("YYYY-MM-DD HH:mm")
              : rawValue || "—";

          return (
            <Box key={key} sx={{ minWidth: 110 }}>
              <Typography
                variant="caption"
                sx={{ display: "block", color: "text.secondary", fontWeight: 700 }}
              >
                {getColumnLabel?.(key, fallback) || fallback}
              </Typography>
              <Typography
                variant="body2"
                noWrap
                title={String(value)}
                sx={{ fontSize: "0.75rem", color: "text.primary", maxWidth: 180 }}
              >
                {value}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <IconButton
          size="small"
          disabled={currentPage === 0}
          onClick={() =>
            onPaginationModelChange({
              page: currentPage - 1,
              pageSize: currentPageSize,
            })
          }
        >
          <ChevronLeftRoundedIcon fontSize="small" />
        </IconButton>

        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
          {rowsLength === 0 ? 0 : currentPage + 1}
          {knownPageCount ? ` of ${knownPageCount}` : ""}
        </Typography>

        <IconButton
          size="small"
          disabled={!canGoNext}
          onClick={() =>
            onPaginationModelChange({
              page: currentPage + 1,
              pageSize: currentPageSize,
            })
          }
        >
          <ChevronRightRoundedIcon fontSize="small" />
        </IconButton>

        <Select
          size="small"
          value={currentPageSize}
          onChange={(event) =>
            onPaginationModelChange({
              page: 0,
              pageSize: Number(event.target.value),
            })
          }
          sx={{ minWidth: 72, fontSize: "0.76rem" }}
        >
          {pageSizeOptions.map((size) => (
            <MenuItem key={size} value={size}>
              {size}
            </MenuItem>
          ))}
        </Select>

        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {rowsLength} row{rowsLength === 1 ? "" : "s"}
          {totalData ? ` / ${totalData}` : ""}
        </Typography>
      </Box>
    </Box>
  );
}

export default function DataTableModern(props) {
  const {
    data = [],
    tableName,
    onSearch,
    filter,
    onSetFilter,
    onAdd,
    onEdit,
    onDelete,
    onDeleteAll,
    onCancel,
    onConfirm,
    onLink,
    onClose,
    onDetail,
    onCheck,
    onSelectChange,
    selectRows = [],
    subTable = false,
    subTableName,
    onFile,
    file,
    onImport,
    onExport,
    onExcelWithCondition,
    onUnconfirm,
    onCustomExport,
    onMaterialExport,
    onPDF,
    onBom,
    onVNImport,
    onDirectImport,
    isSearch,
    columnTranslations = [],
    controlTranslations = [],
    language,
    getControlLabel,
    getColumnLabel,
    checkboxSelection,
    onSelectionChange,
    onPageChange,
    total,
    onCheckMax,
    isCheckMax,
    selectCheckRef,
    onCopy,
    onExtend,
    onConfirmAll,
    onApprove,
    onAddContractNumber,
    totalData = 0,
    currentPage,
    currentPageSize,
    isLoadingBom,
    onFetchData,
    dropDownValues,
    setDropdownValues,
    onAutoAdd,
    onExchangeRate,
    hasMore,
    onPlanOrd,
    onPlanDate,
    onPDD,
    onConfirmPD,
    onRefreshGW,
    onRefreshSeq,
    type = "1",
    onGenerateGC,
    onTransfer,
    onRefreshPrice,
    onReport,
    onSelectCustoms,
    onUpdateNWGW,
    getFetchData,
    ref,
    onInvoicePrint,
    onExcelList,
    onExportWOSList,
    onExcelDetail,
    onExcelSummary,
    onCalculateTrial,
    onUnclose,
    onOutExcel,
    onVerifyRemain,
    onRestoreStatus,
    onExcel2,
    onGenOrderMaterial,
    onCalculateWriteOff,
    onExcelShoe,
    onExcelWriteOff,
    onImportShipment,
    onExportSummary,
    onCustomReport,
    fileInputRef,
    importFileName,
    setImportFileName,
    onMaterialOut,
    onMaterialEnd,
    onShipOrder,
    onPp026Excel,
    onClearImport,
    isToolbar = true,
    onGeneratePM,
    onImportLink,
  } = props;

  const { user } = useAuth();
  const title = tableName === "USER_PERMISSION_DEPARTMENT" ? "PERMISSION" : tableName;
  const gridRef = useRef(null);
  const focusIndexRef = useRef(0);
  const focusContextRef = useRef("table");
  const [focusIndex, setFocusIndex] = useState(0);
  const [, setFocusContext] = useState("table");
  const [, setIsFocused] = useState(false);

  const { rows } = useTableData(data);
  const getRowId = useCallback((row) => getRowIdUtil(row, tableName), [tableName]);
  const columns = useModernTableColumns({
    tableName,
    language,
    columnTranslations,
    getColumnLabel,
    showAllLanguages: user?.user_code === "admin",
  });

  const { paginationModel, handlePaginationModelChange } = useTablePagination({
    title,
    tableName,
    currentPage,
    currentPageSize,
    onPageChange,
    gridRef,
    focusIndexRef,
    setFocusIndex,
  });

  const {
    selectedIds,
    handleRowClick,
    handleRowSelectionChange,
    getRowClassName,
  } = useTableSelection({
    rows,
    selectRows,
    getRowId,
    onSelectChange,
    onSelectionChange,
    selectCheckRef,
    isSubTable: false,
    gridRef,
    setFocusContext,
    setIsFocused,
    focusContextRef,
    focusIndexRef,
    setFocusIndex,
  });

  const { handleKeyDown } = useTableKeyboardNavigation({
    rows,
    getRowId,
    focusIndex,
    setFocusIndex,
    focusIndexRef,
    paginationModel,
    handlePaginationModelChange,
    totalData,
    isSearch,
    hasMore,
    onSelectChange,
    selectRows,
    onAdd,
    onEdit,
    onDelete,
    onDetail,
    gridRef,
  });

  const selectionKey = selectedIds.join("\u001f");
  const rowSelectionModel = useMemo(
    () => ({
      type: "include",
      ids: new Set(selectionKey ? selectionKey.split("\u001f") : []),
    }),
    [selectionKey],
  );

  const selectedRow = selectRows?.[0] || null;
  const tableHeight = getTableHeight(title);
  const effectiveRowCount =
    totalData > 0
      ? totalData
      : hasMore
        ? (paginationModel.page + 2) * paginationModel.pageSize
        : paginationModel.page * paginationModel.pageSize + rows.length;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      {isToolbar && (
        <ToolbarKit
          table={title}
          onSetFilter={onSetFilter}
          onAdd={onAdd}
          onEdit={onEdit}
          onPDF={onPDF}
          onSearch={onSearch}
          onCancel={onCancel}
          onConfirm={onConfirm}
          onUnconfirm={onUnconfirm}
          onLink={onLink}
          onClose={onClose}
          onBom={onBom}
          onCustomExport={onCustomExport}
          onMaterialExport={onMaterialExport}
          onExcelWithCondition={onExcelWithCondition}
          onDeleteAll={onDeleteAll}
          onCheck={onCheck}
          filter={filter}
          subTable={subTable}
          subTableName={subTableName}
          total={total}
          onExport={onExport}
          onFile={onFile}
          onImport={onImport}
          file={file}
          controlTranslations={controlTranslations}
          language={language}
          getControlLabel={getControlLabel}
          onDirectImport={onDirectImport}
          onVNImport={onVNImport}
          onCheckMax={onCheckMax}
          isCheckMax={isCheckMax}
          onCopy={onCopy}
          onExtend={onExtend}
          onConfirmAll={onConfirmAll}
          onApprove={onApprove}
          onAddContractNumber={onAddContractNumber}
          isLoadingBom={isLoadingBom}
          onFetchData={onFetchData}
          dropDownValues={dropDownValues}
          setDropdownValues={setDropdownValues}
          onAutoAdd={onAutoAdd}
          onExchangeRate={onExchangeRate}
          onPlanOrd={onPlanOrd}
          onPlanDate={onPlanDate}
          onPDD={onPDD}
          onDelete={onDelete}
          onConfirmPD={onConfirmPD}
          onRefreshGW={onRefreshGW}
          onRefreshSeq={onRefreshSeq}
          type={type}
          onGenerateGC={onGenerateGC}
          onTransfer={onTransfer}
          onRefreshPrice={onRefreshPrice}
          onReport={onReport}
          onSelectCustoms={onSelectCustoms}
          onUpdateNWGW={onUpdateNWGW}
          getFetchData={getFetchData}
          ref={ref}
          onInvoicePrint={onInvoicePrint}
          onExcelList={onExcelList}
          onExportWOSList={onExportWOSList}
          onExcelDetail={onExcelDetail}
          onExcelSummary={onExcelSummary}
          onCalculateTrial={onCalculateTrial}
          onUnclose={onUnclose}
          onOutExcel={onOutExcel}
          onVerifyRemain={onVerifyRemain}
          onRestoreStatus={onRestoreStatus}
          onExcel2={onExcel2}
          onGenOrderMaterial={onGenOrderMaterial}
          onCalculateWriteOff={onCalculateWriteOff}
          onExcelShoe={onExcelShoe}
          onExcelWriteOff={onExcelWriteOff}
          onImportShipment={onImportShipment}
          onExportSummary={onExportSummary}
          onCustomReport={onCustomReport}
          fileInputRef={fileInputRef}
          importFileName={importFileName}
          setImportFileName={setImportFileName}
          onMaterialOut={onMaterialOut}
          onMaterialEnd={onMaterialEnd}
          onShipOrder={onShipOrder}
          onPp026Excel={onPp026Excel}
          onClearImport={onClearImport}
          onGeneratePM={onGeneratePM}
          onImportLink={onImportLink}
        />
      )}

      <Box
        ref={gridRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={() => {
          focusContextRef.current = "table";
          setFocusContext("table");
          setIsFocused(true);
        }}
        sx={{
          flex: 1,
          minHeight: tableHeight || 360,
          outline: "none",
          overflow: "hidden",
          borderRadius: 2.5,
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          rowHeight={38}
          columnHeaderHeight={42}
          getRowId={getRowId}
          checkboxSelection={Boolean(checkboxSelection)}
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={handleRowSelectionChange}
          onRowClick={handleRowClick}
          onRowDoubleClick={(params) => onDetail?.(params.row)}
          getRowClassName={getRowClassName}
          disableRowSelectionOnClick={props.disableRowSelectionOnClick}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationModelChange}
          rowCount={effectiveRowCount}
          slots={{
            footer: () => (
              <ModernFooter
                selectedRow={selectedRow}
                getColumnLabel={getColumnLabel}
                paginationModel={paginationModel}
                rowsLength={rows.length}
                totalData={totalData}
                hasMore={hasMore}
                tableName={tableName}
                onPaginationModelChange={handlePaginationModelChange}
              />
            ),
          }}
          sx={{ width: "100%", height: "100%" }}
        />
      </Box>
    </Box>
  );
}
