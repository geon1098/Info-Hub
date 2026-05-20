package com.hub.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.hub.backend.entity.CategoryKey;
import com.hub.backend.entity.Info;

public interface InfoRepository extends JpaRepository<Info, Long> {

	@EntityGraph(attributePaths = "author")
	Page<Info> findAllBy(Pageable pageable);

	@EntityGraph(attributePaths = "author")
	Page<Info> findAllByCategory(CategoryKey category, Pageable pageable);

	@EntityGraph(attributePaths = "author")
	@Query("""
		select i from Info i
		where lower(i.title) like lower(concat('%', :keyword, '%'))
		   or lower(i.summary) like lower(concat('%', :keyword, '%'))
		   or exists (
			   select 1 from Info i2 join i2.tags t
			   where i2 = i and lower(t) like lower(concat('%', :keyword, '%'))
		   )
	""")
	Page<Info> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

	@EntityGraph(attributePaths = "author")
	@Query("""
		select i from Info i
		where i.category = :category
		  and (
			lower(i.title)   like lower(concat('%', :keyword, '%'))
			or lower(i.summary) like lower(concat('%', :keyword, '%'))
			or exists (
				select 1 from Info i2 join i2.tags t
				where i2 = i and lower(t) like lower(concat('%', :keyword, '%'))
			)
		  )
	""")
	Page<Info> searchByCategoryAndKeyword(@Param("category") CategoryKey category,
	                                      @Param("keyword") String keyword,
	                                      Pageable pageable);
}
