import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertTestResult } from "@shared/schema";

export function useTests() {
  return useQuery({
    queryKey: [api.tests.list.path],
    queryFn: async () => {
      const res = await fetch(api.tests.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("검사 목록을 불러오지 못했습니다.");
      return api.tests.list.responses[200].parse(await res.json());
    },
  });
}

export function useTest(id: number) {
  return useQuery({
    queryKey: [api.tests.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.tests.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("검사 정보를 불러오지 못했습니다.");
      return api.tests.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useSubmitTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ testId, data }: { testId: number, data: Omit<InsertTestResult, 'userId' | 'testId'> }) => {
      const url = buildUrl(api.tests.submit.path, { id: testId });
      const res = await fetch(url, {
        method: api.tests.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("결과 제출에 실패했습니다.");
      return api.tests.submit.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.results.list.path] });
    },
  });
}
