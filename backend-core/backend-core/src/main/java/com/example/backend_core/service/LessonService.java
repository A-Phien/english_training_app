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

import jakarta.transaction.Transactional;

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
//    @Transactional // Bắt buộc phải có bùa chú này để việc dọn dẹp (xóa) không bị lỗi
//    public Lesson update(Long id, Lesson updated) {
//        // 1. Tìm lại bản ngã
//        Lesson existing = getById(id);
//        existing.setTitle(updated.getTitle());
//        existing.setDescription(updated.getDescription());
//        existing.setYoutubeUrl(updated.getYoutubeUrl());
//        existing.setVideoId(updated.getVideoId());
//        
//        Lesson savedLesson = lessonRepository.save(existing);
//
//        // 2. Quét sạch tàn dư: Xóa toàn bộ các câu (Sentence) cũ bị lỗi của bài học này
//        // (Ngươi phải tự vào SentenceRepository viết thêm hàm void deleteByLessonId(Long lessonId); hiểu chưa?)
//        sentenceRepository.deleteByLessonId(id);
//
//        // 3. Khai mở trận pháp, triệu hồi lại AI
//        String videoId = extractVideoId(savedLesson.getYoutubeUrl());
//        String url = "http://localhost:8000/transcript/" + videoId;
//
//        try {
//            TranscriptResponse response = restTemplate.getForObject(url, TranscriptResponse.class);
//
//            if (response != null && response.getSentences() != null) {
//                for (Map<String, Object> item : response.getSentences()) {
//                    Sentence sentence = Sentence.builder()
//                            .content((String) item.get("content"))
//                            .startTime(Double.valueOf(item.get("start_time").toString()))
//                            .endTime(Double.valueOf(item.get("end_time").toString()))
//                            .orderIndex((Integer) item.get("order_index"))
//                            .translation((String) item.get("translation"))
//                            .ipa((String) item.get("ipa"))
//                            .lesson(savedLesson)
//                            .build();
//                    sentenceRepository.save(sentence);
//                }
//            }
//        } catch (Exception e) {
//            System.out.println("Lỗi triệu hồi AI lần 2 rồi tiểu tử: " + e.getMessage());
//        }
//
//        return savedLesson;
//    }
    
    @Transactional // Bắt buộc phải có bùa chú này
    public Lesson update(Long id, Lesson updated) {
        // 1. Tìm lại bản ngã cũ
        Lesson existing = getById(id);

        // 2. SO SÁNH: Nhãn lực để xem link YouTube có bị thay đổi không?
        boolean isUrlChanged = !existing.getYoutubeUrl().equals(updated.getYoutubeUrl());

        // 3. Cập nhật thông tin cơ bản (Dù đổi link hay không thì vẫn phải cập nhật mấy cái này)
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        
        if (isUrlChanged) {
            existing.setYoutubeUrl(updated.getYoutubeUrl());
            existing.setVideoId(updated.getVideoId()); // Hoặc tự extract lại
        }
        
        Lesson savedLesson = lessonRepository.save(existing);

        // 4. CHỈ KHI NÀO ĐỔI LINK, mới thi triển trận pháp quét dọn và triệu hồi AI
        if (isUrlChanged) {
            // Quét sạch tàn dư cũ
            sentenceRepository.deleteByLessonId(id);

            // Khai mở trận pháp, triệu hồi lại AI
            String videoId = extractVideoId(savedLesson.getYoutubeUrl());
            String url = "http://localhost:8000/transcript/" + videoId;

            try {
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
            }
        }

        return savedLesson;
    }

    @Transactional 
    public void delete(Long id) {
        sentenceRepository.deleteByLessonId(id); // Dọn dẹp tàn dư: Xóa toàn bộ câu (Sentence) của bài học này
        lessonRepository.deleteById(id);
    }
    
    
    private String extractVideoId(String url) {
        if (url.contains("v=")) {
            return url.substring(url.indexOf("v=") + 2);
        }
        return url;
    }
}