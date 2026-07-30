import { useEffect, useState } from "react";

const STORAGE_KEY = "palnews:language";

const LANGUAGES = [
  { code: "en-IN", label: "English (India)" },
  { code: "en-US", label: "English (US)" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
];

export function LanguageSelector() {
  const [language, setLanguage] = useState(LANGUAGES[0].code);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES.some((l) => l.code === saved)) {
      setLanguage(saved);
    }
  }, []);

  function handleChange(code: string) {
    setLanguage(code);
    localStorage.setItem(STORAGE_KEY, code);
  }

  return (
    <div>
      <label htmlFor="language-selector" className="sr-only">
        Language
      </label>
      <select
        id="language-selector"
        value={language}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 focus:border-red-400 focus:outline-none"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
      <p className="mt-1 text-[11px] text-slate-400">
        Currently available in English. More languages coming soon.
      </p>
    </div>
  );
}
