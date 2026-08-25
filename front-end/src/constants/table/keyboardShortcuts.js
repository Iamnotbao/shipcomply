// Keyboard shortcuts configuration for DataTable
export const KEYBOARD_SHORTCUTS = {
  EDIT: '`',
  ADD: '=',
  SELECT_ALL: 'f',
  VIEW_DETAIL: 'v',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  HOME: 'Home',
  END: 'End',
  TAB: 'Tab',
};

/**
 * Check if Ctrl key is required for a shortcut
 * @param {string} key - The keyboard shortcut key
 * @returns {boolean}
 */
export const requiresCtrl = (key) => {
  return ['f', 'v'].includes(key);
};

/**
 * Get human-readable description of a keyboard shortcut
 * @param {string} key - The keyboard shortcut key
 * @returns {string}
 */
export const getShortcutDescription = (key) => {
  const descriptions = {
    '`': 'Edit selected row',
    '=': 'Add new row',
    'f': 'Select all rows (Ctrl+F)',
    'v': 'View detail (Ctrl+V)',
    'ArrowUp': 'Navigate to previous row',
    'ArrowDown': 'Navigate to next row',
    'Home': 'Jump to first row',
    'End': 'Jump to last row',
    'Tab': 'Switch focus between sections',
  };
  
  return descriptions[key] || '';
};
