import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import uk from "../data/uk.json";
import en from "../data/en.json";
import pl from "../data/pl.json";
import de from "../data/de.json";
import fr from "../data/fr.json";
import es from "../data/es.json";
import ru from "../data/ru.json";

const resources = {
  uk: { translation: uk },
  en: { translation: en },
  pl: { translation: pl },
  de: { translation: de },
  fr: { translation: fr },
  es: { translation: es },
  ru: { translation: ru },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem("wt_tactical_lang") || "uk",
    fallbackLng: "uk",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
