import { useTest } from "@/hooks/use-tests";
import { useRoute, Link } from "wouter";
import { Clock, HelpCircle, CheckCircle, ArrowLeft } from "lucide-react";

export default function TestDetail() {
  const [, params] = useRoute("/tests/:id");
  const testId = params ? parseInt(params.id) : 0;
  const { data: test, isLoading } = useTest(testId);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!test) return <div className="text-center py-20">검사를 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/tests" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4 mr-1" /> 목록으로 돌아가기
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
        {/* Header Image */}
        <div className="h-64 sm:h-80 bg-secondary relative">
          {test.coverImage ? (
            <img src={test.coverImage} alt={test.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <span className="font-heading text-5xl text-primary/20">INPSYT</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <span className="inline-block px-3 py-1 mb-3 text-xs font-bold bg-white/20 backdrop-blur-md rounded-full border border-white/30">
              {test.category === 'parenting' ? '양육 태도' : '심리 검사'}
            </span>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">{test.title}</h1>
          </div>
        </div>

        <div className="p-8 md:p-12">
          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 py-6 border-y border-border/50">
            <div className="text-center">
              <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-xs text-muted-foreground mb-1">소요 시간</div>
              <div className="font-bold">{test.estimatedTime}분</div>
            </div>
            <div className="text-center">
              <HelpCircle className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-xs text-muted-foreground mb-1">문항 수</div>
              <div className="font-bold">{test.questionCount}문항</div>
            </div>
            <div className="text-center md:col-span-2 flex items-center justify-center">
              <div className="bg-secondary/50 px-6 py-2 rounded-lg text-sm text-center w-full">
                이 검사는 <span className="font-bold text-primary">전문 임상심리사</span>가 검증했습니다.
              </div>
            </div>
          </div>

          <div className="prose prose-slate max-w-none mb-12">
            <h3 className="font-heading text-xl font-bold mb-4">검사 소개</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-lg">
              {test.description}
            </p>
          </div>

          <div className="bg-secondary/30 rounded-2xl p-8 mb-12">
            <h3 className="font-heading text-lg font-bold mb-4">이런 분들에게 추천해요</h3>
            <ul className="space-y-3">
              {[
                "평소 자신의 양육 방식이 올바른지 고민되시는 분",
                "아이와의 관계 개선을 원하시는 분",
                "객관적인 심리 상태 점검이 필요하신 분"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center">
            <Link 
              href={`/tests/${test.id}/run`}
              className="inline-flex items-center justify-center px-12 py-5 text-lg font-bold text-white bg-primary rounded-full shadow-lg hover:bg-primary/90 hover:-translate-y-1 transition-all duration-200"
            >
              검사 시작하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
