package com.alania.alania_backend.repository;

import com.alania.alania_backend.model.PendingRegistration;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, Long> {

    // Trouver un enregistrement en attente par email
    Optional<PendingRegistration> findByEmail(String email);

    // Supprimer les enregistrements expirés
    void deleteByVerificationCodeExpiryBefore(LocalDateTime expiry);

    // Vérifier l'existence d'un email dans les enregistrements en attente
    boolean existsByEmail(String email);
}
