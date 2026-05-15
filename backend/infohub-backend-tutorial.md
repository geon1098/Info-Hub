# InfoHub — 정보 공유 & 커뮤니티 플랫폼 백엔드 실습서

> "따라 치면 실제 서비스가 완성되는" Spring Boot 3 + JWT + PostgreSQL 백엔드 실습서

본 실습서는 [frontend/](./frontend/)에 미리 구현해 둔 Next.js UI에 연결될 백엔드를 처음부터 끝까지 만든다. 프론트엔드는 화면을 먼저 다 깔아두었으므로, 이 문서는 백엔드 구축에 집중한다.

---

## 목차

1. [Step 1 — 프로젝트 초기 세팅](#step-1--프로젝트-초기-세팅)
2. [Step 2 — 백엔드 기본 구조 (응답 / 예외 / CORS)](#step-2--백엔드-기본-구조)
3. [Step 3 — User 엔티티 & 회원가입](#step-3--user-엔티티--회원가입)
4. [Step 4 — JWT 발급 & 로그인](#step-4--jwt-발급--로그인)
5. [Step 5 — Spring Security + JWT 필터](#step-5--spring-security--jwt-필터)
6. [Step 6 — Refresh Token (DB 기반)](#step-6--refresh-token-db-기반)
7. [Step 7 — Category & Post CRUD](#step-7--category--post-crud)
8. [Step 8 — Comment CRUD](#step-8--comment-crud)
9. [Step 9 — Info(정보) 도메인 CRUD & 이미지 업로드](#step-9--info정보-도메인-crud--이미지-업로드)
10. [Step 10 — 관리자 기능](#step-10--관리자-기능)
11. [Step 11 — Docker / Nginx / EC2 / GitHub Actions 배포](#step-11--배포)

---

## 전체 아키텍처

```
┌──────────────────┐        ┌──────────────────────┐        ┌─────────────┐
│   Next.js App    │  HTTP  │   Spring Boot API    │  JPA   │ PostgreSQL  │
│   (Port 3000)    │◄──────►│   (Port 8080)        │◄──────►│ (Port 5432) │
│                  │        │                      │        └─────────────┘
│  - App Router    │        │  - Spring Security   │
│  - TypeScript    │        │  - JWT Filter        │
│  - Tailwind CSS  │        │  - JPA / Hibernate   │
└──────────────────┘        └──────────────────────┘
        ▲                              ▲
        │                              │
   /api/* 프록시 (next.config.mjs)   Nginx Reverse Proxy (운영)
```

## 기술 스택

| 영역 | 스택 |
|---|---|
| Backend | Java 21, Spring Boot 3.5, Spring Security 6, Spring Data JPA |
| 인증 | JWT (Access + Refresh, DB 저장) |
| DB | PostgreSQL 16 |
| 빌드 | Gradle |
| 배포 | Docker, Nginx, AWS EC2, GitHub Actions |

## 도메인 / 패키지 규칙

이 프로젝트는 사양서 그대로 **얕은 레이어형 패키지** 구조를 사용한다. 도메인별로 폴더를 만들지 않고 역할(controller/service/...)별로 묶는다.

```
com.hub.backend
├── controller     ← 요청/응답
├── service        ← 비즈니스 로직
├── repository     ← DB 접근
├── entity         ← JPA 엔티티
├── dto            ← 요청/응답 DTO
├── config         ← Spring 설정
├── security       ← JWT, 필터, SecurityConfig
└── exception      ← 공통 예외 / 핸들러
```

엔티티 클래스는 단수형(`User`, `Post`, `Comment`, `Category`, `RefreshToken`).

---

# Step 1 — 프로젝트 초기 세팅

## 목표

`backend/` 모듈에 Spring Boot 3.5 + Java 21 환경을 구성하고 PostgreSQL과 연결한다.

## 개념

프론트엔드는 이미 [frontend/](./frontend/)에 구축되어 있다. 백엔드는 같은 레포의 `backend/` 폴더에 존재하며, `next.config.mjs`의 rewrites가 `http://localhost:3000/api/*` 요청을 `http://localhost:8080/api/*`로 프록시한다. 따라서 백엔드는 `8080` 포트에서 `/api` 프리픽스를 가진 REST API를 제공하면 된다.

## 코드

### 1-1. build.gradle

`backend/build.gradle`을 아래 내용으로 교체한다. 처음에는 Java 17로 생성되어 있을 수 있으니 21로 올린다.

```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.5.14'
    id 'io.spring.dependency-management' version '1.1.7'
}

group = 'com.hub'
version = '0.0.1-SNAPSHOT'

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    // Spring Boot Starters
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-validation'

    // JWT
    implementation 'io.jsonwebtoken:jjwt-api:0.12.6'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.6'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.6'

    // DB
    runtimeOnly 'org.postgresql:postgresql'

    // Lombok
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'

    developmentOnly 'org.springframework.boot:spring-boot-devtools'

    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.security:spring-security-test'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
}

tasks.named('test') {
    useJUnitPlatform()
}
```

### 1-2. 패키지 구조 생성

`backend/src/main/java/com/hub/backend/` 아래에 다음 패키지를 모두 만든다.

```
com.hub.backend
├── BackendApplication.java    (자동 생성됨)
├── controller
├── service
├── repository
├── entity
├── dto
├── config
├── security
└── exception
```

### 1-3. application.yml

`backend/src/main/resources/application.yml`:

```yaml
spring:
  profiles:
    active: dev
```

`backend/src/main/resources/application-dev.yml`:

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/infohub_dev
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        default_batch_fetch_size: 100

jwt:
  secret: ZGV2LWluZm9odWItc2VjcmV0LWtleS1tdXN0LWJlLWxvbmctZW5vdWdoLWZvci1obWFjLXNoYTI1Ng==
  access-token-validity: 1800000      # 30분
  refresh-token-validity: 604800000   # 7일

logging:
  level:
    org.hibernate.SQL: debug
    org.hibernate.orm.jdbc.bind: trace
```

`backend/src/main/resources/application-prod.yml`:

```yaml
server:
  port: 8080

spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false

jwt:
  secret: ${JWT_SECRET}
  access-token-validity: 1800000
  refresh-token-validity: 604800000

logging:
  level:
    root: warn
```

### 1-4. PostgreSQL 데이터베이스 준비

```bash
psql -U postgres
CREATE DATABASE infohub_dev;
\q
```

Windows에서 PostgreSQL을 직접 설치하기 부담스럽다면 Docker로 띄운다.

```bash
docker run -d --name infohub-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=infohub_dev \
  -p 5432:5432 \
  postgres:16-alpine

docker run -d --name infohub-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=infohub_dev -p 5434:5432 postgres:16-alpine
```

### 1-5. 빌드 확인

```bash
cd backend
./gradlew build -x test
```

`BUILD SUCCESSFUL`이 나오면 통과.

## 포인트

- **환경 분리**: `dev`/`prod` profile을 분리하면 운영 비밀값(DB 비번, JWT 시크릿)이 코드에 들어가지 않는다. 운영은 EC2 환경변수로만 주입한다.
- **ddl-auto**: 개발은 `update`로 편하게, 운영은 `validate`로 두어 의도치 않은 스키마 변경을 막는다. 운영 스키마는 별도의 마이그레이션 도구(Flyway 등)로 관리하는 것이 정석.
- **Java 버전**: Spring Boot 3.5는 Java 17 이상이 필요하다. 본 프로젝트는 사양서에 맞춰 21을 쓴다. 로컬 JDK도 21로 맞춰두면 toolchain이 자동으로 잡아준다.

## 정상 동작 기준

- `./gradlew build -x test` 성공
- PostgreSQL `infohub_dev` DB 존재
- 브라우저에서 `http://localhost:3000` 접속 시 (이미 구현된) 메인 페이지가 보인다

---

# Step 2 — 백엔드 기본 구조

## 목표

모든 API의 기반이 되는 **공통 응답 DTO**, **전역 예외 처리**, **CORS 설정**, 그리고 임시 SecurityConfig를 구성한다.

## 개념

프론트엔드는 모든 응답을 `{ success, message, data }` 형태로 가정하고 작성되어 있다 ([frontend/src/types/index.ts](./frontend/src/types/index.ts)). 따라서 백엔드는 이 포맷을 강제해야 한다. 또한 예외는 한 곳에서 잡아 동일한 포맷으로 내려준다.

## 코드

### 2-1. 공통 응답 DTO

`backend/src/main/java/com/hub/backend/dto/ApiResponse.java`:

```java
package com.hub.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final String message;
    private final T data;

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "OK", data);
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static ApiResponse<Void> ok() {
        return new ApiResponse<>(true, "OK", null);
    }

    public static ApiResponse<Void> fail(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
```

### 2-2. ErrorCode + CustomException

`backend/src/main/java/com/hub/backend/exception/ErrorCode.java`:

```java
package com.hub.backend.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // 공통
    INVALID_INPUT(400, "입력값이 올바르지 않습니다."),
    INTERNAL_ERROR(500, "서버 내부 오류가 발생했습니다."),

    // 인증
    UNAUTHORIZED(401, "인증이 필요합니다."),
    INVALID_TOKEN(401, "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(401, "만료된 토큰입니다."),
    ACCESS_DENIED(403, "접근 권한이 없습니다."),

    // User
    DUPLICATE_EMAIL(409, "이미 사용 중인 이메일입니다."),
    DUPLICATE_NICKNAME(409, "이미 사용 중인 닉네임입니다."),
    USER_NOT_FOUND(404, "사용자를 찾을 수 없습니다."),
    INVALID_PASSWORD(401, "비밀번호가 일치하지 않습니다."),

    // Post
    POST_NOT_FOUND(404, "게시글을 찾을 수 없습니다."),
    POST_FORBIDDEN(403, "게시글에 대한 권한이 없습니다."),

    // Comment
    COMMENT_NOT_FOUND(404, "댓글을 찾을 수 없습니다."),
    COMMENT_FORBIDDEN(403, "댓글에 대한 권한이 없습니다."),

    // Category
    CATEGORY_NOT_FOUND(404, "카테고리를 찾을 수 없습니다.");

    private final int status;
    private final String message;
}
```

`backend/src/main/java/com/hub/backend/exception/CustomException.java`:

```java
package com.hub.backend.exception;

import lombok.Getter;

@Getter
public class CustomException extends RuntimeException {

    private final ErrorCode errorCode;

    public CustomException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
```

### 2-3. 전역 예외 핸들러

`backend/src/main/java/com/hub/backend/exception/GlobalExceptionHandler.java`:

```java
package com.hub.backend.exception;

import com.hub.backend.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponse<Void>> handleCustom(CustomException e) {
        ErrorCode code = e.getErrorCode();
        log.warn("CustomException: {}", code.getMessage());
        return ResponseEntity.status(code.getStatus())
                .body(ApiResponse.fail(code.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        log.warn("Validation failed: {}", msg);
        return ResponseEntity.badRequest().body(ApiResponse.fail(msg));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException e) {
        log.warn("AccessDenied: {}", e.getMessage());
        return ResponseEntity.status(403).body(ApiResponse.fail("접근 권한이 없습니다."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleAny(Exception e) {
        log.error("Unhandled", e);
        return ResponseEntity.internalServerError()
                .body(ApiResponse.fail("서버 내부 오류가 발생했습니다."));
    }
}
```

### 2-4. CORS 설정

`backend/src/main/java/com/hub/backend/config/CorsConfig.java`:

```java
package com.hub.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
```

### 2-5. 임시 SecurityConfig

Spring Security를 의존성에 넣은 순간부터 모든 요청이 401로 막힌다. Step 5에서 정식 설정으로 교체할 예정이지만, Health Check를 확인하기 위해 임시 설정을 둔다.

`backend/src/main/java/com/hub/backend/security/SecurityConfig.java`:

```java
package com.hub.backend.security;

import com.hub.backend.config.CorsConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CorsConfig corsConfig;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

### 2-6. 헬스체크 컨트롤러

`backend/src/main/java/com/hub/backend/controller/HealthController.java`:

```java
package com.hub.backend.controller;

import com.hub.backend.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ApiResponse<String> health() {
        return ApiResponse.ok("InfoHub API alive");
    }
}
```

## 포인트

- **응답 포맷**: 프론트의 `ApiResponse<T>` 타입과 백엔드 응답이 정확히 일치해야 한다. `success`(boolean), `message`(string), `data`(T). 한쪽이라도 어긋나면 클라이언트가 통째로 깨진다.
- **CORS + 쿠키**: `allowCredentials(true)`이면 `allowedOrigins`에 와일드카드(`*`)를 못 쓴다. Refresh Token을 HttpOnly 쿠키로 받으려면 명시적 도메인이 필요하다.
- **임시 SecurityConfig**: 지금은 모든 요청을 `permitAll`로 열어둔다. Step 5에서 JWT 필터와 함께 권한 체계를 짜 넣는다.

## 정상 동작 기준

```bash
curl http://localhost:8080/api/health
# {"success":true,"message":"OK","data":"InfoHub API alive"}
```

---

# Step 3 — User 엔티티 & 회원가입

## 목표

`User` 엔티티 및 회원가입 API를 구현한다. 비밀번호는 BCrypt로 해싱해 저장하고, 이메일/닉네임 중복을 검증한다.

## 개념

- 사양서의 엔티티 단수형 규칙: 클래스 `User`, 테이블 `users`.
- DTO와 엔티티는 분리한다. 컨트롤러는 DTO를 받아 서비스에 전달, 서비스에서 엔티티로 변환해 저장.
- `Role`은 `enum`으로 두고 `@Enumerated(EnumType.STRING)`으로 저장한다.

## 코드

### 3-1. Role enum

`backend/src/main/java/com/hub/backend/entity/Role.java`:

```java
package com.hub.backend.entity;

public enum Role {
    USER, ADMIN
}
```

### 3-2. User 엔티티

`backend/src/main/java/com/hub/backend/entity/User.java`:

```java
package com.hub.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true, length = 30)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Builder
    public User(String email, String password, String nickname, Role role) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.role = role != null ? role : Role.USER;
    }

    public void changeNickname(String nickname) {
        this.nickname = nickname;
    }

    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    public void promoteToAdmin() {
        this.role = Role.ADMIN;
    }

    public void demoteToUser() {
        this.role = Role.USER;
    }
}
```

### 3-3. UserRepository

`backend/src/main/java/com/hub/backend/repository/UserRepository.java`:

```java
package com.hub.backend.repository;

import com.hub.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByNickname(String nickname);
}
```

### 3-4. 회원가입 / 사용자 정보 DTO

`backend/src/main/java/com/hub/backend/dto/SignupRequest.java`:

```java
package com.hub.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SignupRequest {

    @NotBlank(message = "이메일은 필수입니다.")
    @Email(message = "이메일 형식이 올바르지 않습니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 8, max = 20, message = "비밀번호는 8~20자여야 합니다.")
    private String password;

    @NotBlank(message = "닉네임은 필수입니다.")
    @Size(min = 2, max = 20, message = "닉네임은 2~20자여야 합니다.")
    private String nickname;
}
```

`backend/src/main/java/com/hub/backend/dto/UserResponse.java`:

```java
package com.hub.backend.dto;

import com.hub.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String email;
    private String nickname;
    private String role;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getRole().name(),
                user.getCreatedAt()
        );
    }
}
```

### 3-5. UserService — 회원가입

`backend/src/main/java/com/hub/backend/service/UserService.java`:

```java
package com.hub.backend.service;

import com.hub.backend.dto.SignupRequest;
import com.hub.backend.dto.UserResponse;
import com.hub.backend.entity.Role;
import com.hub.backend.entity.User;
import com.hub.backend.exception.CustomException;
import com.hub.backend.exception.ErrorCode;
import com.hub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
        }
        if (userRepository.existsByNickname(request.getNickname())) {
            throw new CustomException(ErrorCode.DUPLICATE_NICKNAME);
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .role(Role.USER)
                .build();

        return UserResponse.from(userRepository.save(user));
    }

    public UserResponse findUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        return UserResponse.from(user);
    }
}
```

### 3-6. UserController — `/me`

`backend/src/main/java/com/hub/backend/controller/UserController.java`:

```java
package com.hub.backend.controller;

import com.hub.backend.dto.ApiResponse;
import com.hub.backend.dto.UserResponse;
import com.hub.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserResponse> me(@AuthenticationPrincipal Long userId) {
        return ApiResponse.ok(userService.findUser(userId));
    }
}
```

> Note: `@AuthenticationPrincipal Long userId`는 Step 5에서 JWT 필터가 SecurityContext에 채워준다. 지금 이 시점에는 `null`이 들어오므로, Step 5까지는 호출하지 않는다.

## 포인트

- **BCrypt**: `passwordEncoder.encode()` 결과는 호출할 때마다 다르다(솔트 포함). 비교는 반드시 `matches()`. 평문 비교(`equals`)는 절대 작동하지 않는다.
- **DTO/Entity 분리**: `SignupRequest`는 `@Email`, `@Size` 등 입력 검증을 담당하고, `User` 엔티티는 DB 모델만 담는다. 한 클래스가 두 역할을 겸하면 책임 경계가 흐려진다.
- **Repository는 DB 접근만**: 비즈니스 검증(중복 체크 후 가입 등)은 Service에서. `existsByEmail`, `existsByNickname`은 Repository가 제공하는 단순 조회.

## 정상 동작 기준

```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@infohub.dev","password":"password123","nickname":"데모유저"}'
```

응답:

```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "id": 1,
    "email": "demo@infohub.dev",
    "nickname": "데모유저",
    "role": "USER",
    "createdAt": "2026-05-08T10:00:00"
  }
}
```

> `auth/signup` 엔드포인트는 다음 Step에서 `AuthController`에 만든다.

---

# Step 4 — JWT 발급 & 로그인

## 목표

JWT Access Token + Refresh Token을 발급하는 로그인 API를 만든다.

## 개념

- **Access Token**: 짧은 수명(30분). 매 API 요청의 `Authorization: Bearer ...` 헤더에 실어 보낸다.
- **Refresh Token**: 긴 수명(7일). HttpOnly 쿠키로만 주고받으며, 만료된 Access Token을 재발급할 때만 쓴다.
- 본 사양서는 `refresh_tokens` 테이블을 두므로, Refresh Token을 PostgreSQL에 저장한다(Redis 미사용).

## 코드

### 4-1. JwtProperties

`backend/src/main/java/com/hub/backend/security/JwtProperties.java`:

```java
package com.hub.backend.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {
    private String secret;
    private long accessTokenValidity;
    private long refreshTokenValidity;
}
```

`BackendApplication`에 `@ConfigurationPropertiesScan`을 붙이거나 `JwtProperties`에 `@Component`만 둬도 동작한다(위 코드는 후자).

### 4-2. JwtTokenProvider

`backend/src/main/java/com/hub/backend/security/JwtTokenProvider.java`:

```java
package com.hub.backend.security;

import com.hub.backend.exception.CustomException;
import com.hub.backend.exception.ErrorCode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private final JwtProperties props;
    private SecretKey key;

    @PostConstruct
    void init() {
        byte[] bytes = Base64.getDecoder().decode(props.getSecret());
        this.key = Keys.hmacShaKeyFor(bytes);
    }

    public String createAccessToken(Long userId, String email, String role) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + props.getAccessTokenValidity());
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(exp)
                .signWith(key)
                .compact();
    }

    public String createRefreshToken(Long userId) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + props.getRefreshTokenValidity());
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(now)
                .expiration(exp)
                .signWith(key)
                .compact();
    }

    public Claims parseClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            throw new CustomException(ErrorCode.EXPIRED_TOKEN);
        } catch (JwtException | IllegalArgumentException e) {
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }
    }

    public Long getUserId(String token) {
        return Long.parseLong(parseClaims(token).getSubject());
    }

    public boolean validate(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (CustomException e) {
            return false;
        }
    }

    public long getRefreshTokenValidity() {
        return props.getRefreshTokenValidity();
    }
}
```

### 4-3. 로그인 DTO

`backend/src/main/java/com/hub/backend/dto/LoginRequest.java`:

```java
package com.hub.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class LoginRequest {

    @NotBlank @Email
    private String email;

    @NotBlank
    private String password;
}
```

`backend/src/main/java/com/hub/backend/dto/LoginResponse.java`:

```java
package com.hub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String tokenType;
    private UserResponse user;

    public static LoginResponse of(String accessToken, UserResponse user) {
        return new LoginResponse(accessToken, "Bearer", user);
    }
}
```

`backend/src/main/java/com/hub/backend/dto/LoginResult.java`:

```java
package com.hub.backend.dto;

import com.hub.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResult {
    private String accessToken;
    private String refreshToken;
    private User user;
}
```

> `LoginResult`는 Service가 컨트롤러에 한꺼번에 넘기는 내부 DTO. 컨트롤러가 refreshToken은 쿠키로, accessToken과 user는 본문으로 분리해서 응답한다.

### 4-4. AuthService

`backend/src/main/java/com/hub/backend/service/AuthService.java`:

```java
package com.hub.backend.service;

import com.hub.backend.dto.LoginRequest;
import com.hub.backend.dto.LoginResult;
import com.hub.backend.entity.User;
import com.hub.backend.exception.CustomException;
import com.hub.backend.exception.ErrorCode;
import com.hub.backend.repository.UserRepository;
import com.hub.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public LoginResult login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }

        String access = jwtTokenProvider.createAccessToken(
                user.getId(), user.getEmail(), user.getRole().name());
        String refresh = jwtTokenProvider.createRefreshToken(user.getId());

        return new LoginResult(access, refresh, user);
    }
}
```

> `refresh` 토큰을 DB에 저장하는 로직은 Step 6에서 `RefreshToken` 엔티티가 생긴 뒤 추가한다.

### 4-5. AuthController

`backend/src/main/java/com/hub/backend/controller/AuthController.java`:

```java
package com.hub.backend.controller;

import com.hub.backend.dto.*;
import com.hub.backend.service.AuthService;
import com.hub.backend.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/signup")
    public ApiResponse<UserResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ApiResponse.ok("회원가입이 완료되었습니다.", userService.signup(request));
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        LoginResult result = authService.login(request);

        Cookie cookie = new Cookie("refreshToken", result.getRefreshToken());
        cookie.setHttpOnly(true);
        cookie.setSecure(false);  // 운영에서는 true
        cookie.setPath("/");
        cookie.setMaxAge(7 * 24 * 60 * 60);
        response.addCookie(cookie);

        return ApiResponse.ok(
                "로그인에 성공했습니다.",
                LoginResponse.of(result.getAccessToken(), UserResponse.from(result.getUser()))
        );
    }
}
```

## 포인트

- **토큰 저장 위치**: Access Token은 프론트엔드 메모리 또는 `sessionStorage`(현재 [frontend/src/lib/api.ts](./frontend/src/lib/api.ts)에서 사용 중), Refresh Token은 **HttpOnly 쿠키**. `localStorage`에 토큰을 저장하면 XSS에 무방비다.
- **JWT secret 길이**: HMAC-SHA256은 최소 256비트(32바이트) 키가 필요하다. 위 `application-dev.yml`의 base64 디코딩 결과는 충분히 길다. 짧으면 `WeakKeyException`.
- **로그인 실패 메시지**: "이메일 없음"과 "비밀번호 다름"을 다른 메시지로 주면 사용자 열거 공격(user enumeration)에 노출된다. 운영에서는 둘 다 `INVALID_PASSWORD`로 통일하는 편이 안전. 본 실습은 디버깅 편의상 분리.

## 정상 동작 기준

```bash
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@infohub.dev","password":"password123"}'
```

응답 헤더에 `Set-Cookie: refreshToken=...; HttpOnly; Path=/`가 보이고, 본문은:

```json
{
  "success": true,
  "message": "로그인에 성공했습니다.",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "tokenType": "Bearer",
    "user": { "id": 1, "email": "demo@infohub.dev", "nickname": "데모유저", "role": "USER", "createdAt": "..." }
  }
}
```

---

# Step 5 — Spring Security + JWT 필터

## 목표

매 요청마다 JWT를 검증하는 커스텀 필터를 만들고 Spring Security에 끼워 넣는다. 인증/비인증 엔드포인트를 분리한다.

## 개념

`OncePerRequestFilter`를 상속한 필터를 `UsernamePasswordAuthenticationFilter` 앞에 둔다. 필터에서 토큰을 파싱해 유효하면 `SecurityContextHolder`에 인증 정보를 채워준다. 컨트롤러에서는 `@AuthenticationPrincipal`로 `userId`를 꺼낸다.

## 코드

### 5-1. JwtAuthenticationFilter

`backend/src/main/java/com/hub/backend/security/JwtAuthenticationFilter.java`:

```java
package com.hub.backend.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    private static final String HEADER = "Authorization";
    private static final String PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {

        String token = resolve(request);
        if (token != null && jwtTokenProvider.validate(token)) {
            try {
                Claims claims = jwtTokenProvider.parseClaims(token);
                Long userId = Long.parseLong(claims.getSubject());
                String role = claims.get("role", String.class);

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role))
                        );
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (Exception e) {
                log.warn("JWT 인증 실패: {}", e.getMessage());
                SecurityContextHolder.clearContext();
            }
        }
        chain.doFilter(request, response);
    }

    private String resolve(HttpServletRequest request) {
        String header = request.getHeader(HEADER);
        if (StringUtils.hasText(header) && header.startsWith(PREFIX)) {
            return header.substring(PREFIX.length());
        }
        return null;
    }
}
```

### 5-2. 인증 실패 / 접근 거부 핸들러

`backend/src/main/java/com/hub/backend/security/JwtAuthenticationEntryPoint.java`:

```java
package com.hub.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hub.backend.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest req, HttpServletResponse res, AuthenticationException e)
            throws IOException {
        res.setStatus(401);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write(objectMapper.writeValueAsString(ApiResponse.fail("인증이 필요합니다.")));
    }
}
```

`backend/src/main/java/com/hub/backend/security/JwtAccessDeniedHandler.java`:

```java
package com.hub.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hub.backend.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest req, HttpServletResponse res, AccessDeniedException e)
            throws IOException {
        res.setStatus(403);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write(objectMapper.writeValueAsString(ApiResponse.fail("접근 권한이 없습니다.")));
    }
}
```

### 5-3. SecurityConfig 정식 버전

Step 2의 임시 SecurityConfig를 **전체 교체**한다.

`backend/src/main/java/com/hub/backend/security/SecurityConfig.java`:

```java
package com.hub.backend.security;

import com.hub.backend.config.CorsConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CorsConfig corsConfig;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;
    private final JwtAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler)
            )
            .authorizeHttpRequests(auth -> auth
                // 비인증 가능
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/posts/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                // 관리자 전용
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // 그 외는 인증 필요
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

## 포인트

- **CSRF 비활성화**: JWT는 `Authorization` 헤더로 전달되므로 Cross-Site 요청에 자동 포함되지 않는다. CSRF 토큰은 쿠키 기반 세션에서만 의미가 있다. Refresh Token은 쿠키에 있지만 `SameSite=Lax`(브라우저 기본)로 1차 방어가 가능하고, 운영에서는 `Strict`로 더 조일 수 있다.
- **필터 위치**: `addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)`. JWT 검증이 폼 로그인 필터보다 먼저 일어나야 한다.
- **`@AuthenticationPrincipal Long userId`**: 필터가 `principal`로 `userId`(Long)를 넣었으므로 컨트롤러에서 그대로 꺼낸다. 별도의 `UserDetails` 구현체가 필요 없는 단순 구조.

## 정상 동작 기준

```bash
# 토큰 없이 보호된 엔드포인트
curl -i http://localhost:8080/api/users/me
# HTTP/1.1 401
# {"success":false,"message":"인증이 필요합니다.","data":null}

# 로그인 → 토큰
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@infohub.dev","password":"password123"}' \
  | jq -r '.data.accessToken')

# 토큰 있는 요청
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/users/me
# {"success":true,"message":"OK","data":{...}}
```

---

# Step 6 — Refresh Token (DB 기반)

## 목표

Refresh Token을 PostgreSQL `refresh_tokens` 테이블에 저장하고, 토큰 재발급(`/api/auth/reissue`) 및 로그아웃(`/api/auth/logout`)을 구현한다.

## 개념

Redis가 빠르고 TTL을 자체 지원해 편하지만, 본 사양의 MVP는 Redis를 쓰지 않는다. 대신 `refresh_tokens` 테이블에 (userId 1:1) 형태로 저장하고 `expiresAt` 컬럼으로 만료를 관리한다. 만료된 행은 스케줄러나 lazy 검증으로 정리한다(본 실습은 lazy 검증).

## 코드

### 6-1. RefreshToken 엔티티

`backend/src/main/java/com/hub/backend/entity/RefreshToken.java`:

```java
package com.hub.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens", indexes = {
        @Index(name = "idx_refresh_user", columnList = "user_id", unique = true)
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 1000)
    private String token;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public RefreshToken(Long userId, String token, LocalDateTime expiresAt) {
        this.userId = userId;
        this.token = token;
        this.expiresAt = expiresAt;
    }

    public void rotate(String newToken, LocalDateTime newExpiresAt) {
        this.token = newToken;
        this.expiresAt = newExpiresAt;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
```

### 6-2. RefreshTokenRepository

`backend/src/main/java/com/hub/backend/repository/RefreshTokenRepository.java`:

```java
package com.hub.backend.repository;

import com.hub.backend.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
```

### 6-3. AuthService 확장

Step 4의 `AuthService.login()`에 Refresh Token 저장 로직을 추가하고, `reissue` / `logout` 메서드를 신설한다.

`backend/src/main/java/com/hub/backend/service/AuthService.java` 전체 교체:

```java
package com.hub.backend.service;

import com.hub.backend.dto.LoginRequest;
import com.hub.backend.dto.LoginResult;
import com.hub.backend.entity.RefreshToken;
import com.hub.backend.entity.User;
import com.hub.backend.exception.CustomException;
import com.hub.backend.exception.ErrorCode;
import com.hub.backend.repository.RefreshTokenRepository;
import com.hub.backend.repository.UserRepository;
import com.hub.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public LoginResult login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }

        String access = jwtTokenProvider.createAccessToken(
                user.getId(), user.getEmail(), user.getRole().name());
        String refresh = jwtTokenProvider.createRefreshToken(user.getId());

        saveOrRotate(user.getId(), refresh);

        return new LoginResult(access, refresh, user);
    }

    @Transactional
    public String reissue(String refreshToken) {
        if (!jwtTokenProvider.validate(refreshToken)) {
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }

        Long userId = jwtTokenProvider.getUserId(refreshToken);
        RefreshToken stored = refreshTokenRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_TOKEN));

        if (stored.isExpired() || !stored.getToken().equals(refreshToken)) {
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        String newAccess = jwtTokenProvider.createAccessToken(
                user.getId(), user.getEmail(), user.getRole().name());
        String newRefresh = jwtTokenProvider.createRefreshToken(user.getId());

        stored.rotate(newRefresh, expiry());
        return newAccess;
    }

    @Transactional
    public void logout(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    private void saveOrRotate(Long userId, String token) {
        refreshTokenRepository.findByUserId(userId)
                .ifPresentOrElse(
                        existing -> existing.rotate(token, expiry()),
                        () -> refreshTokenRepository.save(
                                RefreshToken.builder()
                                        .userId(userId)
                                        .token(token)
                                        .expiresAt(expiry())
                                        .build()
                        )
                );
    }

    private LocalDateTime expiry() {
        return LocalDateTime.now()
                .plusNanos(jwtTokenProvider.getRefreshTokenValidity() * 1_000_000);
    }
}
```

### 6-4. AuthController 확장

`AuthController`에 `/reissue`, `/logout` 추가:

```java
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.Arrays;

// ... 기존 코드 안에 추가:

    @PostMapping("/reissue")
    public ApiResponse<LoginResponse> reissue(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String refreshToken = readCookie(request, "refreshToken");
        if (refreshToken == null) {
            return ApiResponse.fail("Refresh Token이 없습니다.")
                    .let(r -> { throw new RuntimeException(); });  // 사실은 throw하는 게 맞다
        }

        String newAccess = authService.reissue(refreshToken);
        // 사용자 정보를 같이 내려주려면 토큰에서 userId 꺼내 조회
        return ApiResponse.ok("토큰이 재발급되었습니다.",
                new LoginResponse(newAccess, "Bearer", null));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(
            @AuthenticationPrincipal Long userId,
            HttpServletResponse response
    ) {
        if (userId != null) authService.logout(userId);

        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);

        return ApiResponse.ok("로그아웃되었습니다.", null);
    }

    private String readCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
```

> 위 `/reissue`의 `let(...)` 부분은 의도적인 가독성용 의사코드다. 실제로는 다음과 같이 정리:

```java
    @PostMapping("/reissue")
    public ApiResponse<LoginResponse> reissue(HttpServletRequest request) {
        String refreshToken = readCookie(request, "refreshToken");
        if (refreshToken == null) {
            throw new CustomException(ErrorCode.INVALID_TOKEN);
        }
        String newAccess = authService.reissue(refreshToken);
        return ApiResponse.ok("토큰이 재발급되었습니다.",
                new LoginResponse(newAccess, "Bearer", null));
    }
```

## 포인트

- **Rotation**: `reissue()` 호출 시 새 Refresh Token을 발급하고 기존 행을 갱신한다. 탈취된 토큰으로 재발급을 시도하면, 정상 사용자의 토큰과 충돌하여 다음 사용자 요청에서 `INVALID_TOKEN`이 떨어진다 → 사용자 입장에서 "로그아웃됨" 신호.
- **lazy 만료 검증**: `isExpired()`를 reissue마다 검사하므로 따로 cleanup 스케줄러가 없어도 보안상 문제는 없다. 단, 테이블이 무한히 커지는 것을 막으려면 주기 배치(Spring `@Scheduled`)로 정리해줘야 한다.
- **`deleteByUserId`**: `@Modifying` 없이 동작하지만 트랜잭션이 필요하다. 위 코드에서는 `@Transactional`이 메서드 단위로 걸려 있다.

## 정상 동작 기준

```bash
# 로그인 → refreshToken 쿠키
curl -i -c cookie.txt -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@infohub.dev","password":"password123"}'

# 재발급 (쿠키 사용)
curl -b cookie.txt -X POST http://localhost:8080/api/auth/reissue
# {"success":true,"message":"토큰이 재발급되었습니다.","data":{...}}
```

---

# Step 7 — Category & Post CRUD

## 목표

`Category`, `Post` 엔티티를 만들고 게시글 CRUD API와 카테고리/페이지네이션을 지원하는 목록 조회 API를 구현한다.

## 개념

- 사양서의 초기 카테고리는 4종(트렌드 / 개발 / AI / 자유게시판). 별도 테이블로 두면 추가가 쉽고 외래키로 무결성도 잡힌다.
- `Post`는 `User`(작성자)와 `Category`에 다대일로 연결된다. 양방향이 꼭 필요하지 않으면 단방향 `@ManyToOne`만 둔다(N+1 위험을 줄이고 도메인이 단순해진다).
- 조회수는 상세 조회 시 1씩 증가. 동시성 정밀도는 MVP에서 신경 쓰지 않고, 추후 Redis 캐싱(확장 항목)으로 옮긴다.

## 코드

### 7-1. Category 엔티티 + 시드

`backend/src/main/java/com/hub/backend/entity/Category.java`:

```java
package com.hub.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "categories")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;     // TREND, DEV, AI, FREE

    @Column(nullable = false, length = 30)
    private String label;    // 트렌드, 개발, AI, 자유게시판

    @Builder
    public Category(String code, String label) {
        this.code = code;
        this.label = label;
    }
}
```

`backend/src/main/java/com/hub/backend/repository/CategoryRepository.java`:

```java
package com.hub.backend.repository;

import com.hub.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByCode(String code);
    boolean existsByCode(String code);
}
```

애플리케이션 시작 시 초기 카테고리를 시드한다.

`backend/src/main/java/com/hub/backend/config/CategoryInitializer.java`:

```java
package com.hub.backend.config;

import com.hub.backend.entity.Category;
import com.hub.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CategoryInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    private static final List<Map.Entry<String, String>> SEEDS = List.of(
            Map.entry("TREND", "트렌드"),
            Map.entry("DEV", "개발"),
            Map.entry("AI", "AI"),
            Map.entry("FREE", "자유게시판")
    );

    @Override
    public void run(String... args) {
        SEEDS.forEach(s -> {
            if (!categoryRepository.existsByCode(s.getKey())) {
                categoryRepository.save(
                        Category.builder().code(s.getKey()).label(s.getValue()).build()
                );
            }
        });
    }
}
```

### 7-2. Post 엔티티

`backend/src/main/java/com/hub/backend/entity/Post.java`:

```java
package com.hub.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "posts", indexes = {
        @Index(name = "idx_post_category", columnList = "category_id"),
        @Index(name = "idx_post_user", columnList = "user_id"),
        @Index(name = "idx_post_created", columnList = "created_at")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Lob
    @Column(nullable = false)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User author;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    private long viewCount;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Builder
    public Post(String title, String content, User author, Category category) {
        this.title = title;
        this.content = content;
        this.author = author;
        this.category = category;
        this.viewCount = 0;
    }

    public void update(String title, String content, Category category) {
        this.title = title;
        this.content = content;
        this.category = category;
    }

    public void increaseViewCount() {
        this.viewCount++;
    }

    public boolean isAuthor(Long userId) {
        return this.author.getId().equals(userId);
    }
}
```

### 7-3. PostRepository

`backend/src/main/java/com/hub/backend/repository/PostRepository.java`:

```java
package com.hub.backend.repository;

import com.hub.backend.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {

    @EntityGraph(attributePaths = {"author", "category"})
    Page<Post> findAllByCategoryCode(String code, Pageable pageable);

    @EntityGraph(attributePaths = {"author", "category"})
    Page<Post> findAllBy(Pageable pageable);
}
```

> `findAllBy(Pageable)`은 Spring Data JPA 키워드 규약(`findAllBy`)으로 만든 fetch join용 트릭이다. `@EntityGraph`만으로 `author`/`category`를 한 번에 가져온다.

### 7-4. Post DTO

`backend/src/main/java/com/hub/backend/dto/PostCreateRequest.java`:

```java
package com.hub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PostCreateRequest {

    @NotBlank @Size(max = 100)
    private String title;

    @NotBlank
    private String content;

    @NotBlank
    private String category;   // TREND / DEV / AI / FREE
}
```

`backend/src/main/java/com/hub/backend/dto/PostUpdateRequest.java`:

```java
package com.hub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PostUpdateRequest {

    @NotBlank @Size(max = 100)
    private String title;

    @NotBlank
    private String content;

    @NotBlank
    private String category;
}
```

`backend/src/main/java/com/hub/backend/dto/PostResponse.java`:

```java
package com.hub.backend.dto;

import com.hub.backend.entity.Post;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class PostResponse {

    private Long id;
    private String title;
    private String content;
    private String category;
    private String author;
    private Long authorId;
    private long viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PostResponse from(Post post) {
        return new PostResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getCategory().getCode(),
                post.getAuthor().getNickname(),
                post.getAuthor().getId(),
                post.getViewCount(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
```

`backend/src/main/java/com/hub/backend/dto/PageResponse.java`:

```java
package com.hub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

@Getter
@AllArgsConstructor
public class PageResponse<T> {

    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean last;

    public static <E, T> PageResponse<T> of(Page<E> page, Function<E, T> mapper) {
        return new PageResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }
}
```

### 7-5. PostService

`backend/src/main/java/com/hub/backend/service/PostService.java`:

```java
package com.hub.backend.service;

import com.hub.backend.dto.*;
import com.hub.backend.entity.Category;
import com.hub.backend.entity.Post;
import com.hub.backend.entity.Role;
import com.hub.backend.entity.User;
import com.hub.backend.exception.CustomException;
import com.hub.backend.exception.ErrorCode;
import com.hub.backend.repository.CategoryRepository;
import com.hub.backend.repository.PostRepository;
import com.hub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional
    public PostResponse createPost(Long userId, PostCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        Category category = categoryRepository.findByCode(request.getCategory())
                .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND));

        Post post = Post.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .author(user)
                .category(category)
                .build();

        return PostResponse.from(postRepository.save(post));
    }

    public PageResponse<PostResponse> findPosts(String categoryCode, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> result = (categoryCode == null || categoryCode.isBlank())
                ? postRepository.findAllBy(pageable)
                : postRepository.findAllByCategoryCode(categoryCode, pageable);
        return PageResponse.of(result, PostResponse::from);
    }

    @Transactional
    public PostResponse findPost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));
        post.increaseViewCount();
        return PostResponse.from(post);
    }

    @Transactional
    public PostResponse updatePost(Long userId, Long postId, PostUpdateRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));

        if (!post.isAuthor(userId)) {
            throw new CustomException(ErrorCode.POST_FORBIDDEN);
        }

        Category category = categoryRepository.findByCode(request.getCategory())
                .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND));

        post.update(request.getTitle(), request.getContent(), category);
        return PostResponse.from(post);
    }

    @Transactional
    public void deletePost(Long userId, String role, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));

        boolean isAdmin = Role.ADMIN.name().equals(role);
        if (!isAdmin && !post.isAuthor(userId)) {
            throw new CustomException(ErrorCode.POST_FORBIDDEN);
        }

        postRepository.delete(post);
    }
}
```

### 7-6. PostController

`backend/src/main/java/com/hub/backend/controller/PostController.java`:

```java
package com.hub.backend.controller;

import com.hub.backend.dto.*;
import com.hub.backend.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ApiResponse<PageResponse<PostResponse>> list(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.ok(postService.findPosts(category, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<PostResponse> detail(@PathVariable Long id) {
        return ApiResponse.ok(postService.findPost(id));
    }

    @PostMapping
    public ApiResponse<PostResponse> create(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody PostCreateRequest request
    ) {
        return ApiResponse.ok("게시글이 등록되었습니다.", postService.createPost(userId, request));
    }

    @PutMapping("/{id}")
    public ApiResponse<PostResponse> update(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @Valid @RequestBody PostUpdateRequest request
    ) {
        return ApiResponse.ok("게시글이 수정되었습니다.", postService.updatePost(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @AuthenticationPrincipal Long userId,
            Authentication authentication,
            @PathVariable Long id
    ) {
        String role = authentication.getAuthorities().iterator().next().getAuthority()
                .replace("ROLE_", "");
        postService.deletePost(userId, role, id);
        return ApiResponse.ok("게시글이 삭제되었습니다.", null);
    }
}
```

## 포인트

- **N+1 회피**: `Page<Post>` 조회에서 `@EntityGraph`로 `author`, `category`를 함께 가져온다. 이걸 빼면 목록 화면에서 게시글 수만큼 추가 쿼리가 나간다 → 느린 게시판의 단골 원인.
- **권한 체크 위치**: 게시글 삭제는 "본인 또는 관리자". 서비스 단에서 한 번에 체크하고, 컨트롤러는 인증 정보만 추출해 넘긴다. 컨트롤러에서 권한 분기를 하면 같은 검증이 여러 곳에 흩어진다.
- **카테고리 코드 vs PK**: 카테고리 외래키는 PK(Long)로 잡혀 있지만, 클라이언트와의 인터페이스는 `code`(string)을 쓴다. PK가 환경마다 달라져도 API 계약이 깨지지 않는다.
- **조회수 증가의 동시성**: `post.increaseViewCount()`는 트랜잭션 내 dirty checking으로 UPDATE된다. 동시 100명이 보면 일부 카운트가 누락될 수 있다. MVP에서는 받아들이고, 확장 단계에서 Redis `INCR`로 옮긴다.

## 정상 동작 기준

```bash
# 게시글 작성
curl -X POST http://localhost:8080/api/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"첫 글","content":"안녕하세요","category":"FREE"}'

# 목록 (인증 불필요)
curl "http://localhost:8080/api/posts?category=FREE&page=0&size=10"

# 상세
curl http://localhost:8080/api/posts/1
```

---

# Step 8 — Comment CRUD

## 목표

게시글에 달리는 댓글 CRUD를 구현한다. 작성자 본인 또는 관리자만 수정/삭제할 수 있다.

## 코드

### 8-1. Comment 엔티티

`backend/src/main/java/com/hub/backend/entity/Comment.java`:

```java
package com.hub.backend.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments", indexes = {
        @Index(name = "idx_comment_post", columnList = "post_id, created_at"),
        @Index(name = "idx_comment_user", columnList = "user_id")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User author;

    @Column(nullable = false, length = 1000)
    private String content;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Builder
    public Comment(Post post, User author, String content) {
        this.post = post;
        this.author = author;
        this.content = content;
    }

    public void update(String content) {
        this.content = content;
    }

    public boolean isAuthor(Long userId) {
        return this.author.getId().equals(userId);
    }
}
```

### 8-2. CommentRepository

```java
package com.hub.backend.repository;

import com.hub.backend.entity.Comment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    @EntityGraph(attributePaths = "author")
    List<Comment> findAllByPostIdOrderByCreatedAtAsc(Long postId);
}
```

### 8-3. Comment DTO

`backend/src/main/java/com/hub/backend/dto/CommentRequest.java`:

```java
package com.hub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CommentRequest {

    @NotBlank
    @Size(max = 1000)
    private String content;
}
```

`backend/src/main/java/com/hub/backend/dto/CommentResponse.java`:

```java
package com.hub.backend.dto;

import com.hub.backend.entity.Comment;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class CommentResponse {

    private Long id;
    private Long postId;
    private String author;
    private Long authorId;
    private String content;
    private LocalDateTime createdAt;

    public static CommentResponse from(Comment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getPost().getId(),
                comment.getAuthor().getNickname(),
                comment.getAuthor().getId(),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}
```

### 8-4. CommentService

```java
package com.hub.backend.service;

import com.hub.backend.dto.CommentRequest;
import com.hub.backend.dto.CommentResponse;
import com.hub.backend.entity.Comment;
import com.hub.backend.entity.Post;
import com.hub.backend.entity.Role;
import com.hub.backend.entity.User;
import com.hub.backend.exception.CustomException;
import com.hub.backend.exception.ErrorCode;
import com.hub.backend.repository.CommentRepository;
import com.hub.backend.repository.PostRepository;
import com.hub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public List<CommentResponse> findComments(Long postId) {
        return commentRepository.findAllByPostIdOrderByCreatedAtAsc(postId).stream()
                .map(CommentResponse::from)
                .toList();
    }

    @Transactional
    public CommentResponse createComment(Long userId, Long postId, CommentRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CustomException(ErrorCode.POST_NOT_FOUND));
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Comment saved = commentRepository.save(
                Comment.builder().post(post).author(author).content(request.getContent()).build()
        );
        return CommentResponse.from(saved);
    }

    @Transactional
    public CommentResponse updateComment(Long userId, Long commentId, CommentRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CustomException(ErrorCode.COMMENT_NOT_FOUND));
        if (!comment.isAuthor(userId)) {
            throw new CustomException(ErrorCode.COMMENT_FORBIDDEN);
        }
        comment.update(request.getContent());
        return CommentResponse.from(comment);
    }

    @Transactional
    public void deleteComment(Long userId, String role, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CustomException(ErrorCode.COMMENT_NOT_FOUND));

        boolean isAdmin = Role.ADMIN.name().equals(role);
        if (!isAdmin && !comment.isAuthor(userId)) {
            throw new CustomException(ErrorCode.COMMENT_FORBIDDEN);
        }
        commentRepository.delete(comment);
    }
}
```

### 8-5. CommentController

```java
package com.hub.backend.controller;

import com.hub.backend.dto.ApiResponse;
import com.hub.backend.dto.CommentRequest;
import com.hub.backend.dto.CommentResponse;
import com.hub.backend.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/api/posts/{postId}/comments")
    public ApiResponse<List<CommentResponse>> list(@PathVariable Long postId) {
        return ApiResponse.ok(commentService.findComments(postId));
    }

    @PostMapping("/api/posts/{postId}/comments")
    public ApiResponse<CommentResponse> create(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequest request
    ) {
        return ApiResponse.ok("댓글이 등록되었습니다.",
                commentService.createComment(userId, postId, request));
    }

    @PutMapping("/api/comments/{id}")
    public ApiResponse<CommentResponse> update(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id,
            @Valid @RequestBody CommentRequest request
    ) {
        return ApiResponse.ok("댓글이 수정되었습니다.",
                commentService.updateComment(userId, id, request));
    }

    @DeleteMapping("/api/comments/{id}")
    public ApiResponse<Void> delete(
            @AuthenticationPrincipal Long userId,
            Authentication authentication,
            @PathVariable Long id
    ) {
        String role = authentication.getAuthorities().iterator().next().getAuthority()
                .replace("ROLE_", "");
        commentService.deleteComment(userId, role, id);
        return ApiResponse.ok("댓글이 삭제되었습니다.", null);
    }
}
```

## 포인트

- **GET 댓글은 공개**: 게시글 상세 페이지가 비로그인에서도 동작하므로 `GET /api/posts/{id}/comments`도 `permitAll`. SecurityConfig에서 이미 `GET /api/posts/**`를 열어두었기 때문에 자동으로 포함된다.
- **URL 형태**: 댓글 목록과 작성은 게시글 컨텍스트에 종속(`/api/posts/{postId}/comments`), 수정/삭제는 단일 자원(`/api/comments/{id}`). 댓글이 어느 게시글에 속하는지 URL에서 굳이 한 번 더 표현하지 않아도 된다.
- **fetch 전략**: `@ManyToOne`은 기본 `EAGER`가 아니라 명시적으로 `LAZY`로 둔다. 댓글 응답에 `author.nickname`만 쓰므로 `@EntityGraph`로 author만 끌어올린다.

## 정상 동작 기준

```bash
# 댓글 작성
curl -X POST http://localhost:8080/api/posts/1/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"좋은 글이네요"}'

# 목록 (인증 불필요)
curl http://localhost:8080/api/posts/1/comments
```

---

# Step 9 — Info(정보) 도메인 CRUD & 이미지 업로드

## 목표

[Step 7 — Category & Post CRUD](#step-7--category--post-crud)에서 만든 게시판과 별도로, 메인 페이지의 **정보 카드 그리드 + 아티클 상세**를 떠받칠 `Info` 도메인을 만든다. 더불어 대표 이미지 / 본문 인라인 이미지를 받기 위한 업로드 엔드포인트(`POST /api/uploads/images`)까지 함께 구현한다.

## 개념

본 프로젝트는 두 개의 콘텐츠 도메인을 가진다.

| 도메인 | 성격 | 라우트 (FE) | 라우트 (BE) |
|---|---|---|---|
| **Post** | 커뮤니티 게시판(스레드/댓글 중심) | `/posts/*` | `/api/posts/*` |
| **Info** | 정보 공유 페이지(카드 그리드 + 아티클 상세) | `/info/*` | `/api/infos/*` |

프론트엔드는 이미 [frontend/src/app/info/](./frontend/src/app/info/)에 메인/상세/작성/수정 UI를 mock 데이터 기반으로 구현해 둔 상태이며, 본 Step은 그 화면들과 1:1로 연결되는 백엔드를 처음부터 끝까지 구현한다. 코드를 그대로 베껴 쓰는 것이 목적이 아니라 **프론트가 기대하는 데이터 계약을 명확히 한다**는 점을 기억하자.

## 9.1 화면 ↔ API 매핑

| 화면 | 파일 | 호출할 API |
|---|---|---|
| 정보 메인(카드 그리드, 카테고리/검색 필터) | [frontend/src/app/page.tsx](./frontend/src/app/page.tsx) | `GET /api/infos?category=&keyword=` |
| 정보 상세 | [frontend/src/app/info/\[id\]/page.tsx](./frontend/src/app/info/[id]/page.tsx) | `GET /api/infos/{id}` |
| 정보 작성 | [frontend/src/app/info/new/page.tsx](./frontend/src/app/info/new/page.tsx) | `POST /api/infos` (+ `POST /api/uploads/images`) |
| 정보 수정 | [frontend/src/app/info/\[id\]/edit/page.tsx](./frontend/src/app/info/[id]/edit/page.tsx) | `GET /api/infos/{id}` → `PUT /api/infos/{id}` |
| 삭제 모달 확인 | [frontend/src/components/DeleteModal.tsx](./frontend/src/components/DeleteModal.tsx) | `DELETE /api/infos/{id}` |

## 9.2 API 목록

| Method | URL | 권한 | 설명 |
|---|---|---|---|
| GET | `/api/infos` | 공개 | 정보 목록. 쿼리 파라미터: `category`, `keyword`, `page`, `size` |
| GET | `/api/infos/{id}` | 공개 | 정보 상세 |
| POST | `/api/infos` | 로그인 | 정보 등록 |
| PUT | `/api/infos/{id}` | 작성자/ADMIN | 정보 수정 |
| DELETE | `/api/infos/{id}` | 작성자/ADMIN | 정보 삭제 |
| POST | `/api/uploads/images` | 로그인 | 이미지 업로드 (multipart) — 대표 이미지 / 본문 인라인 이미지 공통 |

> Post와 동일한 컨벤션을 따른다: 공개 GET, 작성자(또는 ADMIN)에게만 PUT/DELETE 허용. 인증/인가는 [Step 5 — Spring Security + JWT 필터](#step-5--spring-security--jwt-필터)의 설정을 그대로 재사용한다.

## 9.3 프론트와 연결되는 데이터 구조

프론트엔드의 `Info` 타입([frontend/src/types/index.ts](./frontend/src/types/index.ts))은 다음과 같다.

```ts
export interface Info {
  id: number;
  title: string;
  imageUrl: string;       // 대표 이미지 URL
  tags: string[];         // 0~5개
  category: "TREND" | "DEV" | "AI" | "FREE";
  summary?: string;
  author: string;         // 작성자 닉네임 (조회 시 join해서 채움)
  authorId: number;
  createdAt: string;      // ISO-8601
  updatedAt: string;
  body: string;           // 마크다운 유사 텍스트. 인라인 이미지는 ![alt](url) 문법
}
```

본문은 마크다운 전체 스펙을 쓰지 않고 **문단 + 인라인 이미지(`![alt](url)`) 두 가지만** 지원한다. 백엔드는 본문을 그대로 저장하면 되고, 파싱/렌더링은 프론트의 [InfoDetail](./frontend/src/components/InfoDetail.tsx)이 담당한다.

## 9.4 요청/응답 예시(JSON)

모든 응답은 [Step 2 — 백엔드 기본 구조](#step-2--백엔드-기본-구조)의 공통 `ApiResponse<T>` 래퍼를 사용한다.

### 9.4.1 `GET /api/infos?category=AI&keyword=Claude&page=0&size=12`

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "items": [
      {
        "id": 3,
        "title": "Claude Opus 4.7 코딩 에이전트 후기",
        "imageUrl": "https://cdn.infohub.dev/images/2026/05/abc123.jpg",
        "tags": ["AI", "Claude", "에이전트"],
        "category": "AI",
        "summary": "컨텍스트 관리·스킬 시스템 사용기.",
        "author": "AI탐험가",
        "authorId": 4,
        "createdAt": "2026-05-05T18:20:00",
        "updatedAt": "2026-05-05T18:20:00"
      }
    ],
    "page": 0,
    "size": 12,
    "totalElements": 24,
    "totalPages": 2
  }
}
```

> 목록에서는 `body` 필드를 **응답에서 제외**한다(대형 텍스트 절감). 카드 UI에 필요한 필드만 내려준다.

### 9.4.2 `GET /api/infos/{id}`

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "id": 3,
    "title": "Claude Opus 4.7 코딩 에이전트 후기",
    "imageUrl": "https://cdn.infohub.dev/images/2026/05/abc123.jpg",
    "tags": ["AI", "Claude", "에이전트"],
    "category": "AI",
    "summary": "컨텍스트 관리·스킬 시스템 사용기.",
    "author": "AI탐험가",
    "authorId": 4,
    "createdAt": "2026-05-05T18:20:00",
    "updatedAt": "2026-05-05T18:20:00",
    "body": "Claude Opus 4.7을 코딩 에이전트로 일주일 써본 후기입니다.\n\n![Agent Loop](https://cdn.infohub.dev/images/2026/05/loop.png)\n\n컨텍스트 관리와 스킬 시스템이 인상적이었습니다."
  }
}
```

### 9.4.3 `POST /api/infos` (요청)

```json
{
  "title": "RSC 핵심 정리",
  "imageUrl": "https://cdn.infohub.dev/images/2026/05/cover.png",
  "tags": ["트렌드", "React", "RSC"],
  "category": "TREND",
  "summary": "서버 컴포넌트의 동작 원리.",
  "body": "RSC는 ..."
}
```

`imageUrl`은 `POST /api/uploads/images`로 먼저 업로드해 받은 URL을 그대로 본문 JSON에 박아 넣는 구조다. multipart와 JSON을 한 요청에 섞지 않는다.

### 9.4.4 `POST /api/uploads/images` (multipart)

요청

```
POST /api/uploads/images
Content-Type: multipart/form-data

file: <binary>
```

응답

```json
{
  "success": true,
  "message": "ok",
  "data": {
    "url": "https://cdn.infohub.dev/images/2026/05/abc123.jpg",
    "width": 1200,
    "height": 630,
    "byteSize": 184320
  }
}
```

## 9.5 Entity 설계

`Post`와 별도 테이블로 분리한다. 두 도메인은 성격이 달라(스레드 vs 아티클) 컬럼/인덱스/검색 전략이 갈리기 때문이다.

```java
// entity/Info.java
@Entity
@Table(name = "info",
    indexes = {
        @Index(name = "idx_info_category_created", columnList = "category, created_at"),
        @Index(name = "idx_info_author", columnList = "author_id")
    })
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Info {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(length = 300)
    private String summary;

    @Lob
    @Column(nullable = false)
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CategoryKey category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id")
    private User author;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "info_tag",
        joinColumns = @JoinColumn(name = "info_id"),
        indexes = @Index(name = "idx_info_tag_tag", columnList = "tag"))
    @Column(name = "tag", length = 40, nullable = false)
    private List<String> tags = new ArrayList<>();

    public static Info create(User author, InfoCreateRequest req) {
        Info i = new Info();
        i.author    = author;
        i.title     = req.title();
        i.imageUrl  = req.imageUrl();
        i.summary   = req.summary();
        i.body      = req.body();
        i.category  = req.category();
        i.tags      = req.tags() == null ? new ArrayList<>() : new ArrayList<>(req.tags());
        return i;
    }

    public void update(InfoUpdateRequest req) {
        this.title    = req.title();
        this.imageUrl = req.imageUrl();
        this.summary  = req.summary();
        this.body     = req.body();
        this.category = req.category();
        this.tags.clear();
        if (req.tags() != null) this.tags.addAll(req.tags());
    }
}
```

> 태그를 별도 `Tag` 엔티티 + 다대다로 두는 변형도 가능하지만, 이번 사양은 "정보 카드에 표시되는 라벨" 수준이므로 `@ElementCollection`이 가장 비용이 낮다. 자동완성/통계가 필요해지는 시점에 분리하면 된다.
>
> `update`에서 `tags`를 새 리스트로 통째 교체하지 않고 `clear() + addAll()`을 쓰는 이유: `@ElementCollection`은 컬렉션 인스턴스 자체를 갈아끼우면 Hibernate가 추적을 못해 `info_tag` 전체를 재삽입하거나 예외를 낸다. 같은 컬렉션 객체를 살려둔 채 내용만 갈아끼우는 패턴이 안전하다.

## 9.6 DTO

```java
// dto/InfoSummaryResponse.java  — 목록용 (body 없음)
public record InfoSummaryResponse(
    Long id,
    String title,
    String imageUrl,
    List<String> tags,
    CategoryKey category,
    String summary,
    String author,
    Long authorId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static InfoSummaryResponse from(Info i) {
        return new InfoSummaryResponse(
            i.getId(), i.getTitle(), i.getImageUrl(),
            List.copyOf(i.getTags()), i.getCategory(),
            i.getSummary(),
            i.getAuthor().getNickname(), i.getAuthor().getId(),
            i.getCreatedAt(), i.getUpdatedAt()
        );
    }
}

// dto/InfoDetailResponse.java  — 상세용 (body 포함)
public record InfoDetailResponse(
    Long id,
    String title,
    String imageUrl,
    List<String> tags,
    CategoryKey category,
    String summary,
    String body,
    String author,
    Long authorId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static InfoDetailResponse from(Info i) {
        return new InfoDetailResponse(
            i.getId(), i.getTitle(), i.getImageUrl(),
            List.copyOf(i.getTags()), i.getCategory(),
            i.getSummary(), i.getBody(),
            i.getAuthor().getNickname(), i.getAuthor().getId(),
            i.getCreatedAt(), i.getUpdatedAt()
        );
    }
}

// dto/InfoCreateRequest.java
public record InfoCreateRequest(
    @NotBlank @Size(max = 200) String title,
    @NotBlank @Size(max = 500) String imageUrl,
    @Size(max = 300)            String summary,
    @NotNull  CategoryKey       category,
    @NotBlank                   String body,
    @Size(max = 5) List<@NotBlank @Size(max = 40) String> tags
) {}

// dto/InfoUpdateRequest.java  — Create와 동일 필드(부분 수정이 아니라 전체 교체 PUT)
public record InfoUpdateRequest(
    @NotBlank @Size(max = 200) String title,
    @NotBlank @Size(max = 500) String imageUrl,
    @Size(max = 300)            String summary,
    @NotNull  CategoryKey       category,
    @NotBlank                   String body,
    @Size(max = 5) List<@NotBlank @Size(max = 40) String> tags
) {}

// dto/PageResponse.java  — items + 페이지 메타 (다른 도메인에서도 재사용)
public record PageResponse<T>(
    List<T> items, int page, int size, long totalElements, int totalPages
) {
    public static <T> PageResponse<T> of(Page<T> p) {
        return new PageResponse<>(
            p.getContent(), p.getNumber(), p.getSize(),
            p.getTotalElements(), p.getTotalPages()
        );
    }
}
```

## 9.7 Controller

```java
// controller/InfoController.java
@RestController
@RequestMapping("/api/infos")
@RequiredArgsConstructor
public class InfoController {

    private final InfoService infoService;

    @GetMapping
    public ApiResponse<PageResponse<InfoSummaryResponse>> list(
        @RequestParam(required = false) CategoryKey category,
        @RequestParam(required = false) String keyword,
        @PageableDefault(size = 12, sort = "createdAt", direction = DESC) Pageable pageable
    ) {
        return ApiResponse.ok(infoService.list(category, keyword, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<InfoDetailResponse> detail(@PathVariable Long id) {
        return ApiResponse.ok(infoService.get(id));
    }

    @PostMapping
    public ApiResponse<InfoDetailResponse> create(
        @AuthenticationPrincipal AuthUser me,
        @Valid @RequestBody InfoCreateRequest req
    ) {
        return ApiResponse.ok(infoService.create(me.id(), req));
    }

    @PutMapping("/{id}")
    public ApiResponse<InfoDetailResponse> update(
        @AuthenticationPrincipal AuthUser me,
        @PathVariable Long id,
        @Valid @RequestBody InfoUpdateRequest req
    ) {
        return ApiResponse.ok(infoService.update(me, id, req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
        @AuthenticationPrincipal AuthUser me,
        @PathVariable Long id
    ) {
        infoService.delete(me, id);
        return ApiResponse.ok(null);
    }
}
```

`InfoService.update / delete`에서는 `author.id == me.id || me.role == ADMIN` 검증을 반드시 통과시킨 후 변경하도록 작성한다. 컨트롤러에서 권한 분기 하지 말고 서비스에서 도메인 규칙으로 처리하는 것이 [Step 10 — 관리자 기능](#step-10--관리자-기능)과 일관된다. 실제 Service 코드는 다음 절(9.8)에서 작성한다.

## 9.8 Service

Controller가 호출하는 4개 메서드를 가진 서비스다. 핵심은 다음 셋이다.

1. **트랜잭션 경계**: 조회는 `@Transactional(readOnly = true)`, 변경은 `@Transactional`. DTO 변환을 트랜잭션 안에서 수행해야 `LazyInitializationException`이 안 난다(`Info.author`가 LAZY이므로).
2. **권한 검증**: 작성자 본인 또는 ADMIN만 수정/삭제 가능. Controller가 아닌 서비스에서 도메인 규칙으로 검증한다.
3. **목록 응답에서 `body` 제외**: 카드 그리드에는 본문 본체가 필요 없다 — `InfoSummaryResponse`로 매핑해 페이로드를 줄인다.

```java
// service/InfoService.java
package com.hub.backend.service;

import com.hub.backend.dto.*;
import com.hub.backend.entity.Info;
import com.hub.backend.entity.User;
import com.hub.backend.exception.ForbiddenException;
import com.hub.backend.exception.NotFoundException;
import com.hub.backend.repository.InfoRepository;
import com.hub.backend.repository.UserRepository;
import com.hub.backend.security.AuthUser;
import com.hub.backend.types.CategoryKey;
import com.hub.backend.types.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InfoService {

    private final InfoRepository infoRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<InfoSummaryResponse> list(CategoryKey category, String keyword, Pageable pageable) {
        String kw = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        Page<Info> page = infoRepository.search(category, kw, pageable);
        return PageResponse.of(page.map(InfoSummaryResponse::from));
    }

    @Transactional(readOnly = true)
    public InfoDetailResponse get(Long id) {
        Info info = infoRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("INFO_NOT_FOUND"));
        return InfoDetailResponse.from(info);
    }

    @Transactional
    public InfoDetailResponse create(Long meId, InfoCreateRequest req) {
        User author = userRepository.findById(meId)
            .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND"));
        Info info = Info.create(author, req);
        Info saved = infoRepository.save(info);
        return InfoDetailResponse.from(saved);
    }

    @Transactional
    public InfoDetailResponse update(AuthUser me, Long id, InfoUpdateRequest req) {
        Info info = infoRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("INFO_NOT_FOUND"));
        assertWritable(me, info);
        info.update(req);                       // dirty checking으로 UPDATE
        return InfoDetailResponse.from(info);
    }

    @Transactional
    public void delete(AuthUser me, Long id) {
        Info info = infoRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("INFO_NOT_FOUND"));
        assertWritable(me, info);
        infoRepository.delete(info);
        // 본문 인라인 이미지 정리 정책은 9.10 참고
    }

    private void assertWritable(AuthUser me, Info info) {
        boolean isOwner = info.getAuthor().getId().equals(me.id());
        boolean isAdmin = me.role() == Role.ADMIN;
        if (!isOwner && !isAdmin) throw new ForbiddenException("NOT_AUTHOR");
    }
}
```

### 예외 클래스

[Step 2 — 백엔드 기본 구조](#step-2--백엔드-기본-구조)에서 만든 공통 예외에 다음 둘이 없다면 그때 함께 추가한다.

```java
// exception/NotFoundException.java
public class NotFoundException extends RuntimeException {
    public NotFoundException(String code) { super(code); }
}

// exception/ForbiddenException.java
public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String code) { super(code); }
}
```

`GlobalExceptionHandler`에서 각각 404/403 + `ApiResponse.fail(code)`로 매핑한다.

## 9.9 CRUD 흐름 설명 (한 사이클)

```
[작성]
  FE  : /info/new → ImageUploader가 파일 선택
       → POST /api/uploads/images (multipart)  ──► BE: 디스크/S3 저장 후 public URL 응답
       → InfoEditor가 imageUrl 필드에 URL 주입
       → "등록" 버튼 → POST /api/infos { title, imageUrl, tags, body, ... }
  BE  : @Valid 검증 → InfoService.create → Info 엔티티 저장 → 201 응답
  FE  : 응답의 id로 router.push(`/info/{id}`)

[조회]
  FE  : / 진입 → GET /api/infos?category=...  → InfoGrid 렌더
        카드 클릭 → /info/{id} → GET /api/infos/{id} → InfoDetail 렌더
  BE  : 카테고리/키워드 필터 + 페이지네이션. 검색은 title/summary/tags에 ILIKE

[수정]
  FE  : /info/{id}/edit → GET /api/infos/{id} 로 prefill
       → "저장" → PUT /api/infos/{id}
  BE  : 권한 체크 → InfoService.update → 변경 감지로 dirty checking

[삭제]
  FE  : 상세에서 "삭제" 클릭 → DeleteModal 확인
       → DELETE /api/infos/{id}
  BE  : 권한 체크 → 본문에 인라인 삽입된 이미지 정리(9.10 참조) → 엔티티 삭제
  FE  : router.push("/") 로 메인 복귀
```

## 9.10 이미지 업로드 처리 방식

업로드는 본문 JSON과 **분리된 별도 엔드포인트**(`POST /api/uploads/images`)로 받는다. 이유는 다음과 같다.

1. 본문 작성 중간에도 인라인 이미지를 삽입할 수 있어야 한다 (`![alt](url)`). 본문 저장 전에 URL이 먼저 확보돼야 한다.
2. multipart + JSON 혼합 컨트롤러는 검증/예외 처리가 복잡해진다.
3. 대표 이미지 / 인라인 이미지가 동일한 엔드포인트를 공유해 정책(용량/확장자/리사이즈)을 한 곳에서 관리한다.

### 응답 DTO

```java
// dto/ImageUploadResponse.java
public record ImageUploadResponse(
    String url,
    int    width,    // 분석 안 한 경우 0
    int    height,   // 분석 안 한 경우 0
    long   byteSize
) {}
```

> `width / height`를 정확히 채우고 싶다면 `javax.imageio.ImageIO.read(file.getInputStream())`로 디코딩해 `BufferedImage.getWidth/Height`를 읽으면 된다. SVG는 디코딩 불가이므로 0으로 둔다. MVP는 0으로 시작해도 프론트 동작에 영향 없다.

### Controller

```java
// controller/UploadController.java
package com.hub.backend.controller;

import com.hub.backend.dto.ApiResponse;
import com.hub.backend.dto.ImageUploadResponse;
import com.hub.backend.service.ImageUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final ImageUploadService imageUploadService;

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ImageUploadResponse> uploadImage(
        @RequestPart("file") MultipartFile file
    ) {
        return ApiResponse.ok(imageUploadService.store(file));
    }
}
```

> `@RequestPart`(NOT `@RequestParam`)를 써야 멀티파트 바운더리를 정확히 파싱한다. 프론트의 [ImageUploader](./frontend/src/components/ImageUploader.tsx)는 `FormData`에 `"file"` 키로 붙여 보내므로 두 이름이 정확히 일치해야 한다.

### 로컬 디스크 저장 (개발/단일 서버)

```java
// service/ImageUploadService.java
@Service
@RequiredArgsConstructor
public class ImageUploadService {

    private static final Set<String> ALLOWED = Set.of("image/png", "image/jpeg", "image/webp", "image/svg+xml");
    private static final long MAX_SIZE = 5L * 1024 * 1024; // 5MB

    @Value("${app.upload.dir}") private String uploadDir;     // /var/infohub/uploads
    @Value("${app.upload.public-base}") private String base;  // https://cdn.infohub.dev

    public ImageUploadResponse store(MultipartFile file) {
        if (file.isEmpty()) throw new BadRequest("EMPTY_FILE");
        if (file.getSize() > MAX_SIZE) throw new BadRequest("TOO_LARGE");
        if (!ALLOWED.contains(file.getContentType())) throw new BadRequest("UNSUPPORTED_TYPE");

        String ext = switch (file.getContentType()) {
            case "image/png"     -> ".png";
            case "image/jpeg"    -> ".jpg";
            case "image/webp"    -> ".webp";
            case "image/svg+xml" -> ".svg";
            default              -> ".bin";
        };

        LocalDate today = LocalDate.now();
        Path dir = Path.of(uploadDir,
            String.valueOf(today.getYear()),
            "%02d".formatted(today.getMonthValue()));
        Files.createDirectories(dir);

        String name = UUID.randomUUID() + ext;
        Path dst = dir.resolve(name);
        file.transferTo(dst);

        String publicUrl = "%s/%d/%02d/%s".formatted(
            base, today.getYear(), today.getMonthValue(), name);
        return new ImageUploadResponse(publicUrl, /* width */ 0, /* height */ 0, file.getSize());
    }
}
```

`application.yml`

```yaml
app:
  upload:
    dir: /var/infohub/uploads
    public-base: https://cdn.infohub.dev/images
spring:
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 5MB
```

운영 도메인에 정적 파일을 서빙하려면 [Step 11 — 배포](#step-11--배포)의 Nginx 설정에 location 블록 하나만 추가하면 된다.

```nginx
location /images/ {
    alias /var/infohub/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### S3 저장 (운영 권장)

EC2 단일 서버에서 디스크에 두면 배포 시 파일이 사라지거나 스케일 아웃이 막힌다. 운영은 S3 + CloudFront 조합으로 가는 것이 표준이다.

```java
@Service
@RequiredArgsConstructor
public class S3ImageUploadService implements ImageUploader {
    private final S3Client s3;
    @Value("${app.s3.bucket}") private String bucket;
    @Value("${app.s3.public-base}") private String base;

    public ImageUploadResponse store(MultipartFile file) {
        validate(file);
        String key = "images/%d/%02d/%s%s".formatted(
            LocalDate.now().getYear(),
            LocalDate.now().getMonthValue(),
            UUID.randomUUID(),
            extOf(file));
        s3.putObject(PutObjectRequest.builder()
                .bucket(bucket).key(key)
                .contentType(file.getContentType())
                .cacheControl("public, max-age=31536000, immutable")
                .build(),
            RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        return new ImageUploadResponse(base + "/" + key, 0, 0, file.getSize());
    }
}
```

### 본문 안 인라인 이미지 정책

- 본문 텍스트에 박힌 `![alt](url)`는 그대로 저장한다. 백엔드는 본문 파싱을 하지 않는다.
- 삭제 시 고아 이미지 정리는 두 가지 전략 중 하나:
  - **즉시 정리**: 본문에서 `!\[.*?\]\((.*?)\)` 패턴으로 URL을 추출해 S3 키를 삭제. 사용자가 다른 글에서 같은 URL을 참조하지 않는다고 가정할 때만 가능.
  - **GC 스케줄러**: `info_image` 참조 테이블을 두고 정보 저장/수정 시 동기화. 야간 잡이 미참조 이미지를 일괄 삭제. 운영 안전.
- 본 가이드의 MVP 수준에서는 정리하지 않고 두는 것이 무난하다. 사용량이 일정 이상 커지면 GC 스케줄러를 붙인다.

## 9.11 Repository · 검색/필터

`GET /api/infos?category=&keyword=`의 처리 예시:

```java
// repository/InfoRepository.java
public interface InfoRepository extends JpaRepository<Info, Long> {
    @Query("""
      select i from Info i
      where (:category is null or i.category = :category)
        and (
          :keyword is null
          or lower(i.title)   like lower(concat('%', :keyword, '%'))
          or lower(i.summary) like lower(concat('%', :keyword, '%'))
          or exists (
              select 1 from Info i2 join i2.tags t
              where i2 = i and lower(t) like lower(concat('%', :keyword, '%'))
          )
        )
    """)
    Page<Info> search(@Param("category") CategoryKey category,
                      @Param("keyword") String keyword,
                      Pageable pageable);
}
```

태그/제목 동시 검색이 부담스러워지면 Postgres `pg_trgm` GIN 인덱스나 Elasticsearch로 옮긴다. MVP는 위 ILIKE 쿼리로 충분하다.

## 9.12 권한 정책 요약

| 행위 | 허용 |
|---|---|
| 정보 목록/상세 조회 | 누구나 |
| 정보 작성 | 로그인 사용자 |
| 정보 수정/삭제 | 작성자 본인 또는 ADMIN |
| 이미지 업로드 | 로그인 사용자 |

`SecurityConfig`의 `requestMatchers`에 다음을 추가한다 (다른 규칙들은 [Step 5](#step-5--spring-security--jwt-필터)와 동일):

```java
.requestMatchers(HttpMethod.GET, "/api/infos/**").permitAll()
.requestMatchers("/api/infos/**").authenticated()
.requestMatchers(HttpMethod.POST, "/api/uploads/**").authenticated()
```

## 9.13 프론트엔드 mock → 실제 API 교체 위치

| 파일 | 현재(mock) | 교체 후 |
|---|---|---|
| [frontend/src/app/page.tsx](./frontend/src/app/page.tsx) | `MOCK_INFOS` import | `useEffect`로 `api.get("/infos", { params })` 호출 |
| [frontend/src/app/info/\[id\]/page.tsx](./frontend/src/app/info/[id]/page.tsx) | `findInfo(id)` | `api.get(`/infos/${id}`)` |
| [frontend/src/app/info/new/page.tsx](./frontend/src/app/info/new/page.tsx) | `console.log` | `api.post("/infos", draft)` |
| [frontend/src/app/info/\[id\]/edit/page.tsx](./frontend/src/app/info/[id]/edit/page.tsx) | `console.log` | `api.put(`/infos/${id}`, draft)` |
| [frontend/src/components/ImageUploader.tsx](./frontend/src/components/ImageUploader.tsx) | FileReader → dataURL | `api.post("/uploads/images", formData)` 후 `onChange(res.data.url)` |
| [frontend/src/components/DeleteModal.tsx](./frontend/src/components/DeleteModal.tsx) 호출부 | `alert(...)` | `api.delete(`/infos/${id}`)` |

`InfoDraft` 타입은 `InfoCreateRequest` / `InfoUpdateRequest` DTO와 필드 이름이 동일하도록 맞춰 두었으므로 axios 호출 시 그대로 body로 넘기면 된다.

---

# Step 10 — 관리자 기능

## 목표

관리자 전용 엔드포인트(`/api/admin/**`)를 만들어 사용자 관리와 게시글/댓글 강제 삭제를 지원한다.

## 개념

`@PreAuthorize` 대신, SecurityConfig에서 이미 `/api/admin/**`을 `hasRole("ADMIN")`으로 잠가뒀다. 컨트롤러는 단순히 그 prefix에 매핑하면 된다. 게시글/댓글 삭제는 Step 7-8에서 이미 관리자 분기를 넣었으므로, 관리자가 일반 엔드포인트(`DELETE /api/posts/{id}`)를 호출해도 동작한다. 관리자 페이지의 "사용자 권한 토글" 같은 기능만 별도로 추가한다.

## 코드

### 9-1. AdminUserController

`backend/src/main/java/com/hub/backend/controller/AdminController.java`:

```java
package com.hub.backend.controller;

import com.hub.backend.dto.ApiResponse;
import com.hub.backend.dto.UserResponse;
import com.hub.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ApiResponse<List<UserResponse>> users() {
        return ApiResponse.ok(adminService.findAllUsers());
    }

    @PatchMapping("/users/{id}/role")
    public ApiResponse<UserResponse> toggleRole(@PathVariable Long id) {
        return ApiResponse.ok("권한이 변경되었습니다.", adminService.toggleRole(id));
    }

    @DeleteMapping("/users/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ApiResponse.ok("사용자가 삭제되었습니다.", null);
    }
}
```

### 9-2. AdminService

```java
package com.hub.backend.service;

import com.hub.backend.dto.UserResponse;
import com.hub.backend.entity.Role;
import com.hub.backend.entity.User;
import com.hub.backend.exception.CustomException;
import com.hub.backend.exception.ErrorCode;
import com.hub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;

    public List<UserResponse> findAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional
    public UserResponse toggleRole(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        if (user.getRole() == Role.ADMIN) {
            user.demoteToUser();
        } else {
            user.promoteToAdmin();
        }
        return UserResponse.from(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }
        userRepository.deleteById(id);
    }
}
```

### 9-3. 첫 관리자 만들기

운영에서 처음 관리자 계정은 보통 DB에 직접 INSERT하거나 한 번만 도는 부트스트랩 코드로 처리한다. 본 실습은 `application-dev.yml`이 활성화된 동안 환경변수가 있으면 한 번 승격하는 방식으로 한다.

`backend/src/main/java/com/hub/backend/config/AdminBootstrapper.java`:

```java
package com.hub.backend.config;

import com.hub.backend.entity.User;
import com.hub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrapper implements CommandLineRunner {

    private final UserRepository userRepository;

    @Value("${admin.bootstrap.email:}")
    private String bootstrapEmail;

    @Override
    @Transactional
    public void run(String... args) {
        if (bootstrapEmail == null || bootstrapEmail.isBlank()) return;
        userRepository.findByEmail(bootstrapEmail).ifPresent(this::promoteIfNeeded);
    }

    private void promoteIfNeeded(User user) {
        if (!"ADMIN".equals(user.getRole().name())) {
            user.promoteToAdmin();
            log.info("사용자 {}를 ADMIN으로 승격", user.getEmail());
        }
    }
}
```

`application-dev.yml`에 다음을 추가하면 해당 이메일 사용자가 자동 승격된다.

```yaml
admin:
  bootstrap:
    email: admin@infohub.dev
```

## 포인트

- **권한 분기 위치**: `/api/admin/**`는 SecurityConfig에서 일괄 차단. 컨트롤러는 깨끗하게 비즈니스 로직만 담는다. `@PreAuthorize`를 메서드마다 붙이는 것보다 SecurityConfig 한 곳에서 패턴으로 관리하는 편이 빠뜨릴 위험이 적다.
- **자기 자신 강등 방어**: 위 `toggleRole`은 본인 강등도 허용한다. 운영에서는 "마지막 관리자는 강등 불가" 같은 가드가 필요하다(MVP 범위 밖).
- **삭제 vs 비활성화**: 사용자 행을 정말 삭제하면 게시글/댓글에 외래키 연쇄 효과가 생긴다. 실무에서는 `deletedAt` 컬럼을 둔 soft delete가 일반적. MVP에서는 단순화하지만, 확장 시 1순위 리팩토링 대상으로 표시.

## 정상 동작 기준

```bash
# USER 토큰으로 시도 → 403
curl -i -H "Authorization: Bearer $USER_TOKEN" http://localhost:8080/api/admin/users
# {"success":false,"message":"접근 권한이 없습니다."}

# ADMIN 토큰
curl -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:8080/api/admin/users
```

---

# Step 11 — 배포

## 목표

Docker로 컨테이너화하고, Nginx Reverse Proxy 뒤에 두고, AWS EC2에 GitHub Actions로 자동 배포한다.

## 개념

```
┌──────────┐       ┌────────────────────────────────────────────┐
│  사용자   │ ───►  │  EC2 (Ubuntu)                              │
└──────────┘       │   ├── nginx (80/443) ──► frontend (3000)   │
                   │   │                  └─► backend  (8080)    │
                   │   ├── docker compose up -d                 │
                   │   └── postgres (RDS 또는 컨테이너)         │
                   └────────────────────────────────────────────┘
```

GitHub Actions는 `main` 브랜치 푸시 시 빌드 → 이미지 푸시(또는 EC2 직접 빌드) → SSH로 `docker compose pull && up -d` 실행.

## 코드

### 10-1. Backend Dockerfile

`backend/Dockerfile`:

```dockerfile
# === Build stage ===
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace
COPY gradlew gradlew
COPY gradle gradle
COPY build.gradle settings.gradle ./
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon || true

COPY src src
RUN ./gradlew bootJar --no-daemon -x test

# === Runtime stage ===
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /workspace/build/libs/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

### 10-2. Frontend Dockerfile

`frontend/Dockerfile`:

```dockerfile
# === deps ===
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# === build ===
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# === runtime ===
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

### 10-3. docker-compose.yml

리포지토리 루트의 `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks: [infohub]

  backend:
    build: ./backend
    environment:
      SPRING_PROFILES_ACTIVE: prod
      DB_URL: jdbc:postgresql://postgres:5432/${DB_NAME}
      DB_USERNAME: ${DB_USERNAME}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    depends_on: [postgres]
    networks: [infohub]
    expose:
      - "8080"

  frontend:
    build: ./frontend
    networks: [infohub]
    expose:
      - "3000"

  nginx:
    image: nginx:1.27-alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on: [frontend, backend]
    networks: [infohub]

volumes:
  pgdata:

networks:
  infohub:
    driver: bridge
```

### 10-4. nginx.conf

`nginx.conf`:

```nginx
upstream backend_upstream {
    server backend:8080;
}

upstream frontend_upstream {
    server frontend:3000;
}

server {
    listen 80;
    server_name _;

    client_max_body_size 10m;

    location /api/ {
        proxy_pass         http://backend_upstream;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass         http://frontend_upstream;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

> 운영에서는 `next.config.mjs`의 `rewrites`(개발용)를 빼고, 프론트가 같은 도메인 `/api/*`를 호출하도록 둔다. nginx가 알아서 백엔드로 넘긴다.

### 10-5. .env.production (EC2에 둠)

`/home/ubuntu/infohub/.env`:

```
DB_NAME=infohub
DB_USERNAME=infohub
DB_PASSWORD=<강력한 비밀번호>
JWT_SECRET=<base64로 64바이트 이상 랜덤>
```

`.env`는 절대 git에 커밋하지 않는다. `.gitignore`에 포함.

### 10-6. GitHub Actions 워크플로우

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to EC2

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'

      - name: Backend test
        working-directory: backend
        run: ./gradlew test

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Frontend build
        working-directory: frontend
        run: |
          npm ci --legacy-peer-deps
          npm run build

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key:  ${{ secrets.EC2_SSH_KEY }}
          script: |
            set -e
            cd /home/ubuntu/infohub
            git pull origin main
            docker compose --env-file .env build
            docker compose --env-file .env up -d
            docker image prune -f
```

GitHub 저장소의 Settings → Secrets and variables → Actions에 다음 비밀을 등록한다.

| Name | 값 |
|---|---|
| `EC2_HOST` | EC2 퍼블릭 IP/도메인 |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | EC2 접속용 PEM 파일 내용 전체 |

### 10-7. EC2 초기 설정 한 번

```bash
# Ubuntu 22.04 EC2에 SSH 접속한 뒤:
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git
sudo usermod -aG docker ubuntu  # 재로그인 필요

mkdir -p /home/ubuntu/infohub
cd /home/ubuntu/infohub
git clone https://github.com/<your-account>/infohub.git .

# .env 작성 (DB 비번, JWT 시크릿)
nano .env

# 최초 1회 부팅
docker compose --env-file .env up -d --build
```

이 시점부터 `main` 브랜치에 푸시하면 GitHub Actions가 빌드 → SSH 접속 → `docker compose up -d`로 무중단 배포한다.

## 포인트

- **이미지 빌드 위치**: 위 워크플로우는 EC2에서 `docker compose build`를 한다 → 가장 단순. 트래픽이 커지면 GitHub Actions에서 ECR로 푸시 → EC2가 `pull`만 하는 형태로 옮긴다(빌드 부하를 EC2에서 떼어냄).
- **HTTPS**: 위 nginx는 80번만 연다. 운영에서는 Let's Encrypt + certbot으로 443 + 자동 갱신을 붙여야 한다(발표/포트폴리오 시점에 도메인이 있다면 필수).
- **ddl-auto=validate**: 운영 프로파일은 `validate`. 테이블 구조 변경 시 마이그레이션이 빠지면 부팅이 실패한다 — 이게 정상 동작이다. 임의 자동 변경보다 폴백이 안전.
- **무중단 vs 짧은 다운타임**: 위 구성은 `up -d`로 컨테이너를 교체하므로 수 초의 다운타임이 발생한다. 진짜 무중단이 필요하면 nginx upstream에 두 인스턴스를 두고 한 쪽씩 갈아치우는 blue-green 패턴이 필요하다(MVP 범위 밖).

## 정상 동작 기준

- GitHub Actions 빌드 성공 (`Deploy via SSH` step까지 녹색).
- `http://<EC2_IP>/` 에서 메인 페이지가 보이고, `http://<EC2_IP>/api/health`가 200 응답.
- `docker compose ps` 결과 4개 컨테이너(`postgres`, `backend`, `frontend`, `nginx`) 모두 `Up` 상태.

---

# 부록 A — 데이터베이스 ERD 요약

```
users (id, email, password, nickname, role, created_at, updated_at)
   1
   │ N
posts (id, title, content, user_id, category_id, view_count, created_at, updated_at)
   1                          N│ 1
   │ N                          ▼
comments (id, post_id, user_id, content, created_at, updated_at)
                              categories (id, code, label)

refresh_tokens (id, user_id [unique], token, expires_at, created_at)
```

# 부록 B — API 한눈에 보기

| Method | URL | 인증 | 설명 |
|---|---|---|---|
| GET    | `/api/health` | 비인증 | 헬스체크 |
| POST   | `/api/auth/signup` | 비인증 | 회원가입 |
| POST   | `/api/auth/login` | 비인증 | 로그인 (Refresh Cookie) |
| POST   | `/api/auth/reissue` | 쿠키 | Access Token 재발급 |
| POST   | `/api/auth/logout` | 인증 | 로그아웃 |
| GET    | `/api/users/me` | 인증 | 내 정보 |
| GET    | `/api/posts` | 비인증 | 게시글 목록 (page/size/category) |
| GET    | `/api/posts/{id}` | 비인증 | 게시글 상세 (조회수 +1) |
| POST   | `/api/posts` | 인증 | 게시글 작성 |
| PUT    | `/api/posts/{id}` | 인증 (작성자) | 게시글 수정 |
| DELETE | `/api/posts/{id}` | 인증 (작성자/ADMIN) | 게시글 삭제 |
| GET    | `/api/posts/{id}/comments` | 비인증 | 댓글 목록 |
| POST   | `/api/posts/{id}/comments` | 인증 | 댓글 작성 |
| PUT    | `/api/comments/{id}` | 인증 (작성자) | 댓글 수정 |
| DELETE | `/api/comments/{id}` | 인증 (작성자/ADMIN) | 댓글 삭제 |
| GET    | `/api/admin/users` | ADMIN | 사용자 목록 |
| PATCH  | `/api/admin/users/{id}/role` | ADMIN | 권한 토글 |
| DELETE | `/api/admin/users/{id}` | ADMIN | 사용자 삭제 |

# 부록 C — 프론트엔드 연결

[frontend/](./frontend/)는 화면이 모두 구현되어 있고 mock 데이터로 동작한다. 각 페이지의 `// TODO:` 주석을 실제 호출로 교체하면 된다.

예) [frontend/src/app/login/page.tsx](./frontend/src/app/login/page.tsx)의 mock 분기를 다음으로 교체:

```ts
import { api } from "@/lib/api";

const { data } = await api.post("/auth/login", { email, password });
sessionStorage.setItem("accessToken", data.data.accessToken);
setAuth(data.data.user, data.data.accessToken);
router.push("/");
```

- 게시글 목록: [frontend/src/app/posts/page.tsx](./frontend/src/app/posts/page.tsx) → `GET /api/posts`
- 게시글 상세: [frontend/src/app/posts/\[id\]/page.tsx](./frontend/src/app/posts/[id]/page.tsx) → `GET /api/posts/{id}`, `GET /api/posts/{id}/comments`
- 글쓰기: [frontend/src/app/posts/new/page.tsx](./frontend/src/app/posts/new/page.tsx) → `POST /api/posts`
- 관리자: [frontend/src/app/admin/page.tsx](./frontend/src/app/admin/page.tsx) → `/api/admin/*`

`next.config.mjs`의 dev rewrites가 `/api/*`를 `localhost:8080`으로 프록시하므로, 프론트 코드에서는 항상 상대경로 `/api/...`만 쓰면 된다 — 운영에서도 동일 도메인 nginx가 같은 라우팅을 제공한다.

---


# 트러블슈팅 모음 (실제 자주 만나는 것 위주)

| 증상 | 원인 | 해결 |
|---|---|---|
| `WeakKeyException: The signing key's size is XX bits` | JWT secret이 짧음 | `application-dev.yml`의 secret을 base64로 64바이트 이상 길이로 |
| 로그인 후에도 401 | `Bearer ` 접두어 누락, 또는 Filter 미등록 | `addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class)` 확인 |
| CORS 에러 (브라우저 콘솔에 `No 'Access-Control-Allow-Origin'`) | `allowedOrigins`에 `*` + `allowCredentials(true)` 충돌 | 도메인 명시 |
| `LazyInitializationException` | 트랜잭션 밖에서 LAZY 필드 접근 | DTO 변환을 트랜잭션 안에서 / `@EntityGraph` 사용 |
| Refresh Token 쿠키 안 옴 | 프론트 axios가 `withCredentials` 없음 | [frontend/src/lib/api.ts](./frontend/src/lib/api.ts)에 `withCredentials: true` (이미 적용됨) |
| Docker 빌드에서 `gradlew: Permission denied` | 윈도우에서 git add 시 실행권한 누락 | `git update-index --chmod=+x backend/gradlew` |
| EC2에서 `docker compose: command not found` | `docker-compose-plugin` 미설치 | `sudo apt install docker-compose-plugin` |

---

# 끝.

여기까지 따라왔다면 이제 다음을 갖춘 상태다.

- 동작하는 Next.js 프론트엔드 ([frontend/](./frontend/))
- Spring Boot + JWT 백엔드 (이 문서의 코드)
- Docker / Nginx / EC2 / GitHub Actions 자동 배포

확장 아이템(좋아요, 북마크, 알림, OAuth, Redis 캐시, Elasticsearch 등)은 본 사양서의 "추후 확장 예정 기능"에 정리되어 있다. MVP가 완성된 후, 한 항목씩 별도 PR로 붙여 나가는 것이 포트폴리오로서의 깊이를 더한다.
