import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import vi from "./vi.json";
import en from "./en.json";

const STORAGE_KEY = "english-app-lang";

function getSavedLanguage() {
  if (typeof window === "undefined") return "vi";
  return window.localStorage.getItem(STORAGE_KEY) || "vi";
}

i18n.use(initReactI18next).init({
  resources: {
    vi: { translation: vi },
    en: { translation: en },
  },
  lng: getSavedLanguage(),
  fallbackLng: "vi",
  interpolation: {
    escapeValue: false, // React đã tự escape
  },
});

// Lưu ngôn ngữ vào localStorage mỗi khi thay đổi
i18n.on("languageChanged", (lng) => {
  window.localStorage.setItem(STORAGE_KEY, lng);
});

export default i18n;
