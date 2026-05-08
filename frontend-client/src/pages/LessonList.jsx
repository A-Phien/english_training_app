import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  }, [t]);

  const getYouTubeId = (lesson) => {
    if (lesson.videoId) return lesson.videoId;
    const url = lesson.youtubeUrl;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\\&v=)([^#\\&\\?]*).*/;
    const match = url?.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
          <p className="text-[var(--text-muted)] font-medium animate-pulse">{t("lessonList.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="glass-panel px-8 py-6 rounded-2xl text-center max-w-md">
          <div className="text-rose-500 text-5xl mb-4">⚠️</div>
          <p className="text-[var(--text-primary)] font-bold mb-2">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-[var(--surface-hover)] rounded-xl text-sm font-semibold hover:bg-[var(--border-color)]">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 animate-fade-in">
      <header className="text-center mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none"></div>
        <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text inline-block relative z-10 tracking-tight">
          English AI Training
        </h1>
        <p className="text-[var(--text-secondary)] text-lg md:text-xl font-medium max-w-2xl mx-auto">
          {t("lessonList.subtitle")}
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {lessons.map((lesson) => {
          const vId = getYouTubeId(lesson);
          const thumbUrl = `https://img.youtube.com/vi/${vId}/maxresdefault.jpg`;

          return (
            <div
              key={lesson.id}
              onClick={() => navigate(`/lesson/${lesson.id}`)}
              className="group glass-panel rounded-3xl overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col h-full relative"
            >
              {/* Thẻ Hover Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"></div>

              <div className="relative aspect-video overflow-hidden bg-black">
                <img 
                  src={thumbUrl} 
                  alt={lesson.title} 
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  onError={(e) => { e.target.src = `https://img.youtube.com/vi/${vId}/hqdefault.jpg`; }}
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center scale-90 group-hover:scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl border border-white/30">
                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                  </div>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1 relative z-20">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 text-xs font-bold bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-full border border-indigo-500/20">
                    Video Lesson
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 line-clamp-2 group-hover:text-indigo-500 transition-colors">
                  {lesson.title}
                </h3>
                <p className="text-[var(--text-secondary)] text-sm line-clamp-2 mb-4 flex-1">
                  {lesson.description || "No description provided."}
                </p>
                
                <div className="mt-auto pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-muted)] group-hover:text-indigo-500 transition-colors">
                    Watch & Practice ➔
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}