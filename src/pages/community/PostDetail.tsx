import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useCommunityStore } from "@/store/communityStore";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const { currentPost, loading, fetchPost, toggleLike, addComment } = useCommunityStore();
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (id) fetchPost(Number(id));
  }, [id, fetchPost]);

  const handleLike = async () => {
    if (currentPost) await toggleLike(currentPost.id);
  };

  const handleComment = async () => {
    if (!currentPost || !commentText.trim()) return;
    await addComment(currentPost.id, commentText.trim());
    setCommentText("");
  };

  if (loading || !currentPost) {
    return (
      <div>
        <PageHeader title="动态详情" />
        <div className="py-20 text-center text-charcoal-light text-sm">加载中...</div>
      </div>
    );
  }

  const images = currentPost.images ? currentPost.images.split(",") : [];
  const tags = currentPost.tags ? currentPost.tags.split(",") : [];

  return (
    <div>
      <PageHeader title="动态详情" />

      <div className="px-4 pb-24">
        <div className="rounded-2xl bg-white p-4 card-shadow mt-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-coral/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-coral">
                {currentPost.user?.name?.[0] || "用"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal">
                {currentPost.user?.name || "用户"}
              </p>
              <p className="text-xs text-charcoal-light">{currentPost.created_at}</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-charcoal leading-relaxed whitespace-pre-wrap">
            {currentPost.content}
          </p>

          {images.length > 0 && (
            <div className={`mt-3 grid gap-2 ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {images.map((img, idx) => (
                <div key={idx} className="aspect-square overflow-hidden rounded-xl bg-cream-dark">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-mint/10 px-2 py-1 text-xs text-mint-dark"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-6 border-t border-gray-100 pt-4">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 text-sm"
            >
              <Heart
                className={`h-5 w-5 ${
                  currentPost.is_liked ? "fill-coral text-coral" : "text-charcoal-light"
                }`}
              />
              <span className={currentPost.is_liked ? "text-coral" : "text-charcoal-light"}>
                {currentPost.like_count}
              </span>
            </button>
            <span className="flex items-center gap-1.5 text-sm text-charcoal-light">
              <MessageCircle className="h-5 w-5" />
              {currentPost.comment_count}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-charcoal-light">
              <Share2 className="h-5 w-5" />
              分享
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 card-shadow">
          <h3 className="text-sm font-semibold text-charcoal mb-3">
            评论 ({currentPost.comments?.length || 0})
          </h3>
          {currentPost.comments && currentPost.comments.length > 0 ? (
            <div className="space-y-4">
              {currentPost.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="h-8 w-8 shrink-0 rounded-full bg-mint/20 flex items-center justify-center">
                    <span className="text-xs font-semibold text-mint">
                      {comment.user?.name?.[0] || "用"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-charcoal">
                      {comment.user?.name || "用户"}
                    </p>
                    <p className="mt-0.5 text-sm text-charcoal">{comment.content}</p>
                    <p className="mt-1 text-[10px] text-charcoal-light">{comment.created_at}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-charcoal-light py-6">暂无评论</p>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 flex items-center gap-2 border-t border-gray-100 bg-white/90 px-4 py-3 backdrop-blur-md">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="写评论..."
          className="flex-1 rounded-xl bg-cream px-4 py-2 text-sm text-charcoal placeholder:text-charcoal-light/50 outline-none"
          onKeyDown={(e) => e.key === "Enter" && handleComment()}
        />
        <button
          onClick={handleComment}
          disabled={!commentText.trim()}
          className="rounded-xl bg-coral px-4 py-2 text-sm font-medium text-white disabled:opacity-40 transition-opacity"
        >
          发送
        </button>
      </div>
    </div>
  );
}
