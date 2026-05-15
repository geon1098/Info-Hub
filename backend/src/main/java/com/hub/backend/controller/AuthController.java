package com.hub.backend.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hub.backend.dto.ApiResponse;
import com.hub.backend.dto.LoginRequest;
import com.hub.backend.dto.LoginResponse;
import com.hub.backend.dto.LoginResult;
import com.hub.backend.dto.SignupRequest;
import com.hub.backend.dto.UserResponse;
import com.hub.backend.service.AuthService;
import com.hub.backend.service.UserService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;
	private final UserService userService;
	
	@PostMapping("/signup")
	public ApiResponse<UserResponse> signup(@Valid @RequestBody SignupRequest request){
		return ApiResponse.ok("회원가입이 완료되었습니다.", userService.signup(request));
	}
	
	@PostMapping("/login")
	public ApiResponse<LoginResponse> login(
			@Valid @RequestBody LoginRequest request,
			HttpServletResponse response){
		LoginResult result = authService.login(request);
		
		Cookie cookie = new Cookie("refreshToken",
				result.getRefreshToken());
		cookie.setHttpOnly(true);
		cookie.setSecure(false); // 운영에서는 true
		cookie.setPath("/");
		cookie.setMaxAge(7 * 24 * 60 * 60);
		response.addCookie(cookie);
		
		return ApiResponse.ok("로그인에 성공했습니다.",
				LoginResponse.of(result.getAccessToken(),
			UserResponse.from(result.getUser())));
	}
	
	
}
