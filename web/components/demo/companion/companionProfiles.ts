// ============================================================
// Generate Companion Profile (static mock personas)
// Pure module: no "use client" directive needed.
// ============================================================
import { CompanionCard, Scenario } from "../shared/types";

export async function generateCompanionAsync(
  scenario: Scenario,
  imageUrl?: string,
): Promise<CompanionCard> {
  // Static mock companions. A real implementation would call the backend.
  const companions: Record<Scenario, CompanionCard> = {
    study: {
      name: "Cappu",
      type: "Morning Study Buddy",
      emoji: "☕",
      personality: ["Encouraging", "Patient", "Supportive"],
      tone: "soft_supportive",
      use_case: "study",
      backstory:
        "Cappu is your friendly study companion who believes every small step counts. Like a warm cup of coffee, Cappu brings comfort and motivation to your study sessions.",
      visual_style: "Warm, coffee-themed aesthetic with soft colors",
      interaction_style:
        "Celebrates small wins, breaks down big goals, checks in with encouragement",
      scenario: "study",
      imageUrl,
    },
    acg: {
      name: "Lumi",
      type: "Original Virtual Companion",
      emoji: "✨",
      personality: ["Creative", "Playful", "Curious"],
      tone: "cute_playful",
      use_case: "light_support",
      backstory:
        "Lumi is an original virtual character born from creativity. With a mysterious charm and playful spirit, Lumi brings light and imagination to everyday moments.",
      visual_style: "Cute, ethereal design with sparkle effects",
      interaction_style:
        "Fun conversations, creative ideas, light emotional support",
      scenario: "acg",
      imageUrl,
    },
    pet: {
      name: "Mochi",
      type: "Digital Pet Companion",
      emoji: "🐾",
      personality: ["Loyal", "Comforting", "Gentle"],
      tone: "friend_like",
      use_case: "pet_companionship",
      backstory:
        "Mochi is a digital companion that preserves memories and warmth. While respectful of loss, Mochi offers gentle companionship and routine check-ins.",
      visual_style: "Soft, pet-like qualities with warm tones",
      interaction_style:
        "Routine check-ins, memory preservation, gentle presence",
      scenario: "pet",
      imageUrl,
    },
  };

  return companions[scenario];
}
