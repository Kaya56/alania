package com.alania.alania_backend.controller;

import com.alania.alania_backend.dto.TokenRequest;
import com.alania.alania_backend.dto.ApiResponse;
import com.alania.alania_backend.service.LoginService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/access-token")
@RequiredArgsConstructor
public class AccessTokenController {

    private final LoginService loginService;

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse> verifyToken(@RequestHeader("Authorization") String authorizationHeader) {
        String token = authorizationHeader.replace("Bearer ", "");
        ApiResponse response = loginService.verifyToken(token);
        return ResponseEntity.ok(response);
    }
}