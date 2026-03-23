export type Locale = "es" | "en";

export const defaultLocale: Locale = "es";

export type TranslationDictionary = typeof translations.es;

export const translations = {
	es: {
		site: {
			headline: "Juegos, aplicaciones utiles y experimentos en un solo lugar.",
		},
		nav: {
			home: "Inicio",
			games: "Juegos",
			apps: "Aplicaciones",
			experiments: "Experimentos",
			profile: "Perfil",
			signIn: "Iniciar sesion",
		},
		language: {
			label: "Idioma",
			es: "ES",
			en: "EN",
		},
		common: {
			live: "Disponible",
			comingSoon: "Proximamente",
		},
		home: {
			heading: "Un solo lugar para juegos, aplicaciones utiles y experimentos.",
			description:
				"Este proyecto convierte el demo original de blackjack en una plataforma completa que puede crecer con perfiles, favoritos, estadisticas y experiencias sincronizadas en el futuro.",
			playBlackjack: "Jugar blackjack",
			openTodos: "Abrir tareas",
			stats: {
				liveToday: "Disponible hoy",
				liveTodayValue: "2 modulos",
				pillars: "Pilares del producto",
				pillarsValue: "Juegos, Aplicaciones, Experimentos",
				dataLayer: "Capa de datos",
				dataLayerValue: "Lista para Supabase",
				ux: "Estrategia UX",
				uxValue: "Invitado primero, cuenta mejorada",
			},
			featured: {
				eyebrow: "Destacados",
				title: "Hecho para validar la plataforma rapido.",
				description:
					"La primera version incluye un juego pulido y una app util para demostrar que el playground sirve tanto para entretenimiento como para productividad.",
			},
			catalog: {
				eyebrow: "Catalogo",
				title: "Una hoja de ruta centrada en el producto.",
				description:
					"Cada modulo esta agrupado por lo que hace para el usuario, no por la capa tecnica, lo que hace que la plataforma sea mas facil de escalar y navegar.",
			},
		},
		gamesPage: {
			eyebrow: "Juegos",
			title: "Juegos web pulidos con logica clara.",
			description:
				"Aqui el juego casual se cruza con mejores practicas de ingenieria, empezando por una nueva version del proyecto original de blackjack.",
		},
		appsPage: {
			eyebrow: "Aplicaciones",
			title: "Herramientas utiles que pueden crecer con datos de usuario.",
			description:
				"La parte de apps del playground se enfoca en utilidades practicas que funcionan al instante para invitados y mejoran cuando activas perfiles y sincronizacion.",
		},
		experimentsPage: {
			eyebrow: "Experimentos",
			title: "Un lugar para ideas rapidas y prototipos pulidos.",
			description:
				"Esta seccion protege el impulso: no toda idea necesita ser un producto completo antes de tener un lugar dentro de la plataforma.",
			items: [
				{
					title: "Laboratorio de UI y Movimiento",
					description:
						"Un sandbox para ideas pequenas de interfaz, transiciones y patrones de interaccion que luego valga la pena reutilizar.",
				},
				{
					title: "Widgets de Datos",
					description:
						"Pequenos experimentos de producto que ayudan a que las paginas de perfil cobren vida cuando lleguen los datos con Supabase.",
				},
				{
					title: "Mini mecanicas",
					description:
						"Prototipos rapidos de juegos que pueden crecer a modulos completos si los jugadores responden bien.",
				},
			],
		},
		loginPage: {
			eyebrow: "Autenticacion",
			title: "Acceso primero para invitados, experiencia mejorada con cuenta.",
			description:
				"La plataforma funciona sin obligarte a iniciar sesion, pero la capa de datos esta lista para perfiles, favoritos, estadisticas y utilidades sincronizadas cuando agregues las claves de Supabase.",
			statusTitle: "Estado de Supabase",
			envPresent:
				"Las variables de entorno ya existen. El siguiente paso es conectar el flujo de autenticacion.",
			envMissing:
				"Agrega NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para activar autenticacion real.",
			bullets: [
				"El acceso por correo o redes puede desbloquear favoritos, estadisticas guardadas y datos sincronizados.",
				"Los invitados deberian poder usar la mayoria de modulos sin friccion.",
				"Empieza con enlaces magicos y agrega providers solo si realmente mejoran la activacion.",
			],
		},
		authCard: {
			initialMessage:
				"Usa el acceso por enlace magico cuando tus claves de Supabase esten configuradas.",
			invalidEmail: "Escribe un correo valido.",
			missingKeys:
				"Faltan las claves de Supabase. Agregalas a .env.local antes de activar la autenticacion.",
			sentMessage:
				"Enlace magico enviado. Revisa tu correo para entrar al playground.",
			title: "Acceso con enlace magico",
			description:
				"Manten la experiencia abierta para invitados y desbloquea persistencia para quienes quieran favoritos, estadisticas y datos sincronizados.",
			placeholder: "tu@correo.com",
			sending: "Enviando...",
			send: "Enviar enlace magico",
		},
		profilePage: {
			eyebrow: "Perfil",
			title: "Un futuro hogar para los datos sincronizados.",
			description:
				"Los perfiles uniran favoritos, modulos usados recientemente, sincronizacion de tareas y estadisticas personales una vez que actives la autenticacion.",
			currentUserTitle: "Usuario actual",
			noUser: "Todavia no hay un usuario autenticado.",
			sessionError:
				"Supabase esta configurado, pero no se pudo leer la sesion actual.",
			sessionReady:
				"Esta pagina esta lista para mostrar datos del perfil cuando la autenticacion este activa.",
			plannedModulesTitle: "Modulos planeados",
			modules: [
				"Favoritos en juegos, apps y experimentos.",
				"Listas de tareas guardadas por cuenta.",
				"Sesiones de blackjack, rachas y mejores marcas.",
				"Elementos usados recientemente y recomendaciones personalizadas.",
			],
		},
		blackjackPage: {
			eyebrow: "Juego MVP",
			title: "Blackjack Renovado",
			description:
				"Una mesa de blackjack mas cercana a casino real: zapato de 6 mazos, pago 3:2, seguro, doble, split y una presentacion con mas movimiento.",
			loadingStatus: "Estado de la mesa",
			loadingTitle: "Preparando el zapato...",
			player: "Jugador",
			house: "Crupier",
			preparingHand: "Preparando mano",
		},
		blackjack: {
			roundStart: "Tu turno.",
			hiddenCardAlt: "Carta oculta",
			cardAltPrefix: "Carta",
			tableStatus: "Mesa de casino",
			title: "Blackjack de Casino",
			hit: "Pedir",
			stand: "Plantarse",
			double: "Doblar",
			split: "Separar",
			insurance: "Tomar seguro",
			declineInsurance: "Sin seguro",
			newRound: "Repartir nueva mano",
			rebuy: "Recomprar 1,000",
			player: "Jugador",
			house: "Crupier",
			hand: "Mano",
			rulesTitle: "Reglas reales aplicadas",
			rules: [
				"Zapato de 6 mazos con nuevo barajado al acercarse a la carta de corte.",
				"Blackjack natural paga 3:2 y hace push si el crupier tambien tiene blackjack.",
				"El crupier pide con 16 o menos y se planta en todo 17, incluido soft 17.",
				"Seguro disponible cuando el crupier muestra un As; paga 2:1 si hay blackjack.",
				"Puedes doblar con cualquier mano de 2 cartas y recibes solo una carta extra.",
				"Puedes separar pares del mismo valor, incluidos dieces equivalentes, hasta 4 manos.",
				"Al separar ases recibes una sola carta por mano y un 21 asi cuenta como 21, no como blackjack.",
			],
			bankroll: "Bankroll",
			nextBet: "Apuesta siguiente",
			insuranceBet: "Seguro",
			shoeCards: "Cartas en el zapato",
			activeHand: "Mano activa",
			roundStatus: "Estado de la ronda",
			roundResolved: "Resuelta",
			roundInPlay: "Tu turno",
			roundInsurance: "Oferta de seguro",
			roundDealer: "Turno del crupier",
			dealerRule: "Regla del crupier",
			dealerRuleValue: "Se planta en soft 17",
			blackjackPayout: "Pago blackjack",
			blackjackPayoutValue: "3:2",
			revealedHole: "Carta tapada revelada",
			hiddenHole: "Carta tapada oculta",
			dealerShows: "El crupier muestra",
			insurancePrompt:
				"El crupier muestra un As. Puedes asegurar hasta la mitad de la apuesta antes de que revise el blackjack.",
			dealerTurn:
				"El crupier revela su carta tapada y roba hasta plantarse en 17 o mas.",
			playingHand: "Jugando la mano",
			dealerTotal: "Total del crupier",
			netRound: "Resultado neto",
			blackjackOutcome: "blackjack natural",
			winOutcome: "ganada",
			loseOutcome: "perdida",
			pushOutcome: "push",
			doubled: "doblada",
			splitAces: "ases separados",
			splitHand: "mano separada",
			currentHand: "en juego",
			scoreLabel: "pts",
		},
		todosPage: {
			eyebrow: "Aplicacion MVP",
			title: "Centro de Tareas",
			description:
				"Un modulo de productividad local primero, que ya sigue la forma necesaria para perfiles de usuario, favoritos y sincronizacion futura en la nube.",
			loadingEyebrow: "App de productividad",
			loadingTitle: "Cargando tareas...",
			loadingDescription:
				"Preparando tus datos locales y restaurando el estado guardado.",
			storage: "Almacenamiento",
			hydrating: "Hidratando estado local",
		},
		todos: {
			invalidTask: "Escribe una tarea valida.",
			eyebrow: "App de productividad",
			title: "Centro de Tareas",
			description:
				"Gestion de tareas local primero: se siente instantanea hoy y puede sincronizarse con perfiles de Supabase despues.",
			placeholder: "Agrega una tarea para la hoja de ruta del playground",
			addTask: "Agregar tarea",
			filters: {
				all: "todas",
				active: "activas",
				completed: "completadas",
			},
			clearCompleted: "Limpiar completadas",
			noTasks: "Todavia no hay tareas para este filtro.",
			deletePrefix: "Eliminar",
			strategyEyebrow: "Estrategia de persistencia",
			readyForSync: "Lista para sincronizar",
			totalTasks: "Tareas totales",
			completed: "Completadas",
			storageToday: "Almacenamiento actual",
			storageTodayValue: "localStorage",
			upgradePath: "Camino de mejora",
			upgradePathValue: "Supabase + perfiles de usuario",
			bullets: [
				"Los invitados pueden gestionar tareas al instante y sin friccion de autenticacion.",
				"La estructura de la tarea es lo bastante simple como para migrarla despues a tablas.",
				"Los filtros y el estado de la UI ya se guardan para una mejor experiencia al volver.",
			],
		},
		footer: {
			left: "FrankmanDev Playground esta hecho para juegos, apps y experimentos.",
			right:
				"Next.js, TypeScript, Tailwind y una arquitectura lista para Supabase.",
		},
	},
	en: {
		site: {
			headline: "Games, useful apps and experiments in one place.",
		},
		nav: {
			home: "Home",
			games: "Games",
			apps: "Apps",
			experiments: "Experiments",
			profile: "Profile",
			signIn: "Sign in",
		},
		language: {
			label: "Language",
			es: "ES",
			en: "EN",
		},
		common: {
			live: "Live",
			comingSoon: "Coming soon",
		},
		home: {
			heading: "A single home for games, useful apps and experiments.",
			description:
				"This project turns the original blackjack demo into a full platform that can grow with profiles, favorites, stats and future synced experiences.",
			playBlackjack: "Play blackjack",
			openTodos: "Open todos",
			stats: {
				liveToday: "Live today",
				liveTodayValue: "2 modules",
				pillars: "Product pillars",
				pillarsValue: "Games, Apps, Experiments",
				dataLayer: "Data layer",
				dataLayerValue: "Supabase-ready",
				ux: "UX strategy",
				uxValue: "Guest-first, account-enhanced",
			},
			featured: {
				eyebrow: "Featured",
				title: "Built to validate the platform fast.",
				description:
					"The first release ships with one polished game and one useful app so the playground can prove both entertainment and productivity use cases.",
			},
			catalog: {
				eyebrow: "Catalog",
				title: "A roadmap that stays product-focused.",
				description:
					"Every module is grouped by what it does for users, not by technical layer, which keeps the platform easy to scale and easy to browse.",
			},
		},
		gamesPage: {
			eyebrow: "Games",
			title: "Polished browser games with clean logic.",
			description:
				"This section is where casual play meets better engineering practices, starting with a reboot of the original blackjack project.",
		},
		appsPage: {
			eyebrow: "Apps",
			title: "Useful tools that can grow with user data.",
			description:
				"The apps side of the playground focuses on practical utilities that work instantly for guests and become even better when profiles and sync are enabled.",
		},
		experimentsPage: {
			eyebrow: "Experiments",
			title: "A place for fast ideas and polished prototypes.",
			description:
				"This section protects momentum: not every concept needs to be a full product before it has a home in the platform.",
			items: [
				{
					title: "UI Motion Lab",
					description:
						"A sandbox for small interface ideas, transitions and interaction patterns worth reusing later.",
				},
				{
					title: "Data Widgets",
					description:
						"Small product experiments that help profile pages feel alive once Supabase-backed data lands.",
				},
				{
					title: "Mini mechanics",
					description:
						"Quick game prototypes that can graduate into full modules if players respond well.",
				},
			],
		},
		loginPage: {
			eyebrow: "Authentication",
			title: "Guest-first access, account-enhanced experience.",
			description:
				"The platform works without forcing sign-in, but the data layer is ready for profiles, favorites, stats and synced utilities when you add Supabase keys.",
			statusTitle: "Supabase status",
			envPresent:
				"Environment variables are already present. The next step is wiring the auth flow.",
			envMissing:
				"Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable real authentication.",
			bullets: [
				"Email or social sign-in can unlock favorites, saved stats and synced app data.",
				"Guests should still be able to use most modules without friction.",
				"Start with magic links and add providers only if they really improve activation.",
			],
		},
		authCard: {
			initialMessage:
				"Use magic link auth once your Supabase keys are configured.",
			invalidEmail: "Enter a valid email address.",
			missingKeys:
				"Supabase keys are missing. Add them to .env.local before enabling authentication.",
			sentMessage:
				"Magic link sent. Check your inbox to continue into the playground.",
			title: "Magic link sign in",
			description:
				"Keep the experience open for guests, then unlock persistence for users who want favorites, stats and synced app data.",
			placeholder: "you@example.com",
			sending: "Sending...",
			send: "Send magic link",
		},
		profilePage: {
			eyebrow: "Profile",
			title: "A future home for synced data.",
			description:
				"Profiles will tie together favorites, recently used modules, todo sync and personal stats once authentication is enabled.",
			currentUserTitle: "Current user",
			noUser: "There is no authenticated user yet.",
			sessionError:
				"Supabase is configured, but the current session could not be read.",
			sessionReady:
				"This page is ready to display profile data when authentication is active.",
			plannedModulesTitle: "Planned modules",
			modules: [
				"Favorites across games, apps and experiments.",
				"Saved todo lists per account.",
				"Blackjack sessions, streaks and personal bests.",
				"Recently used items and personalized recommendations.",
			],
		},
		blackjackPage: {
			eyebrow: "Game MVP",
			title: "Blackjack Reboot",
			description:
				"A more authentic casino-style blackjack table with a 6-deck shoe, 3:2 naturals, insurance, double, split and stronger motion design.",
			loadingStatus: "Table status",
			loadingTitle: "Preparing the shoe...",
			player: "Player",
			house: "Dealer",
			preparingHand: "Preparing hand",
		},
		blackjack: {
			roundStart: "Your turn.",
			hiddenCardAlt: "Hidden card",
			cardAltPrefix: "Card",
			tableStatus: "Casino table",
			title: "Casino Blackjack",
			hit: "Hit",
			stand: "Stand",
			double: "Double",
			split: "Split",
			insurance: "Take insurance",
			declineInsurance: "No insurance",
			newRound: "Deal next hand",
			rebuy: "Rebuy 1,000",
			player: "Player",
			house: "Dealer",
			hand: "Hand",
			rulesTitle: "Real rules applied",
			rules: [
				"6-deck shoe with a fresh shuffle when the cut-card point gets close.",
				"Natural blackjack pays 3:2 and pushes against a dealer blackjack.",
				"The dealer hits 16 or less and stands on every 17, including soft 17.",
				"Insurance is offered against a dealer Ace and pays 2:1 if blackjack lands.",
				"You can double on any two-card hand and receive exactly one extra card.",
				"You can split equal-value pairs, including equivalent tens, up to 4 hands.",
				"Split aces receive one card each and a 21 there counts as 21, not blackjack.",
			],
			bankroll: "Bankroll",
			nextBet: "Next bet",
			insuranceBet: "Insurance",
			shoeCards: "Cards in shoe",
			activeHand: "Active hand",
			roundStatus: "Round status",
			roundResolved: "Resolved",
			roundInPlay: "Your turn",
			roundInsurance: "Insurance offer",
			roundDealer: "Dealer turn",
			dealerRule: "Dealer rule",
			dealerRuleValue: "Stand on soft 17",
			blackjackPayout: "Blackjack payout",
			blackjackPayoutValue: "3:2",
			revealedHole: "Hole card revealed",
			hiddenHole: "Hole card hidden",
			dealerShows: "Dealer shows",
			insurancePrompt:
				"The dealer is showing an Ace. You may insure for up to half the main wager before the peek.",
			dealerTurn:
				"The dealer reveals the hole card and draws until standing on 17 or higher.",
			playingHand: "Playing hand",
			dealerTotal: "Dealer total",
			netRound: "Net result",
			blackjackOutcome: "natural blackjack",
			winOutcome: "won",
			loseOutcome: "lost",
			pushOutcome: "push",
			doubled: "doubled",
			splitAces: "split aces",
			splitHand: "split hand",
			currentHand: "in play",
			scoreLabel: "pts",
		},
		todosPage: {
			eyebrow: "App MVP",
			title: "Todos Hub",
			description:
				"A local-first productivity module that already matches the shape needed for user profiles, favorites and future cloud sync.",
			loadingEyebrow: "Productivity app",
			loadingTitle: "Loading todos...",
			loadingDescription:
				"Preparing your local task data and restoring the saved state.",
			storage: "Storage",
			hydrating: "Hydrating local state",
		},
		todos: {
			invalidTask: "Write a valid task.",
			eyebrow: "Productivity app",
			title: "Todos Hub",
			description:
				"Local-first task management: instant today and ready to sync with Supabase profiles later.",
			placeholder: "Add a task for the playground roadmap",
			addTask: "Add task",
			filters: {
				all: "all",
				active: "active",
				completed: "completed",
			},
			clearCompleted: "Clear completed",
			noTasks: "No tasks match this filter yet.",
			deletePrefix: "Delete",
			strategyEyebrow: "Persistence strategy",
			readyForSync: "Ready for sync",
			totalTasks: "Total tasks",
			completed: "Completed",
			storageToday: "Storage today",
			storageTodayValue: "localStorage",
			upgradePath: "Upgrade path",
			upgradePathValue: "Supabase + user profiles",
			bullets: [
				"Guests can manage tasks instantly without auth friction.",
				"The task shape is simple enough to migrate into tables later.",
				"Filters and UI state are already stored for a smoother return experience.",
			],
		},
		footer: {
			left: "FrankmanDev Playground is built for games, apps and experiments.",
			right:
				"Next.js, TypeScript, Tailwind and a Supabase-ready architecture.",
		},
	},
};

export function isLocale(value: string): value is Locale {
	return value === "es" || value === "en";
}
