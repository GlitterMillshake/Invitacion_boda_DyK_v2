import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../supabaseClient";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

export function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage("");
    setLoading(true);

    try {
      // 1. Iniciar sesión con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("No se pudo obtener el usuario.");
      }

      // 2. Comprobar que el usuario realmente es administrador
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (adminError) {
        // Cerramos la sesión si no podemos comprobar los permisos
        await supabase.auth.signOut();
        throw new Error("No se pudieron verificar los permisos.");
      }

      if (!adminUser) {
        await supabase.auth.signOut();

        throw new Error(
          "Este usuario no tiene permisos para acceder al panel."
        );
      }

      // 3. Usuario autenticado y autorizado
      navigate("/admin");
    } catch (error: any) {
      console.error("Error de inicio de sesión:", error);

      setErrorMessage(
        error?.message ||
          "No se pudo iniciar sesión. Verifica tus datos."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF7F5] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#6B1D36] shadow-lg">
            <Lock className="h-7 w-7 text-white" />
          </div>

          <h1 className="font-serif text-4xl text-[#6B1D36]">
            Administración
          </h1>

          <p className="mt-2 text-[#6B5B52]">
            Gestión de invitaciones y confirmaciones
          </p>
        </div>

        {/* Tarjeta */}
        <div className="rounded-2xl border border-[#E8E0DB] bg-white p-8 shadow-xl">

          <form onSubmit={handleLogin} className="space-y-6">

            {/* Correo */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block font-medium text-[#6B1D36]"
              >
                Correo electrónico
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ejemplo.com"
                  autoComplete="email"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-[#E8E0DB] bg-white py-3 pl-11 pr-4 outline-none transition focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block font-medium text-[#6B1D36]"
              >
                Contraseña
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-[#E8E0DB] bg-white py-3 pl-11 pr-4 outline-none transition focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <p>{errorMessage}</p>
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#6B1D36] py-3.5 font-bold text-white shadow-md transition hover:bg-[#8B2E4A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>

          </form>
        </div>

        {/* Regresar */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-6 block w-full text-center text-sm text-[#6B5B52] transition hover:text-[#6B1D36]"
        >
          ← Regresar a la invitación
        </button>
      </div>
    </main>
  );
}