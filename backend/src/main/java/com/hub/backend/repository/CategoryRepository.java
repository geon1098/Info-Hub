package com.hub.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hub.backend.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long>{

	Optional<Category> findByCode(String code);
	boolean existsByCode(String code);
}
