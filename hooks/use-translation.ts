"use client"

import { useLanguage } from "@/contexts/language-context"
import { translations, type TranslationKey } from "@/lib/translations"

export function useTranslation() {
  const { language } = useLanguage()  

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key
  }

  return { t, language }
}
