import { useState } from "react";
import { HeroSection } from "./HeroSection";
import { PhotoGallery } from "./PhotoGallery";
import { Timeline } from "./Timeline";
import { EventLocation } from "./EventLocation";
import { Gifts } from "./Gifts";
import { RSVPForm } from "./RSVPForm";
import { MusicPlayer } from "./MusicPlayer";

export function Home() {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);

  return (
    <main className="relative min-h-screen">
      {/* =====================================================
          HERO
          ===================================================== */}

      <HeroSection onOpen={() => setIsMusicPlaying(true)} />

      {/* =====================================================
          RESTO DE LA INVITACIÓN
          ===================================================== */}

      <div
        className="relative min-h-full bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/bg_inv.jpg')",
          backgroundAttachment: "scroll",
        }}
      >
        <div className="relative z-10">
          <MusicPlayer
            isPlaying={isMusicPlaying}
            setIsPlaying={setIsMusicPlaying}
            isVideoActive={isVideoActive}
          />

          <PhotoGallery
            onVideoStateChange={(active) => setIsVideoActive(active)}
          />

          <Timeline />

          <EventLocation />

          <Gifts />

          <RSVPForm />
        </div>
      </div>
    </main>
  );
}
