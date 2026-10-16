import { useQuery } from "@tanstack/react-query";
import type { AppApi } from "../api/app-api";
import { queryKeys } from "./query-keys";

export function useMeQuery(api: AppApi, enabled = true) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => api.me(),
    enabled,
    retry: false,
    staleTime: 60_000,
  });
}
