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

export interface Info {
  id: number;
  title: string;
  imageUrl: string;
  tags: string[];
  category: CategoryKey;
  summary?: string;
  author: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  /**
   * 본문. 문단은 빈 줄로 구분하고, 인라인 이미지는 `![alt](url)` 마크다운 문법을 사용한다.
   */
  body: string;
}

export interface InfoDraft {
  title: string;
  imageUrl: string;
  tags: string[];
  category: CategoryKey;
  body: string;
}
