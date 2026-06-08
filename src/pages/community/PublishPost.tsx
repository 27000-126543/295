import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImagePlus, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useCommunityStore } from "@/store/communityStore";

const PRESET_TAGS = [
  "育儿心得",
  "辅食食谱",
  "早教分享",
  "疫苗攻略",
  "好物推荐",
  "成长记录",
];

export default function PublishPost() {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { loading, publish } = useCommunityStore();
  const navigate = useNavigate();

  const handleAddImage = () => {
    if (images.length >= 9) return;
    const placeholder = `photo_${Date.now()}.jpg`;
    setImages((prev) => [...prev, placeholder]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePublish = async () => {
    if (!content.trim()) return;
    await publish({ content: content.trim(), images, tags: selectedTags });
    navigate("/community");
  };

  return (
    <div>
      <PageHeader
        title="发布动态"
        right={
          <button
            onClick={handlePublish}
            disabled={loading || !content.trim()}
            className="rounded-xl bg-coral px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40 transition-opacity"
          >
            发布
          </button>
        }
      />

      <div className="px-4 pt-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="分享你的育儿经验..."
          rows={6}
          className="w-full rounded-2xl bg-white p-4 text-sm text-charcoal placeholder:text-charcoal-light/50 card-shadow outline-none resize-none"
        />

        <div className="mt-4 rounded-2xl bg-white p-4 card-shadow">
          <p className="text-sm font-medium text-charcoal mb-3">添加图片</p>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl bg-cream-dark overflow-hidden"
              >
                <div className="h-full w-full flex items-center justify-center text-xs text-charcoal-light">
                  图片{idx + 1}
                </div>
                <button
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/40"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
            {images.length < 9 && (
              <button
                onClick={handleAddImage}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-coral/40 transition-colors"
              >
                <ImagePlus className="h-6 w-6 text-charcoal-light" />
                <span className="text-[10px] text-charcoal-light">{images.length}/9</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 card-shadow">
          <p className="text-sm font-medium text-charcoal mb-3">选择标签</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedTags.includes(tag)
                    ? "bg-coral text-white shadow-coral"
                    : "bg-cream text-charcoal-light"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
