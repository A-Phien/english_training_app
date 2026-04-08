package com.example.backend_core.service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend_core.model.Lesson;
import com.example.backend_core.model.Sentence;
import com.example.backend_core.repository.LessonRepository;
import com.example.backend_core.repository.SentenceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SentenceService {

    private final SentenceRepository sentenceRepository;
    private final LessonRepository lessonRepository;
    
    public List<Sentence> getByLesson(Long lessonId) {
        return sentenceRepository
                .findByLesson_IdOrderByOrderIndexAsc(lessonId);
    }
    
    
    @Transactional
    public List<Sentence> saveBulkSentences(Long lessonId, List<Sentence> incomingSentences) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Tẩu hỏa nhập ma! Không tìm thấy Bài Học mang số hiệu " + lessonId));

        // 2. Thu thập các câu đang tồn tại trong Database
        List<Sentence> existingSentences = getByLesson(lessonId);

        // 3. Rút trích danh sách ID mà Frontend gửi lên
        List<Long> incomingIds = incomingSentences.stream()
                .map(Sentence::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // 4. TIỄU TRỪ KẺ ĐÀO TẨU: 
        // Câu nào có trong Database mà Frontend KHÔNG gửi lên -> Chứng tỏ người dùng đã bấm nút XÓA.
        List<Sentence> sentencesToDelete = existingSentences.stream()
                .filter(s -> !incomingIds.contains(s.getId()))
                .collect(Collectors.toList());
        sentenceRepository.deleteAll(sentencesToDelete);

        // 5. THÊM MỚI VÀ CẬP NHẬT:
        for (int i = 0; i < incomingSentences.size(); i++) {
            Sentence s = incomingSentences.get(i);
            s.setLesson(lesson); // Nhận cha
            s.setOrderIndex(i);  // Thiết lập thứ tự xuất hiện như Frontend sắp xếp
        }

        // Lệnh saveAll tự động hiểu -> ID = null thì chạy INSERT, ID có sẵn thì chạy UPDATE
        return sentenceRepository.saveAll(incomingSentences);
    }

    // --- LƯU LẺ: Tạo câu mới ---
    @Transactional
    public Sentence createSingle(Long lessonId, Sentence sentence) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Bài Học: " + lessonId));
        sentence.setId(null); // Đảm bảo là INSERT
        sentence.setLesson(lesson);
        return sentenceRepository.save(sentence);
    }

    // --- SỬA LẺ: Cập nhật câu đã có ---
    @Transactional
    public Sentence updateSingle(Long sentenceId, Sentence updated) {
        Sentence existing = sentenceRepository.findById(sentenceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy câu: " + sentenceId));
        existing.setContent(updated.getContent());
        existing.setTranslation(updated.getTranslation());
        existing.setIpa(updated.getIpa());
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.setOrderIndex(updated.getOrderIndex());
        return sentenceRepository.save(existing);
    }

    // --- XÓA LẺ: Xóa một câu ---
    @Transactional
    public void deleteSingle(Long sentenceId) {
        sentenceRepository.deleteById(sentenceId);
    }

}
