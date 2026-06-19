import { useEffect, useState } from "react";
import { Palette, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ThemeColor = {
  id: string;
  label: string;
  swatch: string;
  primary: string;
  ring: string;
  accent: string;
  secondary: string;
  secondaryForeground: string;
};

const THEMES: ThemeColor[] = [
  { id: "indigo", label: "Indigo", swatch: "#6366f1",
    primary: "oklch(0.55 0.22 264)", ring: "oklch(0.55 0.22 264)", accent: "oklch(0.6 0.18 274)",
    secondary: "oklch(0.95 0.04 264)", secondaryForeground: "oklch(0.35 0.18 264)" },
  { id: "sky", label: "Sky", swatch: "#0ea5e9",
    primary: "oklch(0.62 0.16 230)", ring: "oklch(0.62 0.16 230)", accent: "oklch(0.7 0.14 220)",
    secondary: "oklch(0.95 0.04 230)", secondaryForeground: "oklch(0.38 0.14 230)" },
  { id: "emerald", label: "Emerald", swatch: "#10b981",
    primary: "oklch(0.62 0.16 155)", ring: "oklch(0.62 0.16 155)", accent: "oklch(0.7 0.14 165)",
    secondary: "oklch(0.95 0.04 155)", secondaryForeground: "oklch(0.38 0.14 155)" },
  { id: "rose", label: "Rose", swatch: "#f43f5e",
    primary: "oklch(0.62 0.22 18)", ring: "oklch(0.62 0.22 18)", accent: "oklch(0.68 0.2 10)",
    secondary: "oklch(0.95 0.04 18)", secondaryForeground: "oklch(0.4 0.18 18)" },
  { id: "amber", label: "Amber", swatch: "#f59e0b",
    primary: "oklch(0.72 0.17 70)", ring: "oklch(0.72 0.17 70)", accent: "oklch(0.78 0.15 80)",
    secondary: "oklch(0.95 0.05 80)", secondaryForeground: "oklch(0.42 0.15 70)" },
  { id: "violet", label: "Violet", swatch: "#8b5cf6",
    primary: "oklch(0.58 0.22 295)", ring: "oklch(0.58 0.22 295)", accent: "oklch(0.65 0.2 300)",
    secondary: "oklch(0.95 0.04 295)", secondaryForeground: "oklch(0.4 0.18 295)" },
  { id: "slate", label: "Slate", swatch: "#475569",
    primary: "oklch(0.35 0.02 260)", ring: "oklch(0.35 0.02 260)", accent: "oklch(0.45 0.03 260)",
    secondary: "oklch(0.95 0.01 260)", secondaryForeground: "oklch(0.28 0.02 260)" },
];

const FONTS: { id: string; label: string; stack: string; href?: string }[] = [
  { id: "inter", label: "Inter", stack: '"Inter", ui-sans-serif, system-ui, sans-serif' },
  { id: "jakarta", label: "Plus Jakarta Sans",
    stack: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
    href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" },
  { id: "manrope", label: "Manrope",
    stack: '"Manrope", ui-sans-serif, system-ui, sans-serif',
    href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" },
  { id: "dmsans", label: "DM Sans",
    stack: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" },
  { id: "system", label: "System UI",
    stack: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif' },
];

const SECONDARIES: { id: string; label: string; swatch: string; secondary: string; secondaryForeground: string }[] = [
  { id: "neutral", label: "Neutral", swatch: "#f1f5f9", secondary: "oklch(0.965 0.008 250)", secondaryForeground: "oklch(0.21 0.04 265)" },
  { id: "sky", label: "Sky tint", swatch: "#e0f2fe", secondary: "oklch(0.95 0.04 230)", secondaryForeground: "oklch(0.38 0.14 230)" },
  { id: "mint", label: "Mint", swatch: "#dcfce7", secondary: "oklch(0.95 0.05 155)", secondaryForeground: "oklch(0.38 0.14 155)" },
  { id: "blush", label: "Blush", swatch: "#fce7f3", secondary: "oklch(0.95 0.04 18)", secondaryForeground: "oklch(0.4 0.18 18)" },
  { id: "butter", label: "Butter", swatch: "#fef3c7", secondary: "oklch(0.95 0.05 80)", secondaryForeground: "oklch(0.42 0.15 70)" },
  { id: "lavender", label: "Lavender", swatch: "#ede9fe", secondary: "oklch(0.94 0.05 295)", secondaryForeground: "oklch(0.4 0.18 295)" },
  { id: "stone", label: "Stone", swatch: "#e7e5e4", secondary: "oklch(0.94 0.005 60)", secondaryForeground: "oklch(0.3 0.01 60)" },
];

function ensureFontLoaded(href?: string) {
  if (!href || typeof document === "undefined") return;
  if (document.querySelector(`link[data-font-href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-font-href", href);
  document.head.appendChild(link);
}

function applyTheme(id: string) {
  if (typeof document === "undefined") return;
  const t = THEMES.find((x) => x.id === id) ?? THEMES[0];
  const root = document.documentElement;
  root.style.setProperty("--primary", t.primary);
  root.style.setProperty("--ring", t.ring);
  root.style.setProperty("--accent", t.accent);
  root.style.setProperty("--sidebar-primary", t.primary);
  root.style.setProperty("--sidebar-ring", t.ring);
}

function applySecondary(id: string) {
  if (typeof document === "undefined") return;
  const s = SECONDARIES.find((x) => x.id === id) ?? SECONDARIES[0];
  const root = document.documentElement;
  root.style.setProperty("--secondary", s.secondary);
  root.style.setProperty("--secondary-foreground", s.secondaryForeground);
  root.style.setProperty("--muted", s.secondary);
  root.style.setProperty("--sidebar-accent", s.secondary);
  root.style.setProperty("--sidebar-accent-foreground", s.secondaryForeground);
}

function applyFont(id: string) {
  if (typeof document === "undefined") return;
  const font = FONTS.find((f) => f.id === id) ?? FONTS[0];
  ensureFontLoaded(font.href);
  document.documentElement.style.setProperty("--app-font-sans", font.stack);
}

export function AppearanceMenu() {
  const [theme, setTheme] = useState<string>("indigo");
  const [secondary, setSecondary] = useState<string>("neutral");
  const [font, setFont] = useState<string>("inter");

  useEffect(() => {
    const t = localStorage.getItem("appearance:theme") || "indigo";
    const s = localStorage.getItem("appearance:secondary") || "neutral";
    const f = localStorage.getItem("appearance:font") || "inter";
    setTheme(t);
    setSecondary(s);
    setFont(f);
    applyTheme(t);
    applySecondary(s);
    applyFont(f);
  }, []);

  function pickTheme(id: string) {
    setTheme(id);
    localStorage.setItem("appearance:theme", id);
    applyTheme(id);
  }
  function pickSecondary(id: string) {
    setSecondary(id);
    localStorage.setItem("appearance:secondary", id);
    applySecondary(id);
  }
  function pickFont(id: string) {
    setFont(id);
    localStorage.setItem("appearance:font", id);
    applyFont(id);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="size-8 rounded-full grid place-items-center text-muted-foreground hover:bg-muted"
          aria-label="Appearance"
          title="Appearance"
        >
          <Palette className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Primary color</DropdownMenuLabel>
        <div className="grid grid-cols-7 gap-1.5 px-2 py-1.5">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => pickTheme(t.id)}
              title={t.label}
              className="size-6 rounded-full transition hover:scale-110 grid place-items-center"
              style={{ backgroundColor: t.swatch, outline: theme === t.id ? `2px solid ${t.swatch}` : "none", outlineOffset: 2 }}
            >
              {theme === t.id && <Check className="size-3 text-white" />}
            </button>
          ))}
        </div>
        <DropdownMenuLabel className="mt-1">Secondary color</DropdownMenuLabel>
        <div className="grid grid-cols-7 gap-1.5 px-2 py-1.5">
          {SECONDARIES.map((s) => (
            <button
              key={s.id}
              onClick={() => pickSecondary(s.id)}
              title={s.label}
              className="size-6 rounded-full border border-border transition hover:scale-110 grid place-items-center"
              style={{ backgroundColor: s.swatch, outline: secondary === s.id ? `2px solid ${s.swatch}` : "none", outlineOffset: 2 }}
            >
              {secondary === s.id && <Check className="size-3 text-slate-700" />}
            </button>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Font family</DropdownMenuLabel>
        {FONTS.map((f) => (
          <DropdownMenuItem key={f.id} onClick={() => pickFont(f.id)} style={{ fontFamily: f.stack }}>
            <span className="flex-1">{f.label}</span>
            {font === f.id && <Check className="size-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

