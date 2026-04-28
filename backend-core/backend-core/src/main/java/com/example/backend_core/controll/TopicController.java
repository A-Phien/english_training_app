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
        List<Vocabulary> list = vocabularyRepository.findByTopic_Id(id);
        return ResponseEntity.ok(list);
    }

    // POST /api/topics → Tạo chủ đề mới
    @PostMapping
    public ResponseEntity<Topic> createTopic(@RequestBody Topic topic) {
        Topic saved = topicRepository.save(topic);
        return ResponseEntity.ok(saved);
    }

    // PUT /api/topics/{id} → Sửa chủ đề
    @PutMapping("/{id}")
    public ResponseEntity<Topic> updateTopic(@PathVariable Long id, @RequestBody Topic updated) {
        return topicRepository.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setDescription(updated.getDescription());
            existing.setIcon(updated.getIcon());
            return ResponseEntity.ok(topicRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/topics/{id} → Xóa chủ đề (cascade xóa từ vựng bên trong)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopic(@PathVariable Long id) {
        if (!topicRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        topicRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // POST /api/topics/{id}/vocabularies → Thêm 1 từ vựng vào chủ đề
    @PostMapping("/{id}/vocabularies")
    public ResponseEntity<Vocabulary> addVocabulary(
            @PathVariable Long id,
            @RequestBody Vocabulary vocab) {
        return topicRepository.findById(id).map(topic -> {
            vocab.setTopic(topic);
            return ResponseEntity.ok(vocabularyRepository.save(vocab));
        }).orElse(ResponseEntity.notFound().build());
    }

    // POST /api/topics/{id}/vocabularies/batch → Import hàng loạt từ Excel
    @PostMapping("/{id}/vocabularies/batch")
    public ResponseEntity<List<Vocabulary>> addVocabularyBatch(
            @PathVariable Long id,
            @RequestBody List<Vocabulary> vocabList) {
        return topicRepository.findById(id).map(topic -> {
            vocabList.forEach(v -> v.setTopic(topic));
            List<Vocabulary> saved = vocabularyRepository.saveAll(vocabList);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }
}
