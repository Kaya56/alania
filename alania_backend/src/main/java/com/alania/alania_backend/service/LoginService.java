package com.alania.alania_backend.service;

import com.alania.alania_backend.dto.ApiResponse;
import com.alania.alania_backend.model.User;
import com.alania.alania_backend.model.RefreshToken;
import com.alania.alania_backend.model.VerificationToken;
import com.alania.alania_backend.model.AccessToken;
import com.alania.alania_backend.repository.UserRepository;
import com.alania.alania_backend.repository.VerificationTokenRepository;
import com.alania.alania_backend.repository.RefreshTokenRepository;
import com.alania.alania_backend.repository.AccessTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class LoginService {

    private static final Logger logger = LoggerFactory.getLogger(LoginService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VerificationTokenRepository verificationTokenRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private AccessTokenRepository accessTokenRepository;

    @Autowired
    private AuthUtils authUtils;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public ApiResponse loginUser(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (!optionalUser.isPresent()) {
            logger.warn("loginUser: Utilisateur non trouvé pour email: {}", email);
            return ApiResponse.error("Utilisateur non trouvé.");
        }

        User user = optionalUser.get();
        String verificationCode = authUtils.generateVerificationCode(6);

        // Vérifier s'il existe déjà un token pour cet utilisateur
        Optional<VerificationToken> optionalToken = verificationTokenRepository.findByUserId(user.getId());
        VerificationToken token;

        if (optionalToken.isPresent()) {
            // Mettre à jour le token existant
            token = optionalToken.get();
            token.setHashedVerificationCode(passwordEncoder.encode(verificationCode));
            token.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(10));
        } else {
            // Créer un nouveau token
            token = new VerificationToken();
            token.setUserId(user.getId());
            token.setHashedVerificationCode(passwordEncoder.encode(verificationCode));
            token.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(10));
        }

        verificationTokenRepository.save(token);
        logger.info("loginUser: Code de vérification généré pour email: {}", email);

        authUtils.sendVerificationEmail(email, verificationCode, "Vérification de votre connexion");
        return ApiResponse.success("Un code de vérification a été envoyé à votre email.");
    }

    @Transactional
    public ApiResponse verifyLogin(String email, String code, String userAgent, String ipAddress) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (!optionalUser.isPresent()) {
            logger.warn("verifyLogin: Utilisateur non trouvé pour email: {}", email);
            return ApiResponse.error("Utilisateur non trouvé.");
        }

        User user = optionalUser.get();
        Optional<VerificationToken> optionalToken = verificationTokenRepository.findByUserId(user.getId());
        if (!optionalToken.isPresent()) {
            logger.warn("verifyLogin: Aucun code de vérification en attente pour email: {}", email);
            return ApiResponse.error("Aucun code de vérification en attente.");
        }

        VerificationToken token = optionalToken.get();
        if (token.getVerificationCodeExpiry().isBefore(LocalDateTime.now())) {
            verificationTokenRepository.delete(token);
            logger.warn("verifyLogin: Code expiré pour email: {}", email);
            return ApiResponse.error("Code expiré.");
        }
        if (!passwordEncoder.matches(code, token.getHashedVerificationCode())) {
            logger.warn("verifyLogin: Code incorrect pour email: {}", email);
            return ApiResponse.error("Code incorrect.");
        }

        // Générer access token et refresh token
        String accessTokenValue = authUtils.generateJwtToken(email);
        String refreshTokenValue = authUtils.generateRefreshToken();

        try {
            // Supprimer l'ancien access token s'il existe
            accessTokenRepository.findByUserId(user.getId()).ifPresent(accessToken -> {
                logger.info("verifyLogin: Suppression de l'ancien access token pour userId: {}", user.getId());
                accessTokenRepository.delete(accessToken);
            });

            // Sauvegarder le nouvel access token
            AccessToken accessToken = new AccessToken();
            accessToken.setToken(accessTokenValue);
            accessToken.setUserId(user.getId());
            accessToken.setCreatedAt(LocalDateTime.now());
            accessToken.setExpiry(LocalDateTime.now().plusHours(24));
            accessToken.setUserAgent(userAgent);
            accessToken.setIpAddress(ipAddress);
            accessTokenRepository.save(accessToken);
            logger.info("verifyLogin: Nouvel access token sauvegardé pour email: {}", email);

            // Supprimer l'ancien refresh token s'il existe
            refreshTokenRepository.findByUserId(user.getId()).ifPresent(refreshToken -> {
                logger.info("verifyLogin: Suppression de l'ancien refresh token pour userId: {}", user.getId());
                refreshTokenRepository.delete(refreshToken);
            });

            // Sauvegarder le nouveau refresh token
            RefreshToken refreshToken = new RefreshToken();
            refreshToken.setToken(refreshTokenValue);
            refreshToken.setUserId(user.getId());
            refreshToken.setCreatedAt(LocalDateTime.now());
            refreshToken.setUserAgent(userAgent);
            refreshToken.setIpAddress(ipAddress);
            refreshTokenRepository.save(refreshToken);
            logger.info("verifyLogin: Nouveau refresh token sauvegardé pour email: {}", email);
        } catch (Exception e) {
            logger.error("verifyLogin: Erreur lors de la sauvegarde des tokens pour email: {}, erreur: {}", email, e.getMessage());
            return ApiResponse.error("Erreur lors de la création de la session.");
        }

        user.setStatus("online");
        userRepository.save(user);
        logger.info("verifyLogin: Statut utilisateur mis à jour à 'online' pour email: {}", email);

        verificationTokenRepository.delete(token);

        // Retourner les deux tokens
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessTokenValue);
        tokens.put("refreshToken", refreshTokenValue);
        return ApiResponse.success("Connexion réussie.", tokens);
    }

    public ApiResponse verifyToken(String token) {
        Optional<AccessToken> optionalAccessToken = accessTokenRepository.findByToken(token);
        if (!optionalAccessToken.isPresent()) {
            logger.warn("verifyToken: Token non trouvé dans la base: {}", token);
            return ApiResponse.error("Token invalide.");
        }

        AccessToken accessToken = optionalAccessToken.get();
        if (accessToken.getExpiry().isBefore(LocalDateTime.now())) {
            accessTokenRepository.delete(accessToken);
            logger.warn("verifyToken: Token expiré pour userId: {}", accessToken.getUserId());
            return ApiResponse.error("Token expiré.");
        }

        boolean isJwtValid = authUtils.verifyJwtToken(token);
        if (!isJwtValid) {
            logger.warn("verifyToken: JWT invalide pour token: {}", token);
            return ApiResponse.error("Token invalide ou expiré.");
        }

        logger.info("verifyToken: Token valide pour userId: {}", accessToken.getUserId());
        return ApiResponse.success("Token valide.");
    }

    @Transactional
    public ApiResponse refreshAccessToken(String refreshTokenValue) {
        Optional<RefreshToken> optionalRefreshToken = refreshTokenRepository.findByToken(refreshTokenValue);
        if (!optionalRefreshToken.isPresent()) {
            logger.warn("refreshAccessToken: Refresh token invalide: {}", refreshTokenValue);
            return ApiResponse.error("Refresh token invalide.");
        }

        RefreshToken refreshToken = optionalRefreshToken.get();
        Optional<User> optionalUser = userRepository.findById(refreshToken.getUserId());
        if (!optionalUser.isPresent()) {
            logger.warn("refreshAccessToken: Utilisateur non trouvé pour userId: {}", refreshToken.getUserId());
            return ApiResponse.error("Utilisateur non trouvé.");
        }

        User user = optionalUser.get();
        String newAccessTokenValue = authUtils.generateJwtToken(user.getEmail());

        try {
            // Supprimer l'ancien access token s'il existe
            accessTokenRepository.findByUserId(user.getId()).ifPresent(accessToken -> {
                logger.info("refreshAccessToken: Suppression de l'ancien access token pour userId: {}", user.getId());
                accessTokenRepository.delete(accessToken);
            });

            // Sauvegarder le nouvel access token
            AccessToken accessToken = new AccessToken();
            accessToken.setToken(newAccessTokenValue);
            accessToken.setUserId(user.getId());
            accessToken.setCreatedAt(LocalDateTime.now());
            accessToken.setExpiry(LocalDateTime.now().plusHours(24));
            accessToken.setUserAgent(refreshToken.getUserAgent());
            accessToken.setIpAddress(refreshToken.getIpAddress());
            accessTokenRepository.save(accessToken);
            logger.info("refreshAccessToken: Nouvel access token sauvegardé pour email: {}", user.getEmail());
        } catch (Exception e) {
            logger.error("refreshAccessToken: Erreur lors de la sauvegarde du nouvel access token pour email: {}, erreur: {}", user.getEmail(), e.getMessage());
            return ApiResponse.error("Erreur lors du renouvellement du token.");
        }

        user.setStatus("online");
        userRepository.save(user);
        logger.info("refreshAccessToken: Statut utilisateur mis à jour à 'online' pour email: {}", user.getEmail());

        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", newAccessTokenValue);
        tokens.put("refreshToken", refreshTokenValue);
        return ApiResponse.success("Access token renouvelé.", tokens);
    }

    @Transactional
    public ApiResponse logout(String email, String refreshTokenValue) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (!optionalUser.isPresent()) {
            logger.warn("logout: Utilisateur non trouvé pour email: {}", email);
            return ApiResponse.error("Utilisateur non trouvé.");
        }

        User user = optionalUser.get();
        Optional<RefreshToken> optionalRefreshToken = refreshTokenRepository.findByToken(refreshTokenValue);
        if (optionalRefreshToken.isPresent() && optionalRefreshToken.get().getUserId().equals(user.getId())) {
            logger.info("logout: Suppression du refresh token pour email: {}", email);
            refreshTokenRepository.delete(optionalRefreshToken.get());
            // Supprimer l'access token associé à l'utilisateur
            accessTokenRepository.findByUserId(user.getId()).ifPresent(accessToken -> {
                logger.info("logout: Suppression de l'access token pour userId: {}", user.getId());
                accessTokenRepository.delete(accessToken);
            });
        } else {
            logger.warn("logout: Refresh token invalide pour email: {}", email);
            return ApiResponse.error("Refresh token invalide.");
        }

        boolean hasOtherTokens = refreshTokenRepository.findAllByUserId(user.getId()).stream()
                .anyMatch(token -> !token.getToken().equals(refreshTokenValue));
        if (!hasOtherTokens) {
            user.setStatus("offline");
            userRepository.save(user);
            logger.info("logout: Statut utilisateur mis à 'offline' pour email: {}", email);
        }

        return ApiResponse.success("Déconnexion réussie.");
    }

    public ApiResponse listSessions(String email) {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (!optionalUser.isPresent()) {
            logger.warn("listSessions: Utilisateur non trouvé pour email: {}", email);
            return ApiResponse.error("Utilisateur non trouvé.");
        }

        List<RefreshToken> tokens = refreshTokenRepository.findAllByUserId(optionalUser.get().getId());
        logger.info("listSessions: Sessions récupérées pour email: {}", email);
        return ApiResponse.success("Sessions récupérées.", tokens);
    }
}