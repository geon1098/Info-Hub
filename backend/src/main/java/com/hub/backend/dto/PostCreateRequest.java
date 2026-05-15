package com.hub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PostCreateRequest {
//Post DTO
	
	@NotBlank
	@Size(max = 100)
	private String title;
	
	@NotBlank
	private String content;
	
	@NotBlank
	private String category; // TREND / DEV / AI / FREE

}
