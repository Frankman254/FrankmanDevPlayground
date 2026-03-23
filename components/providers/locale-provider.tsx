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
const LOCALE_EVENT = "frankmandev-playground-locale-change";

type LocaleContextValue = {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	t: TranslationDictionary;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
	const locale = useSyncExternalStore(
		subscribeToLocale,
		getClientLocaleSnapshot,
		getServerLocaleSnapshot,
	);

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEY, locale);
		document.documentElement.lang = locale;
	}, [locale]);

	const value = useMemo(
		() => ({
			locale,
			setLocale: updateLocale,
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

function subscribeToLocale(callback: () => void) {
	if (typeof window === "undefined") {
		return () => {};
	}

	const handleStorage = () => callback();
	const handleCustomEvent = () => callback();

	window.addEventListener("storage", handleStorage);
	window.addEventListener(LOCALE_EVENT, handleCustomEvent);

	return () => {
		window.removeEventListener("storage", handleStorage);
		window.removeEventListener(LOCALE_EVENT, handleCustomEvent);
	};
}

function getClientLocaleSnapshot(): Locale {
	const storedLocale = window.localStorage.getItem(STORAGE_KEY);
	return storedLocale && isLocale(storedLocale) ? storedLocale : defaultLocale;
}

function getServerLocaleSnapshot(): Locale {
	return defaultLocale;
}

function updateLocale(locale: Locale) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(STORAGE_KEY, locale);
	window.dispatchEvent(new Event(LOCALE_EVENT));
}
