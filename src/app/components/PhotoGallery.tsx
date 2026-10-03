import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type TouchEvent,
} from "react";
import { X, PlayCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { FloralDecoration } from "./FloralDecoration";
import { FallingPetals } from "./FallingPetals";
import { motion } from "motion/react";

interface PhotoGalleryProps {
  onVideoStateChange: (isActive: boolean) => void;
}

interface GalleryItem {
  id: string | number;
  url: string;
  tipo: "image" | "video";
  orden: number;
}

export function PhotoGallery({ onVideoStateChange }: PhotoGalleryProps) {
  const [media, setMedia] = useState<GalleryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* =========================================================
     ELEMENTO ACTUAL
     ========================================================= */

  const currentMedia = media[currentIndex];

  /* =========================================================
     CARGAR GALERÍA
     ========================================================= */

  useEffect(() => {
    const fetchMedia = async () => {
      const { data, error } = await supabase
        .from("galeria")
        .select("*")
        .order("orden");

      if (error) {
        console.error("Error fetching media:", error);
        return;
      }

      if (data) {
        setMedia(data as GalleryItem[]);
      }
    };

    fetchMedia();
  }, []);

  /* =========================================================
     CENTRAR ELEMENTO ACTUAL
     ========================================================= */

  const scrollToIndex = useCallback((index: number) => {
    const container = carouselRef.current;
    const item = itemRefs.current[index];

    if (!container || !item) return;

    const containerCenter = container.clientWidth / 2;
    const itemCenter = item.offsetLeft + item.offsetWidth / 2;

    let targetScroll = itemCenter - containerCenter;

    const maxScroll = container.scrollWidth - container.clientWidth;

    targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  }, []);

  /* =========================================================
     CAMBIAR FOTOGRAFÍA
     ========================================================= */

  const goToMedia = useCallback(
    (index: number) => {
      if (media.length === 0) return;

      const normalizedIndex = (index + media.length) % media.length;

      setCurrentIndex(normalizedIndex);

      requestAnimationFrame(() => {
        const container = carouselRef.current;
        const item = itemRefs.current[normalizedIndex];

        if (!container || !item) return;

        const isLast = normalizedIndex === media.length - 1;
        const isFirst = normalizedIndex === 0;

        if (isLast) {
          container.scrollTo({
            left: container.scrollWidth - container.clientWidth,
            behavior: "smooth",
          });

          return;
        }

        if (isFirst) {
          container.scrollTo({
            left: 0,
            behavior: "smooth",
          });

          return;
        }

        scrollToIndex(normalizedIndex);
      });
    },
    [media.length, scrollToIndex],
  );

  /* =========================================================
     SIGUIENTE
     ========================================================= */

  const nextMedia = useCallback(() => {
    if (media.length <= 1) return;

    goToMedia(currentIndex + 1);
  }, [currentIndex, media.length, goToMedia]);

  /* =========================================================
     ANTERIOR
     ========================================================= */

  const prevMedia = useCallback(() => {
    if (media.length <= 1) return;

    goToMedia(currentIndex - 1);
  }, [currentIndex, media.length, goToMedia]);

  /* =========================================================
     CENTRAR SOLAMENTE AL CARGAR
     ========================================================= */

  useEffect(() => {
    if (media.length === 0) return;

    const timer = window.setTimeout(() => {
      scrollToIndex(0);
    }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [media.length, scrollToIndex]);

  /* =========================================================
     TECLADO
     ========================================================= */

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!lightboxOpen) return;

      if (event.key === "ArrowRight") {
        nextMedia();
      }

      if (event.key === "ArrowLeft") {
        prevMedia();
      }

      if (event.key === "Escape") {
        closeLightbox();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, nextMedia, prevMedia]);

  /* =========================================================
     ESTADO DEL VIDEO EN LIGHTBOX
     ========================================================= */

  useEffect(() => {
    if (!lightboxOpen || !currentMedia) {
      onVideoStateChange(false);
      return;
    }

    onVideoStateChange(currentMedia.tipo === "video");
  }, [currentMedia, lightboxOpen, onVideoStateChange]);

  /* =========================================================
     SWIPE
     ========================================================= */

  const handleTouchStart = (event: TouchEvent) => {
    setTouchStart(event.touches[0].clientX);
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (touchStart === null) return;

    const touchEnd = event.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;

    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        nextMedia();
      } else {
        prevMedia();
      }
    }

    setTouchStart(null);
  };

  /* =========================================================
     LIGHTBOX
     ========================================================= */

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);

    onVideoStateChange(media[index]?.tipo === "video");
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    onVideoStateChange(false);
  };

  
  return (
    <>
      <section id="fotos" className="relative overflow-hidden py-24">
        {/* =====================================================
            DECORACIÓN ANIMADA
            ===================================================== */}

        <FloralDecoration
          src="/assets/Flores_sup_caida (2).svg"
          className="-left-4 -top-4 z-1 w-72 md:-left-4 md:-top-4 md:w-96"
          duration={10}
          rotate={0.5}
          xMovement={2}
          yMovement={3}
        />

        <FloralDecoration
          src="/assets/Flores_sup_caida (1).svg"
          className="-right-4 -top-4 z-1 w-72 md:-right-4 md:-top-4 md:w-96"
          duration={10}
          rotate={1}
          xMovement={2}
          yMovement={3}
        />

        <FallingPetals
          petalSrc="/assets/petalo.svg"
          leafSrc="/assets/petalo.svg"
          count={20}
          minDuration={16}
          maxDuration={40}
          className="z-0"
        />

        {/* =====================================================
            TÍTULO
            ===================================================== */}

        <div className="relative z-10 mb-12 px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-4 font-serif text-4xl text-[#6B1D36] md:text-5xl"
          >
            Nuestra historia
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <img
              src="/assets/Separador.svg"
              alt=""
              className="mx-auto my-[1%] h-[clamp(20px,4vw,20px)] w-auto object-contain"
            />
          </motion.div>
        </div>

        {/* =====================================================
            CARRUSEL
            ===================================================== */}

        <div className="relative z-10 w-full">
          {/* Flecha izquierda */}

          {media.length > 1 && (
            <button
              type="button"
              onClick={prevMedia}
              aria-label="Fotografía anterior"
              className="absolute left-3 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#C9A85C]/65 bg-[#721B36]/90 text-[#FCFAF7] shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-[#DCCB9A] hover:bg-[#541329] md:left-6 md:h-14 md:w-14"
            >
              <ChevronLeft size={30} strokeWidth={1.4} />
            </button>
          )}

          {/* Contenedor */}

          <div
            ref={carouselRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="w-full overflow-x-auto overflow-y-hidden px-[10vw] pb-4"
            style={{
              scrollbarWidth: "none",
              scrollSnapType: "x mandatory",
              touchAction: "pan-x",
            }}
          >
            <div className="flex min-h-80 w-max items-center gap-4 md:min-h-107.5 md:gap-6 z-10">
              {media.map((item, index) => {
                const isCurrent = index === currentIndex;

                return (
                  <div
                    key={item.id}
                    ref={(element) => {
                      itemRefs.current[index] = element;
                    }}
                    className={`z-10 relative flex h-75 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border bg-[#F5EFE8] transition-all duration-500 md:h-97.5 ${
                      isCurrent
                        ? "scale-100 border-[#C9A85C] opacity-100 shadow-xl"
                        : "scale-[0.94] border-[#C9A85C]/25 opacity-90 shadow-md hover:scale-[0.97] hover:opacity-100"
                    }`}
                    style={{
                      scrollSnapAlign: "center",
                    }}
                    onClick={() => {
                      openLightbox(index);
                    }}
                  >
                    {/* =================================================
                        FOTOGRAFÍA
                        ================================================= */}

                    {item.tipo === "image" ? (
                      <img
                        src={item.url}
                        alt={`Fotografía ${index + 1}`}
                        loading={index < 4 ? "eager" : "lazy"}
                        className="block h-full w-auto max-w-none object-contain"
                      />
                    ) : (
                      <div className="relative h-full w-auto">
                        <video
                          src={item.url}
                          muted
                          playsInline
                          preload="metadata"
                          className="block h-full w-auto max-w-none object-contain"
                        />

                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <PlayCircle
                            className="h-14 w-14 text-[#721B36] drop-shadow-lg md:h-16 md:w-16"
                            strokeWidth={1.2}
                          />
                        </div>
                      </div>
                    )}

                    {/* Marco */}

                    <div className="pointer-events-none absolute inset-2 rounded-lg border border-[#C9A85C]/35" />

                    {/* Número */}

                    <div className="absolute bottom-3 right-3 rounded-full bg-[#721B36]/80 px-2.5 py-1 text-[10px] tracking-widest text-[#FCFAF7] shadow-sm backdrop-blur-sm">
                      {index + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Flecha derecha */}

          {media.length > 1 && (
            <button
              type="button"
              onClick={nextMedia}
              aria-label="Fotografía siguiente"
              className="absolute right-3 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#C9A85C]/65 bg-[#721B36]/90 text-[#FCFAF7] shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-[#DCCB9A] hover:bg-[#541329] md:right-6 md:h-14 md:w-14"
            >
              <ChevronRight size={30} strokeWidth={1.4} />
            </button>
          )}
        </div>

        {/* =====================================================
            INDICADORES
            ===================================================== */}

        {media.length > 1 && (
          <div className="relative z-10 mt-7 flex justify-center gap-2">
            {media.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goToMedia(index)}
                aria-label={`Ver fotografía ${index + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "h-2.5 w-8 bg-[#C9A85C]"
                    : "h-2.5 w-2.5 bg-[#721B36]/25 hover:bg-[#C9A85C]/70"
                }`}
              />
            ))}
          </div>
        )}

        {/* =====================================================
            TEXTO
            ===================================================== */}

        <p
          className="relative z-10 mt-8 px-6 text-center text-sm italic text-[#721B36]/65 md:text-base"
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
          }}
        >
          Cada fotografía guarda un momento de nuestra historia.
        </p>
      </section>

      {/* =======================================================
          LIGHTBOX
          ======================================================= */}

      {lightboxOpen && currentMedia && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/95 backdrop-blur-md"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Cerrar */}

          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Cerrar galería"
            className="absolute right-4 top-4 z-10000 rounded-full p-2 text-[#DCCB9A]/80 transition-colors hover:text-[#FCFAF7] md:right-6 md:top-6"
          >
            <X size={38} strokeWidth={1.5} />
          </button>

          {/* Anterior */}

          {media.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                prevMedia();
              }}
              aria-label="Fotografía anterior"
              className="absolute left-2 top-1/2 z-10000 hidden -translate-y-1/2 p-4 text-[#DCCB9A]/65 transition-colors hover:text-[#FCFAF7] md:flex"
            >
              <ChevronLeft size={60} strokeWidth={1} />
            </button>
          )}

          {/* Imagen / video */}

          <div
            className="flex h-full w-full items-center justify-center p-4 md:p-10"
            onClick={closeLightbox}
          >
            {currentMedia.tipo === "image" ? (
              <img
                key={currentMedia.url}
                src={currentMedia.url}
                alt="Vista ampliada"
                className="max-h-[90vh] max-w-[94vw] object-contain shadow-2xl"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              />
            ) : (
              <video
                key={currentMedia.url}
                src={currentMedia.url}
                controls
                autoPlay
                playsInline
                className="max-h-[90vh] max-w-[94vw] shadow-2xl"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              />
            )}
          </div>

          {/* Siguiente */}

          {media.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                nextMedia();
              }}
              aria-label="Fotografía siguiente"
              className="absolute right-2 top-1/2 z-10000 hidden -translate-y-1/2 p-4 text-[#DCCB9A]/65 transition-colors hover:text-[#FCFAF7] md:flex"
            >
              <ChevronRight size={60} strokeWidth={1} />
            </button>
          )}

          {/* Contador */}

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-[#721B36]/55 px-4 py-1.5 text-xs font-light tracking-widest text-[#FCFAF7]/80 backdrop-blur-sm">
            {currentIndex + 1} / {media.length}
          </div>
        </div>
      )}

      {/* Ocultar scrollbar */}

      <style>
        {`
          #fotos div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
    </>
  );
}
