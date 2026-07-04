"use client";

// ============================================================
// Image Upload Component
// ============================================================
import { useRef, type ChangeEvent } from "react";
import { Scenario } from "../shared/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { demoCopy } from "@/lib/i18n/demo";

interface Props {
  scenario: Scenario | null;
  onImageSelected: (imageUrl: string | null) => void;
  onBack: () => void;
}

const defaultImages: Record<Scenario, string> = {
  study: "☕",
  acg: "✨",
  pet: "🐾",
};

export default function ImageUpload({ scenario, onImageSelected, onBack }: Props) {
  const { locale } = useLocale();
  const t = demoCopy[locale];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const key = scenario ?? "study";

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === "string") onImageSelected(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDefaultImage = () => {
    onImageSelected(null); // null means use the brand mascot fallback
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 animate-slide-up">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-plum">
            {t.upload.title}
          </h1>
          <p className="mt-2 text-sm text-plum-soft">
            {t.upload.subtitleTemplate.replace("{scenario}", t.scenarioNames[key])}
          </p>
        </div>

        {/* Upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-blob py-6 text-lg font-bold text-[#3a1f16] shadow-lg transition-all active:scale-95"
          style={{
            background: "linear-gradient(135deg,#e0714a,#eb9a70)",
            boxShadow: "0 18px 40px -18px rgba(224,113,74,.45)",
          }}
        >
          📤 {t.upload.uploadButton}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-peach-200" />
          <span className="text-sm font-medium text-plum-faint">{t.upload.or}</span>
          <div className="h-px flex-1 bg-peach-200" />
        </div>

        {/* Default option */}
        <button
          onClick={handleDefaultImage}
          className="w-full rounded-blob border-2 border-peach-200 bg-white py-6 text-lg font-bold text-plum transition-all hover:border-coral hover:bg-peach-50"
        >
          {defaultImages[key]} {t.upload.useDefault}
        </button>

        {/* Back button */}
        <button
          onClick={onBack}
          className="w-full py-3 font-semibold text-plum-soft transition-colors hover:text-plum"
        >
          ← {t.upload.back}
        </button>
      </div>
    </div>
  );
}
