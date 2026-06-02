// ── Badge config ─────────────────────────────────────────────────────────────

const BADGE_CONFIG: Record<string, {
  emoji: string; label: string; tagline: string;
  g1: string; g2: string; g3: string;       // 3-stop diagonal gradient
  ringColor: string; labelDark: string;     // medallion ring + inner label
}> = {
  SPARK: {
    emoji: "✨", label: "Spark", tagline: "First session complete!",
    g1: "#FF6B35", g2: "#FF9F1C", g3: "#FFCA3A",
    ringColor: "#FFD700", labelDark: "#7C2D12",
  },
  WORD_WIZARD: {
    emoji: "📚", label: "Word Wizard", tagline: "Reading level up!",
    g1: "#1E3A8A", g2: "#3B82F6", g3: "#06B6D4",
    ringColor: "#93C5FD", labelDark: "#1E3A8A",
  },
  VOICE_WIZARD: {
    emoji: "🎤", label: "Voice Wizard", tagline: "Speaking level up!",
    g1: "#6B21A8", g2: "#A855F7", g3: "#EC4899",
    ringColor: "#D8B4FE", labelDark: "#4C1D95",
  },
  LANGUAGE_WIZARD: {
    emoji: "🧙", label: "Language Wizard", tagline: "Mastered Reading & Speaking!",
    g1: "#064E3B", g2: "#059669", g3: "#34D399",
    ringColor: "#6EE7B7", labelDark: "#064E3B",
  },
  GRAND_WIZARD: {
    emoji: "👑", label: "Grand Wizard", tagline: "Highest level achieved!",
    g1: "#92400E", g2: "#D97706", g3: "#FCD34D",
    ringColor: "#FFD700", labelDark: "#78350F",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Draw a filled 5-point star centred at (cx, cy) */
function star5(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  outerR: number, innerR: number,
  fill: string, alpha = 1,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Draw the gold sunburst rays behind the medallion */
function sunburst(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  innerR: number, outerR: number,
  rays = 24, color = "#FFD700",
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.55;
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  for (let i = 0; i < rays * 2; i++) {
    const angle = (i * Math.PI) / rays - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

/** Scatter decorative stars around the canvas edges */
function scatterStars(ctx: CanvasRenderingContext2D, size: number) {
  const positions: [number, number, number, number][] = [
    // [x, y, outerR, alpha]
    [90,  70,  22, 0.85], [size - 90,  70,  18, 0.75],
    [55,  size - 100, 20, 0.70], [size - 55, size - 100, 24, 0.80],
    [180, 130, 14, 0.65], [size - 180, 130, 16, 0.60],
    [40,  400, 16, 0.55], [size - 40,  400, 14, 0.50],
    [110, 780, 18, 0.65], [size - 110, 780, 20, 0.70],
    [300, 60,  12, 0.50], [size - 300, 60,  10, 0.45],
    [60,  600, 10, 0.40], [size - 60,  600, 12, 0.40],
  ];
  for (const [x, y, r, a] of positions) {
    star5(ctx, x, y, r, r * 0.42, "#ffffff", a);
  }
}

/** Confetti dots scattered in background */
function confettiDots(ctx: CanvasRenderingContext2D, size: number) {
  const dots: [number, number, number, string][] = [
    [140, 200, 8, "rgba(255,255,255,0.25)"],
    [size - 150, 250, 6, "rgba(255,255,255,0.20)"],
    [200, size - 180, 7, "rgba(255,255,255,0.22)"],
    [size - 200, size - 200, 9, "rgba(255,255,255,0.20)"],
    [size * 0.15, size * 0.55, 5, "rgba(255,255,255,0.18)"],
    [size * 0.85, size * 0.55, 6, "rgba(255,255,255,0.18)"],
    [size * 0.08, size * 0.35, 4, "rgba(255,255,255,0.15)"],
    [size * 0.92, size * 0.35, 5, "rgba(255,255,255,0.15)"],
  ];
  for (const [x, y, r, fill] of dots) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
  }
}

/** Rounded rectangle path helper */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Main generator ────────────────────────────────────────────────────────────

export async function generateBadgeImage(badgeType: string, studentName: string): Promise<Blob> {
  const cfg = BADGE_CONFIG[badgeType];
  if (!cfg) throw new Error("Unknown badge type");

  const SIZE = 1080;
  const CX = SIZE / 2;       // horizontal centre
  const CY = 415;            // medallion vertical centre
  const MEDAL_R = 268;       // white fill radius
  const RING_R  = MEDAL_R + 18;  // gold ring outer
  const BURST_R = RING_R + 55;   // sunburst tip radius

  const canvas = document.createElement("canvas");
  canvas.width = SIZE; canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  // ── 1. Background (diagonal 3-stop gradient) ───────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  bg.addColorStop(0,   cfg.g1);
  bg.addColorStop(0.5, cfg.g2);
  bg.addColorStop(1,   cfg.g3);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // ── 2. Soft radial vignette (darker edges → focus on centre) ──────────────
  const vig = ctx.createRadialGradient(CX, CY, MEDAL_R * 0.5, CX, CY, SIZE * 0.8);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.28)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // ── 3. Decorative confetti + edge stars ───────────────────────────────────
  confettiDots(ctx, SIZE);
  scatterStars(ctx, SIZE);

  // ── 4. Sunburst rays ──────────────────────────────────────────────────────
  sunburst(ctx, CX, CY, RING_R + 4, BURST_R, 24, cfg.ringColor);

  // ── 5. Gold ring glow ─────────────────────────────────────────────────────
  ctx.save();
  ctx.shadowColor = cfg.ringColor;
  ctx.shadowBlur = 40;
  const ringGrad = ctx.createRadialGradient(CX, CY, MEDAL_R, CX, CY, RING_R);
  ringGrad.addColorStop(0, cfg.ringColor);
  ringGrad.addColorStop(1, "#fff8a0");
  ctx.fillStyle = ringGrad;
  ctx.beginPath();
  ctx.arc(CX, CY, RING_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── 6. Medallion white fill ───────────────────────────────────────────────
  const medalFill = ctx.createRadialGradient(CX, CY - 80, 0, CX, CY, MEDAL_R);
  medalFill.addColorStop(0, "#ffffff");
  medalFill.addColorStop(1, "#f0f4ff");
  ctx.fillStyle = medalFill;
  ctx.beginPath();
  ctx.arc(CX, CY, MEDAL_R, 0, Math.PI * 2);
  ctx.fill();

  // ── 7. Emoji (inside medallion) ────────────────────────────────────────────
  ctx.save();
  ctx.font = `${Math.round(SIZE * 0.19)}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.12)";
  ctx.shadowBlur = 14;
  ctx.fillText(cfg.emoji, CX, CY - 48);
  ctx.restore();

  // ── 8. Badge label (inside medallion, below emoji) ────────────────────────
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Label in two lines if long (Language Wizard)
  const labelParts = cfg.label.split(" ");
  if (labelParts.length >= 2) {
    const half = Math.ceil(labelParts.length / 2);
    const line1 = labelParts.slice(0, half).join(" ").toUpperCase();
    const line2 = labelParts.slice(half).join(" ").toUpperCase();
    ctx.font = `900 ${Math.round(SIZE * 0.063)}px system-ui, sans-serif`;
    ctx.fillStyle = cfg.labelDark;
    ctx.shadowColor = "rgba(0,0,0,0.08)";
    ctx.shadowBlur = 4;
    ctx.fillText(line1, CX, CY + 148);
    ctx.fillText(line2, CX, CY + 220);
  } else {
    ctx.font = `900 ${Math.round(SIZE * 0.072)}px system-ui, sans-serif`;
    ctx.fillStyle = cfg.labelDark;
    ctx.shadowColor = "rgba(0,0,0,0.08)";
    ctx.shadowBlur = 4;
    ctx.fillText(cfg.label.toUpperCase(), CX, CY + 180);
  }
  ctx.restore();

  // ── 9. Three stars below medallion ────────────────────────────────────────
  const starY = CY + MEDAL_R + 52;
  for (let i = 0; i < 3; i++) {
    star5(ctx, CX + (i - 1) * 58, starY, 18, 8, cfg.ringColor, 0.9);
  }

  // ── 10. "Awarded to" label ────────────────────────────────────────────────
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = `italic ${Math.round(SIZE * 0.033)}px Georgia, serif`;
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText("Awarded to", CX, starY + 62);
  ctx.restore();

  // ── 11. Student name ──────────────────────────────────────────────────────
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = `900 ${Math.round(SIZE * 0.068)}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 14;
  // Fit long names by reducing font size
  let nameFont = Math.round(SIZE * 0.068);
  ctx.font = `900 ${nameFont}px system-ui, sans-serif`;
  while (ctx.measureText(studentName).width > SIZE - 160 && nameFont > 36) {
    nameFont -= 4;
    ctx.font = `900 ${nameFont}px system-ui, sans-serif`;
  }
  ctx.fillText(studentName, CX, starY + 148);
  ctx.restore();

  // ── 12. Tagline ────────────────────────────────────────────────────────────
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = `${Math.round(SIZE * 0.031)}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.68)";
  ctx.fillText(cfg.tagline, CX, starY + 202);
  ctx.restore();

  // ── 13. Date ──────────────────────────────────────────────────────────────
  const date = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = `${Math.round(SIZE * 0.028)}px system-ui, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText(date, CX, starY + 252);
  ctx.restore();

  // ── 14. WizLingo logo (top) ────────────────────────────────────────────────
  try {
    const wzLogo = await loadImage("/wiziingo-logo.svg");
    // Render at ~2× the SVG viewBox (236×60) for crisp appearance at 1080px
    const wzH = 88, wzW = Math.round((236 / 60) * wzH);
    // Pill backdrop
    ctx.save();
    const wPillW = wzW + 64, wPillH = wzH + 24;
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    roundRect(ctx, CX - wPillW / 2, 28, wPillW, wPillH, wPillH / 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, CX - wPillW / 2, 28, wPillW, wPillH, wPillH / 2);
    ctx.stroke();
    // Logo — invert to white so it reads on any badge colour
    ctx.filter = "brightness(0) invert(1)";
    ctx.globalAlpha = 0.92;
    ctx.drawImage(wzLogo, CX - wzW / 2, 28 + (wPillH - wzH) / 2, wzW, wzH);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
    ctx.restore();
  } catch {
    // Fallback text if SVG fails to load
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = `bold ${Math.round(SIZE * 0.041)}px system-ui, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText("🌟 WizLingo", CX, 82);
    ctx.restore();
  }

  // ── 15. Edvanta logo (bottom) ─────────────────────────────────────────────
  const edvantaY = SIZE - 72;
  try {
    const logo = await loadImage("/edvanta-logo1.png");
    const logoH = 38;
    const logoW = Math.round((logo.naturalWidth / logo.naturalHeight) * logoH);

    // Draw a pill behind the logo
    const ePillW = logoW + 80, ePillH = 56;
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    roundRect(ctx, CX - ePillW / 2, edvantaY - ePillH / 2 + 4, ePillW, ePillH, 28);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, CX - ePillW / 2, edvantaY - ePillH / 2 + 4, ePillW, ePillH, 28);
    ctx.stroke();

    // Draw logo white (invert filter)
    ctx.filter = "brightness(0) invert(1)";
    ctx.globalAlpha = 0.85;
    ctx.drawImage(logo, CX - logoW / 2, edvantaY - logoH / 2 + 4, logoW, logoH);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
    ctx.restore();
  } catch {
    // Fallback: text
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = `bold ${Math.round(SIZE * 0.03)}px system-ui, sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("An Edvanta Initiative", CX, edvantaY + 12);
    ctx.restore();
  }

  return new Promise((resolve, reject) =>
    canvas.toBlob(b => b ? resolve(b) : reject(new Error("Canvas toBlob failed")), "image/png")
  );
}

// ── Share ─────────────────────────────────────────────────────────────────────

export async function shareBadge(badgeType: string, studentName: string, badgeLabel: string) {
  const blob = await generateBadgeImage(badgeType, studentName);
  const file = new File([blob], `wiziingo-${badgeType.toLowerCase()}-badge.png`, { type: "image/png" });

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: `I earned the ${badgeLabel} badge on WizLingo! 🎉`,
      text: `Check out my ${badgeLabel} badge — earned on WizLingo by Edvanta! 🌟`,
    });
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wiziingo-${badgeType.toLowerCase()}-badge.png`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
