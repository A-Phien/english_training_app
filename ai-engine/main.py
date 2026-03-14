import os
import json
import re
import tempfile
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from faster_whisper import WhisperModel
from youtube_transcript_api import YouTubeTranscriptApi
from groq import Groq
from Levenshtein import distance as levenshtein_distance
from dotenv import load_dotenv

load_dotenv()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Load Faster-Whisper 1 lần khi khởi động
print("Loading Whisper model...")
whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
print("Whisper ready!")

app = FastAPI()


# =====================
# ROOT
# =====================
@app.get("/")
def root():
    return {"message": "AI Engine is running!"}


# =====================
# TRANSCRIPT YOUTUBE
# =====================
@app.get("/transcript/{video_id}")
async def get_transcript(video_id: str):
    try:
        # 1. Lấy transcript từ YouTube
        ytt = YouTubeTranscriptApi()
        try:
            fetched = ytt.fetch(video_id, languages=["en", "en-GB", "en-US"])
        except Exception:
            transcript_list = ytt.list(video_id)
            first = next(iter(transcript_list))
            fetched = first.fetch()

        sentences = []
        for index, item in enumerate(fetched):
            sentences.append({
                "content": item.text.strip(),
                "start_time": round(item.start, 2),
                "end_time": round(item.start + item.duration, 2),
                "order_index": index
            })

        # 2. Gọi Groq 1 request duy nhất cho tất cả câu
        sentences_with_ai = await enrich_with_groq(sentences)

        return {
            "video_id": video_id,
            "total": len(sentences_with_ai),
            "sentences": sentences_with_ai
        }

    except Exception as e:
        import traceback
        print(f"--- LỖI TRANSCRIPT ---\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


# =====================
# DỊCH + IPA (1 REQUEST)
# =====================
async def enrich_with_groq(sentences):
    try:
        # Đánh số INDEX rõ ràng → không bao giờ bị lệch
        numbered = "\n".join(
            f'{i}|{s["content"]}' for i, s in enumerate(sentences)
        )

        prompt = f"""You are a language assistant.
Each line has format: INDEX|ENGLISH_SENTENCE
Translate each to Vietnamese and provide IPA (American English).

Return ONLY a JSON array. No explanation, no markdown, no code block.
Each object must have: "index" (integer), "translation", "ipa"
The index must match exactly with input.

Input:
{numbered}"""

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=8000,
        )

        raw = response.choices[0].message.content.strip()

        # Xử lý markdown nếu có
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        ai_results = json.loads(raw)

        # Map theo index → chính xác 100%
        index_map = {}
        for item in ai_results:
            key = item.get("index")
            index_map[int(key)] = item

        for i, sentence in enumerate(sentences):
            matched = index_map.get(i)
            if matched:
                sentence["translation"] = matched.get("translation", "")
                sentence["ipa"] = matched.get("ipa", "")
            else:
                sentence["translation"] = ""
                sentence["ipa"] = ""

        print(f"✓ Groq dịch xong {len(sentences)} câu!")
        return sentences

    except Exception as e:
        print(f"=== GROQ LỖI: {e} ===")
        for s in sentences:
            s["translation"] = ""
            s["ipa"] = ""
        return sentences


# =====================
# CHẤM ĐIỂM PHÁT ÂM
# =====================
@app.post("/evaluate")
async def evaluate(
    audio: UploadFile = File(...),
    expected_text: str = Form(...)
):
    try:
        # 1. Lưu audio tạm
        suffix = os.path.splitext(audio.filename)[1] if audio.filename else ".webm"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await audio.read())
            tmp_path = tmp.name

        # 2. Faster-Whisper transcribe
        segments, _ = whisper_model.transcribe(tmp_path, language="en")
        transcript = " ".join([seg.text.strip() for seg in segments])

        # 3. Xóa file tạm
        os.unlink(tmp_path)

        # 4. Tính điểm
        score, mistakes = calculate_score(expected_text, transcript)

        print(f"Expected  : {expected_text}")
        print(f"Transcript: {transcript}")
        print(f"Score     : {score}")

        return {
            "transcript": transcript,
            "expected": expected_text,
            "score": score,
            "mistakes": mistakes
        }

    except Exception as e:
        import traceback
        print(f"--- LỖI EVALUATE ---\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


# =====================
# NORMALIZE TEXT
# =====================
def normalize(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


# =====================
# TÍNH ĐIỂM LEVENSHTEIN
# =====================
def calculate_score(expected: str, transcript: str):
    exp_norm = normalize(expected)
    tra_norm = normalize(transcript)

    dist = levenshtein_distance(exp_norm, tra_norm)
    max_len = max(len(exp_norm), len(tra_norm), 1)
    score = round((1 - dist / max_len) * 100, 2)
    score = max(0.0, score)

    exp_words = set(exp_norm.split())
    tra_words = set(tra_norm.split())

    mistakes = {
        "wrong_words": list(tra_words - exp_words),
        "missing_words": list(exp_words - tra_words),
    }

    return score, mistakes