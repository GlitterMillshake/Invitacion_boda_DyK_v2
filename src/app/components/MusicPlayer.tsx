// MusicPlayer.tsx
import { useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface MusicPlayerProps {
  isVideoActive: boolean;
  isPlaying: boolean; // Recibe el estado de Home
  setIsPlaying: (playing: boolean) => void; // Recibe la función para cambiarlo
}

export function MusicPlayer({ isVideoActive, isPlaying, setIsPlaying }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Sincronizar el audio real con el estado isPlaying
  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => console.log("Interacción requerida"));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  // Detener música si hay video
  useEffect(() => {
    if (isVideoActive && isPlaying) {
      setIsPlaying(false);
    }
  }, [isVideoActive, isPlaying, setIsPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className="fixed bottom-6 left-6 z-100">
      <audio 
        ref={audioRef} 
        src="/pov - (instrumental).mp3" 
        onEnded={() => setIsPlaying(false)} 
      />
      <button onClick={togglePlay} className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-xl border border-[#D4AF37] hover:scale-105 transition-all">
        {isPlaying ? <Volume2 className="..." /> : <VolumeX className="..." />}
        <span className="...">{isPlaying ? "PAUSAR" : "MÚSICA"}</span>
      </button>
    </div>
  );
}