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
