"use client";

import { useState } from "react";
import Image from "next/image";

// ── Brand tokens ──────────────────────────────────────────────────────────────

const COLORS = [
  { name: "Wiz Orange",   hex: "#F97316", rgb: "249 115 22",  role: "Primary · logo wordmark",   dark: false },
  { name: "Lingo Purple", hex: "#9333EA", rgb: "147 51 234",  role: "Primary · logo wordmark",   dark: false },
  { name: "Magic Pink",   hex: "#F43F88", rgb: "244 63 136",  role: "Accent · bubble gradient",  dark: false },
  { name: "Deep Violet",  hex: "#7C3AED", rgb: "124 58 237",  role: "Brand dark · backgrounds",  dark: false },
  { name: "Spark Gold",   hex: "#FFD700", rgb: "255 215 0",   role: "Accent · stars & badges",   dark: true  },
  { name: "Midnight",     hex: "#0F0C29", rgb: "15 12 41",    role: "Dark background",            dark: false },
  { name: "Pure White",   hex: "#FFFFFF", rgb: "255 255 255", role: "Light background",           dark: true  },
  { name: "Soft Lilac",   hex: "#EDE9FE", rgb: "237 233 254", role: "UI tint / hover states",    dark: true  },
];

const BADGES = [
  { emoji: "✨", label: "Spark",           color: "#F97316", bg: "#FFF7ED" },
  { emoji: "📚", label: "Word Wizard",     color: "#4F46E5", bg: "#EEF2FF" },
  { emoji: "🎤", label: "Voice Wizard",    color: "#9333EA", bg: "#FAF5FF" },
  { emoji: "🧙", label: "Language Wizard", color: "#059669", bg: "#ECFDF5" },
  { emoji: "👑", label: "Grand Wizard",    color: "#D97706", bg: "#FFFBEB" },
];

// ── PNG download helper (strips @import to avoid canvas taint) ────────────────

type LogoVariant = "color" | "white" | "dark-bg" | "orange-bg";

async function downloadPng(variant: LogoVariant, scale = 3) {
  const res  = await fetch("/wiziingo-logo.svg");
  const text = await res.text();
  const svg  = text.replace(/@import[^;]+;/g, "");

  const vbMatch = svg.match(/viewBox="([^"]+)"/);
  const [, , , svgW, svgH] = (vbMatch?.[1] ?? "0 0 218 62")
    .split(/\s+/).map(Number);

  const pad = (variant === "dark-bg" || variant === "orange-bg") ? 44 : 16;
  const canvas = document.createElement("canvas");
  canvas.width  = (svgW + pad * 2) * scale;
  canvas.height = (svgH + pad * 2) * scale;
  const ctx = canvas.getContext("2d")!;

  if (variant === "dark-bg")    { ctx.fillStyle = "#0F0C29"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  if (variant === "orange-bg")  { ctx.fillStyle = "#F97316"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  if (variant === "white")      ctx.filter = "brightness(0) invert(1)";

  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url  = URL.createObjectURL(blob);
  await new Promise<void>((resolve, reject) => {
    const img = document.createElement("img");
    img.onload = () => {
      ctx.drawImage(img, pad * scale, pad * scale, svgW * scale, svgH * scale);
      resolve();
    };
    img.onerror = reject;
    img.src = url;
  });
  URL.revokeObjectURL(url);

  const a = document.createElement("a");
  a.href     = canvas.toDataURL("image/png");
  a.download = `wiziingo-logo-${variant}@${scale}x.png`;
  a.click();
}

async function downloadAll() {
  for (const v of ["color", "white", "dark-bg", "orange-bg"] as LogoVariant[]) {
    await downloadPng(v, 3);
    await new Promise(r => setTimeout(r, 300));
  }
}

// ── Components ────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-20">
      <div className="flex items-center gap-4 mb-8">
        <h2 style={{ fontFamily: "var(--font-fredoka), sans-serif", fontSize: 28, color: "#1e1b4b", fontWeight: 600, lineHeight: 1.25 }}>
          {title}
        </h2>
        <div className="flex-1 h-px" style={{ background: "#e5e7eb" }} />
      </div>
      {children}
    </section>
  );
}

function DownloadBtn({ onClick, label = "Download PNG" }: { onClick: () => void; label?: string }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function go() {
    setBusy(true);
    try { await onClick(); setDone(true); setTimeout(() => setDone(false), 2000); }
    finally { setBusy(false); }
  }
  return (
    <button onClick={go} disabled={busy}
      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
      style={{ background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" }}>
      {busy ? "⏳ Generating…" : done ? "✓ Downloaded" : `⬇ ${label}`}
    </button>
  );
}

function ColorSwatch({ color }: { color: typeof COLORS[0] }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(color.hex);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
      <div className="h-24 flex items-end px-4 pb-3 cursor-pointer" style={{ background: color.hex }} onClick={copy}>
        <span className="text-xs font-mono font-bold" style={{ color: color.dark ? "#1e1b4b" : "#fff", opacity: 0.9 }}>
          {copied ? "Copied!" : color.hex}
        </span>
      </div>
      <div className="px-4 py-3" style={{ background: "#fff" }}>
        <p className="font-bold text-sm" style={{ color: "#111827" }}>{color.name}</p>
        <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{color.role}</p>
        <p className="text-xs mt-1 font-mono" style={{ color: "#9ca3af" }}>rgb({color.rgb})</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BrandKitPage() {
  return (
    <div style={{ background: "#fafafa", minHeight: "100vh" }}>

      {/* Header */}
      <header style={{ background: "#0F0C29", padding: "48px 80px" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <Image src="/wiziingo-logo.svg" alt="WizLingo" width={248} height={63} />
            <p className="mt-4 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              Brand Identity Guidelines · Version 1.0
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
              An Edvanta Initiative
            </p>
            <Image src="/edvanta-logo1.png" alt="Edvanta" width={110} height={30}
              className="brightness-0 invert opacity-50 ml-auto" />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-20 py-16">

        {/* Intro */}
        <div className="mb-20">
          <h1 style={{ fontFamily: "var(--font-fredoka), sans-serif", fontSize: 48, color: "#0F0C29", fontWeight: 600, lineHeight: 1.1, marginBottom: 16 }}>
            WizLingo Brand Kit
          </h1>
          <p style={{ color: "#6b7280", fontSize: 18, maxWidth: 560, lineHeight: 1.7 }}>
            Everything you need to represent WizLingo consistently across print, digital,
            and social media. Download all assets below.
          </p>
          <div className="mt-6 flex gap-3">
            <button onClick={downloadAll}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: "linear-gradient(135deg, #F97316, #9333EA)", fontSize: 14 }}>
              ⬇ Download All PNGs
            </button>
            <a href="/wiziingo-logo.svg" download="wiziingo-logo.svg"
              className="flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all hover:opacity-90 active:scale-95"
              style={{ background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb", fontSize: 14 }}>
              ⬇ SVG (Vector)
            </a>
          </div>
        </div>

        {/* ── Logo Variants ── */}
        <Section title="Logo Variants">
          <div className="grid grid-cols-2 gap-6">

            {/* Color on white */}
            <div className="rounded-3xl p-10 flex flex-col gap-6" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
              <div className="flex-1 flex items-center justify-center py-6">
                <Image src="/wiziingo-logo.svg" alt="WizLingo" width={220} height={63} unoptimized />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm" style={{ color: "#111827" }}>Full Colour</p>
                  <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>Use on white / light backgrounds</p>
                </div>
                <DownloadBtn onClick={() => downloadPng("color")} />
              </div>
            </div>

            {/* White on dark */}
            <div className="rounded-3xl p-10 flex flex-col gap-6" style={{
              background: "radial-gradient(ellipse at 85% 15%, rgba(124,58,237,0.45) 0%, transparent 55%), radial-gradient(ellipse at 15% 85%, rgba(244,63,136,0.30) 0%, transparent 55%), #0D0A24",
              border: "1px solid rgba(124,58,237,0.35)"
            }}>
              <div className="flex-1 flex items-center justify-center py-6">
                <Image src="/wiziingo-logo.svg" alt="WizLingo" width={248} height={63} unoptimized />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm" style={{ color: "#fff" }}>White / Reversed</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Use on dark / coloured backgrounds</p>
                </div>
                <DownloadBtn onClick={() => downloadPng("white")} />
              </div>
            </div>

            {/* On brand gradient */}
            <div className="rounded-3xl p-10 flex flex-col gap-6" style={{ background: "linear-gradient(135deg, #7C3AED, #F43F88)" }}>
              <div className="flex-1 flex items-center justify-center py-6">
                <Image src="/wiziingo-logo.svg" alt="WizLingo" width={248} height={63} unoptimized />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm" style={{ color: "#fff" }}>On Brand Gradient</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>For social media & marketing</p>
                </div>
                <DownloadBtn onClick={() => downloadPng("dark-bg")} />
              </div>
            </div>

            {/* On orange */}
            <div className="rounded-3xl p-10 flex flex-col gap-6" style={{ background: "#F97316" }}>
              <div className="flex-1 flex items-center justify-center py-6">
                <Image src="/wiziingo-logo.svg" alt="WizLingo" width={248} height={63} unoptimized />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm" style={{ color: "#fff" }}>On Wiz Orange</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>High-energy marketing use</p>
                </div>
                <DownloadBtn onClick={() => downloadPng("orange-bg")} />
              </div>
            </div>
          </div>
        </Section>

        {/* ── Colour Palette ── */}
        <Section title="Colour Palette">
          <div className="grid grid-cols-4 gap-5">
            {COLORS.map(c => <ColorSwatch key={c.hex} color={c} />)}
          </div>
          <p className="mt-6 text-sm" style={{ color: "#9ca3af" }}>
            Click any swatch to copy the hex code.
          </p>
        </Section>

        {/* ── Typography ── */}
        <Section title="Typography">
          <div className="grid grid-cols-2 gap-6">

            {/* Fredoka */}
            <div className="rounded-3xl p-8" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#9333EA" }}>
                Display / Logo
              </p>
              <p style={{ fontFamily: "var(--font-fredoka), sans-serif", fontSize: 52, color: "#0F0C29", lineHeight: 1.25 }}>
                WizLingo
              </p>
              <p className="mt-4" style={{ fontFamily: "var(--font-fredoka), sans-serif", fontSize: 28, color: "#374151" }}>
                Aa Bb Cc Dd Ee Ff
              </p>
              <p className="mt-2" style={{ fontFamily: "var(--font-fredoka), sans-serif", fontSize: 18, color: "#6b7280" }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                abcdefghijklmnopqrstuvwxyz<br />
                0 1 2 3 4 5 6 7 8 9
              </p>
              <div className="mt-6 pt-5" style={{ borderTop: "1px solid #f3f4f6" }}>
                <p className="text-xs font-semibold" style={{ color: "#111827" }}>Fredoka</p>
                <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>Weight 400 · 600 · Google Fonts</p>
                <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>Use: logo, headlines, CTAs, badges</p>
              </div>
            </div>

            {/* Geist */}
            <div className="rounded-3xl p-8" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F97316" }}>
                Body / UI
              </p>
              <p style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontSize: 48, fontWeight: 800, color: "#0F0C29", lineHeight: 1.25 }}>
                Read.<br />Speak.
              </p>
              <p className="mt-4" style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontSize: 22, fontWeight: 600, color: "#374151" }}>
                AI-powered learning
              </p>
              <p className="mt-2 leading-relaxed" style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontSize: 15, color: "#6b7280" }}>
                WizLingo helps students in Grade I–X
                build reading fluency and speaking
                confidence through adaptive AI sessions.
              </p>
              <div className="mt-6 pt-5" style={{ borderTop: "1px solid #f3f4f6" }}>
                <p className="text-xs font-semibold" style={{ color: "#111827" }}>Geist Sans</p>
                <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>Weight 400 · 600 · 800 · Vercel</p>
                <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>Use: body copy, UI labels, data</p>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Badge System ── */}
        <Section title="Badge System">
          <div className="grid grid-cols-5 gap-4">
            {BADGES.map(b => (
              <div key={b.label} className="rounded-2xl p-6 text-center" style={{ background: b.bg, border: `1px solid ${b.color}22` }}>
                <div className="text-5xl mb-3">{b.emoji}</div>
                <p className="font-bold text-sm" style={{ color: b.color,
                  fontFamily: "var(--font-fredoka), sans-serif" }}>
                  {b.label}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm" style={{ color: "#9ca3af" }}>
            Each badge has a unique colour tied to its gradient in the shareable badge image.
          </p>
        </Section>

        {/* ── Co-branding ── */}
        <Section title="Co-branding with Edvanta">
          <div className="rounded-3xl p-10 flex items-center justify-between" style={{ background: "#0F0C29" }}>
            <Image src="/wiziingo-logo.svg" alt="WizLingo" width={228} height={57} unoptimized />
            <div style={{ width: 1, height: 48, background: "rgba(255,255,255,0.15)" }} />
            <div className="text-right">
              <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>An initiative by</p>
              <Image src="/edvanta-logo1.png" alt="Edvanta" width={120} height={34}
                className="brightness-0 invert opacity-70 ml-auto" />
            </div>
          </div>
          <p className="mt-5 text-sm" style={{ color: "#9ca3af" }}>
            Always pair the WizLingo logo with "An Edvanta Initiative" on official communications,
            certificates, and printed materials.
          </p>
        </Section>

        {/* ── Usage rules ── */}
        <Section title="Do's & Don'ts">
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-3xl p-8" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <p className="font-bold text-base mb-4" style={{ color: "#15803d" }}>✓ Do</p>
              {[
                "Use the SVG for digital and print — it scales to any size",
                "Maintain clear space equal to the bubble icon width around the logo",
                "Use the white reversed version on any dark or vivid background",
                "Always include Edvanta attribution on printed/official materials",
                'Use "WizLingo" as one word — never "Wiz Lingo" or "wizlingo"',
              ].map(t => (
                <p key={t} className="text-sm mb-2.5 flex gap-2" style={{ color: "#166534" }}>
                  <span style={{ color: "#22c55e", flexShrink: 0 }}>·</span>{t}
                </p>
              ))}
            </div>
            <div className="rounded-3xl p-8" style={{ background: "#fff1f2", border: "1px solid #fecdd3" }}>
              <p className="font-bold text-base mb-4" style={{ color: "#be123c" }}>✗ Don't</p>
              {[
                "Stretch, squash, or rotate the logo",
                "Change the brand colours or apply extra effects (drop shadows, outlines)",
                "Place the full-colour logo on dark or coloured backgrounds",
                "Use the logo smaller than 80px wide in digital contexts",
                "Recreate the logo in other fonts or modify the icon",
              ].map(t => (
                <p key={t} className="text-sm mb-2.5 flex gap-2" style={{ color: "#9f1239" }}>
                  <span style={{ color: "#f43f5e", flexShrink: 0 }}>·</span>{t}
                </p>
              ))}
            </div>
          </div>
        </Section>

      </div>

      {/* Footer */}
      <footer className="px-20 py-10 flex items-center justify-between"
        style={{ borderTop: "1px solid #e5e7eb", background: "#fff" }}>
        <p className="text-sm" style={{ color: "#9ca3af" }}>
          © {new Date().getFullYear()} Edvanta. WizLingo Brand Kit v1.0
        </p>
        <p className="text-sm" style={{ color: "#9ca3af" }}>
          For brand queries: support@edvanta.co.in
        </p>
      </footer>
    </div>
  );
}
