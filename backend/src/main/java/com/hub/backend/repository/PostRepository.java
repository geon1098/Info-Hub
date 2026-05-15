package com.hub.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.hub.backend.entity.Post;

public interface PostRepository extends JpaRepository<Post, Long>{

	@EntityGraph(attributePaths = {"author", "category"})
	Page<Post> findAllByCategoryCode(String code, Pageable pageable);

	@EntityGraph(attributePaths = {"author", "category"})
	Page<Post> findAllBy(Pageable pageable);
}
//findAllBy(Pageable)은 Spring Data JPA 키워드 규약(findAllBy)으로 만든
//fetch join용 트릭이다. @EntityGraph만으로 author/category를 한 번에 가져온다.