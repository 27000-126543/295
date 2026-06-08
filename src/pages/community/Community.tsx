import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Share2, Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useCommunityStore } from "@/store/communityStore";

const TABS = [
  { key: "hot", label: "推荐" },
  { key: "new", label: "最新" },
  { key: "follow", label: "关注" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Community() {
  const [activeTab, setActiveTab] = useState<TabKey>("hot");
  const { posts, loading, fetchPosts, toggleLike } = useCommunityStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === "follow") return;
    fetchPosts({ sort: activeTab });
  }, [activeTab, fetchPosts]);

  const handleLike = async (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();
    await toggleLike(postId);
  };

  return (
    <div>
      <PageHeader title="育儿社区" showBack={false} />

      <div className="sticky top-12 z-20 bg-cream">
        <div className="flex gap-1 px-4 py-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-coral text-white shadow-coral"
                  : "bg-white text-charcoal-light"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-24">
        {loading && posts.length === 0 ? (
          <div className="py-20 text-center text-charcoal-light text-sm">加载中...</div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center text-charcoal-light text-sm">暂无动态</div>
        ) : (
          <div className="columns-2 gap-3">
            {posts.map((post) => {
              const images = post.images ? post.images.split(",") : [];
              const tags = post.tags ? post.tags.split(",") : [];
              return (
                <div
                  key={post.id}
                  onClick={() => navigate(`/community/post/${post.id}`)}
                  className="mb-3 break-inside-avoid cursor-pointer rounded-2xl bg-white card-shadow-hover overflow-hidden"
                >
                  {images[0] && (
                    <div className="w-full aspect-[3/4] overflow-hidden bg-cream-dark">
                      <img
                        src={images[0]}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm text-charcoal leading-snug">
                      {post.content}
                    </p>
                    {tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-mint/10 px-1.5 py-0.5 text-[10px] text-mint-dark"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-charcoal-light">
                      <button
                        onClick={(e) => handleLike(e, post.id)}
                        className="flex items-center gap-0.5 text-xs"
                      >
                        <Heart
                          className={`h-3.5 w-3.5 ${
                            post.is_liked ? "fill-coral text-coral" : ""
                          }`}
                        />
                        {post.like_count}
                      </button>
                      <span className="flex items-center gap-0.5 text-xs">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {post.comment_count}
                      </span>
                      <span className="flex items-center gap-0.5 text-xs">
                        <Share2 className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate("/community/publish")}
        className="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-coral shadow-coral transition-transform active:scale-90"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>
    </div>
  );
}
