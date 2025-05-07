package com.alania.alania_backend.controller;

import com.alania.alania_backend.dto.ApiResponse;
import com.alania.alania_backend.dto.LogoutRequest;
import com.alania.alania_backend.service.LoginService;
import com.alania.alania_backend.service.AuthUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/logout")
@RequiredArgsConstructor
public class LogoutController {

    private final LoginService loginService;
    private final AuthUtils authUtils;

    @PostMapping
    public ResponseEntity<ApiResponse> logout(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody LogoutRequest request) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Token manquant ou invalide."));
        }

        String token = authHeader.substring(7);
        if (!authUtils.verifyJwtToken(token)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Token invalide ou expiré."));
        }

        String email = authUtils.getEmailFromJwtToken(token);
        ApiResponse response = loginService.logout(email, request.refreshToken());
        return ResponseEntity.ok(response);
    }
}