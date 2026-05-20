package com.hub.backend.dto;

import com.hub.backend.entity.Post;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class PostResponse {

	private Long id;
	private String title;
	private String content;
	private String category;
	private String author;
	private Long authorId;
	private long viewCount;
	private long commentCount;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public static PostResponse from(Post post) {
		return from(post, 0L);
	}

	public static PostResponse from(Post post, long commentCount) {
		return new PostResponse(
				post.getId(),
				post.getTitle(),
				post.getContent(),
				post.getCategory().getCode(),
				post.getAuthor().getNickname(),
				post.getAuthor().getId(),
				post.getViewCount(),
				commentCount,
				post.getCreatedAt(),
				post.getUpdatedAt()
		);
	}
}
