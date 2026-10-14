import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDiscussion, createLead, fetchLead, fetchLeads, updateLeadStatus } from "@/lib/api";
import type {
  AddDiscussionInput,
  CreateLeadInput,
  LeadDetail,
  LeadFilters,
  LeadStatus,
  LeadSummary,
} from "@/lib/types";

const LEADS_KEY = ["leads"] as const;
const listKey = (filters: LeadFilters) => [...LEADS_KEY, "list", filters] as const;
const detailKey = (id: number) => [...LEADS_KEY, "detail", id] as const;

export function useLeads(filters: LeadFilters) {
  return useQuery({
    queryKey: listKey(filters),
    queryFn: () => fetchLeads(filters),
    placeholderData: keepPreviousData,
  });
}

export function useLead(id: number | null) {
  return useQuery({
    queryKey: detailKey(id ?? 0),
    queryFn: () => fetchLead(id as number), // enabled only when id is non-null
    enabled: id !== null,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLeadInput) => createLead(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEADS_KEY }),
  });
}

export function useAddDiscussion(leadId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddDiscussionInput) => addDiscussion(leadId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEADS_KEY }),
  });
}

export function useUpdateStatus(leadId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: LeadStatus) => updateLeadStatus(leadId, status),
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: LEADS_KEY });
      const previousLists = queryClient.getQueriesData<LeadSummary[]>({
        queryKey: [...LEADS_KEY, "list"],
      });
      const previousDetail = queryClient.getQueryData<LeadDetail>(detailKey(leadId));

      queryClient.setQueriesData<LeadSummary[]>({ queryKey: [...LEADS_KEY, "list"] }, (leads) =>
        leads?.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)),
      );
      queryClient.setQueryData<LeadDetail>(detailKey(leadId), (lead) =>
        lead ? { ...lead, status } : lead,
      );
      return { previousLists, previousDetail };
    },
    onError: (_error, _status, context) => {
      context?.previousLists.forEach(([key, data]) => queryClient.setQueryData(key, data));
      if (context?.previousDetail) {
        queryClient.setQueryData(detailKey(leadId), context.previousDetail);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: LEADS_KEY }),
  });
}
