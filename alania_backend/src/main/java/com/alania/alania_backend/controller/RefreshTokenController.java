package com.alania.alania_backend.controller;

import com.alania.alania_backend.dto.RefreshTokenRequest;
import com.alania.alania_backend.dto.ApiResponse;
import com.alania.alania_backend.service.LoginService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/refresh-token")
@RequiredArgsConstructor
public class RefreshTokenController {

    private final LoginService loginService;

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        ApiResponse response = loginService.refreshAccessToken(request.refreshToken());
        return ResponseEntity.ok(response);
    }
}