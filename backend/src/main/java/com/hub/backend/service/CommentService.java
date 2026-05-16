package com.hub.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hub.backend.dto.CommentRequest;
import com.hub.backend.dto.CommentResponse;
import com.hub.backend.entity.Comment;
import com.hub.backend.entity.Post;
import com.hub.backend.entity.Role;
import com.hub.backend.entity.User;
import com.hub.backend.exception.CustomException;
import com.hub.backend.exception.ErrorCode;
import com.hub.backend.repository.CommentRepository;
import com.hub.backend.repository.PostRepository;
import com.hub.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

	private final CommentRepository commentRepository;
	private final PostRepository postRepository;
	private final UserRepository userRepository;
	
	public List<CommentResponse> findComments(Long postId){
		return commentRepository.findAllByPostIdOrderByCreatedAtAsc(postId)
				.stream()
				.map(CommentResponse::from)
				.toList();
	}
	
	@Transactional
	public CommentResponse createComment(Long userId,
			Long postId,
			CommentRequest request) {
		Post post = postRepository.findById(postId)
				.orElseThrow(() -> new
	CustomException(ErrorCode.POST_NOT_FOUND));
		
		User author = userRepository.findById(userId)
				.orElseThrow(() -> new
	CustomException(ErrorCode.USER_NOT_FOUND));
		
		Comment saved = commentRepository.save(
Comment.builder().post(post).author(author).content(request.getContent()).build()
				);
		return CommentResponse.from(saved);
	}
	
	@Transactional
	public CommentResponse updateComment(Long userId,
			Long commentId,
			CommentRequest request) {
		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() -> new
	CustomException(ErrorCode.COMMENT_NOT_FOUND));
		if(!comment.isAuthor(userId)) {
			throw new CustomException(ErrorCode.COMMENT_FORBIDDEN);
		}
		comment.update(request.getContent());
		return CommentResponse.from(comment);
	}
	
	@Transactional
	public void deleteComment(Long userId,
			String role, Long commentId) {
		Comment comment = commentRepository.findById(commentId)
				.orElseThrow(() -> new
	CustomException(ErrorCode.COMMENT_NOT_FOUND));
		
		boolean isAdmin = Role.ADMIN.name().equals(role);
		if(!isAdmin && !comment.isAuthor(userId)) {
			throw new CustomException(ErrorCode.COMMENT_FORBIDDEN);
		}
		commentRepository.delete(comment);
	}
	
	
	
}
