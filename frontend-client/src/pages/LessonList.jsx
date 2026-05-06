import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/lessonlist.css";
import { api } from "../auth/apiClient";
import { useTranslation } from "react-i18next";

export default function LessonList() {
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();


  useEffect(() => {
    api.get("/api/lessons")
      .then((res) => {
        if (!res.ok) throw new Error(t("lessonList.errorLoad"));
        return res.json();
      })
      .then((data) => setLessons(data))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const getYouTubeId = (lesson) => {
    if (lesson.videoId) return lesson.videoId;
    const url = lesson.youtubeUrl;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\\&v=)([^#\\&\\?]*).*/;
    const match = url?.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (isLoading) return <div className="container"><p>{t("lessonList.loading")}</p></div>;
  if (error) return <div className="container"><p style={{ color: "red" }}>{error}</p></div>;

  return (
    <div className="container">
      <header className="list-header">
        <h1>🎬 English AI Training</h1>
        <p>{t("lessonList.subtitle")}</p>
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