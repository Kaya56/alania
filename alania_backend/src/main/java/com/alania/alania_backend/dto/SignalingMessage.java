package com.alania.alania_backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SignalingMessage {
    private String type;      // "offer", "answer", "candidate", "register"
    private String from;      // Email de l'expéditeur (pour signalisation)
    private String to;        // Email du destinataire (1:1)
    private String groupId;   // ID du groupe (groupes)
    private String sdp;       // SDP pour offres/réponses
    private String candidate; // Candidat ICE
    private String email;     // Email de l'utilisateur (pour enregistrement)
    private String token;     // Token JWT (pour enregistrement et authentification)
    private String conversationId;
}