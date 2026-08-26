import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getColumnProgramsFieldTitle,
  getControlUIProgramsFieldTitle,
} from "../service/program_field_title/programFieldTitleService";

const ColumnTranslationContext = createContext();

export const useColumnTranslation = () => {
  const context = useContext(ColumnTranslationContext);
  if (!context) {
    throw new Error(
      "useColumnTranslation must be used within ColumnTranslationProvider",
    );
  }
  return context;
};

export const ColumnTranslationProvider = ({ children }) => {
  const [columnTranslations, setColumnTranslations] = useState({});
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en",
  );

  const fetchTableColumnTranslations = useCallback(
    async (
      tableName,
      tableType = "auto",
      relationship = null,
      specific_detail_table = null,
    ) => {
      try {
        const response = await getColumnProgramsFieldTitle(
          tableName,
          language,
          tableType,
          relationship,
          specific_detail_table,
        );

        if (response?.success) {
          const translations = response.data.reduce((acc, item) => {
            acc[item.field] = item.title;
            return acc;
          }, {});

          setColumnTranslations((prev) => ({
            ...prev,
            [tableName]: translations,
          }));

          return response;
        }

        return null;
      } catch (error) {
        console.error(`Error fetching columns for ${tableName}:`, error);
        return null;
      }
    },
    [language],
  );

  const fetchTableControlTranslations = useCallback(
    async (programCode) => {
      try {
        return await getControlUIProgramsFieldTitle(programCode, language);
      } catch (error) {
        console.error(`Error fetching controls for ${programCode}:`, error);
        return null;
      }
    },
    [language],
  );

  const getHeaderName = useCallback(
    (tableName, fieldName) =>
      columnTranslations[tableName]?.[fieldName] || fieldName,
    [columnTranslations],
  );

  const updateLanguage = useCallback((newLanguage) => {
    if (!newLanguage) return;

    localStorage.setItem("language", newLanguage);
    setColumnTranslations({});
    setLanguage((currentLanguage) =>
      currentLanguage === newLanguage ? currentLanguage : newLanguage,
    );
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key !== "language") return;

      if (event.newValue === null) {
        setColumnTranslations({});
        setLanguage("en");
        return;
      }

      if (event.newValue) {
        setColumnTranslations({});
        setLanguage(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
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
