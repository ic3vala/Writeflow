import { create } from "zustand";
import { PostsApi } from "../lib/PostsApi";
import {
  PostResponse,
  PostListResponse,
  ButtonClickResponse,
  PostCreateRequest,
} from "../lib/types";

interface PostsStore {
  // API 호출만 담당함 (상태 저장 X)
  loadPosts: (params: {
    emotion?: string;
    page?: number;
    size?: number;
  }) => Promise<PostListResponse>;

  getPost: (id: number) => Promise<PostResponse>;

  createPost: (req: PostCreateRequest) => Promise<PostResponse>;

  deletePost: (id: number) => Promise<void>;

  reportPost: (postId: number) => Promise<void>;


  clickButton: (
    postId: number,
    buttonType: string
  ) => Promise<ButtonClickResponse>;
}

export const usePostsStore = create<PostsStore>(() => ({
  loadPosts: async ({ emotion, page, size }) =>
    await PostsApi.getPosts({ emotion, page, size }),

  getPost: async (id) => await PostsApi.getPost(id),

  createPost: async (req) => {
      console.log('🔄 게시글 생성 요청:', req);
      try {
        const response = await PostsApi.createPost(req);
        console.log('✅ 게시글 생성 성공:', response);
        return response;
      } catch (error) {
        console.error('❌ 게시글 생성 실패:', error);
        throw error;
      }
    },

  deletePost: async (id) => await PostsApi.deletePost(id),

  reportPost: async (postId) => await PostsApi.reportPost(postId),


  clickButton: async (postId, buttonType) =>
    await PostsApi.clickButton(postId, buttonType),
}));
