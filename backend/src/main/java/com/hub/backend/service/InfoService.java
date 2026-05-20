package com.hub.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hub.backend.dto.InfoCreateRequest;
import com.hub.backend.dto.InfoDetailResponse;
import com.hub.backend.dto.InfoSummaryResponse;
import com.hub.backend.dto.InfoUpdateRequest;
import com.hub.backend.dto.PageResponse;
import com.hub.backend.entity.CategoryKey;
import com.hub.backend.entity.Info;
import com.hub.backend.entity.Role;
import com.hub.backend.entity.User;
import com.hub.backend.exception.CustomException;
import com.hub.backend.exception.ErrorCode;
import com.hub.backend.repository.InfoRepository;
import com.hub.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InfoService {

	private final InfoRepository infoRepository;
	private final UserRepository userRepository;

	public PageResponse<InfoSummaryResponse> list(String category, String keyword, int page, int size) {
		CategoryKey categoryKey = parseCategory(category);
		String kw = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
		PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

		Page<Info> result;
		if (kw == null && categoryKey == null) {
			result = infoRepository.findAllBy(pageable);
		} else if (kw == null) {
			result = infoRepository.findAllByCategory(categoryKey, pageable);
		} else if (categoryKey == null) {
			result = infoRepository.searchByKeyword(kw, pageable);
		} else {
			result = infoRepository.searchByCategoryAndKeyword(categoryKey, kw, pageable);
		}
		return PageResponse.of(result, InfoSummaryResponse::from);
	}

	public InfoDetailResponse get(Long id) {
		Info info = infoRepository.findById(id)
				.orElseThrow(() -> new CustomException(ErrorCode.INFO_NOT_FOUND));
		return InfoDetailResponse.from(info);
	}

	@Transactional
	public InfoDetailResponse create(Long userId, InfoCreateRequest request) {
		User author = userRepository.findById(userId)
				.orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
		Info info = Info.create(author, request);
		Info saved = infoRepository.save(info);
		return InfoDetailResponse.from(saved);
	}

	@Transactional
	public InfoDetailResponse update(Long userId, String role, Long id, InfoUpdateRequest request) {
		Info info = infoRepository.findById(id)
				.orElseThrow(() -> new CustomException(ErrorCode.INFO_NOT_FOUND));
		assertWritable(info, userId, role);
		info.update(request);
		return InfoDetailResponse.from(info);
	}

	@Transactional
	public void delete(Long userId, String role, Long id) {
		Info info = infoRepository.findById(id)
				.orElseThrow(() -> new CustomException(ErrorCode.INFO_NOT_FOUND));
		assertWritable(info, userId, role);
		infoRepository.delete(info);
	}

	private void assertWritable(Info info, Long userId, String role) {
		boolean isAdmin = Role.ADMIN.name().equals(role);
		boolean isOwner = info.getAuthor().getId().equals(userId);
		if (!isAdmin && !isOwner) {
			throw new CustomException(ErrorCode.INFO_FORBIDDEN);
		}
	}

	private CategoryKey parseCategory(String code) {
		if (code == null || code.isBlank()) return null;
		try {
			return CategoryKey.valueOf(code);
		} catch (IllegalArgumentException e) {
			throw new CustomException(ErrorCode.CATEGORY_NOT_FOUND);
		}
	}
}
