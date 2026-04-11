import {
	Boxes,
	BrainCircuit,
	CheckSquare,
	Gamepad2,
	Layers3,
	QrCode,
	Rocket,
	Sparkles,
	TimerReset,
} from 'lucide-react';

import type { Locale } from '@/lib/i18n/translations';
import type { CatalogItem, IconMap } from '@/types/catalog';

export const iconMap: IconMap = {
	Boxes,
	BrainCircuit,
	CheckSquare,
	Gamepad2,
	Layers3,
	QrCode,
	Rocket,
	Sparkles,
	TimerReset,
};

export function getCatalogItems(locale: Locale): CatalogItem[] {
	if (locale === 'en') {
		return [
			{
				slug: 'blackjack',
				title: 'Blackjack Reboot',
				description:
					'A casino-style blackjack table with real table rules, a 6-deck shoe and richer motion.',
				href: '/games/blackjack',
				category: 'game',
				status: 'live',
				iconName: 'Gamepad2',
				tags: ['Cards', 'Logic', 'Single-player'],
				ctaLabel: 'Play now',
				featured: true,
			},
			{
				slug: 'chess',
				title: 'Playground Chess',
				description:
					'A complete local chess game with legal move validation, endgame rules and a CPU-ready engine core.',
				href: '/games/chess',
				category: 'game',
				status: 'live',
				iconName: 'BrainCircuit',
				tags: ['Strategy', 'Board game', 'Local multiplayer'],
				ctaLabel: 'Open board',
			},
			{
				slug: 'todos',
				title: 'Todos Hub',
				description:
					'Task management with local persistence today and a data model ready for user sync later.',
				href: '/apps/todos',
				category: 'app',
				status: 'live',
				iconName: 'CheckSquare',
				tags: ['Productivity', 'Local sync', 'MVP'],
				ctaLabel: 'Open app',
				featured: true,
			},
			{
				slug: 'pomodoro',
				title: 'Pomodoro Flow',
				description:
					'A focused work timer with future support for profiles, saved sessions and streak tracking.',
				href: '/apps',
				category: 'app',
				status: 'coming-soon',
				iconName: 'TimerReset',
				tags: ['Focus', 'Timer', 'Coming soon'],
				ctaLabel: 'Coming soon',
			},
			{
				slug: 'qr-generator',
				title: 'QR Generator',
				description:
					'Create share-ready QR codes with styled modules, richer exports and presets for links, Wi-Fi and contacts.',
				href: '/apps/qr-generator',
				category: 'app',
				status: 'live',
				iconName: 'QrCode',
				tags: ['Utility', 'Export', 'Branding'],
				ctaLabel: 'Open tool',
			},
			{
				slug: 'open-links',
				title: 'Open Links',
				description:
					'Paste a list of URLs or upload a TXT file and open them quickly in new browser tabs.',
				href: '/utilities/open-links',
				category: 'utility',
				status: 'live',
				iconName: 'Layers3',
				tags: ['Links', 'Browser', 'Automation'],
				ctaLabel: 'Open utility',
			},
			{
				slug: 'live-wallpaper',
				title: 'Live Wallpaper Anime Glitch',
				description:
					'Interactive animated wallpaper hosted on Netlify; open the full experience from a dedicated playground page.',
				href: '/experiments/live-wallpaper-anime',
				category: 'experiment',
				status: 'live',
				iconName: 'Sparkles',
				tags: ['WebGL', 'External', 'Demo'],
				ctaLabel: 'View bridge page',
			},
			{
				slug: 'skate-deck-studio',
				title: 'Skate Deck Studio',
				description:
					'Deck pattern editor and gallery in development; a public demo will land here when the stack is deployment-ready.',
				href: '/experiments/skate-deck-studio',
				category: 'experiment',
				status: 'coming-soon',
				iconName: 'Boxes',
				tags: ['Design', 'Canvas', 'Roadmap'],
				ctaLabel: 'Coming soon',
			},
			{
				slug: 'lab',
				title: 'UI Motion Lab',
				description:
					'A place for small interactive experiments, polished microinteractions and visual prototypes.',
				href: '/experiments',
				category: 'experiment',
				status: 'coming-soon',
				iconName: 'Layers3',
				tags: ['Motion', 'Prototype', 'UI'],
				ctaLabel: 'Explore',
			},
			{
				slug: 'launchpad',
				title: 'Creator Launchpad',
				description:
					'A future module for tracking favorites, recently used items and profile-driven suggestions.',
				href: '/profile',
				category: 'experiment',
				status: 'coming-soon',
				iconName: 'Rocket',
				tags: ['Profile', 'Data', 'Roadmap'],
				ctaLabel: 'See roadmap',
			},
		];
	}

	return [
		{
			slug: 'blackjack',
			title: 'Blackjack Renovado',
			description:
				'Una mesa de blackjack estilo casino con reglas reales, zapato de 6 mazos y mas movimiento.',
			href: '/games/blackjack',
			category: 'game',
			status: 'live',
			iconName: 'Gamepad2',
			tags: ['Cartas', 'Logica', 'Un jugador'],
			ctaLabel: 'Jugar ahora',
			featured: true,
		},
		{
			slug: 'chess',
			title: 'Ajedrez de Playground',
			description:
				'Una partida de ajedrez completa en local, con movimientos legales, finales reales y una base lista para CPU.',
			href: '/games/chess',
			category: 'game',
			status: 'live',
			iconName: 'BrainCircuit',
			tags: ['Estrategia', 'Tablero', 'Multijugador local'],
			ctaLabel: 'Abrir tablero',
		},
		{
			slug: 'todos',
			title: 'Centro de Tareas',
			description:
				'Gestion de tareas con persistencia local hoy y un modelo de datos listo para sincronizacion de usuarios despues.',
			href: '/apps/todos',
			category: 'app',
			status: 'live',
			iconName: 'CheckSquare',
			tags: ['Productividad', 'Guardado local', 'MVP'],
			ctaLabel: 'Abrir app',
			featured: true,
		},
		{
			slug: 'pomodoro',
			title: 'Flujo Pomodoro',
			description:
				'Un temporizador de enfoque con soporte futuro para perfiles, sesiones guardadas y rachas.',
			href: '/apps',
			category: 'app',
			status: 'coming-soon',
			iconName: 'TimerReset',
			tags: ['Enfoque', 'Temporizador', 'Proximamente'],
			ctaLabel: 'Proximamente',
		},
		{
			slug: 'qr-generator',
			title: 'Generador QR',
			description:
				'Crea codigos QR listos para compartir con modulos estilizados, mas opciones de exportacion y presets para web, Wi-Fi o contacto.',
			href: '/apps/qr-generator',
			category: 'app',
			status: 'live',
			iconName: 'QrCode',
			tags: ['Utilidad', 'Exportar', 'Marca'],
			ctaLabel: 'Abrir herramienta',
		},
		{
			slug: 'open-links',
			title: 'Abrir Enlaces',
			description:
				'Pega una lista de URLs o sube un archivo TXT para abrirlas rapido en pestañas nuevas del navegador.',
			href: '/utilities/open-links',
			category: 'utility',
			status: 'live',
			iconName: 'Layers3',
			tags: ['Enlaces', 'Navegador', 'Automatizacion'],
			ctaLabel: 'Abrir utilidad',
		},
		{
			slug: 'live-wallpaper',
			title: 'Live Wallpaper Anime Glitch',
			description:
				'Fondo animado interactivo alojado en Netlify; desde aqui abres la demo completa en una pagina puente del playground.',
			href: '/experiments/live-wallpaper-anime',
			category: 'experiment',
			status: 'live',
			iconName: 'Sparkles',
			tags: ['WebGL', 'Externo', 'Demo'],
			ctaLabel: 'Ver pagina puente',
		},
		{
			slug: 'skate-deck-studio',
			title: 'Skate Deck Studio',
			description:
				'Editor de patrones y galeria para tablas en desarrollo; la demo publica llegara cuando el stack este listo para desplegar.',
			href: '/experiments/skate-deck-studio',
			category: 'experiment',
			status: 'coming-soon',
			iconName: 'Boxes',
			tags: ['Diseno', 'Canvas', 'Hoja de ruta'],
			ctaLabel: 'Proximamente',
		},
		{
			slug: 'lab',
			title: 'Laboratorio de UI y Movimiento',
			description:
				'Un lugar para pequenos experimentos interactivos, microinteracciones pulidas y prototipos visuales.',
			href: '/experiments',
			category: 'experiment',
			status: 'coming-soon',
			iconName: 'Layers3',
			tags: ['Movimiento', 'Prototipo', 'UI'],
			ctaLabel: 'Explorar',
		},
		{
			slug: 'launchpad',
			title: 'Centro del Creador',
			description:
				'Un modulo futuro para seguir favoritos, elementos usados recientemente y sugerencias segun el perfil.',
			href: '/profile',
			category: 'experiment',
			status: 'coming-soon',
			iconName: 'Rocket',
			tags: ['Perfil', 'Datos', 'Hoja de ruta'],
			ctaLabel: 'Ver hoja de ruta',
		},
	];
}

export function getFeaturedItems(locale: Locale) {
	return getCatalogItems(locale).filter(item => item.featured);
}
