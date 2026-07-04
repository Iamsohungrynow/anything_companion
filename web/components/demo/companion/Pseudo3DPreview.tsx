"use client";

// ============================================================
// Pseudo 3D Preview
// ============================================================
// Avatar display. Uploaded image path is preserved; the fallback
// path renders the brand <Mascot /> instead of a bare emoji.
// ============================================================

import { useState } from "react";
import { CompanionCard } from "../shared/types";
import { Mascot } from "@/components/ui/Mascot";

interface Props {
  companion: CompanionCard;
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<NonNullable<Props["size"]>, string> = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
  lg: "w-24 h-24",
};

const mascotPx: Record<NonNullable<Props["size"]>, number> = {
  sm: 30,
  md: 44,
  lg: 92,
};

export default function Pseudo3DPreview({ companion, size = "md" }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(companion.imageUrl) && !imageFailed;

  return (
    <div
      className={`${sizeClasses[size]} flex flex-shrink-0 select-none items-center justify-center overflow-hidden rounded-full border-2 border-white shadow-sm`}
      style={{ background: "linear-gradient(160deg,#ffffff,#f1e7d6)" }}
    >
      {showImage ? (
        <img
          src={companion.imageUrl}
          alt={companion.name}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <Mascot
          size={mascotPx[size]}
          float={size === "lg"}
          mood={companion.scenario === "pet" ? "resting" : "happy"}
        />
      )}
    </div>
  );
}
