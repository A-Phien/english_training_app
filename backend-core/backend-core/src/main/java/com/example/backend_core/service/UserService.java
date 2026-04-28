package com.example.backend_core.service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend_core.model.User;
import com.example.backend_core.repository.UserRepository;
import com.example.backend_core.security.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // Đăng ký
    public User register(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        user.setIsActive(true);
        return userRepository.save(user);
    }

    // Đăng nhập → trả token
    public Map<String, Object> login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Wrong password");
        }

        String token = jwtUtil.generateToken(username, user.getRole());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        result.put("role", user.getRole());
        result.put("avatarUrl", user.getAvatarUrl()); // null nếu không có avatar

        return result;
    }
    
    
    
    @Value("${google.client-id}")
    private String googleClientId;

    // Khởi tạo 1 lần duy nhất khi app start, tránh tạo lại mỗi request
    private GoogleIdTokenVerifier googleVerifier;

    @PostConstruct
    public void init() {
        googleVerifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
    }

    // Đăng nhập / đăng ký bằng Google
    public Map<String, Object> loginWithGoogle(String googleToken) {
        try {
            // Dùng verifier đã khởi tạo sẵn

            GoogleIdToken idToken = googleVerifier.verify(googleToken);
            if (idToken == null) {
                throw new RuntimeException("Invalid Google token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String googleId = payload.getSubject();
            String avatarUrl = (String) payload.get("picture");

            // Tìm user theo email, nếu chưa có thì tạo mới
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setUsername(email); // dùng email làm username
//                newUser.setPassword(null);  // user Google không có password
                newUser.setPassword("GOOGLE_AUTH_" + UUID.randomUUID().toString()); // password ngẫu nhiên, không dùng để login
                newUser.setGoogleId(googleId);
                newUser.setAvatarUrl(avatarUrl);
                newUser.setRole("USER");
                newUser.setIsActive(true);
                return userRepository.save(newUser);
            });

            // Nếu user đã tồn tại nhưng chưa có googleId → cập nhật
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                user.setAvatarUrl(avatarUrl);
                userRepository.save(user);
            }

            String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
            Map<String, Object> result = new HashMap<>();
            result.put("token", token);
            result.put("userId", user.getId());
            result.put("username", user.getUsername());
            result.put("role", user.getRole());
            result.put("avatarUrl", user.getAvatarUrl()); // URL ảnh từ Google
            return result;

        } catch (Exception e) {
            throw new RuntimeException("Google login failed: " + e.getMessage());
        }
    }
    
}