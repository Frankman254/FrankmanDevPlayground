"use client";

import { useEffect } from "react";

import { GOOGLE_FONTS_URL } from "./fonts";

const LINK_ID = "qr-editor-google-fonts";

export function useFontsLoader(): void {
  useEffect(() => {
    if (document.getElementById(LINK_ID)) return;
    const link = document.createElement("link");
    link.id = LINK_ID;
    link.rel = "stylesheet";
    link.href = GOOGLE_FONTS_URL;
    document.head.appendChild(link);
  }, []);
}
