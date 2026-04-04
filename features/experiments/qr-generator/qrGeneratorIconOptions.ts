function svgToDataUri(svg: string) {
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildStrokeIcon(stroke: string, body: string) {
	return svgToDataUri(`
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="${stroke}"
			stroke-width="1.9"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			${body}
		</svg>
	`);
}

const whatsappPath =
	'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z';

export type QrIconLabelKey =
	| 'none'
	| 'playground'
	| 'whatsapp'
	| 'browser'
	| 'smartphone'
	| 'mapPin'
	| 'mail'
	| 'instagram'
	| 'github'
	| 'youtube'
	| 'message'
	| 'calendar'
	| 'shoppingBag';

export type QrCenterIconOption =
	| { id: string; src: string; labelKey: QrIconLabelKey }
	| { id: string; src: string; uploadName: string };

export const defaultQrCenterIcons: Extract<
	QrCenterIconOption,
	{ labelKey: QrIconLabelKey }
>[] = [
	{ id: 'none', labelKey: 'none', src: '' },
	{ id: 'playground', labelKey: 'playground', src: '/brand-mark.svg' },
	{
		id: 'whatsapp',
		labelKey: 'whatsapp',
		src: svgToDataUri(`
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#25D366">
				<path d="${whatsappPath}" />
			</svg>
		`),
	},
	{
		id: 'browser',
		labelKey: 'browser',
		src: buildStrokeIcon(
			'#2563EB',
			'<rect x="2" y="4" width="20" height="16" rx="2" /><path d="M10 4v4" /><path d="M2 8h20" /><path d="M6 4v4" />'
		),
	},
	{
		id: 'smartphone',
		labelKey: 'smartphone',
		src: buildStrokeIcon(
			'#111827',
			'<rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" />'
		),
	},
	{
		id: 'mapPin',
		labelKey: 'mapPin',
		src: buildStrokeIcon(
			'#F97316',
			'<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" />'
		),
	},
	{
		id: 'mail',
		labelKey: 'mail',
		src: buildStrokeIcon(
			'#DC2626',
			'<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" />'
		),
	},
	{
		id: 'instagram',
		labelKey: 'instagram',
		src: buildStrokeIcon(
			'#DB2777',
			'<rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />'
		),
	},
	{
		id: 'github',
		labelKey: 'github',
		src: buildStrokeIcon(
			'#0F172A',
			'<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" />'
		),
	},
	{
		id: 'youtube',
		labelKey: 'youtube',
		src: buildStrokeIcon(
			'#DC2626',
			'<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" />'
		),
	},
	{
		id: 'message',
		labelKey: 'message',
		src: buildStrokeIcon(
			'#059669',
			'<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />'
		),
	},
	{
		id: 'calendar',
		labelKey: 'calendar',
		src: buildStrokeIcon(
			'#7C3AED',
			'<path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" /><path d="M16 18h.01" />'
		),
	},
	{
		id: 'shoppingBag',
		labelKey: 'shoppingBag',
		src: buildStrokeIcon(
			'#B45309',
			'<path d="M16 10a4 4 0 0 1-8 0" /><path d="M3.103 6.034h17.794" /><path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />'
		),
	},
];
