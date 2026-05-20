# 트러블슈팅 기록

InfoHub 프로젝트 개발 과정에서 마주친 문제들과 해결 과정을 정리한다. 동일한 함정을 반복하지 않기 위한 기록.

---

## 1. 프론트 화면 로딩이 비정상적으로 느림

### 증상
백엔드는 `localhost:8093`, 프론트는 `localhost:3000`에서 띄웠는데 모든 API 호출이 수 초씩 지연되다 실패.

### 원인
프론트의 `next.config.mjs`가 백엔드 포트를 `8080`으로 가리키고 있었음. axios가 `/api/*` 로 보낸 요청이 8080에서 connection refused 될 때까지 대기.

### 해결
```js
// frontend/next.config.mjs
async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: "http://localhost:8093/api/:path*", // 8080 → 8093
    },
  ];
}
```

---

## 2. 커뮤니티 상세 페이지의 `use(params)` 에러

### 증상
```
Error: An unsupported type was passed to use(): [object Object]
at PostDetailPage (./src/app/posts/[id]/page.tsx:24:62)
```

### 원인
Next.js **14.2.18**을 쓰면서 코드는 Next 15 스타일로 `params: Promise<{id: string}>`를 받아 `use(params)`로 풀고 있었음. Next 14에선 `params`가 일반 객체이므로 `use()`에 넣으면 unsupported type.

### 해결
```ts
// Before (Next 15 스타일)
export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  ...
}

// After (Next 14 스타일)
export default function PostDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  ...
}
```

동일 패턴의 `info/[id]`, `info/[id]/edit`, `posts/[id]/edit` 4개 파일을 모두 수정.

---

## 3. Step 9 — `CategoryKey` 클래스 누락으로 부트 실패

### 증상
백엔드 부팅 시 `Unable to load class [com.hub.backend.entity.Info]` → `NoClassDefFoundError: CategoryKey`.

### 원인
`Info`, `InfoSummaryResponse`, `InfoDetailResponse`, `InfoCreateRequest`가 모두 `CategoryKey`를 참조하지만 enum 정의 파일이 없었고, dto 패키지의 파일들엔 import도 없어서 빌드 산출물이 default package `CategoryKey`를 찾으려고 함.

### 해결
1. enum 신규 생성
   ```java
   // entity/CategoryKey.java
   package com.hub.backend.entity;
   public enum CategoryKey { TREND, DEV, AI, FREE }
   ```
2. dto 파일들에 import 추가
   ```java
   import com.hub.backend.entity.CategoryKey;
   ```
3. `clean build`로 stale class 제거

---

## 4. Step 9 — `InfoService.assertWritable`의 `isAuthor` 메서드 부재

### 증상
```
error: cannot find symbol
  if (!isAdmin && !info.isAuthor(userId)) { ... }
```

### 원인
초기엔 Info 엔티티에 `isAuthor` 헬퍼를 두려 했지만 사용자가 엔티티 코드를 단순화하면서 메서드가 빠졌고, 서비스 코드만 그걸 호출하고 있었음.

### 해결
서비스에서 직접 author id를 비교하도록 변경하여 엔티티 변경에 무관하게 만듦.
```java
// service/InfoService.java
private void assertWritable(Info info, Long userId, String role) {
    boolean isAdmin = Role.ADMIN.name().equals(role);
    boolean isOwner = info.getAuthor().getId().equals(userId);
    if (!isAdmin && !isOwner) {
        throw new CustomException(ErrorCode.INFO_FORBIDDEN);
    }
}
```

---

## 5. 로그인 시 Redis Connection Refused

### 증상
```
RedisConnectionFailureException: Unable to connect to Redis
  Caused by: Connection refused: localhost/127.0.0.1:6379
```
BCrypt 검증과 JWT 발급은 통과했지만 `RefreshTokenService.save`에서 죽음.

### 원인
Redis 컨테이너가 안 떠 있었음.

### 해결
Docker로 Redis 실행:
```bash
docker run -d --name infohub-redis -p 6379:6379 \
  --restart unless-stopped redis:7-alpine
```
확인: `docker exec infohub-redis redis-cli ping` → `PONG`.

---

## 6. `/posts` 빌드 시 prerender 실패

### 증상
```
useSearchParams() should be wrapped in a suspense boundary at page "/posts".
Error occurred prerendering page "/posts".
```

### 원인
client component에서 `useSearchParams()`를 호출하면 Next는 정적 prerender에서 빠져나가야 하는데 Suspense boundary가 없으면 빌드 실패.

### 해결
페이지 default export를 Suspense로 감싸고 본문을 별도 컴포넌트로 분리.
```tsx
export default function PostListPage() {
  return (
    <Suspense fallback={<p>불러오는 중...</p>}>
      <PostListContent />
    </Suspense>
  );
}

function PostListContent() {
  const params = useSearchParams();
  ...
}
```

또한 `.next` 캐시가 stale일 때 `/mypage` 같은 페이지에서 `PageNotFoundError`가 떠 `rm -rf .next` 후 재빌드로 해결.

---

## 7. 모든 list API가 500 — `-parameters` 플래그 누락

### 증상
```
IllegalArgumentException: Name for argument of type [java.lang.String] not specified,
and parameter name information not available via reflection.
Ensure that the compiler uses the '-parameters' flag.
```
`/api/infos`, `/api/posts`, `/api/posts/{id}/comments` 모두 500.

### 원인
컨트롤러에서 `@RequestParam(required = false) String category` 처럼 이름을 생략하면 Spring 6은 reflection으로 파라미터 이름을 얻으려는데, 컴파일 시 `-parameters` 플래그가 없으면 이름이 사라져 즉시 500. IDE(Eclipse/STS)는 기본 `-parameters` 없이 빌드함.

### 해결
1. 모든 `@RequestParam` / `@PathVariable`에 명시적으로 이름 지정
   ```java
   // Before
   public ApiResponse<...> list(
       @RequestParam(required = false) String category,
       @RequestParam(defaultValue = "0") int page
   ) { ... }

   // After
   public ApiResponse<...> list(
       @RequestParam(value = "category", required = false) String category,
       @RequestParam(value = "page", defaultValue = "0") int page
   ) { ... }
   ```
2. 안전망으로 `build.gradle`에 컴파일 옵션 추가 (IDE 빌드 포함)
   ```gradle
   tasks.withType(JavaCompile).configureEach {
       options.compilerArgs.add('-parameters')
   }
   ```

---

## 8. `/api/infos` — PostgreSQL `lower(bytea)` 에러

### 증상
```
ERROR: function lower(bytea) does not exist
Hint: No function matches the given name and argument types.
```
keyword 검색 쿼리가 항상 죽음.

### 원인
JPQL의 동적 조건 `(:keyword is null or lower(i.title) like ...)` 패턴에서 `keyword`가 null일 때 PostgreSQL이 파라미터 타입을 추론하지 못해 `unknown`/`bytea`로 처리. 그 결과 `lower(?)`가 `lower(bytea)`로 해석돼 함수 없음 에러.

또한 동일 쿼리에서 `select distinct ... left join fetch i.author`도 문제였음 — `body` 컬럼이 `@Lob`/TEXT라 PostgreSQL이 DISTINCT를 적용할 동등성 연산자를 못 찾음.

### 해결
동적 쿼리를 4개의 정적 메서드로 분리하여 null 파라미터 자체를 제거.
```java
// repository/InfoRepository.java
public interface InfoRepository extends JpaRepository<Info, Long> {

    @EntityGraph(attributePaths = "author")
    Page<Info> findAllBy(Pageable pageable);

    @EntityGraph(attributePaths = "author")
    Page<Info> findAllByCategory(CategoryKey category, Pageable pageable);

    @EntityGraph(attributePaths = "author")
    @Query("""
        select i from Info i
        where lower(i.title)   like lower(concat('%', :keyword, '%'))
           or lower(i.summary) like lower(concat('%', :keyword, '%'))
           or exists (
               select 1 from Info i2 join i2.tags t
               where i2 = i and lower(t) like lower(concat('%', :keyword, '%'))
           )
    """)
    Page<Info> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    @EntityGraph(attributePaths = "author")
    @Query("""
        select i from Info i
        where i.category = :category
          and ( ... :keyword 조건 ... )
    """)
    Page<Info> searchByCategoryAndKeyword(...);
}
```

서비스에서 4분기로 호출:
```java
if (kw == null && categoryKey == null)      result = infoRepository.findAllBy(pageable);
else if (kw == null)                         result = infoRepository.findAllByCategory(categoryKey, pageable);
else if (categoryKey == null)                result = infoRepository.searchByKeyword(kw, pageable);
else                                         result = infoRepository.searchByCategoryAndKeyword(categoryKey, kw, pageable);
```

`distinct`는 fetch join을 `@EntityGraph`로 옮기면서 함께 제거.

---

## 9. 이미지 업로드 500 — multipart boundary 누락

### 증상
```
POST http://localhost:3000/api/uploads/images 500 (Internal Server Error)
```

### 원인
axios 호출에서 `Content-Type: "multipart/form-data"`를 직접 명시하면 axios가 그 값을 그대로 사용해 boundary가 누락됨. 백엔드 `MultipartResolver`가 본문 시작 boundary를 못 찾아 파싱 실패.

### 해결
axios가 `FormData`를 감지하면 자동으로 `multipart/form-data; boundary=...`를 설정하도록 헤더 명시를 제거.
```ts
// Before
await api.post("/uploads/images", formData, {
  headers: { "Content-Type": "multipart/form-data" }, // boundary 누락
});

// After
await api.post("/uploads/images", formData); // axios가 boundary 포함해 자동 설정
```

---

## 10. 이미지 저장 시 `FILE_STORE_FAILED`

### 증상
이미지 업로드 시 500 + 응답 메시지 "파일 저장에 실패했습니다."

### 원인
`MultipartFile.transferTo(File)` + 상대 경로 조합. `app.upload.dir: ./uploads/images` 같은 상대 경로는 IDE working directory에 따라 다르게 풀려서 IOException 발생.

### 해결
절대 경로로 정규화하고 NIO `Files.copy`를 사용 (작업 디렉토리에 무관).
```java
// service/ImageUploadService.java
Path dir = Paths.get(uploadDir, String.valueOf(today.getYear()), month)
        .toAbsolutePath()
        .normalize();
Path dst = dir.resolve(name);

try {
    Files.createDirectories(dir);
    try (InputStream in = file.getInputStream()) {
        Files.copy(in, dst, StandardCopyOption.REPLACE_EXISTING);
    }
} catch (IOException e) {
    log.error("이미지 저장 실패: dir={}, name={}", dir, name, e); // 원인 추적용
    throw new CustomException(ErrorCode.FILE_STORE_FAILED);
}
```

---

## 11. 정보 등록 시 `created_at NOT NULL` 위반

### 증상
```
ERROR: null value in column "created_at" of relation "info" violates not-null constraint
Detail: Failing row contains (3, 16495, FREE, null, http://localhost:8093/images/..., null, ...).
```

### 원인
Info 엔티티가 Spring Data의 `@CreatedDate`/`@LastModifiedDate`를 쓰는데, 동작에 필요한 `@EntityListeners(AuditingEntityListener.class)`가 엔티티에 빠져 있어 timestamp가 채워지지 않음 → null로 INSERT → NOT NULL 위반.

### 해결
Hibernate 어노테이션으로 교체 (EntityListener 불필요, Hibernate가 INSERT/UPDATE 직전에 직접 값을 채워줌).
```java
// Before
@CreatedDate
@Column(name = "created_at", nullable = false, updatable = false)
private LocalDateTime createdAt;

@LastModifiedDate
@Column(name = "updated_at", nullable = false)
private LocalDateTime updatedAt;

// After
@CreationTimestamp
@Column(name = "created_at", nullable = false, updatable = false)
private LocalDateTime createdAt;

@UpdateTimestamp
@Column(name = "updated_at", nullable = false)
private LocalDateTime updatedAt;
```
Post 엔티티가 이미 `@CreationTimestamp`/`@UpdateTimestamp`를 쓰고 있어서 패턴도 일관되어졌다.

---

## 12. PostResponse 필드 오타 `ciewCount`

### 증상
프론트 PostCard가 `post.viewCount`를 표시하는데 항상 `undefined`.

### 원인
백엔드 DTO 필드명이 `ciewCount`로 오타 → 응답 JSON의 키 이름 불일치 → 프론트에서 undefined.

### 해결
오타 수정 + 댓글 수도 함께 응답하도록 `commentCount` 필드 추가.
```java
// dto/PostResponse.java
private long viewCount;       // ciewCount → viewCount
private long commentCount;    // 신규: CommentRepository.countByPostId 결과

public static PostResponse from(Post post, long commentCount) { ... }
```
PostService에서 `commentRepository.countByPostId(p.getId())`로 채워서 반환.

---

## 13. 회원가입 후 로그인 안 됨

### 증상
신규 이메일로 회원가입 후 로그인 시도하면 "이메일 또는 비밀번호가 올바르지 않습니다".

### 원인
백엔드는 멀쩡한데 **프론트의 `/signup` / `/login` 페이지가 mock 상태**였음.
- `/signup`은 `alert("회원가입 완료")` 후 `/login`으로 push만 함. DB에 사용자 저장 안 됨.
- `/login`은 하드코딩된 `MOCK_USER.email` (`demo@infohub.dev`)와 `admin@infohub.dev`만 통과시키고 나머지는 거부.

### 해결
두 페이지를 실제 axios 호출로 교체.
```tsx
// signup/page.tsx
await api.post("/auth/signup", {
  email: form.email, password: form.password, nickname: form.nickname,
});

// login/page.tsx
const res = await api.post<{ data: LoginResponseData }>("/auth/login", {
  email, password,
});
const { accessToken, user } = res.data.data;
sessionStorage.setItem("accessToken", accessToken);
setAuth(user, accessToken);
```

mock 데이터에서 발생한 또 다른 부작용: 정보/게시글 수정 페이지의 권한 가드 `user.id !== post.authorId`에서 mock 로그인 사용자(id=1)는 mock 글(authorId 2~8)의 작성자가 아니라 무조건 튕겨남. 실제 API로 전환하니 본인 글 수정이 정상 동작.

---

## 핵심 교훈

1. **버전 컨벤션 확인**: Next 14인지 15인지에 따라 `params` 처리가 다르다. 프레임워크 메이저 버전을 항상 의식.
2. **null 동적 쿼리 + PostgreSQL**: `(:param is null or ...)` 패턴은 PG의 타입 추론을 깬다. 분기 메서드가 안전.
3. **Spring 6 + IDE 빌드**: `-parameters` 컴파일 옵션이 없으면 `@RequestParam` 이름 추론이 실패. Gradle에 명시.
4. **MultipartFile.transferTo는 절대 경로로**: 상대 경로 + working directory 의존은 환경마다 달라 깨진다.
5. **axios + FormData**: Content-Type을 직접 설정하지 말 것 — boundary가 누락된다.
6. **JPA Auditing은 EntityListener와 짝**: `@CreatedDate`/`@LastModifiedDate`는 `@EntityListeners(AuditingEntityListener.class)`가 있어야 동작. 단순성이 필요하면 Hibernate `@CreationTimestamp`가 안전.
7. **재시작 확인**: 코드 변경 후 백엔드 인스턴스가 실제로 새 코드로 떠 있는지 확인. PID 시작 시각을 한 번 점검하는 습관.
