import { Link } from "wouter";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in slide-in-from-left duration-700">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                전문가가 만들어본 심리검사 플랫폼
              </div>

              <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground leading-tight tracking-tight">
                가족의 마음을 잇는 <br />
                <span className="text-primary">따뜻한 연결고리</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                나와 아이, 그리고 우리 가족의 마음을 들여다보세요.
                <br />
                전문적인 심리검사와 따뜻한 커뮤니티가 함께합니다.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/api/login"
                  className="inline-flex justify-center items-center px-8 py-4 text-base font-bold rounded-full text-white bg-primary shadow-lg hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200"
                >
                  지금 시작하기
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
                <Link
                  href="/tests"
                  className="inline-flex justify-center items-center px-8 py-4 text-base font-bold rounded-full text-foreground bg-white border border-border shadow-sm hover:bg-secondary/50 transition-all duration-200"
                >
                  검사 둘러보기
                </Link>
              </div>
            </div>

            <div className="relative animate-in slide-in-from-right duration-1000 delay-200 hidden lg:block">
              {/* Abstract decorative shapes */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />

              {/* Unsplash Image with description comment */}
              {/* Mother and child hugging warm lighting */}
              <img
                src="https://pixabay.com/get/g2551db9b88dc76ff0801d21d9b303d9bee9a102dc22861311464daea34c8808fc21f0a84cd643e46102dd7a48e47af2e0eb7529ac8e410cec7885fa823f1d507_1280.jpg"
                alt="Mother and child"
                className="relative rounded-[2rem] shadow-2xl border-4 border-white object-cover w-full h-[600px] z-10"
              />

              {/* Floating Badge */}
              <div className="absolute bottom-12 -left-8 bg-white p-4 rounded-2xl shadow-xl border border-border/50 z-20 animate-float">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">
                      검사 완료
                    </p>
                    <p className="font-bold text-foreground">12,450명 참여</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-3xl font-bold mb-4">
              왜 마음이음인가요?
            </h2>
            <p className="text-muted-foreground">
              검증된 심리검사 도구와 전문가의 분석을 통해
              <br />
              가족 모두가 행복해지는 길을 안내해 드립니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "전문적인 심리검사",
                desc: "임상 심리 전문가들이 개발하고 검증한 신뢰도 높은 검사 도구를 제공합니다.",
                icon: "📊",
              },
              {
                title: "맞춤형 결과 분석",
                desc: "단순한 점수가 아닌, 구체적인 양육 가이드와 솔루션을 함께 제공합니다.",
                icon: "💡",
              },
              {
                title: "따뜻한 커뮤니티",
                desc: "비슷한 고민을 가진 엄마들과 소통하며 서로 위로와 지혜를 나눕니다.",
                icon: "🤝",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-8 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-heading text-xl font-bold mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
