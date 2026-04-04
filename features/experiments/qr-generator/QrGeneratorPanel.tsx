'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
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
} from 'lucide-react';

import { useTranslations } from '@/components/providers/locale-provider';
import { cn } from '@/lib/utils';

import {
	DEFAULT_TEXT_STYLE,
	type TextStyle,
	renderTextOnCanvas,
	TextStyleEditor,
	useFontsLoader,
} from './qr-editor';
import {
	defaultQrCenterIcons,
	type QrCenterIconOption,
} from './qrGeneratorIconOptions';
import {
	buildStyledQrSvgMarkup,
	parseQrMatrixFromSvg,
	type QrCornerStyle,
	type QrModuleStyle,
} from './qrStyledSvg';

type QrContentMode = 'website' | 'text' | 'wifi' | 'contact';
type WifiEncryption = 'WPA' | 'WEP' | 'nopass';
type ExportFormat = 'png' | 'svg' | 'jpg';
type ExportSizePreset = 512 | 1024 | 2048 | 'custom';

interface ContactFields {
	name: string;
	role: string;
	company: string;
	phone: string;
	email: string;
	website: string;
	address: string;
}

const DEFAULT_ICON_SCALE = 20;
const DEFAULT_HOLE_SCALE = 28;
const DEFAULT_EXPORT_CUSTOM_SIZE = 1600;
const QR_FOREGROUND = '#0f172a';
const QR_BACKGROUND = '#ffffff';

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}

function escapeXml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

function applyTransform(text: string, transform: TextStyle['textTransform']) {
	if (transform === 'uppercase') return text.toUpperCase();
	if (transform === 'lowercase') return text.toLowerCase();
	return text;
}

function drawRoundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number
) {
	const r = Math.min(radius, width / 2, height / 2);
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.lineTo(x + width - r, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + r);
	ctx.lineTo(x + width, y + height - r);
	ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
	ctx.lineTo(x + r, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - r);
	ctx.lineTo(x, y + r);
	ctx.quadraticCurveTo(x, y, x + r, y);
	ctx.closePath();
}

function iconOptionLabel(
	option: QrCenterIconOption,
	icons: Record<string, string>
) {
	if ('uploadName' in option) return option.uploadName;
	return icons[option.labelKey] ?? option.labelKey;
}

function escapeWifiValue(value: string) {
	return value.replaceAll(/([\\;,:"])/g, '\\$1');
}

function hasContactValue(contact: ContactFields) {
	return Object.values(contact).some(field => field.trim().length > 0);
}

function buildWifiPayload(
	ssid: string,
	password: string,
	encryption: WifiEncryption
) {
	if (!ssid.trim()) return '';

	const safeSsid = escapeWifiValue(ssid.trim());
	const safePassword = escapeWifiValue(password.trim());
	return `WIFI:T:${encryption};S:${safeSsid};P:${safePassword};;`;
}

function buildContactPayload(contact: ContactFields) {
	if (!hasContactValue(contact)) return '';

	const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
	const name = contact.name.trim();
	if (name) {
		lines.push(`FN:${name}`);
		lines.push(`N:${name};;;;`);
	}
	if (contact.role.trim()) lines.push(`TITLE:${contact.role.trim()}`);
	if (contact.company.trim()) lines.push(`ORG:${contact.company.trim()}`);
	if (contact.phone.trim()) lines.push(`TEL:${contact.phone.trim()}`);
	if (contact.email.trim()) lines.push(`EMAIL:${contact.email.trim()}`);
	if (contact.website.trim()) lines.push(`URL:${contact.website.trim()}`);
	if (contact.address.trim())
		lines.push(`ADR:;;${contact.address.trim()};;;;`);
	lines.push('END:VCARD');

	return lines.join('\n');
}

async function resolveIconDataUri(iconSrc: string) {
	if (!iconSrc) return '';
	if (iconSrc.startsWith('data:')) return iconSrc;

	const response = await fetch(iconSrc);
	if (!response.ok) throw new Error('icon-fetch');

	const blob = await response.blob();
	return await new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			if (typeof reader.result === 'string') resolve(reader.result);
			else reject(new Error('icon-read'));
		};
		reader.onerror = () => reject(new Error('icon-read'));
		reader.readAsDataURL(blob);
	});
}

function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}

function buildCaptionSvgMarkup(
	textStyle: TextStyle,
	text: string,
	exportSize: number,
	y: number,
	scale: number
) {
	const transformed = applyTransform(text.trim(), textStyle.textTransform);
	if (!transformed) return '';

	const fontSize = Math.round(textStyle.fontSize * scale);
	const letterSpacing = textStyle.letterSpacing * scale;
	const shadowId = 'qr-caption-shadow';
	const defs = textStyle.shadowEnabled
		? `
        <defs>
          <filter id="${shadowId}" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="${textStyle.shadowOffsetX * scale}"
              dy="${textStyle.shadowOffsetY * scale}"
              stdDeviation="${Math.max(textStyle.shadowBlur * scale * 0.35, 0.01)}"
              flood-color="${escapeXml(textStyle.shadowColor)}"
            />
          </filter>
        </defs>
      `
		: '';

	const filterAttr = textStyle.shadowEnabled
		? ` filter="url(#${shadowId})"`
		: '';
	const strokeAttrs =
		textStyle.strokeEnabled && textStyle.strokeWidth > 0
			? ` stroke="${escapeXml(textStyle.strokeColor)}" stroke-width="${textStyle.strokeWidth * scale * 2}" paint-order="stroke fill" stroke-linejoin="round"`
			: '';

	return `
    ${defs}
    <text
      x="${exportSize / 2}"
      y="${y}"
      fill="${escapeXml(textStyle.color)}"
      font-family="${escapeXml(textStyle.fontFamily)}"
      font-size="${fontSize}"
      font-weight="${textStyle.fontWeight}"
      font-style="${textStyle.italic ? 'italic' : 'normal'}"
      letter-spacing="${letterSpacing}"
      text-anchor="middle"
      dominant-baseline="middle"${strokeAttrs}${filterAttr}
    >${escapeXml(transformed)}</text>
  `;
}

function buildSvgExportMarkup({
	matrix,
	moduleStyle,
	cornerStyle,
	exportSize,
	bgColor,
	textStyle,
	titleText,
	scale,
	iconDataUri,
	holeX,
	holeY,
	holeSize,
	iconSize,
}: {
	matrix: boolean[][];
	moduleStyle: QrModuleStyle;
	cornerStyle: QrCornerStyle;
	exportSize: number;
	bgColor: string;
	textStyle: TextStyle;
	titleText: string;
	scale: number;
	iconDataUri: string;
	holeX: number;
	holeY: number;
	holeSize: number;
	iconSize: number;
}) {
	const hasTitle = titleText.trim().length > 0;
	const exportFontSize = hasTitle
		? Math.round(textStyle.fontSize * scale)
		: 0;
	const padV = hasTitle ? Math.round(exportFontSize * 0.7) : 0;
	const stripHeight = hasTitle ? exportFontSize + padV * 2 : 0;
	const totalHeight = exportSize + stripHeight;
	const backgroundMarkup =
		bgColor === 'transparent'
			? ''
			: `<rect x="0" y="0" width="${exportSize}" height="${totalHeight}" fill="${escapeXml(bgColor)}" />`;

	const qrMarkup = buildStyledQrSvgMarkup({
		matrix,
		width: exportSize,
		height: exportSize,
		bgColor: 'transparent',
		fgColor: QR_FOREGROUND,
		moduleStyle,
		cornerStyle,
	});

	const iconMarkup = iconDataUri
		? `
        <rect x="${holeX}" y="${holeY}" width="${holeSize}" height="${holeSize}" rx="${holeSize * 0.18}" ry="${holeSize * 0.18}" fill="#ffffff" />
        <image
          href="${escapeXml(iconDataUri)}"
          x="${holeX + (holeSize - iconSize) / 2}"
          y="${holeY + (holeSize - iconSize) / 2}"
          width="${iconSize}"
          height="${iconSize}"
          preserveAspectRatio="xMidYMid meet"
        />
      `
		: '';

	const captionMarkup = hasTitle
		? buildCaptionSvgMarkup(
				textStyle,
				titleText,
				exportSize,
				exportSize + padV + exportFontSize / 2,
				scale
			)
		: '';

	return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${exportSize}" height="${totalHeight}" viewBox="0 0 ${exportSize} ${totalHeight}">
      ${backgroundMarkup}
      ${qrMarkup}
      ${iconMarkup}
      ${captionMarkup}
    </svg>
  `;
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
	onChange: (value: number) => void;
}) {
	return (
		<div>
			<div className="mb-2 flex items-center justify-between gap-2">
				<span className="flex items-center gap-1.5 text-sm font-semibold text-white">
					{Icon ? (
						<Icon className="h-3.5 w-3.5 text-[#F5C400]" />
					) : null}
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
				onChange={event => onChange(Number(event.target.value))}
				step={step}
				type="range"
				value={value}
			/>
		</div>
	);
}

export function QrGeneratorPanel() {
	const t = useTranslations();
	const q = t.qrGenerator;
	const icons = q.icons;

	useFontsLoader();

	const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const [contentMode, setContentMode] = useState<QrContentMode>('website');
	const [websiteUrl, setWebsiteUrl] = useState('');
	const [plainText, setPlainText] = useState('');
	const [wifiSsid, setWifiSsid] = useState('');
	const [wifiPassword, setWifiPassword] = useState('');
	const [wifiEncryption, setWifiEncryption] = useState<WifiEncryption>('WPA');
	const [contactFields, setContactFields] = useState<ContactFields>({
		name: '',
		role: '',
		company: '',
		phone: '',
		email: '',
		website: '',
		address: '',
	});
	const [size, setSize] = useState(280);
	const [moduleStyle, setModuleStyle] = useState<QrModuleStyle>('square');
	const [cornerStyle, setCornerStyle] = useState<QrCornerStyle>('square');
	const [transparentBg, setTransparentBg] = useState(false);
	const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
	const [exportSizePreset, setExportSizePreset] =
		useState<ExportSizePreset>(1024);
	const [customExportSize, setCustomExportSize] = useState(
		DEFAULT_EXPORT_CUSTOM_SIZE
	);
	const [selectedIconId, setSelectedIconId] = useState('playground');
	const [iconScale, setIconScale] = useState(DEFAULT_ICON_SCALE);
	const [holeScale, setHoleScale] = useState(DEFAULT_HOLE_SCALE);
	const [iconOffsetX, setIconOffsetX] = useState(0);
	const [iconOffsetY, setIconOffsetY] = useState(0);
	const [customIcons, setCustomIcons] = useState<QrCenterIconOption[]>([]);
	const [textStyle, setTextStyle] = useState<TextStyle>(DEFAULT_TEXT_STYLE);
	const [mobileAjustesOpen, setMobileAjustesOpen] = useState(false);
	const [banner, setBanner] = useState<{
		type: 'ok' | 'err';
		text: string;
	} | null>(null);
	const [qrMatrix, setQrMatrix] = useState<boolean[][] | null>(null);

	useEffect(() => {
		if (!banner) return;
		const timeoutId = window.setTimeout(() => setBanner(null), 4000);
		return () => window.clearTimeout(timeoutId);
	}, [banner]);

	const allIcons = useMemo(
		() => [...defaultQrCenterIcons, ...customIcons],
		[customIcons]
	);
	const selectedIcon = useMemo(
		() => allIcons.find(option => option.id === selectedIconId)?.src ?? '',
		[allIcons, selectedIconId]
	);

	const value = useMemo(() => {
		if (contentMode === 'website') return websiteUrl.trim();
		if (contentMode === 'text') return plainText.trim();
		if (contentMode === 'wifi')
			return buildWifiPayload(wifiSsid, wifiPassword, wifiEncryption);
		return buildContactPayload(contactFields);
	}, [
		contentMode,
		websiteUrl,
		plainText,
		wifiSsid,
		wifiPassword,
		wifiEncryption,
		contactFields,
	]);

	const titleText = textStyle.text.trim();
	const qrIsEmpty = value.trim().length === 0;
	const effectiveTransparentBg =
		exportFormat === 'jpg' ? false : transparentBg;
	const activeQrMatrix = qrIsEmpty ? null : qrMatrix;

	const iconSizePx = useMemo(
		() => Math.round((size * iconScale) / 100),
		[size, iconScale]
	);
	const holeSizePx = useMemo(
		() => Math.round((size * holeScale) / 100),
		[size, holeScale]
	);
	const safeInset = useMemo(() => Math.max(size * 0.2, 48), [size]);

	const holeCenterX = useMemo(
		() =>
			clamp(
				size / 2 + iconOffsetX,
				safeInset + holeSizePx / 2,
				size - safeInset - holeSizePx / 2
			),
		[holeSizePx, iconOffsetX, safeInset, size]
	);

	const holeCenterY = useMemo(
		() =>
			clamp(
				size / 2 + iconOffsetY,
				safeInset + holeSizePx / 2,
				size - safeInset - holeSizePx / 2
			),
		[holeSizePx, iconOffsetY, safeInset, size]
	);

	const holeX = useMemo(
		() => holeCenterX - holeSizePx / 2,
		[holeCenterX, holeSizePx]
	);
	const holeY = useMemo(
		() => holeCenterY - holeSizePx / 2,
		[holeCenterY, holeSizePx]
	);

	const resolvedExportSize = useMemo(() => {
		if (exportSizePreset === 'custom') {
			return clamp(
				customExportSize || DEFAULT_EXPORT_CUSTOM_SIZE,
				256,
				4096
			);
		}
		return exportSizePreset;
	}, [customExportSize, exportSizePreset]);

	const previewSvgMarkup = useMemo(() => {
		if (!activeQrMatrix) return '';
		return buildStyledQrSvgMarkup({
			matrix: activeQrMatrix,
			width: '100%',
			height: '100%',
			bgColor: effectiveTransparentBg ? 'transparent' : QR_BACKGROUND,
			fgColor: QR_FOREGROUND,
			moduleStyle,
			cornerStyle,
		});
	}, [activeQrMatrix, cornerStyle, effectiveTransparentBg, moduleStyle]);

	const previewCanvasBg = effectiveTransparentBg
		? {
				backgroundColor: '#ffffff',
				backgroundImage:
					'linear-gradient(45deg, rgba(245,196,0,0.09) 25%, transparent 25%, transparent 75%, rgba(245,196,0,0.09) 75%), linear-gradient(45deg, rgba(245,196,0,0.09) 25%, transparent 25%, transparent 75%, rgba(245,196,0,0.09) 75%)',
				backgroundPosition: '0 0, 12px 12px',
				backgroundSize: '24px 24px',
			}
		: { backgroundColor: '#ffffff' };

	const handleHiddenQrRef = useCallback((node: SVGSVGElement | null) => {
		if (!node) return;
		const parsed = parseQrMatrixFromSvg(node);
		if (parsed) setQrMatrix(parsed.matrix);
	}, []);

	const drawOverlay = useCallback(
		(
			ctx: CanvasRenderingContext2D,
			scale: number,
			iconSrc: string,
			onDone?: () => void
		) => {
			const scaledHole = holeSizePx * scale;
			const scaledIcon = iconSizePx * scale;
			const scaledCenterX = holeCenterX * scale;
			const scaledCenterY = holeCenterY * scale;

			ctx.fillStyle = '#ffffff';
			drawRoundedRect(
				ctx,
				holeX * scale,
				holeY * scale,
				scaledHole,
				scaledHole,
				scaledHole * 0.18
			);
			ctx.fill();

			const image = new Image();
			if (!iconSrc.startsWith('data:')) image.crossOrigin = 'anonymous';

			image.onload = () => {
				const aspect =
					image.naturalHeight > 0
						? image.naturalWidth / image.naturalHeight
						: 1;
				let drawWidth = scaledIcon;
				let drawHeight = scaledIcon;

				if (aspect > 1) drawHeight = scaledIcon / aspect;
				else if (aspect < 1) drawWidth = scaledIcon * aspect;

				ctx.drawImage(
					image,
					scaledCenterX - drawWidth / 2,
					scaledCenterY - drawHeight / 2,
					drawWidth,
					drawHeight
				);
				onDone?.();
			};

			image.onerror = () => onDone?.();
			image.src = iconSrc;
		},
		[holeCenterX, holeCenterY, holeSizePx, holeX, holeY, iconSizePx]
	);

	useEffect(() => {
		const canvas = overlayCanvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		ctx.clearRect(0, 0, size, size);
		if (selectedIcon) drawOverlay(ctx, 1, selectedIcon);
	}, [drawOverlay, selectedIcon, size]);

	const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = () => {
			const id = `custom-${Date.now()}`;
			setCustomIcons(previous => [
				...previous,
				{
					id,
					uploadName: file.name.replace(/\.[^/.]+$/, ''),
					src: typeof reader.result === 'string' ? reader.result : '',
				},
			]);
			setSelectedIconId(id);
		};
		reader.readAsDataURL(file);
		event.target.value = '';
	};

	const handleContactFieldChange = (
		field: keyof ContactFields,
		nextValue: string
	) => {
		setContactFields(previous => ({ ...previous, [field]: nextValue }));
	};

	const handleDownload = async () => {
		if (!activeQrMatrix || qrIsEmpty) return;

		await document.fonts.ready;

		const exportSize = resolvedExportSize;
		const scale = exportSize / size;
		const effectiveBgColor =
			exportFormat === 'jpg'
				? QR_BACKGROUND
				: effectiveTransparentBg
					? 'transparent'
					: QR_BACKGROUND;
		const exportFontSize = titleText
			? Math.round(textStyle.fontSize * scale)
			: 0;
		const padV = titleText ? Math.round(exportFontSize * 0.7) : 0;
		const stripHeight = titleText ? exportFontSize + padV * 2 : 0;
		const totalHeight = exportSize + stripHeight;

		try {
			if (exportFormat === 'svg') {
				const iconDataUri = selectedIcon
					? await resolveIconDataUri(selectedIcon)
					: '';
				const markup = buildSvgExportMarkup({
					matrix: activeQrMatrix,
					moduleStyle,
					cornerStyle,
					exportSize,
					bgColor: effectiveBgColor,
					textStyle,
					titleText,
					scale,
					iconDataUri,
					holeX: holeX * scale,
					holeY: holeY * scale,
					holeSize: holeSizePx * scale,
					iconSize: iconSizePx * scale,
				});

				downloadBlob(
					new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }),
					'playground-qr.svg'
				);
				setBanner({ type: 'ok', text: q.downloadSuccess });
				return;
			}

			const svgMarkup = buildStyledQrSvgMarkup({
				matrix: activeQrMatrix,
				width: exportSize,
				height: exportSize,
				bgColor: effectiveBgColor,
				fgColor: QR_FOREGROUND,
				moduleStyle,
				cornerStyle,
			});

			const svgBlob = new Blob([svgMarkup], {
				type: 'image/svg+xml;charset=utf-8',
			});
			const svgUrl = URL.createObjectURL(svgBlob);
			const qrImage = new Image();

			qrImage.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = exportSize;
				canvas.height = totalHeight;

				const ctx = canvas.getContext('2d');
				if (!ctx) {
					URL.revokeObjectURL(svgUrl);
					setBanner({ type: 'err', text: q.errors.canvas });
					return;
				}

				ctx.imageSmoothingEnabled = true;
				ctx.imageSmoothingQuality = 'high';

				if (effectiveBgColor !== 'transparent') {
					ctx.fillStyle = QR_BACKGROUND;
					ctx.fillRect(0, 0, canvas.width, canvas.height);
				} else {
					ctx.clearRect(0, 0, canvas.width, canvas.height);
				}

				ctx.drawImage(qrImage, 0, 0, exportSize, exportSize);
				URL.revokeObjectURL(svgUrl);

				const finalize = () => {
					if (titleText) {
						renderTextOnCanvas(
							ctx,
							{ ...textStyle, text: titleText },
							exportSize / 2,
							exportSize + padV + exportFontSize / 2,
							scale
						);
					}

					const mimeType =
						exportFormat === 'jpg' ? 'image/jpeg' : 'image/png';
					canvas.toBlob(
						blob => {
							if (!blob) {
								setBanner({ type: 'err', text: q.errors.blob });
								return;
							}

							downloadBlob(blob, `playground-qr.${exportFormat}`);
							setBanner({ type: 'ok', text: q.downloadSuccess });
						},
						mimeType,
						exportFormat === 'jpg' ? 0.92 : undefined
					);
				};

				if (!selectedIcon) {
					finalize();
					return;
				}

				drawOverlay(ctx, scale, selectedIcon, finalize);
			};

			qrImage.onerror = () => {
				URL.revokeObjectURL(svgUrl);
				setBanner({ type: 'err', text: q.errors.image });
			};

			qrImage.src = svgUrl;
		} catch {
			setBanner({ type: 'err', text: q.errors.image });
		}
	};

	const resetLayout = useCallback(() => {
		setIconScale(DEFAULT_ICON_SCALE);
		setHoleScale(DEFAULT_HOLE_SCALE);
		setIconOffsetX(0);
		setIconOffsetY(0);
	}, []);

	const buttonGroupClass = (active: boolean) =>
		cn(
			'rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors',
			active
				? 'border-[#F5C400]/45 bg-[#F5C400]/10 text-[#F5C400]'
				: 'border-white/10 bg-white/[0.03] text-[#F7F3EB]/75 hover:border-[#F5C400]/25 hover:text-white'
		);

	const iconButton = (option: QrCenterIconOption, compact = false) => {
		const label = iconOptionLabel(option, icons);

		return (
			<button
				className={cn(
					'flex flex-col items-center transition-all',
					compact
						? 'gap-1 rounded-2xl border p-2'
						: 'gap-2 rounded-2xl border p-3 text-left',
					selectedIconId === option.id
						? 'border-[#F5C400]/45 bg-[#F5C400]/10 shadow-sm'
						: 'border-white/10 bg-white/[0.03] hover:border-[#F5C400]/25 hover:bg-white/[0.06]'
				)}
				key={option.id}
				onClick={() => setSelectedIconId(option.id)}
				type="button"
			>
				<div
					className={cn(
						'flex items-center justify-center rounded-xl bg-white ring-1 ring-black/10',
						compact ? 'h-10 w-10' : 'h-11 w-11'
					)}
				>
					{option.src ? (
						// eslint-disable-next-line @next/next/no-img-element -- supports data URLs and local assets
						<img
							alt=""
							className={cn(
								'object-contain',
								compact ? 'h-6 w-6' : 'h-7 w-7'
							)}
							src={option.src}
						/>
					) : (
						<div
							className={cn(
								'rounded-full border border-dashed border-black/25',
								compact ? 'h-5 w-5' : 'h-6 w-6'
							)}
						/>
					)}
				</div>
				<span
					className={cn(
						'w-full truncate text-center font-medium text-[#F7F3EB]/90',
						compact ? 'text-[11px]' : 'text-sm'
					)}
				>
					{label}
				</span>
			</button>
		);
	};

	const titleDisplayStyle: React.CSSProperties = titleText
		? {
				color: textStyle.color,
				fontSize: textStyle.fontSize,
				fontFamily: textStyle.fontFamily,
				fontWeight: textStyle.fontWeight,
				fontStyle: textStyle.italic ? 'italic' : 'normal',
				letterSpacing: textStyle.letterSpacing
					? `${textStyle.letterSpacing}px`
					: undefined,
				textTransform:
					textStyle.textTransform !== 'none'
						? textStyle.textTransform
						: undefined,
				maxWidth: size,
				lineHeight: 1.3,
				WebkitTextStroke:
					textStyle.strokeEnabled && textStyle.strokeWidth > 0
						? `${textStyle.strokeWidth * 2}px ${textStyle.strokeColor}`
						: undefined,
				paintOrder: textStyle.strokeEnabled
					? ('stroke fill' as React.CSSProperties['paintOrder'])
					: undefined,
				textShadow: textStyle.shadowEnabled
					? `${textStyle.shadowOffsetX}px ${textStyle.shadowOffsetY}px ${textStyle.shadowBlur}px ${textStyle.shadowColor}`
					: undefined,
			}
		: {};

	const qrPreviewNode = (
		<div
			className="inline-flex flex-col items-center rounded-[30px] border border-white/10 p-4 shadow-lg shadow-black/20"
			style={previewCanvasBg}
		>
			<div className="relative" style={{ width: size, height: size }}>
				<div
					className="h-full w-full"
					dangerouslySetInnerHTML={{ __html: previewSvgMarkup }}
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
				<p
					className="mt-3 w-full text-center"
					style={titleDisplayStyle}
				>
					{applyTransform(titleText, textStyle.textTransform)}
				</p>
			) : null}
		</div>
	);

	const desktopIconCardBody = (
		<>
			<div className="flex items-center justify-between gap-4">
				<p className="text-sm font-semibold text-white">
					{q.centerIcon}
				</p>
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
				{defaultQrCenterIcons.map(option => iconButton(option))}
			</div>
			{customIcons.length > 0 ? (
				<div className="mt-3 border-t border-white/10 pt-3">
					<p className="mb-2 text-xs font-medium text-[#F7F3EB]/50">
						{q.uploadedSection}
					</p>
					<div className="grid grid-cols-2 gap-3">
						{customIcons.map(option => iconButton(option))}
					</div>
				</div>
			) : null}
		</>
	);

	const mobileIconPickerBody = (
		<>
			<div className="mb-3 flex items-center justify-between gap-3">
				<p className="text-sm font-semibold text-white">
					{q.centerIcon}
				</p>
				<button
					className="inline-flex items-center gap-1.5 rounded-full border border-[#F5C400]/35 bg-[#F5C400]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#F5C400]"
					onClick={() => fileInputRef.current?.click()}
					type="button"
				>
					<ImagePlus className="h-3.5 w-3.5" />
					{q.uploadShort}
				</button>
			</div>
			<div
				className="grid gap-2"
				style={{
					gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
				}}
			>
				{defaultQrCenterIcons.map(option => iconButton(option, true))}
			</div>
			{customIcons.length > 0 ? (
				<div className="mt-3 border-t border-dashed border-white/15 pt-3">
					<p className="mb-2 text-xs font-medium text-[#F5C400]/80">
						{q.uploadedSection}
					</p>
					<div
						className="grid gap-2"
						style={{
							gridTemplateColumns:
								'repeat(auto-fill, minmax(72px, 1fr))',
						}}
					>
						{customIcons.map(option => iconButton(option, true))}
					</div>
				</div>
			) : null}
		</>
	);

	return (
		<div className="min-h-full px-3 py-4 sm:px-0 sm:py-2">
			{!qrIsEmpty ? (
				<div
					className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
					aria-hidden="true"
				>
					<QRCodeSVG
						includeMargin
						key={value}
						level="H"
						ref={handleHiddenQrRef}
						size={128}
						value={value}
					/>
				</div>
			) : null}

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
						'mb-4 rounded-2xl border px-4 py-3 text-sm',
						banner.type === 'ok'
							? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
							: 'border-rose-400/30 bg-rose-500/10 text-rose-100'
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
						<h1 className="text-2xl font-bold text-white sm:text-3xl">
							{q.title}
						</h1>
						<p className="mt-2 max-w-2xl text-sm leading-6 text-[#F7F3EB]/70 sm:text-base">
							{q.description}
						</p>
					</div>
					<div className="rounded-2xl border border-[#F5C400]/20 bg-[#F5C400]/8 p-4 text-sm text-[#F7F3EB]/85 lg:max-w-sm">
						<p className="font-semibold text-white">
							{q.calloutTitle}
						</p>
						<p className="mt-1 text-[#F7F3EB]/70">
							{q.calloutBody}
						</p>
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

						<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
							{(
								['website', 'text', 'wifi', 'contact'] as const
							).map(option => (
								<button
									className={buttonGroupClass(
										contentMode === option
									)}
									key={option}
									onClick={() => setContentMode(option)}
									type="button"
								>
									{q.contentTypes[option]}
								</button>
							))}
						</div>

						<div className="mt-4">
							{contentMode === 'website' ? (
								<input
									className="w-full rounded-2xl border border-white/10 bg-[#0C0C0F]/80 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#F7F3EB]/35 focus:border-[#F5C400]/45 focus:bg-[#0C0C0F]"
									onChange={event =>
										setWebsiteUrl(event.target.value)
									}
									placeholder={q.websitePlaceholder}
									type="url"
									value={websiteUrl}
								/>
							) : null}

							{contentMode === 'text' ? (
								<textarea
									className="w-full resize-none rounded-2xl border border-white/10 bg-[#0C0C0F]/80 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#F7F3EB]/35 focus:border-[#F5C400]/45 focus:bg-[#0C0C0F] lg:min-h-[120px]"
									onChange={event =>
										setPlainText(event.target.value)
									}
									placeholder={q.textPlaceholder}
									rows={4}
									value={plainText}
								/>
							) : null}

							{contentMode === 'wifi' ? (
								<div className="grid gap-3 md:grid-cols-2">
									<input
										className="rounded-2xl border border-white/10 bg-[#0C0C0F]/80 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#F7F3EB]/35 focus:border-[#F5C400]/45 focus:bg-[#0C0C0F] md:col-span-2"
										onChange={event =>
											setWifiSsid(event.target.value)
										}
										placeholder={q.fields.wifiName}
										type="text"
										value={wifiSsid}
									/>
									<input
										className="rounded-2xl border border-white/10 bg-[#0C0C0F]/80 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#F7F3EB]/35 focus:border-[#F5C400]/45 focus:bg-[#0C0C0F]"
										onChange={event =>
											setWifiPassword(event.target.value)
										}
										placeholder={q.fields.wifiPassword}
										type="text"
										value={wifiPassword}
									/>
									<select
										className="rounded-2xl border border-white/10 bg-[#0C0C0F]/80 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#F5C400]/45 focus:bg-[#0C0C0F]"
										onChange={event =>
											setWifiEncryption(
												event.target
													.value as WifiEncryption
											)
										}
										value={wifiEncryption}
									>
										<option value="WPA">
											{q.fields.securityWpa}
										</option>
										<option value="WEP">
											{q.fields.securityWep}
										</option>
										<option value="nopass">
											{q.fields.securityOpen}
										</option>
									</select>
								</div>
							) : null}

							{contentMode === 'contact' ? (
								<div className="grid gap-3 md:grid-cols-2">
									<input
										className="rounded-2xl border border-white/10 bg-[#0C0C0F]/80 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#F7F3EB]/35 focus:border-[#F5C400]/45 focus:bg-[#0C0C0F] md:col-span-2"
										onChange={event =>
											handleContactFieldChange(
												'name',
												event.target.value
											)
										}
										placeholder={q.fields.fullName}
										type="text"
										value={contactFields.name}
									/>
									<input
										className="rounded-2xl border border-white/10 bg-[#0C0C0F]/80 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#F7F3EB]/35 focus:border-[#F5C400]/45 focus:bg-[#0C0C0F]"
										onChange={event =>
											handleContactFieldChange(
												'role',
												event.target.value
											)
										}
										placeholder={q.fields.role}
										type="text"
										value={contactFields.role}
									/>
									<input
										className="rounded-2xl border border-white/10 bg-[#0C0C0F]/80 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#F7F3EB]/35 focus:border-[#F5C400]/45 focus:bg-[#0C0C0F]"
										onChange={event =>
											handleContactFieldChange(
												'company',
												event.target.value
											)
										}
										placeholder={q.fields.company}
										type="text"
										value={contactFields.company}
									/>
									<input
										className="rounded-2xl border border-white/10 bg-[#0C0C0F]/80 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#F7F3EB]/35 focus:border-[#F5C400]/45 focus:bg-[#0C0C0F]"
										onChange={event =>
											handleContactFieldChange(
												'phone',
												event.target.value
											)
										}
										placeholder={q.fields.phone}
										type="text"
										value={contactFields.phone}
									/>
									<input
										className="rounded-2xl border border-white/10 bg-[#0C0C0F]/80 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#F7F3EB]/35 focus:border-[#F5C400]/45 focus:bg-[#0C0C0F]"
										onChange={event =>
											handleContactFieldChange(
												'email',
												event.target.value
											)
										}
										placeholder={q.fields.email}
										type="email"
										value={contactFields.email}
									/>
									<input
										className="rounded-2xl border border-white/10 bg-[#0C0C0F]/80 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#F7F3EB]/35 focus:border-[#F5C400]/45 focus:bg-[#0C0C0F] md:col-span-2"
										onChange={event =>
											handleContactFieldChange(
												'website',
												event.target.value
											)
										}
										placeholder={q.fields.website}
										type="url"
										value={contactFields.website}
									/>
									<input
										className="rounded-2xl border border-white/10 bg-[#0C0C0F]/80 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#F7F3EB]/35 focus:border-[#F5C400]/45 focus:bg-[#0C0C0F] md:col-span-2"
										onChange={event =>
											handleContactFieldChange(
												'address',
												event.target.value
											)
										}
										placeholder={q.fields.address}
										type="text"
										value={contactFields.address}
									/>
								</div>
							) : null}
						</div>

						<TextStyleEditor
							onChange={setTextStyle}
							style={textStyle}
						/>
					</div>

					<div className="grid gap-4 xl:grid-cols-2">
						<div className="rounded-3xl border border-white/10 bg-[#0F0F14]/90 p-5 shadow-sm backdrop-blur-sm">
							<p className="text-sm font-semibold text-white">
								{q.designTitle}
							</p>
							<div className="mt-4">
								<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F7F3EB]/45">
									{q.moduleShape}
								</p>
								<div className="mt-3 grid grid-cols-3 gap-2">
									{(
										['square', 'rounded', 'dots'] as const
									).map(option => (
										<button
											className={buttonGroupClass(
												moduleStyle === option
											)}
											key={option}
											onClick={() =>
												setModuleStyle(option)
											}
											type="button"
										>
											{q.moduleStyles[option]}
										</button>
									))}
								</div>
							</div>

							<div className="mt-5">
								<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F7F3EB]/45">
									{q.cornerStyle}
								</p>
								<div className="mt-3 grid grid-cols-3 gap-2">
									{(
										['square', 'rounded', 'circle'] as const
									).map(option => (
										<button
											className={buttonGroupClass(
												cornerStyle === option
											)}
											key={option}
											onClick={() =>
												setCornerStyle(option)
											}
											type="button"
										>
											{q.cornerStyles[option]}
										</button>
									))}
								</div>
							</div>
						</div>

						<div className="rounded-3xl border border-white/10 bg-[#0F0F14]/90 p-5 shadow-sm backdrop-blur-sm">
							<div className="flex items-center justify-between gap-4">
								<label className="flex items-center gap-2 text-sm font-semibold text-white">
									<Type className="h-4 w-4 text-[#F5C400]" />
									{q.qrSize}
								</label>
								<span className="text-sm font-bold text-[#F5C400]">
									{size}px
								</span>
							</div>
							<input
								className="mt-4 w-full accent-[#F5C400]"
								max={420}
								min={180}
								onChange={event =>
									setSize(Number(event.target.value))
								}
								step={10}
								type="range"
								value={size}
							/>
							<p className="mt-3 text-xs leading-5 text-[#F7F3EB]/55">
								{q.qrSizeHint}
							</p>
						</div>
					</div>

					<div className="hidden lg:grid xl:grid-cols-[0.95fr_1.05fr] lg:gap-5">
						<div className="rounded-3xl border border-white/10 bg-[#0F0F14]/90 p-5 shadow-sm backdrop-blur-sm">
							{desktopIconCardBody}
						</div>
						<div className="grid gap-5">
							<div className="rounded-3xl border border-white/10 bg-[#0F0F14]/90 p-5 shadow-sm backdrop-blur-sm">
								<SliderRow
									label={q.iconSize}
									max={26}
									min={10}
									onChange={setIconScale}
									step={1}
									unit="%"
									value={iconScale}
								/>
								<p className="mt-3 text-xs leading-5 text-[#F7F3EB]/55">
									{q.iconSizeHint}
								</p>
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
									<SliderRow
										label={q.posY}
										max={40}
										min={-40}
										onChange={setIconOffsetY}
										step={1}
										unit="px"
										value={iconOffsetY}
									/>
								</div>
							</div>
							<div className="rounded-3xl border border-white/10 bg-[#0F0F14]/90 p-5 shadow-sm backdrop-blur-sm">
								<SliderRow
									label={q.holeSize}
									max={34}
									min={20}
									onChange={setHoleScale}
									step={1}
									unit="%"
									value={holeScale}
								/>
								<p className="mt-3 text-xs leading-5 text-[#F7F3EB]/55">
									{q.holeHint}
								</p>
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
				</div>

				<div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#12121a] to-[#0C0C0F] p-5 shadow-sm backdrop-blur-sm">
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F5C400]">
						{q.preview}
					</p>
					<div className="mt-5 overflow-x-auto rounded-[28px] border border-white/10 bg-[#0C0C0F] p-5 shadow-inner">
						<div
							className={cn(
								'flex items-center justify-center',
								qrIsEmpty && 'min-h-[200px] lg:min-h-[380px]'
							)}
						>
							{qrIsEmpty ? (
								<div className="max-w-[280px] text-center text-[#F7F3EB]/55">
									<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5C400]/12 text-[#F5C400]">
										<QrCode className="h-8 w-8" />
									</div>
									<p className="text-lg font-semibold text-white">
										{q.emptyTitle}
									</p>
									<p className="mt-2 text-sm leading-6 text-[#F7F3EB]/60">
										{q.emptyBody}
									</p>
								</div>
							) : (
								qrPreviewNode
							)}
						</div>
					</div>

					<div className="mt-5 space-y-5">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F7F3EB]/45">
								{q.targetWidth}
							</p>
							<div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
								{[512, 1024, 2048, 'custom'].map(option => (
									<button
										className={buttonGroupClass(
											exportSizePreset === option
										)}
										key={String(option)}
										onClick={() =>
											setExportSizePreset(
												option as ExportSizePreset
											)
										}
										type="button"
									>
										{option === 'custom'
											? q.customSize
											: option}
									</button>
								))}
							</div>
							{exportSizePreset === 'custom' ? (
								<input
									className="mt-3 w-full rounded-2xl border border-white/10 bg-[#0C0C0F]/80 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#F7F3EB]/35 focus:border-[#F5C400]/45 focus:bg-[#0C0C0F]"
									min={256}
									onChange={event =>
										setCustomExportSize(
											Number(event.target.value)
										)
									}
									placeholder={q.customSizePlaceholder}
									type="number"
									value={customExportSize}
								/>
							) : null}
						</div>

						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#F7F3EB]/45">
								{q.format}
							</p>
							<div className="mt-3 grid grid-cols-3 gap-2">
								{(['png', 'svg', 'jpg'] as const).map(
									option => (
										<button
											className={buttonGroupClass(
												exportFormat === option
											)}
											key={option}
											onClick={() =>
												setExportFormat(option)
											}
											type="button"
										>
											{q.formats[option]}
										</button>
									)
								)}
							</div>
						</div>

						<label
							className={cn(
								'flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm transition-colors',
								exportFormat === 'jpg'
									? 'cursor-not-allowed border-white/10 bg-white/[0.02] text-[#F7F3EB]/35'
									: 'border-white/10 bg-white/[0.03] text-[#F7F3EB]/75 hover:border-[#F5C400]/25'
							)}
						>
							<span className="font-medium text-white">
								{q.transparentBackground}
							</span>
							<input
								checked={effectiveTransparentBg}
								className="h-4 w-4 accent-[#F5C400]"
								disabled={exportFormat === 'jpg'}
								onChange={event =>
									setTransparentBg(event.target.checked)
								}
								type="checkbox"
							/>
						</label>

						<button
							className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#F5C400] px-5 py-3 text-sm font-semibold text-[#0C0C0F] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#ffd54a] disabled:cursor-not-allowed disabled:opacity-50"
							disabled={qrIsEmpty || !activeQrMatrix}
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
						onClick={() => setMobileAjustesOpen(value => !value)}
						type="button"
					>
						<span className="flex items-center gap-2 text-sm font-semibold text-white">
							<SlidersHorizontal className="h-4 w-4 text-[#F5C400]" />
							{q.customize}
						</span>
						<ChevronDown
							className={cn(
								'h-4 w-4 text-[#F7F3EB]/45 transition-transform duration-200',
								mobileAjustesOpen && 'rotate-180'
							)}
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
									<SliderRow
										label={q.iconSizeShort}
										max={26}
										min={10}
										onChange={setIconScale}
										step={1}
										unit="%"
										value={iconScale}
									/>
									<SliderRow
										label={q.holeShort}
										max={34}
										min={20}
										onChange={setHoleScale}
										step={1}
										unit="%"
										value={holeScale}
									/>
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
									<SliderRow
										label={q.posY}
										max={40}
										min={-40}
										onChange={setIconOffsetY}
										step={1}
										unit="px"
										value={iconOffsetY}
									/>
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
