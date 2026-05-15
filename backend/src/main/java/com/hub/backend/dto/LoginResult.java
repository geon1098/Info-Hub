package com.hub.backend.dto;

import com.hub.backend.entity.User;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResult {

	private String accessToken;
	private String refreshToken;
	private User user;
}
// LoginResult는 Service가 컨트롤러에 한꺼번에 넘기는 내부 DTO. 
// 컨트롤러가 refreshToken은 쿠키로,
// accessToken과 user는 본문으로 분리해서 응답한다.