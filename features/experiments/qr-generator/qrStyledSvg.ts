export type QrModuleStyle = 'square' | 'rounded' | 'dots';
export type QrCornerStyle = 'square' | 'rounded' | 'circle';

interface ParsedQrMatrix {
	matrix: boolean[][];
	size: number;
}

interface StyledQrSvgOptions {
	matrix: boolean[][];
	width: number | string;
	height: number | string;
	bgColor: string;
	fgColor: string;
	moduleStyle: QrModuleStyle;
	cornerStyle: QrCornerStyle;
}

const FINDER_MARGIN = 4;
const FINDER_SIZE = 7;

function isFiniteNumber(value: number) {
	return Number.isFinite(value) && value >= 0;
}

function escapeAttr(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('"', '&quot;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');
}

function roundedRectPath(
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number
) {
	const r = Math.max(0, Math.min(radius, width / 2, height / 2));
	if (r === 0) {
		return `M${x} ${y}H${x + width}V${y + height}H${x}Z`;
	}

	return [
		`M${x + r} ${y}`,
		`H${x + width - r}`,
		`Q${x + width} ${y} ${x + width} ${y + r}`,
		`V${y + height - r}`,
		`Q${x + width} ${y + height} ${x + width - r} ${y + height}`,
		`H${x + r}`,
		`Q${x} ${y + height} ${x} ${y + height - r}`,
		`V${y + r}`,
		`Q${x} ${y} ${x + r} ${y}`,
		'Z',
	].join('');
}

function circlePath(cx: number, cy: number, radius: number) {
	return [
		`M${cx - radius} ${cy}`,
		`A${radius} ${radius} 0 1 0 ${cx + radius} ${cy}`,
		`A${radius} ${radius} 0 1 0 ${cx - radius} ${cy}`,
		'Z',
	].join('');
}

function isFinderCell(x: number, y: number, size: number) {
	const lastFinderOrigin = size - FINDER_MARGIN - FINDER_SIZE;

	const inTopLeft =
		x >= FINDER_MARGIN &&
		x < FINDER_MARGIN + FINDER_SIZE &&
		y >= FINDER_MARGIN &&
		y < FINDER_MARGIN + FINDER_SIZE;

	const inTopRight =
		x >= lastFinderOrigin &&
		x < lastFinderOrigin + FINDER_SIZE &&
		y >= FINDER_MARGIN &&
		y < FINDER_MARGIN + FINDER_SIZE;

	const inBottomLeft =
		x >= FINDER_MARGIN &&
		x < FINDER_MARGIN + FINDER_SIZE &&
		y >= lastFinderOrigin &&
		y < lastFinderOrigin + FINDER_SIZE;

	return inTopLeft || inTopRight || inBottomLeft;
}

function buildModuleShape(
	x: number,
	y: number,
	style: QrModuleStyle,
	color: string
) {
	if (style === 'dots') {
		return `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.34" fill="${color}" />`;
	}

	if (style === 'rounded') {
		return `<rect x="${x + 0.08}" y="${y + 0.08}" width="0.84" height="0.84" rx="0.24" ry="0.24" fill="${color}" />`;
	}

	return `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}" />`;
}

function buildFinderRingPath(x: number, y: number, style: QrCornerStyle) {
	if (style === 'circle') {
		return `${circlePath(x + 3.5, y + 3.5, 3.5)}${circlePath(x + 3.5, y + 3.5, 2.5)}`;
	}

	if (style === 'rounded') {
		return `${roundedRectPath(x, y, 7, 7, 1.45)}${roundedRectPath(x + 1, y + 1, 5, 5, 1.05)}`;
	}

	return `${roundedRectPath(x, y, 7, 7, 0)}${roundedRectPath(x + 1, y + 1, 5, 5, 0)}`;
}

function buildFinderCenterPath(x: number, y: number, style: QrCornerStyle) {
	if (style === 'circle') {
		return circlePath(x + 3.5, y + 3.5, 1.5);
	}

	if (style === 'rounded') {
		return roundedRectPath(x + 2, y + 2, 3, 3, 0.9);
	}

	return roundedRectPath(x + 2, y + 2, 3, 3, 0);
}

function buildFinderMarkup(
	x: number,
	y: number,
	style: QrCornerStyle,
	color: string
) {
	return [
		`<path d="${buildFinderRingPath(x, y, style)}" fill="${color}" fill-rule="evenodd" />`,
		`<path d="${buildFinderCenterPath(x, y, style)}" fill="${color}" />`,
	].join('');
}

function buildStyledQrSvgContent(
	matrix: boolean[][],
	moduleStyle: QrModuleStyle,
	cornerStyle: QrCornerStyle,
	fgColor: string
) {
	const size = matrix.length;
	const parts: string[] = [];

	matrix.forEach((row, y) => {
		row.forEach((isDark, x) => {
			if (!isDark || isFinderCell(x, y, size)) return;
			parts.push(buildModuleShape(x, y, moduleStyle, fgColor));
		});
	});

	const lastFinderOrigin = size - FINDER_MARGIN - FINDER_SIZE;
	parts.push(
		buildFinderMarkup(FINDER_MARGIN, FINDER_MARGIN, cornerStyle, fgColor)
	);
	parts.push(
		buildFinderMarkup(lastFinderOrigin, FINDER_MARGIN, cornerStyle, fgColor)
	);
	parts.push(
		buildFinderMarkup(FINDER_MARGIN, lastFinderOrigin, cornerStyle, fgColor)
	);

	return parts.join('');
}

export function parseQrMatrixFromSvg(
	svgEl: SVGSVGElement | null
): ParsedQrMatrix | null {
	if (!svgEl) return null;

	const viewBox = svgEl.getAttribute('viewBox');
	if (!viewBox) return null;

	const viewBoxValues = viewBox
		.trim()
		.split(/\s+/)
		.map(value => Number(value));

	const size = viewBoxValues.length === 4 ? viewBoxValues[2] : NaN;
	if (!isFiniteNumber(size)) return null;

	const paths = svgEl.querySelectorAll('path');
	const dataPath = paths.item(paths.length - 1);
	const pathData = dataPath?.getAttribute('d');
	if (!pathData) return null;

	const matrix = Array.from({ length: size }, () =>
		Array.from({ length: size }, () => false)
	);
	const segmentPattern =
		/M\s*([0-9.]+)[ ,]([0-9.]+)\s*h([0-9.]+)v1H([0-9.]+)z/g;

	for (const match of pathData.matchAll(segmentPattern)) {
		const startX = Math.round(Number(match[1]));
		const startY = Math.round(Number(match[2]));
		const width = Math.round(Number(match[3]));

		for (let offset = 0; offset < width; offset += 1) {
			if (matrix[startY]?.[startX + offset] !== undefined) {
				matrix[startY][startX + offset] = true;
			}
		}
	}

	return { matrix, size };
}

export function buildStyledQrSvgMarkup({
	matrix,
	width,
	height,
	bgColor,
	fgColor,
	moduleStyle,
	cornerStyle,
}: StyledQrSvgOptions) {
	const size = matrix.length;
	const bgMarkup =
		bgColor === 'transparent'
			? ''
			: `<rect x="0" y="0" width="${size}" height="${size}" fill="${escapeAttr(bgColor)}" />`;

	return [
		`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${size} ${size}" preserveAspectRatio="xMidYMid meet" shape-rendering="geometricPrecision">`,
		bgMarkup,
		buildStyledQrSvgContent(
			matrix,
			moduleStyle,
			cornerStyle,
			escapeAttr(fgColor)
		),
		'</svg>',
	].join('');
}
