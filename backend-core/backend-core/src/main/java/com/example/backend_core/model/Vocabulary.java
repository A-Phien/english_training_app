package com.example.backend_core.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "vocabulary")
public class Vocabulary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String word; // Từ tiếng Anh, VD: "apple"

    private String ipa; // Phiên âm, VD: "/ˈæp.əl/"

    @Column(nullable = false)
    private String translation; // Nghĩa tiếng Việt, VD: "quả táo"

    private String example; // Câu ví dụ (tùy chọn)

    private String exampleTranslation; // Nghĩa câu ví dụ (tùy chọn)

    // Quan hệ với Topic - JsonIgnore để tránh vòng lặp JSON
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id", nullable = false)
    private Topic topic;

    // Trả về topicId để frontend biết thuộc chủ đề nào (không trả toàn bộ object Topic)
    public Long getTopicId() {
        return topic != null ? topic.getId() : null;
    }
}
