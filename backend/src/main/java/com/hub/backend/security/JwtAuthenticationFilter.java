package com.hub.backend.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter{

	private final JwtTokenProvider jwtTokenProvider;
	
	private static final String HEADER = "Authorization";
	private static final String PREFIX = "Bearer ";
	
	@Override
	protected void doFilterInternal(
			HttpServletRequest request,
			HttpServletResponse response,
			FilterChain chain
		)throws ServletException, IOException{
		
		String token = resolve(request);
		if(token != null && jwtTokenProvider.validate(token)) {
			try {
				Claims claims = jwtTokenProvider.parseClaims(token);
				Long userId = Long.parseLong(claims.getSubject());
				String role = claims.get("role", String.class);
				
			UsernamePasswordAuthenticationToken auth = 
				new UsernamePasswordAuthenticationToken(
						userId,
						null,
						List.of(new SimpleGrantedAuthority("ROLE_" + role)));
			SecurityContextHolder.getContext().setAuthentication(auth);
			}catch(Exception e) {
				log.warn("JWT 인증 실패: {}", e.getMessage());
				SecurityContextHolder.clearContext();
			}
		}
		chain.doFilter(request, response);
	}
	
	private String resolve(HttpServletRequest request) {
		String header = request.getHeader(HEADER);
		if(StringUtils.hasText(header) && header.startsWith(PREFIX)) {
			return header.substring(PREFIX.length());
		}
		return null;
	}
}
