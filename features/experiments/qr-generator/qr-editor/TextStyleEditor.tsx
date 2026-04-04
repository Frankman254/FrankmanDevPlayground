"use client";

import { useId } from "react";

import { useTranslations } from "@/components/providers/locale-provider";

import { FONTS, FONT_CATEGORIES, WEIGHT_LABELS } from "./fonts";
import type { TextStyle } from "./types";

function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#F7F3EB]/45">
      {children}
    </p>
  );
}

function ColorSwatch({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5" title={label}>
      <span className="relative flex h-7 w-7 shrink-0 overflow-hidden rounded-lg border border-white/15 shadow-sm">
        <input
          className="absolute -inset-1 h-[calc(100%+8px)] w-[calc(100%+8px)] cursor-pointer opacity-0"
          onChange={(e) => onChange(e.target.value)}
          type="color"
          value={value}
        />
        <span className="h-full w-full" style={{ background: value }} />
      </span>
      {label ? <span className="text-xs text-[#F7F3EB]/50">{label}</span> : null}
    </label>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      aria-checked={checked}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors",
        checked ? "bg-[#F5C400]" : "bg-white/20",
      )}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span
        className={cn(
          "absolute h-4 w-4 rounded-full bg-[#0C0C0F] shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-1">
        <span className="text-xs font-medium text-[#F7F3EB]/60">{label}</span>
        <span className="min-w-[3rem] text-right text-xs font-bold text-[#F5C400]">
          {value}
          {unit}
        </span>
      </div>
      <input
        className="w-full accent-[#F5C400]"
        max={max}
        min={min}
        onChange={(e) => onChange(Number(e.target.value))}
        step={step}
        type="range"
        value={value}
      />
    </div>
  );
}

interface TextStyleEditorProps {
  style: TextStyle;
  onChange: (s: TextStyle) => void;
}

export function TextStyleEditor({ style, onChange }: TextStyleEditorProps) {
  const t = useTranslations();
  const e = t.qrGenerator.editor;
  const baseId = useId();
  const hasText = style.text.trim().length > 0;

  function set<K extends keyof TextStyle>(key: K, value: TextStyle[K]) {
    onChange({ ...style, [key]: value });
  }

  const currentFont = FONTS.find((f) => f.css === style.fontFamily) ?? FONTS[0];
  const availableWeights = currentFont.weights;

  function setFont(css: string) {
    const font = FONTS.find((f) => f.css === css);
    if (!font) return;
    const weights = font.weights;
    const snapped = weights.reduce((prev, curr) =>
      Math.abs(curr - style.fontWeight) < Math.abs(prev - style.fontWeight) ? curr : prev,
    );
    onChange({ ...style, fontFamily: css, fontWeight: snapped, italic: style.italic && font.italic });
  }

  return (
    <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label
            className="text-sm font-semibold text-white"
            htmlFor={`${baseId}-text`}
          >
            {e.titleLabel}{" "}
            <span className="font-normal text-[#F7F3EB]/45">{e.titleOptional}</span>
          </label>
          {hasText ? (
            <ColorSwatch
              label={e.color}
              onChange={(v) => set("color", v)}
              value={style.color}
            />
          ) : null}
        </div>
        <input
          className="w-full rounded-2xl border border-white/10 bg-[#0C0C0F]/80 px-4 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-[#F7F3EB]/35 focus:border-[#F5C400]/50"
          id={`${baseId}-text`}
          onChange={(ev) => set("text", ev.target.value)}
          placeholder={e.titlePlaceholder}
          type="text"
          value={style.text}
        />
      </div>

      {hasText ? (
        <>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <SectionLabel>{e.typography}</SectionLabel>
            <div
              className="max-h-52 overflow-y-auto rounded-xl border border-white/10 bg-[#0C0C0F]/50 p-2"
              style={{ scrollbarWidth: "thin" }}
            >
              {FONT_CATEGORIES.map((cat) => {
                const catFonts = FONTS.filter((f) => f.category === cat.id);
                return (
                  <div className="mb-2 last:mb-0" key={cat.id}>
                    <p className="mb-1 px-1 text-[9px] font-bold uppercase tracking-widest text-[#F7F3EB]/40">
                      {cat.label}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {catFonts.map((font) => (
                        <button
                          className={cn(
                            "rounded-lg border px-2.5 py-1 text-sm transition-all",
                            style.fontFamily === font.css
                              ? "border-[#F5C400]/50 bg-[#F5C400]/15 text-[#F5C400]"
                              : "border-transparent text-[#F7F3EB]/75 hover:border-white/15 hover:bg-white/5",
                          )}
                          key={font.id}
                          onClick={() => setFont(font.css)}
                          style={{ fontFamily: font.css }}
                          title={font.label}
                          type="button"
                        >
                          {font.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {availableWeights.map((w) => (
                <button
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-xs transition-all",
                    style.fontWeight === w
                      ? "border-[#F5C400]/50 bg-[#F5C400]/15 text-[#F5C400]"
                      : "border-white/10 text-[#F7F3EB]/60 hover:border-white/20",
                  )}
                  key={w}
                  onClick={() => set("fontWeight", w)}
                  style={{ fontWeight: w, fontFamily: currentFont.css }}
                  title={WEIGHT_LABELS[w]}
                  type="button"
                >
                  {WEIGHT_LABELS[w] ?? w}
                </button>
              ))}
              {currentFont.italic ? (
                <button
                  className={cn(
                    "rounded-lg border px-3 py-1 text-sm font-medium italic transition-all",
                    style.italic
                      ? "border-[#F5C400]/50 bg-[#F5C400]/15 text-[#F5C400]"
                      : "border-white/10 text-[#F7F3EB]/60",
                  )}
                  onClick={() => set("italic", !style.italic)}
                  title={e.italic}
                  type="button"
                >
                  I
                </button>
              ) : null}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <SliderField
                label={e.fontSize}
                max={60}
                min={12}
                onChange={(v) => set("fontSize", v)}
                step={1}
                unit="px"
                value={style.fontSize}
              />
              <SliderField
                label={e.letterSpacing}
                max={20}
                min={-2}
                onChange={(v) => set("letterSpacing", v)}
                step={0.5}
                unit="px"
                value={style.letterSpacing}
              />
            </div>

            <div className="mt-3 flex gap-1.5">
              {(
                [
                  { value: "none" as const, label: "Aa", title: e.transformNone },
                  { value: "uppercase" as const, label: "AA", title: e.transformUpper },
                  { value: "lowercase" as const, label: "aa", title: e.transformLower },
                ] as const
              ).map(({ value, label, title }) => (
                <button
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
                    style.textTransform === value
                      ? "border-[#F5C400]/50 bg-[#F5C400]/15 text-[#F5C400]"
                      : "border-white/10 text-[#F7F3EB]/65",
                  )}
                  key={value}
                  onClick={() => set("textTransform", value)}
                  title={title}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between gap-3">
              <SectionLabel>{e.stroke}</SectionLabel>
              <Toggle checked={style.strokeEnabled} onChange={(v) => set("strokeEnabled", v)} />
            </div>
            {style.strokeEnabled ? (
              <div className="mt-2 space-y-3">
                <ColorSwatch
                  label={e.color}
                  onChange={(v) => set("strokeColor", v)}
                  value={style.strokeColor}
                />
                <SliderField
                  label={e.strokeWidth}
                  max={12}
                  min={0.5}
                  onChange={(v) => set("strokeWidth", v)}
                  step={0.5}
                  unit="px"
                  value={style.strokeWidth}
                />
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center justify-between gap-3">
              <SectionLabel>{e.shadow}</SectionLabel>
              <Toggle checked={style.shadowEnabled} onChange={(v) => set("shadowEnabled", v)} />
            </div>
            {style.shadowEnabled ? (
              <div className="mt-2 space-y-3">
                <ColorSwatch
                  label={e.color}
                  onChange={(v) => set("shadowColor", v)}
                  value={style.shadowColor}
                />
                <SliderField
                  label={e.shadowBlur}
                  max={30}
                  min={0}
                  onChange={(v) => set("shadowBlur", v)}
                  step={1}
                  unit="px"
                  value={style.shadowBlur}
                />
                <div className="grid grid-cols-2 gap-3">
                  <SliderField
                    label={e.shadowX}
                    max={30}
                    min={-30}
                    onChange={(v) => set("shadowOffsetX", v)}
                    step={1}
                    unit="px"
                    value={style.shadowOffsetX}
                  />
                  <SliderField
                    label={e.shadowY}
                    max={30}
                    min={-30}
                    onChange={(v) => set("shadowOffsetY", v)}
                    step={1}
                    unit="px"
                    value={style.shadowOffsetY}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
