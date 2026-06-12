import { useQuery } from "@tanstack/react-query";
import { getBranches } from "../../features/admin/api/admin-api";
import type { Branch } from "../../features/admin/types/branch-type";

export const BRANCH_QUERY_KEY = ["branches"] as const;

export const useGetBranches = () =>
  useQuery<Branch[], Error>({
    queryKey: BRANCH_QUERY_KEY,
    queryFn: getBranches,
  });
