import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useAuth from "../hooks/useAuth";
import { useSite } from "./siteContextStore";
import { getSiteEventsUrl } from "../config/sites";
import { connectToEventStream } from "../service/realtime/sseClient";

export const RealtimeProvider = ({ children }) => {
  const { user } = useAuth();
  const { siteKey, isHealthy } = useSite();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = user?.access_token || localStorage.getItem("access_token");
    if (!token || !isHealthy) return undefined;

    return connectToEventStream({
      url: getSiteEventsUrl(siteKey),
      token,
      onEvent: (event) => {
        if (event.type !== "entity.changed" || event.site !== siteKey) return;

        queryClient.invalidateQueries({
          predicate: (query) => {
            if (query.queryKey[0] === "siteHealth") return false;
            const entities = query.meta?.entities;
            return (
              (Array.isArray(entities) && entities.includes(event.entity)) ||
              (query.queryKey[0] === "entity" &&
                query.queryKey[1] === siteKey &&
                query.queryKey.includes(event.entity))
            );
          },
        });
      },
    });
  }, [isHealthy, queryClient, siteKey, user?.access_token]);

  return children;
};
