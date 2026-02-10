import { Profile } from "@shared/schema";
import { User, Baby, UserPlus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface ProfileCardProps {
  profile: Profile;
  onDelete?: (id: number) => void;
  isSelf?: boolean;
}

export function ProfileCard({ profile, onDelete, isSelf = false }: ProfileCardProps) {
  const getIcon = () => {
    switch (profile.relation) {
      case "child": return <Baby className="w-8 h-8 text-accent" />;
      case "spouse": return <UserPlus className="w-8 h-8 text-primary" />;
      default: return <User className="w-8 h-8 text-primary" />;
    }
  };

  const getRelationLabel = () => {
    switch (profile.relation) {
      case "self": return "나";
      case "child": return "자녀";
      case "spouse": return "배우자";
      default: return "가족";
    }
  };

  return (
    <div className="group relative bg-card rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md hover:border-primary/30 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-secondary rounded-xl group-hover:bg-primary/10 transition-colors">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-lg font-bold text-foreground">{profile.name}</h3>
              <span className="px-2 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
                {getRelationLabel()}
              </span>
            </div>
            {profile.birthDate && (
              <p className="text-sm text-muted-foreground mt-1">
                {format(new Date(profile.birthDate), "yyyy년 M월 d일 생", { locale: ko })}
                {profile.gender && ` · ${profile.gender === 'M' ? '남' : '여'}`}
              </p>
            )}
          </div>
        </div>
        
        {!isSelf && onDelete && (
          <button 
            onClick={() => onDelete(profile.id)}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
            title="프로필 삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
