import { usePosts, useCreatePost } from "@/hooks/use-community";
import { Link } from "wouter";
import { MessageSquarePlus, MessageSquare } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export default function CommunityList() {
  const { data: posts, isLoading } = usePosts();
  const { mutateAsync: createPost, isPending } = useCreatePost();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", category: "free" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await createPost({ ...formData, userId: user.id });
    setIsDialogOpen(false);
    setFormData({ title: "", content: "", category: "free" });
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'worry': return '고민상담';
      case 'info': return '육아정보';
      default: return '자유수다';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'worry': return 'bg-accent/10 text-accent';
      case 'info': return 'bg-blue-100 text-blue-700';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2">마음톡 커뮤니티</h1>
          <p className="text-muted-foreground">함께 나누면 위로가 되고 힘이 됩니다.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center px-5 py-2.5 bg-primary text-white rounded-full font-bold shadow-md hover:bg-primary/90 transition-all">
              <MessageSquarePlus className="w-5 h-5 mr-2" />
              글쓰기
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 글 작성하기</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">카테고리</label>
                <select 
                  className="w-full rounded-md border border-input p-2 bg-background"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="free">자유수다</option>
                  <option value="worry">고민상담</option>
                  <option value="info">육아정보</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">제목</label>
                <input 
                  required
                  className="w-full rounded-md border border-input p-2 bg-background"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="제목을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">내용</label>
                <textarea 
                  required
                  className="w-full rounded-md border border-input p-2 bg-background h-32 resize-none"
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  placeholder="따뜻한 이야기를 나눠보세요"
                />
              </div>
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50"
              >
                {isPending ? "작성 중..." : "작성 완료"}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="h-32 bg-secondary/20 rounded-xl animate-pulse" />)
        ) : (
          posts?.map(post => (
            <Link key={post.id} href={`/community/${post.id}`}>
              <div className="block bg-white p-6 rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getCategoryColor(post.category)}`}>
                    {getCategoryLabel(post.category)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {post.createdAt && format(new Date(post.createdAt), 'MM.dd HH:mm')}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold mb-2">{post.title}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{post.content}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                  <span>작성자: {post.user?.firstName || '익명'}</span>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>댓글 달기</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
