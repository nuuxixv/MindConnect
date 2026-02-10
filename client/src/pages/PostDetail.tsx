import { usePost, useCreateComment } from "@/hooks/use-community";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { useState } from "react";
import { MessageSquare, UserCircle } from "lucide-react";

export default function PostDetail() {
  const [, params] = useRoute("/community/:id");
  const postId = params ? parseInt(params.id) : 0;
  const { data: post, isLoading } = usePost(postId);
  const { mutateAsync: addComment } = useCreateComment();
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");

  if (isLoading) return <div className="p-20 text-center">로딩중...</div>;
  if (!post) return <div className="p-20 text-center">게시글을 찾을 수 없습니다.</div>;

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment({ postId, content: commentText });
    setCommentText("");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl border border-border p-8 mb-8 shadow-sm">
        <div className="mb-6 pb-6 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 bg-secondary rounded-full text-xs font-bold text-secondary-foreground">
              {post.category === 'worry' ? '고민상담' : '자유게시판'}
            </span>
            <span className="text-muted-foreground text-xs">
              {format(new Date(post.createdAt || new Date()), 'yyyy.MM.dd HH:mm')}
            </span>
          </div>
          <h1 className="font-heading text-2xl font-bold mb-2">{post.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCircle className="w-4 h-4" />
            {post.user?.firstName || '익명'}
          </div>
        </div>
        
        <div className="prose prose-slate max-w-none mb-8">
          <p className="whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>

      <div className="bg-secondary/20 rounded-2xl p-6 sm:p-8">
        <h3 className="font-heading text-lg font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          댓글 <span className="text-primary">{post.comments?.length || 0}</span>
        </h3>

        <div className="space-y-6 mb-8">
          {post.comments?.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center">
                  <UserCircle className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-white p-4 rounded-xl border border-border/50 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm">{comment.user?.firstName || '익명'}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(comment.createdAt || new Date()), 'MM.dd HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {user ? (
          <form onSubmit={handleComment} className="flex gap-3">
            <input
              className="flex-1 rounded-xl border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="따뜻한 댓글을 남겨주세요..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all"
            >
              등록
            </button>
          </form>
        ) : (
          <div className="text-center p-4 bg-white rounded-xl border border-border/50 text-sm text-muted-foreground">
            댓글을 작성하려면 <a href="/api/login" className="text-primary font-bold underline">로그인</a>이 필요합니다.
          </div>
        )}
      </div>
    </div>
  );
}
