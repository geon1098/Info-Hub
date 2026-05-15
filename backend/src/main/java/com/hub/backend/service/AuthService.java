package com.hub.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hub.backend.dto.LoginRequest;
import com.hub.backend.dto.LoginResult;
import com.hub.backend.entity.User;
import com.hub.backend.exception.CustomException;
import com.hub.backend.exception.ErrorCode;
import com.hub.backend.repository.UserRepository;
import com.hub.backend.security.JwtTokenProvider;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtTokenProvider jwtTokenProvider;
	
	public LoginResult login(LoginRequest request) {
		User user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(() -> new
			CustomException(ErrorCode.USER_NOT_FOUND));
		
		if(!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new CustomException(ErrorCode.INVALID_PASSWORD);
		}
		
		String access = jwtTokenProvider.createAccessToken(
				user.getId(), user.getEmail(), user.getRole().name());
		String refresh =
	jwtTokenProvider.createRefreshToken(user.getId());
		
		return new LoginResult(access, refresh, user);
	}
}
