function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildIcon(fill: string, path: string) {
  return svgToDataUri(`
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fill}">
			<path d="${path}" />
		</svg>
	`);
}

const whatsappPath =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

const phonePath =
  "M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.72 11.72 0 003.68.59 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.47a1 1 0 011 1 11.72 11.72 0 00.58 3.68 1 1 0 01-.25 1.01l-2.18 2.1z";

const globePath =
  "M12 2a10 10 0 100 20 10 10 0 000-20zm6.93 9h-3.35a15.9 15.9 0 00-1.14-4.23A8.03 8.03 0 0118.93 11zM12 4c.78 0 2.16 2.01 2.57 5H9.43C9.84 6.01 11.22 4 12 4zM4.07 13h3.35c.16 1.49.57 2.94 1.14 4.23A8.03 8.03 0 014.07 13zm3.35-2H4.07a8.03 8.03 0 014.49-4.23A15.9 15.9 0 007.42 11zm4.58 9c-.78 0-2.16-2.01-2.57-5h5.14c-.41 2.99-1.79 5-2.57 5zm2.99-2.77c.57-1.29.98-2.74 1.14-4.23h3.35a8.03 8.03 0 01-4.49 4.23z";

const locationPath =
  "M12 2a6 6 0 016 6c0 4.4-6 12-6 12S6 12.4 6 8a6 6 0 016-6zm0 8.5A2.5 2.5 0 1012 5.5a2.5 2.5 0 000 5z";

export type QrIconLabelKey = "none" | "playground" | "whatsapp" | "phone" | "globe" | "location";

export type QrCenterIconOption =
  | { id: string; src: string; labelKey: QrIconLabelKey }
  | { id: string; src: string; uploadName: string };

export const defaultQrCenterIcons: Extract<QrCenterIconOption, { labelKey: QrIconLabelKey }>[] = [
  { id: "none", labelKey: "none", src: "" },
  { id: "playground", labelKey: "playground", src: "/brand-mark.svg" },
  { id: "whatsapp", labelKey: "whatsapp", src: buildIcon("#25D366", whatsappPath) },
  { id: "phone", labelKey: "phone", src: buildIcon("#ef4444", phonePath) },
  { id: "globe", labelKey: "globe", src: buildIcon("#2563eb", globePath) },
  { id: "location", labelKey: "location", src: buildIcon("#f97316", locationPath) },
];
