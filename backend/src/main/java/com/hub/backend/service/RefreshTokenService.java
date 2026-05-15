package com.hub.backend.service;

import java.time.Duration;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.hub.backend.security.JwtTokenProvider;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

	private static final String KEY_PREFIX = "refresh:";

	private final StringRedisTemplate redisTemplate;
	private final JwtTokenProvider jwtTokenProvider;

	public void save(Long userId, String token) {
		redisTemplate.opsForValue().set(
				key(userId),
				token,
				Duration.ofMillis(jwtTokenProvider.getRefreshTokenValidity())
		);
	}

	public String find(Long userId) {
		return redisTemplate.opsForValue().get(key(userId));
	}

	public void delete(Long userId) {
		redisTemplate.delete(key(userId));
	}

	private String key(Long userId) {
		return KEY_PREFIX + userId;
	}
}
