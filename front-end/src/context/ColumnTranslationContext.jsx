import { createContext, useContext, useState, useEffect, useRef } from "react";
import { 
  getColumnProgramsFieldTitle,
  getControlUIProgramsFieldTitle
} from "../service/program_field_title/programFieldTitleService";

const ColumnTranslationContext = createContext();

export const useColumnTranslation = () => {
  const context = useContext(ColumnTranslationContext);
  if (!context) {
    throw new Error("useColumnTranslation must be used within ColumnTranslationProvider");
  }
  return context;
};

export const ColumnTranslationProvider = ({ children }) => {
  const [columnTranslations, setColumnTranslations] = useState({});
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const abortControllerRef = useRef(null);


  const fetchTableColumnTranslations = async (tableName,tableType="auto",relationship=null,specific_detail_table=null) => {
    const currentLanguage =  language;
    
    try {
      const response = await getColumnProgramsFieldTitle(tableName, currentLanguage,tableType,relationship,specific_detail_table);
      
      if (response?.success) {
        // Lưu vào state để dùng cho getHeaderName
        const translations = response.data.reduce((acc, item) => {
          acc[item.field] = item.title;
          return acc;
        }, {});
        
        setColumnTranslations((prev) => ({
          ...prev,
          [tableName]: translations,
        }));
        
        // TRẢ VỀ response cho component cha
        return response;
      }
      
      return null;
    } catch (error) {
      console.error(` Error fetching columns for ${tableName}:`, error);
      return null;
    }
  };

  const fetchTableControlTranslations = async (programCode) => {
    const currentLanguage =  language;
    try {
      const response = await getControlUIProgramsFieldTitle(programCode, currentLanguage);
      return response;
    } catch (error) {
      console.error(` Error fetching controls for ${programCode}:`, error);
      return null;
    }
  };

  // Get translated header name
  const getHeaderName = (tableName, fieldName) => {
    return columnTranslations[tableName]?.[fieldName] || fieldName;
  };

  //  Update language với cancel request cũ
  const updateLanguage = async (newLanguage) => {
    console.log("🔄 Updating language to:", newLanguage);
    
    // Cancel request đang chạy
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    // Update language ngay lập tức
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
    
    // Clear translations cũ
    setColumnTranslations({});
    
    try {
      // Refetch tất cả tables đã load với language mới
      const tableNames = Object.keys(columnTranslations);
      await Promise.allSettled(
        tableNames.map(tableName => 
          fetchTableColumnTranslations(tableName, newLanguage)
        )
      );
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
      } else {
        console.error('Error updating language:', error);
      }
    }
  };

  //  Lắng nghe thay đổi language
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Nếu language key bị xóa (logout)
      if (e.key === 'language' && e.newValue === null) {
        setLanguage('en');
        setColumnTranslations({});
      } else if (e.key === 'language' && e.newValue) {
        const newLang = e.newValue;
        if (newLang !== language) {
          updateLanguage(newLang);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [language]);

  //  Cleanup khi unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <ColumnTranslationContext.Provider
      value={{
        columnTranslations,
        language,
        fetchTableColumnTranslations,
        fetchTableControlTranslations,
        getHeaderName,
        updateLanguage,
      }}
    >
      {children}
    </ColumnTranslationContext.Provider>
  );
};