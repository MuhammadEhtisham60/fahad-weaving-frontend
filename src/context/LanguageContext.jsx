import React, { createContext, useContext, useEffect, useState } from "react";
import en from "../locales/en/translation.js";
import ur from "../locales/ur/translation.js";

export const LANGUAGE_STORAGE_KEY = "i18n_lang";

const translations = { en, ur };

export const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr" },
  { code: "ur", name: "Urdu", nativeName: "اردو", dir: "rtl" },
];

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  dir: "ltr",
  t: (key, fallback) => fallback || key,
  languages: LANGUAGES,
});

const getNestedValue = (obj, path) => {
  if (!obj || !path) return null;
  const keys = path.split(".");
  let current = obj;
  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = current[k];
    } else {
      return null;
    }
  }
  return typeof current === "string" ? current : null;
};

const applyLanguageToDOM = (lang) => {
  if (typeof document !== "undefined") {
    const isUrdu = lang === "ur";
    const dir = isUrdu ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("data-language", lang);
  }
};

const getInitialLanguage = () => {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && (saved === "en" || saved === "ur")) {
      return saved;
    }
  } catch (e) {
    console.error("Failed to read language from localStorage:", e);
  }
  return "en";
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const dir = language === "ur" ? "rtl" : "ltr";

  useEffect(() => {
    applyLanguageToDOM(language);
  }, [language]);

  const setLanguage = (newLang) => {
    if (newLang !== "en" && newLang !== "ur") return;
    setLanguageState(newLang);
    applyLanguageToDOM(newLang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch (e) {
      console.error("Failed to save language to localStorage:", e);
    }
  };

  const t = (key, fallback) => {
    const currentDict = translations[language] || translations.en;
    const value = getNestedValue(currentDict, key);
    if (value !== null) return value;

    // Fallback to English dictionary if key missing in target language
    if (language !== "en") {
      const enValue = getNestedValue(translations.en, key);
      if (enValue !== null) return enValue;
    }

    return fallback !== undefined ? fallback : key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        dir,
        t,
        languages: LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function useTranslation() {
  const { t, language, setLanguage, dir } = useLanguage();
  return { t, language, setLanguage, dir };
}
