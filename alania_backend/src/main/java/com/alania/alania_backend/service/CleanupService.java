package com.alania.alania_backend.service;

import com.alania.alania_backend.repository.PendingRegistrationRepository;
import com.alania.alania_backend.repository.VerificationTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class CleanupService {

    @Autowired
    private PendingRegistrationRepository pendingRegistrationRepository;

    @Autowired
    private VerificationTokenRepository verificationTokenRepository;

    @Scheduled(fixedRate = 600000) // Toutes les 10 minutes (600 000 ms)
    public void cleanupExpiredEntries() {
        pendingRegistrationRepository.deleteByVerificationCodeExpiryBefore(LocalDateTime.now());
        verificationTokenRepository.deleteByVerificationCodeExpiryBefore(LocalDateTime.now());
    }
}