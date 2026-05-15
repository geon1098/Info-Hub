package com.hub.backend.config;

import java.util.List;
import java.util.Map;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.hub.backend.entity.Category;
import com.hub.backend.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CategoryInitializer implements CommandLineRunner{

	private final CategoryRepository categoryRepository;
	
	private static final List<Map.Entry<String, String>> SEEDS = List.of(
			Map.entry("TREND", "트렌드"),
			Map.entry("DEV", "개발"),
			Map.entry("AI", "AI"),
			Map.entry("FREE", "자유게시판")
	);
	
	@Override
	public void run(String... args) {
		SEEDS.forEach(s -> {
			if(!categoryRepository.existsByCode(s.getKey())) {
				categoryRepository.save(
		Category.builder().code(s.getKey()).label(s.getValue()).build()
						);
			}
		});
	}
}
