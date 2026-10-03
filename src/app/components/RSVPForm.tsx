import { useState, useEffect } from "react";
import { Check, Search, AlertCircle } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { motion } from "motion/react";

export function RSVPForm() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<any>(null);
  const [formData, setFormData] = useState({
    guests: 1,
    dietary: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // 1. Búsqueda dinámica
  useEffect(() => {
    const searchFamilies = async () => {
      try {
        // SI EL NOMBRE ES IGUAL AL YA SELECCIONADO, NO BUSQUES DE NUEVO
        if (
          searchTerm.length < 3 ||
          (selectedFamily && searchTerm === selectedFamily.apellidos_familia)
        ) {
          setSearchResults([]);
          return;
        }

        const { data, error } = await supabase
          .from("confirmaciones")
          .select("*")
          .ilike("apellidos_familia", `%${searchTerm.trim()}%`)
          .limit(5);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (err) {
        console.error("Error en la búsqueda:", err);
      }
    };

    const timer = setTimeout(searchFamilies, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedFamily]);

  const handleSelectFamily = (family: any) => {
    setSelectedFamily(family);
    setSearchTerm(family.apellidos_familia);
    setSearchResults([]); // Esto cierra la lista inmediatamente

    if (family.asistencia) {
      setIsReadOnly(true);
      setFormData({
        guests: family.pases_utilizados || 1,
        dietary: family.alergias || "",
      });
    } else {
      setIsReadOnly(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFamily) {
      alert("Por favor, busca y selecciona tu familia primero.");
      return;
    }
    if (isReadOnly) return;

    const confirmMessage = `
      Familia: ${selectedFamily.apellidos_familia}
      Pases seleccionados: ${formData.guests}
      ¿Deseas continuar?
    `;

    if (window.confirm(confirmMessage)) {
      const { error } = await supabase
        .from("confirmaciones")
        .update({
          asistencia: true,
          pases_utilizados: formData.guests,
          alergias: formData.dietary,
        })
        .eq("id", selectedFamily.id);

      if (!error) setSubmitted(true);
      else alert("Hubo un error al guardar.");
    }
  };

  return (
    <section id="rsvp" className="relative py-24 px-6 overflow-hidden">
      <img
        src="/assets/Flores_sup.svg"
        alt=""
        aria-hidden="true"
        className=" pointer-events-none absolute
    left-1/2 top-0
    z-9
    w-[150%] max-w-full
    -translate-x-1/2
    translate-y-[-15%]
  "
      />

      <div className="relative max-w-2xl mx-auto z-10 bg-white rounded-2xl shadow-2xl p-10 border border-[#E8E0DB]">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-4 font-serif text-4xl text-[#6B1D36] md:text-5xl"
          >
            Confirmación
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
          <div className="mt-5 text-center rounded-2xl bg-[#6B1D36]/90 p-3">
            <p
              className="text-sm text-white"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Por favor, responda antes del 10 de Diciembre de 2026
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="bg-[#FAF7F5] rounded-lg p-12 text-center border border-[#D4AF37] animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4AF37] rounded-full mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl mb-2 text-[#6B1D36]">¡Gracias!</h3>
            <p className="text-[#6B5B52]">
              Confirmación recibida para la familia{" "}
              {selectedFamily?.apellidos_familia}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Buscador siempre visible */}
            <div className="relative">
              <label className="block mb-2 text-[#6B1D36] font-medium">
                Apellidos de Familia *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (selectedFamily) setSelectedFamily(null); // Reset si vuelve a escribir
                  }}
                  disabled={isReadOnly}
                  placeholder="Escribe los apellido de tu familia..."
                  className="w-full px-4 py-3 pl-10 rounded-md border border-[#E8E0DB] focus:border-[#D4AF37] outline-none transition-all"
                />
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              </div>

              {searchResults.length > 0 && (
                <ul className="absolute z-50 w-full bg-white border border-[#E8E0DB] mt-1 rounded-md shadow-xl overflow-hidden">
                  {searchResults.map((f) => (
                    <li
                      key={f.id}
                      onClick={() => handleSelectFamily(f)}
                      className="px-4 py-3 hover:bg-[#FAF7F5] cursor-pointer text-[#6B5B52] border-b last:border-0 transition-colors"
                    >
                      {f.apellidos_familia}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Mensaje de aviso si ya confirmó */}
            {isReadOnly && (
              <div className="flex items-center gap-3 p-4 bg-[#6B1D36]/10 text-[#6B1D36] rounded-md border border-[#6B1D36]/20">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-medium">
                  Esta familia ya ha confirmado su asistencia. Si requiere un
                  cambio, contacte a los novios.
                </p>
              </div>
            )}

            {/* 2. Formulario completo (Campos siempre visibles) */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-[#6B1D36] font-medium">
                  {selectedFamily
                    ? `Pases (Máximo: ${selectedFamily.cupo_maximo})`
                    : "Número de personas"}
                </label>
                <select
                  value={formData.guests}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      guests: parseInt(e.target.value),
                    })
                  }
                  disabled={isReadOnly || !selectedFamily}
                  className="w-full px-4 py-3 rounded-md bg-white border border-[#E8E0DB] disabled:bg-gray-50 disabled:text-gray-400"
                >
                  {/* Si hay familia, limita al cupo_maximo, si no, muestra 1-10 por defecto */}
                  {Array.from(
                    { length: selectedFamily?.cupo_maximo || 10 },
                    (_, i) => i + 1,
                  ).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "persona" : "personas"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-[#6B1D36] font-medium">
                Alergias o Comentarios
              </label>
              <textarea
                value={formData.dietary}
                onChange={(e) =>
                  setFormData({ ...formData, dietary: e.target.value })
                }
                disabled={isReadOnly || !selectedFamily}
                placeholder="Ej: Alergia a los mariscos..."
                className="w-full px-4 py-3 rounded-md border border-[#E8E0DB] resize-none disabled:bg-gray-50"
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={isReadOnly || !selectedFamily}
              className={`w-full py-4 text-white rounded-md transition-all shadow-md font-bold ${
                !selectedFamily || isReadOnly
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#6B1D36] hover:bg-[#8B2E4A]"
              }`}
            >
              {isReadOnly ? "Asistencia Confirmada" : "Confirmar Asistencia"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
