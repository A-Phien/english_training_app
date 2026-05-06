import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../auth/apiClient";
import { getUser, logout } from "../auth/authUtils";
import { useTranslation } from "react-i18next";

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
function OverviewTab({ history, savedWords, t }) {
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
                    { label: t("account.stats.totalPractice"), value: history.length, icon: "🎯", color: "from-blue-500 to-indigo-600" },
                    { label: t("account.stats.avgScore"), value: avgScore, icon: "📊", color: "from-purple-500 to-pink-600", cls: statCls(avgScore) },
                    { label: t("account.stats.bestScore"), value: bestScore, icon: "🏆", color: "from-amber-400 to-orange-500", cls: statCls(bestScore) },
                    { label: t("account.stats.savedWords"), value: savedWords.length, icon: "📚", color: "from-emerald-500 to-teal-600" },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md bg-[var(--surface-bg)] border-[var(--border-color)]">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-lg mb-3`}>
                            {stat.icon}
                        </div>
                        <p className="text-xs uppercase tracking-wide font-medium text-[var(--text-muted)]">{stat.label}</p>
                        <p className={`mt-1 text-3xl font-black ${stat.cls || "text-[var(--text-primary)]"}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent activity */}
            <div className="rounded-2xl border p-5 shadow-sm bg-[var(--surface-bg)] border-[var(--border-color)]">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{t("account.recentActivity")}</h3>
                {recent.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-400 text-sm mb-3">{t("account.noPractice")}</p>
                        <button onClick={() => navigate("/")} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500">
                            {t("account.startNow")}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recent.map((item) => {
                            const score = Math.round(item.score);
                            const scoreCls = score >= 85 ? "bg-green-50 text-green-700" : score >= 60 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600";
                            return (
                                <div key={item.id} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[var(--surface-hover)]">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${scoreCls}`}>
                                        {score}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-sm font-medium text-[var(--text-primary)]">{item.expectedTextSnapshot}</p>
                                        <p className="text-xs text-[var(--text-muted)]">{formatDate(item.createdAt)}</p>
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
function HistoryTab({ history, loading, error, t }) {
    const navigate = useNavigate();
    const [openId, setOpenId] = useState(null);

    if (loading) return <div className="text-center py-16 text-gray-400">{t("lessonList.loading")}</div>;
    if (error) return <div className="text-center py-16 text-red-400">{error}</div>;
    if (history.length === 0) return (
        <div className="text-center py-16">
            <p className="text-gray-400 mb-4">{t("account.noPractice")}</p>
            <button onClick={() => navigate("/")} className="px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-500">{t("account.startPractice")}</button>
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
                const lessonTitle = item.sentence?.lesson?.title || t("account.lessonLabel");
                const show2m = missing.slice(0, 2);
                const show2w = wrong.slice(0, 2);
                const extra = missing.length + wrong.length - show2m.length - show2w.length;

                return (
                    <div key={item.id} className="overflow-hidden rounded-xl border transition-shadow hover:shadow-sm bg-[var(--surface-bg)] border-[var(--border-color)]">
                        <div className="flex items-stretch">
                            {/* Score */}
                            <div className="flex flex-col items-center justify-center gap-1.5 border-r px-3.5 py-4 border-[var(--border-color)]">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${item.score >= 85 ? "bg-green-50 text-green-800" : item.score >= 60 ? "bg-amber-50 text-amber-800" : "bg-red-50 text-red-700"}`}>
                                    {Math.round(item.score)}
                                </div>
                            </div>
                            {/* Body */}
                            <div className="flex-1 min-w-0 cursor-pointer px-4 py-3.5 transition-colors hover:bg-[var(--surface-hover)]" onClick={() => setOpenId(isOpen ? null : item.id)}>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">{lessonTitle}</span>
                                    <span className="text-xs text-[var(--text-muted)]">{formatDate(item.createdAt)}</span>
                                </div>
                                <p className="mb-1 truncate text-sm font-medium text-[var(--text-primary)]">{item.expectedTextSnapshot}</p>
                                <p className="mb-2 truncate text-xs italic text-[var(--text-muted)]">"{item.transcript}"</p>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {!missing.length && !wrong.length ? (
                                        <span className="text-xs text-green-700 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block" />{t("account.noErrors")}</span>
                                    ) : (
                                        <>
                                            {show2m.map(w => <span key={w} className="text-xs px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded-full">{w} — {t("account.missing")}</span>)}
                                            {show2w.map(w => <span key={w} className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full">{w} — {t("account.wrong")}</span>)}
                                            {extra > 0 && <span className="text-xs text-gray-400">+{extra} {t("account.moreWords")}</span>}
                                        </>
                                    )}
                                </div>
                            </div>
                            {/* Actions */}
                            <div className="flex min-w-[110px] flex-col border-l border-[var(--border-color)]">
                                <button onClick={() => lessonId && navigate(`/lesson/${lessonId}`)} className="group flex flex-1 flex-col items-center justify-center gap-1 border-b px-4 py-3 transition-colors border-[var(--border-color)] hover:bg-blue-50/70">
                                    <span className="text-base text-gray-300 group-hover:text-blue-500">▶</span>
                                    <span className="text-xs text-gray-400 group-hover:text-blue-600 text-center leading-tight">{t("account.retry")}</span>
                                </button>
                                <button onClick={() => setOpenId(isOpen ? null : item.id)} className="flex flex-1 flex-col items-center justify-center gap-1 px-4 py-3 transition-colors hover:bg-[var(--surface-hover)]">
                                    <span className="text-xs text-gray-300">{isOpen ? "▲" : "▼"}</span>
                                    <span className="text-xs text-gray-400">{t("account.details")}</span>
                                </button>
                            </div>
                        </div>
                        {isOpen && (
                            <div className="grid grid-cols-2 gap-4 border-t px-4 py-4 bg-[var(--surface-bg-muted)] border-[var(--border-color)]">
                                <div className="flex flex-col gap-3">
                                    <div><p className="mb-1 text-xs uppercase tracking-wide text-[var(--text-muted)]">{t("account.original")}</p><p className="text-sm text-[var(--text-primary)]">{item.expectedTextSnapshot}</p></div>
                                    <div><p className="mb-1 text-xs uppercase tracking-wide text-[var(--text-muted)]">{t("account.youSaid")}</p><p className="text-sm italic text-[var(--text-secondary)]">"{item.transcript}"</p></div>
                                </div>
                                <div className="border-l pl-4 border-[var(--border-color)]">
                                    <p className="mb-2 text-xs uppercase tracking-wide text-[var(--text-muted)]">{t("account.feedback")}</p>
                                    {!missing.length && !wrong.length ? (
                                        <span className="text-sm text-green-700">{t("account.perfectPron")}</span>
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {missing.map(w => <span key={w} className="text-xs px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded-full">{w} — {t("account.missing")}</span>)}
                                            {wrong.map(w => <span key={w} className="text-xs px-2 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full">{w} — {t("account.wrong")}</span>)}
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
function SavedVocabTab({ words, loading, onDelete, t }) {
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
                    <h3 className="text-2xl font-black text-gray-900 mb-1">{t("vocab.completed")}</h3>
                    <p className="text-gray-500">{t("vocab.remembered")} <strong className="text-green-600">{remembered.length}</strong> / {shuffled.length}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={startFlashcard} className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500">{t("vocab.redo")}</button>
                    <button onClick={() => setFlashcardMode(false)} className="rounded-xl border px-5 py-2.5 font-medium text-[var(--text-secondary)] bg-[var(--surface-bg)] border-[var(--border-color)] hover:bg-[var(--surface-hover)]">{t("vocab.backToList")}</button>
                </div>
            </div>
        );

        const current = shuffled[currentIndex];
        return (
            <div className="max-w-lg mx-auto py-6">
                {/* Progress */}
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => setFlashcardMode(false)} className="text-sm text-gray-400 hover:text-gray-700">{t("vocab.exit")}</button>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${(currentIndex / shuffled.length) * 100}%` }} />
                    </div>
                    <span className="text-sm text-gray-500 font-medium">{currentIndex + 1}/{shuffled.length}</span>
                </div>

                {/* Card */}
                <div className="relative cursor-pointer mb-8" style={{ perspective: "1000px" }} onClick={() => { setIsFlipped(f => !f); if (!isFlipped) playAudio(current.word); }}>
                    <div className="relative w-full rounded-3xl shadow-xl transition-transform duration-500" style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)", minHeight: "260px" }}>
                        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl p-8 bg-[var(--surface-bg)]" style={{ backfaceVisibility: "hidden" }}>
                            <p className="mb-4 text-xs uppercase tracking-widest text-[var(--text-muted)]">{t("vocab.englishWord")}</p>
                            <h2 className="mb-2 text-4xl font-extrabold text-[var(--text-primary)]">{current.word}</h2>
                            {current.ipa && <p className="font-mono text-sm text-[var(--text-muted)]">{current.ipa}</p>}
                            <p className="mt-6 text-xs text-[var(--text-muted)]">{t("vocab.tapToReveal")}</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl flex flex-col items-center justify-center p-8" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                            <p className="text-xs text-indigo-200 uppercase tracking-widest mb-4">{t("vocab.vietnamese")}</p>
                            <h2 className="text-3xl font-extrabold text-white mb-2 text-center">{current.translation}</h2>
                            {current.example && <p className="text-sm text-indigo-200 italic text-center mt-3">"{current.example}"</p>}
                        </div>
                    </div>
                </div>

                {isFlipped ? (
                    <div className="flex gap-4">
                        <button onClick={() => handleAnswer(false)} className="flex-1 py-3.5 bg-amber-50 text-amber-700 font-bold rounded-2xl border-2 border-amber-200 hover:bg-amber-100 transition-all">{t("vocab.review")}</button>
                        <button onClick={() => handleAnswer(true)} className="flex-1 py-3.5 bg-green-50 text-green-700 font-bold rounded-2xl border-2 border-green-200 hover:bg-green-100 transition-all">{t("vocab.known")}</button>
                    </div>
                ) : (
                    <p className="text-center text-gray-400 text-sm">{t("vocab.thinkFirst")}</p>
                )}
            </div>
        );
    }

    // ── List mode ──
    if (loading) return <div className="text-center py-16 text-gray-400">{t("lessonList.loading")}</div>;

    if (words.length === 0) return (
        <div className="text-center py-16">
            <div className="text-4xl mb-4">📚</div>
            <p className="text-gray-400 text-sm">{t("vocab.noWords")}</p>
            <p className="text-gray-300 text-xs mt-1">{t("vocab.saveHint")}</p>
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500"><span className="font-semibold text-gray-900">{words.length}</span> {t("vocab.savedCount")}</p>
                <button onClick={startFlashcard} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition-colors">
                    {t("vocab.flashcard")}
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {words.map((vocab) => (
                    <div key={vocab.id} className="group flex items-start gap-3 rounded-xl border p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md bg-[var(--surface-bg)] border-[var(--border-color)]">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-bold text-gray-900">{vocab.word}</span>
                                {vocab.ipa && <span className="text-xs text-gray-400 font-mono">{vocab.ipa}</span>}
                                <button onClick={() => playAudio(vocab.word)} className="ml-auto text-gray-300 hover:text-indigo-500 transition-colors">🔊</button>
                            </div>
                            <p className="text-sm text-indigo-700 font-medium">{vocab.translation}</p>
                            {vocab.example && <p className="text-xs text-gray-400 italic mt-1 truncate">"{vocab.example}"</p>}
                            <p className="mt-1 text-xs text-[var(--text-muted)]">{formatDate(vocab.createdAt)}</p>
                        </div>
                        <button
                            onClick={() => onDelete(vocab.id)}
                            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                            title={t("vocab.deleteTooltip")}
                        >✕</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main: AccountDashboard ───────────────────────────────────────────────────
// Tab keys — labels sẽ được dịch bên trong component
const TAB_KEYS = [
    { id: "overview", labelKey: "account.tabs.overview", icon: "📊" },
    { id: "history", labelKey: "account.tabs.history", icon: "📋" },
    { id: "vocabulary", labelKey: "account.tabs.saved", icon: "💾" },
];

export default function AccountDashboard() {
    const navigate = useNavigate();
    const user = getUser();
    const { t } = useTranslation();

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
            .then(res => { if (!res.ok) throw new Error(t("account.errorLoadHistory")); return res.json(); })
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
        if (!window.confirm(t("account.deleteConfirm"))) return;
        const res = await api.delete(`/api/user-vocabulary/${id}`);
        if (res.ok) setSavedWords(prev => prev.filter(w => w.id !== id));
    }, []);

    return (
        <div className="min-h-screen bg-[var(--page-bg)] text-[var(--text-primary)]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

                {/* Profile Header */}
                <div className="mb-6 flex items-center gap-5 rounded-2xl border p-6 shadow-sm bg-[var(--surface-bg)] border-[var(--border-color)]">
                    <Avatar user={user} size="lg" />
                    <div className="flex-1 min-w-0">
                        <h1 className="truncate text-xl font-bold text-[var(--text-primary)]">{user?.username}</h1>
                        <p className="text-sm text-[var(--text-muted)]">{user?.email || t("account.noEmail")}</p>
                        <span className="inline-block mt-1 text-xs px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                            {user?.role || "USER"}
                        </span>
                    </div>
                    <button
                        onClick={() => { logout(); navigate("/login"); }}
                        className="shrink-0 rounded-xl border px-4 py-2 text-sm transition-all text-[var(--text-secondary)] border-[var(--border-color)] hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                        {t("account.logout")}
                    </button>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex gap-1 rounded-xl border p-1 shadow-sm bg-[var(--surface-bg)] border-[var(--border-color)]">
                    {TAB_KEYS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all
                                ${activeTab === tab.id ? "bg-indigo-600 text-white shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"}`}
                        >
                            <span>{tab.icon}</span>
                            <span className="hidden sm:inline">{t(tab.labelKey)}</span>
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div>
                    {activeTab === "overview" && (
                        <OverviewTab history={history} savedWords={savedWords} t={t} />
                    )}
                    {activeTab === "history" && (
                        <HistoryTab history={history} loading={historyLoading} error={historyError} t={t} />
                    )}
                    {activeTab === "vocabulary" && (
                        <SavedVocabTab words={savedWords} loading={vocabLoading} onDelete={handleDeleteWord} t={t} />
                    )}
                </div>
            </div>
        </div>
    );
}
