/**
 * Determine which cell renderer to use for a given field
 * 
 * @param {string} field - Column field name
 * @param {string} tableName - Table name for context-specific rendering
 * @returns {string} Renderer type: 'switch', 'dropdown', 'date', 'status', 'checkbox', 'default'
 */
export const getColumnRenderer = (field, tableName) => {
  if (!field) return 'default';
  
  // Switch renderer for permission fields
  if (field.startsWith('allow_')) {
    return 'switch';
  }
  
  // Dropdown renderer for level fields
  if (['query_level', 'modify_level'].includes(field)) {
    return 'dropdown';
  }
  
  // Date renderer for date fields
  if (['grt_date', 'last_date', 'create_date', 'update_date'].includes(field)) {
    return 'date';
  }
  
  // Status renderer for status field
  if (field === 'status') {
    return 'status';
  }
  
  // Checkbox renderer for boolean fields in specific tables
  if (tableName === 'AC_VEND_BASE' && ['is_default', 'req_qc'].includes(field)) {
    return 'checkbox';
  }
  
  return 'default';
};

/**
 * Status code to text mapping
 */
export const STATUS_MAP = {
  0: 'Cancel',
  1: 'New',
  2: 'Checked',
  7: 'Confirm',
  9: 'Close',
};

/**
 * Get status text from status code
 * @param {number|string} statusCode - Status code
 * @returns {string} Status text
 */
export const getStatusText = (statusCode) => {
  return STATUS_MAP[statusCode] || statusCode;
};
