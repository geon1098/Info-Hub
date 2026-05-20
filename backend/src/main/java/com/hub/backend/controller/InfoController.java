package com.hub.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hub.backend.dto.ApiResponse;
import com.hub.backend.dto.InfoCreateRequest;
import com.hub.backend.dto.InfoDetailResponse;
import com.hub.backend.dto.InfoSummaryResponse;
import com.hub.backend.dto.InfoUpdateRequest;
import com.hub.backend.dto.PageResponse;
import com.hub.backend.service.InfoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/infos")
@RequiredArgsConstructor
public class InfoController {

	private final InfoService infoService;

	@GetMapping
	public ApiResponse<PageResponse<InfoSummaryResponse>> list(
			@RequestParam(value = "category", required = false) String category,
			@RequestParam(value = "keyword", required = false) String keyword,
			@RequestParam(value = "page", defaultValue = "0") int page,
			@RequestParam(value = "size", defaultValue = "12") int size
	) {
		return ApiResponse.ok(infoService.list(category, keyword, page, size));
	}

	@GetMapping("/{id}")
	public ApiResponse<InfoDetailResponse> detail(@PathVariable("id") Long id) {
		return ApiResponse.ok(infoService.get(id));
	}

	@PostMapping
	public ApiResponse<InfoDetailResponse> create(
			@AuthenticationPrincipal Long userId,
			@Valid @RequestBody InfoCreateRequest request
	) {
		return ApiResponse.ok("정보가 등록되었습니다.", infoService.create(userId, request));
	}

	@PutMapping("/{id}")
	public ApiResponse<InfoDetailResponse> update(
			@AuthenticationPrincipal Long userId,
			Authentication authentication,
			@PathVariable("id") Long id,
			@Valid @RequestBody InfoUpdateRequest request
	) {
		String role = extractRole(authentication);
		return ApiResponse.ok("정보가 수정되었습니다.", infoService.update(userId, role, id, request));
	}

	@DeleteMapping("/{id}")
	public ApiResponse<Void> delete(
			@AuthenticationPrincipal Long userId,
			Authentication authentication,
			@PathVariable("id") Long id
	) {
		String role = extractRole(authentication);
		infoService.delete(userId, role, id);
		return ApiResponse.ok("정보가 삭제되었습니다.", null);
	}

	private String extractRole(Authentication authentication) {
		return authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
	}
}
