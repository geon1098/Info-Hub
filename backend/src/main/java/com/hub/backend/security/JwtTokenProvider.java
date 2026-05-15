package com.hub.backend.security;

import java.util.Base64;
import java.util.Date;

import javax.crypto.SecretKey;
import org.springframework.stereotype.Component;

import com.hub.backend.exception.CustomException;
import com.hub.backend.exception.ErrorCode;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

	private final JwtProperties props;
	private SecretKey key;
	
	@PostConstruct
	void init() {
		byte[] bytes = Base64.getDecoder().decode(props.getSecret());
		this.key = Keys.hmacShaKeyFor(bytes);
	}
	
	public String createAccessToken(Long userId, String email, String role) {
		Date now = new Date();
		Date exp = new Date(now.getTime() + props.getAccessTokenValidity());
		return Jwts.builder()
				.subject(String.valueOf(userId))
				.claim("email", email)
				.claim("role", role)
				.issuedAt(now)
				.expiration(exp)
				.signWith(key)
				.compact();
	}
	
	public String createRefreshToken(Long userId) {
		Date now = new Date();
		Date exp = new Date(now.getTime() + props.getRefreshTokenValidity());
		return Jwts.builder()
				.subject(String.valueOf(userId))
				.issuedAt(now)
				.expiration(exp)
				.signWith(key)
				.compact();
	}
	
	public Claims parseClaims(String token) {
		try {
			return Jwts.parser()
					.verifyWith(key)
					.build()
					.parseSignedClaims(token)
					.getPayload();
		}catch(ExpiredJwtException e) {
			throw new CustomException(ErrorCode.EXPIRED_TOKEN);
		}catch(JwtException | IllegalArgumentException e) {
			throw new CustomException(ErrorCode.INVALID_TOKEN);
		}
	}
	
	public Long getUserId(String token) {
		return Long.parseLong(parseClaims(token).getSubject());
	}
	
	public boolean validate(String token) {
		try {
			parseClaims(token);
			return true;
		}catch(CustomException e) {
			return false;
		}
	}
	
	public long getRefreshTokenValidity() {
		return props.getRefreshTokenValidity();
	}
}
