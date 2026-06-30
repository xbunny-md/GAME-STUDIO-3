'use client';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Home": "Home",
      "About": "About",
      "Contact": "Contact",
      "Admin": "Admin",
      "All": "All",
      "Android": "Android",
      "PC": "PC",
      "PlayStation": "PlayStation",
      "PPSSPP": "PPSSPP",
      "iOS": "iOS",
      "Theme": "Theme",
      "Language": "Language"
    }
  },
  sw: {
    translation: {
      "Home": "Nyumbani",
      "About": "Kuhusu Sisi",
      "Contact": "Wasiliana",
      "Admin": "Utawala",
      "All": "Zote",
      "Android": "Android",
      "PC": "PC",
      "PlayStation": "PlayStation",
      "PPSSPP": "PPSSPP",
      "iOS": "iOS",
      "Theme": "Mandhari",
      "Language": "Lugha"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
