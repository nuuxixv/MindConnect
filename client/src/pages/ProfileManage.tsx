import { useProfiles, useCreateProfile, useDeleteProfile } from "@/hooks/use-profiles";
import { ProfileCard } from "@/components/ProfileCard";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function ProfileManage() {
  const { data: profiles, isLoading } = useProfiles();
  const { mutateAsync: createProfile } = useCreateProfile();
  const { mutate: deleteProfile } = useDeleteProfile();
  const { user } = useAuth();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    relation: "child", 
    birthDate: "", 
    gender: "M" 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    await createProfile({
      userId: user.id,
      name: formData.name,
      relation: formData.relation,
      birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
      gender: formData.gender,
    });
    
    setIsDialogOpen(false);
    setFormData({ name: "", relation: "child", birthDate: "", gender: "M" });
  };

  if (isLoading) return <div className="p-20 text-center">로딩중...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2">가족 프로필 관리</h1>
          <p className="text-muted-foreground">우리 가족 구성원을 등록하고 관리하세요.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center px-5 py-2.5 bg-primary text-white rounded-full font-bold hover:bg-primary/90 shadow-md transition-all">
              <Plus className="w-5 h-5 mr-1" /> 가족 추가
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 가족 추가하기</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">관계</label>
                <select 
                  className="w-full rounded-md border border-input p-2 bg-background"
                  value={formData.relation}
                  onChange={e => setFormData({...formData, relation: e.target.value})}
                >
                  <option value="child">자녀</option>
                  <option value="spouse">배우자</option>
                  <option value="self">본인</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">이름</label>
                <input 
                  required
                  className="w-full rounded-md border border-input p-2 bg-background"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="이름을 입력하세요"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">생년월일</label>
                  <input 
                    type="date"
                    className="w-full rounded-md border border-input p-2 bg-background"
                    value={formData.birthDate}
                    onChange={e => setFormData({...formData, birthDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">성별</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, gender: 'M'})}
                      className={`flex-1 py-2 rounded-md border text-sm font-medium ${
                        formData.gender === 'M' 
                          ? 'bg-blue-50 border-blue-200 text-blue-600' 
                          : 'bg-background border-input text-muted-foreground'
                      }`}
                    >
                      남성
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, gender: 'F'})}
                      className={`flex-1 py-2 rounded-md border text-sm font-medium ${
                        formData.gender === 'F' 
                          ? 'bg-pink-50 border-pink-200 text-pink-600' 
                          : 'bg-background border-input text-muted-foreground'
                      }`}
                    >
                      여성
                    </button>
                  </div>
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 mt-4"
              >
                추가하기
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {profiles?.map(profile => (
          <ProfileCard 
            key={profile.id} 
            profile={profile} 
            onDelete={deleteProfile}
            isSelf={profile.relation === 'self'} 
          />
        ))}
        {(!profiles || profiles.length === 0) && (
          <div className="col-span-full py-12 text-center bg-secondary/20 rounded-2xl text-muted-foreground">
            등록된 가족이 없습니다. <br/>우측 상단의 버튼을 눌러 가족을 등록해주세요.
          </div>
        )}
      </div>
    </div>
  );
}
