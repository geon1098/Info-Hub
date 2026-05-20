package com.hub.backend.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.hub.backend.dto.ImageUploadResponse;
import com.hub.backend.exception.CustomException;
import com.hub.backend.exception.ErrorCode;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class ImageUploadService {

	private static final Set<String> ALLOWED = Set.of(
			"image/png", "image/jpeg", "image/webp", "image/svg+xml"
	);
	private static final long MAX_SIZE = 5L * 1024 * 1024;

	private final String uploadDir;
	private final String publicBase;

	public ImageUploadService(
			@Value("${app.upload.dir}") String uploadDir,
			@Value("${app.upload.public-base}") String publicBase
	) {
		this.uploadDir = uploadDir;
		this.publicBase = publicBase;
	}

	public ImageUploadResponse store(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new CustomException(ErrorCode.FILE_EMPTY);
		}
		if (file.getSize() > MAX_SIZE) {
			throw new CustomException(ErrorCode.FILE_TOO_LARGE);
		}
		String contentType = file.getContentType();
		if (contentType == null || !ALLOWED.contains(contentType)) {
			throw new CustomException(ErrorCode.FILE_UNSUPPORTED_TYPE);
		}

		String ext = switch (contentType) {
			case "image/png" -> ".png";
			case "image/jpeg" -> ".jpg";
			case "image/webp" -> ".webp";
			case "image/svg+xml" -> ".svg";
			default -> ".bin";
		};

		LocalDate today = LocalDate.now();
		String month = "%02d".formatted(today.getMonthValue());
		Path dir = Paths.get(uploadDir, String.valueOf(today.getYear()), month)
				.toAbsolutePath()
				.normalize();
		String name = UUID.randomUUID() + ext;
		Path dst = dir.resolve(name);

		try {
			Files.createDirectories(dir);
			try (InputStream in = file.getInputStream()) {
				Files.copy(in, dst, StandardCopyOption.REPLACE_EXISTING);
			}
		} catch (IOException e) {
			log.error("이미지 저장 실패: dir={}, name={}", dir, name, e);
			throw new CustomException(ErrorCode.FILE_STORE_FAILED);
		}

		String publicUrl = "%s/%d/%s/%s".formatted(publicBase, today.getYear(), month, name);
		return new ImageUploadResponse(publicUrl, 0, 0, file.getSize());
	}
}
