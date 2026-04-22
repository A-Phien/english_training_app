package com.example.backend_core.controll;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend_core.model.Topic;
import com.example.backend_core.model.Vocabulary;
import com.example.backend_core.repository.TopicRepository;
import com.example.backend_core.repository.VocabularyRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/topics")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost" })
@RequiredArgsConstructor
public class TopicController {

    private final TopicRepository topicRepository;
    private final VocabularyRepository vocabularyRepository;

    // GET /api/topics → Lấy danh sách tất cả chủ đề
    @GetMapping
    public List<Topic> getAllTopics() {
        return topicRepository.findAll();
    }

    // GET /api/topics/{id} → Lấy thông tin một chủ đề
    @GetMapping("/{id}")
    public ResponseEntity<Topic> getTopicById(@PathVariable Long id) {
        return topicRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/topics/{id}/vocabularies → Lấy danh sách từ vựng của một chủ đề
    @GetMapping("/{id}/vocabularies")
    public ResponseEntity<List<Vocabulary>> getVocabulariesByTopic(@PathVariable Long id) {
        if (!topicRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        List<Vocabulary> list = vocabularyRepository.findByTopicId(id);
        return ResponseEntity.ok(list);
    }
}
