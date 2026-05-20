package com.hub.backend.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.hub.backend.dto.ApiResponse;
import com.hub.backend.dto.CommentRequest;
import com.hub.backend.dto.CommentResponse;
import com.hub.backend.service.CommentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CommentController {

	private final CommentService commentService;
	
	@GetMapping("/api/posts/{postId}/comments")
	public ApiResponse<List<CommentResponse>> list(@PathVariable("postId") Long postId){
		return ApiResponse.ok(commentService.findComments(postId));
	}
	
	@PostMapping("/api/posts/{postId}/comments")
	public ApiResponse<CommentResponse> create(
			@AuthenticationPrincipal Long userId,
			@PathVariable("postId") Long postId,
			@Valid @RequestBody CommentRequest request){
		return ApiResponse.ok("댓글이 등록되었습니다.",
				commentService.createComment(userId, postId, request));
	}
	
	@PutMapping("/api/comments/{id}")
	public ApiResponse<CommentResponse> update(
			@AuthenticationPrincipal Long userId,
			@PathVariable("id") Long id,
			@Valid @RequestBody CommentRequest request
			){
		return ApiResponse.ok("댓글이 수정되었습니다.",
				commentService.updateComment(userId, id, request));
	}
	
	@DeleteMapping("/api/comments/{id}")
	public ApiResponse<Void> delete(
			@AuthenticationPrincipal Long userId,
			Authentication authentication,
			@PathVariable("id") Long id
			){
		String role = 
	authentication.getAuthorities().iterator().next().getAuthority()
			.replace("ROLE_", "");
		commentService.deleteComment(userId, role, id);
		return ApiResponse.ok("댓글이 삭제되었습니다.", null);
	}
	
}
