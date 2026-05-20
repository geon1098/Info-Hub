package com.hub.backend.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.hub.backend.dto.InfoCreateRequest;
import com.hub.backend.dto.InfoUpdateRequest;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "info", indexes = {
	@Index(name = "idx_info_category_created", columnList = "category, created_at"),
	@Index(name = "idx_info_author", columnList = "author_id")
})
public class Info {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false, length = 200)
	private String title;
	
	@Column(name = "image_url", nullable = false, length = 500)
	private String imageUrl;
	
	@Column(length = 300)
	private String summary;
	
	@Lob
	@Column(nullable = false)
	private String body;
	
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private CategoryKey category;
	
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "author_id")
	private User author;
	
	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;
	
	@ElementCollection(fetch = FetchType.LAZY)
	@CollectionTable(name = "info_tag",
			joinColumns = @JoinColumn(name = "info_id"),
			indexes = @Index(name = "idx_info_tag_tag", columnList = "tag"))
	@Column(name = "tag", length = 40, nullable = false)
	private List<String> tags = new ArrayList<>();
	
	public static Info create(User author, InfoCreateRequest req) {
		Info i = new Info();
		i.author = author;
		i.title = req.title();
		i.imageUrl = req.imageUrl();
		i.summary = req.summary();
		i.body = req.body();
		i.category = req.category();
		i.tags = req.tags() == null ? new ArrayList<>() : new ArrayList<>(req.tags());
		return i;
	}
	
	public void update(InfoUpdateRequest req) {
		this.title = req.title();
		this.imageUrl = req.imageUrl();
		this.summary = req.summary();
		this.body = req.body();
		this.category = req.category();
		this.tags.clear();
		if(req.tags() != null)
			this.tags.addAll(req.tags());
		
	}
}
