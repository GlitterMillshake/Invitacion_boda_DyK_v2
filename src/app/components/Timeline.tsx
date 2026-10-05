import { motion } from "motion/react";
import { FloralDecoration } from "./FloralDecoration";
import { GlassWater, Church, Utensils, Music, Clock } from "lucide-react";

const events = [
  {
    time: "17:00",
    title: "Ceremonia",
    description:
      "Nuestro encuentro ante Dios, en la Catedral de Nuestra Señora de la Asunción.",
    icon: Church,
  },
  {
    time: "18:00",
    title: "Recepción de Invitados",
    description: "Bienvenida al salón y música ambiental en Salón Finnestra.",
    icon: GlassWater,
  },
  {
    time: "19:00",
    title: "Banquete",
    description: "Cena, brindis y una velada para compartir juntos.",
    icon: Utensils,
  },
  {
    time: "21:00",
    title: "Fiesta",
    description: "Celebración, baile y momentos para recordar.",
    icon: Music,
  },
];

export function Timeline() {
  return (
    <section id="itinerario" className="relative overflow-hidden py-24">
      {/* Decoración floral */}
      <FloralDecoration
        src="/assets/Hojas_inf_der.svg"
        className="-right-10 -bottom-6 z-1 w-96 md:-right-10 md:-bottom-6 md:w-150"
        duration={20}
        rotate={1}
        xMovement={1}
        yMovement={1}
      />

      {/* Contenido */}
      <div className="relative z-10 mx-auto max-w-4xl px-4">
        {/* Encabezado */}
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-4 font-serif text-4xl text-[#6B1D36] md:text-5xl"
          >
            Itinerario
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

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="
              mx-auto
              max-w-lg
              font-sans
              text-sm
              uppercase
              tracking-[0.25em]
              text-[#302018]
            "
          >
            No te pierdas ningún detalle
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Línea central */}
          <div
            className="
              absolute
              bottom-8
              left-6
              top-8
              w-px
              bg-linear-to-b
              from-transparent
              via-[#D4AF37]
              to-transparent
              md:left-1/2
              md:-translate-x-1/2
            "
          />

          <div className="space-y-10 md:space-y-0">
            {events.map((event, index) => {
              const Icon = event.icon;
              const isRight = index % 2 === 0;

              return (
                <motion.div
                  key={event.time}
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    margin: "-80px",
                  }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.15,
                    ease: "easeOut",
                  }}
                  className="
                    relative
                    flex
                    items-center
                    md:min-h-52
                  "
                >
                  {/* Contenido */}
                  <div
                    className={`
                      ml-14
                      w-full
                      md:ml-0
                      md:w-[calc(50%-3rem)]
                      ${
                        isRight
                          ? "md:mr-auto md:pr-10 md:text-right"
                          : "md:ml-auto md:pl-10 md:text-left"
                      }
                    `}
                  >
                    <motion.div
                      whileHover={{
                        y: -3,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                      className="
                        rounded-xl
                        border
                        border-[#D4AF37]/20
                        bg-[#FAF7F5]/70
                        px-6
                        py-5
                        shadow-[0_8px_30px_rgba(48,32,24,0.06)]
                        backdrop-blur-[2px]
                      "
                    >
                      {/* Hora */}
                      <div
                        className={`
                          mb-2
                          flex
                          items-center
                          gap-2
                          text-[#D4AF37]
                          ${isRight ? "md:justify-end" : "md:justify-start"}
                        `}
                      >
                        <Clock className="h-4 w-4" />

                        <span className="font-serif text-2xl">
                          {event.time}
                        </span>
                      </div>

                      {/* Línea decorativa */}
                      <div
                        className={`
                          mb-3
                          h-px
                          w-12
                          bg-[#D4AF37]/60
                          ${isRight ? "ml-auto" : "mr-auto"}
                        `}
                      />

                      {/* Título */}
                      <h3 className="mb-2 font-serif text-2xl text-[#6B1D36]">
                        {event.title}
                      </h3>

                      {/* Descripción */}
                      <p className="font-sans text-sm leading-relaxed text-[#302018]/80 md:text-base">
                        {event.description}
                      </p>
                    </motion.div>
                  </div>

                  {/* Nodo central */}
                  <motion.div
                    initial={{
                      scale: 0,
                      opacity: 0,
                    }}
                    whileInView={{
                      scale: 1,
                      opacity: 1,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.15 + 0.2,
                      type: "spring",
                      stiffness: 180,
                      damping: 14,
                    }}
                    className="
                      absolute
                      left-6
                      z-20
                      flex
                      h-14
                      w-14
                      -translate-x-1/2
                      items-center
                      justify-center
                      rounded-full
                      border-4
                      border-[#FAF7F5]
                      bg-[#6B1D36]
                      shadow-[0_0_0_5px_rgba(212,175,55,0.18),0_8px_20px_rgba(48,32,24,0.15)]
                      md:left-1/2
                    "
                  >
                    <Icon className="h-5 w-5 text-[#D4AF37]" />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
