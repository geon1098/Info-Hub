package com.hub.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.hub.backend.entity.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long>{

	@EntityGraph(attributePaths = "author")
	List<Comment> findAllByPostIdOrderByCreatedAtAsc(Long postId);

	long countByPostId(Long postId);
}
