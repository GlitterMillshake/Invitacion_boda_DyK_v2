import { useCallback, useEffect, useRef, useState, memo } from "react";
import { createPortal } from "react-dom";

interface HeroSectionProps {
  onOpen: () => void;
}

type TimeLeft = {
  días: number;
  horas: number;
  minutos: number;
  segundos: number;
};

const TARGET_DATE = new Date("December 19, 2026 17:00:00").getTime();

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const INITIAL_TIME: TimeLeft = {
  días: 0,
  horas: 0,
  minutos: 0,
  segundos: 0,
};

const getTimeLeft = (): TimeLeft => {
  const distance = TARGET_DATE - Date.now();

  if (distance <= 0) {
    return INITIAL_TIME;
  }

  return {
    días: Math.floor(distance / DAY),
    horas: Math.floor((distance % DAY) / HOUR),
    minutos: Math.floor((distance % HOUR) / MINUTE),
    segundos: Math.floor((distance % MINUTE) / SECOND),
  };
};

type AnimationStage =
  | "IDLE"
  | "OPENING"
  | "FADING"
  | "CARD_VISIBLE"
  | "COMPLETE";

/* =========================================================
   CONTADOR
   ========================================================= */

const CountdownDisplay = memo(function CountdownDisplay() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-[3%] flex w-auto justify-center gap-[clamp(10px,2vw,18px)]">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div
          key={label}
          className="flex flex-col items-center"
        >
          <div className="flex h-[clamp(42px,8vw,58px)] w-[clamp(42px,8vw,58px)] items-center justify-center rounded-full bg-[#B84B5F] shadow-md">
            <span className="font-serif text-[clamp(0.8rem,2.8vw,1.1rem)] font-bold text-white">
              {value}
            </span>
          </div>

          <span className="mt-1 text-[clamp(0.35rem,1.2vw,0.55rem)] font-semibold uppercase tracking-wider text-[#B84B5F]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
});

/* =========================================================
   HERO SECTION
   ========================================================= */

export function HeroSection({ onOpen }: HeroSectionProps) {
  const [stage, setStage] = useState<AnimationStage>("IDLE");

  const animationTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAnimationTimers = useCallback(() => {
    animationTimers.current.forEach(clearTimeout);
    animationTimers.current = [];
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = setTimeout(callback, delay);
    animationTimers.current.push(timer);

    return timer;
  }, []);

  /* ---------------------------------------------------------
     LIMPIAR TIMERS
     --------------------------------------------------------- */

  useEffect(() => {
    return () => {
      clearAnimationTimers();
    };
  }, [clearAnimationTimers]);

  /* ---------------------------------------------------------
     BLOQUEAR SCROLL MIENTRAS ESTÁ EL SOBRE
     --------------------------------------------------------- */

  useEffect(() => {
    const isEnvelopeActive = stage !== "COMPLETE";
    const previousOverflow = document.body.style.overflow;

    if (isEnvelopeActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [stage]);

  /* ---------------------------------------------------------
     ABRIR SOBRE
     --------------------------------------------------------- */

  const handleOpenEnvelope = useCallback(() => {
    if (stage !== "IDLE") return;

    clearAnimationTimers();

    setStage("OPENING");

    onOpen();

    schedule(() => {
      setStage("FADING");
    }, 1000);

    schedule(() => {
      setStage("CARD_VISIBLE");
    }, 3200);

    schedule(() => {
      setStage("COMPLETE");
    }, 4200);
  }, [clearAnimationTimers, onOpen, schedule, stage]);

  /* ---------------------------------------------------------
     ESTADOS DE ANIMACIÓN
     --------------------------------------------------------- */

  const isOpening = stage !== "IDLE";

  const isEnvelopeFading =
    stage === "FADING" || stage === "CARD_VISIBLE" || stage === "COMPLETE";

  const isTextFading = stage === "CARD_VISIBLE" || stage === "COMPLETE";

  const showCard = stage === "CARD_VISIBLE" || stage === "COMPLETE";

  const isEnvelopeMounted = stage !== "COMPLETE";

  return (
    <section
      id="inicio"
      className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#FAF7F5] px-4 pb-16 pt-24 md:px-8"
    >
      {/* =====================================================
          FONDO
          ===================================================== */}

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <img
          src="/assets/bg_hs_2.png"
          alt="Fondo de la invitación"
          className={`h-full w-full  object-cover transition-[filter] duration-2000 ease-in-out ${
            showCard ? "blur-md" : "blur-none"
          }`}
        />

        <div
          className={`absolute inset-0 bg-black transition-opacity duration-2000 ease-in-out ${
            showCard ? "opacity-40" : "opacity-0"
          }`}
        />

        <div
          className={`absolute inset-0 bg-[#6B1D36] transition-opacity duration-2000 ease-in-out ${
            showCard ? "opacity-20" : "opacity-0"
          }`}
        />

        <div
          className={`absolute inset-0 flex select-none flex-col items-center justify-center p-6 text-center transition-all duration-1200 ease-in-out ${
            isTextFading
              ? "translate-y-5e-95 opacity-0"
              : "translate-y-0 scale-100 opacity-100"
          }`}
        >
          <p className="mb-2 font-sans text-sm uppercase tracking-[0.35em] text-[#D4AF37] drop-shadow-md md:text-base">
            Nuestra Boda
          </p>

          <h1
            className="text-4xl leading-tight tracking-wider text-white drop-shadow-lg md:text-7xl"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Katya &amp; Daniel
          </h1>

          <div className="my-4 h-px w-24 bg-[#D4AF37]/80 shadow-sm" />

          <p className="mb-8 font-sans text-xs uppercase tracking-[0.2em] text-white/90 drop-shadow md:text-sm">
            19 de Diciembre, 2026
          </p>
        </div>
      </div>

      {/* =====================================================
          SOBRE
          ===================================================== */}

      {isEnvelopeMounted &&
        createPortal(
          <div
            className={`pointer-events-auto fixed inset-0 z-999999 touch-none select-none overflow-hidden bg-transparent transition-opacity duration-1000 ease-out ${
              isEnvelopeFading ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            {/* MITAD IZQUIERDA */}

            <div
              className={`absolute left-0 top-0 z-20 flex h-full w-1/2 items-center justify-end bg-[#6B1D36] shadow-[10px_0_30px_rgba(0,0,0,0.5)] transition-transform duration-1400 ease-in-out ${
                isOpening ? "-translate-x-full" : "translate-x-0"
              }`}
            >
              <div className="pointer-events-none absolute inset-y-8 left-8 right-4 border-y border-l border-[#D4AF37]/40" />
              <div className="pointer-events-none absolute inset-y-10 left-10 right-6 border-y border-l border-[#D4AF37]/20" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-black/50 to-transparent" />
            </div>

            {/* MITAD DERECHA */}

            <div
              className={`absolute right-0 top-0 z-20 flex h-full w-1/2 items-center justify-start bg-[#6B1D36] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transition-transform duration-1400 ease-in-out ${
                isOpening ? "translate-x-full" : "translate-x-0"
              }`}
            >
              <div className="pointer-events-none absolute inset-y-8 left-4 right-8 border-y border-r border-[#D4AF37]/40" />

              <div className="pointer-events-none absolute inset-y-10 left-6 right-10 border-y border-r border-[#D4AF37]/20" />

              <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-black/20 to-transparent" />
            </div>

            {/* SELLO */}

            <div
              className={`absolute inset-0 z-30 flex items-center justify-center transition-all duration-700 ease-out ${
                isOpening
                  ? "pointer-events-none scale-125 opacity-0"
                  : "scale-100 opacity-100"
              }`}
            >
              <button
                type="button"
                onClick={handleOpenEnvelope}
                aria-label="Abrir invitación"
                className="group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-4"
              >
                <div className="relative flex h-36 w-36 items-center justify-center md:h-44 md:w-44">
                  <div className="absolute inset-3 rounded-full bg-black/60 blur-xl transition-all group-hover:blur-2xl" />

                  <img
                    src="/assets/Sello_lacre.svg"
                    alt="Sello de lacre"
                    className="relative h-full w-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)] transition-transform duration-300 group-hover:scale-105 group-active:scale-95"
                  />
                </div>
              </button>
            </div>
          </div>,
          document.body,
        )}

      {/* =====================================================
          CONTENEDOR DE TARJETAS
          ===================================================== */}

      <div
        className={`relative z-10 flex w-full max-w-375 flex-col items-center justify-center gap-12 transition-all duration-2500 xl:flex-row xl:items-start ${
          showCard
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-32 scale-95 opacity-0"
        }`}
      >
        {/* ===================================================
            TARJETA 1
            =================================================== */}

        <div className="relative aspect-840/1176 w-[min(720px,100%)]">
          {/* FONDO Y DECORACIÓN */}

          <div className="absolute inset-0 overflow-hidden rounded-2xl bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]">
            <img
              src="/assets/bg_inv.jpg"
              alt=""
              className="absolute inset-0 w-full object-cover"
            />

            <div className="absolute inset-0 bg-white/40" />

            <img
              src="/assets/Decoracion_tarjeta.svg"
              alt=""
              className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain"
            />
          </div>

          {/* CONTENIDO DE LA TARJETA */}

          <div className="relative z-20 flex h-full w-full flex-col items-center px-[14%] py-[11%] text-center">
            {/* FOTO DE LOS NOVIOS */}

            <div className="relative h-[30%] w-[56%] shrink-0">
              <div className="absolute inset-[8%] translate-y-2 rounded-full bg-black/30 blur-lg" />

              <img
                src="/assets/Foto_novios.svg"
                alt="Katya y Daniel"
                className="relative z-10 h-full w-full object-contain"
              />
            </div>

            {/* ESPACIO ENTRE FOTO Y TEXTO */}

            <div className="h-[4%] shrink-0" />

            {/* INFORMACIÓN */}

            <div className="flex w-full flex-col items-center">
              <p className="font-sans text-[clamp(0.5rem,1.8vw,0.72rem)] uppercase tracking-[0.35em] text-[#6B5B52]">
                Acompáñanos a
              </p>

              <img
                src="/assets/Separador.svg"
                alt=""
                className="mx-auto my-[3%] h-[clamp(10px,2vw,18px)] w-auto object-contain"
              />

              <h2
                className="text-[clamp(2.5rem,8vw,4.2rem)] leading-tight text-[#5C162E]"
                style={{
                  fontFamily: "'Great Vibes', 'Dancing Script', cursive",
                }}
              >
                Nuestra Boda
              </h2>

              <p className="mt-[0.5%] font-serif text-[clamp(1.2rem,4vw,2rem)] uppercase tracking-[0.15em] text-[#3A2E2B]">
                KATYA Y DANIEL
              </p>

              <img
                src="/assets/Separador.svg"
                alt=""
                className="mx-auto my-[3%]  h-[clamp(10px,2vw,18px)] w-auto object-contain"
              />

              <p className="font-sans text-[clamp(0.5rem,1.8vw,0.72rem)] uppercase tracking-[0.25em] text-[#5C162E]">
                19 DE DICIEMBRE DE 2026
              </p>

              <p className="mt-[5%] my-[5%] font-sans text-[clamp(0.48rem,1.6vw,0.65rem)] uppercase tracking-[0.25em] text-[#6B5B52]">
                TLAXCALA, TLAXCALA
              </p>

              {/* CONTADOR */}
              <CountdownDisplay />
            </div>
          </div>
        </div>

        {/* ===================================================
            TARJETA 2
            =================================================== */}

        <div className="relative aspect-840/1176 w-[min(720px,100%)]">
          {/* FONDO Y DECORACIÓN */}

          <div className="absolute inset-0 overflow-hidden rounded-2xl bg-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]">
            <img
              src="/assets/bg_inv.jpg"
              alt=""
              className="absolute inset-0 w-full object-cover"
            />

            <div className="absolute inset-0 bg-white/40" />

            <img
              src="/assets/Decoracion_tarjeta.svg"
              alt=""
              className="pointer-events-none absolute inset-0 z-10 h-full w-full object-contain"
            />
          </div>

          {/* CONTENIDO */}

          <div className="relative z-20 flex h-full w-full flex-col items-center px-[14%] py-[10%] text-center text-[#5C4A42]">
            {/* ANILLOS */}

            <div className="h-[15%] w-[24%] shrink-0">
              <img
                src="/assets/Anillos.svg"
                alt="Anillos de boda"
                className="mx-auto h-full w-full object-contain"
              />
            </div>

            <img
                src="/assets/Separador.svg"
                alt=""
                className="mx-auto my-[3%] h-[clamp(10px,2vw,18px)] w-auto object-contain"
              />

            {/* POEMA */}

            <div className="w-[80%] space-y-[4%] font-serif text-[clamp(0.6rem,2.1vw,0.9rem)] leading-[1.65]">
              <p>
                El amor nos encontró en un lugar inesperado, y 
                con el tiempo nos enseñó que, aun en la distancia, 
                siempre hay un camino de regreso.
              </p>

              <p>
                Hoy, comienza una nueva etapa de nuestras vidas, y 
                deseamos compartir esta alegría con Dios y 
                con aquellos que apreciamos.
              </p>
            </div>

            <img
                src="/assets/Separador.svg"
                alt=""
                className="mx-auto my-[3%] h-[clamp(10px,2vw,18px)] w-auto object-contain"
              />

            {/* CITA BÍBLICA */}

            <div className="w-[80%]">

              <p className="mb-[3%] font-serif text-[clamp(0.65rem,2.2vw,0.95rem)] text-[#5C162E]">
                “Y sobre todas estas cosas vestíos de amor, que
                 es el vínculo perfecto.”
              </p>

              <p className="font-sans text-[clamp(0.48rem,1.5vw,0.65rem)] font-semibold uppercase tracking-widest text-[#D4AF37]">
                - Colosenses 3:14
              </p>

            </div>

            <img
                src="/assets/Separador.svg"
                alt=""
                className="mx-auto my-[3%] h-[clamp(10px,2vw,18px)] w-auto object-contain"
              />

            {/* PADRES Y PADRINOS */}

            <div className="mt-[2%] w-[80%] space-y-[5%]">
              {/* PADRES */}

              <div>
                <h3 className="font-sans text-[clamp(0.80rem,3vw,0.80rem)] font-bold tracking-wider text-[#C49A45]">
                  Con la bendición de Dios, nuestros padres y padrinos.
                </h3>

                <div className="mt-[5%] grid grid-cols-2 gap-[4%] font-serif text-[clamp(0.55rem,2vw,0.85rem)]">
                  <div>
                    <p className="font-bold text-[#5C162E]">
                      Padres de la Novia
                    </p>

                    <p className="mt-[2%]">Fernando Vasquez Carro</p>

                    <p>Catalina Cuapio Cuapio</p>
                  </div>

                  <div>
                    <p className="font-bold text-[#5C162E]">Padres del Novio</p>

                    <p className="mt-[2%]">Juan Manuel Chávez</p>

                    <p>Ma Cruz Novoa Villalpaldo</p>
                  </div>
                </div>
              </div>

              {/* PADRINOS */}

              <div>
                <h3 className="font-sans text-[clamp(0.5rem,1.7vw,0.68rem)] font-bold tracking-wider text-[#5C162E]">
                  Nuestros Padrinos
                </h3>

                <div className="mt-[1.5%] font-serif text-[clamp(0.55rem,2vw,0.85rem)]">
                  <p>Joel Arias Navarro</p>

                  <p>Enisey Conde Sanchez</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
