package com.hub.backend.dto;

import java.time.LocalDateTime;

import com.hub.backend.entity.Comment;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CommentResponse {

	private Long id;
	private Long postId;
	private String author;
	private Long authorId;
	private String content;
	private LocalDateTime createdAt;
	
	public static CommentResponse from(Comment comment) {
		return new CommentResponse(
					comment.getId(),
					comment.getPost().getId(),
					comment.getAuthor().getNickname(),
					comment.getAuthor().getId(),
					comment.getContent(),
					comment.getCreatedAt()
				);
	}
}
