package com.example.backend_core.controll;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend_core.model.Sentence;
import com.example.backend_core.service.SentenceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/sentences")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost" })
public class SentenceController {

    private final SentenceService sentenceService;

    @GetMapping("/lesson/{lessonId}")
    public List<Sentence> getByLesson(@PathVariable("lessonId") Long lessonId) {
        return sentenceService.getByLesson(lessonId);
    }
    
    @PostMapping("/lesson/{lessonId}/bulk")
    public ResponseEntity<List<Sentence>> saveBulk(
            @PathVariable("lessonId") Long lessonId, 
            @RequestBody List<Sentence> sentences) {
        
        List<Sentence> savedSentences = sentenceService.saveBulkSentences(lessonId, sentences);
        return ResponseEntity.ok(savedSentences);
    }
    
    // --- Tạo lẺ một câu mới ---
    @PostMapping
    public ResponseEntity<Sentence> create(@RequestBody Sentence sentence) {
        Long lessonId = sentence.getLesson() != null ? sentence.getLesson().getId() : sentence.getLessonId();
        Sentence saved = sentenceService.createSingle(lessonId, sentence);
        return ResponseEntity.ok(saved);
    }

    // --- Sửa lẺ một câu ---
    @PutMapping("/{id}")
    public ResponseEntity<Sentence> update(@PathVariable Long id, @RequestBody Sentence sentence) {
        Sentence updated = sentenceService.updateSingle(id, sentence);
        return ResponseEntity.ok(updated);
    }

    // --- Xóa lẺ một câu ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sentenceService.deleteSingle(id);
        return ResponseEntity.noContent().build();
    }
}
