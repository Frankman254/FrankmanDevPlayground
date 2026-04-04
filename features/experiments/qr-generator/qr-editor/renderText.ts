import type { TextStyle } from "./types";

function applyTransform(text: string, transform: TextStyle["textTransform"]): string {
  if (transform === "uppercase") return text.toUpperCase();
  if (transform === "lowercase") return text.toLowerCase();
  return text;
}

export function renderTextOnCanvas(
  ctx: CanvasRenderingContext2D,
  style: TextStyle,
  x: number,
  y: number,
  scale: number = 1,
): void {
  const text = applyTransform(style.text.trim(), style.textTransform);
  if (!text) return;

  const fontSize = style.fontSize * scale;
  const fontStyle = style.italic ? "italic" : "normal";
  const fontString = `${fontStyle} ${style.fontWeight} ${fontSize}px ${style.fontFamily}`;

  ctx.save();

  ctx.font = fontString;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const ls = style.letterSpacing * scale;
  if ("letterSpacing" in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${ls}px`;
  }

  if (style.shadowEnabled) {
    ctx.shadowColor = style.shadowColor;
    ctx.shadowBlur = style.shadowBlur * scale;
    ctx.shadowOffsetX = style.shadowOffsetX * scale;
    ctx.shadowOffsetY = style.shadowOffsetY * scale;
  }

  if (style.strokeEnabled && style.strokeWidth > 0) {
    ctx.lineWidth = style.strokeWidth * scale * 2;
    ctx.strokeStyle = style.strokeColor;
    ctx.lineJoin = "round";
    ctx.strokeText(text, x, y);
  }

  ctx.fillStyle = style.color;
  ctx.fillText(text, x, y);

  ctx.restore();
}
