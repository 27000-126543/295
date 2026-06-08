import { create } from "zustand";
import type { Post, Comment } from "@/types";
import { communityApi } from "@/utils/api";

interface CommunityState {
  posts: Post[];
  total: number;
  currentPost: (Post & { comments: Comment[] }) | null;
  loading: boolean;
  fetchPosts: (params?: { tag?: string; sort?: "hot" | "new"; page?: number }) => Promise<void>;
  fetchPost: (id: number) => Promise<void>;
  publish: (data: { content: string; images: string[]; tags: string[] }) => Promise<void>;
  toggleLike: (postId: number) => Promise<void>;
  addComment: (postId: number, content: string) => Promise<void>;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  posts: [],
  total: 0,
  currentPost: null,
  loading: false,

  fetchPosts: async (params) => {
    set({ loading: true });
    try {
      const res = await communityApi.posts(params);
      set({ posts: res.list || [], total: res.total, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchPost: async (id) => {
    set({ loading: true });
    try {
      const currentPost = await communityApi.post(id);
      set({ currentPost, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  publish: async (data) => {
    set({ loading: true });
    try {
      const post = await communityApi.publish(data);
      set((s) => ({ posts: [post, ...s.posts], loading: false }));
    } catch {
      set({ loading: false });
    }
  },

  toggleLike: async (postId) => {
    try {
      const res = await communityApi.like(postId);
      set((s) => ({
        posts: s.posts.map((p) =>
          p.id === postId ? { ...p, like_count: p.like_count + (res.liked ? 1 : -1), is_liked: res.liked } : p
        ),
        currentPost:
          s.currentPost?.id === postId
            ? { ...s.currentPost, like_count: s.currentPost.like_count + (res.liked ? 1 : -1), is_liked: res.liked }
            : s.currentPost,
      }));
    } catch (_e) {
      void _e;
    }
  },

  addComment: async (postId, content) => {
    try {
      const comment = await communityApi.comment(postId, content);
      const state = get();
      if (state.currentPost && state.currentPost.id === postId) {
        set({
          currentPost: {
            ...state.currentPost,
            comments: [...(state.currentPost.comments || []), comment],
            comment_count: state.currentPost.comment_count + 1,
          },
        });
      }
    } catch (_e) {
      void _e;
    }
  },
}));
