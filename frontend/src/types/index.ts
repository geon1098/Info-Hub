export type Role = "USER" | "ADMIN";

export interface User {
  id: number;
  email: string;
  nickname: string;
  role: Role;
  createdAt: string;
}

export type CategoryKey = "TREND" | "DEV" | "AI" | "FREE";

export interface Category {
  key: CategoryKey;
  label: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  authorId: number;
  category: CategoryKey;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  postId: number;
  author: string;
  authorId: number;
  content: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
