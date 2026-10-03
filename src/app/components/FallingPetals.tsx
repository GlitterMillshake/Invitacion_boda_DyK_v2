import { motion } from "motion/react";

interface FallingPetalsProps {
  petalSrc?: string;
  leafSrc?: string;
  count?: number;
  minDuration?: number;
  maxDuration?: number;
  className?: string;
}

interface PetalConfig {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  x1: number;
  x2: number;
  x3: number;
  rotateStart: number;
  rotateEnd: number;
  opacity: number;
  type: "petal" | "leaf";
}

const FALLING_ELEMENTS: PetalConfig[] = [
  // IZQUIERDA
  {
    id: 1,
    left: 5,
    size: 18,
    duration: 16,
    delay: 0,
    x1: 25,
    x2: -20,
    x3: 30,
    rotateStart: 0,
    rotateEnd: 260,
    opacity: 0.80,
    type: "petal",
  },
  {
    id: 2,
    left: 12,
    size: 14,
    duration: 19,
    delay: 4,
    x1: -20,
    x2: 30,
    x3: -10,
    rotateStart: 40,
    rotateEnd: 300,
    opacity: 0.60,
    type: "leaf",
  },
  {
    id: 3,
    left: 22,
    size: 20,
    duration: 17,
    delay: 8,
    x1: 30,
    x2: -15,
    x3: 20,
    rotateStart: 80,
    rotateEnd: 360,
    opacity: 0.40,
    type: "petal",
  },
  {
    id: 4,
    left: 32,
    size: 13,
    duration: 20,
    delay: 2,
    x1: -25,
    x2: 20,
    x3: -30,
    rotateStart: 20,
    rotateEnd: 280,
    opacity: 0.20,
    type: "leaf",
  },

  // DERECHA
  {
    id: 5,
    left: 68,
    size: 17,
    duration: 15,
    delay: 6,
    x1: -20,
    x2: 25,
    x3: -15,
    rotateStart: 100,
    rotateEnd: 420,
    opacity: 0.80,
    type: "petal",
  },
  {
    id: 6,
    left: 78,
    size: 15,
    duration: 18,
    delay: 10,
    x1: 15,
    x2: -25,
    x3: 20,
    rotateStart: 60,
    rotateEnd: 340,
    opacity: 0.60,
    type: "leaf",
  },
  {
    id: 7,
    left: 88,
    size: 19,
    duration: 17,
    delay: 3,
    x1: -25,
    x2: 30,
    x3: -20,
    rotateStart: 30,
    rotateEnd: 330,
    opacity: 0.40,
    type: "petal",
  },
  {
    id: 8,
    left: 95,
    size: 14,
    duration: 21,
    delay: 7,
    x1: 20,
    x2: -20,
    x3: 15,
    rotateStart: 120,
    rotateEnd: 400,
    opacity: 0.20,
    type: "leaf",
  },
];

export function FallingPetals({
  petalSrc = "/assets/petalo.svg",
  leafSrc = "/assets/hoja.svg",
  count = 8,
  minDuration = 14,
  maxDuration = 20,
  className = "z-0",
}: FallingPetalsProps) {
  const elements = FALLING_ELEMENTS.slice(
    0,
    Math.min(count, FALLING_ELEMENTS.length),
  ).map((element) => ({
    ...element,
    duration: Math.min(maxDuration, Math.max(minDuration, element.duration)),
  }));

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {elements.map((element) => {
        const src = element.type === "leaf" ? leafSrc : petalSrc;

        return (
          <motion.img
            key={element.id}
            src={src}
            alt=""
            className="pointer-events-none absolute select-none"
            style={{
              left: `${element.left}%`,
              width: `${element.size}px`,
              willChange: "transform, opacity",
            }}
            initial={{
              y: "-10vh",
              x: 0,
              rotate: element.rotateStart,
              opacity: 0,
            }}
            animate={{
              y: ["-10vh", "25vh", "55vh", "80vh", "110vh"],
              x: [0, element.x1, element.x2, element.x3, 0],
              rotate: [
                element.rotateStart,
                element.rotateStart + 80,
                element.rotateStart + 160,
                element.rotateStart + 240,
                element.rotateEnd,
              ],
              opacity: [
                0,
                element.opacity,
                element.opacity,
                element.opacity * 0.7,
                0,
              ],
            }}
            transition={{
              duration: element.duration,
              delay: element.delay,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
            }}
          />
        );
      })}
    </div>
  );
}
