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
	
	CATEGORY_NOT_FOUND(404, "카테고리를 찾을 수 없습니다.");
	
	private final int status;
	private final String message;
}
