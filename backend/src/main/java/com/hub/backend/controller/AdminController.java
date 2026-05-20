package com.hub.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hub.backend.dto.ApiResponse;
import com.hub.backend.dto.UserResponse;
import com.hub.backend.service.AdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

	private final AdminService adminService;
	
	@GetMapping("/users")
	public ApiResponse<List<UserResponse>> users(){
		return ApiResponse.ok(adminService.findAllUsers());
	}
	
	@PatchMapping("/users/{id}/role")
	public ApiResponse<UserResponse> toggleRole(
			@PathVariable("id") Long id){
		return ApiResponse.ok("권한이 변경되었습니다.",
	adminService.toggleRole(id));
	}
	
	@DeleteMapping("/users/{id}")
	public ApiResponse<Void> deleteUser(@PathVariable("id") Long id){
		adminService.deleteUser(id);
		return ApiResponse.ok("사용자가 삭제되었습니다만?",null);
	}
	
}
