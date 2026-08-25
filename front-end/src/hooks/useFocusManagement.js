import { useState, useCallback } from 'react';

/**
 * Manage focus context across different UI sections
 * Sections: 'table', 'subtable', 'factoryMenu', 'departmentMenu', 'userMenu', 'programMenu', 'popup'
 * 
 * @param {string} initialContext - Initial focus context
 * @returns {Object} Focus context state and setter
 */
export const useFocusManagement = (initialContext = 'table') => {
  const [focusContext, setFocusContext] = useState(initialContext);

  const handleFocusChange = useCallback((context) => {
    setFocusContext(context);
  }, []);

  const isFocused = useCallback((context) => {
    return focusContext === context;
  }, [focusContext]);

  return {
    focusContext,
    setFocusContext: handleFocusChange,
    isFocused,
  };
};
