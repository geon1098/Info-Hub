package com.hub.backend.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	@Value("${app.upload.dir}")
	private String uploadDir;

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		Path root = Paths.get(uploadDir).toAbsolutePath().normalize();
		String location = root.toUri().toString();
		registry.addResourceHandler("/images/**")
				.addResourceLocations(location)
				.setCachePeriod(3600);
	}
}
