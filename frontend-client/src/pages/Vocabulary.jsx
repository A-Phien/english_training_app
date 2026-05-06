import { useState, useEffect } from "react";
import { api } from "../auth/apiClient";

// ─────────────────────────────────────────────
// Màn hình 1: Chọn Chủ Đề
// ─────────────────────────────────────────────
function TopicGrid({ topics, onSelect }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,var(--page-bg-soft),var(--page-bg))] text-[var(--text-primary)]">
      <div className="max-w-5xl mx-auto px-6 py-12">

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 text-[var(--text-primary)]">
            📚 Học Từ Vựng
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">Chọn một chủ đề để bắt đầu học hôm nay</p>
        </div>

        {topics.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🌱</div>
            <p>Chưa có chủ đề nào. Admin hãy thêm dữ liệu!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => onSelect(topic)}
                className="group relative rounded-2xl p-6 shadow-sm border bg-[var(--surface-bg)] border-[var(--border-color)]
                           hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200
                           transition-all duration-300 text-left"
              >
                {/* Icon */}
                <div className="text-4xl mb-4">{topic.icon || "📖"}</div>

                {/* Tên chủ đề */}
                <h3 className="mb-1 text-xl font-bold text-[var(--text-primary)] transition-colors group-hover:text-indigo-600">
                  {topic.name}
                </h3>

                {/* Mô tả */}
                <p className="mb-4 min-h-[40px] text-sm text-[var(--text-secondary)]">
                  {topic.description || "Luyện tập từ vựng theo chủ đề này"}
                </p>

                {/* Số từ vựng */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {topic.wordCount} từ vựng
                  </span>
                  <span className="text-lg text-[var(--text-muted)] transition-colors group-hover:text-indigo-400">→</span>
                </div>

                {/* Gradient overlay khi hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5
                                opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Màn hình 2: Danh sách từ vựng của chủ đề
// ─────────────────────────────────────────────
function VocabularyList({ topic, words, onBack, onStartFlashcard }) {
  const [showTranslation, setShowTranslation] = useState(true);

  const playAudio = (word) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,var(--page-bg-soft),var(--page-bg))] text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            ← Quay lại
          </button>
          <div className="w-px h-4 bg-[var(--border-color)]" />
          <div className="flex items-center gap-2">
            <span className="text-2xl">{topic.icon || "📖"}</span>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{topic.name}</h2>
          </div>
          <span className="ml-auto text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            {words.length} từ
          </span>
        </div>

        {/* Công cụ */}
        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-[var(--text-secondary)]">
            <div
              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors duration-300 ${showTranslation ? "bg-indigo-500" : "bg-gray-300"}`}
              onClick={() => setShowTranslation(!showTranslation)}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow transition-transform duration-300 ${showTranslation ? "translate-x-5" : "translate-x-0"}`} />
            </div>
            Hiện bản dịch
          </label>

          <button
            onClick={onStartFlashcard}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold
                       rounded-xl shadow-md hover:bg-indigo-500 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            🃏 Luyện Tập Flashcard
          </button>
        </div>

        {/* Danh sách từ - 2 cột */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {words.map((vocab, index) => (
            <div
              key={vocab.id}
              className="rounded-xl border p-4 shadow-sm bg-[var(--surface-bg)] border-[var(--border-color)]
                         hover:border-indigo-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Số thứ tự + Từ tiếng Anh */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[var(--text-muted)]">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-base font-bold text-[var(--text-primary)]">{vocab.word}</span>
                    {vocab.ipa && (
                      <span className="text-xs font-mono text-[var(--text-muted)]">{vocab.ipa}</span>
                    )}
                  </div>

                  {/* Nghĩa tiếng Việt */}
                  {showTranslation && (
                    <p className="text-sm text-indigo-700 font-medium pl-7">{vocab.translation}</p>
                  )}

                  {/* Câu ví dụ */}
                  {showTranslation && vocab.example && (
                    <p className="mt-1 pl-7 text-xs italic text-[var(--text-muted)]">"{vocab.example}"</p>
                  )}
                </div>

                {/* Nút phát âm */}
                <button
                  onClick={() => playAudio(vocab.word)}
                  className="ml-2 flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition-all hover:bg-indigo-50 hover:text-indigo-500"
                  title="Phát âm"
                >
                  🔊
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Nút luyện tập dưới cùng */}
        <div className="mt-10 text-center">
          <button
            onClick={onStartFlashcard}
            className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-base font-bold
                       rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            🃏 Bắt Đầu Luyện Tập Flashcard
          </button>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Tự kiểm tra trí nhớ của bạn sau khi đã học xong!</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Màn hình 3: Luyện tập Flashcard
// ─────────────────────────────────────────────
function FlashcardMode({ topic, words, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [remembered, setRemembered] = useState([]); // mảng id đã nhớ
  const [forgotten, setForgotten] = useState([]);   // mảng id cần ôn lại
  const [done, setDone] = useState(false);

  const current = words[currentIndex];

  const playAudio = (word) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) playAudio(current.word);
  };

  const handleAnswer = (isRemembered) => {
    if (isRemembered) {
      setRemembered([...remembered, current.id]);
    } else {
      setForgotten([...forgotten, current.id]);
    }

    if (currentIndex + 1 >= words.length) {
      setDone(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setRemembered([]);
    setForgotten([]);
    setDone(false);
  };

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,var(--page-bg-soft),var(--page-bg))] text-[var(--text-primary)]">
        <div className="max-w-md w-full mx-auto px-6 text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Hoàn thành!</h2>
          <p className="mb-8 text-[var(--text-secondary)]">Bạn vừa hoàn thành {words.length} từ vựng của chủ đề <strong>{topic.name}</strong></p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
              <div className="text-3xl font-black text-green-600">{remembered.length}</div>
              <div className="text-sm text-green-700 mt-1">✅ Đã nhớ</div>
            </div>
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
              <div className="text-3xl font-black text-amber-600">{forgotten.length}</div>
              <div className="text-sm text-amber-700 mt-1">🔄 Cần ôn lại</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleRestart}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors"
            >
              🔁 Làm lại từ đầu
            </button>
            <button
              onClick={onBack}
              className="w-full rounded-xl border py-3 font-medium transition-colors bg-[var(--surface-bg)] text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--surface-hover)]"
            >
              ← Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,var(--page-bg-soft),var(--page-bg))] text-[var(--text-primary)]">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={onBack} className="text-sm transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            ← Thoát
          </button>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex) / words.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-[var(--text-secondary)]">{currentIndex + 1}/{words.length}</span>
        </div>

        {/* Flashcard */}
        <div
          className="relative cursor-pointer mb-8"
          style={{ perspective: "1000px" }}
          onClick={handleFlip}
        >
          <div
            className="relative w-full rounded-3xl shadow-2xl transition-transform duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              minHeight: "320px",
            }}
          >
            {/* Mặt trước — Tiếng Anh */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl p-10 bg-[var(--surface-bg)]"
              style={{ backfaceVisibility: "hidden" }}
            >
              <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Từ tiếng Anh</p>
              <h2 className="mb-4 text-center text-5xl font-extrabold text-[var(--text-primary)]">{current.word}</h2>
              {current.ipa && (
                <p className="font-mono text-lg text-[var(--text-muted)]">{current.ipa}</p>
              )}
              <p className="mt-8 text-sm text-[var(--text-muted)]">Nhấn vào thẻ để xem nghĩa ↓</p>
            </div>

            {/* Mặt sau — Tiếng Việt */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl flex flex-col items-center justify-center p-10"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <p className="text-xs text-indigo-200 uppercase tracking-widest mb-6 font-semibold">Nghĩa tiếng Việt</p>
              <h2 className="text-4xl font-extrabold text-white text-center mb-4">{current.translation}</h2>
              {current.example && (
                <p className="text-sm text-indigo-200 italic text-center mt-4 px-4">"{current.example}"</p>
              )}
              {current.exampleTranslation && (
                <p className="text-xs text-indigo-300 text-center mt-2">({current.exampleTranslation})</p>
              )}
            </div>
          </div>
        </div>

        {/* Nút phán xét - chỉ hiện sau khi lật thẻ */}
        {isFlipped ? (
          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 py-4 bg-amber-50 text-amber-700 font-bold rounded-2xl border-2 border-amber-200
                         hover:bg-amber-100 hover:border-amber-400 transition-all text-base"
            >
              🔄 Cần ôn lại
            </button>
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 py-4 bg-green-50 text-green-700 font-bold rounded-2xl border-2 border-green-200
                         hover:bg-green-100 hover:border-green-400 transition-all text-base"
            >
              ✅ Đã nhớ rồi!
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-[var(--text-muted)]">Hãy nhẩm nghĩa của từ này, rồi nhấn thẻ để kiểm tra</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Component chính — Điều phối 3 màn hình
// ─────────────────────────────────────────────
export default function Vocabulary() {
  // screen: "topics" | "list" | "flashcard"
  const [screen, setScreen] = useState("topics");
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tải danh sách chủ đề khi vào trang
  useEffect(() => {
    api.get("/api/topics")
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải chủ đề");
        return res.json();
      })
      .then(setTopics)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Khi chọn một chủ đề → tải từ vựng
  const handleSelectTopic = async (topic) => {
    setSelectedTopic(topic);
    setLoading(true);
    try {
      const res = await api.get(`/api/topics/${topic.id}/vocabularies`);
      if (!res.ok) throw new Error("Không thể tải từ vựng");
      const data = await res.json();
      setWords(data);
      setScreen("list");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,var(--page-bg-soft),var(--page-bg))]">
        <div className="flex flex-col items-center gap-4 text-[var(--text-muted)]">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-400 border-t-transparent rounded-full" />
          <p className="text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (screen === "flashcard") {
    return (
      <FlashcardMode
        topic={selectedTopic}
        words={words}
        onBack={() => setScreen("list")}
      />
    );
  }

  if (screen === "list") {
    return (
      <VocabularyList
        topic={selectedTopic}
        words={words}
        onBack={() => setScreen("topics")}
        onStartFlashcard={() => setScreen("flashcard")}
      />
    );
  }

  return <TopicGrid topics={topics} onSelect={handleSelectTopic} />;
}
