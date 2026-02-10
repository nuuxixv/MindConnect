import { useAuth } from "@/hooks/use-auth";
import { useProfiles } from "@/hooks/use-profiles";
import { useResults } from "@/hooks/use-results";
import { ProfileCard } from "@/components/ProfileCard";
import { Link } from "wouter";
import { Plus, ChevronRight, Activity, CalendarDays } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const { data: results, isLoading: resultsLoading } = useResults();

  if (profilesLoading || resultsLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-secondary/30"><div className="animate-pulse text-primary font-heading text-xl">마음을 잇는 중...</div></div>;
  }

  // Find self profile (linked to userId)
  const selfProfile = profiles?.find(p => p.userId === user?.id && p.relation === 'self');
  // Other family members
  const familyMembers = profiles?.filter(p => p.relation !== 'self') || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">
          안녕하세요, <span className="text-primary">{user?.firstName || '회원'}</span>님
        </h1>
        <p className="text-muted-foreground">오늘도 가족과 함께 마음 따뜻한 하루 보내세요.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Family Profiles */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold">우리 가족 프로필</h2>
              <Link href="/profile" className="text-sm font-medium text-primary hover:underline flex items-center">
                관리하기 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Self Card */}
              {selfProfile ? (
                <ProfileCard profile={selfProfile} isSelf />
              ) : (
                <Link href="/profile" className="flex flex-col items-center justify-center h-full min-h-[140px] bg-white border-2 border-dashed border-border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer">
                  <div className="p-3 bg-secondary rounded-full mb-3 group-hover:bg-white transition-colors">
                    <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="font-medium text-muted-foreground group-hover:text-primary">내 프로필 만들기</span>
                </Link>
              )}
              
              {/* Family Members */}
              {familyMembers.map(profile => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
              
              {/* Add Button */}
              <Link href="/profile" className="flex flex-col items-center justify-center h-full min-h-[140px] bg-white border-2 border-dashed border-border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer">
                <div className="p-3 bg-secondary rounded-full mb-3 group-hover:bg-white transition-colors">
                  <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                </div>
                <span className="font-medium text-muted-foreground group-hover:text-primary">가족 추가하기</span>
              </Link>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold">최근 검사 결과</h2>
              <Link href="/results" className="text-sm font-medium text-primary hover:underline flex items-center">
                전체보기 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {results && results.length > 0 ? (
              <div className="space-y-4">
                {results.slice(0, 3).map((result) => (
                  <Link key={result.id} href={`/results/${result.id}`}>
                    <div className="block bg-white p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary text-secondary-foreground mb-2">
                            {result.profile.name} ({result.profile.relation === 'child' ? '자녀' : '본인'})
                          </span>
                          <h3 className="font-heading text-lg font-bold">{result.test.title}</h3>
                          <p className="text-muted-foreground text-sm mt-1 line-clamp-1">{result.summary || '결과 요약이 없습니다.'}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground flex items-center justify-end gap-1 mb-2">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {result.conductedAt && format(new Date(result.conductedAt), 'yyyy.MM.dd')}
                          </div>
                          <span className="text-primary text-sm font-bold flex items-center gap-1 justify-end">
                            결과 보기 <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-border/50">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground mb-4">아직 진행한 검사가 없습니다.</p>
                <Link href="/tests" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-bold transition-colors">
                  심리검사 하러가기
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Recommended Tests & Community */}
        <div className="space-y-8">
          <div className="bg-accent/10 rounded-2xl p-6 border border-accent/20">
            <h3 className="font-heading text-lg font-bold text-accent-foreground mb-4">추천 검사</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h4 className="font-bold text-sm mb-1">양육 스트레스 검사 (PSI)</h4>
                <p className="text-xs text-muted-foreground mb-3">육아로 지친 나의 마음 상태를 점검해보세요.</p>
                <Link href="/tests" className="text-xs font-bold text-primary hover:underline">검사하러 가기</Link>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h4 className="font-bold text-sm mb-1">아이 기질 및 성격 검사</h4>
                <p className="text-xs text-muted-foreground mb-3">우리 아이의 타고난 기질을 이해하는 첫걸음.</p>
                <Link href="/tests" className="text-xs font-bold text-primary hover:underline">검사하러 가기</Link>
              </div>
            </div>
          </div>

          <div className="bg-secondary/30 rounded-2xl p-6 border border-border">
            <h3 className="font-heading text-lg font-bold mb-4">마음톡 인기글</h3>
            <ul className="space-y-3">
              <li className="text-sm">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2"></span>
                <Link href="/community" className="hover:text-primary transition-colors">5세 아이 훈육, 저만 힘든가요?</Link>
              </li>
              <li className="text-sm">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                <Link href="/community" className="hover:text-primary transition-colors">워킹맘의 주말 육아 루틴 공유해요</Link>
              </li>
              <li className="text-sm">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-foreground/30 mr-2"></span>
                <Link href="/community" className="hover:text-primary transition-colors">남편과의 육아 분담, 현명하게...</Link>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-border/50 text-center">
              <Link href="/community" className="text-xs font-bold text-muted-foreground hover:text-primary">
                커뮤니티 바로가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
