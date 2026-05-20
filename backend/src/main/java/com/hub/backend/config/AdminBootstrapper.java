package com.hub.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.hub.backend.entity.User;
import com.hub.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrapper implements CommandLineRunner{

	private final UserRepository userRepository;
	
	@Value("${admin.bootstrap.email:}")
	private String bootstrapEmail;
	
	@Override
	@Transactional
	public void run(String... args) {
		if(bootstrapEmail == null || bootstrapEmail.isBlank()) return;
		
userRepository.findByEmail(bootstrapEmail).ifPresent(this::promoteIfNeeded);
	}
	
	private void promoteIfNeeded(User user) {
		if(!"ADMIN".equals(user.getRole().name())) {
			user.promoteToAdmin();
			log.info("사용자 {} 를 ADMIN으로 승격", user.getEmail());
		}
	}
}
