package com.alania.alania_backend.config;

import com.alania.alania_backend.dto.ApiResponse;
import com.alania.alania_backend.dto.SignalingMessage;
import com.alania.alania_backend.service.SignalingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class SignalingWebSocketHandler extends TextWebSocketHandler {

    private final SignalingService signalingService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.put(session.getId(), session);
        System.out.println("WebSocket connection established: " + session.getId());
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            SignalingMessage signalingMessage = objectMapper.readValue(message.getPayload(), SignalingMessage.class);
            System.out.println("Received WebSocket message: " + signalingMessage);

            // MODIF : Récupération du token depuis l'URL ou l'en-tête
            String authHeader = session.getAttributes().getOrDefault("Authorization", "").toString();
            if (authHeader.isEmpty()) {
                String query = session.getUri().getQuery();
                if (query != null && query.startsWith("token=")) {
                    authHeader = query.substring(6); // Extrait le token après "token="
                }
            }
            if (authHeader.startsWith("Bearer ")) {
                authHeader = authHeader.substring(7);
            }
            if (authHeader.isEmpty()) {
                sendError(session, "Authorization required");
                return;
            }

            if ("register".equalsIgnoreCase(signalingMessage.getType())) {
                handleRegister(session, signalingMessage, authHeader);
            } else if ("offer".equalsIgnoreCase(signalingMessage.getType()) ||
                    "answer".equalsIgnoreCase(signalingMessage.getType()) ||
                    "candidate".equalsIgnoreCase(signalingMessage.getType())) {
                handleSignaling(session, signalingMessage, authHeader);
            } else {
                sendError(session, "Unknown message type: " + signalingMessage.getType());
            }
        } catch (Exception ex) {
            ex.printStackTrace();
            System.out.println("Error processing WebSocket message: " + ex.getMessage());
            sendError(session, "Internal error");
        }
    }

    private void handleRegister(WebSocketSession session, SignalingMessage message, String authHeader) throws Exception {
        String token = message.getToken();
        String email = message.getEmail();
        if (token == null || email == null) {
            sendError(session, "Missing token or email");
            return;
        }

        if (!authHeader.equals(token)) {
            sendError(session, "Token mismatch");
            return;
        }

        signalingService.registerUser(email, token, session.getId());

        ApiResponse response = ApiResponse.success("Registration successful",
                new RegistrationResponse(session.getId(), email));
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
    }

    private void handleSignaling(WebSocketSession session, SignalingMessage message, String authHeader) throws Exception {
        String token = message.getToken() != null ? message.getToken() : authHeader;
        if (token == null || token.isEmpty()) {
            sendError(session, "Missing or invalid token");
            return;
        }

        String senderEmail = signalingService.validateAndProcessMessage(token, message);
        if (!signalingService.getSessionIdForEmail(senderEmail).equals(session.getId())) {
            signalingService.registerUser(senderEmail, token, session.getId());
        }

        if (message.getConversationId() == null) {
            System.out.println("Warning: No conversationId in signaling message from " + senderEmail);
        }

        String to = message.getTo();
        if (to == null) {
            for (WebSocketSession s : sessions.values()) {
                if (s.isOpen() && !s.getId().equals(session.getId())) {
                    s.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
                }
            }
        } else {
            String recipientSessionId = signalingService.getSessionIdForEmail(to);
            WebSocketSession recipientSession = sessions.get(recipientSessionId);
            if (recipientSession != null && recipientSession.isOpen()) {
                recipientSession.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
            } else {
                System.out.println("Recipient session not found or closed for email: " + to + ", sessionId: " + recipientSessionId);
                sendError(session, "Recipient not found: " + to);
            }
        }
    }
    private void sendError(WebSocketSession session, String errorMessage) throws Exception {
        if (session.isOpen()) {
            ApiResponse errorResponse = ApiResponse.error(errorMessage);
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(errorResponse)));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session.getId());
        signalingService.cleanSession(session.getId());
        System.out.println("WebSocket connection closed: " + session.getId());
    }

    private static class RegistrationResponse {
        private String sessionId;
        private String email;

        public RegistrationResponse(String sessionId, String email) {
            this.sessionId = sessionId;
            this.email = email;
        }

        public String getSessionId() {
            return sessionId;
        }

        public String getEmail() {
            return email;
        }
    }
}