package com.example.backend_core.controll;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend_core.model.User;
import com.example.backend_core.model.UserVocabulary;
import com.example.backend_core.repository.UserRepository;
import com.example.backend_core.repository.UserVocabularyRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user-vocabulary")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost" })
@RequiredArgsConstructor
public class UserVocabularyController {

    private final UserVocabularyRepository userVocabularyRepository;
    private final UserRepository userRepository;

    // GET /api/user-vocabulary → danh sách từ của user hiện tại
    @GetMapping
    public ResponseEntity<List<UserVocabulary>> getMyVocabulary(Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(
            userVocabularyRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
        );
    }

    // POST /api/user-vocabulary → lưu từ mới (check trùng)
    @PostMapping
    public ResponseEntity<?> saveWord(@RequestBody Map<String, String> body,
                                      Authentication authentication) {
        User user = getUser(authentication);
        String word = body.get("word");

        if (word == null || word.isBlank()) {
            return ResponseEntity.badRequest().body("Từ không được để trống");
        }

        // Kiểm tra đã lưu chưa
        if (userVocabularyRepository.existsByUserIdAndWord(user.getId(), word.toLowerCase())) {
            return ResponseEntity.ok(Map.of("saved", false, "message", "Từ này đã có trong sổ của bạn"));
        }

        UserVocabulary vocab = new UserVocabulary();
        vocab.setUser(user);
        vocab.setWord(word.toLowerCase());
        vocab.setIpa(body.get("ipa"));
        vocab.setTranslation(body.getOrDefault("translation", ""));
        vocab.setExample(body.get("example"));

        userVocabularyRepository.save(vocab);
        return ResponseEntity.ok(Map.of("saved", true, "message", "Đã lưu từ vựng!"));
    }

    // DELETE /api/user-vocabulary/{id} → xóa từ
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWord(@PathVariable Long id, Authentication authentication) {
        User user = getUser(authentication);
        UserVocabulary vocab = userVocabularyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy từ"));

        // Kiểm tra từ này có phải của user đang login không
        if (!vocab.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Không có quyền xóa từ này");
        }

        userVocabularyRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa"));
    }

    // Helper
    private User getUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
