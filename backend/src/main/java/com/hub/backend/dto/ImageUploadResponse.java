package com.hub.backend.dto;

public record ImageUploadResponse(
		String url,
		int width,
		int height,
		long byteSize
) {}
