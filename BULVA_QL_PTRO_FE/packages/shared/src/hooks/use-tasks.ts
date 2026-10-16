import { useQuery } from "@tanstack/react-query";
import type { AppApi } from "../api/app-api";
import { queryKeys } from "./query-keys";

export function useTasksQuery(api: AppApi, enabled = true) {
  return useQuery({
    queryKey: queryKeys.tasks,
    queryFn: () => api.tasks(),
    enabled,
    staleTime: 15_000,
  });
}
