import { useState } from "react";
import { Check, KeyRound, AlertCircle } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { motion } from "motion/react";

type Invitation = {
  id: string;
  apellidos_familia: string;
  cupo_maximo: number;
  pases_utilizados: number | null;
  asistencia: boolean | null;
};

export function RSVPForm() {
  const [codigo, setCodigo] = useState("");
  const [invitation, setInvitation] =
    useState<Invitation | null>(null);

  const [formData, setFormData] = useState({
    guests: 1,
    dietary: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // =========================================================
  // VALIDAR CÓDIGO DE INVITACIÓN
  // =========================================================

  const handleValidateCode = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    const codigoLimpio = codigo.trim().toUpperCase();

    if (!codigoLimpio) {
      setErrorMessage(
        "Por favor, escribe tu código de invitación.",
      );
      return;
    }

    if (!/^KDY-[A-Z0-9]{3}$/.test(codigoLimpio)) {
      setErrorMessage(
        "El código debe tener el formato KDY-XXX.",
      );
      return;
    }

    setIsValidating(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.rpc(
        "validar_invitacion",
        {
          codigo: codigoLimpio,
        },
      );

      if (error) {
        console.error(
          "Error validando invitación:",
          error,
        );

        setErrorMessage(
          "No fue posible validar el código. Intenta nuevamente.",
        );

        return;
      }

      if (!data || data.length === 0) {
        setErrorMessage(
          "El código de invitación no es válido o ya no se encuentra activo.",
        );

        return;
      }

      const invitacionEncontrada =
        data[0] as Invitation;

      setInvitation(invitacionEncontrada);

      if (invitacionEncontrada.asistencia) {
        setFormData({
          guests:
            invitacionEncontrada.pases_utilizados || 1,
          dietary: "",
        });
      } else {
        setFormData({
          guests: 1,
          dietary: "",
        });
      }
    } catch (error) {
      console.error(
        "Error inesperado validando código:",
        error,
      );

      setErrorMessage(
        "Ocurrió un error inesperado. Intenta nuevamente.",
      );
    } finally {
      setIsValidating(false);
    }
  };

  // =========================================================
  // CONFIRMAR ASISTENCIA
  // =========================================================

  const handleSubmit = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!invitation) {
      setErrorMessage(
        "Primero debes validar tu código de invitación.",
      );
      return;
    }

    if (invitation.asistencia) {
      return;
    }

    if (
      formData.guests < 1 ||
      formData.guests > invitation.cupo_maximo
    ) {
      setErrorMessage(
        `Puedes confirmar entre 1 y ${
          invitation.cupo_maximo
        } ${
          invitation.cupo_maximo === 1
            ? "persona"
            : "personas"
        }.`,
      );
      return;
    }

    const confirmMessage = `Familia: ${
      invitation.apellidos_familia
    }

Pases seleccionados: ${formData.guests}

¿Deseas confirmar tu asistencia?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.rpc(
        "confirmar_asistencia",
        {
          codigo: codigo.trim().toUpperCase(),
          pases: formData.guests,
          alergias_texto:
            formData.dietary.trim() || null,
        },
      );

      if (error) {
        console.error(
          "Error confirmando asistencia:",
          error,
        );

        const message = error.message || "";

        if (
          message.includes(
            "INVITACION_YA_CONFIRMADA",
          )
        ) {
          setErrorMessage(
            "Esta invitación ya ha sido confirmada.",
          );
        } else if (
          message.includes(
            "INVITACION_NO_ENCONTRADA",
          )
        ) {
          setErrorMessage(
            "La invitación no fue encontrada o ya no está activa.",
          );
        } else if (
          message.includes("EXCEDE_CUPO")
        ) {
          setErrorMessage(
            `El número de pases supera el cupo máximo de ${invitation.cupo_maximo}.`,
          );
        } else if (
          message.includes("PASES_INVALIDOS")
        ) {
          setErrorMessage(
            "El número de pases seleccionado no es válido.",
          );
        } else {
          setErrorMessage(
            "Hubo un problema al guardar tu confirmación. Intenta nuevamente.",
          );
        }

        return;
      }

      const confirmacion = data?.[0];

      if (confirmacion) {
        setInvitation({
          id: confirmacion.id,
          apellidos_familia:
            confirmacion.apellidos_familia,
          cupo_maximo:
            confirmacion.cupo_maximo,
          pases_utilizados:
            confirmacion.pases_utilizados,
          asistencia:
            confirmacion.asistencia,
        });
      }

      setSubmitted(true);
    } catch (error) {
      console.error(
        "Error inesperado confirmando asistencia:",
        error,
      );

      setErrorMessage(
        "Ocurrió un error inesperado. Intenta nuevamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================
  // CAMBIAR CÓDIGO
  // =========================================================

  const handleChangeCode = () => {
    setCodigo("");
    setInvitation(null);
    setSubmitted(false);
    setErrorMessage("");

    setFormData({
      guests: 1,
      dietary: "",
    });
  };

  return (
    <section
      id="rsvp"
      className="relative overflow-hidden px-6 py-24"
    >
      {/* Decoración superior */}
      <img
        src="/assets/Flores_sup.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute
          left-1/2 top-0
          z-9
          w-[150%] max-w-full
          -translate-x-1/2
          translate-y-[-15%]"
      />

      <div className="relative z-10 mx-auto max-w-2xl rounded-2xl border border-[#E8E0DB] bg-white p-10 shadow-2xl">
        {/* =====================================================
            ENCABEZADO
        ====================================================== */}

        <div className="mb-12 text-center">
          <motion.h2
            initial={{
              opacity: 0,
              y: 15,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.7,
            }}
            className="mb-4 font-serif text-4xl text-[#6B1D36] md:text-5xl"
          >
            Confirmación
          </motion.h2>

          <motion.div
            initial={{
              opacity: 0,
              scaleX: 0,
            }}
            whileInView={{
              opacity: 1,
              scaleX: 1,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.7,
              delay: 0.15,
            }}
          >
            <img
              src="/assets/Separador.svg"
              alt=""
              className="mx-auto my-[1%] h-[clamp(20px,4vw,20px)] w-auto object-contain"
            />
          </motion.div>

          <div className="mt-5 rounded-2xl bg-[#6B1D36]/90 p-3 text-center">
            <p
              className="text-sm text-white"
              style={{
                fontFamily: "var(--font-sans)",
              }}
            >
              Por favor, responda antes del 10 de
              Diciembre de 2026
            </p>
          </div>
        </div>

        {/* =====================================================
            CONFIRMACIÓN EXITOSA
        ====================================================== */}

        {submitted ? (
          <div className="animate-fade-in rounded-lg border border-[#D4AF37] bg-[#FAF7F5] p-12 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37]">
              <Check className="h-8 w-8 text-white" />
            </div>

            <h3 className="mb-2 text-2xl text-[#6B1D36]">
              ¡Gracias!
            </h3>

            <p className="text-[#6B5B52]">
              Confirmación recibida para la familia{" "}
              <strong>
                {invitation?.apellidos_familia}
              </strong>
              .
            </p>

            <p className="mt-3 text-sm text-[#8A7A70]">
              Hemos registrado{" "}
              <strong>
                {invitation?.pases_utilizados}
              </strong>{" "}
              {invitation?.pases_utilizados === 1
                ? "persona"
                : "personas"}{" "}
              para nuestra celebración.
            </p>
          </div>
        ) : !invitation ? (
          /* ===================================================
             PASO 1: VALIDAR CÓDIGO
          ==================================================== */

          <form
            onSubmit={handleValidateCode}
            className="space-y-6"
          >
            <div>
              <label className="mb-2 block font-medium text-[#6B1D36]">
                Código de invitación *
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => {
                    const value =
                      e.target.value
                        .toUpperCase()
                        .replace(
                          /[^A-Z0-9-]/g,
                          "",
                        );

                    setCodigo(value);
                    setErrorMessage("");
                  }}
                  placeholder="Ej. KDY-A7F"
                  maxLength={7}
                  autoComplete="off"
                  className="w-full rounded-md border border-[#E8E0DB] px-4 py-3 pl-11 font-mono uppercase tracking-widest outline-none transition-all focus:border-[#D4AF37]"
                />

                <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              </div>

              <p className="mt-3 text-center text-xs text-[#8A7A70]">
                Ingresa el código que aparece en tu
                invitación.
              </p>
            </div>

            {/* Error de validación */}
            {errorMessage && (
              <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <p className="text-sm font-medium">
                  {errorMessage}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={
                isValidating ||
                codigo.trim().length === 0
              }
              className={`w-full rounded-md py-4 font-bold text-white shadow-md transition-all ${
                isValidating ||
                codigo.trim().length === 0
                  ? "cursor-not-allowed bg-gray-300"
                  : "bg-[#6B1D36] hover:bg-[#8B2E4A]"
              }`}
            >
              {isValidating
                ? "Verificando..."
                : "Buscar invitación"}
            </button>
          </form>
        ) : (
          /* ===================================================
             PASO 2: CONFIRMAR ASISTENCIA
          ==================================================== */

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Invitación encontrada */}
            <div className="rounded-xl border border-[#D4AF37]/40 bg-[#FAF7F5] p-5">
              <p className="text-xs uppercase tracking-wider text-[#8A7A70]">
                Invitación para
              </p>

              <p className="mt-1 text-xl font-semibold text-[#6B1D36]">
                {invitation.apellidos_familia}
              </p>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-[#6B5B52]">
                  Código
                </span>

                <span className="font-mono text-sm font-semibold tracking-wider text-[#6B1D36]">
                  {codigo}
                </span>
              </div>

              <button
                type="button"
                onClick={handleChangeCode}
                className="mt-4 text-sm font-medium text-[#6B1D36] underline underline-offset-2 transition-colors hover:text-[#8B2E4A]"
              >
                Usar otro código
              </button>
            </div>

            {/* Ya confirmó */}
            {invitation.asistencia ? (
              <div className="flex items-start gap-3 rounded-md border border-[#6B1D36]/20 bg-[#6B1D36]/10 p-4 text-[#6B1D36]">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="text-sm font-medium">
                    Esta invitación ya ha confirmado
                    su asistencia.
                  </p>

                  <p className="mt-1 text-xs opacity-80">
                    Si requiere realizar algún cambio,
                    contacte a los novios.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Número de personas */}
                <div>
                  <label className="mb-2 block font-medium text-[#6B1D36]">
                    Número de personas
                  </label>

                  <select
                    value={formData.guests}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guests: parseInt(
                          e.target.value,
                        ),
                      })
                    }
                    className="w-full rounded-md border border-[#E8E0DB] bg-white px-4 py-3"
                  >
                    {Array.from(
                      {
                        length:
                          invitation.cupo_maximo,
                      },
                      (_, i) => i + 1,
                    ).map((num) => (
                      <option
                        key={num}
                        value={num}
                      >
                        {num}{" "}
                        {num === 1
                          ? "persona"
                          : "personas"}
                      </option>
                    ))}
                  </select>

                  <p className="mt-2 text-xs text-[#8A7A70]">
                    Tu invitación tiene un cupo máximo
                    de{" "}
                    <strong>
                      {invitation.cupo_maximo}
                    </strong>{" "}
                    {invitation.cupo_maximo === 1
                      ? "persona"
                      : "personas"}
                    .
                  </p>
                </div>

                {/* Alergias / comentarios */}
                <div>
                  <label className="mb-2 block font-medium text-[#6B1D36]">
                    Alergias o Comentarios
                  </label>

                  <textarea
                    value={formData.dietary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dietary:
                          e.target.value,
                      })
                    }
                    placeholder="Ej: Alergia a los mariscos..."
                    className="w-full resize-none rounded-md border border-[#E8E0DB] px-4 py-3 outline-none transition-all focus:border-[#D4AF37]"
                    rows={3}
                  />
                </div>

                {/* Error */}
                {errorMessage && (
                  <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                    <p className="text-sm font-medium">
                      {errorMessage}
                    </p>
                  </div>
                )}

                {/* Confirmar */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full rounded-md py-4 font-bold text-white shadow-md transition-all ${
                    isLoading
                      ? "cursor-not-allowed bg-gray-300"
                      : "bg-[#6B1D36] hover:bg-[#8B2E4A]"
                  }`}
                >
                  {isLoading
                    ? "Guardando confirmación..."
                    : "Confirmar Asistencia"}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </section>
  );
}