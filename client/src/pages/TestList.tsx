import { useTests } from "@/hooks/use-tests";
import { TestCard } from "@/components/TestCard";
import { Search } from "lucide-react";
import { useState } from "react";

export default function TestList() {
  const { data: tests, isLoading } = useTests();
  const [filter, setFilter] = useState('all');

  const filteredTests = tests?.filter(test => 
    filter === 'all' || test.category === filter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">심리검사 탐색</h1>
        <p className="text-muted-foreground text-lg">
          전문가가 엄선한 신뢰도 높은 검사들을 만나보세요.<br/>
          나와 가족을 더 깊이 이해하는 시간이 될 거예요.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex p-1 bg-secondary rounded-xl">
          {[
            { id: 'all', label: '전체' },
            { id: 'parenting', label: '양육/부모' },
            { id: 'child_development', label: '아동 발달' },
            { id: 'couple', label: '부부 관계' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === tab.id
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96 bg-secondary/20 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTests?.map(test => (
            <TestCard key={test.id} test={test} />
          ))}
          {filteredTests?.length === 0 && (
            <div className="col-span-full text-center py-20 text-muted-foreground">
              해당 카테고리의 검사가 준비중입니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
