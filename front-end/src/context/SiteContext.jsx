import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_SITE_KEY,
  getCurrentSite,
  setCurrentSite,
  subscribeToSiteChanges,
} from "../config/sites";
import { showDatabaseUnavailableToast } from "../utils/notification/Notification";
import { siteHealthQueryOptions } from "../service/siteHealth/siteHealth";
import { SiteContext } from "./siteContext";

const getInitialSite = () => {
  const isAuthEntry =
    window.location.pathname === "/login" ||
    window.location.pathname === "/admin-login";

  if (!isAuthEntry) return getCurrentSite();

  localStorage.setItem("siteKey", DEFAULT_SITE_KEY);
  return DEFAULT_SITE_KEY;
};

export const SiteProvider = ({ children }) => {
  const [siteKey, setSiteKey] = useState(getInitialSite);
  const { t } = useTranslation();
  const healthQuery = useQuery(siteHealthQueryOptions(siteKey));

  useEffect(() => subscribeToSiteChanges(setSiteKey), []);

  useEffect(() => {
    if (!healthQuery.isError) return;
    showDatabaseUnavailableToast(
      t("site_unavailable", {
        site: siteKey,
        defaultValue:
          "{{site}} database is unavailable. Select another environment or retry.",
      }),
      siteKey,
    );
  }, [healthQuery.isError, siteKey, t]);

  const selectSite = useCallback((nextSite) => {
    const selectedSite = setCurrentSite(nextSite);
    setSiteKey(selectedSite);
    return selectedSite;
  }, []);

  const value = useMemo(
    () => ({
      siteKey,
      selectSite,
      health: healthQuery.data,
      isHealthy: healthQuery.data?.database === true,
      isChecking: healthQuery.isPending || healthQuery.isFetching,
      isInitialChecking: healthQuery.isPending,
      isUnavailable: healthQuery.isError,
      retryHealth: healthQuery.refetch,
    }),
    [healthQuery, selectSite, siteKey],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};
