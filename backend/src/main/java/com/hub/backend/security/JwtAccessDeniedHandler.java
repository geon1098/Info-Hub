package com.hub.backend.security;

import java.io.IOException;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hub.backend.dto.ApiResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAccessDeniedHandler implements AccessDeniedHandler{
//인증 실패 / 접근 거부 핸들러
	
	private final ObjectMapper objectMapper;
	
	@Override
	public void handle(HttpServletRequest req,
					   HttpServletResponse res,
					   AccessDeniedException e) throws IOException{
		res.setStatus(403);
		res.setContentType("application/json;charset=UTF-8");
	res.getWriter().write(objectMapper.writeValueAsString(ApiResponse.fail("접근 권한이 없습니다.")));
	}
	
}
