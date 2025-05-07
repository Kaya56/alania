package com.alania.alania_backend.repository;

import com.alania.alania_backend.model.AccessToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface AccessTokenRepository extends JpaRepository<AccessToken, Long> {
    // Trouver un token par identifiant utilisateur
    Optional<AccessToken> findByUserId(Long userId);

    // Trouver un token spécifique
    Optional<AccessToken> findByToken(String token);

    // Supprimer les tokens expirés
    void deleteByExpiryBefore(LocalDateTime expiry);

    // Vérifier l'existence d'un token pour un utilisateur
    boolean existsByUserId(Long userId);
}