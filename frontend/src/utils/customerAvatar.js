import { resolveImageUrl } from "./imageUrls";
import avatar1 from "../assets/customer-avatars/avatar1.png";
import avatar2 from "../assets/customer-avatars/avatar2.png";
import avatar3 from "../assets/customer-avatars/avatar3.png";
import avatar4 from "../assets/customer-avatars/avatar4.png";
import avatar5 from "../assets/customer-avatars/avatar5.png";
import avatar6 from "../assets/customer-avatars/avatar6.png";
import avatar7 from "../assets/customer-avatars/avatar7.png";
import avatar8 from "../assets/customer-avatars/avatar8.png";
import avatar9 from "../assets/customer-avatars/avatar9.png";

const illustratedAvatarSources = {
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  avatar6,
  avatar7,
  avatar8,
  avatar9,
};

export const CUSTOMER_AVATAR_PRESETS = [
  {
    id: "avatar1",
    label: "Whisk Smile",
    mood: "Warm and cheerful.",
    type: "image",
  },
  {
    id: "avatar2",
    label: "Golden Baker",
    mood: "Bright and friendly.",
    type: "image",
  },
  {
    id: "avatar3",
    label: "Cupcake Joy",
    mood: "Playful and colorful.",
    type: "image",
  },
  {
    id: "avatar4",
    label: "Rolling Pin",
    mood: "Crafty and polished.",
    type: "image",
  },
  {
    id: "avatar5",
    label: "Golden Pup",
    mood: "Cute and extra cozy.",
    type: "image",
  },
  {
    id: "avatar6",
    label: "Joyful Baker",
    mood: "Creative and bright.",
    type: "image",
  },
  {
    id: "avatar7",
    label: "Midnight Whisk",
    mood: "Cool and confident.",
    type: "image",
  },
  {
    id: "avatar8",
    label: "Silver Chef",
    mood: "Classic and clean.",
    type: "image",
  },
  {
    id: "avatar9",
    label: "Bear Buddy",
    mood: "Sweet and quirky.",
    type: "image",
  },
  {
    id: "berry",
    label: "Berry Pop",
    mood: "Plain berry pink.",
    type: "color",
    bg: "#ff4f8b",
    accent: "#ffd4e4",
    symbol: "B",
  },
  {
    id: "mint",
    label: "Mint Glow",
    mood: "Plain mint green.",
    type: "color",
    bg: "#2cc7a5",
    accent: "#d8fff4",
    symbol: "M",
  },
  {
    id: "sky",
    label: "Sky Spark",
    mood: "Plain sky blue.",
    type: "color",
    bg: "#4b7bff",
    accent: "#dce6ff",
    symbol: "S",
  },
  {
    id: "plum",
    label: "Plum Mood",
    mood: "Plain plum purple.",
    type: "color",
    bg: "#7a4dff",
    accent: "#ebddff",
    symbol: "P",
  },
];

export function buildAvatarPresetDataUri(presetId) {
  const preset = CUSTOMER_AVATAR_PRESETS.find((item) => item.id === presetId) || CUSTOMER_AVATAR_PRESETS[0];
  if (preset.type === "image" && illustratedAvatarSources[preset.id]) {
    return illustratedAvatarSources[preset.id];
  }
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="80" fill="${preset.bg}" />
      <circle cx="80" cy="80" r="54" fill="${preset.accent}" opacity="0.35" />
      <circle cx="42" cy="42" r="10" fill="${preset.accent}" opacity="0.75" />
      <circle cx="122" cy="54" r="7" fill="${preset.accent}" opacity="0.55" />
      <circle cx="116" cy="120" r="9" fill="${preset.accent}" opacity="0.7" />
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="60" font-weight="700" fill="white">${preset.symbol}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export function resolveCustomerAvatar(apiBaseUrl, photoUrl, avatarPreset) {
  if (photoUrl) {
    return resolveImageUrl(apiBaseUrl, photoUrl);
  }
  if (avatarPreset) {
    return buildAvatarPresetDataUri(avatarPreset);
  }
  return "";
}
