package com.hub.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hub.backend.dto.UserResponse;
import com.hub.backend.entity.Role;
import com.hub.backend.entity.User;
import com.hub.backend.exception.CustomException;
import com.hub.backend.exception.ErrorCode;
import com.hub.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

	private final UserRepository userRepository;
	
    public List<UserResponse> findAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }
	
	@Transactional
	public UserResponse toggleRole(Long id) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new
	CustomException(ErrorCode.USER_NOT_FOUND));
		if(user.getRole() == Role.ADMIN) {
			user.demoteToUser();
		}else {
			user.promoteToAdmin();
		}
		return UserResponse.from(user);
	}
	
	@Transactional
	public void deleteUser(Long id) {
		if(!userRepository.existsById(id)) {
			throw new CustomException(ErrorCode.USER_NOT_FOUND);
		}
		userRepository.deleteById(id);
	}
}
