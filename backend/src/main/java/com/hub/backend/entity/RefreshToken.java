package com.hub.backend.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "refresh_tokens", indexes = {
		@Index(name = "idx_refresh_user", columnList = "user_id", unique = true)
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
    @Column(name = "user_id", nullable = false)
	private Long userId;
	
    @Column(nullable = false, length = 1000)
	private String token;
	
    @Column(nullable = false)
	private LocalDateTime expiresAt;
	
    @CreationTimestamp
    @Column(updatable = false)
	private LocalDateTime createdAt;
	
    @Builder
	public RefreshToken(Long userId, String token, LocalDateTime expiresAt) {
		this.userId = userId;
		this.token = token;
		this.expiresAt = expiresAt;
	}
	
	public void rotate(String newToken, LocalDateTime newExpiresAt) {
		this.token = newToken;
		this.expiresAt = newExpiresAt;
	}
	
	public boolean isExpired() {
		return LocalDateTime.now().isAfter(expiresAt);
	}
}
