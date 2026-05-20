package com.hub.backend.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

	INVALID_INPUT(400, "입력랎이 올바르지 않습니다."),
	INTERNAL_ERROR(500, "서버 내부 오류가 발생했습니다."),
	
	
	UNAUTHORIZED(401, "인증이 필요합니다."),
	INVALID_TOKEN(401, "유효하지 않은 토큰입니다."),
	EXPIRED_TOKEN(401, "만료된 토큰입니다."),
	ACCESS_DENIED(403, "접근 권한이 없습니다."),
	
	
	DUPLICATE_EMAIL(409, "이미 사용 중인 이메일입니다."),
	DUPLICATE_NICKNAME(409, "이미 사용 중인 닉네임입니다."),
	USER_NOT_FOUND(404, "사용자를 찾을 수 없습니다."),
	INVALID_PASSWORD(401, "비밀번호가 일치하지 않습니다."),
	
	
	POST_NOT_FOUND(404, "게시글을 찾을 수 없습니다."),
	POST_FORBIDDEN(403, "게시글에 대한 권한이 없습니다."),
	
	
	COMMENT_NOT_FOUND(404, "댓글을 찾을 수 없습니다."),
	COMMENT_FORBIDDEN(403, "댓글에 대한 권한이 없습니다."),

	CATEGORY_NOT_FOUND(404, "카테고리를 찾을 수 없습니다."),

	INFO_NOT_FOUND(404, "정보를 찾을 수 없습니다."),
	INFO_FORBIDDEN(403, "정보에 대한 권한이 없습니다."),

	FILE_EMPTY(400, "업로드된 파일이 비어 있습니다."),
	FILE_TOO_LARGE(400, "파일 크기가 너무 큽니다."),
	FILE_UNSUPPORTED_TYPE(400, "지원하지 않는 파일 형식입니다."),
	FILE_STORE_FAILED(500, "파일 저장에 실패했습니다.");
	
	private final int status;
	private final String message;
}
