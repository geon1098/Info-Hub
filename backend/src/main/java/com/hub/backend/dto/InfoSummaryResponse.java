package com.hub.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.hub.backend.entity.CategoryKey;
import com.hub.backend.entity.Info;

public record InfoSummaryResponse(
		Long id,
		String title,
		String imageUrl,
		List<String> tags,
		CategoryKey category,
		String summary,
		String author,
		Long authorId,
		LocalDateTime createdAt,
		LocalDateTime updatedAt
) {
	public static InfoSummaryResponse from(Info i) {
		return new InfoSummaryResponse(
				i.getId(), i.getTitle(), i.getImageUrl(),
				List.copyOf(i.getTags()), i.getCategory(),
				i.getSummary(),
				i.getAuthor().getNickname(), i.getAuthor().getId(),
				i.getCreatedAt(), i.getUpdatedAt()
		);
	}
}
