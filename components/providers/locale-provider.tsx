"use client";

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useSyncExternalStore,
} from "react";

import {
	defaultLocale,
	isLocale,
	translations,
	type Locale,
	type TranslationDictionary,
} from "@/lib/i18n/translations";

const STORAGE_KEY = "frankmandev-playground-locale";

type LocaleContextValue = {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	t: TranslationDictionary;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

// Almacenamiento del estado de idioma fuera del componente
let storageLocale: Locale | null = null;
const listeners = new Set<() => void>();

function getStorageLocale(): Locale {
	if (typeof window === "undefined") {
		return defaultLocale;
	}
	if (storageLocale !== null) {
		return storageLocale;
	}
	const stored = window.localStorage.getItem(STORAGE_KEY);
	storageLocale = stored && isLocale(stored) ? stored : defaultLocale;
	return storageLocale;
}

function setStorageLocale(locale: Locale) {
	storageLocale = locale;
	if (typeof window !== "undefined") {
		window.localStorage.setItem(STORAGE_KEY, locale);
	}
	notifyListeners();
}

function notifyListeners() {
	listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

function getClientSnapshot(): Locale {
	return getStorageLocale();
}

function getServerSnapshot(): Locale {
	return defaultLocale;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
	const locale = useSyncExternalStore(
		subscribe,
		getClientSnapshot,
		getServerSnapshot,
	);

	useEffect(() => {
		document.documentElement.lang = locale;
	}, [locale]);

	const setLocale = (newLocale: Locale) => {
		setStorageLocale(newLocale);
	};

	const value = useMemo(
		() => ({
			locale,
			setLocale,
			t: translations[locale],
		}),
		[locale],
	);

	return (
		<LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
	);
}

export function useLocale() {
	const context = useContext(LocaleContext);

	if (!context) {
		throw new Error("useLocale must be used inside LocaleProvider.");
	}

	return context;
}

export function useTranslations() {
	return useLocale().t;
}
