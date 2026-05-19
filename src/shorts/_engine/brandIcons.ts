import {
  SiGoogle, SiFacebook, SiApple, SiNetflix,
  SiTiktok, SiWechat, SiBaidu, SiAlibabadotcom,
  SiSamsung, SiLg, SiSpotify, SiSony, SiMeta,
  SiNvidia, SiQualcomm,
} from "react-icons/si";
import {
  FaAmazon, FaMicrosoft, FaOilCan, FaIndustry, FaShip,
  FaBrain, FaGamepad, FaMicrochip,
} from "react-icons/fa";
import type { IconType } from "react-icons";

/**
 * Single shared brand registry used by both CompanyIcons (multi-icon row in
 * the original internet short) and BeatLayer's LogoBeat / StampBeat.
 *
 * For brands without a react-icon, fall back to type:"text" — the renderer
 * draws the label as bold colored text inside the badge ring.
 *
 * `brand` is the accent color (icon stroke + glow + border).
 */
export type BrandEntry =
  | { type: "icon"; Icon: IconType; brand: string }
  | { type: "text"; label: string; brand: string };

export const BRAND_MAP: Record<string, BrandEntry> = {
  // Tech / social
  Google:    { type: "icon", Icon: SiGoogle,        brand: "#4285F4" },
  Facebook:  { type: "icon", Icon: SiFacebook,      brand: "#1877F2" },
  Meta:      { type: "icon", Icon: SiMeta,          brand: "#1877F2" },
  Amazon:    { type: "icon", Icon: FaAmazon,        brand: "#FF9900" },
  Apple:     { type: "icon", Icon: SiApple,         brand: "#A2AAAD" },
  Microsoft: { type: "icon", Icon: FaMicrosoft,     brand: "#00A4EF" },
  Netflix:   { type: "icon", Icon: SiNetflix,       brand: "#E50914" },
  TikTok:    { type: "icon", Icon: SiTiktok,        brand: "#69C9D0" },
  WeChat:    { type: "icon", Icon: SiWechat,        brand: "#07C160" },
  Alibaba:   { type: "icon", Icon: SiAlibabadotcom, brand: "#FF6A00" },
  Baidu:     { type: "icon", Icon: SiBaidu,         brand: "#2932E1" },
  Samsung:   { type: "icon", Icon: SiSamsung,       brand: "#1428A0" },
  LG:        { type: "icon", Icon: SiLg,            brand: "#A50034" },
  Spotify:   { type: "icon", Icon: SiSpotify,       brand: "#1DB954" },
  Sony:      { type: "icon", Icon: SiSony,          brand: "#003087" },
  Nintendo:  { type: "text", label: "Nintendo",     brand: "#E4000F" },

  // Chip industry
  TSMC:      { type: "text", label: "TSMC",         brand: "#34D399" },
  Nvidia:    { type: "icon", Icon: SiNvidia,        brand: "#76B900" },
  Qualcomm:  { type: "icon", Icon: SiQualcomm,      brand: "#3253DC" },
  AMD:       { type: "text", label: "AMD",          brand: "#ED1C24" },

  // Generic category icons used by stamp / logo beats
  AI:        { type: "icon", Icon: FaBrain,         brand: "#A78BFA" },
  Gaming:    { type: "icon", Icon: FaGamepad,       brand: "#10B981" },
  Chip:      { type: "icon", Icon: FaMicrochip,     brand: "#34D399" },

  // Oil / industry generic
  PDVSA:     { type: "text", label: "PDVSA",        brand: "#FCD34D" },
  OPEC:      { type: "text", label: "OPEC",         brand: "#F59E0B" },
  Sanctions: { type: "icon", Icon: FaOilCan,        brand: "#EF4444" },
  Refineries:{ type: "icon", Icon: FaIndustry,      brand: "#FB923C" },
  Tankers:   { type: "icon", Icon: FaShip,          brand: "#60A5FA" },
};
