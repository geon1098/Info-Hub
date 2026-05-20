package com.hub.backend.dto;

import java.util.List;

import com.hub.backend.entity.CategoryKey;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InfoUpdateRequest(
		@NotBlank @Size(max = 200) String title,
		@NotBlank @Size(max = 500) String imageUrl,
		@Size(max = 300) String summary,
		@NotNull CategoryKey category,
		@NotBlank String body,
		@Size(max = 5) List<@NotBlank @Size(max = 40) String> tags
) {}
