package com.alania.alania_backend.service;

import io.jsonwebtoken.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Date;
import java.util.UUID;

@Component
public class AuthUtils {

    private static final Logger logger = LoggerFactory.getLogger(AuthUtils.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${jwt.secret}")
    private String JWT_SECRET;
    private final long JWT_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 heures

    public String generateVerificationCode(int length) {
        String chars = "ABCDEFGHJKMNOPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz0123456789";
        StringBuilder code = new StringBuilder();
        SecureRandom random = new SecureRandom();
        for (int i = 0; i < length; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        System.out.println("\n\n\n Code genere \n\n\n" + code.toString());
        return code.toString();
    }

    public void sendVerificationEmail(String email, String verificationCode, String subject) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Nom affiché : "Alania"
            helper.setFrom(new InternetAddress("alaniaenterprise@gmail.com", "Alania"));

            helper.setTo(email);
            helper.setSubject(subject);

            // Message HTML pour un code bien visible et copiable
            String htmlContent = "<div style='font-family:Arial,sans-serif;font-size:16px;'>" +
                    "<p>Bonjour,</p>" +
                    "<p>Vcode de vérification :</p>" +
                    "<p style='font-size:20px; font-weight:bold; background-color:#f2f2f2; padding:10px; display:inline-block; border-radius:5px;'>" +
                    verificationCode +
                    "</p>" +
                    "<br><p>— L'équipe <strong>Alania</strong></p>" +
                    "</div>";

            helper.setText(htmlContent, true); // true = HTML

            mailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
            // Tu peux logger ou relancer une exception personnalisée ici
        }
    }


    public String generateJwtToken(String email) {
        logger.debug("Génération du token JWT pour l'email: {}", email);
        SecretKey key = new SecretKeySpec(JWT_SECRET.getBytes(StandardCharsets.UTF_8), SignatureAlgorithm.HS512.getJcaName());
        String token = Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION_MS))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
        logger.debug("Token généré: {}", token);
        return token;
    }

    public boolean verifyJwtToken(String token) {
        logger.debug("Vérification du token JWT: {}", token != null ? "present" : "null");
        if (token == null) {
            logger.error("Token is null");
            return false;
        }
        try {
            Jwts.parser()
                    .setSigningKey(JWT_SECRET.getBytes(StandardCharsets.UTF_8))
                    .parseClaimsJws(token);
            logger.debug("Token JWT valide");
            return true;
        } catch (ExpiredJwtException e) {
            logger.error("Token JWT expiré: {}", e.getMessage());
            return false;
        } catch (UnsupportedJwtException e) {
            logger.error("Token JWT non supporté: {}", e.getMessage());
            return false;
        } catch (MalformedJwtException e) {
            logger.error("Token JWT malformé: {}", e.getMessage());
            return false;
        } catch (SignatureException e) {
            logger.error("Signature du token JWT invalide: {}", e.getMessage());
            return false;
        } catch (Exception e) {
            logger.error("Erreur lors de la vérification du token JWT: {}", e.getMessage(), e);
            return false;
        }
    }

    public String getEmailFromJwtToken(String token) {
        logger.debug("Extraction de l'email du token JWT: {}", token != null ? "present" : "null");
        if (token == null) {
            logger.error("Token is null");
            throw new IllegalArgumentException("Token is null");
        }
        try {
            String email = Jwts.parser()
                    .setSigningKey(JWT_SECRET.getBytes(StandardCharsets.UTF_8))
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
            logger.debug("Email extrait: {}", email);
            return email;
        } catch (Exception e) {
            logger.error("Erreur lors de l'extraction de l'email: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to extract email from token", e);
        }
    }

    public String generateRefreshToken() {
        String refreshToken = UUID.randomUUID().toString();
        logger.debug("Génération du refresh token: {}", refreshToken);
        return refreshToken;
    }
}