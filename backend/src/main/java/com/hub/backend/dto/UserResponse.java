package com.hub.backend.dto;

import java.time.LocalDateTime;

import com.hub.backend.entity.User;

import lombok.AllArgsConstructor;
import lombok.Getter;

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
