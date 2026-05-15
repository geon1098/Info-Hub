package com.hub.backend.security;

import java.io.IOException;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hub.backend.dto.ApiResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint{
//인증 실패 / 접근 거부 핸들러
	
	private final ObjectMapper objectMapper;
	
	@Override
	public void commence(HttpServletRequest req, HttpServletResponse res, AuthenticationException e)throws IOException{
		res.setStatus(401);
		res.setContentType("application/json;charset=UTF-8");
		
res.getWriter().write(objectMapper.writeValueAsString(ApiResponse.fail("인증이 필요합니다.")));
	}
}
