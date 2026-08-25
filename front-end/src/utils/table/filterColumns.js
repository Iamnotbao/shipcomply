/**
 * Filter columns based on language
 * Columns ending with _e, _l, _t are language-specific
 * - _e: English
 * - _l: Vietnamese (local)
 * - _t: Chinese (traditional)
 * 
 * @param {Array} columns - Array of column definitions
 * @param {string} language - Current language code ('en', 'vi', 'zh')
 * @returns {Array} Filtered columns
 */
export const filterColumnsByLanguage = (columns, language) => {
  if (!columns || !Array.isArray(columns)) {
    return [];
  }
  
  return columns.filter((col) => {
    const field = col.field;
    
    // If no field, keep the column
    if (!field) {
      return true;
    }
    
    // Check if field ends with language suffix
    const hasLanguageSuffix = /_[elt]$/.test(field);
    
    // If no language suffix, always show
    if (!hasLanguageSuffix) {
      return true;
    }
    
    // Filter based on current language
    if (language === 'en' && field.endsWith('_e')) {
      return true;
    }
    if (language === 'vi' && field.endsWith('_l')) {
      return true;
    }
    if (language === 'zh' && field.endsWith('_t')) {
      return true;
    }
    
    return false;
  });
};

/**
 * Get the base field name without language suffix
 * Example: 'factory_name_e' -> 'factory_name'
 * 
 * @param {string} field - Field name with possible language suffix
 * @returns {string} Base field name
 */
export const getBaseFieldName = (field) => {
  if (!field) return '';
  return field.replace(/_[elt]$/, '');
};

/**
 * Get language-specific field name
 * Example: ('factory_name', 'en') -> 'factory_name_e'
 * 
 * @param {string} baseField - Base field name
 * @param {string} language - Language code
 * @returns {string} Language-specific field name
 */
export const getLanguageFieldName = (baseField, language) => {
  const suffixes = {
    en: '_e',
    vi: '_l',
    zh: '_t',
  };
  
  const suffix = suffixes[language];
  return suffix ? `${baseField}${suffix}` : baseField;
};
