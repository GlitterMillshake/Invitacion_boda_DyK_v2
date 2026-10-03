import { motion } from "motion/react";

interface FloralDecorationProps {
  src: string;
  alt?: string;
  className?: string;
  duration?: number;
  delay?: number;
  rotate?: number;
  yMovement?: number;
  xMovement?: number;
  scaleMovement?: number;
}

export function FloralDecoration({
  src,
  alt = "",
  className = "",
  duration = 7,
  delay = 1,
  rotate = 1,
  scaleMovement = 0.02,
}: FloralDecorationProps) {
  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      aria-hidden={alt === "" ? true : undefined}
    >
      <motion.img
        src={src}
        alt={alt}
        className="block w-full select-none"
        initial={{
          rotate: -rotate,
          scale: 1,
        }}
        animate={{
          rotate: [-rotate, rotate, -rotate * 0.5, rotate * 0.25, -rotate],
          scale: [
            1,
            1 + scaleMovement,
            1 - scaleMovement,
            1 + scaleMovement * 0.5,
            1,
          ],
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
        style={{
          transformOrigin: "bottom center",
          willChange: "transform",
        }}
      />
    </div>
  );
}
