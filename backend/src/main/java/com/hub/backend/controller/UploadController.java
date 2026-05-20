package com.hub.backend.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.hub.backend.dto.ApiResponse;
import com.hub.backend.dto.ImageUploadResponse;
import com.hub.backend.service.ImageUploadService;

import lombok.RequiredArgsConstructor;

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
