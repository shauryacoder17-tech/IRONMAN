import Scene from "@/components/scene/Scene";

type LandingProps = {
  onActivate: () => void;
  isBooting: boolean;
};

export default function Landing({ onActivate, isBooting }: LandingProps) {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#020817] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.18),_rgba(2,6,23,0)_55%)]" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center gap-8 px-6 text-center lg:flex-row lg:justify-between lg:text-left">
        <div className="max-w-xl space-y-6">
          <p className="text-sm font-medium uppercase tracking-[0.5em] text-cyan-300/80">
            JARVIS Interface
          </p>

          <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            Arc Reactor
            <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
              Command Core
            </span>
          </h1>

          <p className="text-lg text-slate-300">
            AI-powered systems, live voice interaction, and a cinematic control
            surface built for the next mission briefing.
          </p>

          <button
            onClick={onActivate}
            disabled={isBooting}
            className="rounded-full border border-cyan-400/40 bg-cyan-950/60 px-6 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-900/80 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isBooting ? "Activating..." : "Activate Core"}
          </button>
        </div>

        <div className="h-[420px] w-full max-w-xl overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-slate-950/40 shadow-[0_0_50px_rgba(34,211,238,0.22)]">
          <Scene isBooting={isBooting} />
        </div>
      </div>
    </div>
  );
}
