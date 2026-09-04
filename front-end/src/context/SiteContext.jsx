import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  getCurrentSite,
  setCurrentSite,
  subscribeToSiteChanges,
} from "../config/sites";
import { siteHealthQueryOptions } from "../service/siteHealth/siteHealth";
import { SiteContext } from "./siteContext";

export const SiteProvider = ({ children }) => {
  const [siteKey, setSiteKey] = useState(getCurrentSite);
  const { t } = useTranslation();
  const healthQuery = useQuery(siteHealthQueryOptions(siteKey));

  useEffect(() => subscribeToSiteChanges(setSiteKey), []);

  useEffect(() => {
    if (!healthQuery.isError) return;
    toast.error(
      t("site_unavailable", {
        site: siteKey,
        defaultValue: `{{site}} database is unavailable. Select another environment or retry.`,
      }),
      { toastId: `site-unavailable:${siteKey}`, autoClose: 9000 },
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
