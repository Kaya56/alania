package com.alania.alania_backend.service;

import com.alania.alania_backend.model.User;
import com.alania.alania_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthUtils authUtils;

    public User createUser(String email) {
        User user = new User();
        user.setEmail(email);
        user.setUsername(null); // Par défaut ou à personnaliser
        user.setStatus("offline"); // Statut par défaut
        return userRepository.save(user); // Sauvegarde et retourne l'utilisateur
    }
}