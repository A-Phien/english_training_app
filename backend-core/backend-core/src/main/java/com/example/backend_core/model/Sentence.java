package com.example.backend_core.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "sentence")
public class Sentence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;
    
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "lesson_id")
//    @JsonBackReference // Kim bài: "Cấm nhìn ngược từ Con lên Cha khi tạo JSON"
//    private Lesson lesson;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "start_time")
    private Double startTime;

    @Column(name = "end_time")
    private Double endTime;
    
    @Column(name = "order_index")
    private Integer orderIndex;
    
    @Column(columnDefinition = "TEXT")
    private String translation;

    @Column(columnDefinition = "TEXT")
    private String ipa;

    // Field phụ để nhận lessonId từ JSON (không lưu vào DB)
    @Transient
    private Long lessonId;
}