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
import com.hub.backend.dto.PageResponse;
import com.hub.backend.dto.PostCreateRequest;
import com.hub.backend.dto.PostResponse;
import com.hub.backend.dto.PostUpdateRequest;
import com.hub.backend.service.PostService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

	private final PostService postService;
	
	@GetMapping
	public ApiResponse<PageResponse<PostResponse>> list(
			@RequestParam(value = "category", required = false) String category,
			@RequestParam(value = "page", defaultValue = "0") int page,
			@RequestParam(value = "size", defaultValue = "10") int size
			){
		return ApiResponse.ok(postService.findPosts(category, page, size));
	}
	
	@GetMapping("/{id}")
	public ApiResponse<PostResponse> detail(@PathVariable("id") Long id){
		return ApiResponse.ok(postService.findPost(id));
	}
	
	@PostMapping
	public ApiResponse<PostResponse> create(
			@AuthenticationPrincipal Long userId,
			@Valid @RequestBody PostCreateRequest request
			){
		return ApiResponse.ok("게시글이 등록되었습니다.",
				postService.createPost(userId, request));
	}
	
	@PutMapping("/{id}")
	public ApiResponse<PostResponse> update(
			@AuthenticationPrincipal Long userId,
			@PathVariable("id") Long id,
			@Valid @RequestBody PostUpdateRequest request
			){
		return ApiResponse.ok("게시글이 수정되었습니다.",
				postService.updatePost(userId, id, request));
	}
	
	@DeleteMapping("/{id}")
	public ApiResponse<Void> delete(
			@AuthenticationPrincipal Long userId,
			Authentication authentication,
			@PathVariable("id") Long id
			){
		String role = 
authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
		postService.deletePost(userId, role, id);
		return ApiResponse.ok("게시글이 삭제되었습니다.", null);
	}
}
