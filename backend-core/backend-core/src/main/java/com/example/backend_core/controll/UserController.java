package com.example.backend_core.controll;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend_core.model.User;
import com.example.backend_core.repository.UserRepository;
import com.example.backend_core.service.CloudinaryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost" })
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    /**
     * POST /api/users/{id}/avatar
     * Body: multipart/form-data với field "file" là file ảnh
     * Yêu cầu: đã đăng nhập (authenticated)
     */
    @PostMapping("/{id}/avatar")
    public ResponseEntity<?> uploadAvatar(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        // Kiểm tra user tồn tại
        User user = userRepository.findById(id)
                .orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // Kiểm tra file hợp lệ
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File ảnh không được để trống"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Chỉ chấp nhận file ảnh (jpg, png, webp...)"));
        }

        try {
            // Upload lên Cloudinary, publicId = "user_{id}"
            String avatarUrl = cloudinaryService.uploadAvatar(file, "user_" + id);

            // Lưu URL vào database
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Upload avatar thành công",
                    "avatarUrl", avatarUrl
            ));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Upload thất bại: " + e.getMessage()));
        }
    }
}
