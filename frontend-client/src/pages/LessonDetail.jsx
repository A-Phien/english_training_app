import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Recorder from "./Recorder";
import { api } from "../auth/apiClient";
import ClickableSentence from "../components/ClickableSentence";
import WordDictionaryPopup from "../components/WordDictionaryPopup";
import DictationBox from "../components/DictationBox";
import { useTranslation } from "react-i18next";

export default function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sentences, setSentences] = useState([]);
  const [videoId, setVideoId] = useState("");
  const [lessonTitle, setLessonTitle] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSentenceId, setActiveSentenceId] = useState(null);
  const [duration, setDuration] = useState(0);
  const [youtubePlayer, setYoutubePlayer] = useState(null);
  const [activeTab, setActiveTab] = useState("shadowing");
  const [autoStop, setAutoStop] = useState(false);
  const [autoLoopSentence, setAutoLoopSentence] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [isLooping, setIsLooping] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const activeSentenceRef = useRef(null);
  const lastStoppedId = useRef(null);

  // State Tra Từ Điển
  const [activeWord, setActiveWord] = useState("");
  const [popupPosition, setPopupPosition] = useState(null);

  const handleWordClick = useCallback((word, event) => {
    setActiveWord(word);
    setPopupPosition({ top: event.clientY, left: event.clientX });
  }, []);

  // --- LOAD YOUTUBE API ---
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  }, []);

  // --- FETCH BÀI HỌC & CÂU ---
  useEffect(() => {
    api.get(`/api/lessons/${id}`)
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => {
        setLessonTitle(data.title);
        setYoutubePlayer(data.youtubeUrl);
        const vid = data.youtubeUrl?.split("v=")[1]?.split("&")[0] || data.videoId;
        setVideoId(vid);
      })
      .catch(console.error);

    api.get(`/api/sentences/lesson/${id}`)
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((data) => setSentences(data.sort((a, b) => a.startTime - b.startTime)))
      .catch(console.error);
  }, [id]);

  // --- KHỞI TẠO YOUTUBE PLAYER ---
  useEffect(() => {
    if (!videoId) return;
    const initPlayer = () => {
      playerRef.current = new window.YT.Player("yt-player", {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, controls: 1 },
        events: {
          onReady: (event) => {
            setDuration(event.target.getDuration());
            intervalRef.current = setInterval(() => {
              if (playerRef.current?.getCurrentTime)
                setCurrentTime(playerRef.current.getCurrentTime());
            }, 200);
          },
        },
      });
    };
    if (window.YT && window.YT.Player) initPlayer();
    else window.onYouTubeIframeAPIReady = initPlayer;
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, [videoId]);

  // --- HIGHLIGHT CÂU ĐANG PHÁT ---
  useEffect(() => {
    if (!sentences.length || isLooping || !playerRef.current) return;
    const currentSentence = sentences.find((s) => s.id === activeSentenceId);
    if (currentSentence && currentTime >= currentSentence.endTime - 0.15) {
      if (autoLoopSentence) {
        playerRef.current.seekTo(currentSentence.startTime, true);
        playerRef.current.playVideo();
        return;
      } else if (autoStop && lastStoppedId.current !== currentSentence.id) {
        playerRef.current.pauseVideo();
        lastStoppedId.current = currentSentence.id;
      }
    }
    const active = sentences.find((s) => currentTime >= s.startTime && currentTime <= s.endTime);
    if (active && active.id !== activeSentenceId) {
      setActiveSentenceId(active.id);
      lastStoppedId.current = null;
    }
  }, [currentTime, sentences, isLooping, activeSentenceId, autoLoopSentence, autoStop]);

  // --- LẶP ĐOẠN A-B ---
  useEffect(() => {
    if (isLooping && activeSentenceId) {
      const active = sentences.find((s) => s.id === activeSentenceId);
      if (active && currentTime >= active.endTime)
        playerRef.current.seekTo(active.startTime, true);
    }
  }, [currentTime, isLooping, activeSentenceId, sentences]);

  // --- TỰ CUỘN ---
  useEffect(() => {
    activeSentenceRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeSentenceId]);

  const activeSentenceData = sentences.find((s) => s.id === activeSentenceId) || sentences[0];

  const handleSentenceClick = useCallback((sentence) => {
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(sentence.startTime, true);
      playerRef.current.playVideo();
    }
    setActiveSentenceId(sentence.id);
  }, []);

  const formatTime = (t) => {
    if (!t || isNaN(t)) return "0:00";
    const m = Math.floor(t / 60), s = Math.floor(t % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)] py-6 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-screen-2xl mx-auto">

        {/* NÚT QUAY LẠI */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 inline-flex items-center gap-1.5 bg-[var(--surface-bg)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[var(--surface-hover)] transition-colors"
        >
          {t("lesson.back")}
        </button>

        {/* LAYOUT CHÍNH: 2 CỘT */}
        <div className="grid grid-cols-1 lg:grid-cols-13 gap-8">

          {/* ===== CỘT TRÁI ===== */}
          <div className="lg:col-span-8 flex flex-col">
            <h1 className="text-2xl font-bold mb-1">{lessonTitle || t("lesson.loading")}</h1>

            <div className="flex items-center text-sm text-[var(--text-secondary)] mb-4 gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <a href={youtubePlayer} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {t("lesson.watchOnYT")}
                </a>
              </span>
            </div>

            {/* Video 16:9 */}
            <div className="relative w-full rounded-xl overflow-hidden shadow-lg bg-black aspect-video">
              <div id="yt-player" className="absolute inset-0 w-full h-full" />
            </div>

            {/* VIETSUB BOX */}
            <div className="mt-5 min-h-[100px] bg-[var(--surface-bg)] border-2 border-dashed border-[var(--border-color)] rounded-xl p-4 shadow-sm flex flex-col items-center justify-center text-center transition-colors duration-300">
              {activeSentenceData ? (
                <>
                  <p className="text-xl font-bold mb-1.5">
                    <ClickableSentence text={activeSentenceData.content} onWordClick={handleWordClick} />
                  </p>
                  {showTranslation && (
                    <p className="text-base text-[var(--text-muted)] mb-1">{activeSentenceData.ipa}</p>
                  )}
                  {showTranslation && (
                    <p className="text-base text-blue-500 font-medium">{activeSentenceData.translation}</p>
                  )}

                  {activeTab === "shadowing" && (
                    <div className="w-full pt-5 border-t border-[var(--border-color)] mt-4">
                      <Recorder sentenceId={activeSentenceData.id} />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[var(--text-muted)] italic">{t("lesson.waitingSub")}</p>
              )}
            </div>
          </div>

          {/* ===== CỘT PHẢI ===== */}
          <div className="lg:col-span-5 flex flex-col h-[calc(100vh-150px)]">

            {/* TAB BAR */}
            <div className="flex bg-[var(--surface-bg)] border border-[var(--border-color)] rounded-lg p-1 gap-1 mb-3">
              {[
                { key: "shadowing", label: "Shadowing" },
                { key: "dictation", label: "Dictation" },
                { key: "teleprompter", label: "Teleprompter" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all
                    ${activeTab === key
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* SETTINGS */}
            <div className="bg-[var(--surface-bg)] border border-[var(--border-color)] rounded-xl p-3.5 mb-3 transition-colors duration-300">
              <div
                className="flex items-center gap-1.5 text-blue-500 font-semibold text-sm cursor-pointer select-none hover:text-blue-600"
                onClick={() => setShowSettings(!showSettings)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t("lesson.settings")} ({showSettings ? t("lesson.hide") : t("lesson.show")})
              </div>

              {showSettings && (
                <div className="grid grid-cols-2 gap-3 mt-3 text-sm text-[var(--text-primary)]">
                  <label className="flex justify-between items-center cursor-pointer">
                    <span>{t("lesson.autoStop")}</span>
                    <input
                      type="checkbox"
                      checked={autoStop}
                      onChange={() => setAutoStop(!autoStop)}
                      className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                    />
                  </label>
                  <label className="flex justify-between items-center cursor-pointer">
                    <span>{t("lesson.autoLoop")}</span>
                    <input
                      type="checkbox"
                      checked={autoLoopSentence}
                      onChange={() => setAutoLoopSentence(!autoLoopSentence)}
                      className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                    />
                  </label>
                  <label className="col-span-2 flex justify-between items-center pt-2 border-t border-[var(--border-color)] cursor-pointer">
                    <span>{t("lesson.showTranslation")}</span>
                    <div
                      onClick={() => setShowTranslation(!showTranslation)}
                      className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-300 cursor-pointer ${showTranslation ? "bg-blue-500" : "bg-[var(--border-color)]"}`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow transition-transform duration-300 ${showTranslation ? "translate-x-5" : "translate-x-0"}`} />
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* DANH SÁCH CÂU */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
              {sentences.length === 0 ? (
                <div className="text-center text-[var(--text-muted)] py-10">{t("lesson.loadingData")}</div>
              ) : (
                sentences.map((sentence, index) => {
                  const isActive = sentence.id === activeSentenceId;

                  // ── Tab DICTATION ──
                  if (activeTab === "dictation") {
                    return (
                      <div
                        key={sentence.id}
                        ref={isActive ? activeSentenceRef : null}
                        className={`p-4 rounded-xl border transition-all
                          ${isActive
                            ? "bg-[var(--page-bg-soft)] border-blue-400 shadow-sm"
                            : "bg-[var(--surface-bg)] border-[var(--border-color)] hover:border-blue-300"
                          }`}
                      >
                        <DictationBox
                          sentence={{ ...sentence, orderIndex: index }}
                          playerRef={playerRef}
                          showTranslation={showTranslation}
                        />
                      </div>
                    );
                  }

                  // ── Tab SHADOWING / TELEPROMPTER ──
                  return (
                    <div
                      key={sentence.id}
                      ref={isActive ? activeSentenceRef : null}
                      onClick={() => handleSentenceClick(sentence)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all
                        ${isActive
                          ? "bg-[var(--page-bg-soft)] border-blue-400 shadow-sm"
                          : "bg-[var(--surface-bg)] border-[var(--border-color)] hover:border-blue-300 hover:shadow-sm"
                        }`}
                    >
                      <p className={`font-medium mb-1 ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]"}`}>
                        <ClickableSentence text={sentence.content} onWordClick={handleWordClick} />
                      </p>
                      {showTranslation && (
                        <p className="text-sm text-[var(--text-muted)] mb-3">
                          {sentence.ipa}<br />{sentence.translation}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <button
                          className="bg-sky-400 hover:bg-sky-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleSentenceClick(sentence); }}
                        >
                          {t("lesson.listen")}
                        </button>
                        {isActive && (
                          <span className="text-xs text-blue-500 font-semibold">{t("lesson.playing")}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      </div>

      {/* POPUP TỪ ĐIỂN */}
      {activeWord && popupPosition && (
        <WordDictionaryPopup
          word={activeWord}
          position={popupPosition}
          onClose={() => setActiveWord("")}
        />
      )}
    </div>
  );
}