package com.alania.alania_backend.service;

import com.alania.alania_backend.dto.ApiResponse;
import com.alania.alania_backend.model.PendingRegistration;
import com.alania.alania_backend.model.RefreshToken;
import com.alania.alania_backend.model.User;
import com.alania.alania_backend.repository.PendingRegistrationRepository;
import com.alania.alania_backend.repository.RefreshTokenRepository;
import com.alania.alania_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class RegisterService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private PendingRegistrationRepository pendingRegistrationRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private AuthUtils authUtils;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public ApiResponse registerUser(String email) {
        // Supprimer toute inscription en attente existante pour cet email
        Optional<PendingRegistration> existingPending = pendingRegistrationRepository.findByEmail(email);
        existingPending.ifPresent(pending -> {
            pendingRegistrationRepository.delete(pending);
            pendingRegistrationRepository.flush(); // Force la suppression en DB
        });

        // Vérifier si l'email est déjà associé à un compte vérifié
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            return ApiResponse.error("Cet email est déjà associé à un compte vérifié.");
        }

        // Générer et sauvegarder un nouveau code de vérification
        String verificationCode = authUtils.generateVerificationCode(6);
        PendingRegistration pending = new PendingRegistration();
        pending.setEmail(email);
        pending.setHashedVerificationCode(passwordEncoder.encode(verificationCode));
        pending.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(10));
        pendingRegistrationRepository.save(pending);

        // Envoyer l'email de vérification
        authUtils.sendVerificationEmail(email, verificationCode, "Vérification de votre compte");
        return ApiResponse.success("Un code de vérification a été envoyé à votre email.");
    }


    @Transactional
    public ApiResponse resendVerificationCode(String email) {
        System.out.println("\n\n\n Preparation d'un nouvel envoi de code \n\n\n");
        try {
            System.out.println("\n 1 - On est dans le try \n");
            // Vérifier si l'email est déjà associé à un compte vérifié
            Optional<User> existingUser = userRepository.findByEmail(email);
            if (existingUser.isPresent()) {
                return ApiResponse.error("Cet email est déjà associé à un compte vérifié.");
            }

            System.out.println("\n 2 - Aucun compte associe a l'email (bon signe) \n");
            System.out.println("\n 3 - Recheche inscription existante \n");
            // Chercher une inscription en attente existante
            Optional<PendingRegistration> optionalPending = pendingRegistrationRepository.findByEmail(email);
            PendingRegistration pending;

            System.out.println("\n 4 - Recherche terminee \n");
            if (optionalPending.isPresent()) {

                System.out.println("\n 5 - Inscription retrouvee \n");
                // Mettre à jour l'inscription existante
                pending = optionalPending.get();
            } else {
                System.out.println("\n6 - Aucune inscription existance : creation \n");
                // Créer une nouvelle inscription si aucune n'existe
                pending = new PendingRegistration();
                pending.setEmail(email);
                System.out.println("\n 7 - Creation terminee \n");
            }
            System.out.println("\n 8 - Debut generation du nouveau code \n");
            // Générer un nouveau code de vérification
            String verificationCode = authUtils.generateVerificationCode(6);
            pending.setHashedVerificationCode(passwordEncoder.encode(verificationCode));
            pending.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(10));
            pendingRegistrationRepository.save(pending);
            System.out.println("\n 9 - Generation et enregistrement termine \n");
            System.out.println("\n 10 - Envoi du code \n");
            authUtils.sendVerificationEmail(email, verificationCode, "Vérification de votre compte");
            System.out.println("\n 11 - Envoie termine \n");
            System.out.println("\n 12 - Sucess de l'operation \n");
            return ApiResponse.success("Un nouveau code de vérification a été envoyé à votre email.");
        } catch (Exception e) {
            System.out.println("\n 13 - Echec de l'operation \n");
            return ApiResponse.error("Erreur lors du renvoi du code: " + e.getMessage());
        }
    }

    @Transactional
    public ApiResponse verifyRegistration(String email, String code, String userAgent, String ipAddress) {
        // Vérifier l'inscription en attente
        Optional<PendingRegistration> optionalPending = pendingRegistrationRepository.findByEmail(email);
        if (!optionalPending.isPresent()) {
            return ApiResponse.error("Aucune inscription en attente trouvée.");
        }

        PendingRegistration pending = optionalPending.get();
        if (pending.getVerificationCodeExpiry().isBefore(LocalDateTime.now())) {
            pendingRegistrationRepository.delete(pending);
            return ApiResponse.error("Code expiré.");
        }
        if (!passwordEncoder.matches(code, pending.getHashedVerificationCode())) {
            return ApiResponse.error("Code incorrect.");
        }

        // Créer l'utilisateur
        User user = userService.createUser(email);
        user.setStatus("online"); // Définir le statut initial
        userRepository.save(user);

        System.out.println("\n\nUtilisateur enregistre avec succes apres verification\n\n");

        // Générer access token et refresh token
        String accessToken = authUtils.generateJwtToken(email);
        String refreshTokenValue = authUtils.generateRefreshToken();

        System.out.println("\n\nTokens genere avec sucess\n\n");

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshTokenValue);
        refreshToken.setUserId(user.getId());
        refreshToken.setCreatedAt(LocalDateTime.now());
        refreshToken.setUserAgent(userAgent);
        refreshToken.setIpAddress(ipAddress);
        refreshTokenRepository.save(refreshToken);

        System.out.println("\n\nAutre Operation sur les tokens effectue \n tokens Sauvegarde\n\n");

        // Supprimer l'inscription en attente
        pendingRegistrationRepository.delete(pending);

        System.out.println("\n\nInscription finalisee\n\n");
        // Retourner les deux tokens
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        tokens.put("refreshToken", refreshTokenValue);
        return ApiResponse.success("Inscription réussie.", tokens);
    }
}