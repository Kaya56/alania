package com.alania.alania_backend.controller;

import com.alania.alania_backend.dto.RegisterRequest;
import com.alania.alania_backend.dto.VerifyRequest;
import com.alania.alania_backend.dto.ApiResponse;
import com.alania.alania_backend.service.RegisterService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/register")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegisterService registerService;

    @PostMapping("/start")
    public ResponseEntity<ApiResponse> register(@RequestBody RegisterRequest request) {
        ApiResponse response = registerService.registerUser(request.email());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend")
    public ResponseEntity<ApiResponse> resendVerificationCode(@RequestBody RegisterRequest request) {
        ApiResponse response = registerService.resendVerificationCode(request.email());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse> verifyRegistration(
            @RequestBody VerifyRequest request,
            HttpServletRequest httpRequest) {
        String userAgent = httpRequest.getHeader("User-Agent");
        String ipAddress = httpRequest.getRemoteAddr();
        ApiResponse response = registerService.verifyRegistration(request.email(), request.code(), userAgent, ipAddress);
        return ResponseEntity.ok(response);
    }
}