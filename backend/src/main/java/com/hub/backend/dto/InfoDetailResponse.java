package com.hub.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.hub.backend.entity.CategoryKey;
import com.hub.backend.entity.Info;

public record InfoDetailResponse(
	    Long id,
	    String title,
	    String imageUrl,
	    List<String> tags,
	    CategoryKey category,
	    String summary,
	    String body,
	    String author,
	    Long authorId,
	    LocalDateTime createdAt,
	    LocalDateTime updatedAt
	) {
	    public static InfoDetailResponse from(Info i) {
	        return new InfoDetailResponse(
	            i.getId(), i.getTitle(), i.getImageUrl(),
	            List.copyOf(i.getTags()), i.getCategory(),
	            i.getSummary(), i.getBody(),
	            i.getAuthor().getNickname(), i.getAuthor().getId(),
	            i.getCreatedAt(), i.getUpdatedAt()
	        );
	    }
	}