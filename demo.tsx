import * as React from "react";
import { TiltedGridHero } from "@/components/ui/tilted-grid-hero";
import { Sparkles, ArrowRight } from "lucide-react";

// Curated high-resolution Unsplash stock imagery and gradient art
const IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
    alt: "Artistic oil painting abstract portrait with warm lighting",
  },
  {
    src: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
    alt: "Soft fluid liquid marble gradient textures",
  },
  {
    src: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    alt: "Vibrant aurora borealis northern lights over mountains",
  },
  {
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    alt: "Minimalist 3D architectural geometric ribbons and curves",
  },
  {
    src: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80",
    alt: "Smooth prismatic vibrant spectral gradient wash",
  },
  {
    src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    alt: "High-tech circuit board with futuristic illuminated traces",
  },
  {
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    alt: "Majestic alpine mountain valley reflecting on calm lake",
  },
  {
    src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    alt: "Starry night sky over snow-covered winter mountain ridge",
  },
  {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    alt: "Tropical emerald ocean coastline with gentle shore waves",
  },
  {
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    alt: "Orbital view of Earth with glowing continent city lights",
  },
];

export function TiltedGridHeroDemo() {
  return (
    <TiltedGridHero
      images={IMAGES}
      className="h-[560px] w-full rounded-xl border border-border bg-background shadow-2xl"
    >
      <div className="relative z-10 flex h-full flex-col items-center justify-between py-12 text-center">
        <div className="flex flex-col items-center px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3.5 py-1 text-xs font-medium text-foreground backdrop-blur-md mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span>Interactive 3D Cylindrical Canvas</span>
          </div>

          <h1 className="text-balance text-4xl font-medium tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Every frame,
            <br />
            brought into focus.
          </h1>
        </div>

        <div className="flex flex-col items-center gap-4 px-6">
          <p className="max-w-md text-balance text-sm text-muted-foreground">
            Images curve in from one edge, flatten out at the centre, then fade
            away round the other with GPU-accelerated 3D facet rendering.
          </p>

          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition hover:opacity-90">
            <span>Explore Experience</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </TiltedGridHero>
  );
}

export default TiltedGridHeroDemo;
