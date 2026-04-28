package com.example.backend_core.controll;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend_core.model.Vocabulary;
import com.example.backend_core.repository.VocabularyRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/vocabularies")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost" })
@RequiredArgsConstructor
public class VocabularyController {

    private final VocabularyRepository vocabularyRepository;

    // GET /api/vocabularies → Lấy tất cả (ít dùng, chủ yếu dùng qua topic)
    @GetMapping
    public List<Vocabulary> getAll() {
        return vocabularyRepository.findAll();
    }

    // PUT /api/vocabularies/{id} → Sửa 1 từ vựng
    @PutMapping("/{id}")
    public ResponseEntity<Vocabulary> update(@PathVariable Long id, @RequestBody Vocabulary updated) {
        return vocabularyRepository.findById(id).map(existing -> {
            existing.setWord(updated.getWord());
            existing.setIpa(updated.getIpa());
            existing.setTranslation(updated.getTranslation());
            existing.setExample(updated.getExample());
            existing.setExampleTranslation(updated.getExampleTranslation());
            return ResponseEntity.ok(vocabularyRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/vocabularies/{id} → Xóa 1 từ vựng
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!vocabularyRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        vocabularyRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
