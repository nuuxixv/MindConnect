import { Test } from "@shared/schema";
import { Clock, HelpCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface TestCardProps {
  test: Test;
}

export function TestCard({ test }: TestCardProps) {
  return (
    <div className="flex flex-col h-full bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1 transition-all duration-300">
      <div className="relative h-48 overflow-hidden bg-secondary">
        {test.coverImage ? (
          <img 
            src={test.coverImage} 
            alt={test.title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary/30">
            <span className="font-heading text-4xl">INPSYT</span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 text-xs font-bold bg-white/90 backdrop-blur-sm text-primary rounded-full shadow-sm uppercase tracking-wide">
            {test.category === 'parenting' ? '양육 태도' : test.category === 'child_development' ? '발달 검사' : '심리 검사'}
          </span>
        </div>
      </div>
      
      <div className="flex-1 p-6 flex flex-col">
        <h3 className="font-heading text-xl font-bold mb-2 text-foreground line-clamp-1">{test.title}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">{test.description}</p>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {test.estimatedTime}분
            </div>
            <div className="flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              {test.questionCount}문항
            </div>
          </div>
          
          <Link href={`/tests/${test.id}`} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
