import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useServerFn } from "@tanstack/react-start";
import { interpretSign } from "@/utils/asl.functions";
import { useSpeech } from "@/hooks/useSpeech";
import { classifyASL, type Landmark } from "@/lib/aslClassifier";
import { Camera, CameraOff, Volume2, Eraser, Sparkles, Hand } from "lucide-react";
import { toast } from "sonner";

// MediaPipe Hands loaded from CDN
const MEDIAPIPE_VERSION = "0.4.1675469240";
const HANDS_SCRIPT = `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${MEDIAPIPE_VERSION}/hands.js`;

declare global {
  interface Window {
    Hands?: any;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.crossOrigin = "anonymous";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

const HOLD_FRAMES = 8; // letter must persist this many frames to commit
const SPACE_PAUSE_MS = 1500; // no detection for this long → finalize word

export function ASLDetector() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handsRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const lastDetectionRef = useRef<number>(Date.now());
  const stableLetterRef = useRef<{ letter: string; count: number }>({
    letter: "",
    count: 0,
  });

  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentLetter, setCurrentLetter] = useState<string>("");
  const [confidence, setConfidence] = useState(0);
  const [word, setWord] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [interpretLoading, setInterpretLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string>("");

  const { speak, supported: speechSupported } = useSpeech();
  const interpretFn = useServerFn(interpretSign);

  const finalizeWord = useCallback(() => {
    setWord((w) => {
      const trimmed = w.trim();
      if (trimmed) {
        setHistory((h) => [trimmed, ...h].slice(0, 8));
        speak(trimmed);
      }
      return "";
    });
  }, [speak]);

  // Idle pause -> finalize word
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      if (Date.now() - lastDetectionRef.current > SPACE_PAUSE_MS && word.length > 0) {
        finalizeWord();
      }
    }, 400);
    return () => clearInterval(id);
  }, [active, word, finalizeWord]);

  const handleResults = useCallback(
    (results: any) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // mirror
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      const landmarksList = results.multiHandLandmarks as Landmark[][] | undefined;
      if (landmarksList && landmarksList.length > 0) {
        const lm = landmarksList[0];

        // draw landmarks
        ctx.fillStyle = "oklch(0.85 0.15 175)";
        ctx.strokeStyle = "oklch(0.78 0.18 195)";
        ctx.lineWidth = 2;
        for (const p of lm) {
          ctx.beginPath();
          ctx.arc(p.x * canvas.width, p.y * canvas.height, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        // simple skeleton lines
        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 4],
          [0, 5], [5, 6], [6, 7], [7, 8],
          [5, 9], [9, 10], [10, 11], [11, 12],
          [9, 13], [13, 14], [14, 15], [15, 16],
          [13, 17], [17, 18], [18, 19], [19, 20],
          [0, 17],
        ];
        ctx.beginPath();
        for (const [a, b] of connections) {
          ctx.moveTo(lm[a].x * canvas.width, lm[a].y * canvas.height);
          ctx.lineTo(lm[b].x * canvas.width, lm[b].y * canvas.height);
        }
        ctx.stroke();

        const result = classifyASL(lm);
        if (result) {
          setCurrentLetter(result.letter);
          setConfidence(result.confidence);
          lastDetectionRef.current = Date.now();

          // Stability tracking: same letter for HOLD_FRAMES → commit
          const stable = stableLetterRef.current;
          if (result.letter === stable.letter) {
            stable.count++;
          } else {
            stableLetterRef.current = { letter: result.letter, count: 1 };
          }

          if (stableLetterRef.current.count === HOLD_FRAMES) {
            const L = result.letter;
            if (L === "SPACE") {
              finalizeWord();
            } else if (L !== "?" && L.length === 1) {
              setWord((w) => (w + L).slice(0, 30));
            }
          }
        }
      } else {
        setCurrentLetter("");
        setConfidence(0);
        stableLetterRef.current = { letter: "", count: 0 };
      }

      ctx.restore();
    },
    [finalizeWord],
  );

  const start = useCallback(async () => {
    setLoading(true);
    try {
      await loadScript(HANDS_SCRIPT);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();

      const Hands = window.Hands;
      const hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${MEDIAPIPE_VERSION}/${file}`,
      });
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5,
      });
      hands.onResults(handleResults);
      handsRef.current = hands;

      const loop = async () => {
        if (!handsRef.current || !videoRef.current) return;
        if (videoRef.current.readyState >= 2) {
          await handsRef.current.send({ image: videoRef.current });
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
      setActive(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Could not access camera");
    } finally {
      setLoading(false);
    }
  }, [handleResults]);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (handsRef.current?.close) handsRef.current.close();
    handsRef.current = null;
    const video = videoRef.current;
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
    setActive(false);
    setCurrentLetter("");
  }, []);

  useEffect(() => {
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInterpret = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !active) {
      toast.error("Start the camera first");
      return;
    }
    setInterpretLoading(true);
    setAiResult("");
    try {
      const tmp = document.createElement("canvas");
      tmp.width = video.videoWidth;
      tmp.height = video.videoHeight;
      const tctx = tmp.getContext("2d")!;
      // mirror so the AI sees what user sees
      tctx.translate(tmp.width, 0);
      tctx.scale(-1, 1);
      tctx.drawImage(video, 0, 0, tmp.width, tmp.height);
      const dataUrl = tmp.toDataURL("image/jpeg", 0.8);

      const res = await interpretFn({ data: { imageBase64: dataUrl } });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      const text = res.interpretation || "Unclear";
      setAiResult(text);
      speak(text);
    } catch (err: any) {
      console.error(err);
      toast.error("AI request failed");
    } finally {
      setInterpretLoading(false);
    }
  }, [active, interpretFn, speak]);

  const clearWord = () => {
    setWord("");
    stableLetterRef.current = { letter: "", count: 0 };
  };

  const speakWord = () => {
    if (word.trim()) speak(word.trim());
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
      {/* Video panel */}
      <Card className="relative overflow-hidden border-border/50 bg-card/60 p-4 shadow-card backdrop-blur">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted/40">
          <video ref={videoRef} className="hidden" playsInline muted />
          <canvas
            ref={canvasRef}
            className="h-full w-full object-cover"
            style={{ background: "oklch(0.18 0.02 260)" }}
          />
          {!active && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
                <Hand className="h-10 w-10 text-primary-foreground" />
              </div>
              <p className="text-lg font-semibold text-foreground">
                Camera is off
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Click "Start camera" to begin detecting ASL hand signs in real time.
              </p>
            </div>
          )}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <p className="text-sm text-muted-foreground animate-pulse">
                Loading hand tracking model…
              </p>
            </div>
          )}
          {active && currentLetter && currentLetter !== "?" && (
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-background/80 px-4 py-2 backdrop-blur">
              <span className="text-2xl font-bold text-gradient-primary">
                {currentLetter === "SPACE" ? "␣" : currentLetter}
              </span>
              <Badge variant="secondary" className="text-xs">
                {Math.round(confidence * 100)}%
              </Badge>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {!active ? (
            <Button
              onClick={start}
              disabled={loading}
              size="lg"
              className="bg-gradient-primary text-primary-foreground shadow-glow transition-smooth hover:shadow-glow"
            >
              <Camera className="mr-2 h-4 w-4" />
              Start camera
            </Button>
          ) : (
            <Button onClick={stop} variant="secondary" size="lg">
              <CameraOff className="mr-2 h-4 w-4" />
              Stop
            </Button>
          )}
          <Button
            onClick={handleInterpret}
            disabled={!active || interpretLoading}
            variant="outline"
            size="lg"
            className="border-accent/40 hover:bg-accent/10"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {interpretLoading ? "Asking AI…" : "Interpret with AI"}
          </Button>
        </div>
      </Card>

      {/* Right: word builder + history */}
      <div className="flex flex-col gap-4">
        <Card className="border-border/50 bg-card/60 p-5 shadow-card backdrop-blur">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Building word
          </p>
          <div className="mt-2 min-h-[3rem] break-all text-3xl font-bold text-gradient-primary">
            {word || <span className="text-muted-foreground/40">—</span>}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Pause for ~1.5s or sign an open hand (5) to finalize and speak.
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={speakWord}
              disabled={!word || !speechSupported}
              size="sm"
              variant="secondary"
              className="flex-1"
            >
              <Volume2 className="mr-2 h-4 w-4" />
              Speak
            </Button>
            <Button onClick={clearWord} disabled={!word} size="sm" variant="ghost">
              <Eraser className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </Card>

        {aiResult && (
          <Card className="border-accent/30 bg-accent/5 p-5 shadow-card backdrop-blur animate-pulse-glow">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <p className="text-xs font-medium uppercase tracking-wider text-accent">
                AI interpretation
              </p>
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">{aiResult}</p>
          </Card>
        )}

        <Card className="border-border/50 bg-card/60 p-5 shadow-card backdrop-blur">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Recent words
          </p>
          {history.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground/60">
              Spoken words will appear here.
            </p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2">
              {history.map((w, i) => (
                <li key={i}>
                  <button
                    onClick={() => speak(w)}
                    className="rounded-full border border-border/60 bg-secondary/50 px-3 py-1 text-sm transition-smooth hover:bg-secondary hover:border-primary/50"
                  >
                    {w}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {!speechSupported && (
          <p className="text-xs text-destructive">
            Your browser doesn't support text-to-speech.
          </p>
        )}
      </div>
    </div>
  );
}
