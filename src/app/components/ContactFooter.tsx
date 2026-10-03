import { Phone, MessageCircle } from "lucide-react";

export function ContactFooter() {
  return (
    <footer id="contacto" className="relative pt-10 pb-10 px-6 bg-[#6B1D36] text-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2
            className="text-3xl md:text-4xl mb-4 text-[#D4AF37]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Contacto
          </h2>
          <div className="w-24 h-px bg-[#D4AF37] mx-auto mb-4"></div>
          <p
            className="text-[#FAF7F5]/90"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Para cualquier duda o petición especial, por favor
            contáctanos
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="text-center md:text-center">
            <h3
              className="text-xl mb-2 text-[#D4AF37]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Contacto de la Novia
            </h3>
            <div className="space-y-2">
              <a
                href="tel:+522461098373"
                className="flex items-center justify-center md:justify-center gap-3 text-[#FAF7F5]/90 hover:text-[#D4AF37] transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                <Phone className="w-5 h-5" />
                <span>+52 246 109 8373</span>
              </a>
              <a
                href="https://wa.me/522461098373"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-center gap-3 text-[#FAF7F5]/90 hover:text-[#D4AF37] transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                <MessageCircle className="w-5 h-5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="text-center md:text-center">
            <h3
              className="text-xl mb-2 text-[#D4AF37]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Contacto del Novio
            </h3>
            <div className="space-y-2">
              <a
                href="tel:+526462948888"
                className="flex items-center justify-center md:justify-center gap-3 text-[#FAF7F5]/90 hover:text-[#D4AF37] transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                <Phone className="w-5 h-5" />
                <span>+52 646 294 8888</span>
              </a>
              <a
                href="https://wa.me/526462948888"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-center gap-3 text-[#FAF7F5]/90 hover:text-[#D4AF37] transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                <MessageCircle className="w-5 h-5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#8B2E4A] pt-8 text-center">
          <p
            className="text-[#FAF7F5]/70 text-sm"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            © 2026 Boda de Daniel & Katya. Todos los derechos
            reservados.
          </p>
          <p
            className="text-[#D4AF37] mt-4 italic"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            ¡Estamos ansiosos por celebrar juntos!
          </p>
        </div>
      </div>
    </footer>
  );
}