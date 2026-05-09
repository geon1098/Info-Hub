package com.hub.backend.exception;

import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.hub.backend.dto.ApiResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
//전역 예외 핸들러
	@ExceptionHandler(CustomException.class)
	public ResponseEntity<ApiResponse<Void>> handleCustom(CustomException e){
		ErrorCode code = e.getErrorCode();
		log.warn("CustomException: {}", code.getMessage());
		return ResponseEntity.status(code.getStatus())
				.body(ApiResponse.fail(code.getMessage()));
	}
	
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Void>> 
	handleValidation(MethodArgumentNotValidException e){
		String msg = e.getBindingResult().getFieldErrors().stream()
				.map(FieldError::getDefaultMessage)
				.collect(Collectors.joining(", "));
		
		log.warn("Validation failed: {}", msg);
		return ResponseEntity.badRequest().body(ApiResponse.fail(msg));
	}
	
	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ApiResponse<Void>> 
	handleAccessDenied(AccessDeniedException e){
		log.warn("AccessDenied: {}", e.getMessage());
		return ResponseEntity.status(403).body(ApiResponse.fail("접근 권한이 없습니다."));
	}
	
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<Void>> 
	handleAny(Exception e){
		log.error("Unhanled", e);
		return ResponseEntity.internalServerError()
				.body(ApiResponse.fail("서버 내부 오류가 발생했습니다."));
	}
}
