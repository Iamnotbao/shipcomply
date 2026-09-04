import {
  DataGrid,
  GridFooterContainer,
  GridPagination,
  GRID_CHECKBOX_SELECTION_COL_DEF,
  GRID_CHECKBOX_SELECTION_FIELD,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import ToolbarKit from "../toolbar/Toolbar";
import getColumnWithActions from "./TableColumnsWithActions";
import {
  Switch,
  Grid,
  Typography,
  Box,
  InputBase,
  IconButton,
  Checkbox,
  Popover,
} from "@mui/material";
import React, { useEffect, useRef, useCallback, useMemo, use } from "react";
import Dropdown from "../dropdown/Dropdown";
import FactoryList from "../../features/factory/component/side_menu/FactoryList";
import moment from "moment/moment";
import DepartmentList from "../../features/factory_departments/component/side_menu/DepartmentList";
import UserList from "../../features/users/component/side_menu/UserList";
import DetailUserPermissionPage from "../../features/users_permission/page/DetailUserPermissionPage";
import UsersPermission from "../../features/users_permission/component/dropdown/UsersPermission";
import { useColumnTranslation } from "../../context/ColumnTranslationContext";
import ProgramList from "../../features/program_field_title/component/ProgramList";
import BasicDataCategory from "../../features/basic_data/component/BasicDataCategory";
import AcItemRef from "../../features/bom_1/component/AcItemRef";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import useAuth from "../../hooks/useAuth";
// Import new refactored modules
import { getRowId as getRowIdUtil } from "../../utils/table";
import { filterColumnsByLanguage as filterColumnsByLanguageUtil } from "../../utils/table";
import { getTableHeight } from "../../constants/table";
import {
  getPageSizeOptions as getPageSizeOptionsUtil,
  getDefaultPageSize,
} from "../../constants/table";
// Import cell components
import { DateCell, StatusCell, CheckboxCell } from "./cells";
// Import column mapping helpers
import {
  renderDateCell,
  renderFactoryName,
  renderDepartmentName,
  isDateColumn,
  isSwitchColumn,
  isFactoryNameColumn,
  isDepartmentNameColumn,
  isLevelDropdownColumn,
  isCheckboxColumn,
} from "./helpers/columnMappers.jsx";

const getInitialPaginationModel = (title) => {
  // Use new utility for page size
  const tableName =
    title === "PERMISSION" ? "USER_PERMISSION_DEPARTMENT" : title;
  return { page: 0, pageSize: getDefaultPageSize(tableName) };
};

export default function DataTable({
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
  popupOpen,
  selectRows,
  subTable = false,
  subTableName,
  onFile,
  file,
  onChecked,
  onImport,
  onExport,
  onExcelWithCondition,
  onUnconfirm,
  onCustomExport,
  onMaterialExport,
  onPDF,
  onQr,
  onBar,
  onBom,
  onSelectModify,
  onSelectQuery,
  onDepartmentDetail,
  factories,
  selectFactory,
  onSelectFactory,
  departments,
  selectDepartment,
  onSelectDepartment,
  users,
  selectUser,
  onSelectUser,
  programs,
  selectProgram,
  onSelectProgram,
  onVNImport,
  onDirectImport,
  isSearch,
  searchData,
  isSubTable = false,
  columnTranslations = [],
  controlTranslations = [],
  language,
  getControlLabel,
  getColumnLabel,
  jumpToRow,
  checkboxSelection,
  selectedItemRefs,
  onSelectionChange,
  isPopup = false,
  onPageChange,
  isHide = false,
  total,
  onCheckMax,
  isCheckMax,
  disableRowSelectionOnClick = false,
  customCheckboxColumn = false,
  customSelections = [],
  onCustomCheckboxChange,
  onCustomSelectAll,
  ttlQTY,
  selectCheckRef,
  onCopy,
  onExtend,
  acReq,
  onConfirmAll,
  onApprove,
  onAddContractNumber,
  totalData,
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
  isCheckAll = true,
  onGeneratePM,
  onImportLink,
}) {
  const { user } = useAuth();
  const [columnWidths, setColumnWidths] = React.useState({});
  const [focusIndex, setFocusIndex] = React.useState(0);
  const [subTableFocusIndex, setSubTableFocusIndex] = React.useState(0);
  const [focusContext, setFocusContext] = React.useState("table");
  const [tableData, setTableData] = React.useState(data);
  const [isPaginationChanging, setIsPaginationChanging] = React.useState(false);
  const toolbarStickyRef = React.useRef(null);
  const [toolbarStickyHeight, setToolbarStickyHeight] = React.useState(0);
  const title =
    tableName === "USER_PERMISSION_DEPARTMENT" ? "PERMISSION" : tableName;
  const [pageSize, setPageSize] = React.useState(
    getInitialPaginationModel(title).pageSize,
  );

  const [paginationModel, setPaginationModel] = React.useState(
    tableName === "AC_ITEM_M"
      ? {
          page: currentPage,
          pageSize: currentPageSize,
        }
      : getInitialPaginationModel(title),
  );

  React.useLayoutEffect(() => {
    if (!isToolbar || !toolbarStickyRef.current) {
      setToolbarStickyHeight(0);
      return undefined;
    }

    const element = toolbarStickyRef.current;
    const updateHeight = () => {
      const nextHeight = Math.ceil(element.getBoundingClientRect().height);
      setToolbarStickyHeight((current) =>
        current === nextHeight ? current : nextHeight,
      );
    };

    updateHeight();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateHeight);
      return () => window.removeEventListener("resize", updateHeight);
    }

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => observer.disconnect();
  }, [isToolbar, title, language]);

  const stickyMasterHeaderTop = isToolbar
    ? `calc(var(--shipcomply-toolbar-sticky-top, 107px) + ${toolbarStickyHeight}px)`
    : "var(--shipcomply-toolbar-sticky-top, 107px)";

  const pendingSelectIndexRef = useRef(null);
  const [isFocused, setIsFocused] = React.useState(false);
  const prevFocusContextRef = useRef("table");
  const focusContextRef = useRef("table");
  const focusIndexRef = useRef(0);
  const subTableFocusIndexRef = useRef(0);
  const prevDataRef = useRef([]);
  const gridRef = useRef(null);
  const userMenuRef = useRef(null);
  const factoryMenuRef = useRef(null);
  const departmentMenuRef = useRef(null);
  const programMenuRef = useRef(null);
  const subTableRef = useRef(null);
  const currentPageRef = useRef(0);
  const nameBasedOnLanguage = {
    DEPARTMENTS: {
      en: "department_name_e",
      vi: "department_name_l",
      zh: "department_name_t",
    },
    FACTORY: {
      en: "factory_name_e",
      vi: "factory_name_l",
      zh: "factory_name_t",
    },
    USER: {
      en: "user_name_e",
      vi: "user_name_l",
      zh: "user_name_t",
    },
    PROGRAM: {
      en: "program_name_e",
      vi: "program_name_l",
      zh: "program_name_t",
    },
  };

  const deptList = useMemo(() => {
    if (tableName === "USER_PERMISSION_DEPARTMENT" && data.length > 0) {
      const uniqueFactoryCodes = [
        ...new Set(data.map((row) => row?.factory_code).filter(Boolean)),
      ];
      const allDepts = uniqueFactoryCodes.flatMap(
        (factoryCode) =>
          departments[0]?.data.filter(
            (dl) => `${dl.factory_code}` === `${factoryCode}`,
          ) || [],
      );
      return allDepts;
    }
    return [];
  }, [tableName, data, departments]);
  const getFilteredData = useMemo(() => {
    if (!Array.isArray(tableData)) return [];
    return tableData.map((row) => {
      if (!row) return row;
      return {
        ...row,
        statusText:
          row.status === "0" || row.status === 0
            ? "Cancel-0"
            : row.status === "1" || row.status === 1
              ? "New-1"
              : row.status === "2" || row.status === 2
                ? "Checked-2"
                : row.status === "7" || row.status === 7
                  ? "Confirm-7"
                  : row.status === "9" || row.status === 9
                    ? "Close-9"
                    : row.status,
      };
    });
  }, [tableData, tableName]);

  // Use refactored getRowId utility
  const getRowId = useCallback(
    (row) => {
      return getRowIdUtil(row, tableName);
    },
    [tableName],
  );
  // Use refactored getPageSizeOptions utility
  const getPageSizeOptions = (tableName) => {
    return getPageSizeOptionsUtil(tableName);
  };
  useEffect(() => {
    if (tableName === "USER_PERMISSION_DEPARTMENT" && data.length > 0) {
      data.forEach((row, index) => {
        if (!row) return;
        const factoryExists = factories[0]?.data.some(
          (f) => f.factory_code === row.factory_code,
        );
        const deptExists = departments[0]?.data.some(
          (d) => d.department_code === row.department_code,
        );

        if (!factoryExists && row.factory_code) {
          console.warn(
            `Row ${index}: Invalid factory_code "${row.factory_code}"`,
          );
        }
        if (!deptExists && row.department_code) {
          console.warn(
            `Row ${index}: Invalid department_code "${row.department_code}"`,
          );
        }
      });
    }
  }, [data, tableName, factories, departments]);

  useEffect(() => {
    if (JSON.stringify(prevDataRef.current) !== JSON.stringify(data)) {
      setTableData([...data]);
      prevDataRef.current = data;
    }
  }, [data]);

  useEffect(() => {
    focusContextRef.current = focusContext;
  }, [focusContext]);

  // Sync focusIndexRef với focusIndex
  useEffect(() => {
    focusIndexRef.current = focusIndex;
  }, [focusIndex]);

  // Sync subTableFocusIndexRef với subTableFocusIndex
  useEffect(() => {
    subTableFocusIndexRef.current = subTableFocusIndex;
  }, [subTableFocusIndex]);

  ///update new
  useEffect(() => {
    // Reset subTableFocusIndex khi searchData thay đổi
    if (isSearch && searchData && searchData.length > 0) {
      subTableFocusIndexRef.current = 0;
      setSubTableFocusIndex(0);
    }
  }, [searchData, isSearch]);
  //khi thay doi jumtoRow
  useEffect(() => {
    if (jumpToRow && getFilteredData.length > 0) {
      const newIndex = getFilteredData.findIndex(
        (row) => getRowId(row) === getRowId(jumpToRow),
      );
      if (newIndex !== -1) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setFocusIndex(newIndex);
            onSelectChange([jumpToRow]);

            const rowElement = document.querySelector(
              `[data-id="${getRowId(jumpToRow)}"]`,
            );
            if (rowElement) {
              rowElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          });
        });
      }
    }
  }, [jumpToRow, getFilteredData]);
  //update new
  useEffect(() => {
    setPaginationModel({ page: currentPage, pageSize: currentPageSize });
  }, [currentPage]);
  useEffect(() => {
    // Sync subTableFocusIndex khi selectRows thay đổi trong subtable context
    if (
      focusContext === "subtable" &&
      searchData &&
      searchData.length > 0 &&
      selectRows.length > 0
    ) {
      const currentIndex = searchData.findIndex(
        (item) => getRowId(item) === getRowId(selectRows[0]),
      );

      if (currentIndex >= 0 && currentIndex !== subTableFocusIndexRef.current) {
        subTableFocusIndexRef.current = currentIndex;
        setSubTableFocusIndex(currentIndex);
      }
    }
  }, [selectRows, searchData, focusContext, getRowId]);
  //time switch page
  useEffect(() => {
    if (isPaginationChanging) {
      const timer = setTimeout(() => {
        if (gridRef.current) {
          gridRef.current.focus();
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [isPaginationChanging, paginationModel.page]);
  useEffect(() => {
    // Khi getFilteredData thay đổi (data trang mới load xong)
    // và đang có pending selection từ keyboard navigation
    if (pendingSelectIndexRef.current !== null && getFilteredData.length > 0) {
      const localIndex = pendingSelectIndexRef.current;
      const targetRow = getFilteredData[localIndex];

      if (targetRow) {
        focusIndexRef.current = localIndex;
        setFocusIndex(localIndex);
        onSelectChange([targetRow]);

        // Scroll to row
        setTimeout(() => {
          const rowElement = document.querySelector(
            `[data-id="${getRowId(targetRow)}"]`,
          );
          if (rowElement) {
            rowElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 50);
      }

      // Clear pending
      pendingSelectIndexRef.current = null;
    }
  }, [getFilteredData]);
  useEffect(() => {
    if (getFilteredData.length > 0 && focusIndex >= getFilteredData.length) {
      setFocusIndex(getFilteredData.length - 1);
    } else if (getFilteredData.length === 0) {
      setFocusIndex(0);
    }
  }, [getFilteredData, focusIndex]);
  const handleAdd = () => onAdd();
  const handleEdit = (row) => {
    prevFocusContextRef.current = focusContextRef.current;
    onEdit(row);
  };
  const handleDelete = (row) => onDelete(row);
  const handDetail = (row) => onDetail(row);
  const handleQr = (row) => onQr(row);
  const handleBar = (row) => onBar(row);
  const handleOnDepartment = (row) => onDepartmentDetail(row);

  // Use refactored filterColumnsByLanguage utility
  const filterColumnsByLanguage = (columns, language) => {
    // Keep admin bypass logic
    if (user?.user_code === "admin") {
      return columns;
    }
    return filterColumnsByLanguageUtil(columns, language);
  };
  const baseColumns = getColumnWithActions(
    tableName,
    handleEdit,
    handleDelete,
    handDetail,
    handleQr,
    handleBar,
    subTable,
    handleOnDepartment,
  );

  const handleKeyDown = useCallback(
    (event) => {
      const targetTag = event.target.tagName.toLowerCase();
      const isEditable =
        targetTag === "input" ||
        targetTag === "textarea" ||
        event.target.isContentEditable;
      if (isEditable) return;

      const { key, shiftKey, ctrlKey } = event;

      if (key === "Tab") {
        return;
      }
      if (
        focusContext === "subtable" &&
        (key === "ArrowDown" || key === "ArrowUp")
      ) {
        if (!searchData || searchData.length === 0) return;

        event.preventDefault();
        event.stopPropagation();

        let nextIndex = subTableFocusIndex;

        if (key === "ArrowDown") {
          nextIndex = Math.min(subTableFocusIndex + 1, searchData.length - 1);
        } else if (key === "ArrowUp") {
          nextIndex = Math.max(subTableFocusIndex - 1, 0);
        }

        if (nextIndex !== subTableFocusIndex) {
          subTableFocusIndexRef.current = nextIndex;
          setSubTableFocusIndex(nextIndex);
          onSelectChange(searchData[nextIndex]);
        }

        return;
      }
      if (
        focusContextRef.current === "table" &&
        (key === "ArrowDown" || key === "ArrowUp")
      ) {
        if (getFilteredData.length === 0) return;

        event.preventDefault();
        event.stopPropagation();

        const currentFocusIndex = focusIndexRef.current;
        const currentPage = paginationModel.page;
        const pageSize = paginationModel.pageSize;

        const localLength = getFilteredData.length;
        let totalPages;
        if (isSearch && totalData > 0) {
          totalPages = Math.ceil(totalData / pageSize);
        } else if (hasMore) {
          totalPages = currentPage + 2;
        } else {
          totalPages = Math.ceil((totalData || localLength) / pageSize);
        }
        let nextIndex = currentFocusIndex;
        let newPage = currentPage;
        let willChangePage = false;

        if (key === "ArrowDown") {
          if (currentFocusIndex < localLength - 1) {
            nextIndex = currentFocusIndex + 1;
          } else if (currentPage < totalPages - 1) {
            newPage = currentPage + 1;
            nextIndex = 0;
            willChangePage = true;
          } else {
            return; // Đã ở cuối cùng
          }
        } else if (key === "ArrowUp") {
          if (currentFocusIndex > 0) {
            nextIndex = currentFocusIndex - 1;
          } else if (currentPage > 0) {
            newPage = currentPage - 1;
            nextIndex = pageSize - 1;
            willChangePage = true;
          } else {
            return; // Đã ở đầu cùng
          }
        }

        focusIndexRef.current = nextIndex;
        setFocusIndex(nextIndex);

        if (willChangePage) {
          pendingSelectIndexRef.current = nextIndex; // nextIndex = 0 hoặc pageSize-1

          setIsPaginationChanging(true);
          setPaginationModel({ page: newPage, pageSize });

          if (onPageChange) {
            onPageChange(newPage, pageSize);
          }

          // KHÔNG gọi onSelectChange ở đây vì data chưa có!
          setTimeout(() => {
            if (gridRef.current) {
              gridRef.current.focus();
              setIsPaginationChanging(false);
            }
          }, 150);
        } else {
          onSelectChange([getFilteredData[nextIndex]]);
          setTimeout(() => {
            const rowElement = document.querySelector(
              `[data-id="${getRowId(getFilteredData[nextIndex])}"]`,
            );
            if (rowElement) {
              rowElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }, 50);
        }

        return;
      }

      if (
        focusContext === "factoryMenu" &&
        (key === "ArrowDown" || key === "ArrowUp")
      ) {
        event.preventDefault();
        const factoryData = factories?.[0]?.data || [];
        if (factoryData.length === 0) return;

        const currentIndex = factoryData.findIndex(
          (f) => f.factory_code === selectFactory?.factory_code,
        );

        let nextIndex = currentIndex;
        if (key === "ArrowDown") {
          nextIndex = Math.min(currentIndex + 1, factoryData.length - 1);
        } else if (key === "ArrowUp") {
          nextIndex = Math.max(currentIndex - 1, 0);
        }

        if (nextIndex !== currentIndex && nextIndex >= 0) {
          onSelectFactory(factoryData[nextIndex]);

          setTimeout(() => {
            const menuContainer = factoryMenuRef.current;
            if (menuContainer) {
              const selectedItem =
                menuContainer.querySelector('[class*="selected"]') ||
                menuContainer.querySelector(
                  `[data-factory-code="${factoryData[nextIndex].factory_code}"]`,
                );
              if (selectedItem) {
                selectedItem.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                });
              }
            }
          }, 50);
        }
        return;
      }

      if (
        focusContext === "departmentMenu" &&
        (key === "ArrowDown" || key === "ArrowUp")
      ) {
        event.preventDefault();
        const deptData = departments?.[0]?.data || [];
        if (deptData.length === 0) return;

        const currentIndex = deptData.findIndex(
          (d) => d.department_code === selectDepartment?.department_code,
        );

        let nextIndex = currentIndex;
        if (key === "ArrowDown") {
          nextIndex = Math.min(currentIndex + 1, deptData.length - 1);
        } else if (key === "ArrowUp") {
          nextIndex = Math.max(currentIndex - 1, 0);
        }

        if (nextIndex !== currentIndex && nextIndex >= 0) {
          onSelectDepartment(deptData[nextIndex]);

          setTimeout(() => {
            const menuContainer = departmentMenuRef.current;
            if (menuContainer) {
              const selectedItem =
                menuContainer.querySelector('[class*="selected"]') ||
                menuContainer.querySelector(
                  `[data-department-code="${deptData[nextIndex].department_code}"]`,
                );
              if (selectedItem) {
                selectedItem.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                });
              }
            }
          }, 50);
        }
        return;
      }

      if (
        focusContext === "userMenu" &&
        (key === "ArrowDown" || key === "ArrowUp")
      ) {
        event.preventDefault();
        const userData = users?.[0]?.data || [];
        if (userData.length === 0) return;

        const currentIndex = userData.findIndex(
          (u) => u.user_code === selectUser?.user_code,
        );

        let nextIndex = currentIndex;
        if (key === "ArrowDown") {
          nextIndex = Math.min(currentIndex + 1, userData.length - 1);
        } else if (key === "ArrowUp") {
          nextIndex = Math.max(currentIndex - 1, 0);
        }

        if (nextIndex !== currentIndex && nextIndex >= 0) {
          onSelectUser(userData[nextIndex]);

          setTimeout(() => {
            const menuContainer = userMenuRef.current;
            if (menuContainer) {
              const selectedItem =
                menuContainer.querySelector('[class*="selected"]') ||
                menuContainer.querySelector(
                  `[data-user-code="${userData[nextIndex].user_code}"]`,
                );
              if (selectedItem) {
                selectedItem.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                });
              }
            }
          }, 50);
        }
        return;
      }
      if (
        focusContext === "programMenu" &&
        (key === "ArrowDown" || key === "ArrowUp")
      ) {
        event.preventDefault();
        const deptData = programs?.[0]?.data || [];
        if (deptData.length === 0) return;

        const currentIndex = deptData.findIndex(
          (d) => d.program_code === selectProgram?.program_code,
        );

        let nextIndex = currentIndex;
        if (key === "ArrowDown") {
          nextIndex = Math.min(currentIndex + 1, deptData.length - 1);
        } else if (key === "ArrowUp") {
          nextIndex = Math.max(currentIndex - 1, 0);
        }

        if (nextIndex !== currentIndex && nextIndex >= 0) {
          onSelectProgram(deptData[nextIndex]);

          setTimeout(() => {
            const menuContainer = programMenuRef.current;
            if (menuContainer) {
              const selectedItem =
                menuContainer.querySelector('[class*="selected"]') ||
                menuContainer.querySelector(
                  `[data-program-code="${deptData[nextIndex].program_code}"]`,
                );
              if (selectedItem) {
                selectedItem.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                });
              }
            }
          }, 50);
        }
        return;
      }
      if (focusContext === "popup") {
        const isNavigationKey = [
          "ArrowDown",
          "ArrowUp",
          "Alt",
          "`",
          "Delete",
          "Escape",
          "Home",
          "End",
          "=",
        ].includes(key);
        const isSelectAll = key === "f" && ctrlKey;

        if (getFilteredData.length === 0) return;
        event.preventDefault();

        if (key === "`") {
          const targetRow =
            selectRows.length > 0 ? selectRows[0] : getFilteredData[focusIndex];
          if (targetRow) {
            handleEdit(targetRow);
          }
        } else if (key === "=") {
          handleAdd();
        } else if (isSelectAll) {
          onSelectChange([...getFilteredData]);
          setFocusIndex(0);
        } else if (key === "v" && ctrlKey && selectRows.length === 1) {
          handDetail(selectRows[0]);
        } else if (key === "Home") {
          setFocusIndex(0);
        } else if (key === "End") {
          setFocusIndex(getFilteredData.length - 1);
        }
      }
      if (focusContext === "table") {
        const isNavigationKey = [
          "ArrowDown",
          "ArrowUp",
          "Alt",
          "`",
          "Delete",
          "Escape",
          "Home",
          "End",
          "=",
        ].includes(key);
        const isSelectAll = key === "f" && ctrlKey;

        if (getFilteredData.length === 0) return;
        event.preventDefault();

        if (key === "`") {
          const targetRow =
            selectRows.length > 0 ? selectRows[0] : getFilteredData[focusIndex];
          if (targetRow) {
            handleEdit(targetRow);
          }
        } else if (key === "=") {
          handleAdd();
        } else if (isSelectAll) {
          onSelectChange([...getFilteredData]);
          setFocusIndex(0);
        } else if (key === "v" && ctrlKey && selectRows.length === 1) {
          handDetail(selectRows[0]);
        } else if (key === "Home") {
          setFocusIndex(0);
        } else if (key === "End") {
          setFocusIndex(getFilteredData.length - 1);
        }
      }
    },
    [
      focusIndex,
      subTableFocusIndex,
      getFilteredData,
      selectRows,
      onSelectChange,
      handleEdit,
      handleDelete,
      handDetail,
      onDeleteAll,
      getRowId,
      focusContext,
      selectFactory,
      onSelectFactory,
      factories,
      selectDepartment,
      onSelectDepartment,
      departments,
      selectUser,
      onSelectUser,
      users,
      pageSize,
      searchData,
      paginationModel,
    ],
  );

  const handlePaginationModelChange = useCallback(
    (model) => {
      currentPageRef.current = model.page;
      setIsPaginationChanging(true);
      setPaginationModel(model);
      setPageSize(model.pageSize);

      // Chỉ reset khi user bấm nút phân trang thủ công,
      // KHÔNG reset khi keyboard đang điều khiển (isPaginationChanging đã = true)
      if (model.page !== paginationModel.page && !isPaginationChanging) {
        setFocusIndex(0);
        focusIndexRef.current = 0;
      }

      if (onPageChange) {
        onPageChange(model.page, model.pageSize);
      }

      setTimeout(() => {
        if (gridRef.current) {
          gridRef.current.focus();
          setIsPaginationChanging(false);
        }
      }, 150);
    },
    [onPageChange, paginationModel.page, isPaginationChanging],
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setFocusContext("table");
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);
  useEffect(() => {
    const gridElement = gridRef.current;
    if (!gridElement) return;

    const handleKeyDownWrapper = (event) => {
      if (!isFocused) return;
      handleKeyDown(event);
    };

    if (isSubTable || !popupOpen) {
      gridElement.addEventListener("keydown", handleKeyDownWrapper);
      return () => {
        gridElement.removeEventListener("keydown", handleKeyDownWrapper);
      };
    }
  }, [handleKeyDown, isSubTable, popupOpen, isFocused]);
  useEffect(() => {
    const handleDocumentClick = (e) => {
      // Nếu click vào trong table area và focus đang ở table context
      if (gridRef.current && gridRef.current.contains(e.target)) {
        if (focusContextRef.current === "table" && !isSubTable) {
          // Re-focus nếu cần
          setTimeout(() => {
            if (document.activeElement !== gridRef.current) {
              gridRef.current.focus();
            }
          }, 10);
        }
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [isSubTable]);
  const handleRowClick = useCallback(
    (params, event) => {
      if (!isSubTable) {
        focusContextRef.current = "table";
        setFocusContext("table");
        setIsFocused(true);

        // Đảm bảo focus ngay lập tức
        if (gridRef.current) {
          gridRef.current.focus();
        }
      }

      const id = getRowId(params.row);
      const rowIndex = getFilteredData.findIndex((row) => getRowId(row) === id);

      if (rowIndex !== -1) {
        focusIndexRef.current = rowIndex;
        setFocusIndex(rowIndex);
      }

      let newSelected = [];
      const isSelected = selectRows.some((r) => getRowId(r) === id);
      newSelected = isSelected ? selectRows : [params.row];
      onSelectChange(newSelected);
    },
    [getFilteredData, selectRows, onSelectChange, getRowId, isSubTable],
  );

  const handleRowSelectionChange = useCallback(
    (newSelection) => {
      if (!onSelectionChange) return;
      let selectedObjects = [];
      let uncheckedRow = null;

      if (newSelection?.type === "exclude") {
        const excludedIds = Array.from(newSelection.ids || []);
        if (excludedIds.length === 0) {
          selectedObjects = [...getFilteredData];
        } else {
          selectedObjects = getFilteredData.filter(
            (row) => !excludedIds.includes(getRowId(row)),
          );
        }
      } else if (newSelection?.type === "include") {
        const includedIds = Array.from(newSelection.ids || []);

        //  So sánh với state trước để tìm hàng bị uncheck
        if (selectCheckRef.current && selectCheckRef.current.length > 0) {
          const previousIds = selectCheckRef.current.map((row) =>
            getRowId(row),
          );
          const uncheckedId = previousIds.find(
            (id) => !includedIds.includes(id),
          );

          if (uncheckedId) {
            uncheckedRow = selectCheckRef.current.find(
              (row) => getRowId(row) === uncheckedId,
            );
          }
        }

        if (includedIds.length === 0) {
          selectedObjects = [];
        } else {
          selectedObjects = includedIds
            .map((id) => getFilteredData.find((r) => getRowId(r) === id))
            .filter(Boolean);
        }
      }

      //  Gọi callback với cả uncheckedRow
      if (onSelectionChange.length === 2) {
        // Nếu callback nhận 2 tham số
        onSelectionChange(selectedObjects, uncheckedRow);
      } else {
        onSelectionChange(selectedObjects);
      }
    },
    [onSelectionChange, getFilteredData, getRowId, selectCheckRef],
  );
  const handleUserMenuClick = useCallback((e) => {
    e.stopPropagation();
    setFocusContext("userMenu");
    setIsFocused(true);
    if (userMenuRef.current) {
      userMenuRef.current.focus();
    }
  }, []);

  const handleFactoryMenuClick = useCallback((e) => {
    e.stopPropagation();
    setFocusContext("factoryMenu");
    setIsFocused(true);
    if (factoryMenuRef.current) {
      factoryMenuRef.current.focus();
    }
  }, []);

  const handleDepartmentMenuClick = useCallback((e) => {
    e.stopPropagation();
    setFocusContext("departmentMenu");
    setIsFocused(true);
    setIsFocused(true);
    if (departmentMenuRef.current) {
      departmentMenuRef.current.focus();
    }
  }, []);
  const handleProgramMenuClick = useCallback((e) => {
    e.stopPropagation();
    setFocusContext("programMenu");
    setIsFocused(true);
    if (programMenuRef.current) {
      programMenuRef.current.focus();
    }
  }, []);
  const handlePopupClick = useCallback((e) => {
    e.stopPropagation();
    setFocusContext("popup");
    if (programMenuRef.current) {
      programMenuRef.current.focus();
    }
  }, []);
  const handleSubTableClick = useCallback((e) => {
    setFocusContext("subtable");
  }, []);

  const handleSubTableRowSelect = useCallback(
    (selectedRow) => {
      const subIndex = searchData?.findIndex(
        (item) => getRowId(item) === getRowId(selectedRow),
      );

      if (subIndex >= 0) {
        // CRITICAL: Update ref TRƯỚC để đảm bảo giá trị đúng ngay lập tức
        subTableFocusIndexRef.current = subIndex;
        setSubTableFocusIndex(subIndex);
      } else {
        console.warn("Row not found in searchData!");
      }

      // Gọi onSelectChange SAU khi đã update index
      onSelectChange([selectedRow]);

      // Set focus context SAU CÙNG
      setTimeout(() => {
        setFocusContext("subtable");
        if (subTableRef.current) {
          subTableRef.current.focus();
        }
      }, 0);
    },
    [searchData, getRowId, onSelectChange],
  );

  const SwitchCell = React.memo(({ value, row, field, onChecked }) => {
    return (
      <Switch
        checked={value === "Y"}
        onChange={(e) => {
          onChecked(e, row, field);
        }}
      />
    );
  });

  const handleColumnWidthChange = React.useCallback((params) => {
    setColumnWidths((prev) => ({
      ...prev,
      [params.colDef.field]: params.width,
    }));
  }, []);
  const handleRowDoubleClick = useCallback(
    (params, event) => {
      if (onDetail) {
        handDetail(params.row);
      }
    },
    [onDetail, handDetail],
  );
  const mapColumns = React.useMemo(() => {
    const baseColumnsProcessed = baseColumns.map((col) => {
      const translation = columnTranslations.find((t) => t.field === col.field);
      let column = {
        ...col,
        width: columnWidths[col.field] || col.width,
        headerName: translation?.title || col.headerName,
      };

      if (column.field === "status") {
        const statusTranslation = columnTranslations?.find(
          (t) => t.field === "status",
        );
        column = {
          ...column,
          field: "statusText",
          headerName: statusTranslation?.title || "Status",
        };
      }

      // Use DateCell component for date fields
      if (isDateColumn(column.field)) {
        column = {
          ...column,
          renderCell: (params) => <DateCell value={params.value} />,
        };
      }

      // Use SwitchCell for permission fields
      if (isSwitchColumn(column.field, tableName)) {
        column = {
          ...column,
          renderCell: (params) => (
            <SwitchCell
              value={params.value}
              row={params.row}
              field={column.field}
              onChecked={onChecked}
            />
          ),
        };
      }

      // Use helper for factory name rendering
      if (isFactoryNameColumn(column.field, tableName)) {
        const statusTranslation = getControlLabel(
          "txt_factory_name",
          "factory_name",
        );
        const name = nameBasedOnLanguage["FACTORY"][language];

        column = {
          ...column,
          renderCell: (params) => renderFactoryName(params, factories, name),
          headerName: statusTranslation || "factory_name",
        };
      }

      // Use helper for department name rendering
      if (isDepartmentNameColumn(column.field, tableName)) {
        const statusTranslation = getControlLabel(
          "txt_department_name",
          "department_name",
        );
        const name = nameBasedOnLanguage["DEPARTMENTS"][language];
        column = {
          ...column,
          renderCell: (params) => renderDepartmentName(params, deptList, name),
          headerName: statusTranslation || "department_name",
        };
      }

      // Use isLevelDropdownColumn helper for level dropdowns
      if (isLevelDropdownColumn(column.field, tableName)) {
        column = {
          ...column,
          renderCell: (params) => (
            <Dropdown
              data={[
                {
                  value: "1",
                  label: getControlLabel("ddl_factory", "Factory") || "Factory",
                },
                {
                  value: "2",
                  label:
                    getControlLabel("ddl_department", "Department") ||
                    "Department",
                },
                {
                  value: "3",
                  label: getControlLabel("ddl_user", "User") || "User",
                },
              ]}
              onSelect={(selected) =>
                column.field === "query_level"
                  ? onSelectQuery(params.row, selected.value)
                  : onSelectModify(params.row, selected.value)
              }
              select={(() => {
                const dbValue = params.row[column.field];
                if (typeof dbValue === "string" && dbValue.includes("-")) {
                  return parseInt(dbValue.split("-")[0]);
                }
                return dbValue;
              })()}
              table="USER_PERMISSION"
              option="users_permission"
              isCentered={true}
              getControlLabel={getControlLabel}
            />
          ),
        };
      }

      // Use CheckboxCell component for checkbox fields
      if (isCheckboxColumn(column.field, tableName)) {
        column = {
          ...column,
          renderCell: (params) => (
            <CheckboxCell
              value={params.row[params.field]}
              disabled={false}
              onChange={(newValue) => {
                onChecked(newValue, params.row, column.field);
              }}
            />
          ),
        };
      }

      return column;
    });
    const filteredColumns = filterColumnsByLanguage(
      baseColumnsProcessed,
      language,
    );
    let finalColumns = [...filteredColumns];
    if (customCheckboxColumn) {
      const currentPageIds = (data || []).map((row) => getRowId(row));
      const selectedIdSet = new Set(
        (customSelections || []).map((sel) => getRowId(sel)),
      );
      const allSelected =
        currentPageIds.length > 0 &&
        currentPageIds.every((id) => selectedIdSet.has(id));
      const someSelected = 
        !allSelected && currentPageIds.some((id) => selectedIdSet.has(id));
      const customCheckboxCol = {
        field: "__custom_checkbox__",
        headerName: "",
        width: 50,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        headerAlign: "center",
        align: "center",
        renderHeader: () =>
          isCheckAll ? (
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) {
                  input.indeterminate = someSelected && !allSelected;
                }
              }}
              onChange={(e) => {
                e.stopPropagation();
                if (onCustomSelectAll) {
                  onCustomSelectAll(e.target.checked);
                }
              }}
              style={{ cursor: "pointer", width: "18px", height: "18px" }}
            />
          ) : null,
        renderCell: (params) => {
          const itemId = getRowId(params.row);
          const isChecked = customSelections?.some((sel) => {
            const selId = getRowId(sel);
            return selId === itemId;
          });

          return (
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => {
                e.stopPropagation();
                if (onCustomCheckboxChange) {
                  onCustomCheckboxChange(params.row, e.target.checked);
                }
              }}
              style={{ cursor: "pointer", width: "18px", height: "18px" }}
            />
          );
        },
      };

      finalColumns = [...finalColumns, customCheckboxCol];
    } else if (checkboxSelection) {
      //  Nếu dùng built-in checkbox (cho các table khác)
      finalColumns = [
        ...finalColumns,
        {
          ...GRID_CHECKBOX_SELECTION_COL_DEF,
        },
      ];
    }
    return finalColumns;
  }, [
    baseColumns,
    tableName,
    onChecked,
    onSelectQuery,
    onSelectModify,
    columnWidths,
    departments,
    factories,
    language,
    columnTranslations,
    deptList,
    customCheckboxColumn,
    customSelections,
    data,
    onCustomCheckboxChange,
    onCustomSelectAll,
    getRowId,
  ]);

  const getRowClassName = useCallback(
    (params) => {
      const classNames = [];

      if (selectRows.some((r) => getRowId(r) === getRowId(params.row))) {
        classNames.push("Mui-selected-row");
      }

      return classNames.join(" ");
    },
    [selectRows, getRowId],
  );

  // Use refactored table heights from constants
  const tableHeight = getTableHeight(title);
  const rowsPerPageText = getControlLabel(
    "txt_rows_per_page",
    "Rows per page:",
  );
  const FooterField = ({ field, displayValue }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);

    return (
      <Box
        display="flex"
        alignItems="center"
        minWidth={0}
        width={field.boxWidth}
        sx={{ overflow: "hidden" }}
      >
        <Typography
          variant="body2"
          fontWeight="bold"
          fontSize="12px"
          title={field.title}
          sx={{
            flexShrink: 0,
            mr: 0.5,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "90px",
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (String(displayValue ?? "").length > 0) {
              setAnchorEl(e.currentTarget);
            }
          }}
        >
          {field.title}
        </Typography>

        <input
          readOnly
          value={displayValue ?? ""}
          onKeyDown={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onFocus={(e) => {
            e.target.style.textOverflow = "clip";
          }}
          onBlur={(e) => {
            e.target.style.textOverflow = "ellipsis";
          }}
          style={{
            flex: 1,
            minWidth: 0,
            height: "26px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "#f9f9f9",
            padding: "0 6px",
            fontSize: "13px",
            outline: "none",
            cursor: "text",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        />

        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          disableAutoFocus
          disableEnforceFocus
          onClick={(e) => e.stopPropagation()}
        >
          <Box
            sx={{
              p: 1.5,
              maxWidth: "400px",
              wordBreak: "break-word",
              fontSize: "13px",
              backgroundColor: "#fffde7",
              border: "1px solid #f0c000",
              borderRadius: "4px",
              userSelect: "text",
            }}
          >
            <Typography
              variant="caption"
              fontWeight="bold"
              color="text.secondary"
              display="block"
              mb={0.5}
            >
              {field.title}
            </Typography>
            {displayValue}
          </Box>
        </Popover>
      </Box>
    );
  };
  const CustomFooter = () => {
    const selectedRow =
      selectRows && selectRows.length > 0 ? selectRows[0] : null;
    const extraField =
      tableName === "VW_AC_SRCORDER"
        ? [
            {
              key: "itemnm",
              title: getColumnLabel?.("itemnm", "itemnm") || "itemnm",
              width: 100,
            },
            {
              key: "itemnm1",
              title: getColumnLabel?.("itemnm1", "itemnm1") || "itemnm1",
              width: 100,
            },
            {
              key: "unitnm",
              title: getColumnLabel?.("unitnm", "unitnm") || "unitnm",
              width: 100,
            },
            {
              key: "unitnm1",
              title: getColumnLabel?.("unitnm1", "unitnm1") || "unitnm1",
              width: 100,
            },
            // {
            //   key: "req_acqty",
            //   title: getColumnLabel?.("req_acqty", "req_acqty") || "req_acqty",
            //   width: 100,
            // },
            {
              key: "ac_req",
              title: getColumnLabel?.("ac_req", "ac_req") || "ac_req",
              width: 100,
            },
            {
              key: "plan_qty",
              title: getColumnLabel?.("plan_qty", "plan_qty") || "plan_qty",
              width: 100,
            },
            {
              key: "chge_qty",
              title: getColumnLabel?.("chge_qty", "chge_qty") || "chge_qty",
              width: 100,
            },
            {
              key: "ttl_qty",
              title: getColumnLabel?.("ttl_qty", "ttl_qty") || "ttl_qty",
              width: 100,
            },
          ]
        : [
            {
              key: "itemnm",
              title: getColumnLabel?.("itemnm", "itemnm") || "itemnm",
              width: 100,
            },
            {
              key: "itemnm1",
              title: getColumnLabel?.("itemnm1", "itemnm1") || "itemnm1",
              width: 100,
            },
            {
              key: "sendnm",
              title: getColumnLabel?.("sendnm", "sendnm") || "sendnm",
              width: 100,
            },
            {
              key: "unitnm",
              title: getColumnLabel?.("unitnm", "unitnm") || "unitnm",
              width: 100,
            },
            {
              key: "unitnm1",
              title: getColumnLabel?.("unitnm1", "unitnm1") || "unitnm1",
              width: 100,
            },
            {
              key: "v_for",
              title: getColumnLabel?.("v_for", "v_for") || "v_for",
              width: 100,
            },
            {
              key: "y_rcpt",
              title: getColumnLabel?.("y_rcpt", "y_rcpt") || "y_rcpt",
              width: 100,
            },
            {
              key: "req_acqty1",
              title:
                getColumnLabel?.("req_acqty1", "req_acqty1") || "req_acqty1",
              width: 100,
            },
            {
              key: "ac_req",
              title: getColumnLabel?.("ac_req", "ac_req") || "ac_req",
              width: 100,
            },
            {
              key: "ttl_qty",
              title: getColumnLabel?.("ttl_qty", "ttl_qty") || "ttl_qty",
              width: 100,
            },
          ];

    const sumField = [
      {
        key: "sum_out_qty",
        title: getColumnLabel?.("sum_out_qty", "sum_out_qty") || "sum_out_qty",
        width: 100,
        boxWidth: "180px",
      },
    ];
    const fields =
      tableName !== "RD_SIZE_D" &&
      tableName !== "VW_CONT_USE" &&
      tableName !== "VW_CHG_EXMP" &&
      tableName !== "VW_APDUE_ALL" &&
      tableName !== "VW_AC_SUM" &&
      tableName !== "RD_TEMP" &&
      tableName !== "TEXT_IMPORT" &&
      tableName !== "SAP_TRANS_TYPE" &&
      tableName !== "VW_AC_ISSUE_T" &&
      tableName !== "AC_PLAN_ORD" &&
      tableName !== "AC_PLAN_SIZE" &&
      tableName !== "AC_PLAN_PACK" &&
      tableName !== "CHG_M" &&
      tableName !== "PAKING_LIST_M" &&
      tableName !== "PAKING_LIST_D" &&
      tableName !== "VW_AC_CHGSUM" &&
      tableName !== "VW_AC_CHK_T" &&
      tableName !== "SD_ORD_M_C" &&
      tableName !== "AC_SRCORDER_M"
        ? [
            {
              key: "grt_dept",
              title: getColumnLabel?.("grt_dept", "grt_dept") || "grt_dept",
              width: 100,
              boxWidth: "180px",
            },
            {
              key: "grt_user",
              title: getColumnLabel?.("grt_user", "grt_user") || "grt_user",
              width: 100,
              boxWidth: "160px",
            },
            {
              key: "grt_date",
              title: getColumnLabel?.("grt_date", "grt_date") || "grt_date",
              width: 180,
              boxWidth: "280px",
              isDate: true,
            },
            {
              key: "last_user",
              title: getColumnLabel?.("last_user", "last_user") || "last_user",
              width: 100,
              boxWidth: "160px",
            },
            {
              key: "last_date",
              title: getColumnLabel?.("last_date", "last_date") || "last_date",
              width: 180,
              boxWidth: "280px",
              isDate: true,
            },
          ]
        : [];
    const pageSizeOptions = getPageSizeOptions(tableName);
    const actualCurrentPage =
      currentPage !== undefined ? currentPage : paginationModel.page;
    const actualPageSize =
      currentPageSize !== undefined
        ? currentPageSize
        : paginationModel.pageSize;

    let totalPages;
    if (isSearch && totalData > 0) {
      totalPages = Math.ceil(totalData / actualPageSize);
    } else if (hasMore) {
      totalPages = actualCurrentPage + 2;
    } else if (getFilteredData.length === 0) {
      totalPages = 0;
    } else {
      totalPages = actualCurrentPage + 1;
    }

    const displayIndex = getFilteredData.length > 0 ? focusIndex + 1 : 0;

    const handlePrevPage = () => {
      if (actualCurrentPage > 0) {
        const newModel = {
          page: actualCurrentPage - 1,
          pageSize: actualPageSize,
        };

        handlePaginationModelChange(newModel);
      }
    };

    const handleNextPage = () => {
      if (actualCurrentPage < totalPages - 1) {
        const newModel = {
          page: actualCurrentPage + 1,
          pageSize: actualPageSize,
        };
        handlePaginationModelChange(newModel);
      }
    };

    const handlePageSizeChange = (e) => {
      e.stopPropagation();
      const newPageSize = Number(e.target.value);
      const newModel = {
        page: 0,
        pageSize: newPageSize,
      };
      handlePaginationModelChange(newModel);
    };
    return (
      <GridFooterContainer sx={{ display: "flex" }}>
        <Box
          sx={{
            flex: 3.5,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 1,
            minWidth: 0,
          }}
        >
          {(tableName === "VW_AC_SRCORDER" || tableName === "VW_AC_ALLCHK"
            ? extraField
            : tableName === "IV_TRANS_D_TW"
              ? sumField
              : fields
          ).map((field) => {
            const displayValue = selectedRow
              ? field.isDate && selectedRow[field.key]
                ? moment(selectedRow[field.key]).format("YYYY-MM-DD HH:mm")
                : field?.key === "sum_out_qty"
                  ? total
                  : field?.key === "ttl_qty"
                    ? ttlQTY
                    : field?.key === "ac_req"
                      ? acReq
                      : selectedRow[field.key] || ""
              : "";
            return (
              <FooterField
                key={field.key}
                field={field}
                displayValue={displayValue}
              />
            );
          })}
        </Box>

        <Box
          sx={{
            flex: `${
              tableName === "AC_SHOE_M"
                ? 1
                : tableName === "AC_SHOE_REF"
                  ? 2.2
                  : tableName === "USER"
                    ? 0.8
                    : tableName === "AC_PROD_M"
                      ? 0.7
                      : tableName === "DEPARTMENTS" ||
                          tableName === "PROGRAM_FIELD_TITLE"
                        ? 0.7
                        : tableName === "USER_PERMISSION" ||
                            tableName === "USER_PERMISSION_DEPARTMENT"
                          ? 0.75
                          : tableName === "BASIC_DATA_CATEGORY" ||
                              tableName === "BASIC_DATA" ||
                              tableName === "AC_ITEM_M" ||
                              tableName === "AC_ITEM_REF" ||
                              tableName === "AC_REQ_ORDER"
                            ? 0.6
                            : tableName === "RD_SIZE_D"
                              ? 1
                              : tableName === "VW_CHG_M"
                                ? 1
                                : tableName === "AC_EXPECT_M"
                                  ? 1
                                  : tableName === "AC_ISSUE_M_T"
                                    ? 1
                                    : tableName === "VW_AC_ISSUE_T"
                                      ? 1
                                      : tableName === "VW_CHG_EXP"
                                        ? 1
                                        : tableName === "AC_PROC_M"
                                          ? 1
                                          : tableName === "AC_PROC_M_1"
                                            ? 1
                                            : tableName === "AC_PROC_D"
                                              ? 1
                                              : tableName === "AC_PROC_D_1"
                                                ? 1
                                                : tableName === "AC_CHG_D"
                                                  ? 1
                                                  : tableName === "AC_EXPECT_SE"
                                                    ? 1
                                                    : tableName === "AC_CHG_A"
                                                      ? 2.2
                                                      : tableName ===
                                                          "AC_DESC_CHG"
                                                        ? 2.2
                                                        : tableName ===
                                                            "AC_PLAN_ORD"
                                                          ? 2.2
                                                          : tableName ===
                                                              "AC_PLAN_SIZE"
                                                            ? 2.2
                                                            : tableName ===
                                                                "AC_PLAN_PACK"
                                                              ? 2.2
                                                              : tableName ===
                                                                  "AC_ISSUE_MATD_T"
                                                                ? 2.2
                                                                : tableName ===
                                                                    "AC_CHK_T"
                                                                  ? 2.2
                                                                  : tableName ===
                                                                      "IV_TRANS_D_TW"
                                                                    ? 2.2
                                                                    : tableName ===
                                                                        "AC_DESC_PROC"
                                                                      ? 2.2
                                                                      : tableName ===
                                                                          "VW_APDUE_ALL"
                                                                        ? 2.2
                                                                        : tableName ===
                                                                            "VW_ACREQ_D"
                                                                          ? 2.2
                                                                          : tableName ===
                                                                              "AC_EXPECT_MATD"
                                                                            ? 2.2
                                                                            : tableName ===
                                                                                "RD_TEMP"
                                                                              ? 2.3
                                                                              : tableName ===
                                                                                  "SAP_TRANS_TYPE"
                                                                                ? 2.3
                                                                                : tableName ===
                                                                                    "TEXT_IMPORT"
                                                                                  ? 2.3
                                                                                  : 0.6
            }`,
            minWidth: 0,
            display: "flex",
            justifyContent: "flex-end",
            overflow: "hidden",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              size="small"
              disabled={actualCurrentPage === 0}
              onClick={handlePrevPage}
              sx={{ padding: 0.5 }}
            >
              <ChevronLeftIcon />
            </IconButton>
            {getFilteredData.length === 0 ? 0 : actualCurrentPage + 1} of{" "}
            {isSearch
              ? totalData > 0
                ? Math.ceil(totalData / currentPageSize)
                : 0
              : getFilteredData.length === 0
                ? 0
                : "?"}
            <IconButton
              size="small"
              // disabled={actualCurrentPage >= totalPages - 1 || totalPages === 0}
              disabled={actualCurrentPage >= totalPages - 1 || totalPages === 0}
              onClick={handleNextPage}
              sx={{ padding: 0.5 }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
          <Box sx={{ marginRight: "10px" }}>
            <select
              value={actualPageSize}
              onChange={handlePageSizeChange}
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: "4px 8px",
                fontSize: "14px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </Box>
        </Box>
      </GridFooterContainer>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        height: "100%",
        boxSizing: "border-box",
        minWidth: 0,
      }}
    >
      {isToolbar ? (
        <Box ref={toolbarStickyRef} sx={{ width: "100%" }}>
          <ToolbarKit
          table={title}
          onSetFilter={onSetFilter}
          onAdd={onAdd}
          onEdit={handleEdit}
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
          isPopup={isPopup}
          isHide={isHide}
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
        </Box>
      ) : (
        <></>
      )}

      <div
        ref={gridRef}
        onClick={(e) => {
          const isFromSubtable = subTableRef.current?.contains(e.target);
          if (!isFromSubtable) {
            setFocusContext("table");
            setIsFocused(true);
            if (
              getFilteredData.length > 0 &&
              focusIndex >= getFilteredData.length
            ) {
              setFocusIndex(getFilteredData.length - 1);
            }
          }
        }}
        style={{ outline: "none" }}
        tabIndex={0}
      >
        <Grid
          container
          sx={{
            minHeight:
              tableName === "BASIC_DATA_CATEGORY" ||
              tableName === "AC_ITEM_M" ||
              tableName === "AC_SHOE_M" ||
              tableName === "AC_PROD_M" ||
              tableName === "AC_BOM_M" ||
              tableName === "USER_PERMISSION_DEPARTMENT"
                ? 0
                : tableHeight,
            alignItems: "flex-start",
            width: "100%",
          }}
        >
          {(tableName !== "BASIC_DATA_CATEGORY" || tableName !== "AC_ITEM_M") &&
            users && (
              <Grid
                item
                size={{ xs: 12, sm: 6, md: 2 }}
                sx={{
                  minHeight: 0,
                  maxHeight: "calc(100vh - 350px)",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <div
                  ref={userMenuRef}
                  onClick={handleUserMenuClick}
                  tabIndex={0}
                  style={{ outline: "none" }}
                >
                  <UserList
                    data={users}
                    selectRow={
                      selectUser && Object.keys(selectUser).length > 0
                        ? selectUser
                        : {}
                    }
                    onSelectRow={onSelectUser}
                    getControlLabel={getControlLabel}
                    name={nameBasedOnLanguage["USER"][language]}
                  />
                </div>
              </Grid>
            )}
          {![
            "USER_PERMISSION_DEPARTMENT",
            "BASIC_DATA_CATEGORY",
            "AC_ITEM_M",
          ].includes(tableName) &&
            factories && (
              <Grid
                item
                size={{ xs: 12, sm: 6, md: 2 }}
                sx={{
                  maxHeight:
                    title === "USER_PERMISSION"
                      ? "500px"
                      : tableHeight || "calc(100vh - 350px)",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <div
                  ref={factoryMenuRef}
                  onClick={handleFactoryMenuClick}
                  tabIndex={0}
                  style={{ outline: "none" }}
                >
                  <FactoryList
                    data={factories}
                    selectRow={selectFactory}
                    onSelectRow={onSelectFactory}
                    getControlLabel={getControlLabel}
                    language={language}
                    name={nameBasedOnLanguage["FACTORY"][language]}
                  />
                </div>
              </Grid>
            )}
          {![
            "USER_PERMISSION_DEPARTMENT",
            "BASIC_DATA_CATEGORY",
            "AC_ITEM_M",
          ].includes(tableName) &&
            departments && (
              <Grid
                item
                size={{ xs: 12, sm: 6, md: 2 }}
                sx={{
                  maxHeight:
                    title === "USER_PERMISSION"
                      ? 500
                      : tableHeight || "calc(100vh - 350px)",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <div
                  ref={departmentMenuRef}
                  onClick={handleDepartmentMenuClick}
                  tabIndex={0}
                  style={{ outline: "none" }}
                >
                  <DepartmentList
                    data={departments}
                    selectRow={selectDepartment}
                    onSelectRow={onSelectDepartment}
                    getControlLabel={getControlLabel}
                    language={language}
                    name={nameBasedOnLanguage["DEPARTMENTS"][language]}
                  />
                </div>
              </Grid>
            )}
          {tableName === "PROGRAM_FIELD_TITLE" && programs && (
            <Grid
              item
              size={{ xs: 12, sm: 6, md: 2 }}
              sx={{
                maxHeight:
                  title === "USER_PERMISSION"
                    ? 500
                    : tableHeight || "calc(100vh - 350px)",
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              <div
                ref={programMenuRef}
                onClick={handleProgramMenuClick}
                tabIndex={0}
                style={{ outline: "none" }}
              >
                <ProgramList
                  data={programs}
                  selectRow={selectProgram}
                  onSelectRow={onSelectProgram}
                  getControlLabel={getControlLabel}
                  name={nameBasedOnLanguage["PROGRAM"][language]}
                />
              </div>
            </Grid>
          )}
          <Grid
            item
            size={{
              xs: 12,
              sm: 12,
              md:
                tableName === "USER"
                  ? 8
                  : tableName === "VW_AC_SRCORDER"
                    ? 20
                    : tableName === "FACTORY" ||
                        tableName === "USER_PERMISSION" ||
                        tableName === "BASIC_DATA" ||
                        tableName === "BASIC_DATA_CATEGORY" ||
                        tableName === "AC_IMP_MATERIAL_TRACKING" ||
                        tableName === "AC_ITEM_M" ||
                        tableName === "AC_ITEM_REF" ||
                        tableName === "AC_SHOE_M" ||
                        tableName === "AC_SHOE_REF" ||
                        tableName === "AC_BOM_M" ||
                        tableName === "AC_PROD_M" ||
                        tableName === "PROGRAM" ||
                        tableName === "RD_SIZE_D" ||
                        tableName === "VW_AC_SHOEBOM" ||
                        tableName === "AC_VEND_BASE" ||
                        tableName === "AC_SEND_BASE" ||
                        tableName === "AC_REQ_M" ||
                        tableName === "AC_REQ_ORDER" ||
                        tableName === "IV_TRANS_D_TW" ||
                        tableName === "VW_AC_ALLCHK" ||
                        tableName === "AC_SRCORDER_M" ||
                        tableName === "VW_CONT_IMP" ||
                        tableName === "AC_CONT_D" ||
                        tableName === "VW_CONT_USE" ||
                        tableName === "VW_CONT_IMP_1" ||
                        tableName === "AC_INM_M" ||
                        tableName === "AC_INM_D" ||
                        tableName === "VW_CHG_M" ||
                        tableName === "AC_CHG_D" ||
                        tableName === "AC_CHG_A" ||
                        tableName === "VW_ACREQ_D" ||
                        tableName === "AC_PROC_M" ||
                        tableName === "AC_PROC_D" ||
                        tableName === "AC_DESC_PROC" ||
                        tableName === "AC_PROC_M_1" ||
                        tableName === "AC_PROC_D_1" ||
                        tableName === "SE_SHIPING_M" ||
                        tableName === "SE_SHIPING_D" ||
                        tableName === "VW_APDUE_ALL" ||
                        tableName === "SE_PLAN_ORD" ||
                        tableName === "SE_PLAN_SIZE" ||
                        tableName === "SD_ORD_M_C" ||
                        tableName === "VW_CONT_EXP" ||
                        tableName === "VW_CHG_EXMP" ||
                        tableName === "SE_PAY" ||
                        tableName === "SD_ORD_M" ||
                        tableName === "SD_PRICE_ITEM" ||
                        tableName === "VW_CHG_EXP" ||
                        tableName === "PLAN_ORD" ||
                        tableName === "SE_INV_M" ||
                        tableName === "CHG_M" ||
                        tableName === "SE_INV_D" ||
                        tableName === "SD_PRICE_ITEM_1" ||
                        tableName === "PAKING_LIST_M" ||
                        tableName === "PAKING_LIST_D" ||
                        tableName === "AC_ISSUE_M_T" ||
                        tableName === "AC_ISSUE_MATD_T" ||
                        tableName === "VW_AC_ISSUE_T" ||
                        tableName === "AC_CHK_T" ||
                        tableName === "VW_AC_SUM" ||
                        tableName === "VW_AC_CHGSUM" ||
                        tableName === "VW_AC_CHK_T" ||
                        tableName === "SE_SALES" ||
                        tableName === "SE_SALES_D" ||
                        tableName === "AC_EXPECT_M" ||
                        tableName === "AC_EXPECT_SE" ||
                        tableName === "AC_EXPECT_MATD" ||
                        tableName === "AC_CO_M" ||
                        tableName === "SE_PLAN_ORD_LINK" ||
                        tableName === "SAP_TRANS_TYPE" ||
                        tableName === "RD_TEMP" ||
                        tableName === "TEXT_IMPORT" ||
                        tableName === "AC_DESC_CHG" ||
                        tableName === "AC_PLAN_ORD" ||
                        tableName === "AC_PLAN_SIZE" ||
                        tableName === "AC_PLAN_PACK"
                      ? 12
                      : 10,
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              height: isSubTable ? "auto" : "100%",
              // maxHeight:"400px",
              width: "100%",
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                minHeight: 0,
                width: "100%",
                minWidth: 0,
              }}
              onClick={() => {
                if (!isSubTable) {
                  setFocusContext("table");
                }
              }}
            >
              <DataGrid
                rows={getFilteredData}
                columns={mapColumns}
                rowHeight={title === "USER_PERMISSION" ? 50 : 35}
                columnHeaderHeight={40}
                checkboxSelection={
                  customCheckboxColumn ? false : checkboxSelection
                }
                onRowSelectionModelChange={handleRowSelectionChange}
                paginationMode="server"
                onPaginationModelChange={handlePaginationModelChange}
                rowCount={totalData || getFilteredData.length}
                getRowId={getRowId}
                onRowClick={handleRowClick}
                selectionModel={
                  Array.isArray(selectRows)
                    ? selectRows
                        .filter((row) => row)
                        .map((row) => getRowId(row))
                    : []
                }
                onRowDoubleClick={handleRowDoubleClick}
                getRowClassName={getRowClassName}
                columnVisibilityModel={undefined}
                disableRowSelectionOnClick={disableRowSelectionOnClick}
                onColumnWidthChange={handleColumnWidthChange}
                {...{
                  slots: {
                    footer: CustomFooter,
                  },
                }}
                sx={{
                  border: 1,
                  borderColor: "#ccc",
                  width: "100%",
                  overflow: "clip",
                  "& .MuiDataGrid-virtualScroller": {
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(71, 85, 105, 0.48) transparent",
                  },
                  "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
                    width: 7,
                    height: 7,
                  },
                  "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
                    backgroundColor: "rgba(71, 85, 105, 0.48)",
                    borderRadius: 999,
                  },
                  "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: "rgba(51, 65, 85, 0.72)",
                  },
                  "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within":
                    {
                      outline: "none !important",
                    },
                  "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
                    {
                      outline: "none !important",
                    },
                  "& .MuiDataGrid-row:focus, & .MuiDataGrid-row:focus-within": {
                    outline: "none !important",
                  },
                  "&.MuiDataGrid-root:focus, &.MuiDataGrid-root:focus-within": {
                    outline: "none",
                  },
                  "& .MuiDataGrid-cell": {
                    borderRight: "1px solid #ccc",
                    borderBottom: "1px solid #ccc",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    position:
                      !isSubTable && !isPopup ? "sticky" : "relative",
                    top:
                      !isSubTable && !isPopup
                        ? stickyMasterHeaderTop
                        : "auto",
                    zIndex: !isSubTable && !isPopup ? 6 : "auto",
                    boxShadow:
                      !isSubTable && !isPopup
                        ? "0 2px 6px rgba(15, 23, 42, 0.10)"
                        : "none",
                    borderBottom: "1px solid #ccc",
                    borderTop: "1px solid #ccc",
                    borderRight: "1px solid #ccc",
                  },
                  "& .MuiDataGrid-columnHeader": {
                    borderRight: "1px solid #ccc",
                    backgroundColor: "blue",
                  },
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: "bold",
                    color: "white",
                    fontSize: "15px",
                  },
                  "& .Mui-selected-row": {
                    backgroundColor: "yellow!important",
                    "&:hover": {
                      backgroundColor: "#787878!important",
                    },
                  },
                  "&:focus": {
                    outline: "none",
                  },
                }}
              />
            </Box>
            {tableName === "USER_PERMISSION_DEPARTMENT" && (
              <Box
                ref={subTableRef}
                onClick={handleSubTableClick}
                tabIndex={0}
                sx={{
                  flexGrow: 0,
                  minHeight: 0,
                  width: `${tableName === "USER" ? "50px" : "100%"}`,
                  outline: "none",
                  overflow: "visible",
                }}
              >
                <UsersPermission
                  selectUser={selectRows.length > 0 ? selectRows[0] : []}
                  selectFactory={
                    selectRows.length > 0
                      ? factories[0].data?.find(
                          (f) => f.factory_code === selectRows[0]?.factory_code,
                        )
                      : {}
                  }
                  selectDepartment={
                    selectRows.length > 0
                      ? deptList?.find(
                          (d) =>
                            d.department_code ===
                              selectRows[0]?.department_code &&
                            d.factory_code === selectRows[0]?.factory_code,
                        )
                      : {}
                  }
                  rowSelectionModel={selectedItemRefs}
                  onRowSelectionModelChange={(newSelection) => {
                    if (onSelectionChange) {
                      onSelectionChange(newSelection);
                    }
                  }}
                  disableRowSelectionOnClick={checkboxSelection}
                  selectProgram={selectProgram}
                  onSelectFactory={onSelectFactory}
                  onSelectDepartment={onSelectDepartment}
                  onSelectUser={onSelectUser}
                  onSelectProgram={onSelectProgram}
                  factory_code={selectRows[0]?.factory_code}
                  departments={departments}
                  factories={factories}
                  users={users}
                  programs={programs}
                  selectRows={selectRows.length > 0 ? selectRows : []}
                  isSearch={isSearch}
                  searchData={searchData}
                  onSubTableRowSelect={handleSubTableRowSelect}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </div>
    </Box>
  );
}
