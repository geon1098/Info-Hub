import { Comment, Post, User } from "@/types";

export const MOCK_USER: User = {
  id: 1,
  email: "demo@infohub.dev",
  nickname: "데모유저",
  role: "USER",
  createdAt: "2026-01-10T09:00:00",
};

export const MOCK_POSTS: Post[] = [
  {
    id: 1,
    title: "2026년 프론트엔드 트렌드 정리",
    content:
      "올해 주목해야 할 프론트엔드 트렌드는 React Server Components, AI 기반 IDE, Edge 런타임의 보편화입니다.\n특히 Next.js 15 이후의 캐싱 모델 변화가 큰 영향을 주고 있습니다.",
    author: "트렌드러버",
    authorId: 2,
    category: "TREND",
    viewCount: 1284,
    commentCount: 12,
    createdAt: "2026-05-01T10:00:00",
    updatedAt: "2026-05-01T10:00:00",
  },
  {
    id: 2,
    title: "Spring Boot 3.5 + JWT 인증 구조 설계기",
    content:
      "Spring Security 6 기반에서 JWT 필터를 끼워 넣을 때 주의할 점, 그리고 Refresh Token Rotation 구현 경험을 공유합니다.",
    author: "백엔드초보",
    authorId: 3,
    category: "DEV",
    viewCount: 642,
    commentCount: 5,
    createdAt: "2026-05-03T14:30:00",
    updatedAt: "2026-05-04T09:00:00",
  },
  {
    id: 3,
    title: "Claude Opus 4.7 사용 후기",
    content:
      "최근 출시된 Claude Opus 4.7을 코딩 에이전트로 일주일 써본 후기입니다. 컨텍스트 관리와 스킬 시스템이 인상적입니다.",
    author: "AI탐험가",
    authorId: 4,
    category: "AI",
    viewCount: 2103,
    commentCount: 24,
    createdAt: "2026-05-05T18:20:00",
    updatedAt: "2026-05-05T18:20:00",
  },
  {
    id: 4,
    title: "오늘 점심 뭐 드셨나요",
    content: "저는 김치찌개 먹었습니다. 자유게시판 첫 글이네요!",
    author: "데모유저",
    authorId: 1,
    category: "FREE",
    viewCount: 88,
    commentCount: 3,
    createdAt: "2026-05-06T12:10:00",
    updatedAt: "2026-05-06T12:10:00",
  },
  {
    id: 5,
    title: "JPA N+1 문제, 어떻게 풀고 계신가요",
    content:
      "최근 프로젝트에서 N+1 문제로 고생했습니다. fetch join, EntityGraph, batch_size 중 어느 쪽이 가장 무난할까요?",
    author: "백엔드초보",
    authorId: 3,
    category: "DEV",
    viewCount: 412,
    commentCount: 8,
    createdAt: "2026-05-07T20:00:00",
    updatedAt: "2026-05-07T20:00:00",
  },
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    postId: 1,
    author: "데모유저",
    authorId: 1,
    content: "정리 감사합니다. RSC가 정말 대세가 되긴 하나 봐요.",
    createdAt: "2026-05-01T11:30:00",
  },
  {
    id: 2,
    postId: 1,
    author: "AI탐험가",
    authorId: 4,
    content: "Edge 런타임 부분에 동의합니다.",
    createdAt: "2026-05-01T13:00:00",
  },
  {
    id: 3,
    postId: 2,
    author: "데모유저",
    authorId: 1,
    content: "Refresh Token Rotation 구현 부분이 도움 많이 되었어요.",
    createdAt: "2026-05-04T10:00:00",
  },
];
