import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import apiClient, { api } from "../auth/apiClient";

// ── Form thêm/sửa Chủ Đề ───────────────────────────────────
function TopicForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || "");
  const [icon, setIcon] = useState(initial?.icon || "📖");
  const [description, setDescription] = useState(initial?.description || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const payload = { name: name.trim(), icon, description };
      if (initial?.id) {
        const res = await api.put(`/api/topics/${initial.id}`, payload);
        const data = await res.json();
        onSave(data);
      } else {
        const res = await api.post("/api/topics", payload);
        const data = await res.json();
        onSave(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
      <div className="flex gap-2 mb-3">
        <input
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="w-16 text-center text-xl border border-stone-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="🌿"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên chủ đề..."
          className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          required
        />
      </div>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Mô tả ngắn (tùy chọn)"
        className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={loading}
          className="flex-1 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-500 disabled:opacity-60">
          {loading ? "Đang lưu..." : (initial?.id ? "Cập nhật" : "Tạo chủ đề")}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 bg-stone-100 text-stone-600 text-sm rounded-xl hover:bg-stone-200">
          Hủy
        </button>
      </div>
    </form>
  );
}

// ── Form thêm/sửa Từ Vựng ─────────────────────────────────
function VocabForm({ topicId, initial, onSave, onCancel }) {
  const [word, setWord] = useState(initial?.word || "");
  const [ipa, setIpa] = useState(initial?.ipa || "");
  const [translation, setTranslation] = useState(initial?.translation || "");
  const [example, setExample] = useState(initial?.example || "");
  const [exampleTranslation, setExampleTranslation] = useState(initial?.exampleTranslation || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!word.trim() || !translation.trim()) return;
    setLoading(true);
    const payload = { word: word.trim(), ipa, translation: translation.trim(), example, exampleTranslation };
    try {
      if (initial?.id) {
        const res = await api.put(`/api/vocabularies/${initial.id}`, payload);
        onSave(await res.json());
      } else {
        const res = await api.post(`/api/topics/${topicId}/vocabularies`, payload);
        onSave(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-3">
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input value={word} onChange={(e) => setWord(e.target.value)} placeholder="Từ tiếng Anh *"
          className="border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" required />
        <input value={ipa} onChange={(e) => setIpa(e.target.value)} placeholder="Phiên âm /ˈwɜːrd/"
          className="border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      </div>
      <input value={translation} onChange={(e) => setTranslation(e.target.value)} placeholder="Nghĩa tiếng Việt *"
        className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" required />
      <input value={example} onChange={(e) => setExample(e.target.value)} placeholder="Câu ví dụ (tùy chọn)"
        className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      <input value={exampleTranslation} onChange={(e) => setExampleTranslation(e.target.value)} placeholder="Nghĩa câu ví dụ (tùy chọn)"
        className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
      <div className="flex gap-2">
        <button type="submit" disabled={loading}
          className="flex-1 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-500 disabled:opacity-60">
          {loading ? "Đang lưu..." : (initial?.id ? "Cập nhật" : "Thêm từ")}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 bg-stone-100 text-stone-600 text-sm rounded-xl hover:bg-stone-200">
          Hủy
        </button>
      </div>
    </form>
  );
}

// ── Preview Import Excel ──────────────────────────────────
function ImportPreview({ rows, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-stone-100">
          <h3 className="text-lg font-bold text-stone-800">Preview dữ liệu Import</h3>
          <p className="text-sm text-stone-500 mt-1">{rows.length} từ sẽ được thêm vào chủ đề này</p>
        </div>
        <div className="overflow-auto flex-1 p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-stone-400 uppercase tracking-wider">
                <th className="py-2 px-3">Từ</th>
                <th className="py-2 px-3">IPA</th>
                <th className="py-2 px-3">Nghĩa</th>
                <th className="py-2 px-3">Ví dụ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-stone-50" : ""}>
                  <td className="py-2 px-3 font-semibold text-stone-800">{row.word}</td>
                  <td className="py-2 px-3 text-stone-400 font-mono text-xs">{row.ipa}</td>
                  <td className="py-2 px-3 text-indigo-700">{row.translation}</td>
                  <td className="py-2 px-3 text-stone-400 italic text-xs">{row.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-stone-100 flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 text-sm font-medium">
            Hủy
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 text-sm font-semibold disabled:opacity-60">
            {loading ? "Đang import..." : `✅ Xác nhận import ${rows.length} từ`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Trang chính VocabularyManager ────────────────────────
export default function VocabularyManager() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [words, setWords] = useState([]);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [showVocabForm, setShowVocabForm] = useState(false);
  const [editingVocab, setEditingVocab] = useState(null);
  const [importRows, setImportRows] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [toast, setToast] = useState("");
  const fileRef = useRef();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // Load topics
  const loadTopics = async () => {
    const res = await api.get("/api/topics");
    const data = await res.json();
    setTopics(data);
  };

  // Load words của topic đang chọn
  const loadWords = async (topic) => {
    setSelectedTopic(topic);
    const res = await api.get(`/api/topics/${topic.id}/vocabularies`);
    const data = await res.json();
    setWords(data);
  };

  useEffect(() => { loadTopics(); }, []);

  // ── TOPIC CRUD ──────────────────────────────────────────
  const handleTopicSaved = (saved) => {
    setShowTopicForm(false);
    setEditingTopic(null);
    loadTopics();
    showToast("✅ Đã lưu chủ đề!");
  };

  const handleDeleteTopic = async (topic) => {
    if (!confirm(`Xóa chủ đề "${topic.name}" và toàn bộ từ vựng bên trong?`)) return;
    await api.delete(`/api/topics/${topic.id}`);
    if (selectedTopic?.id === topic.id) { setSelectedTopic(null); setWords([]); }
    loadTopics();
    showToast("🗑️ Đã xóa chủ đề!");
  };

  // ── VOCAB CRUD ─────────────────────────────────────────
  const handleVocabSaved = () => {
    setShowVocabForm(false);
    setEditingVocab(null);
    if (selectedTopic) loadWords(selectedTopic);
    showToast("✅ Đã lưu từ vựng!");
  };

  const handleDeleteVocab = async (vocab) => {
    if (!confirm(`Xóa từ "${vocab.word}"?`)) return;
    await api.delete(`/api/vocabularies/${vocab.id}`);
    setWords(words.filter((w) => w.id !== vocab.id));
    showToast("🗑️ Đã xóa từ!");
  };

  // ── IMPORT EXCEL ───────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      // Bỏ hàng đầu nếu là header (chứa "word" hoặc "Word")
      const dataRows = rows.filter((r, i) => {
        if (i === 0 && typeof r[0] === "string" && r[0].toLowerCase() === "word") return false;
        return r[0]; // bỏ dòng trống
      });
      const parsed = dataRows.map((r) => ({
        word: String(r[0] || "").trim(),
        ipa: String(r[1] || "").trim(),
        translation: String(r[2] || "").trim(),
        example: String(r[3] || "").trim(),
        exampleTranslation: String(r[4] || "").trim(),
      })).filter((r) => r.word && r.translation);
      setImportRows(parsed);
    };
    reader.readAsBinaryString(file);
    e.target.value = ""; // reset để có thể chọn lại cùng file
  };

  const handleConfirmImport = async () => {
    if (!selectedTopic || !importRows) return;
    setImportLoading(true);
    try {
      await api.post(`/api/topics/${selectedTopic.id}/vocabularies/batch`, importRows);
      setImportRows(null);
      loadWords(selectedTopic);
      loadTopics();
      showToast(`✅ Đã import ${importRows.length} từ thành công!`);
    } catch (err) {
      console.error(err);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f1ea] p-4 lg:p-8 font-sans text-stone-800">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-stone-800 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-medium animate-bounce">
          {toast}
        </div>
      )}

      {/* Import Preview Modal */}
      {importRows && (
        <ImportPreview
          rows={importRows}
          loading={importLoading}
          onConfirm={handleConfirmImport}
          onCancel={() => setImportRows(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">📚 Quản Lý Từ Vựng</h1>
        <p className="text-stone-500 mt-1 text-sm">Tạo chủ đề, thêm từ thủ công hoặc import hàng loạt từ Excel</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── Panel trái: Chủ Đề ─────────────────────────── */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-bold text-stone-700">Chủ Đề</h2>
              <button
                onClick={() => { setEditingTopic(null); setShowTopicForm(!showTopicForm); }}
                className="w-8 h-8 flex items-center justify-center bg-amber-600 text-white rounded-full text-lg hover:bg-amber-500 transition-colors"
              >+</button>
            </div>

            <div className="p-4">
              {(showTopicForm && !editingTopic) && (
                <TopicForm
                  onSave={handleTopicSaved}
                  onCancel={() => setShowTopicForm(false)}
                />
              )}

              {topics.length === 0 ? (
                <p className="text-center text-stone-400 text-sm py-8">Chưa có chủ đề nào</p>
              ) : (
                <div className="space-y-2">
                  {topics.map((topic) => (
                    <div key={topic.id}>
                      {editingTopic?.id === topic.id ? (
                        <TopicForm
                          initial={topic}
                          onSave={handleTopicSaved}
                          onCancel={() => setEditingTopic(null)}
                        />
                      ) : (
                        <div
                          onClick={() => { loadWords(topic); setShowVocabForm(false); setEditingVocab(null); }}
                          className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all group
                            ${selectedTopic?.id === topic.id
                              ? "bg-amber-50 border border-amber-200"
                              : "hover:bg-stone-50 border border-transparent"}`}
                        >
                          <span className="text-2xl">{topic.icon || "📖"}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-stone-800 text-sm truncate">{topic.name}</p>
                            <p className="text-xs text-stone-400">{topic.wordCount} từ</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingTopic(topic); setShowTopicForm(false); }}
                              className="w-6 h-6 text-xs text-amber-600 hover:bg-amber-100 rounded-lg flex items-center justify-center"
                            >✏️</button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteTopic(topic); }}
                              className="w-6 h-6 text-xs text-red-400 hover:bg-red-50 rounded-lg flex items-center justify-center"
                            >🗑️</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Download template */}
          <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm border border-stone-100 text-xs text-stone-400 text-center">
            <p className="mb-2">Format Excel: <span className="font-mono text-stone-600">word | ipa | translation | example | example_translation</span></p>
            <button
              onClick={() => {
                const ws = XLSX.utils.aoa_to_sheet([
                  ["word", "ipa", "translation", "example", "example_translation"],
                  ["apple", "/ˈæp.əl/", "quả táo", "I eat an apple.", "Tôi ăn một quả táo."],
                  ["book", "/bʊk/", "quyển sách", "She reads a book.", "Cô ấy đọc sách."],
                ]);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Vocabulary");
                XLSX.writeFile(wb, "vocabulary_template.xlsx");
              }}
              className="text-indigo-500 hover:text-indigo-700 font-medium underline"
            >⬇️ Tải file mẫu Excel</button>
          </div>
        </div>

        {/* ── Panel phải: Từ Vựng ───────────────────────── */}
        <div className="flex-1">
          {!selectedTopic ? (
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 h-64 flex items-center justify-center">
              <div className="text-center text-stone-400">
                <div className="text-4xl mb-3">👈</div>
                <p className="text-sm">Chọn một chủ đề để quản lý từ vựng</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
              {/* Header panel phải */}
              <div className="p-5 border-b border-stone-100 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-2xl">{selectedTopic.icon}</span>
                  <div>
                    <h2 className="font-bold text-stone-800">{selectedTopic.name}</h2>
                    <p className="text-xs text-stone-400">{words.length} từ vựng</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* Nút Import Excel */}
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
                  <button
                    onClick={() => fileRef.current.click()}
                    className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-xl hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  >📥 Import Excel</button>
                  <button
                    onClick={() => { setShowVocabForm(!showVocabForm); setEditingVocab(null); }}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-500 transition-colors"
                  >+ Thêm từ</button>
                </div>
              </div>

              {/* Form thêm từ mới */}
              {showVocabForm && !editingVocab && (
                <div className="p-4 border-b border-stone-100">
                  <VocabForm
                    topicId={selectedTopic.id}
                    onSave={handleVocabSaved}
                    onCancel={() => setShowVocabForm(false)}
                  />
                </div>
              )}

              {/* Danh sách từ vựng */}
              <div className="p-4">
                {words.length === 0 ? (
                  <div className="text-center text-stone-400 py-16">
                    <div className="text-4xl mb-3">📝</div>
                    <p className="text-sm">Chưa có từ vựng nào. Thêm từ hoặc Import Excel!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {words.map((vocab, index) => (
                      <div key={vocab.id}>
                        {editingVocab?.id === vocab.id ? (
                          <VocabForm
                            topicId={selectedTopic.id}
                            initial={vocab}
                            onSave={handleVocabSaved}
                            onCancel={() => setEditingVocab(null)}
                          />
                        ) : (
                          <div className="flex items-start gap-3 p-3 rounded-2xl hover:bg-stone-50 group border border-transparent hover:border-stone-100 transition-all">
                            <span className="text-xs text-stone-300 font-mono mt-1 w-6 text-right">{index + 1}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-stone-800">{vocab.word}</span>
                                {vocab.ipa && <span className="text-xs text-stone-400 font-mono">{vocab.ipa}</span>}
                              </div>
                              <p className="text-sm text-indigo-700 font-medium">{vocab.translation}</p>
                              {vocab.example && <p className="text-xs text-stone-400 italic mt-0.5">"{vocab.example}"</p>}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <button
                                onClick={() => { setEditingVocab(vocab); setShowVocabForm(false); }}
                                className="px-2 py-1 text-xs text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100"
                              >Sửa</button>
                              <button
                                onClick={() => handleDeleteVocab(vocab)}
                                className="px-2 py-1 text-xs text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
                              >Xóa</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
