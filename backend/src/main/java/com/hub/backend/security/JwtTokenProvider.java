package com.hub.backend.security;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

	private final JwtProperties props;
	private SecretKey key;
	
	
	
}
