import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import am from "./am.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    am: { translation: am },
  },
  lng: localStorage.getItem("ethioflow-lang") || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export function setLanguage(lang) {
  i18n.changeLanguage(lang);
  localStorage.setItem("ethioflow-lang", lang);
}

export default i18n;
