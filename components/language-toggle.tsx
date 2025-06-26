"use client"

import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en")
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 bg-white text-gray-800 hover:bg-gray-100"
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">{language === "en" ? "العربية" : "English"}</span>
    </Button>
  )
}
