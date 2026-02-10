import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TestResult, Test, Profile } from "@shared/schema";

type AdminResult = TestResult & {
  test: Test;
  profile: Profile;
  user: { firstName: string | null; email: string | null };
};

export default function AdminResults() {
  const { data: results, isLoading } = useQuery<AdminResult[]>({
    queryKey: ["/api/admin/results"],
  });

  if (isLoading) {
    return <div className="p-8 text-center">데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>관리자 대시보드 - 검사 결과 전체 조회</CardTitle>
          <CardDescription>
            모든 사용자의 심리 검사 제출 내역을 원시 데이터와 함께 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제출일시</TableHead>
                <TableHead>사용자 (이메일)</TableHead>
                <TableHead>대상자 (관계)</TableHead>
                <TableHead>검사명</TableHead>
                <TableHead>점수 요약</TableHead>
                <TableHead className="text-right">상세보기</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results?.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>
                    {result.conductedAt &&
                      format(new Date(result.conductedAt), "yyyy-MM-dd HH:mm", {
                        locale: ko,
                      })}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{result.user?.firstName || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground">{result.user?.email || "-"}</div>
                  </TableCell>
                  <TableCell>
                    {result.profile?.name} <span className="text-muted-foreground">({result.profile?.relation})</span>
                  </TableCell>
                  <TableCell>{result.test?.title}</TableCell>
                  <TableCell>
                    <pre className="text-xs">{JSON.stringify(result.score, null, 2)}</pre>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          원시 데이터
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>상세 결과 데이터</DialogTitle>
                          <DialogDescription>
                            검사 ID: {result.id} / 제출일: {result.conductedAt ? format(new Date(result.conductedAt), "yyyy-MM-dd HH:mm:ss") : "-"}
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
                          <div className="grid gap-4">
                            <div>
                              <h4 className="mb-2 font-semibold">User Info</h4>
                              <pre className="text-xs bg-muted p-2 rounded">
                                {JSON.stringify(result.user, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <h4 className="mb-2 font-semibold">Profile Info</h4>
                              <pre className="text-xs bg-muted p-2 rounded">
                                {JSON.stringify(result.profile, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <h4 className="mb-2 font-semibold">Answers (Raw)</h4>
                              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                                {JSON.stringify(result.answers, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <h4 className="mb-2 font-semibold">Computed Score</h4>
                              <pre className="text-xs bg-muted p-2 rounded">
                                {JSON.stringify(result.score, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
              {results?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    제출된 검사 결과가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
