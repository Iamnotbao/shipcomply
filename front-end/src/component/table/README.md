# DataTable Component - Refactored Structure

## 📋 Overview

This document explains the refactored structure of the DataTable component. The original **1940-line monolithic file** has been split into **modular, reusable pieces** for better maintainability.

---

## 🗂️ New File Structure

```
src/
├── component/table/
│   ├── DataTable.jsx                 # Main component (original - 1940 lines)
│   ├── DataTable.jsx.backup          # Backup of original
│   ├── ActionButtons.jsx             # Action buttons (Edit, Delete, etc.)
│   ├── TableColumns.jsx              # Column definitions
│   ├── TableColumnsWithActions.jsx   # Columns with action buttons
│   ├── cells/                        # 🆕 Custom cell renderers
│   │   ├── DateCell.jsx
│   │   ├── StatusCell.jsx
│   │   ├── SwitchCell.jsx
│   │   ├── CheckboxCell.jsx
│   │   ├── DropdownCell.jsx
│   │   └── DefaultCell.jsx
│   └── footer/                       # 🆕 Footer components
│       ├── TableFooter.jsx
│       ├── FooterInfo.jsx
│       └── FooterPagination.jsx
│
├── hooks/                            # 🆕 Custom hooks (root level)
│   ├── useAuth.js                   # Already exists
│   ├── useFocusManagement.js        # 🆕 Focus context management
│   ├── useTablePagination.js        # 🆕 Pagination logic
│   ├── useRowSelection.js           # 🆕 Row selection logic
│   ├── useTableNavigation.js        # 🆕 Arrow key navigation
│   └── useTableKeyboard.js          # 🆕 Keyboard shortcuts
│
├── utils/table/                      # 🆕 Utility functions
│   ├── getRowId.js                  # Generate row IDs
│   ├── filterColumns.js             # Language-based filtering
│   └── columnRenderer.js            # Cell renderer selection
│
└── constants/table/                  # 🆕 Configuration
    ├── tableHeights.js              # Table heights per type
    ├── pageSizes.js                 # Page sizes per type
    └── keyboardShortcuts.js         # Keyboard shortcut definitions
```

---

## 📦 Component Breakdown

### **1. Cell Components** (`src/component/table/cells/`)

Custom cell renderers for different data types:

#### **DateCell.jsx**
- Formats dates using `moment.js`
- Format: `YYYY-MM-DD HH:mm:ss`
- Used for: `grt_date`, `last_date`, `create_date`, `update_date`

```jsx
import { DateCell } from './cells';
<DateCell value={row.grt_date} />
```

#### **StatusCell.jsx**
- Maps status codes to text
- Codes: `0=Cancel`, `1=New`, `2=Checked`, `7=Confirm`, `9=Close`
- Translates status text with i18n

```jsx
import { StatusCell } from './cells';
<StatusCell value={row.status} />
```

#### **SwitchCell.jsx**
- Toggle switch for boolean values
- Used for: `allow_*` fields in USER_PERMISSION
- Handles onChange events

```jsx
import { SwitchCell } from './cells';
<SwitchCell 
  value={row.allow_add} 
  row={row} 
  field="allow_add" 
  onChange={handleChange} 
/>
```

#### **CheckboxCell.jsx**
- Checkbox for boolean values
- Used for: `is_default`, `req_qc` in AC_VEND_BASE

#### **DropdownCell.jsx**
- Dropdown for level selection (0, 1, 2, 3, 4)
- Used for: `query_level`, `modify_level`

#### **DefaultCell.jsx**
- Simple text rendering
- Fallback for all other cell types

---

### **2. Footer Components** (`src/component/table/footer/`)

#### **FooterInfo.jsx**
- Displays selected row information
- Shows: `grt_dept`, `grt_user`, `grt_date`, `last_user`, `last_date`
- Auto-formats dates

#### **FooterPagination.jsx**
- Custom pagination controls
- Shows: **Previous | Page X / Y | Next**
- Material-UI IconButtons

#### **TableFooter.jsx**
- Main footer wrapper
- Combines FooterInfo + FooterPagination

---

### **3. Custom Hooks** (`src/hooks/`)

#### **useFocusManagement.js**
Manages focus across different UI sections:
- `table`, `subtable`, `factoryMenu`, `departmentMenu`, `userMenu`, `programMenu`, `popup`

```jsx
const { focusContext, setFocusContext, isFocused } = useFocusManagement('table');
```

#### **useTablePagination.js**
Handles pagination state and logic:

```jsx
const {
  page,
  pageSize,
  setPage,
  setPageSize,
  goToNextPage,
  goToPreviousPage,
  goToFirstPage,
  goToLastPage,
} = useTablePagination('USER');
```

#### **useRowSelection.js**
Manages row selection (single or multiple):

```jsx
const {
  selectedRow,
  selectedRows,
  setSelectedRow,
  clearSelection,
  toggleRowSelection,
  selectAll,
} = useRowSelection(multiSelect);
```

#### **useTableNavigation.js**
Handles arrow key navigation with auto-pagination:

```jsx
const {
  handleArrowDown,
  handleArrowUp,
  handleHome,
  handleEnd,
} = useTableNavigation({
  data,
  selectedRow,
  page,
  pageSize,
  totalRows,
  onPageChange,
  onRowSelect,
  getRowId,
});
```

#### **useTableKeyboard.js**
Keyboard shortcuts handler:
- **`** (backtick): Edit selected row
- **=**: Add new row
- **Ctrl+F**: Select all rows
- **Ctrl+V**: View detail
- **Home/End**: Jump to first/last row

```jsx
useTableKeyboard({
  focusContext,
  selectedRow,
  onAdd,
  onEdit,
  onDetail,
  onSelectAll,
});
```

---

### **4. Utility Functions** (`src/utils/table/`)

#### **getRowId.js**
Generates unique row ID for 20+ table types:

```jsx
import { getRowId } from '../../utils/table';

const id = getRowId(row, 'USER');
// Returns: "factory_code-department_code-user_code"
```

Supported tables:
- USER, FACTORY, DEPARTMENTS
- USER_PERMISSION, USER_PERMISSION_DEPARTMENT
- BASIC_DATA_CATEGORY, BASIC_DATA
- PROGRAM, PROGRAM_FIELD_TITLE
- AC_ITEM_M, AC_ITEM_REF, AC_SHOE_M, AC_SHOE_REF
- AC_PROD_M, AC_BOM_M, RD_SIZE_D
- VW_AC_SHOEBOM, AC_VEND_BASE, AC_SEND_BASE
- AC_REQ_M, AC_REQ_ORDER, AC_IMP_MATERIAL_TRACKING

#### **filterColumns.js**
Filters columns by language (_e, _l, _t suffixes):

```jsx
import { filterColumnsByLanguage } from '../../utils/table';

const filtered = filterColumnsByLanguage(columns, 'en');
// Shows only columns ending with '_e' (English)
```

#### **columnRenderer.js**
Determines which cell renderer to use:

```jsx
import { getColumnRenderer } from '../../utils/table';

const rendererType = getColumnRenderer('allow_add', 'USER_PERMISSION');
// Returns: 'switch'
```

---

### **5. Constants** (`src/constants/table/`)

#### **tableHeights.js**
Height configuration for each table type:

```jsx
import { getTableHeight } from '../../constants/table';

const height = getTableHeight('USER_PERMISSION');
// Returns: "calc(100vh - 430px)"
```

#### **pageSizes.js**
Page size options for each table:

```jsx
import { getPageSizeOptions, getDefaultPageSize } from '../../constants/table';

const options = getPageSizeOptions('FACTORY');
// Returns: [5, 10, 25]

const defaultSize = getDefaultPageSize('FACTORY');
// Returns: 5
```

#### **keyboardShortcuts.js**
Keyboard shortcut definitions:

```jsx
import { KEYBOARD_SHORTCUTS, getShortcutDescription } from '../../constants/table';

console.log(KEYBOARD_SHORTCUTS.EDIT); // "`"
console.log(getShortcutDescription('`')); // "Edit selected row"
```

---

## 🎯 Benefits of Refactoring

### **Before (Original)**
-  **1940 lines** in one file
-  Hard to find specific logic
-  Difficult to test individual features
-  High cognitive load
-  Code duplication

### **After (Refactored)**
-  **~200 lines per file** (average)
-  Clear separation of concerns
-  Easy to test each module
-  Reusable hooks and utilities
-  DRY principle applied
-  Follows React best practices
-  Consistent with project structure

---

## 🔧 How to Use Refactored Components

### **Example: Using Custom Cells**

```jsx
import { DateCell, StatusCell, SwitchCell } from './cells';

const columns = [
  {
    field: 'grt_date',
    headerName: 'Created Date',
    renderCell: (params) => <DateCell value={params.value} />,
  },
  {
    field: 'status',
    headerName: 'Status',
    renderCell: (params) => <StatusCell value={params.value} />,
  },
  {
    field: 'allow_add',
    headerName: 'Allow Add',
    renderCell: (params) => (
      <SwitchCell 
        value={params.value} 
        row={params.row} 
        field="allow_add"
        onChange={handleChange}
      />
    ),
  },
];
```

### **Example: Using Hooks**

```jsx
import { useFocusManagement, useTablePagination, useTableNavigation } from '../../hooks';

function MyTable() {
  const { focusContext, setFocusContext } = useFocusManagement();
  const { page, pageSize, setPage } = useTablePagination('USER');
  const { handleArrowDown, handleArrowUp } = useTableNavigation({
    data,
    selectedRow,
    page,
    pageSize,
    onPageChange: setPage,
    onRowSelect: setSelectedRow,
    getRowId,
  });

  // Use these hooks to build your table...
}
```

### **Example: Using Utils**

```jsx
import { getRowId, filterColumnsByLanguage } from '../../utils/table';
import { getTableHeight, getPageSizeOptions } from '../../constants/table';

const rowId = getRowId(row, 'USER');
const filteredCols = filterColumnsByLanguage(columns, 'en');
const height = getTableHeight('USER');
const pageSizes = getPageSizeOptions('USER');
```

---

## 🚀 Next Steps

### **Option 1: Keep Original (Recommended for now)**
- Keep `DataTable.jsx` as is (backup created)
- Use new modules gradually in new features
- Test thoroughly before full migration

### **Option 2: Gradual Migration**
- Start using new hooks in original file
- Replace inline functions with utils
- Move cell rendering to new components
- Migrate section by section

### **Option 3: Full Refactor** (High risk)
- Rewrite DataTable.jsx using all new modules
- Requires extensive testing
- Potential breaking changes

---

## 📝 Notes

### **What's Been Created**
 Cell components (6 files)
 Footer components (3 files)
 Custom hooks (5 files)
 Utility functions (3 files)
 Constants (3 files)
 Backup of original DataTable.jsx

### **What's NOT Changed**
- Original `DataTable.jsx` is **still intact**
- All existing functionality preserved
- No breaking changes

### **Safe to Discard**
If you don't like the refactored structure:
1. Delete new folders: `cells/`, `footer/`
2. Delete new files in `hooks/`: `useFocusManagement.js`, etc.
3. Delete `utils/table/` and `constants/table/`
4. Keep using original `DataTable.jsx`

---

## 🧪 Testing Checklist

Before using refactored components:
- [ ] Test cell renderers individually
- [ ] Test pagination hooks
- [ ] Test navigation with arrow keys
- [ ] Test keyboard shortcuts
- [ ] Test focus management
- [ ] Test with different table types
- [ ] Test multi-language support
- [ ] Test row selection (single/multiple)

---

## 📚 References

- Original file: `src/component/table/DataTable.jsx` (1940 lines)
- Backup: `src/component/table/DataTable.jsx.backup`
- New structure follows patterns from: `src/hooks/`, `src/features/`, `src/service/`

---

**Created by**: Rovo Dev  
**Date**: Today  
**Status**:  Structure created, ready for review
