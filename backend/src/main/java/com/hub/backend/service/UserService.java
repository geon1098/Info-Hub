package com.hub.backend.service;

import com.hub.backend.dto.SignupRequest;
import com.hub.backend.dto.UserResponse;
import com.hub.backend.entity.Role;
import com.hub.backend.entity.User;
import com.hub.backend.exception.CustomException;
import com.hub.backend.exception.ErrorCode;
import com.hub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
	
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	
	@Transactional
	public UserResponse signup(SignupRequest request) {
		if(userRepository.existsByEmail(request.getEmail())) {
			throw new CustomException(ErrorCode.DUPLICATE_EMAIL);
		}
		if(userRepository.existsByNickname(request.getNickname())) {
			throw new CustomException(ErrorCode.DUPLICATE_NICKNAME);
		}
		
		User user = User.builder()
				.email(request.getEmail())
				.password(passwordEncoder.encode(request.getPassword()))
				.nickname(request.getNickname())
				.role(Role.USER)
				.build();
		
		return UserResponse.from(userRepository.save(user));
	}
	
	public UserResponse findUser(Long id) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new 
			CustomException(ErrorCode.USER_NOT_FOUND));
		return UserResponse.from(user);
	}

}
