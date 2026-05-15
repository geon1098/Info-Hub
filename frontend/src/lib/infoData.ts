import { Info } from "@/types";

const cover = (label: string, from: string, to: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='${from}'/>
          <stop offset='100%' stop-color='${to}'/>
        </linearGradient>
      </defs>
      <rect width='1200' height='600' fill='url(#g)'/>
      <text x='50%' y='52%' text-anchor='middle'
        font-family='Segoe UI, Pretendard, sans-serif'
        font-size='64' font-weight='700' fill='rgba(255,255,255,0.95)'>${label}</text>
    </svg>`
  )}`;

const inlineImg = (label: string, from: string, to: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 400'>
      <defs>
        <linearGradient id='g2' x1='0' y1='0' x2='1' y2='0'>
          <stop offset='0%' stop-color='${from}'/>
          <stop offset='100%' stop-color='${to}'/>
        </linearGradient>
      </defs>
      <rect width='800' height='400' fill='url(#g2)'/>
      <text x='50%' y='54%' text-anchor='middle'
        font-family='Segoe UI, Pretendard, sans-serif'
        font-size='36' font-weight='600' fill='rgba(255,255,255,0.95)'>${label}</text>
    </svg>`
  )}`;

const sampleBody = (topic: string, imgLabel: string, from: string, to: string) =>
  `${topic}을(를) 살펴보기 전에, 왜 지금 이 주제가 중요한지 짚고 가야 한다. 단순한 트렌드 키워드가 아니라 실제 프로덕트의 개발 방식과 의사결정에 영향을 주고 있기 때문이다.

핵심은 세 가지다. 첫째, 더 빠른 사용자 경험. 둘째, 더 적은 운영 비용. 셋째, 더 단순한 코드베이스. 이 셋이 동시에 가능해진 배경에는 런타임·툴체인·모델 전반의 변화가 깔려 있다.

![${imgLabel}](${inlineImg(imgLabel, from, to)})

위 그림은 핵심 흐름을 도식화한 것이다. 우리가 지금까지 클라이언트에서 처리하던 많은 일들이 점차 서버/엣지로 옮겨가고 있다. 다만 "전부 서버로 옮기자"는 단순화는 위험하고, 어떤 레이어를 어디에 둘지에 대한 명확한 기준이 필요하다.

실무에서 적용할 때는 다음 순서로 접근하는 것이 안전하다.

1. 가장 자주 바뀌는 화면을 골라 측정한다.
2. 캐시 / 스트리밍 / 부분 렌더링 중 어느 도구가 맞는지 가설을 세운다.
3. 1~2주 단위로 작게 적용하고 지표를 본다.

마지막으로, 새 기술을 도입할 때 가장 큰 비용은 학습이 아니라 **되돌리기 어려운 의사결정**이다. 작은 PR, 짧은 사이클, 측정 가능한 지표 — 이 셋만 지켜도 큰 사고는 막을 수 있다.`;

export const MOCK_INFOS: Info[] = [
  {
    id: 1,
    title: "2026 프론트엔드 트렌드 한눈에 보기",
    imageUrl: cover("Frontend 2026", "#2563eb", "#7c3aed"),
    tags: ["트렌드", "React", "Next.js"],
    category: "TREND",
    summary: "RSC, Edge 런타임, AI IDE 등 올해의 핵심 변화 정리.",
    author: "트렌드러버",
    authorId: 2,
    createdAt: "2026-05-01T10:00:00",
    updatedAt: "2026-05-01T10:00:00",
    body: sampleBody("프론트엔드 트렌드", "RSC vs Edge", "#2563eb", "#7c3aed"),
  },
  {
    id: 2,
    title: "Spring Boot 3.5 + JWT 인증 구조 설계",
    imageUrl: cover("Spring · JWT", "#0ea5e9", "#1d4ed8"),
    tags: ["개발", "Spring", "Auth"],
    category: "DEV",
    summary: "Refresh Token Rotation까지 포함한 인증 흐름.",
    author: "백엔드초보",
    authorId: 3,
    createdAt: "2026-05-03T14:30:00",
    updatedAt: "2026-05-04T09:00:00",
    body: sampleBody("JWT 인증 구조", "Auth Flow", "#0ea5e9", "#1d4ed8"),
  },
  {
    id: 3,
    title: "Claude Opus 4.7 코딩 에이전트 후기",
    imageUrl: cover("Claude Opus 4.7", "#f59e0b", "#ef4444"),
    tags: ["AI", "Claude", "에이전트"],
    category: "AI",
    summary: "컨텍스트 관리·스킬 시스템 사용기.",
    author: "AI탐험가",
    authorId: 4,
    createdAt: "2026-05-05T18:20:00",
    updatedAt: "2026-05-05T18:20:00",
    body: sampleBody("코딩 에이전트 사용기", "Agent Loop", "#f59e0b", "#ef4444"),
  },
  {
    id: 4,
    title: "JPA N+1 문제, 실전 해결 가이드",
    imageUrl: cover("JPA · N+1", "#10b981", "#0ea5e9"),
    tags: ["개발", "JPA", "성능"],
    category: "DEV",
    author: "백엔드초보",
    authorId: 3,
    createdAt: "2026-05-07T20:00:00",
    updatedAt: "2026-05-07T20:00:00",
    body: sampleBody("N+1 해결 전략", "Fetch Strategy", "#10b981", "#0ea5e9"),
  },
  {
    id: 5,
    title: "React Server Components 핵심 정리",
    imageUrl: cover("RSC", "#6366f1", "#06b6d4"),
    tags: ["트렌드", "React", "RSC"],
    category: "TREND",
    author: "트렌드러버",
    authorId: 2,
    createdAt: "2026-04-22T09:00:00",
    updatedAt: "2026-04-22T09:00:00",
    body: sampleBody("RSC 동작 원리", "Server vs Client", "#6366f1", "#06b6d4"),
  },
  {
    id: 6,
    title: "Edge 런타임에서의 캐싱 전략",
    imageUrl: cover("Edge Caching", "#8b5cf6", "#ec4899"),
    tags: ["트렌드", "Edge", "캐시"],
    category: "TREND",
    author: "트렌드러버",
    authorId: 2,
    createdAt: "2026-04-25T13:00:00",
    updatedAt: "2026-04-25T13:00:00",
    body: sampleBody("엣지 캐싱", "Edge Layers", "#8b5cf6", "#ec4899"),
  },
  {
    id: 7,
    title: "TypeScript 5.x 신규 기능 모음",
    imageUrl: cover("TypeScript 5.x", "#1d4ed8", "#22d3ee"),
    tags: ["개발", "TypeScript"],
    category: "DEV",
    author: "타입덕후",
    authorId: 5,
    createdAt: "2026-04-30T11:00:00",
    updatedAt: "2026-04-30T11:00:00",
    body: sampleBody("TypeScript 신기능", "Type System", "#1d4ed8", "#22d3ee"),
  },
  {
    id: 8,
    title: "Tailwind CSS로 디자인 시스템 만들기",
    imageUrl: cover("Tailwind DS", "#0ea5e9", "#10b981"),
    tags: ["개발", "CSS", "디자인"],
    category: "DEV",
    author: "디자이너개발자",
    authorId: 6,
    createdAt: "2026-05-02T15:00:00",
    updatedAt: "2026-05-02T15:00:00",
    body: sampleBody("디자인 시스템 구축", "Tokens · Components", "#0ea5e9", "#10b981"),
  },
  {
    id: 9,
    title: "LLM 프롬프트 캐싱 베스트 프랙티스",
    imageUrl: cover("Prompt Cache", "#f97316", "#dc2626"),
    tags: ["AI", "프롬프트", "성능"],
    category: "AI",
    author: "AI탐험가",
    authorId: 4,
    createdAt: "2026-05-08T10:00:00",
    updatedAt: "2026-05-08T10:00:00",
    body: sampleBody("프롬프트 캐싱", "Cache Hit Rate", "#f97316", "#dc2626"),
  },
  {
    id: 10,
    title: "Agent SDK로 나만의 코딩 에이전트 만들기",
    imageUrl: cover("Agent SDK", "#a855f7", "#6366f1"),
    tags: ["AI", "SDK", "에이전트"],
    category: "AI",
    author: "AI탐험가",
    authorId: 4,
    createdAt: "2026-05-09T16:00:00",
    updatedAt: "2026-05-09T16:00:00",
    body: sampleBody("Agent SDK 활용", "Loop Architecture", "#a855f7", "#6366f1"),
  },
  {
    id: 11,
    title: "Vector DB 비교: pgvector vs Qdrant",
    imageUrl: cover("Vector DB", "#14b8a6", "#3b82f6"),
    tags: ["AI", "DB", "검색"],
    category: "AI",
    author: "AI탐험가",
    authorId: 4,
    createdAt: "2026-05-10T19:00:00",
    updatedAt: "2026-05-10T19:00:00",
    body: sampleBody("벡터 DB 선택", "Index Comparison", "#14b8a6", "#3b82f6"),
  },
  {
    id: 12,
    title: "코드 리뷰 문화, 어떻게 만들 것인가",
    imageUrl: cover("Code Review", "#64748b", "#0f172a"),
    tags: ["자유", "협업", "문화"],
    category: "FREE",
    author: "데모유저",
    authorId: 1,
    createdAt: "2026-05-11T08:00:00",
    updatedAt: "2026-05-11T08:00:00",
    body: sampleBody("코드 리뷰 문화", "Review Flow", "#64748b", "#0f172a"),
  },
  {
    id: 13,
    title: "주니어 개발자의 1년 회고",
    imageUrl: cover("Retrospective", "#f43f5e", "#a855f7"),
    tags: ["자유", "회고", "커리어"],
    category: "FREE",
    author: "주니어로그",
    authorId: 7,
    createdAt: "2026-05-12T09:00:00",
    updatedAt: "2026-05-12T09:00:00",
    body: sampleBody("1년 차 회고", "Timeline", "#f43f5e", "#a855f7"),
  },
  {
    id: 14,
    title: "Docker로 로컬 개발 환경 통일하기",
    imageUrl: cover("Docker Dev", "#0284c7", "#2563eb"),
    tags: ["개발", "Docker", "DevOps"],
    category: "DEV",
    author: "데보옵스",
    authorId: 8,
    createdAt: "2026-05-04T14:00:00",
    updatedAt: "2026-05-04T14:00:00",
    body: sampleBody("로컬 환경 표준화", "Docker Compose", "#0284c7", "#2563eb"),
  },
  {
    id: 15,
    title: "GitHub Actions로 CI/CD 자동화",
    imageUrl: cover("GitHub Actions", "#111827", "#2563eb"),
    tags: ["개발", "CI/CD", "DevOps"],
    category: "DEV",
    author: "데보옵스",
    authorId: 8,
    createdAt: "2026-05-06T11:30:00",
    updatedAt: "2026-05-06T11:30:00",
    body: sampleBody("CI/CD 파이프라인", "Workflow Steps", "#111827", "#2563eb"),
  },
  {
    id: 16,
    title: "2026 개발자 컨퍼런스 일정 모아보기",
    imageUrl: cover("Conferences", "#9333ea", "#ec4899"),
    tags: ["트렌드", "컨퍼런스"],
    category: "TREND",
    author: "트렌드러버",
    authorId: 2,
    createdAt: "2026-05-13T07:00:00",
    updatedAt: "2026-05-13T07:00:00",
    body: sampleBody("올해의 컨퍼런스", "Calendar", "#9333ea", "#ec4899"),
  },
];

export const findInfo = (id: number | string): Info | undefined =>
  MOCK_INFOS.find((i) => String(i.id) === String(id));
