import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ASL_ALPHABET, COMMON_PHRASES, type SignGuide } from "@/lib/aslGuide";
import {
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  Hand,
  MessageCircle,
  Send,
} from "lucide-react";
import { toast } from "sonner";

// Build a quick lookup so we can match either single letters or whole phrases
// (e.g. "HELLO", "THANK YOU") to a SignGuide entry with a hand illustration.
const SIGN_LOOKUP: Record<string, SignGuide> = (() => {
  const map: Record<string, SignGuide> = {};
  for (const s of ASL_ALPHABET) map[s.letter.toUpperCase()] = s;
  for (const s of COMMON_PHRASES) map[s.letter.toUpperCase()] = s;
  return map;
})();

// Phrases (multi-word keys like "THANK YOU") that we should try to match
// before falling back to letter-by-letter fingerspelling.
const PHRASE_KEYS = COMMON_PHRASES
  .map((p) => p.letter.toUpperCase())
  .sort((a, b) => b.length - a.length); // longest first so "I LOVE YOU" wins over "I"

type SignToken =
  | { kind: "sign"; key: string; sign: SignGuide }
  | { kind: "space" }
  | { kind: "unknown"; char: string };

/**
 * Convert raw text into a sequence of signable tokens.
 * - First tries to match known phrases (HELLO, THANK YOU, I LOVE YOU…)
 * - Then falls back to fingerspelling each letter A–Z
 * - Spaces become explicit pauses; unknown chars are kept so the caller can skip them
 */
function tokenizeForSigning(input: string): SignToken[] {
  const text = input.toUpperCase().trim();
  if (!text) return [];

  const tokens: SignToken[] = [];
  let i = 0;

  while (i < text.length) {
    // Skip extra spaces but emit one pause token between words
    if (text[i] === " ") {
      tokens.push({ kind: "space" });
      while (i < text.length && text[i] === " ") i++;
      continue;
    }

    // Try to match a known phrase starting at this position
    let matchedPhrase: string | null = null;
    for (const key of PHRASE_KEYS) {
      if (text.startsWith(key, i)) {
        // make sure it ends on a word boundary
        const after = text[i + key.length];
        if (after === undefined || after === " ") {
          matchedPhrase = key;
          break;
        }
      }
    }

    if (matchedPhrase) {
      tokens.push({
        kind: "sign",
        key: matchedPhrase,
        sign: SIGN_LOOKUP[matchedPhrase]!,
      });
      i += matchedPhrase.length;
      continue;
    }

    const ch = text[i];
    if (ch >= "A" && ch <= "Z" && SIGN_LOOKUP[ch]) {
      tokens.push({ kind: "sign", key: ch, sign: SIGN_LOOKUP[ch] });
    } else {
      tokens.push({ kind: "unknown", char: ch });
    }
    i++;
  }

  return tokens;
}

// Filtered list of tokens we actually animate through (signs + spaces only).
function getPlayableTokens(tokens: SignToken[]): SignToken[] {
  return tokens.filter((t) => t.kind === "sign" || t.kind === "space");
}

// Minimal type for the Web Speech Recognition API since TS lib doesn't include it.
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognitionCtor():
  | (new () => SpeechRecognitionLike)
  | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function SpeechToSign() {
  const [text, setText] = useState("");
  const [draft, setDraft] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speedMs, setSpeedMs] = useState(900); // ms per sign
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tokens = useMemo(() => tokenizeForSigning(text), [text]);
  const playable = useMemo(() => getPlayableTokens(tokens), [tokens]);
  const speechSupported = useMemo(() => getSpeechRecognitionCtor() !== null, []);

  const stopPlayback = useCallback(() => {
    if (playTimerRef.current) {
      clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const resetAll = useCallback(() => {
    stopPlayback();
    setCurrentIndex(0);
    setText("");
    setDraft("");
  }, [stopPlayback]);

  // Step the playback forward one token at a time
  useEffect(() => {
    if (!isPlaying) return;
    if (playable.length === 0) {
      setIsPlaying(false);
      return;
    }
    if (currentIndex >= playable.length) {
      setIsPlaying(false);
      return;
    }
    const token = playable[currentIndex];
    // Spaces are slightly longer to make word boundaries readable
    const delay = token.kind === "space" ? Math.round(speedMs * 0.6) : speedMs;
    playTimerRef.current = setTimeout(() => {
      setCurrentIndex((i) => i + 1);
    }, delay);
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, currentIndex, playable, speedMs]);

  const handlePlay = useCallback(() => {
    if (playable.length === 0) {
      toast.error("Type or speak something first.");
      return;
    }
    if (currentIndex >= playable.length) setCurrentIndex(0);
    setIsPlaying(true);
  }, [playable.length, currentIndex]);

  const handlePause = useCallback(() => stopPlayback(), [stopPlayback]);

  const handleSubmitDraft = useCallback(() => {
    const v = draft.trim();
    if (!v) return;
    setText(v);
    setCurrentIndex(0);
    setIsPlaying(true);
  }, [draft]);

  // --- Speech recognition wiring ---
  const startListening = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      toast.error(
        "Voice input isn't supported in this browser. Try Chrome or Edge, or type instead.",
      );
      return;
    }
    try {
      const rec = new Ctor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      let finalText = "";
      rec.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript + " ";
          } else {
            interim += result[0].transcript;
          }
        }
        const combined = (finalText + interim).trim();
        setDraft(combined);
        setText(combined);
        setCurrentIndex(0);
      };
      rec.onerror = (event: any) => {
        console.warn("SpeechRecognition error", event);
        if (event?.error === "not-allowed") {
          toast.error("Microphone access was denied.");
        }
        setIsListening(false);
      };
      rec.onend = () => {
        setIsListening(false);
      };
      rec.start();
      recognitionRef.current = rec;
      setIsListening(true);
      stopPlayback();
      toast.success("Listening… speak naturally.");
    } catch (err) {
      console.error(err);
      toast.error("Could not start the microphone.");
    }
  }, [stopPlayback]);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      // no-op
    }
    setIsListening(false);
    // Auto-play once they stop talking, if we have something
    if (text.trim()) {
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  }, [text]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        // no-op
      }
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, []);

  const currentToken = playable[currentIndex];
  const progress =
    playable.length === 0
      ? 0
      : Math.min(100, Math.round((currentIndex / playable.length) * 100));

  return (
    <Card className="border-border/50 bg-card/40 p-6 shadow-card backdrop-blur">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Speech → Sign
            </h3>
            <p className="text-xs text-muted-foreground">
              Speak or type, and we'll show the ASL signs and large captions for
              a deaf or mute person to read.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {speechSupported ? (
            isListening ? (
              <Button onClick={stopListening} variant="destructive">
                <MicOff className="mr-2 h-4 w-4" />
                Stop listening
              </Button>
            ) : (
              <Button onClick={startListening} variant="default">
                <Mic className="mr-2 h-4 w-4" />
                Speak
              </Button>
            )
          ) : (
            <Badge variant="secondary">Voice not supported — type below</Badge>
          )}
        </div>
      </div>

      {/* Big caption + sign display */}
      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 rounded-2xl border border-border/40 bg-sign-surface p-6">
          {currentToken?.kind === "sign" ? (
            <>
              {currentToken.sign.imageUrl ? (
                <img
                  src={currentToken.sign.imageUrl}
                  alt={`ASL sign for ${currentToken.key}`}
                  className="h-44 w-44 object-contain"
                />
              ) : (
                <div className="flex h-44 w-44 flex-col items-center justify-center gap-2 text-sign-foreground">
                  <Hand className="h-20 w-20 stroke-[1.5]" />
                  {currentToken.sign.motion && (
                    <Badge variant="secondary" className="text-[10px]">
                      motion
                    </Badge>
                  )}
                </div>
              )}
              <div className="text-center">
                <div className="text-3xl font-black tracking-wide text-foreground">
                  {currentToken.key}
                </div>
                <p className="mt-1 max-w-md text-xs text-muted-foreground">
                  {currentToken.sign.shape}
                </p>
              </div>
            </>
          ) : currentToken?.kind === "space" ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="h-1 w-24 rounded-full bg-muted-foreground/30" />
              <span className="text-xs uppercase tracking-widest">
                word break
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
              <Hand className="h-12 w-12 opacity-50" />
              <p className="max-w-xs text-sm">
                Tap <strong>Speak</strong> or type a message below, then press{" "}
                <strong>Play</strong> to show the signs.
              </p>
            </div>
          )}
        </div>

        {/* Side panel: live caption + controls */}
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-border/40 bg-muted/30 p-3">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Caption (read this)
            </div>
            <p className="min-h-16 text-2xl font-bold leading-tight text-foreground">
              {text || (
                <span className="text-base font-normal text-muted-foreground">
                  Waiting for speech…
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isPlaying ? (
              <Button onClick={handlePause} variant="secondary" className="flex-1">
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            ) : (
              <Button onClick={handlePlay} className="flex-1" disabled={playable.length === 0}>
                <Play className="mr-2 h-4 w-4" />
                {currentIndex >= playable.length && playable.length > 0
                  ? "Replay"
                  : "Play signs"}
              </Button>
            )}
            <Button onClick={resetAll} variant="ghost" size="icon" aria-label="Reset">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Speed</span>
              <span>{(speedMs / 1000).toFixed(1)}s / sign</span>
            </div>
            <Slider
              value={[speedMs]}
              min={350}
              max={1800}
              step={50}
              onValueChange={(v) => setSpeedMs(v[0])}
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>
                {Math.min(currentIndex, playable.length)} / {playable.length}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-gradient-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Manual input fallback */}
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmitDraft();
          }}
          placeholder="Or type a message to sign — e.g. 'Hello, thank you'"
          className="flex-1"
        />
        <Button onClick={handleSubmitDraft} variant="secondary">
          <Send className="mr-2 h-4 w-4" />
          Sign it
        </Button>
      </div>

      {/* Mini preview strip */}
      {playable.length > 0 && (
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {playable.map((t, idx) => {
            const isActive = idx === currentIndex;
            if (t.kind === "space") {
              return (
                <div
                  key={`sp-${idx}`}
                  className={`flex h-16 w-6 shrink-0 items-center justify-center rounded-md border ${
                    isActive ? "border-primary" : "border-border/40"
                  }`}
                  aria-hidden
                >
                  <div className="h-0.5 w-3 rounded-full bg-muted-foreground/40" />
                </div>
              );
            }
            return (
              <button
                key={`tk-${idx}-${t.key}`}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsPlaying(false);
                }}
                className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-md border bg-sign-surface transition-smooth ${
                  isActive
                    ? "border-primary shadow-glow"
                    : "border-border/40 hover:border-primary/40"
                }`}
                title={t.sign.shape}
              >
                {t.sign.imageUrl ? (
                  <img
                    src={t.sign.imageUrl}
                    alt={t.key}
                    className="h-10 w-10 object-contain"
                  />
                ) : (
                  <Hand className="h-6 w-6 text-sign-foreground" />
                )}
                <span className="text-[9px] font-bold text-foreground">
                  {t.key.length > 6 ? t.key.slice(0, 5) + "…" : t.key}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-4 rounded-lg border border-border/40 bg-muted/30 p-3 text-xs text-muted-foreground">
        💡 Whole-word signs like <strong>HELLO</strong>, <strong>THANK YOU</strong>,
        and <strong>I LOVE YOU</strong> are matched directly. Other words are
        fingerspelled letter by letter. Voice input requires Chrome, Edge, or
        Safari with microphone access.
      </p>
    </Card>
  );
}
