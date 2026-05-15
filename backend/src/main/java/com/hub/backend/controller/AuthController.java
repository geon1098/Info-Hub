package com.hub.backend.controller;

import java.util.Arrays;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
import com.hub.backend.exception.CustomException;
import com.hub.backend.exception.ErrorCode;
import com.hub.backend.service.AuthService;
import com.hub.backend.service.UserService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
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

	@PostMapping("/reissue")
	public ApiResponse<LoginResponse> reissue(HttpServletRequest request) {
		String refreshToken = readCookie(request, "refreshToken");
		if (refreshToken == null) {
			throw new CustomException(ErrorCode.INVALID_TOKEN);
		}
		String newAccess = authService.reissue(refreshToken);
		return ApiResponse.ok("토큰이 재발급되었습니다.",
				new LoginResponse(newAccess, "Bearer", null));
	}

	@PostMapping("/logout")
	public ApiResponse<Void> logout(
			@AuthenticationPrincipal Long userId,
			HttpServletResponse response) {
		if (userId != null) authService.logout(userId);

		Cookie cookie = new Cookie("refreshToken", null);
		cookie.setHttpOnly(true);
		cookie.setPath("/");
		cookie.setMaxAge(0);
		response.addCookie(cookie);

		return ApiResponse.ok("로그아웃되었습니다.", null);
	}

	private String readCookie(HttpServletRequest request, String name) {
		if (request.getCookies() == null) return null;
		return Arrays.stream(request.getCookies())
				.filter(c -> name.equals(c.getName()))
				.map(Cookie::getValue)
				.findFirst()
				.orElse(null);
	}
}
