package com.hub.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
//공통 응답 DTO
	private final boolean success;
	private final String message;
	private final T data;
	
	public static <T> ApiResponse<T> ok(T data){
		return new ApiResponse<>(true, "OK", data);
	}
	public static <T> ApiResponse<T> ok(String message, T data){
		return new ApiResponse<>(true, message, data);
	}
	public static ApiResponse<Void> ok(){
		return new ApiResponse<>(true, "OK", null);
	}
	public static ApiResponse<Void> fail(String message){
		return new ApiResponse<>(false, message, null);
	}

}
