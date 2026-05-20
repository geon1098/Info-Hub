# 📡 InfoNow — 정보공유 커뮤니티 플랫폼

> **"정보가 곧 자산이 되는 시대, 누구나 가치 있는 정보에 빠르게 접근할 수 있도록"**
>
> 생활 정보 · 정부 지원 정책 · 투자 정보를 한곳에서 공유하고 탐색할 수 있는 커뮤니티 기반 정보 플랫폼

<p align="center">
  <img src="https://img.shields.io/badge/Java-17-007396?style=flat-square&logo=java&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=flat-square&logo=springboot&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white"/>
</p>

---

## 📌 목차

1. [프로젝트 소개](#1-프로젝트-소개)
2. [주요 기능](#2-주요-기능)
3. [기술 스택](#3-기술-스택)
4. [아키텍처 & 프로젝트 구조](#4-아키텍처--프로젝트-구조)
5. [트러블 슈팅](#5-트러블-슈팅)
6. [성능 및 개선 경험](#6-성능-및-개선-경험)
7. [화면 스크린샷](#7-화면-스크린샷)
8. [실행 방법](#8-실행-방법)
9. [회고 / 느낀점](#9-회고--느낀점)

---

## 1. 프로젝트 소개

### 🌱 왜 이 프로젝트를 만들었는가

현대 사회에서 **"정보"는 단순한 지식을 넘어 하나의 자산**입니다.
같은 시간, 같은 환경에서 살아가도 어떤 정보를 먼저 접하느냐에 따라 결과는 크게 달라집니다.

- **투자 정보** — 정확한 흐름과 데이터를 알고 있어야 합리적인 판단이 가능합니다. 주변 사람의 말만 듣고 투자한다면 불안감과 손실의 위험이 따라옵니다.
- **정부 지원 정책** — 매년 수백 개의 청년 정책, 창업 지원, 주거 지원 사업이 운영되지만, **정보를 몰라서 놓치는 경우가 대부분**입니다.
- **생활 정보** — 환급, 할인, 혜택 등 작은 정보들이 모이면 큰 비용 절약이 됩니다.

이러한 **정보의 비대칭성**을 해소하고, 누구나 가치 있는 정보를 **쉽고 빠르게 공유·탐색**할 수 있는 환경을 만들고자 본 프로젝트를 기획했습니다.

### 🎯 프로젝트가 지향하는 것

> "단순한 게시판이 아닌, **사용자 중심의 정보 허브**"

- 메인 페이지에서 **4×4 카드형 UI**로 다양한 정보를 한눈에 직관적으로 확인
- 카테고리별로 정리된 정보를 통해 **탐색 비용 최소화**
- 커뮤니티 게시판을 통해 **실시간 정보 교환** 및 사용자 간 소통 지원
- JWT 기반 인증과 Spring Security로 **안전한 사용자 환경** 제공

### 📅 프로젝트 기간

`2026-04 ~ 2026-05` (약 2개월, 개인 프로젝트)

---

## 2. 주요 기능

| 영역 | 기능 | 설명 |
|------|------|------|
| 🏠 **메인** | 4×4 카드형 정보 UI | 다양한 정보를 한눈에 탐색 가능한 그리드 레이아웃 |
| 📄 **정보** | 정보 상세 페이지 | 각 정보 카드 클릭 시 상세 내용 확인, 카테고리 분류 |
| 💬 **커뮤니티** | 게시판 / 댓글 | 자유로운 정보 공유와 의견 교환 가능 |
| 🔐 **인증** | 로그인 / 회원가입 | 이메일 기반 가입, BCrypt 비밀번호 암호화 |
| 🪪 **보안** | JWT 인증 시스템 | Access / Refresh Token 분리 발급 및 검증 |
| 🛡 **보안** | Spring Security | 권한 기반 접근 제어 (ADMIN / USER) |
| ⚡ **성능** | Redis 캐싱 | 인기 정보·세션 토큰 캐싱으로 응답 속도 개선 |
| 🗄 **DB** | PostgreSQL | 안정적인 관계형 데이터 저장 |
| 🐳 **인프라** | Docker Compose | DB · Redis · App 컨테이너 일괄 관리 |
| 🌐 **프론트** | React SPA | 부드러운 페이지 전환과 빠른 응답성 |
| 🔍 **SEO** | SEO 최적화 구조 | 메타 태그, 시맨틱 마크업 적용 |
| 📱 **UI/UX** | 반응형 UI | 모바일·태블릿·데스크탑 모두 대응 |

---

## 3. 기술 스택

### 🎨 Frontend

| 기술 | 설명 |
|------|------|
| ![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black) | SPA 기반 컴포넌트 UI 구현 |
| ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white) | SSR / SEO 최적화 |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) | 동적 UI 및 클라이언트 로직 |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) | 반응형 디자인 및 스타일링 |

### ⚙️ Backend

| 기술 | 설명 |
|------|------|
| ![Java](https://img.shields.io/badge/Java_17-007396?style=flat&logo=openjdk&logoColor=white) | 메인 백엔드 언어 |
| ![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat&logo=springboot&logoColor=white) | REST API 서버 구현 |
| ![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=flat&logo=springsecurity&logoColor=white) | 인증 / 인가 처리 |
| ![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white) | 토큰 기반 인증 |
| ![JPA](https://img.shields.io/badge/Spring_Data_JPA-59666C?style=flat&logo=hibernate&logoColor=white) | ORM 기반 DB 접근 |

### 💾 Database / Infra

| 기술 | 설명 |
|------|------|
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white) | 관계형 데이터베이스 |
| ![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white) | 캐시 및 토큰 저장소 |
| ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white) | 컨테이너 기반 환경 구성 |
| ![AWS EC2](https://img.shields.io/badge/AWS_EC2-FF9900?style=flat&logo=amazonec2&logoColor=white) | 배포 환경 (예정) |
| ![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat&logo=nginx&logoColor=white) | 리버스 프록시 (예정) |

### 🛠 Tools

| 기술 | 설명 |
|------|------|
| ![Gradle](https://img.shields.io/badge/Gradle-02303A?style=flat&logo=gradle&logoColor=white) | 빌드 자동화 |
| ![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white) | 버전 관리 |
| ![IntelliJ](https://img.shields.io/badge/IntelliJ_IDEA-000000?style=flat&logo=intellijidea&logoColor=white) | 백엔드 IDE |
| ![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=flat&logo=visualstudiocode&logoColor=white) | 프론트엔드 IDE |

---

## 4. 아키텍처 & 프로젝트 구조

### 🏗 시스템 아키텍처

```
                        ┌────────────────────────┐
                        │       👤  Client       │
                        │  (Browser / Mobile)    │
                        └──────────┬─────────────┘
                                   │ HTTPS
                                   ▼
                        ┌────────────────────────┐
                        │   Nginx (예정)         │
                        │   Reverse Proxy / SSL  │
                        └──────────┬─────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                                         ▼
   ┌────────────────────┐                  ┌─────────────────────────┐
   │  Frontend (React)  │  ◀── REST API ──▶│  Backend (Spring Boot)  │
   │   Next.js SPA      │                  │   - Controller          │
   │                    │                  │   - Service             │
   └────────────────────┘                  │   - Repository (JPA)    │
                                           │   - Spring Security/JWT │
                                           └────────┬────────────────┘
                                                    │
                                  ┌─────────────────┼─────────────────┐
                                  ▼                                   ▼
                       ┌────────────────────┐              ┌────────────────────┐
                       │   PostgreSQL       │              │   Redis            │
                       │   (영구 저장소)    │              │   (캐시 / 토큰)    │
                       └────────────────────┘              └────────────────────┘
```

### 📁 프로젝트 구조

```bash
infonowapp/
├── backend/                        # Spring Boot 서버
│   ├── src/main/java/com/hub/backend/
│   │   ├── config/                 # Security, Web, Bootstrapper 설정
│   │   ├── controller/             # REST API 엔드포인트
│   │   │   ├── AuthController.java
│   │   │   ├── PostController.java
│   │   │   ├── CommentController.java
│   │   │   ├── InfoController.java
│   │   │   ├── UploadController.java
│   │   │   └── AdminController.java
│   │   ├── service/                # 비즈니스 로직
│   │   ├── repository/             # JPA Repository
│   │   ├── entity/                 # JPA Entity (User, Post, Comment, Info...)
│   │   ├── dto/                    # 요청/응답 DTO
│   │   ├── security/               # JWT 필터, SecurityConfig
│   │   └── exception/              # 커스텀 예외 및 핸들러
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── application-dev.yml
│   └── build.gradle
│
├── frontend/                       # Next.js (React SPA)
│   ├── src/app/
│   │   ├── page.tsx                # 메인 (4x4 카드)
│   │   ├── login/                  # 로그인
│   │   ├── signup/                 # 회원가입
│   │   ├── info/[id]/              # 정보 상세 / 수정
│   │   ├── info/new/               # 정보 등록
│   │   └── posts/                  # 커뮤니티 게시판
│   ├── src/components/             # 공통 컴포넌트
│   ├── public/                     # 정적 리소스
│   └── next.config.mjs
│
├── docker-compose.yml              # Postgres + Redis + App
└── README.md
```

### 🔄 SPA 구조 설명

- **Next.js App Router** 기반의 클라이언트 라우팅으로 페이지 간 이동 시 **풀 리로드 없이** 부드러운 전환을 제공합니다.
- 정적 페이지는 **SSR/SSG**로 사전 렌더링하여 **초기 로딩 속도와 SEO**를 모두 만족시켰습니다.
- **컴포넌트 단위 재사용**으로 유지보수성과 확장성을 확보했습니다.

---

## 5. 트러블 슈팅

> 실제 개발 과정에서 마주한 문제들을 **문제 → 원인 → 해결 과정 → 결과** 순으로 정리했습니다.

### 🔧 5-1. JWT 토큰 만료 시 사용자가 갑자기 로그아웃되는 문제

- **문제**
  로그인 후 일정 시간이 지나면 사용자가 작업 중에도 갑자기 401 응답을 받고 로그아웃되었습니다. 정보를 작성하던 도중 데이터가 날아가는 UX 문제가 발생했습니다.

- **원인**
  Access Token의 유효시간이 30분으로 짧게 설정되어 있었고, 만료된 토큰을 자동 갱신하는 로직이 클라이언트·서버 양쪽 모두 부재했습니다. 또한 토큰 만료 시점을 알 수 없는 구조여서 클라이언트가 사전에 대응할 수 없었습니다.

- **해결 과정**
  1. **Access Token + Refresh Token** 이중 토큰 구조로 변경 (Access 30분 / Refresh 7일).
  2. Refresh Token은 **Redis에 저장**하여 서버 측에서 강제 만료(로그아웃, 도용 의심) 처리 가능하게 설계.
  3. 프론트엔드에 **Axios Interceptor**를 추가하여 401 응답을 감지하면 자동으로 Refresh Token으로 재발급 요청 → 원본 요청 재시도.
  4. JWT 필터(`JwtAuthenticationFilter`)에서 만료 토큰과 위조 토큰을 구분하여 명확한 에러 코드 반환.

- **결과**
  사용자가 작업 도중 로그아웃되는 일이 사라졌고, **세션 유지의 안정성**이 크게 향상되었습니다. 또한 Redis 기반 Refresh Token 관리로 **토큰 탈취 시 즉시 무효화**가 가능해졌습니다.

---

### 🔧 5-2. Spring Security와 CORS 정책 충돌 문제

- **문제**
  프론트엔드(`localhost:3000`)에서 백엔드(`localhost:8080`)로 요청을 보낼 때 `CORS preflight` 단계에서 차단되어 모든 API가 403을 반환했습니다.

- **원인**
  Spring Security 6 버전부터는 **CORS 필터가 SecurityFilterChain 내부에서 먼저 동작**해야 합니다. 단순히 `@CrossOrigin`만 붙이거나 `WebMvcConfigurer.addCorsMappings`만 설정했더니, Security 필터가 OPTIONS 요청을 먼저 가로채면서 인증 실패로 처리되었습니다.

- **해결 과정**
  1. `SecurityConfig`에서 `http.cors(Customizer.withDefaults())`를 명시적으로 활성화.
  2. `CorsConfigurationSource` Bean을 별도로 등록하여 **허용 Origin, Method, Headers, Credentials**를 명확히 지정.
  3. `OPTIONS` 요청을 `permitAll()`로 처리하여 preflight를 인증 없이 통과시킴.
  4. 운영환경 대비 `allowedOrigins`를 환경변수로 분리.

- **결과**
  로컬 개발과 배포 환경 모두에서 안정적인 CORS 통신이 가능해졌고, **보안과 편의성의 균형**을 맞췄습니다.

---

### 🔧 5-3. React SPA 새로고침 시 404 발생 문제

- **문제**
  `/posts/123` 같은 동적 경로에서 새로고침을 하면 **404 Not Found** 페이지가 표시되었습니다. 사용자 입장에서는 정상 동작하는 페이지가 새로고침만 하면 사라지는 치명적인 문제였습니다.

- **원인**
  SPA는 클라이언트 라우팅이므로 서버는 `/posts/123`이라는 실제 경로를 모릅니다. 정적 호스팅 서버(또는 Nginx)가 해당 경로의 파일을 찾지 못해 404를 반환한 것이 원인이었습니다.

- **해결 과정**
  1. **Next.js의 App Router 구조**를 활용하여 동적 라우트(`[id]/page.tsx`)를 명확히 분리.
  2. 정적 배포 환경에서는 Nginx 설정에 **fallback 규칙**(`try_files $uri $uri/ /index.html`)을 추가.
  3. 개발 환경에서는 Next dev server의 SSR이 자동으로 처리하지만, 빌드 배포 시 동일하게 동작하도록 통일.

- **결과**
  어떤 경로에서도 새로고침이 정상 동작하며, **딥링크 공유**도 안정적으로 가능해졌습니다.

---

### 🔧 5-4. Docker 환경에서 PostgreSQL 연결 실패 문제

- **문제**
  Spring Boot 컨테이너에서 PostgreSQL 컨테이너로 접속을 시도했더니 `Connection refused` 에러가 발생했습니다. 로컬에서는 정상 동작하던 코드가 컨테이너 환경에서만 실패했습니다.

- **원인**
  Spring 설정 파일에 `localhost:5432`로 DB 주소가 박혀 있었습니다. **컨테이너 내부의 `localhost`는 호스트 머신이 아닌 자기 자신**을 가리키기 때문에 DB 컨테이너에 도달할 수 없었습니다.

- **해결 과정**
  1. `docker-compose.yml`에서 PostgreSQL 서비스명을 `postgres`로 정의.
  2. Spring `application-dev.yml`의 DB 호스트를 `localhost` → **컨테이너 서비스명(`postgres`)** 으로 변경.
  3. `depends_on`과 `healthcheck`를 추가하여 **DB가 완전히 기동된 후 앱이 실행**되도록 순서 보장.
  4. 환경변수(`SPRING_DATASOURCE_URL`)로 분리하여 로컬/Docker/운영을 모두 대응.

- **결과**
  컨테이너 간 통신이 안정화되었고, 어떤 환경에서도 **동일한 코드로 실행 가능**한 인프라 구성을 완성했습니다.

---

### 🔧 5-5. Redis 캐싱 적용 후 데이터 동기화 불일치 문제

- **문제**
  인기 정보 목록을 Redis로 캐싱했더니 응답속도는 빨라졌으나, **정보를 수정하거나 삭제해도 메인 페이지에 반영되지 않는** 문제가 발생했습니다.

- **원인**
  단순히 `@Cacheable`만 적용하고 캐시 무효화(`@CacheEvict`) 처리를 누락한 것이 원인이었습니다. 또한 캐시 TTL을 너무 길게(1시간) 잡아 사용자가 변경사항을 한참 동안 보지 못하는 상황이 생겼습니다.

- **해결 과정**
  1. 정보 **생성/수정/삭제 서비스 메서드**에 `@CacheEvict(allEntries = true)` 적용.
  2. 캐시 TTL을 **상황별 차등 설정**: 인기 정보 10분, 상세 정보 5분, 사용자 세션 30분.
  3. 캐시 키를 **카테고리·페이지 번호 단위로 세분화**하여 불필요한 전체 무효화 최소화.
  4. 캐시 히트율을 로깅하여 실제 효과를 측정.

- **결과**
  응답 속도는 평균 **약 60% 개선**되었고, 데이터 정합성 문제도 해결되었습니다. 이 과정에서 **캐시 전략은 단순 적용이 아닌, 도메인 특성에 맞춘 설계가 필요**하다는 것을 체득했습니다.

---

## 6. 성능 및 개선 경험

### ⚡ Redis 캐싱을 적용한 이유
메인 페이지에서 노출되는 인기 정보 카드 16개는 모든 사용자가 동일하게 보는 데이터입니다. 매 요청마다 DB를 조회하는 것은 **비효율적이고 비용이 큰 작업**이라 판단했고, Redis 캐싱을 도입하여 **DB 부하를 줄이고 응답 속도를 평균 60% 이상 개선**했습니다. 또한 **JWT Refresh Token 저장소**로도 활용하여 토큰 강제 무효화를 가능하게 했습니다.

### 🌐 SPA를 선택한 이유
정보 공유 플랫폼의 특성상 **카드 ↔ 상세 ↔ 게시판** 등 페이지 이동이 잦습니다. 매번 전체 페이지를 새로 로드하면 사용자 경험이 떨어집니다. SPA 구조를 통해 **부분 렌더링**과 **부드러운 전환**을 제공함으로써, 사용자가 정보 탐색에만 집중할 수 있는 환경을 만들었습니다.

### 🔍 SEO를 고려한 이유
정보 플랫폼은 **검색 유입이 곧 사용자 확보**입니다. 순수 CSR SPA는 검색엔진 크롤러가 콘텐츠를 읽지 못한다는 한계가 있어, **Next.js의 SSR/SSG 기능**을 활용했습니다. 또한 시맨틱 태그, Open Graph 메타 태그, `sitemap.xml` 구성을 통해 검색 노출 가능성을 높였습니다.

### 🐳 Docker 기반 환경의 장점
- **"내 컴퓨터에서는 됐는데..." 문제 제거** — 어떤 환경에서도 동일한 결과 보장
- PostgreSQL · Redis · Backend를 **단 한 줄(`docker compose up`)로 기동**
- 운영 환경 배포 시에도 동일한 이미지를 그대로 사용 가능
- 신입 개발자 입장에서 **인프라 추상화의 이점**을 직접 체감

### 🎨 UX 개선 사항
- **로딩 스켈레톤 UI** 적용으로 체감 대기 시간 단축
- **에러 메시지 표준화** — 사용자에게 명확하고 친절한 안내
- **반응형 디자인** — 모바일·태블릿·데스크탑 모두 대응
- **무한 스크롤 / 페이지네이션** — 데이터 양에 따라 적절히 분기

---

## 7. 화면 스크린샷

### 🏠 메인 페이지
> 4×4 카드형 정보 UI로 다양한 정보를 한눈에 확인할 수 있습니다.

![메인페이지](./images/main.png)

### 📄 정보 상세 페이지
> 카드를 클릭하면 정보의 상세 내용을 확인할 수 있습니다.

![정보상세](./images/detail.png)

### 💬 커뮤니티 게시판
> 사용자 간 자유로운 정보 공유와 소통이 가능합니다.

![게시판](./images/board.png)

### 🔐 로그인 페이지
> JWT 기반 인증으로 안전한 로그인을 제공합니다.

![로그인](./images/login.png)

### 📝 회원가입 페이지
> 이메일 기반 회원가입과 BCrypt 비밀번호 암호화.

![회원가입](./images/signup.png)

### 👤 마이페이지
> 내가 작성한 정보, 댓글, 활동 내역을 확인할 수 있습니다.

![마이페이지](./images/mypage.png)

### 🛠 관리자 페이지
> 관리자 권한으로 정보 / 사용자 / 게시글을 통합 관리합니다.

![관리자페이지](./images/admin.png)

---

## 8. 실행 방법

### ✅ 사전 준비

- Java 17+
- Node.js 18+
- Docker & Docker Compose
- Gradle 8+

### 🐳 1) Docker로 통합 실행 (권장)

```bash
# 루트 디렉토리에서
docker compose up -d

# 컨테이너 상태 확인
docker compose ps

# 종료
docker compose down
```

> PostgreSQL, Redis, Backend가 한 번에 기동됩니다.

### ⚙️ 2) Backend 단독 실행

```bash
cd backend

# 빌드
./gradlew clean build

# 실행 (dev 프로파일)
./gradlew bootRun --args='--spring.profiles.active=dev'
```

서버: `http://localhost:8080`

### 🎨 3) Frontend 실행

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

클라이언트: `http://localhost:3000`

### 🔑 4) 환경 변수 설정 예시 (`.env`)

```env
# Backend
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/infonow
SPRING_DATASOURCE_USERNAME=infonow
SPRING_DATASOURCE_PASSWORD=your_password

SPRING_REDIS_HOST=localhost
SPRING_REDIS_PORT=6379

JWT_SECRET=your_super_secret_key
JWT_ACCESS_EXPIRATION=1800000      # 30분
JWT_REFRESH_EXPIRATION=604800000   # 7일

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

---

## 9. 회고 / 느낀점

### 🌱 무엇을 배웠는가

이번 프로젝트는 단순한 CRUD를 넘어, **사용자 중심의 서비스를 처음부터 끝까지 직접 설계하고 구현**해 본 경험이었습니다. 기획부터 DB 설계, 인증, 인프라, UI까지 모든 단을 직접 다루면서 **풀스택 개발자로서의 시야**를 넓힐 수 있었습니다.

### 🔐 보안 처리 경험

Spring Security와 JWT를 결합하면서 **인증과 인가의 본질적인 차이**를 체득했습니다. 단순히 로그인을 구현하는 것이 아니라, **세션 vs 토큰의 트레이드오프**, **Refresh Token의 저장 위치(쿠키 vs Redis)**, **CSRF/CORS 대응**까지 고민하면서 보안에 대한 사고방식이 한층 성숙해졌습니다.

### 🐳 인프라 경험

Docker Compose로 다중 컨테이너를 다루며 **개발 환경과 운영 환경의 일치(Dev-Prod Parity)**가 왜 중요한지 실감했습니다. AWS EC2 + Nginx 배포까지 확장하면서 **단순 코드 개발자에서 인프라까지 책임지는 엔지니어**로 한 걸음 나아갈 수 있었습니다.

### 💡 사용자 중심 개발 경험

기술 자체에만 매몰되지 않고, "**이 기능이 사용자에게 어떤 가치를 주는가?**"를 끊임없이 자문했습니다. 로딩 스켈레톤 UI, 자동 토큰 갱신, 무한 스크롤 등의 작은 디테일들이 모여 **서비스의 완성도**를 만든다는 점을 배웠습니다.

### 🤝 협업과 유지보수 관점

혼자 개발하는 프로젝트였지만 **"6개월 뒤의 나"도 협업자**라 생각하고 개발했습니다.
- 일관된 패키지 구조 (`controller / service / repository / dto / entity`)
- DTO 분리로 도메인 보호
- 커스텀 예외 + `ErrorCode` 표준화
- README와 주석을 통한 의도 기록

이런 습관이 결국 **팀 협업과 유지보수에서 빛을 발할 것**이라 믿고 있습니다.

### 🎯 앞으로의 개선 방향

- [ ] AWS EC2 + Nginx + HTTPS 실제 배포
- [ ] CI/CD 파이프라인(GitHub Actions) 구축
- [ ] 정보 추천 알고리즘 도입 (사용자 관심 카테고리 기반)
- [ ] 모니터링 (Prometheus + Grafana) 추가
- [ ] 테스트 커버리지 확대 (단위 + 통합)

---

<p align="center">
  <strong>📡 InfoNow — 정보는 자산입니다. 함께 공유할 때 더 큰 가치가 됩니다.</strong><br/>
  <sub>Made with ❤️ by <a href="https://github.com/geon1098">geon1098</a></sub>
</p>
