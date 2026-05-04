import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSpeech } from "@/hooks/useSpeech";
import { ASL_ALPHABET, COMMON_PHRASES, type SignGuide } from "@/lib/aslGuide";
import { Search, Volume2, BookOpen, Hand, Play, Pause, RotateCcw } from "lucide-react";

function SignIllustration({
  sign,
  playing,
  animKey,
}: {
  sign: SignGuide;
  playing: boolean;
  animKey: number;
}) {
  const [stillFailed, setStillFailed] = useState(false);
  const [animFailed, setAnimFailed] = useState(false);

  const canAnimate = !!sign.animUrl && !animFailed;
  const canStill = !!sign.imageUrl && !stillFailed;

  // When user presses play, show the animated SVG. Otherwise prefer still image.
  if (playing && canAnimate) {
    return (
      <img
        key={`anim-${animKey}`}
        src={sign.animUrl}
        alt={`Animated demo of the sign for ${sign.letter}`}
        loading="lazy"
        className="h-full w-full object-contain"
        onError={() => setAnimFailed(true)}
      />
    );
  }

  if (canStill) {
    return (
      <img
        src={sign.imageUrl}
        alt={`Hand sign for ${sign.letter}`}
        loading="lazy"
        className="h-full w-full object-contain p-3"
        onError={() => setStillFailed(true)}
      />
    );
  }

  if (canAnimate) {
    return (
      <img
        key={`anim-default-${animKey}`}
        src={sign.animUrl}
        alt={`Animated demo of the sign for ${sign.letter}`}
        loading="lazy"
        className="h-full w-full object-contain"
        onError={() => setAnimFailed(true)}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center text-sign-foreground">
      <Hand className="h-16 w-16 stroke-[1.75]" />
      <span className="text-4xl font-black leading-none">{sign.letter.slice(0, 3)}</span>
    </div>
  );
}

function SignCard({ sign, onSpeak }: { sign: SignGuide; onSpeak: (t: string) => void }) {
  const [playing, setPlaying] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasAnim = !!sign.animUrl;
  const label = sign.letter.replace(/_/g, " ");

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const startPlayback = () => {
    if (!hasAnim) return;
    setAnimKey((k) => k + 1);
    setPlaying(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    // Auto-stop after a few loops so the still image returns.
    timerRef.current = setTimeout(() => setPlaying(false), 6000);
  };

  const stopPlayback = () => {
    setPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleCardActivate = () => {
    // One-tap action: speak + play motion (if any).
    onSpeak(label);
    if (hasAnim) {
      if (playing) stopPlayback();
      else startPlayback();
    }
  };

  const handleCardKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardActivate();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleCardActivate}
      onKeyDown={handleCardKey}
      aria-label={`Play sign for ${label}`}
      className="group flex cursor-pointer flex-col gap-3 border-border/50 bg-card/60 p-4 shadow-card backdrop-blur transition-smooth hover:border-primary/40 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-xl bg-sign-surface ring-1 ring-border/40">
        <SignIllustration sign={sign} playing={playing} animKey={animKey} />
        <span className="absolute left-2 top-2 rounded-md bg-sign-overlay px-2 py-0.5 text-xs font-bold text-sign-overlay-foreground backdrop-blur">
          {sign.letter}
        </span>
        {sign.motion && (
          <Badge
            variant={playing ? "default" : "secondary"}
            className="absolute right-2 top-2 text-[10px]"
          >
            {playing ? "▶ playing" : "motion"}
          </Badge>
        )}

        {hasAnim && (
          <div className="absolute bottom-1 left-1 flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 bg-sign-overlay text-sign-overlay-foreground backdrop-blur hover:bg-sign-overlay/80 hover:text-sign-overlay-foreground"
              onClick={(e) => {
                e.stopPropagation();
                if (playing) stopPlayback();
                else startPlayback();
              }}
              aria-label={playing ? `Pause ${label}` : `Play ${label}`}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            {playing && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 bg-sign-overlay text-sign-overlay-foreground backdrop-blur hover:bg-sign-overlay/80 hover:text-sign-overlay-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  startPlayback();
                }}
                aria-label={`Replay ${label}`}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        <Button
          size="icon"
          variant="ghost"
          className="absolute bottom-1 right-1 h-8 w-8 bg-sign-overlay text-sign-overlay-foreground opacity-90 backdrop-blur transition-smooth hover:bg-sign-overlay/80 hover:text-sign-overlay-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onSpeak(label);
          }}
          aria-label={`Speak ${sign.letter}`}
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{sign.shape}</p>
    </Card>
  );
}

export function ASLGuide() {
  const [query, setQuery] = useState("");
  const { speak } = useSpeech();

  const filteredAlphabet = useMemo(() => {
    if (!query.trim()) return ASL_ALPHABET;
    const q = query.toLowerCase();
    return ASL_ALPHABET.filter(
      (s) => s.letter.toLowerCase().includes(q) || s.shape.toLowerCase().includes(q),
    );
  }, [query]);

  const filteredPhrases = useMemo(() => {
    if (!query.trim()) return COMMON_PHRASES;
    const q = query.toLowerCase();
    return COMMON_PHRASES.filter(
      (s) => s.letter.toLowerCase().includes(q) || s.shape.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Card className="border-border/50 bg-card/40 p-6 shadow-card backdrop-blur">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Sign back to them</h3>
            <p className="text-xs text-muted-foreground">
              Visual guide so you can sign to a deaf or mute person.
            </p>
          </div>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search letter or phrase…"
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="alphabet" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="alphabet">Alphabet (A–Z)</TabsTrigger>
          <TabsTrigger value="phrases">Common phrases</TabsTrigger>
        </TabsList>

        <TabsContent value="alphabet">
          {filteredAlphabet.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No letters match "{query}".
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredAlphabet.map((s) => (
                <SignCard key={s.letter} sign={s} onSpeak={speak} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="phrases">
          {filteredPhrases.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No phrases match "{query}".
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPhrases.map((s) => (
                <SignCard key={s.letter} sign={s} onSpeak={speak} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <p className="mt-5 rounded-lg border border-border/40 bg-muted/30 p-3 text-xs text-muted-foreground">
        💡 Tip: <strong className="text-foreground">Tap any card</strong> to hear the word and
        play the hand-motion animation. Use the ▶ / ⏸ button to control playback, the speaker
        icon to repeat the word, and the ↻ button to replay the motion. Signs marked
        <Badge variant="secondary" className="mx-1 text-[10px]">motion</Badge>
        require movement and won't be detected by the static letter classifier.
      </p>
    </Card>
  );
}
