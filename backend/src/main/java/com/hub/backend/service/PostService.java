package com.hub.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hub.backend.dto.PageResponse;
import com.hub.backend.dto.PostCreateRequest;
import com.hub.backend.dto.PostResponse;
import com.hub.backend.dto.PostUpdateRequest;
import com.hub.backend.entity.Category;
import com.hub.backend.entity.Post;
import com.hub.backend.entity.Role;
import com.hub.backend.entity.User;
import com.hub.backend.exception.CustomException;
import com.hub.backend.exception.ErrorCode;
import com.hub.backend.repository.CategoryRepository;
import com.hub.backend.repository.PostRepository;
import com.hub.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {
	
	private final PostRepository postRepository;
	private final CategoryRepository categoryRepository;
	private final UserRepository userRepository;
	
	@Transactional
	public PostResponse createPost(Long userId, PostCreateRequest request) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new
			CustomException(ErrorCode.USER_NOT_FOUND));
		
		Category category = 
			categoryRepository.findByCode(request.getCategory())
				.orElseThrow(() -> new
			CustomException(ErrorCode.CATEGORY_NOT_FOUND));
		
		Post post = Post.builder()
				.title(request.getTitle())
				.content(request.getContent())
				.author(user)
				.category(category)
				.build();
		return PostResponse.from(postRepository.save(post));
	}

	public PageResponse<PostResponse> findPosts(String categoryCode, int page, int size){
		PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
		Page<Post> result = (categoryCode == null || categoryCode.isBlank()) ? postRepository.findAllBy(pageable) : postRepository.findAllByCategoryCode(categoryCode, pageable);
		return PageResponse.of(result, PostResponse::from);
	}
	
	@Transactional
	public PostResponse findPost(Long id) {
		Post post = postRepository.findById(id)
				.orElseThrow(() -> new
	CustomException(ErrorCode.POST_NOT_FOUND));
		post.increaseViewCount();
		return PostResponse.from(post);
	}
	
	
	@Transactional
	public PostResponse updatePost(Long userId, Long postId, PostUpdateRequest request) {
		Post post = postRepository.findById(postId)
				.orElseThrow(() -> new
	CustomException(ErrorCode.POST_NOT_FOUND));
		
		if(!post.isAuthor(userId)) {
			throw new CustomException(ErrorCode.POST_FORBIDDEN);
		}
		Category category =
	categoryRepository.findByCode(request.getCategory())
				.orElseThrow(() -> new
	CustomException(ErrorCode.CATEGORY_NOT_FOUND));
		
		post.update(request.getTitle(), request.getContent(), category);
		return PostResponse.from(post);
	}
	
	
	@Transactional
	public void deletePost(Long userId, String role, Long postId) {
		Post post = postRepository.findById(postId)
				.orElseThrow(() -> new
	CustomException(ErrorCode.POST_NOT_FOUND));
		
		boolean isAdmin = Role.ADMIN.name().equals(role);
		if(!isAdmin && !post.isAuthor(userId)) {
			throw new CustomException(ErrorCode.POST_FORBIDDEN);
		}
		
		postRepository.delete(post);
	}
	
}
