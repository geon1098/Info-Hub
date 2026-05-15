package com.hub.backend.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "posts", indexes = {
		@Index(name = "idx_post_category", columnList = "category_id"),
		@Index(name = "idx_post_user", columnList = "user_id"),
		@Index(name = "idx_post_created", columnList = "created_at")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Post {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false, length = 100)
	private String title;
	
	@Lob
	@Column(nullable = false)
	private String content;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id")
	private User author;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "category_id")
	private Category category;
	
	@Column(nullable = false)
	private long viewCount;
	
	@CreationTimestamp
	@Column(updatable = false)
	private LocalDateTime createdAt;
	
	@UpdateTimestamp
	private LocalDateTime updatedAt;

	@Builder
	public Post(String title, String content, User author, Category category) {
		this.title = title;
		this.content = content;
		this.author = author;
		this.category = category;
		this.viewCount = 0;
	}
	
	public void update(String title, String content, Category category) {
		this.title = title;
		this.content = content;
		this.category = category;
	}
	
	public void increaseViewCount() {
		this.viewCount++;
	}
	
	public boolean isAuthor(Long userId) {
		return this.author.getId().equals(userId);
	}
	
}
