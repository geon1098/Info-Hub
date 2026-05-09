# InfoHub Frontend

정보 공유 & 커뮤니티 플랫폼 (Next.js + TypeScript + TailwindCSS).

## 빠른 시작

```bash
mkdir info_app
cd frontend
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

## 페이지

| 경로 | 설명 |
|---|---|
| `/` | 메인 (인기글, 최신글, 카테고리) |
| `/login` | 로그인 |
| `/signup` | 회원가입 |
| `/posts` | 게시글 목록 (카테고리/검색) |
| `/posts/[id]` | 게시글 상세 + 댓글 |
| `/posts/new` | 게시글 작성 |
| `/posts/[id]/edit` | 게시글 수정 |
| `/mypage` | 마이페이지 |
| `/admin` | 관리자 페이지 |



## 데모 계정 (mock)

- `demo@infohub.dev` — 일반 사용자
- `admin@infohub.dev` — 관리자

비밀번호는 아무 값이나 입력해도 동작합니다 (mock 인증).

## 백엔드 연동

`next.config.mjs`의 `rewrites`로 `/api/*`를 `http://localhost:8080/api/*`로 프록시합니다.
실제 연결은 [infohub-backend-tutorial.md](../infohub-backend-tutorial.md)를 따라 백엔드를 구축한 뒤
각 페이지의 `// TODO:` 주석 부분을 `axios` 호출로 교체하세요.
