import { motion } from "motion/react";
import { Mail, Heart, Gift } from "lucide-react";

export function Gifts() {
  return (
    <section
      id="regalos"
      className="relative overflow-hidden px-5 py-20 sm:px-8 sm:py-24"
    >
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Tarjeta principal borgoña */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="
            relative overflow-hidden rounded-2xl
            bg-linear-to-b from-[#6B1D36] via-[#6b1d1e] to-[#b17104]
            px-6 py-12
            shadow-[0_18px_50px_rgba(60,20,30,0.20)]
            sm:px-10 sm:py-14
            lg:px-16 lg:py-16
          "
        >
          {/* Borde ornamental interior */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-3
              rounded-xl border border-[#D4AF37]/80
              sm:inset-4
            "
          />

          {/* CONTENIDO */}
          <div
            className="
              relative z-10
              grid grid-cols-1 items-center
              gap-10 lg:grid-cols-2 lg:gap-16
            "
          >
            {/* =========================================
                COLUMNA IZQUIERDA
                ========================================= */}
            <motion.div
              initial={{ opacity: 0, x: -25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7 }}
              className="
                relative px-3 py-6
                text-center
                lg:px-8 lg:py-10
              "
            >
              <Gift
                className="mx-auto mb-5 h-10 w-10 text-[#D4AF37]"
                strokeWidth={1.2}
              />

              {/* TÍTULO */}
              <h2
                className="
                  text-4xl text-[#FAF7F5]
                  sm:text-5xl
                "
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Regalos
              </h2>

              {/* Divisor */}
              <div className="mx-auto mt-5 flex items-center justify-center gap-3">
                <div className="h-px w-12 bg-[#D4AF37]/90 sm:w-16" />

                <Heart className="h-4 w-4 text-[#D4AF37]" strokeWidth={1.3} />

                <div className="h-px w-12 bg-[#D4AF37]/90 sm:w-16" />
              </div>

              {/* Mensaje */}
              <p
                className="
                  mx-auto mt-8 max-w-lg
                  text-xl leading-relaxed
                  text-[#FAF7F5]
                  sm:text-2xl
                "
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Su presencia es nuestro mejor regalo, pero si desean tener un
                detalle con nosotros, será muy apreciado.
              </p>

              <div className="mx-auto mt-7 h-px w-16 bg-[#D4AF37]/90" />

              <p
                className="
                  mx-auto mt-5 max-w-md
                  text-sm italic leading-relaxed
                  text-[#E8DCD6]
                  sm:text-base
                "
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Gracias por acompañarnos en este día tan especial.
              </p>
            </motion.div>

            {/* =========================================
                COLUMNA DERECHA
                ========================================= */}
            <motion.div
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mx-auto w-full max-w-md lg:max-w-none"
            >
              {/* Borde exterior */}
              <div
                className="
                  rounded-2xl
                  p-2
                  sm:p-3
                "
              >
                {/* Tarjeta dorada */}
                <div
                  className="
                    relative overflow-hidden
                    rounded-xl
                    bg-linear-to-br
                    from-[#E7CC68]
                    via-[#D4AF37]
                    to-[#B58A28]
                    px-6 py-10
                    text-center
                    shadow-[0_12px_35px_rgba(0,0,0,0.18)]
                    sm:px-10 sm:py-12
                  "
                >
                  {/* Borde interno */}
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none absolute inset-3
                      rounded-lg
                      border border-[#6B1D36]/20
                    "
                  />

                  {/* Círculo superior */}
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none absolute
                      -right-12 -top-12
                      h-40 w-40 rounded-full
                      border border-white/20
                    "
                  />

                  {/* Círculo inferior */}
                  <div
                    aria-hidden="true"
                    className="
                      pointer-events-none absolute
                      -bottom-16 -left-12
                      h-48 w-48 rounded-full
                      border border-white/20
                    "
                  />

                  <div className="relative z-10">
                    {/* Icono */}
                    <div
                      className="
                        mx-auto mb-6
                        flex h-16 w-16
                        items-center justify-center
                        rounded-full
                        border border-[#6B1D36]/30
                        bg-[#FAF7F5]/20
                      "
                    >
                      <Mail
                        className="h-8 w-8 text-[#6B1D36]"
                        strokeWidth={1.3}
                      />
                    </div>

                    <h3
                      className="
                        text-3xl leading-tight
                        text-[#6B1D36]
                        sm:text-4xl
                      "
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      Lluvia de Sobres
                    </h3>

                    <div className="mx-auto my-5 flex items-center justify-center gap-3">
                      <div className="h-px w-10 bg-[#6B1D36]/40" />

                      <Heart
                        className="h-3.5 w-3.5 text-[#6B1D36]"
                        strokeWidth={1.5}
                      />

                      <div className="h-px w-10 bg-[#6B1D36]/40" />
                    </div>

                    <p
                      className="
                        mx-auto max-w-xs
                        text-base leading-relaxed
                        text-[#4B2526]
                        sm:text-lg
                      "
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      Habrá un buzón disponible en la recepción para quienes
                      deseen hacernos llegar un obsequio en efectivo.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <img
        src="/assets/Flores_sup.svg"
        alt=""
        aria-hidden="true"
        className=" pointer-events-none absolute
    left-1/2 bottom-0
    z-0
    w-[150%] max-w-full
    -translate-x-1/2
    translate-y-[15%]
    scale-y-[-1]
  "
      />
    </section>
  );
}
