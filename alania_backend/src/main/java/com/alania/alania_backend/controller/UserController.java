package com.alania.alania_backend.controller;

import com.alania.alania_backend.dto.ApiResponse;
import com.alania.alania_backend.dto.UserExistsDTO;
import com.alania.alania_backend.dto.UserInfoDTO;
import com.alania.alania_backend.dto.UserPresenceDTO;
import com.alania.alania_backend.model.User;
import com.alania.alania_backend.repository.UserRepository;
import com.alania.alania_backend.service.AuthUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final AuthUtils authUtils;

    // Endpoint pour récupérer le profil de l'utilisateur connecté
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getUserProfile(
            @RequestHeader("Authorization") String authHeader) {
        // Vérifier la présence et la validité du token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Token manquant ou invalide."));
        }

        String token = authHeader.substring(7);
        if (!authUtils.verifyJwtToken(token)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Token invalide ou expiré."));
        }

        // Extraire l'email depuis le token
        String email = authUtils.getEmailFromJwtToken(token);

        // Chercher l'utilisateur dans la base de données
        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(ApiResponse.success("Profil utilisateur récupéré.", user)))
                .orElseGet(() -> ResponseEntity.status(404).body(ApiResponse.error("Utilisateur non trouvé.")));
    }

    // Endpoint pour vérifier si un utilisateur existe dans la base de données
    @GetMapping("/exists/{email}")
    public ResponseEntity<ApiResponse> checkUserExists(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String email) {
        // Vérifier la présence et la validité du token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Token manquant ou invalide."));
        }

        String token = authHeader.substring(7);
        if (!authUtils.verifyJwtToken(token)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Token invalide ou expiré."));
        }

        // Vérifier si l'utilisateur existe
        boolean exists = userRepository.findByEmail(email).isPresent();
        return ResponseEntity.ok(ApiResponse.success(
                exists ? "Utilisateur trouvé dans la base de données." : "Utilisateur non trouvé.",
                new UserExistsDTO(email, exists)
        ));
    }

    // Endpoint pour vérifier si un utilisateur est en ligne
    @GetMapping("/presence/{email}")
    public ResponseEntity<ApiResponse> checkUserPresence(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String email) {
        // Vérifier la présence et la validité du token
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Token manquant ou invalide."));
        }

        String token = authHeader.substring(7);
        if (!authUtils.verifyJwtToken(token)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Token invalide ou expiré."));
        }

        // Chercher l'utilisateur par email
        return userRepository.findByEmail(email)
                .map(user -> {
                    boolean isOnline = "online".equalsIgnoreCase(user.getStatus());
                    return ResponseEntity.ok(ApiResponse.success(
                            isOnline ? "Utilisateur en ligne." : "Utilisateur hors ligne.",
                            new UserPresenceDTO(email, isOnline)
                    ));
                })
                .orElseGet(() -> ResponseEntity.status(404).body(ApiResponse.error("Utilisateur non trouvé.")));
    }

    @GetMapping("/info/{email}")
    public ResponseEntity<ApiResponse> getUserInfo(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable String email) {

        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(ApiResponse.success(
                        "Informations utilisateur récupérées.",
                        new UserInfoDTO(user.getEmail(), user.getUsername())
                )))
                .orElseGet(() -> ResponseEntity.status(404).body(ApiResponse.error("Utilisateur non trouvé.")));
    }

}