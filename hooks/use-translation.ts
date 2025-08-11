// "use client"

// import { useLanguage } from "@/contexts/language-context"
// import { translations, type TranslationKey } from "@/lib/translations"

// export function useTranslation() {
//   const { language } = useLanguage()  

//   const t = (key: TranslationKey): string => {
//     return translations[language][key] || translations.en[key] || key
//   }

//   return { t, language }
// }





"use client"

import { useLanguage } from "@/contexts/language-context"
import { translations, type TranslationKey } from "@/lib/translations"

export function useTranslation() {
  const { language } = useLanguage()  

  // Allow both static keys and dynamic strings
  const t = (key: TranslationKey | string): string => {
    const langTranslations = translations[language] as Record<string, string>
    return langTranslations[key] || translations.en[key as keyof typeof translations.en] || key
  }

  return { t, language }
}
