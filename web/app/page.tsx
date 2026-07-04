import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { LoopDemo } from "@/components/landing/LoopDemo";
import { Bento } from "@/components/landing/Bento";
import { MiniTV } from "@/components/landing/MiniTV";
import { Audience } from "@/components/landing/Audience";
import { TourMarquee } from "@/components/landing/TourMarquee";
import { Reserve } from "@/components/landing/Reserve";
import { Footer } from "@/components/landing/Footer";

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <LoopDemo />
        <Bento />
        <MiniTV />
        <Audience />
        <TourMarquee />
        <Reserve />
      </main>
      <Footer />
    </>
  );
}
