import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../auth/apiClient";
import { getUser, logout } from "../auth/authUtils";

// ─── Helpers dùng chung ───────────────────────────────────────────────────────
function parseMistakes(raw) {
    if (!raw) return { missing_words: [], wrong_words: [] };
    try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        return {
            missing_words: (parsed.word_analysis || []).filter(w => w.status === "wrong").map(w => w.word),
            wrong_words: parsed.extra_words || [],
        };
    } catch {
        const wrongWords = [], extraWords = [];
        const wordRegex = /\{word=([^,}]+(?:,(?!\s*status))*)\s*,\s*status=wrong\}/g;
        let m;
        while ((m = wordRegex.exec(raw)) !== null) wrongWords.push(m[1].trim());
        const extraMatch = raw.match(/extra_words=\[([^\]]*)\]/);
        if (extraMatch?.[1]) extraMatch[1].split(",").map(w => w.trim()).filter(Boolean).forEach(w => extraWords.push(w));
        return { missing_words: wrongWords, wrong_words: extraWords };
    }
}

function formatDate(str) {
    if (!str) return "";
    return new Date(str).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── Avatar Component ─────────────────────────────────────────────────────────
function Avatar({ user, size = "md" }) {
    const sizeClass = size === "lg" ? "w-16 h-16 text-2xl" : "w-9 h-9 text-sm";
    if (user?.avatarUrl) {
        return <img src={user.avatarUrl} alt={user.username} className={`${sizeClass} rounded-full object-cover ring-2 ring-white`} />;
    }
    const initials = (user?.username || "U").charAt(0).toUpperCase();
    return (
        <div className={`${sizeClass} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold ring-2 ring-white`}>
            {initials}
        </div>
    );
}

// ─── Tab 1: Tổng Quan ─────────────────────────────────────────────────────────
function OverviewTab({ history, savedWords }) {
    const navigate = useNavigate();
    const avgScore = history.length ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length) : 0;
    const bestScore = history.length ? Math.round(Math.max(...history.map(h => h.score))) : 0;
    const recent = history.slice(0, 5);

    const statCls = (score) => score >= 85 ? "text-green-600" : score >= 60 ? "text-amber-600" : "text-red-500";

    return (
        <div className="space-y-6">
            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Tổng lần luyện", value: history.length, icon: "🎯", color: "from-blue-500 to-indigo-600" },
                    { label: "Điểm trung bình", value: avgScore, icon: "📊", color: "from-purple-500 to-pink-600", cls: statCls(avgScore) },
                    { label: "Điểm cao nhất", value: bestScore, icon: "🏆", color: "from-amber-400 to-orange-500", cls: statCls(bestScore) },
                    { label: "Từ đã lưu", value: savedWords.length, icon: "📚", color: "from-emerald-500 to-teal-600" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg mb-3`}>
                            {stat.icon}
                        </div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{stat.label}</p>
                        <p className={`text-3xl font-black mt-1 ${stat.cls || "text-gray-900"}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">⏱ Hoạt động gần đây</h3>
                {recent.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-400 text-sm mb-3">Chưa có lần luyện tập nào.</p>
                        <button onClick={() => navigate("/")} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500">
                            Bắt đầu ngay →
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recent.map((item) => {
                            const score = Math.round(item.score);
                            const scoreCls = score >= 85 ? "bg-green-50 text-green-700" : score >= 60 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600";
                            return (
                                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${scoreCls}`}>
                                        {score}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{item.expectedTextSnapshot}</p>
                                        <p className="text-xs text-gray-400">{formatDate(item.createdAt)}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Tab 2: Lịch Sử Luyện Tập ────────────────────────────────────────────────
function HistoryTab({ history, loading, error }) {
    const navigate = useNavigate();
    const [openId, setOpenId] = useState(null);

    if (loading) return <div className="text-center py-16 text-gray-400">Đang tải...</div>;
    if (error) return <div className="text-center py-16 text-red-400">{error}</div>;
    if (history.length === 0) return (
        <div className="text-center py-16">
            <p className="text-gray-400 mb-4">Chưa có lần luyện tập nào.</p>
            <button onClick={() => navigate("/")} className="px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500">Bắt đầu luyện tập</button>
        </div>
    );

    return (
        <div className="flex flex-col gap-2.5">
            {history.map((item) => {
                const mistakes = parseMistakes(item.mistakes);
                const missing = mistakes.missing_words || [];
                const wrong = mistakes.wrong_words || [];
                const isOpen = openId === item.id;
                const lessonId = item.sentence?.lesson?.id;
                const lessonTitle = item.sentence?.lesson?.title || "Bài học";
                const show2m = missing.slice(0, 2);
                const show2w = wrong.slice(0, 2);
                const extra = missing.length + wrong.length - show2m.length - show2w.length;

                return (
                    <div key={item.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                        <div className="flex items-stretch">
                            {/* Score */}
                            <div className="flex flex-col items-center justify-center px-3.5 py-4 gap-1.5 border-r border-gray-100">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${item.score >= 85 ? "bg-green-50 text-green-800" : item.score >= 60 ? "bg-amber-50 text-amber-800" : "bg-red-50 text-red-700"}`}>
                                    {Math.round(item.score)}
                                </div>
                            </div>
                            {/* Body */}
                            <div className="flex-1 min-w-0 px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setOpenId(isOpen ? null : item.id)}>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">{lessonTitle}</span>
                                    <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
                                </div>
                                <p className="text-sm font-medium text-gray-900 truncate mb-1">{item.expectedTextSnapshot}</p>
                                <p className="text-xs text-gray-400 italic truncate mb-2">"{item.transcript}"</p>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {!missing.length && !wrong.length ? (
                                        <span className="text-xs text-green-700 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block" />Không có lỗi</span>
                                    ) : (
                                        <>
                                            {show2m.map(w => <span key={w} className="text-xs px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded-full">{w} — thiếu</span>)}
                                            {show2w.map(w => <span key={w} className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full">{w} — sai</span>)}
                                            {extra > 0 && <span className="text-xs text-gray-400">+{extra} từ khác</span>}
                                        </>
                                    )}
                                </div>
                            </div>
                            {/* Actions */}
                            <div className="flex flex-col border-l border-gray-100 min-w-[110px]">
                                <button onClick={() => lessonId && navigate(`/lesson/${lessonId}`)} className="flex-1 flex flex-col items-center justify-center gap-1 px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition-colors group">
                                    <span className="text-base text-gray-300 group-hover:text-blue-500">▶</span>
                                    <span className="text-xs text-gray-400 group-hover:text-blue-600 text-center leading-tight">Luyện lại</span>
                                </button>
                                <button onClick={() => setOpenId(isOpen ? null : item.id)} className="flex-1 flex flex-col items-center justify-center gap-1 px-4 py-3 hover:bg-gray-50 transition-colors">
                                    <span className="text-xs text-gray-300">{isOpen ? "▲" : "▼"}</span>
                                    <span className="text-xs text-gray-400">Chi tiết</span>
                                </button>
                            </div>
                        </div>
                        {isOpen && (
                            <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-3">
                                    <div><p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Câu gốc</p><p className="text-sm text-gray-800">{item.expectedTextSnapshot}</p></div>
                                    <div><p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Bạn đã nói</p><p className="text-sm text-gray-500 italic">"{item.transcript}"</p></div>
                                </div>
                                <div className="border-l border-gray-200 pl-4">
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Nhận xét</p>
                                    {!missing.length && !wrong.length ? (
                                        <span className="text-sm text-green-700">✅ Phát âm xuất sắc!</span>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {missing.map(w => <span key={w} className="text-xs px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded-full">{w} — thiếu</span>)}
                                            {wrong.map(w => <span key={w} className="text-xs px-2 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full">{w} — sai</span>)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── Tab 3: Từ Vựng Đã Lưu ───────────────────────────────────────────────────
function SavedVocabTab({ words, loading, onDelete, onRefresh }) {
    const [flashcardMode, setFlashcardMode] = useState(false);
    const [shuffled, setShuffled] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [remembered, setRemembered] = useState([]);
    const [done, setDone] = useState(false);

    const startFlashcard = () => {
        const arr = [...words].sort(() => Math.random() - 0.5); // xáo ngẫu nhiên
        setShuffled(arr);
        setCurrentIndex(0);
        setIsFlipped(false);
        setRemembered([]);
        setDone(false);
        setFlashcardMode(true);
    };

    const handleAnswer = (ok) => {
        if (ok) setRemembered(r => [...r, shuffled[currentIndex].id]);
        if (currentIndex + 1 >= shuffled.length) { setDone(true); return; }
        setCurrentIndex(i => i + 1);
        setIsFlipped(false);
    };

    const playAudio = (word) => {
        const u = new SpeechSynthesisUtterance(word);
        u.lang = "en-US"; u.rate = 0.9;
        window.speechSynthesis.speak(u);
    };

    // ── Flashcard mode ──
    if (flashcardMode) {
        if (done) return (
            <div className="flex flex-col items-center justify-center py-16 gap-6">
                <div className="text-6xl">🎉</div>
                <div className="text-center">
                    <h3 className="text-2xl font-black text-gray-900 mb-1">Hoàn thành!</h3>
                    <p className="text-gray-500">Đã nhớ <strong className="text-green-600">{remembered.length}</strong> / {shuffled.length} từ</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={startFlashcard} className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500">🔁 Làm lại</button>
                    <button onClick={() => setFlashcardMode(false)} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50">← Danh sách</button>
                </div>
            </div>
        );

        const current = shuffled[currentIndex];
        return (
            <div className="max-w-lg mx-auto py-6">
                {/* Progress */}
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => setFlashcardMode(false)} className="text-sm text-gray-400 hover:text-gray-700">← Thoát</button>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${(currentIndex / shuffled.length) * 100}%` }} />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">{currentIndex + 1}/{shuffled.length}</span>
                </div>

                {/* Card */}
                <div className="relative cursor-pointer mb-8" style={{ perspective: "1000px" }} onClick={() => { setIsFlipped(f => !f); if (!isFlipped) playAudio(current.word); }}>
                    <div className="relative w-full rounded-3xl shadow-xl transition-transform duration-500" style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)", minHeight: "260px" }}>
                        <div className="absolute inset-0 bg-white rounded-3xl flex flex-col items-center justify-center p-8" style={{ backfaceVisibility: "hidden" }}>
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Từ tiếng Anh</p>
                            <h2 className="text-4xl font-extrabold text-gray-900 mb-2">{current.word}</h2>
                            {current.ipa && <p className="text-gray-400 font-mono text-sm">{current.ipa}</p>}
                            <p className="text-xs text-gray-300 mt-6">Nhấn để xem nghĩa ↓</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl flex flex-col items-center justify-center p-8" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                            <p className="text-xs text-indigo-200 uppercase tracking-widest mb-4">Nghĩa tiếng Việt</p>
                            <h2 className="text-3xl font-extrabold text-white mb-2 text-center">{current.translation}</h2>
                            {current.example && <p className="text-sm text-indigo-200 italic text-center mt-3">"{current.example}"</p>}
                        </div>
                    </div>
                </div>

                {isFlipped ? (
                    <div className="flex gap-4">
                        <button onClick={() => handleAnswer(false)} className="flex-1 py-3.5 bg-amber-50 text-amber-700 font-bold rounded-2xl border-2 border-amber-200 hover:bg-amber-100 transition-all">🔄 Ôn lại</button>
                        <button onClick={() => handleAnswer(true)} className="flex-1 py-3.5 bg-green-50 text-green-700 font-bold rounded-2xl border-2 border-green-200 hover:bg-green-100 transition-all">✅ Đã nhớ!</button>
                    </div>
                ) : (
                    <p className="text-center text-gray-400 text-sm">Nhẩm nghĩa rồi nhấn thẻ để kiểm tra</p>
                )}
            </div>
        );
    }

    // ── List mode ──
    if (loading) return <div className="text-center py-16 text-gray-400">Đang tải...</div>;

    if (words.length === 0) return (
        <div className="text-center py-16">
            <div className="text-4xl mb-4">📚</div>
            <p className="text-gray-400 text-sm">Chưa có từ nào được lưu.</p>
            <p className="text-gray-300 text-xs mt-1">Hãy nhấn "Lưu từ vựng" khi tra từ điển trong bài học!</p>
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500"><span className="font-semibold text-gray-900">{words.length}</span> từ đã lưu</p>
                <button onClick={startFlashcard} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition-colors">
                    🃏 Luyện Flashcard
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {words.map((vocab) => (
                    <div key={vocab.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-gray-900">{vocab.word}</span>
                                {vocab.ipa && <span className="text-xs text-gray-400 font-mono">{vocab.ipa}</span>}
                                <button onClick={() => playAudio(vocab.word)} className="ml-auto text-gray-300 hover:text-indigo-500 transition-colors">🔊</button>
                            </div>
                            <p className="text-sm text-indigo-700 font-medium">{vocab.translation}</p>
                            {vocab.example && <p className="text-xs text-gray-400 italic mt-1 truncate">"{vocab.example}"</p>}
                            <p className="text-xs text-gray-300 mt-1">{formatDate(vocab.createdAt)}</p>
                        </div>
                        <button
                            onClick={() => onDelete(vocab.id)}
                            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                            title="Xóa từ"
                        >✕</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main: AccountDashboard ───────────────────────────────────────────────────
const TABS = [
    { id: "overview", label: "Tổng quan", icon: "📊" },
    { id: "history", label: "Lịch sử", icon: "📋" },
    { id: "vocabulary", label: "Từ đã lưu", icon: "💾" },
];

export default function AccountDashboard() {
    const navigate = useNavigate();
    const user = getUser();

    const [activeTab, setActiveTab] = useState("overview");
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState("");
    const [savedWords, setSavedWords] = useState([]);
    const [vocabLoading, setVocabLoading] = useState(true);

    useEffect(() => {
        if (!user) { navigate("/login"); return; }

        // Load lịch sử luyện tập
        api.get("/api/evaluate/history")
            .then(res => { if (!res.ok) throw new Error("Không thể tải lịch sử"); return res.json(); })
            .then(setHistory)
            .catch(err => setHistoryError(err.message))
            .finally(() => setHistoryLoading(false));

        // Load từ vựng đã lưu
        api.get("/api/user-vocabulary")
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(setSavedWords)
            .catch(() => { })
            .finally(() => setVocabLoading(false));
    }, []);

    const handleDeleteWord = useCallback(async (id) => {
        if (!window.confirm("Xóa từ này khỏi sổ của bạn?")) return;
        const res = await api.delete(`/api/user-vocabulary/${id}`);
        if (res.ok) setSavedWords(prev => prev.filter(w => w.id !== id));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

                {/* Profile Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex items-center gap-5">
                    <Avatar user={user} size="lg" />
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-gray-900 truncate">{user?.username}</h1>
                        <p className="text-sm text-gray-400">{user?.email || "Chưa cập nhật email"}</p>
                        <span className="inline-block mt-1 text-xs px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                            {user?.role || "USER"}
                        </span>
                    </div>
                    <button
                        onClick={() => { logout(); navigate("/login"); }}
                        className="shrink-0 px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                    >
                        Đăng xuất
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all
                                ${activeTab === tab.id ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
                        >
                            <span>{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div>
                    {activeTab === "overview" && (
                        <OverviewTab history={history} savedWords={savedWords} />
                    )}
                    {activeTab === "history" && (
                        <HistoryTab history={history} loading={historyLoading} error={historyError} />
                    )}
                    {activeTab === "vocabulary" && (
                        <SavedVocabTab words={savedWords} loading={vocabLoading} onDelete={handleDeleteWord} />
                    )}
                </div>
            </div>
        </div>
    );
}
