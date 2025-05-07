package com.alania.alania_backend.repository;

import com.alania.alania_backend.model.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    // Trouver un token par identifiant utilisateur
    Optional<VerificationToken> findByUserId(Long userId);

    // Supprimer les tokens expirés
    void deleteByVerificationCodeExpiryBefore(LocalDateTime expiry);

    // Vérifier l'existence d'un token pour un utilisateur
    boolean existsByUserId(Long userId);

    // Trouver un token spécifique (si besoin)
    Optional<VerificationToken> findByHashedVerificationCode(String hashedCode);
}
