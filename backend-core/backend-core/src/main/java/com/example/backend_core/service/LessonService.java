package com.example.backend_core.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.backend_core.dto.TranscriptResponse;
import com.example.backend_core.model.Lesson;
import com.example.backend_core.model.Sentence;
import com.example.backend_core.repository.LessonRepository;
import com.example.backend_core.repository.SentenceRepository;

@Service
public class LessonService {

    private final LessonRepository lessonRepository;
    private final SentenceRepository sentenceRepository;
    private final RestTemplate restTemplate;
    
    public LessonService(LessonRepository lessonRepository, SentenceRepository sentenceRepository) {
        this.lessonRepository = lessonRepository;
		this.sentenceRepository = sentenceRepository;
		this.restTemplate = new RestTemplate();
    }
    

    // Lấy tất cả lesson
    public List<Lesson> getAll() {
        return lessonRepository.findAll();
    }

    // Lấy 1 lesson theo id
    public Lesson getById(Long id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lesson not found: " + id));
    }

    // Tạo mới lesson
//    public Lesson create(Lesson lesson) {
//        return lessonRepository.save(lesson);
//    }
    
    public Lesson createLesson(Lesson lesson) {
        lesson.setCreatedAt(LocalDateTime.now());
        Lesson savedLesson = lessonRepository.save(lesson);

        String videoId = extractVideoId(lesson.getYoutubeUrl());
        String url = "http://localhost:8000/transcript/" + videoId;

        try {
            // Dùng đúng class DTO để hứng Object từ Python
            TranscriptResponse response = restTemplate.getForObject(url, TranscriptResponse.class);

            if (response != null && response.getSentences() != null) {
                for (Map<String, Object> item : response.getSentences()) {
                    Sentence sentence = Sentence.builder()
                            .content((String) item.get("content"))
                            .startTime(Double.valueOf(item.get("start_time").toString()))
                            .endTime(Double.valueOf(item.get("end_time").toString()))
                            .orderIndex((Integer) item.get("order_index"))
                            .translation((String) item.get("translation"))
                            .ipa((String) item.get("ipa"))
                            .lesson(savedLesson)
                            .build();
                    sentenceRepository.save(sentence);
                }
            }
        } catch (Exception e) {
            System.out.println("Lỗi triệu hồi AI rồi tiểu tử: " + e.getMessage());
            // Có thể ném lỗi hoặc xử lý tùy ý
        }

        return savedLesson;
    }

    // Cập nhật lesson
    public Lesson update(Long id, Lesson updated) {
        Lesson existing = getById(id);
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setYoutubeUrl(updated.getYoutubeUrl());
        existing.setVideoId(updated.getVideoId());
        return lessonRepository.save(existing);
    }

    // Xóa lesson
    public void delete(Long id) {
        lessonRepository.deleteById(id);
    }
    
    
    private String extractVideoId(String url) {
        if (url.contains("v=")) {
            return url.substring(url.indexOf("v=") + 2);
        }
        return url;
    }
}