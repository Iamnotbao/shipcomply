import { queryOptions } from "@tanstack/react-query";
import { getSiteHealthUrl, normalizeSiteKey } from "../../config/sites";

export class SiteUnavailableError extends Error {
  constructor(siteKey, status) {
    super(`Site ${siteKey} is unavailable`);
    this.name = "SiteUnavailableError";
    this.siteKey = siteKey;
    this.status = status;
  }
}

export const fetchSiteHealth = async (siteKey, signal) => {
  const normalizedSite = normalizeSiteKey(siteKey);
  const response = await fetch(getSiteHealthUrl(normalizedSite), {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || data?.database !== true) {
    throw new SiteUnavailableError(normalizedSite, response.status);
  }

  return data;
};

export const siteHealthQueryOptions = (siteKey) =>
  queryOptions({
    queryKey: ["siteHealth", normalizeSiteKey(siteKey)],
    queryFn: ({ signal }) => fetchSiteHealth(siteKey, signal),
    staleTime: 15_000,
    refetchInterval: 30_000,
    retry: 1,
    retryDelay: 1_000,
  });
