import { useTest, useSubmitTest } from "@/hooks/use-tests";
import { useProfiles } from "@/hooks/use-profiles";
import { useRoute, useLocation } from "wouter";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function TestRun() {
  const [, params] = useRoute("/tests/:id/run");
  const [, setLocation] = useLocation();
  const testId = params ? parseInt(params.id) : 0;
  
  const { data: test, isLoading: testLoading } = useTest(testId);
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const submitMutation = useSubmitTest();

  const [currentStep, setCurrentStep] = useState(0); // 0: Profile Select, 1..N: Questions
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  if (testLoading || profilesLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin text-primary">로딩중...</div></div>;
  if (!test) return <div>검사 정보 없음</div>;

  const totalSteps = (test.questions?.length || 0) + 1;
  const progress = (currentStep / totalSteps) * 100;

  const handleProfileSelect = (id: number) => {
    setSelectedProfileId(id);
    setCurrentStep(1);
  };

  const handleAnswer = (questionId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
    
    // Auto advance after short delay
    setTimeout(() => {
      if (currentStep < (test.questions?.length || 0)) {
        setCurrentStep(prev => prev + 1);
      }
    }, 300);
  };

  const handleSubmit = async () => {
    if (!selectedProfileId) return;
    
    try {
      const result = await submitMutation.mutateAsync({
        testId,
        data: {
          profileId: selectedProfileId,
          answers,
          score: { total: Object.values(answers).reduce((a, b) => a + b, 0) }, // Simple sum for now
          summary: "검사가 완료되었습니다. 상세 분석 결과를 확인하세요."
        }
      });
      toast({ title: "검사 완료", description: "결과 페이지로 이동합니다." });
      setLocation(`/results/${result.id}`);
    } catch (error) {
      toast({ title: "오류", description: "제출 중 문제가 발생했습니다.", variant: "destructive" });
    }
  };

  // Step 0: Profile Selection
  if (currentStep === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-heading text-3xl font-bold mb-4">누구를 위한 검사인가요?</h1>
        <p className="text-muted-foreground mb-12">검사 대상을 선택해주세요. 결과 분석의 기준이 됩니다.</p>
        
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {profiles?.map(profile => (
            <button
              key={profile.id}
              onClick={() => handleProfileSelect(profile.id)}
              className="p-6 rounded-2xl bg-white border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
              <span className="block text-sm text-muted-foreground mb-2">
                {profile.relation === 'self' ? '본인' : profile.relation === 'child' ? '자녀' : '배우자'}
              </span>
              <span className="font-heading text-xl font-bold text-foreground group-hover:text-primary">
                {profile.name}
              </span>
            </button>
          ))}
        </div>
        {(!profiles || profiles.length === 0) && (
          <div className="text-center p-8 bg-secondary/30 rounded-xl">
            프로필이 없습니다. 먼저 가족 프로필을 등록해주세요.
            <br/>
            <a href="/profile" className="text-primary font-bold underline mt-2 inline-block">프로필 등록하기</a>
          </div>
        )}
      </div>
    );
  }

  // Question Steps
  const currentQuestionIndex = currentStep - 1;
  const question = test.questions?.[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === (test.questions?.length || 0) - 1;

  return (
    <div className="min-h-screen bg-secondary/10 flex flex-col">
      {/* Progress Bar */}
      <div className="h-2 bg-secondary w-full sticky top-16 z-10">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 flex flex-col justify-center">
        <div className="mb-8 text-sm font-medium text-muted-foreground">
          문항 {currentStep} / {test.questions?.length}
        </div>

        <AnimatePresence mode="wait">
          {question ? (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              <h2 className="font-heading text-2xl md:text-3xl font-bold leading-relaxed text-foreground">
                {question.text}
              </h2>

              <div className="space-y-4">
                {(question.options as any[])?.map((option: any, idx: number) => {
                  const isSelected = answers[question.id] === option.score;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(question.id, option.score)}
                      className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between group ${
                        isSelected 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-border bg-white hover:border-primary/50 hover:bg-white'
                      }`}
                    >
                      <span className={`font-medium ${isSelected ? 'font-bold' : ''}`}>{option.label}</span>
                      {isSelected && <Check className="w-5 h-5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            // Last step or completion
            <div className="text-center">
              <h2 className="font-heading text-3xl font-bold mb-6">모든 문항에 응답하셨습니다.</h2>
              <p className="text-muted-foreground mb-12">제출 버튼을 누르면 결과를 분석합니다.</p>
              <button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white bg-primary rounded-full shadow-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {submitMutation.isPending ? "분석중..." : "결과 확인하기"}
                {!submitMutation.isPending && <ArrowRight className="ml-2 w-5 h-5" />}
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
