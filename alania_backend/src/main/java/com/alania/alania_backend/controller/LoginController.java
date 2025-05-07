package com.alania.alania_backend.controller;

import com.alania.alania_backend.dto.LoginRequest;
import com.alania.alania_backend.dto.VerifyRequest;
import com.alania.alania_backend.dto.ApiResponse;
import com.alania.alania_backend.service.LoginService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/login")
@RequiredArgsConstructor
public class LoginController {

    private final LoginService loginService;

    @PostMapping("/start")
    public ResponseEntity<ApiResponse> login(@RequestBody LoginRequest request) {
        ApiResponse response = loginService.loginUser(request.email());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse> verifyLogin(
            @RequestBody VerifyRequest request,
            HttpServletRequest httpRequest
    ) {
        String userAgent = httpRequest.getHeader("User-Agent");
        String ipAddress = httpRequest.getRemoteAddr();
        ApiResponse response = loginService.verifyLogin(request.email(), request.code(), userAgent, ipAddress);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse> listSessions(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody LoginRequest request) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Token manquant ou invalide."));
        }

        String token = authHeader.substring(7);
        if (!loginService.verifyToken(token).isSuccess()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Token invalide ou expiré."));
        }

        ApiResponse response = loginService.listSessions(request.email());
        return ResponseEntity.ok(response);
    }
}