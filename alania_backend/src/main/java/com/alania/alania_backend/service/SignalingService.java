package com.alania.alania_backend.service;

import com.alania.alania_backend.dto.SignalingMessage;
import com.alania.alania_backend.model.SdpStorage;
import com.alania.alania_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class SignalingService {

    private final UserRepository userRepository;
    private final AuthUtils authUtils;

    private final ConcurrentHashMap<String, SdpStorage> sdpStorage = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> emailToSessionId = new ConcurrentHashMap<>();

    public void registerUser(String email, String token, String sessionId) {
        System.out.println("Registering user: email=" + email + ", sessionId=" + sessionId);
        try {
            System.out.println("Verifying JWT token...");
            if (!authUtils.verifyJwtToken(token)) {
                System.out.println("JWT token verification failed");
                throw new SecurityException("Invalid or expired token");
            }
            String tokenEmail = authUtils.getEmailFromJwtToken(token);
            System.out.println("Token email: " + tokenEmail);
            if (!email.equals(tokenEmail)) {
                System.out.println("Email mismatch: provided=" + email + ", token=" + tokenEmail);
                throw new SecurityException("Token email does not match provided email");
            }
            System.out.println("Checking user existence for email: " + email);
            if (!userRepository.existsByEmail(email)) {
                System.out.println("User not found: " + email);
                throw new IllegalArgumentException("User not found: " + email);
            }
            if (emailToSessionId.containsKey(email)) {
                cleanSession(emailToSessionId.get(email));
            }
            emailToSessionId.put(email, sessionId);
            System.out.println("Updated emailToSessionId: " + emailToSessionId);
        } catch (Exception ex) {
            System.out.println("Error in registerUser: " + ex.getMessage());
            ex.printStackTrace();
            throw ex;
        }
    }

    public String validateAndProcessMessage(String token, SignalingMessage message) {
        System.out.println("Validating message: type=" + message.getType() + ", from=" + message.getFrom());
        try {
            System.out.println("Verifying JWT token...");
            if (token == null || !authUtils.verifyJwtToken(token)) {
                System.out.println("JWT token verification failed");
                throw new SecurityException("Invalid or expired token");
            }
            String email = authUtils.getEmailFromJwtToken(token);
            System.out.println("Token validated for email: " + email);
            if (!email.equals(message.getFrom())) {
                System.out.println("Token email does not match sender: token=" + email + ", message=" + message.getFrom());
                throw new SecurityException("Token email does not match sender");
            }
            System.out.println("Checking user existence: from=" + message.getFrom() + ", to=" + message.getTo());
            if (!userRepository.existsByEmail(message.getFrom()) ||
                    (message.getTo() != null && !userRepository.existsByEmail(message.getTo()))) {
                System.out.println("User not found: from=" + message.getFrom() + ", to=" + message.getTo());
                throw new IllegalArgumentException("User not found");
            }
            if ("offer".equalsIgnoreCase(message.getType())) {
                String key = message.getFrom() + "_" + (message.getTo() != null ? message.getTo() : message.getGroupId());
                System.out.println("Storing SDP for key: " + key);
                sdpStorage.put(key, new SdpStorage(message.getSdp(), LocalDateTime.now().plusSeconds(60)));
            }
            return email;
        } catch (Exception ex) {
            System.out.println("Error in validateAndProcessMessage: " + ex.getMessage());
            ex.printStackTrace();
            throw ex;
        }
    }

    public String getSessionIdForEmail(String email) {
        return emailToSessionId.get(email);
    }

    @Scheduled(fixedRate = 600000)
    public void cleanExpiredSdp() {
        sdpStorage.entrySet().removeIf(entry -> entry.getValue().getExpiration().isBefore(LocalDateTime.now()));
    }

    public void cleanSession(String sessionId) {
        emailToSessionId.entrySet().removeIf(entry -> entry.getValue().equals(sessionId));
        System.out.println("Cleaned session: " + sessionId);
        System.out.println("Updated emailToSessionId: " + emailToSessionId);
    }

    @Scheduled(fixedRate = 600000)
    public void cleanExpiredSessions() {
        emailToSessionId.entrySet().removeIf(entry -> {
            // Vérifier si la session est encore active (optionnel, nécessite une logique supplémentaire)
            return false; // À implémenter si nécessaire
        });
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        emailToSessionId.entrySet().removeIf(entry -> entry.getValue().equals(sessionId));
        System.out.println("WebSocket connection closed: " + sessionId);
        System.out.println("Updated emailToSessionId: " + emailToSessionId);
    }
}