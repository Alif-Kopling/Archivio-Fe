import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettings, getTrashStats, emptyRejectedTrash, updateSetting } from "@/services/setting.service";

export function useSettings() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await getSettings();
      const settingsMap: Record<string, any> = {};
      data.forEach((s: any) => {
        const value = s.key.includes("auto_") || s.key.includes("email_")
          ? s.value === "true"
          : s.value;
        settingsMap[s.key] = value;
      });
      return settingsMap;
    },
  });

  const trashStatsQuery = useQuery({
    queryKey: ["settings", "trash"],
    queryFn: async () => {
      const { data } = await getTrashStats();
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const emptyTrashMutation = useMutation({
    mutationFn: emptyRejectedTrash,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "trash"] });
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isFetching: settingsQuery.isFetching,
    trashStats: trashStatsQuery.data,
    updateSetting: updateMutation.mutateAsync,
    emptyTrash: emptyTrashMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isTrashing: emptyTrashMutation.isPending,
  };
}
