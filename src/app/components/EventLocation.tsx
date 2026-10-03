import { Church, MapPin, Utensils } from "lucide-react";
import { motion } from "motion/react";

const locations = [
  {
    type: "Ceremonia",
    time: "17:00",
    title: "Catedral de Nuestra Señora de la Asunción",
    address: "Calz. de San Francisco s/n, Centro",
    city: "Tlaxcala, Tlaxcala · C.P. 90000",
    icon: Church,
    embedUrl:
      "https://www.google.com/maps?q=19.313867,-98.2379148&output=embed",
    mapUrl: "https://maps.app.goo.gl/b1tWJx1oAiepXQuY6",
  },
  {
    type: "Recepción y Fiesta",
    time: "18:30",
    title: "Salón de Eventos Finnestra",
    address: "Av. Revolución #97A, Col. El Alto",
    city: "Santa Ana Chiautempan, Tlaxcala · C.P. 90800",
    icon: Utensils,
    embedUrl:
      "https://www.google.com/maps?q=19.3095171,-98.2080968&output=embed",
    mapUrl: "https://maps.app.goo.gl/NLV5bi999yrAUc9Q8",
  },
];

export function EventLocation() {
  return (
    <section
      id="ubicacion"
      className="relative overflow-hidden py-24 px-6"
    >
      {/* Decoración floral */}
      <img
        src="/assets/flowers (10).png"
        alt=""
        aria-hidden="true"
        className="
          absolute
          bottom-0
          left-0
          z-0
          pointer-events-none
          w-100
          sm:w-120
          md:w-140
          lg:w-160
        "
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-4 font-serif text-4xl text-[#6B1D36] md:text-5xl"
          >
            Lugar y detalles
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

        {/* Tarjetas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {locations.map((location) => {
            const Icon = location.icon;

            return (
              <div
                key={location.title}
                className="
                  overflow-hidden
                  rounded-xl
                  bg-white/95
                  shadow-lg
                  border
                  border-[#E8E0DB]
                "
              >
                {/* MAPA */}
                <div
                  className="
                    relative
                    h-56
                    overflow-hidden
                    sm:h-64
                    lg:h-90
                  "
                >
                  <iframe
                    src={location.embedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Ubicación de ${location.title}`}
                  ></iframe>
                </div>

                {/* INFORMACIÓN */}
                <div className="p-6 sm:p-8">
                  {/* Tipo y hora */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="
                        flex
                        items-center
                        justify-center
                        w-10
                        h-10
                        rounded-full
                        bg-[#6B1D36]
                        shrink-0
                      "
                    >
                      <Icon className="w-5 h-5 text-[#D4AF37]" />
                    </div>

                    <div>
                      <p
                        className="
                          text-xs
                          uppercase
                          tracking-widest
                          text-[#6B5B52]
                        "
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {location.type}
                      </p>

                      <p
                        className="text-xl text-[#D4AF37]"
                        style={{ fontFamily: "var(--font-serif)" }}
                      >
                        {location.time}
                      </p>
                    </div>
                  </div>

                  {/* Nombre del lugar */}
                  <div className="min-h-0 lg:min-h-21 flex items-start">
                    <h3
                      className="
                        text-2xl
                        sm:text-3xl
                        leading-tight
                        text-[#6B1D36]
                      "
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {location.title}
                    </h3>
                  </div>

                  {/* Dirección */}
                  <div className="flex items-start gap-3 mb-6">
                    <MapPin className="w-5 h-5 text-[#D4AF37] shrink-0 mt-1" />

                    <div
                      className="text-[#6B5B52]"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      <p>{location.address}</p>
                      <p>{location.city}</p>
                    </div>
                  </div>

                  {/* Botón */}
                  <a
                    href={location.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      w-full
                      rounded-md
                      border
                      border-[#D4AF37]
                      px-5
                      py-3
                      text-sm
                      tracking-wide
                      text-[#6B1D36]
                      transition-all
                      duration-300
                      hover:bg-[#6B1D36]
                      hover:text-white
                    "
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Ver ubicación en Google Maps
                  </a>

                  {/* Información adicional */}
                  <div
                    className="
                      mt-6
                      rounded-md
                      bg-[#FAF7F5]
                      p-4
                    "
                  >
                    <p
                      className="
                        text-sm
                        text-[#6B5B52]
                        italic
                        text-center
                      "
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {location.type === "Ceremonia"
                        ? "La ceremonia comienza puntualmente a las 5:00 PM. Por favor, llegue 10 minutos antes."
                        : "La recepción comienza a las 6:30 PM. A las 7:00 PM disfrutaremos del banquete y posteriormente comenzará la celebración."}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}