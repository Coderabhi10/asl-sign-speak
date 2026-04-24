import { createFileRoute } from "@tanstack/react-router";
import { ASLDetector } from "@/components/ASLDetector";
import { ASLGuide } from "@/components/ASLGuide";
import { SpeechToSign } from "@/components/SpeechToSign";
import { Hand, Sparkles, Volume2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "SignSpeak 🇮🇳 — Real-time Sign Language detection with voice" },
      {
        name: "description",
        content:
          "Detect sign language hand gestures from your webcam in real time and hear them spoken aloud. Includes everyday Indian phrases like Namaste.",
      },
      { property: "og:title", content: "SignSpeak — Real-time Sign Language detection" },
      {
        property: "og:description",
        content:
          "Use your webcam to fingerspell letters and have them read aloud instantly — with hover-to-play motion guides for common phrases.",
      },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Hand className="h-5 w-5 text-primary-foreground" />
              <span
                className="absolute -bottom-1 -right-1 text-base leading-none drop-shadow"
                aria-label="India"
                title="Made with an Indian touch"
              >
                🇮🇳
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                SignSpeak <span className="text-base">🇮🇳</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                Sign → Text → Voice · for Bharat & beyond
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-4 text-xs text-muted-foreground md:flex">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              In-browser
            </span>
            <span>Powered by MediaPipe + AI</span>
          </div>
        </div>
        {/* Indian tricolor accent strip */}
        <div className="flex h-1 w-full">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#138808]" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-10 text-center">
          <h2 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Sign with your hands.{" "}
            <span className="text-gradient-primary">Speak with your voice.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground">
            Real-time sign language fingerspelling detection using your
            webcam — with hover-to-play motion guides for everyday phrases like
            <span className="px-1 font-semibold text-foreground">Namaste 🙏</span>,
            love, thank you, and more. Build words letter-by-letter and hear them
            announced aloud, or ask the AI to interpret a full sign.
          </p>
        </section>

        <ASLDetector />

        <section className="mt-12">
          <SpeechToSign />
        </section>

        <section className="mt-12">
          <ASLGuide />
        </section>

        <section className="mt-16 grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={<Hand className="h-5 w-5" />}
            title="Hand tracking"
            description="MediaPipe detects 21 landmarks of your hand at 30fps, fully in your browser."
          />
          <FeatureCard
            icon={<Volume2 className="h-5 w-5" />}
            title="Voice output"
            description="Detected letters are buffered into words and spoken aloud using your browser's voice."
          />
          <FeatureCard
            icon={<Sparkles className="h-5 w-5" />}
            title="AI interpretation"
            description="Tap 'Interpret with AI' to send the current frame to a vision model for richer signs."
          />
        </section>

        <section className="mt-12 rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur">
          <h3 className="font-semibold text-foreground">How to use</h3>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <span className="text-primary">1.</span> Click{" "}
              <strong className="text-foreground">Start camera</strong> and
              allow webcam access.
            </li>
            <li>
              <span className="text-primary">2.</span> Hold a clear ASL letter
              sign in front of the camera until the badge shows it.
            </li>
            <li>
              <span className="text-primary">3.</span> Letters accumulate into a
              word. Pause briefly or sign an{" "}
              <strong className="text-foreground">open hand (5)</strong> to
              speak the word aloud.
            </li>
            <li>
              <span className="text-primary">4.</span> For non-letter signs, use{" "}
              <strong className="text-foreground">Interpret with AI</strong>.
            </li>
          </ol>
          <p className="mt-4 text-xs text-muted-foreground/70">
            Works best with a plain background and your hand centered. J and Z
            require motion and are not detected by the static classifier.
          </p>
        </section>
      </main>

      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        Built with MediaPipe Hands · Lovable AI · Web Speech API
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card/40 p-5 backdrop-blur transition-smooth hover:border-primary/40 hover:shadow-glow">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
