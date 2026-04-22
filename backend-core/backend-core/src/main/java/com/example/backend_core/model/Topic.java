package com.example.backend_core.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "topic")
public class Topic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // VD: "Giao tiếp", "Công việc", "Du lịch"

    private String description; // Mô tả ngắn về chủ đề

    private String icon; // Emoji icon, VD: "✈️", "💼"

    // Chỉ dùng để đếm, không cần load toàn bộ để tránh N+1 query
    @JsonIgnore
    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Vocabulary> vocabularies;

    // Field tạm để trả về số từ vựng mà không cần @Transient phức tạp
    public int getWordCount() {
        return vocabularies == null ? 0 : vocabularies.size();
    }
}
