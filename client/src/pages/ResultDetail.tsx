import { useResult } from "@/hooks/use-results";
import { useRoute } from "wouter";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { Share2, Download, RefreshCw } from "lucide-react";

export default function ResultDetail() {
  const [, params] = useRoute("/results/:id");
  const resultId = params ? parseInt(params.id) : 0;
  const { data: result, isLoading } = useResult(resultId);

  if (isLoading) return <div className="p-20 text-center">결과 분석 중...</div>;
  if (!result) return <div className="p-20 text-center">결과를 찾을 수 없습니다.</div>;

  // Mock data for visualization since actual score structure might vary
  // In real app, transform result.score into this format
  const chartData = [
    { subject: '정서안정', A: 80, fullMark: 100 },
    { subject: '자율성', A: 65, fullMark: 100 },
    { subject: '공감능력', A: 90, fullMark: 100 },
    { subject: '사회성', A: 70, fullMark: 100 },
    { subject: '회복탄력성', A: 85, fullMark: 100 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-block px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-bold mb-4">
          {result.test.title} 결과
        </span>
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          <span className="text-primary">{result.profile.name}</span>님의 마음 지도
        </h1>
        <p className="text-muted-foreground">
          검사 일시: {new Date(result.conductedAt || Date.now()).toLocaleDateString()}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Chart Card */}
        <div className="bg-white p-6 rounded-3xl border border-border shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          <h3 className="font-heading text-lg font-bold mb-6">종합 분석 그래프</h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <Radar
                  name="내 점수"
                  dataKey="A"
                  stroke="#4B9A8A"
                  fill="#4B9A8A"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-primary/5 p-8 rounded-3xl border border-primary/20">
          <h3 className="font-heading text-xl font-bold mb-4 text-primary">전문가 소견</h3>
          <div className="prose prose-sm prose-slate mb-6">
            <p className="text-foreground/80 leading-relaxed text-lg font-medium">
              "{result.summary}"
            </p>
            <p className="text-muted-foreground mt-4">
              전반적으로 안정적인 정서 상태를 보이고 있습니다. 
              특히 공감 능력이 매우 뛰어나 타인의 감정을 잘 이해하고 배려하는 강점이 있습니다.
              다만 자율성 부분에서는 조금 더 스스로 결정할 수 있는 기회를 주는 것이 좋겠습니다.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-border/50 shadow-sm">
            <h4 className="font-bold text-sm mb-2">💡 맞춤형 솔루션</h4>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>하루 10분 아이의 이야기에 온전히 귀 기울여주세요.</li>
              <li>작은 선택이라도 스스로 결정하게 격려해주세요.</li>
              <li>감정 표현 놀이를 통해 감정 어휘를 늘려주세요.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button className="flex items-center px-6 py-3 bg-secondary text-secondary-foreground rounded-full font-bold hover:bg-secondary/80 transition-colors">
          <Share2 className="w-4 h-4 mr-2" /> 결과 공유하기
        </button>
        <button className="flex items-center px-6 py-3 bg-white border border-border text-foreground rounded-full font-bold hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4 mr-2" /> PDF 저장
        </button>
        <button 
          onClick={() => window.location.href = `/tests/${result.test.id}`}
          className="flex items-center px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> 다시 검사하기
        </button>
      </div>
    </div>
  );
}
