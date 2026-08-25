import { useEffect, useCallback } from 'react';
import { KEYBOARD_SHORTCUTS, requiresCtrl } from '../constants/table';

/**
 * Handle keyboard shortcuts for table operations
 * Shortcuts:
 * - ` (backtick): Edit
 * - =: Add
 * - Ctrl+F: Select all
 * - Ctrl+V: View detail
 * - Arrow keys, Home, End: Navigation (handled separately)
 * 
 * @param {Object} params - Keyboard handler parameters
 * @param {string} params.focusContext - Current focus context
 * @param {Object} params.selectedRow - Currently selected row
 * @param {Array} params.selectedRows - All selected rows (for multi-select)
 * @param {Function} params.onAdd - Add handler
 * @param {Function} params.onEdit - Edit handler
 * @param {Function} params.onDelete - Delete handler
 * @param {Function} params.onDetail - Detail handler
 * @param {Function} params.onSelectAll - Select all handler
 * @param {boolean} params.disabled - Disable keyboard shortcuts
 */
export const useTableKeyboard = ({
  focusContext = 'table',
  selectedRow = null,
  selectedRows = [],
  onAdd,
  onEdit,
  onDelete,
  onDetail,
  onSelectAll,
  disabled = false,
}) => {
  const handleKeyDown = useCallback((event) => {
    // Only handle shortcuts when table is focused and not disabled
    if (focusContext !== 'table' || disabled) return;

    // Don't trigger shortcuts when typing in input fields
    const target = event.target;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    const { key, ctrlKey, metaKey } = event;
    const isModifier = ctrlKey || metaKey;

    // Edit (backtick)
    if (key === KEYBOARD_SHORTCUTS.EDIT && !isModifier) {
      if (selectedRow && onEdit) {
        event.preventDefault();
        onEdit(selectedRow);
      }
      return;
    }

    // Add (equals sign)
    if (key === KEYBOARD_SHORTCUTS.ADD && !isModifier) {
      if (onAdd) {
        event.preventDefault();
        onAdd();
      }
      return;
    }

    // Select All (Ctrl+F)
    if (key === KEYBOARD_SHORTCUTS.SELECT_ALL && isModifier) {
      if (onSelectAll) {
        event.preventDefault();
        onSelectAll();
      }
      return;
    }

    // View Detail (Ctrl+V)
    if (key === KEYBOARD_SHORTCUTS.VIEW_DETAIL && isModifier) {
      if (selectedRow && onDetail) {
        event.preventDefault();
        onDetail(selectedRow);
      }
      return;
    }
  }, [
    focusContext,
    disabled,
    selectedRow,
    selectedRows,
    onAdd,
    onEdit,
    onDelete,
    onDetail,
    onSelectAll,
  ]);

  useEffect(() => {
    if (disabled) return;

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, disabled]);

  return {
    // Expose shortcuts for documentation/help
    shortcuts: KEYBOARD_SHORTCUTS,
  };
};
