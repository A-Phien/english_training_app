import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../assets/css/lessondetail.css";
import Recorder from "./Recorder";
import { api } from "../auth/apiClient";

export default function LessonDetail() {
  // --- 1. KHAI BÁO STATE ---
  const { id } = useParams();
  const navigate = useNavigate();
  const [sentences, setSentences] = useState([]);
  const [videoId, setVideoId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSentenceId, setActiveSentenceId] = useState(null);
  const [isLooping, setIsLooping] = useState(false);
  const [selectedSentenceId, setSelectedSentenceId] = useState(null);
  const [error, setError] = useState("");

  // --- 2. KHAI BÁO REFS ---
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const activeSentenceRef = useRef(null);

  // --- 3. LOAD YOUTUBE API ---
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  }, []);

  // --- 4. FETCH DỮ LIỆU BÀI HỌC & CÂU ---
  useEffect(() => {
    // Fetch lesson info
    api.get(`/api/lessons/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải bài học");
        return res.json();
      })
      .then((data) => {
        setLessonTitle(data.title);
        const vid =
          data.youtubeUrl?.split("v=")[1]?.split("&")[0] || data.videoId;
        setVideoId(vid);
      })
      .catch((err) => setError(err.message));


    // Fetch sentences
    api.get(`/api/sentences/lesson/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải câu");
        return res.json();
      })
      .then((data) => {
        const sorted = data.sort((a, b) => a.startTime - b.startTime);
        setSentences(sorted);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  // --- 5. KHỞI TẠO YOUTUBE PLAYER ---
  useEffect(() => {
    if (!videoId) return;

    const initPlayer = () => {
      playerRef.current = new window.YT.Player("yt-player", {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, controls: 1 },
        events: {
          onReady: () => {
            intervalRef.current = setInterval(() => {
              if (playerRef.current?.getCurrentTime) {
                const now = playerRef.current.getCurrentTime();
                setCurrentTime(now);
              }
            }, 200);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, [videoId]);

  // --- 6. TỰ ĐỘNG HIGHLIGHT CÂU ĐANG PHÁT ---
  useEffect(() => {
    if (!sentences.length || isLooping) return;

    const active = sentences.find(
      (s) => currentTime >= s.startTime && currentTime <= s.endTime
    );
    if (active && active.id !== activeSentenceId) {
      setActiveSentenceId(active.id);
    }
  }, [currentTime, sentences, isLooping, activeSentenceId]);

  // --- 7. LOGIC LẶP ĐOẠN (A-B REPEAT) ---
  useEffect(() => {
    if (isLooping && activeSentenceId) {
      const active = sentences.find((s) => s.id === activeSentenceId);
      if (active && currentTime >= active.endTime) {
        playerRef.current.seekTo(active.startTime, true);
      }
    }
  }, [currentTime, isLooping, activeSentenceId, sentences]);

  // --- 8. TỰ ĐỘNG CUỘN MÀN HÌNH ---
  useEffect(() => {
    if (activeSentenceRef.current) {
      activeSentenceRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeSentenceId]);

  // --- 9. XỬ LÝ SỰ KIỆN CLICK CÂU ---
  const handleSentenceClick = useCallback((sentence) => {
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(sentence.startTime, true);
      playerRef.current.playVideo();
    }
    setActiveSentenceId(sentence.id);
    setSelectedSentenceId(sentence.id);
  }, []);

  const toggleLoop = () => setIsLooping(!isLooping);

  const activeSentenceData =
    sentences.find((s) => s.id === activeSentenceId) || sentences[0];

  return (
    <div className="lesson-page">
      <div className="header-actions">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
        <h1 className="lesson-title">{lessonTitle || "Loading..."}</h1>
      </div>

      {error && (
        <div style={{ color: "red", padding: "8px 16px" }}>{error}</div>
      )}

      <div className="lesson-layout">
        {/* CỘT TRÁI: VIDEO & SHADOWING */}
        <div className="left-column">
          <div className="video-container">
            <div id="yt-player" />
          </div>

          <div className="shadowing-box">
            {activeSentenceData ? (
              <>
                <div className="active-text-display">
                  {activeSentenceData.content}
                </div>
                <div className="phonetic-text">[{activeSentenceData.ipa}]</div>
                <div className="translation-text">
                  {activeSentenceData.translation}
                </div>

                <div className="shadowing-controls">
                  <button
                    className={`btn-control ${isLooping ? "active-loop" : ""}`}
                    onClick={toggleLoop}
                  >
                    {isLooping ? "🔄 Looping On" : "🔁 Loop Sentence"}
                  </button>

                  <Recorder
                    sentenceId={activeSentenceData.id}
                    expectedText={activeSentenceData.content}
                  />
                </div>
              </>
            ) : (
              <div className="empty-state">No sentence active</div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: DANH SÁCH CÂU (SCRIPT) */}
        <div className="right-column">
          <div className="script-header">
            <span>Script / Sentences</span>
            <span className="sentence-count">({sentences.length})</span>
          </div>

          <div className="sentences-list">
            {sentences.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📭</div>
                <p>No sentences found</p>
              </div>
            ) : (
              sentences.map((sentence, index) => {
                const isActive = sentence.id === activeSentenceId;
                const isSelected = sentence.id === selectedSentenceId;

                return (
                  <div key={sentence.id} className="sentence-item-container">
                    <div
                      ref={isActive ? activeSentenceRef : null}
                      className={`sentence-card ${isActive ? "active" : ""} ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSentenceClick(sentence)}
                    >
                      <div className="card-header">
                        <span className="sentence-number">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {isActive && (
                          <div className="status-badge">
                            <span className="playing-icon">🔊</span>
                            <span className="status-text">PLAYING</span>
                          </div>
                        )}
                      </div>

                      <div className="card-body">
                        <div className="original-text">{sentence.content}</div>
                        <div className="meta-info">
                          <span className="ipa-text">[{sentence.ipa}]</span>
                          <span className="translation-text">
                            {sentence.translation}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="inline-recorder-box">
                        <Recorder
                          sentenceId={sentence.id}
                          expectedText={sentence.content}
                          onResult={(data) => console.log("Result:", data)}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}