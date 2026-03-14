import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/lessonlist.css"; // Nhớ tạo file CSS này nhé

export default function LessonList() {
  const [lessons, setLessons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/api/lessons")
      .then((res) => res.json())
      .then((data) => setLessons(data))
      .catch((err) => console.error("Lỗi fetch danh sách:", err));
  }, []);

  // Hàm "trích xuất" videoId từ URL hoặc field videoId
  const getYouTubeId = (lesson) => {
    if (lesson.videoId) return lesson.videoId;
    const url = lesson.youtubeUrl;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="container">
      <header className="list-header">
        <h1>🎬 English AI Training</h1>
        <p>Chọn một bài học để bắt đầu luyện tập phát âm</p>
      </header>

      <div className="lesson-grid">
        {lessons.map((lesson) => {
          const vId = getYouTubeId(lesson);
          const thumbUrl = `https://img.youtube.com/vi/${vId}/hqdefault.jpg`;

          return (
            <div
              key={lesson.id}
              className="lesson-card"
              onClick={() => navigate(`/lesson/${lesson.id}`)}
            >
              <div className="thumb-wrapper">
                <img src={thumbUrl} alt={lesson.title} className="lesson-thumb" />
                <div className="play-overlay">
                  <span className="play-icon">▶</span>
                </div>
              </div>
              
              <div className="lesson-info">
                <h3 className="lesson-card-title">{lesson.title}</h3>
                <p className="lesson-desc">{lesson.description?.substring(0, 80)}...</p>
                <div className="lesson-meta">
                  <span className="tag">Video Lesson</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}