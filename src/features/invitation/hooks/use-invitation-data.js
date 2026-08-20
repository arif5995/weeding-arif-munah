import { useQuery } from "@tanstack/react-query";
import { useInvitation } from "./use-invitation";
import { fetchInvitation, fetchBanks, fetchAgenda } from "@/services/api";

/**
 * Hook to fetch invitation data
 * @returns {object} Invitation data with loading, error states
 */
export function useInvitationData() {
  const { uid } = useInvitation();

  const {
    data: invitation,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["invitation", uid],
    queryFn: async () => {
      if (!uid) throw new Error("No invitation UID");
      const response = await fetchInvitation(uid);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error?.message || "Failed to fetch invitation");
    },
    enabled: !!uid,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    throwOnError: false,
  });

  return {
    invitation,
    isLoading,
    error: error?.message,
    refetch,
  };
}

/**
 * Hook to fetch bank accounts for an invitation
 * @returns {object} Bank accounts data with loading, error states
 */
export function useBankData() {
  const { uid } = useInvitation();

  const {
    data: banks,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["banks", uid],
    queryFn: async () => {
      if (!uid) throw new Error("No invitation UID");
      const response = await fetchBanks(uid);
      if (response.success) {
        return response.data;
      }
      throw new Error(
        response.error?.message || "Failed to fetch bank accounts",
      );
    },
    enabled: !!uid,
    staleTime: 10 * 60 * 1000,
    retry: 1,
    throwOnError: false,
  });

  return {
    banks: banks || [],
    isLoading,
    error: error?.message,
    refetch,
  };
}

/**
 * Hook to fetch agenda items for an invitation
 * @returns {object} Agenda data with loading, error states
 */
export function useAgendaData() {
  const { uid } = useInvitation();

  const {
    data: agenda,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["agenda", uid],
    queryFn: async () => {
      if (!uid) throw new Error("No invitation UID");
      const response = await fetchAgenda(uid);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.error?.message || "Failed to fetch agenda");
    },
    enabled: !!uid,
    staleTime: 10 * 60 * 1000,
    retry: 1,
    throwOnError: false,
  });

  return {
    agenda: agenda || [],
    isLoading,
    error: error?.message,
    refetch,
  };
}
