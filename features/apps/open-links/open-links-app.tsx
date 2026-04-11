"use client";

import {
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ChangeEvent,
} from "react";
import {
  ExternalLink,
  FileText,
  ImageIcon,
  List,
  ChevronRight,
  Clock,
  Bookmark,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ─── helpers ─────────────────────────────────────────────────────────────────
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── patterns ────────────────────────────────────────────────────────────────
const URL_PATTERN = /^https?:\/\//i;
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|svg|bmp|avif)(\?.*)?$/i;

// ─── localStorage hook (SSR-safe) ────────────────────────────────────────────
function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [state, setState] = useState<T>(initial);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        // eslint-disable-next-line react/no-did-mount-set-state
        setState(JSON.parse(raw) as T);
      }
    } catch {
      // ignore
    }
  }, [key]);

  const set = useCallback(
    (v: T) => {
      setState(v);
      try {
        window.localStorage.setItem(key, JSON.stringify(v));
      } catch {}
    },
    [key]
  );

  return [state, set];
}

// ─── types ────────────────────────────────────────────────────────────────────
interface RecentSession {
  urls: string[];
  timestamp: number;
}

interface SavedCollection {
  id: string;
  name: string;
  urls: string[];
  createdAt: number;
}

type Tab = "input" | "history" | "saved";
type ViewMode = "list" | "gallery" | "queue";

// ─── component ────────────────────────────────────────────────────────────────
export function OpenLinksApp({ className }: { className?: string }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("input");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [queueIndex, setQueueIndex] = useState(0);
  const [saveName, setSaveName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [recentSessions, setRecentSessions] = useLocalStorage<RecentSession[]>(
    "open-links-recent",
    []
  );
  const [savedCollections, setSavedCollections] = useLocalStorage<
    SavedCollection[]
  >("open-links-saved", []);

  // ─── derived ────────────────────────────────────────────────────────────────
  const urls = useMemo(
    () =>
      input
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => URL_PATTERN.test(l)),
    [input]
  );

  const imageUrls = useMemo(
    () => urls.filter((u) => IMAGE_EXT.test(u)),
    [urls]
  );

  // ─── helpers ────────────────────────────────────────────────────────────────
  function addToRecent(list: string[]) {
    const entry: RecentSession = { urls: list, timestamp: Date.now() };
    const deduped = recentSessions.filter(
      (s) => s.urls.join("\n") !== list.join("\n")
    );
    setRecentSessions([entry, ...deduped].slice(0, 10));
  }

  function handleInput(value: string) {
    setInput(value);
    setError(null);
    setViewMode("list");
    setQueueIndex(0);
  }

  function loadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    // reset so the same file can be loaded again
    event.target.value = "";

    const reader = new FileReader();
    reader.onload = () => {
      handleInput(String(reader.result ?? ""));
    };
    reader.readAsText(file, "utf-8");
  }

  /**
   * THE FIX: window.open() must be called synchronously within the user-gesture
   * event handler.  setTimeout breaks that chain — the browser treats subsequent
   * calls as unsolicited popups and blocks them.
   *
   * Strategy:
   *  1. Open the FIRST url immediately (still inside the event handler).
   *  2. Switch to queue mode so the user drives each remaining tab open with a
   *     dedicated button click (every click is a fresh user gesture → no blocking).
   */
  function handleOpenAll() {
    if (urls.length === 0) {
      setError("Ingresa URLs válidas que comiencen con http:// o https://.");
      return;
    }
    setError(null);
    addToRecent(urls);
    // open the first URL right now — this is a direct user gesture
    window.open(urls[0], "_blank", "noopener,noreferrer");

    if (urls.length > 1) {
      setViewMode("queue");
      setQueueIndex(1);
    } else {
      setViewMode("list");
      setQueueIndex(0);
    }
  }

  function openNext() {
    if (queueIndex >= urls.length) return;
    // Each click of this button is a user gesture → always allowed
    window.open(urls[queueIndex], "_blank", "noopener,noreferrer");
    setQueueIndex((prev) => prev + 1);
  }

  function openSingle(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function loadSession(session: RecentSession) {
    handleInput(session.urls.join("\n"));
    setTab("input");
  }

  function loadCollection(col: SavedCollection) {
    handleInput(col.urls.join("\n"));
    setTab("input");
  }

  function saveCollection() {
    if (!saveName.trim() || urls.length === 0) return;
    const col: SavedCollection = {
      id: generateId(),
      name: saveName.trim(),
      urls,
      createdAt: Date.now(),
    };
    setSavedCollections([col, ...savedCollections]);
    setSaveName("");
    setShowSaveInput(false);
  }

  function deleteCollection(id: string) {
    setSavedCollections(savedCollections.filter((c) => c.id !== id));
  }

  const queueDone = viewMode === "queue" && queueIndex >= urls.length;

  // ─── render ─────────────────────────────────────────────────────────────────
  return (
    <div className={cn("space-y-6", className)}>
      {/* tabs */}
      <div className="flex gap-2 flex-wrap">
        {(
          [
            { id: "input", label: "Entrada", icon: null },
            {
              id: "history",
              label: `Recientes${recentSessions.length ? ` (${recentSessions.length})` : ""}`,
              icon: <Clock className="size-3.5" />,
            },
            {
              id: "saved",
              label: `Guardados${savedCollections.length ? ` (${savedCollections.length})` : ""}`,
              icon: <Bookmark className="size-3.5" />,
            },
          ] as const
        ).map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition",
              tab === id
                ? "bg-[#F5C400] text-black"
                : "border border-white/10 text-[#F7F3EB]/60 hover:border-white/20 hover:text-white"
            )}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* ── INPUT TAB ─────────────────────────────────────────────────────── */}
      {tab === "input" && (
        <Card className="space-y-6 p-6 sm:p-8">
          <p className="text-sm text-slate-400">
            Pega URLs o carga un archivo de texto. El primer enlace se abre
            inmediatamente; los demás se abren uno a uno para evitar el bloqueo
            de popups del navegador.
          </p>

          <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
            {/* textarea */}
            <textarea
              className="h-72 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm text-white outline-none transition focus:border-slate-400"
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              placeholder={
                "https://example.com/image1.jpg\nhttps://example.com/image2.png\nhttps://another.site"
              }
            />

            {/* sidebar controls */}
            <div className="flex flex-col gap-3">
              {/* file loader */}
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-[0.98]">
                <FileText className="size-4 shrink-0" />
                Cargar archivo
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.csv,.log,.md,.text"
                  className="sr-only"
                  onChange={loadFile}
                />
              </label>
              <p className="text-center text-[11px] text-slate-500">
                .txt · .csv · .log · .md
              </p>

              {/* stats */}
              {urls.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm">
                  <p className="font-medium text-white">
                    {urls.length} URL{urls.length !== 1 ? "s" : ""} detectada
                    {urls.length !== 1 ? "s" : ""}
                  </p>
                  {imageUrls.length > 0 && (
                    <p className="mt-1 text-slate-400">
                      {imageUrls.length} parecen imágenes
                    </p>
                  )}
                </div>
              )}

              {/* view mode toggle (images) */}
              {imageUrls.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Vista
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { mode: "list", Icon: List, label: "Lista" },
                        {
                          mode: "gallery",
                          Icon: ImageIcon,
                          label: "Galería",
                        },
                      ] as const
                    ).map(({ mode, Icon, label }) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition",
                          viewMode === mode
                            ? "border border-[#F5C400]/30 bg-[#F5C400]/10 text-[#F5C400]"
                            : "border border-white/10 text-slate-400 hover:text-white"
                        )}
                      >
                        <Icon className="size-3" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleOpenAll}
                className="w-full"
                disabled={urls.length === 0}
              >
                {urls.length <= 1
                  ? "Abrir enlace"
                  : `Abrir (${urls.length} en cola)`}
              </Button>

              {/* save collection */}
              {urls.length > 0 && (
                <>
                  {!showSaveInput ? (
                    <button
                      onClick={() => setShowSaveInput(true)}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-400 transition hover:border-white/20 hover:text-white"
                    >
                      <Bookmark className="size-4" />
                      Guardar colección
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveCollection();
                          if (e.key === "Escape") {
                            setShowSaveInput(false);
                            setSaveName("");
                          }
                        }}
                        placeholder="Nombre…"
                        className="flex-1 min-w-0 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-slate-400"
                      />
                      <button
                        onClick={saveCollection}
                        disabled={!saveName.trim()}
                        className="rounded-xl border border-[#F5C400]/30 bg-[#F5C400]/10 px-3 py-2 text-xs font-semibold text-[#F5C400] transition hover:bg-[#F5C400]/20 disabled:opacity-40"
                      >
                        OK
                      </button>
                      <button
                        onClick={() => {
                          setShowSaveInput(false);
                          setSaveName("");
                        }}
                        className="rounded-xl border border-white/10 px-3 py-2 text-slate-400 transition hover:text-white"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          {/* ── QUEUE PANEL ──────────────────────────────────────────────── */}
          {viewMode === "queue" && !queueDone && urls.length > 0 && (
            <div className="rounded-2xl border border-[#F5C400]/25 bg-[#F5C400]/5 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#F5C400]">
                  Cola secuencial — {queueIndex}/{urls.length} abiertos
                </p>
                <button
                  onClick={() => {
                    setViewMode("list");
                    setQueueIndex(0);
                  }}
                  className="text-xs text-slate-500 transition hover:text-white"
                >
                  Salir de cola
                </button>
              </div>

              <p className="truncate text-sm text-slate-300">
                <span className="text-slate-500">Siguiente: </span>
                {urls[queueIndex]}
              </p>

              {/* progress */}
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#F5C400] transition-all duration-300"
                  style={{ width: `${(queueIndex / urls.length) * 100}%` }}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={openNext} className="flex-1 gap-1.5">
                  Abrir siguiente
                  <ChevronRight className="size-4" />
                </Button>
                <button
                  onClick={() =>
                    setQueueIndex((prev) => Math.min(prev + 1, urls.length))
                  }
                  className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-400 transition hover:border-white/20 hover:text-white"
                >
                  Saltar
                </button>
              </div>
            </div>
          )}

          {queueDone && (
            <p className="text-sm font-medium text-emerald-400">
              Todos los enlaces fueron abiertos.
            </p>
          )}

          {/* ── URL LIST ─────────────────────────────────────────────────── */}
          {viewMode === "list" && urls.length > 0 && (
            <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
              {urls.map((url, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-white/6 bg-slate-950/40 px-4 py-2.5"
                >
                  <span className="w-5 shrink-0 text-right text-xs tabular-nums text-slate-600">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-sm text-slate-300">
                    {url}
                  </span>
                  <button
                    onClick={() => openSingle(url)}
                    title="Abrir en nueva pestaña"
                    className="shrink-0 text-slate-600 transition hover:text-[#F5C400]"
                  >
                    <ExternalLink className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── GALLERY ──────────────────────────────────────────────────── */}
          {viewMode === "gallery" && imageUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {imageUrls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-slate-900"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Imagen ${i + 1}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement;
                      el.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition group-hover:opacity-100">
                    <ExternalLink className="size-5 text-white drop-shadow" />
                  </div>
                  <span className="absolute bottom-1.5 right-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                    {i + 1}
                  </span>
                </a>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── HISTORY TAB ───────────────────────────────────────────────────── */}
      {tab === "history" && (
        <Card className="space-y-4 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">
              Últimas sesiones
            </p>
            {recentSessions.length > 0 && (
              <button
                onClick={() => setRecentSessions([])}
                className="text-xs text-slate-500 transition hover:text-rose-400"
              >
                Limpiar historial
              </button>
            )}
          </div>

          {recentSessions.length === 0 ? (
            <p className="text-sm text-slate-500">
              Sin historial aún. Abre algunos enlaces primero.
            </p>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session, i) => (
                <button
                  key={i}
                  onClick={() => loadSession(session)}
                  className="w-full rounded-2xl border border-white/10 p-4 text-left transition hover:border-white/20"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">
                      {session.urls.length} enlace
                      {session.urls.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(session.timestamp).toLocaleDateString("es", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {session.urls[0]}
                  </p>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── SAVED TAB ─────────────────────────────────────────────────────── */}
      {tab === "saved" && (
        <Card className="space-y-4 p-6 sm:p-8">
          <p className="text-sm font-medium text-white">
            Colecciones guardadas
          </p>

          {savedCollections.length === 0 ? (
            <p className="text-sm text-slate-500">
              Sin colecciones. Ve a la pestaña Entrada, pega tus URLs y
              guárdalas con un nombre.
            </p>
          ) : (
            <div className="space-y-3">
              {savedCollections.map((col) => (
                <div
                  key={col.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {col.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {col.urls.length} enlace
                      {col.urls.length !== 1 ? "s" : ""} ·{" "}
                      {new Date(col.createdAt).toLocaleDateString("es", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => loadCollection(col)}
                    className="shrink-0 rounded-xl border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition hover:border-white/20 hover:text-white"
                  >
                    Cargar
                  </button>
                  <button
                    onClick={() => deleteCollection(col.id)}
                    className="shrink-0 text-slate-500 transition hover:text-rose-400"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
