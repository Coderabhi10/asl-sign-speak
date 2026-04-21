import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSpeech } from "@/hooks/useSpeech";
import { ASL_ALPHABET, COMMON_PHRASES, type SignGuide } from "@/lib/aslGuide";
import { Search, Volume2, BookOpen, Hand } from "lucide-react";

function SignIllustration({ sign }: { sign: SignGuide }) {
  const [failed, setFailed] = useState(false);

  if (sign.imageUrl && !failed) {
    return (
      <img
        src={sign.imageUrl}
        alt={`ASL hand sign for ${sign.letter}`}
        loading="lazy"
        className="h-full w-full object-contain p-3"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center text-slate-900">
      <Hand className="h-16 w-16 stroke-[1.75]" />
      <span className="text-4xl font-black leading-none">{sign.letter.slice(0, 3)}</span>
    </div>
  );
}

function SignCard({ sign, onSpeak }: { sign: SignGuide; onSpeak: (t: string) => void }) {
  return (
    <Card className="group flex flex-col gap-3 border-border/50 bg-card/60 p-4 shadow-card backdrop-blur transition-smooth hover:border-primary/40 hover:shadow-glow">
      <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-border/40">
        <SignIllustration sign={sign} />
        <span className="absolute left-2 top-2 rounded-md bg-slate-900/80 px-2 py-0.5 text-xs font-bold text-white backdrop-blur">
          {sign.letter}
        </span>
        {sign.motion && (
          <Badge
            variant="secondary"
            className="absolute right-2 top-2 text-[10px]"
          >
            motion
          </Badge>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="absolute bottom-1 right-1 h-8 w-8 bg-slate-900/55 text-white opacity-90 backdrop-blur transition-smooth hover:bg-slate-900/75 hover:text-white"
          onClick={() => onSpeak(sign.letter.replace(/_/g, " "))}
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
        💡 Tip: Tap the speaker icon on any card to hear the word aloud while you
        practice the handshape. Signs marked <Badge variant="secondary" className="mx-1 text-[10px]">motion</Badge>
        require movement and won't be detected by the static letter classifier.
      </p>
    </Card>
  );
}
