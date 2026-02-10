import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useResults() {
  return useQuery({
    queryKey: [api.results.list.path],
    queryFn: async () => {
      const res = await fetch(api.results.list.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("결과 목록을 불러오지 못했습니다.");
      return api.results.list.responses[200].parse(await res.json());
    },
  });
}

export function useResult(id: number) {
  return useQuery({
    queryKey: [api.results.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.results.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("결과 상세 정보를 불러오지 못했습니다.");
      return api.results.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}
