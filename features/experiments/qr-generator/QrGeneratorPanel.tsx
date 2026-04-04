"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  ChevronDown,
  Download,
  ImagePlus,
  Link2,
  Move,
  QrCode,
  RefreshCcw,
  SlidersHorizontal,
  Type,
} from "lucide-react";

import { useTranslations } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

import {
  DEFAULT_TEXT_STYLE,
  type TextStyle,
  useFontsLoader,
  renderTextOnCanvas,
  TextStyleEditor,
} from "./qr-editor";
import { defaultQrCenterIcons, type QrCenterIconOption } from "./qrGeneratorIconOptions";

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function SliderRow({
  label,
  icon: Icon,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  icon?: React.ElementType;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
          {Icon ? <Icon className="h-3.5 w-3.5 text-[#F5C400]" /> : null}
          {label}
        </span>
        <span className="text-sm font-bold text-[#F5C400]">
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

const DEFAULT_ICON_SCALE = 20;
const DEFAULT_HOLE_SCALE = 28;

function iconOptionLabel(option: QrCenterIconOption, icons: Record<string, string>): string {
  if ("uploadName" in option) return option.uploadName;
  return icons[option.labelKey] ?? option.labelKey;
}

export function QrGeneratorPanel() {
  const t = useTranslations();
  const q = t.qrGenerator;
  const icons = q.icons;

  useFontsLoader();

  const qrRef = useRef<HTMLDivElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [value, setValue] = useState("");
  const [size, setSize] = useState(280);
  const [selectedIconId, setSelectedIconId] = useState("playground");
  const [iconScale, setIconScale] = useState(DEFAULT_ICON_SCALE);
  const [holeScale, setHoleScale] = useState(DEFAULT_HOLE_SCALE);
  const [iconOffsetX, setIconOffsetX] = useState(0);
  const [iconOffsetY, setIconOffsetY] = useState(0);
  const [customIcons, setCustomIcons] = useState<QrCenterIconOption[]>([]);
  const [textStyle, setTextStyle] = useState<TextStyle>(DEFAULT_TEXT_STYLE);
  const [mobileAjustesOpen, setMobileAjustesOpen] = useState(false);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    if (!banner) return;
    const id = setTimeout(() => setBanner(null), 4000);
    return () => clearTimeout(id);
  }, [banner]);

  const allIcons = useMemo(() => [...defaultQrCenterIcons, ...customIcons], [customIcons]);
  const selectedIcon = useMemo(
    () => allIcons.find((o) => o.id === selectedIconId)?.src ?? "",
    [allIcons, selectedIconId],
  );
  const titleText = textStyle.text.trim();

  const iconSizePx = useMemo(() => Math.round((size * iconScale) / 100), [size, iconScale]);
  const holeSizePx = useMemo(() => Math.round((size * holeScale) / 100), [size, holeScale]);
  const safeInset = useMemo(() => Math.max(size * 0.2, 48), [size]);

  const holeCenterX = useMemo(
    () => clamp(size / 2 + iconOffsetX, safeInset + holeSizePx / 2, size - safeInset - holeSizePx / 2),
    [size, iconOffsetX, safeInset, holeSizePx],
  );

  const holeCenterY = useMemo(
    () => clamp(size / 2 + iconOffsetY, safeInset + holeSizePx / 2, size - safeInset - holeSizePx / 2),
    [size, iconOffsetY, safeInset, holeSizePx],
  );

  const holeX = useMemo(() => holeCenterX - holeSizePx / 2, [holeCenterX, holeSizePx]);
  const holeY = useMemo(() => holeCenterY - holeSizePx / 2, [holeCenterY, holeSizePx]);

  const drawOverlay = useCallback(
    (ctx: CanvasRenderingContext2D, scale: number, iconSrc: string, onDone?: () => void) => {
      const sHole = holeSizePx * scale;
      const sIcon = iconSizePx * scale;
      const sCX = holeCenterX * scale;
      const sCY = holeCenterY * scale;

      ctx.fillStyle = "#ffffff";
      drawRoundedRect(ctx, holeX * scale, holeY * scale, sHole, sHole, sHole * 0.18);
      ctx.fill();

      const img = new Image();
      if (!iconSrc.startsWith("data:")) img.crossOrigin = "anonymous";
      img.onload = () => {
        const aspect = img.naturalHeight > 0 ? img.naturalWidth / img.naturalHeight : 1;
        let dw = sIcon;
        let dh = sIcon;
        if (aspect > 1) dh = sIcon / aspect;
        else if (aspect < 1) dw = sIcon * aspect;
        ctx.drawImage(img, sCX - dw / 2, sCY - dh / 2, dw, dh);
        onDone?.();
      };
      img.onerror = () => onDone?.();
      img.src = iconSrc;
    },
    [holeX, holeY, holeSizePx, iconSizePx, holeCenterX, holeCenterY],
  );

  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, size, size);
    if (selectedIcon) drawOverlay(ctx, 1, selectedIcon);
  }, [selectedIcon, drawOverlay, size]);

  const qrIsEmpty = value.trim().length === 0;

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const id = `custom-${Date.now()}`;
      setCustomIcons((prev) => [
        ...prev,
        {
          id,
          uploadName: file.name.replace(/\.[^/.]+$/, ""),
          src: typeof reader.result === "string" ? reader.result : "",
        },
      ]);
      setSelectedIconId(id);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDownload = async () => {
    const svgEl = qrRef.current?.querySelector("svg");
    if (!svgEl || qrIsEmpty) return;

    await document.fonts.ready;

    const exportSize = Math.max(size * 14, 3840);
    const scale = exportSize / size;

    const exportFontSize = titleText ? Math.round(textStyle.fontSize * scale) : 0;
    const padV = titleText ? Math.round(exportFontSize * 0.7) : 0;
    const stripH = titleText ? exportFontSize + padV * 2 : 0;

    const markup = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
    const objUrl = URL.createObjectURL(blob);
    const qrImg = new Image();

    qrImg.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = exportSize;
      canvas.height = exportSize + stripH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objUrl);
        setBanner({ type: "err", text: q.errors.canvas });
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(qrImg, 0, 0, exportSize, exportSize);
      URL.revokeObjectURL(objUrl);

      const finalize = () => {
        if (titleText) {
          renderTextOnCanvas(
            ctx,
            { ...textStyle, text: titleText },
            exportSize / 2,
            exportSize + padV + exportFontSize / 2,
            scale,
          );
        }
        canvas.toBlob((bl) => {
          if (!bl) {
            setBanner({ type: "err", text: q.errors.blob });
            return;
          }
          const url = URL.createObjectURL(bl);
          const link = document.createElement("a");
          link.href = url;
          link.download = "playground-qr.png";
          link.click();
          URL.revokeObjectURL(url);
          setBanner({ type: "ok", text: q.downloadSuccess });
        }, "image/png");
      };

      if (!selectedIcon) {
        finalize();
        return;
      }
      drawOverlay(ctx, scale, selectedIcon, finalize);
    };

    qrImg.onerror = () => {
      URL.revokeObjectURL(objUrl);
      setBanner({ type: "err", text: q.errors.image });
    };
    qrImg.src = objUrl;
  };

  const resetLayout = useCallback(() => {
    setIconScale(DEFAULT_ICON_SCALE);
    setHoleScale(DEFAULT_HOLE_SCALE);
    setIconOffsetX(0);
    setIconOffsetY(0);
  }, []);

  const iconBtn = (option: QrCenterIconOption, compact = false) => {
    const label = iconOptionLabel(option, icons);
    return (
      <button
        className={cn(
          "flex flex-col items-center transition-all",
          compact ? "gap-1 rounded-2xl border p-2" : "gap-2 rounded-2xl border p-3 text-left",
          selectedIconId === option.id
            ? "border-[#F5C400]/45 bg-[#F5C400]/10 shadow-sm"
            : "border-white/10 bg-white/[0.03] hover:border-[#F5C400]/25 hover:bg-white/[0.06]",
        )}
        key={option.id}
        onClick={() => setSelectedIconId(option.id)}
        type="button"
      >
        <div
          className={cn(
            "flex items-center justify-center rounded-xl bg-white ring-1 ring-black/10",
            compact ? "h-10 w-10" : "h-11 w-11",
          )}
        >
          {option.src ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URLs and external SVG
            <img
              alt=""
              className={cn("object-contain", compact ? "h-6 w-6" : "h-7 w-7")}
              src={option.src}
            />
          ) : (
            <div
              className={cn(
                "rounded-full border border-dashed border-black/25",
                compact ? "h-5 w-5" : "h-6 w-6",
              )}
            />
          )}
        </div>
        <span
          className={cn(
            "w-full truncate text-center font-medium text-[#F7F3EB]/90",
            compact ? "text-[11px]" : "text-sm",
          )}
        >
          {label}
        </span>
      </button>
    );
  };

  const desktopIconCardBody = (
    <>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-white">{q.centerIcon}</p>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-[#F5C400]/35 bg-[#F5C400]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#F5C400] hover:bg-[#F5C400]/18"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <ImagePlus className="h-3.5 w-3.5" />
          {q.uploadIcon}
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {defaultQrCenterIcons.map((opt) => iconBtn(opt))}
      </div>
      {customIcons.length > 0 ? (
        <div className="mt-3 border-t border-white/10 pt-3">
          <p className="mb-2 text-xs font-medium text-[#F7F3EB]/50">{q.uploadedSection}</p>
          <div className="grid grid-cols-2 gap-3">{customIcons.map((opt) => iconBtn(opt))}</div>
        </div>
      ) : null}
    </>
  );

  const mobileIconPickerBody = (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{q.centerIcon}</p>
        <button
          className="inline-flex items-center gap-1.5 rounded-full border border-[#F5C400]/35 bg-[#F5C400]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#F5C400]"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <ImagePlus className="h-3.5 w-3.5" />
          {q.uploadShort}
        </button>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}>
        {defaultQrCenterIcons.map((opt) => iconBtn(opt, true))}
      </div>
      {customIcons.length > 0 ? (
        <div className="mt-3 border-t border-dashed border-white/15 pt-3">
          <p className="mb-2 text-xs font-medium text-[#F5C400]/80">{q.uploadedSection}</p>
          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}>
            {customIcons.map((opt) => iconBtn(opt, true))}
          </div>
        </div>
      ) : null}
    </>
  );

  const titleDisplayStyle: React.CSSProperties = titleText
    ? {
        color: textStyle.color,
        fontSize: textStyle.fontSize,
        fontFamily: textStyle.fontFamily,
        fontWeight: textStyle.fontWeight,
        fontStyle: textStyle.italic ? "italic" : "normal",
        letterSpacing: textStyle.letterSpacing ? `${textStyle.letterSpacing}px` : undefined,
        textTransform: textStyle.textTransform !== "none" ? textStyle.textTransform : undefined,
        maxWidth: size,
        lineHeight: 1.3,
        WebkitTextStroke:
          textStyle.strokeEnabled && textStyle.strokeWidth > 0
            ? `${textStyle.strokeWidth * 2}px ${textStyle.strokeColor}`
            : undefined,
        paintOrder: textStyle.strokeEnabled ? ("stroke fill" as React.CSSProperties["paintOrder"]) : undefined,
        textShadow: textStyle.shadowEnabled
          ? `${textStyle.shadowOffsetX}px ${textStyle.shadowOffsetY}px ${textStyle.shadowBlur}px ${textStyle.shadowColor}`
          : undefined,
      }
    : {};

  const qrPreviewNode = (
    <div
      className="inline-flex flex-col items-center rounded-[30px] border border-white/10 bg-white p-4 shadow-lg shadow-black/20"
      ref={qrRef}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <QRCodeSVG
          bgColor="#ffffff"
          className="block"
          fgColor="#0f172a"
          includeMargin
          level="H"
          size={size}
          value={value}
        />
        {selectedIcon ? (
          <canvas
            className="pointer-events-none absolute inset-0"
            height={size}
            ref={overlayCanvasRef}
            style={{ width: size, height: size }}
            width={size}
          />
        ) : null}
      </div>
      {titleText ? (
        <p className="mt-3 w-full text-center" style={titleDisplayStyle}>
          {titleText}
        </p>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-full px-3 py-4 sm:px-0 sm:py-2">
      <input
        accept="image/*"
        className="hidden"
        onChange={handleIconUpload}
        ref={fileInputRef}
        type="file"
      />

      {banner ? (
        <div
          className={cn(
            "mb-4 rounded-2xl border px-4 py-3 text-sm",
            banner.type === "ok"
              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
              : "border-rose-400/30 bg-rose-500/10 text-rose-100",
          )}
          role="status"
        >
          {banner.text}
        </div>
      ) : null}

      <div className="mb-5 rounded-3xl border border-white/10 bg-[#0F0F14]/90 p-5 shadow-sm backdrop-blur-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F5C400]/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#F5C400]">
              <QrCode className="h-3.5 w-3.5" />
              {q.eyebrow}
            </div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{q.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#F7F3EB]/70 sm:text-base">{q.description}</p>
          </div>
          <div className="rounded-2xl border border-[#F5C400]/20 bg-[#F5C400]/8 p-4 text-sm text-[#F7F3EB]/85 lg:max-w-sm">
            <p className="font-semibold text-white">{q.calloutTitle}</p>
            <p className="mt-1 text-[#F7F3EB]/70">{q.calloutBody}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-5">
        <div className="flex flex-col gap-4 lg:gap-5">
          <div className="rounded-3xl border border-white/10 bg-[#0F0F14]/90 p-5 shadow-sm backdrop-blur-sm">
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <Link2 className="h-4 w-4 text-[#F5C400]" />
              {q.contentLabel}
            </label>
            <textarea
              className="w-full resize-none rounded-2xl border border-white/10 bg-[#0C0C0F]/80 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#F7F3EB]/35 focus:border-[#F5C400]/45 focus:bg-[#0C0C0F] lg:min-h-[120px]"
              onChange={(e) => setValue(e.target.value)}
              placeholder={q.contentPlaceholder}
              rows={3}
              value={value}
            />
            <TextStyleEditor onChange={setTextStyle} style={textStyle} />
          </div>

          <div className="hidden lg:grid xl:grid-cols-[0.95fr_1.05fr] lg:gap-5">
            <div className="rounded-3xl border border-white/10 bg-[#0F0F14]/90 p-5 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Type className="h-4 w-4 text-[#F5C400]" />
                  {q.qrSize}
                </label>
                <span className="text-sm font-bold text-[#F5C400]">{size}px</span>
              </div>
              <input
                className="mt-4 w-full accent-[#F5C400]"
                max={420}
                min={180}
                onChange={(e) => setSize(Number(e.target.value))}
                step={10}
                type="range"
                value={size}
              />
              <p className="mt-3 text-xs leading-5 text-[#F7F3EB]/55">{q.qrSizeHint}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#0F0F14]/90 p-5 shadow-sm backdrop-blur-sm">
              {desktopIconCardBody}
            </div>
          </div>

          <div className="hidden lg:grid xl:grid-cols-3 lg:gap-5">
            <div className="rounded-3xl border border-white/10 bg-[#0F0F14]/90 p-5 shadow-sm backdrop-blur-sm">
              <SliderRow label={q.iconSize} max={26} min={10} onChange={setIconScale} step={1} unit="%" value={iconScale} />
              <p className="mt-3 text-xs leading-5 text-[#F7F3EB]/55">{q.iconSizeHint}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#0F0F14]/90 p-5 shadow-sm backdrop-blur-sm">
              <SliderRow
                icon={Move}
                label={q.posX}
                max={40}
                min={-40}
                onChange={setIconOffsetX}
                step={1}
                unit="px"
                value={iconOffsetX}
              />
              <div className="mt-4">
                <SliderRow label={q.posY} max={40} min={-40} onChange={setIconOffsetY} step={1} unit="px" value={iconOffsetY} />
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#0F0F14]/90 p-5 shadow-sm backdrop-blur-sm">
              <SliderRow label={q.holeSize} max={34} min={20} onChange={setHoleScale} step={1} unit="%" value={holeScale} />
              <p className="mt-3 text-xs leading-5 text-[#F7F3EB]/55">{q.holeHint}</p>
              <div className="mt-4">
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#F7F3EB]/85 hover:bg-white/10"
                  onClick={resetLayout}
                  type="button"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  {q.resetLayout}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#12121a] to-[#0C0C0F] p-5 shadow-sm backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F5C400]">{q.preview}</p>
          <div className="mt-5 overflow-x-auto rounded-[28px] border border-white/10 bg-[#0C0C0F] p-5 shadow-inner">
            <div className={cn("flex items-center justify-center", qrIsEmpty && "min-h-[200px] lg:min-h-[380px]")}>
              {qrIsEmpty ? (
                <div className="max-w-[260px] text-center text-[#F7F3EB]/55">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5C400]/12 text-[#F5C400]">
                    <QrCode className="h-8 w-8" />
                  </div>
                  <p className="text-lg font-semibold text-white">{q.emptyTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-[#F7F3EB]/60">{q.emptyBody}</p>
                </div>
              ) : (
                qrPreviewNode
              )}
            </div>
          </div>
          <div className="mt-5">
            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#F5C400] px-5 py-3 text-sm font-semibold text-[#0C0C0F] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#ffd54a] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={qrIsEmpty}
              onClick={handleDownload}
              type="button"
            >
              <Download className="h-4 w-4" />
              {q.download}
            </button>
          </div>
          <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm leading-6 text-[#F7F3EB]/70">
            <p className="font-medium text-white">{q.notesTitle}</p>
            <p className="mt-1">{q.notesBody}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0F0F14]/90 p-4 shadow-sm backdrop-blur-sm lg:hidden">
          {mobileIconPickerBody}
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0F0F14]/90 shadow-sm backdrop-blur-sm lg:hidden">
          <button
            className="flex w-full items-center justify-between gap-3 px-4 py-4"
            onClick={() => setMobileAjustesOpen((v) => !v)}
            type="button"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-white">
              <SlidersHorizontal className="h-4 w-4 text-[#F5C400]" />
              {q.customize}
            </span>
            <ChevronDown
              className={cn("h-4 w-4 text-[#F7F3EB]/45 transition-transform duration-200", mobileAjustesOpen && "rotate-180")}
            />
          </button>
          {mobileAjustesOpen ? (
            <div className="border-t border-white/10 px-4 pb-5 pt-4">
              <div className="space-y-5">
                <SliderRow
                  icon={Type}
                  label={q.qrSize}
                  max={420}
                  min={180}
                  onChange={setSize}
                  step={10}
                  unit="px"
                  value={size}
                />
                <div className="grid grid-cols-2 gap-4">
                  <SliderRow label={q.iconSizeShort} max={26} min={10} onChange={setIconScale} step={1} unit="%" value={iconScale} />
                  <SliderRow label={q.holeShort} max={34} min={20} onChange={setHoleScale} step={1} unit="%" value={holeScale} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SliderRow
                    icon={Move}
                    label={q.posX}
                    max={40}
                    min={-40}
                    onChange={setIconOffsetX}
                    step={1}
                    unit="px"
                    value={iconOffsetX}
                  />
                  <SliderRow label={q.posY} max={40} min={-40} onChange={setIconOffsetY} step={1} unit="px" value={iconOffsetY} />
                </div>
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#F7F3EB]/85"
                  onClick={resetLayout}
                  type="button"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  {q.resetLayout}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
