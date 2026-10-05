import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Users,
  LogOut,
  Plus,
  Copy,
  Check,
  Search,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Ticket,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { supabase } from "../supabaseClient";

type Invitation = {
  id: string;
  apellidos_familia: string;
  cupo_maximo: number;
  pases_utilizados: number | null;
  asistencia: boolean | null;
  alergias: string | null;
  codigo_invitacion: string | null;
  activo: boolean;
  fecha_confirmacion: string | null;
};

type Section = "inicio" | "invitaciones" | "confirmaciones";

type ConfirmationFilter = "todos" | "confirmadas" | "pendientes";

export function AdminPanel() {
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState("");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeSection, setActiveSection] = useState<Section>("inicio");

  const [familyName, setFamilyName] = useState("");
  const [maxGuests, setMaxGuests] = useState(1);
  const [creating, setCreating] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [confirmationSearch, setConfirmationSearch] = useState("");

  const [confirmationFilter, setConfirmationFilter] =
    useState<ConfirmationFilter>("todos");

  const [editingInvitation, setEditingInvitation] = useState<Invitation | null>(
    null,
  );

  const [editForm, setEditForm] = useState({
    apellidos_familia: "",
    cupo_maximo: 1,
  });

  // =========================================================
  // VERIFICAR SESIÓN Y ADMIN
  // =========================================================

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        navigate("/admin/login");
        return;
      }

      setUserEmail(user.email || "");

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError || !admin) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      await loadInvitations();
    } catch (error) {
      console.error("Error verificando administrador:", error);
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CARGAR INVITACIONES
  // =========================================================

  const loadInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from("confirmaciones")
        .select(
          `
          id,
          apellidos_familia,
          cupo_maximo,
          pases_utilizados,
          asistencia,
          alergias,
          codigo_invitacion,
          activo,
          fecha_confirmacion
        `,
        )
        .order("apellidos_familia", { ascending: true });

      if (error) {
        throw error;
      }

      setInvitations(data || []);
    } catch (error) {
      console.error("Error cargando invitaciones:", error);
    }
  };

  // =========================================================
  // CREAR INVITACIÓN
  // =========================================================

  const handleCreateInvitation = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const cleanName = familyName.trim();

    if (!cleanName) {
      alert("Escribe los apellidos de la familia.");
      return;
    }

    if (maxGuests < 1) {
      alert("El cupo debe ser de al menos 1 persona.");
      return;
    }

    try {
      setCreating(true);

      const { data, error } = await supabase.rpc("crear_invitacion", {
        apellidos: cleanName,
        cupo: maxGuests,
      });

      if (error) {
        console.error("Error creando invitación:", error);
        alert(error.message || "No se pudo crear la invitación.");
        return;
      }

      if (!data || data.length === 0) {
        alert("La invitación no pudo ser creada.");
        return;
      }

      setFamilyName("");
      setMaxGuests(1);

      await loadInvitations();

      alert(
        `Invitación creada correctamente.\n\nCódigo: ${data[0].codigo_invitacion}`,
      );
    } catch (error) {
      console.error("Error inesperado:", error);
      alert("Ocurrió un error al crear la invitación.");
    } finally {
      setCreating(false);
    }
  };

  // =========================================================
  // COPIAR CÓDIGO
  // =========================================================

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);

      setCopiedCode(code);

      setTimeout(() => {
        setCopiedCode(null);
      }, 2000);
    } catch (error) {
      console.error("No se pudo copiar:", error);
    }
  };

  // =========================================================
  // ELIMINAR INVITACIÓN
  // =========================================================

  const handleDeleteInvitation = async (invitation: Invitation) => {
    const confirmed = window.confirm(
      `¿Estás segura de que deseas eliminar la invitación de la familia "${invitation.apellidos_familia}"?\n\nCódigo: ${invitation.codigo_invitacion}\n\nEsta acción no se puede deshacer.`,
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("confirmaciones")
        .delete()
        .eq("id", invitation.id);

      if (error) {
        console.error("Error eliminando invitación:", error);
        alert(error.message || "No se pudo eliminar la invitación.");
        return;
      }

      setInvitations((current) =>
        current.filter((item) => item.id !== invitation.id),
      );
    } catch (error) {
      console.error("Error inesperado:", error);
      alert("Ocurrió un error al eliminar la invitación.");
    }
  };

  // =========================================================
  // EDITAR INVITACIÓN
  // =========================================================

  const handleEditInvitation = (invitation: Invitation) => {
    setEditingInvitation(invitation);

    setEditForm({
      apellidos_familia: invitation.apellidos_familia,
      cupo_maximo: invitation.cupo_maximo,
    });
  };

  const handleUpdateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingInvitation) return;

    const apellidos = editForm.apellidos_familia.trim();
    const cupo = Number(editForm.cupo_maximo);

    if (!apellidos) {
      alert("Los apellidos son obligatorios.");
      return;
    }

    if (!Number.isInteger(cupo) || cupo < 1) {
      alert("El cupo debe ser un número entero mayor a 0.");
      return;
    }

    const pasesUtilizados = editingInvitation.pases_utilizados ?? 0;

    if (pasesUtilizados > cupo) {
      alert(
        `No puedes establecer un cupo menor a los ${pasesUtilizados} pases ya confirmados.`,
      );
      return;
    }

    try {
      const { data, error } = await supabase
        .from("confirmaciones")
        .update({
          apellidos_familia: apellidos,
          cupo_maximo: cupo,
        })
        .eq("id", editingInvitation.id)
        .select()
        .single();

      if (error) {
        console.error("Error actualizando invitación:", error);

        alert(error.message || "No se pudo actualizar la invitación.");

        return;
      }

      setInvitations((current) =>
        current.map((item) => (item.id === editingInvitation.id ? data : item)),
      );

      setEditingInvitation(null);
    } catch (error) {
      console.error("Error inesperado:", error);
      alert("Ocurrió un error al actualizar la invitación.");
    }
  };

  // =========================================================
  // CERRAR SESIÓN
  // =========================================================

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  // =========================================================
  // FILTRAR INVITACIONES
  // =========================================================

  const filteredInvitations = invitations.filter((invitation) => {
    const term = searchTerm.toLowerCase().trim();

    if (!term) return true;

    return (
      invitation.apellidos_familia.toLowerCase().includes(term) ||
      invitation.codigo_invitacion?.toLowerCase().includes(term)
    );
  });

  // =========================================================
  // ESTADÍSTICAS GENERALES
  // =========================================================

  const totalInvitations = invitations.length;

  const confirmedInvitations = invitations.filter(
    (invitation) => invitation.asistencia === true,
  ).length;

  const pendingInvitations = invitations.filter(
    (invitation) => invitation.asistencia !== true,
  ).length;

  // =========================================================
  // ESTADÍSTICAS DE CONFIRMACIONES
  // =========================================================

  const totalGuestsInvited = invitations.reduce(
    (total, invitation) => total + (invitation.cupo_maximo || 0),
    0,
  );

  const confirmedGuests = invitations.reduce(
    (total, invitation) =>
      total + (invitation.asistencia ? invitation.pases_utilizados || 0 : 0),
    0,
  );

  const availableGuests = Math.max(totalGuestsInvited - confirmedGuests, 0);

  const invitationsWithAllergies = invitations.filter(
    (invitation) =>
      invitation.asistencia === true &&
      invitation.alergias &&
      invitation.alergias.trim() !== "",
  );

  // =========================================================
  // FILTRO DE CONFIRMACIONES
  // =========================================================

  const filteredConfirmations = useMemo(() => {
    const term = confirmationSearch.toLowerCase().trim();

    return invitations.filter((invitation) => {
      // Filtro por estado
      if (
        confirmationFilter === "confirmadas" &&
        invitation.asistencia !== true
      ) {
        return false;
      }

      if (
        confirmationFilter === "pendientes" &&
        invitation.asistencia === true
      ) {
        return false;
      }

      // Filtro por búsqueda
      if (!term) return true;

      return (
        invitation.apellidos_familia.toLowerCase().includes(term) ||
        invitation.codigo_invitacion?.toLowerCase().includes(term) ||
        invitation.alergias?.toLowerCase().includes(term)
      );
    });
  }, [invitations, confirmationSearch, confirmationFilter]);

  // =========================================================
  // FORMATEAR FECHA
  // =========================================================

  const formatConfirmationDate = (date: string | null) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F5]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#E8E0DB] border-t-[#6B1D36]" />

          <p
            className="text-[#6B5B52]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Cargando administración...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PANEL
  // =========================================================

  return (
    <div className="min-h-screen bg-[#FAF7F5] text-[#4A403B]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-[#E8E0DB] bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#6B1D36]">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="font-serif text-xl text-[#6B1D36]">
                Administración
              </h1>

              <p
                className="text-sm text-[#8A7A70]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Katya & Daniel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span
              className="hidden text-sm text-[#6B5B52] md:block"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {userEmail}
            </span>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-md border border-[#E8E0DB] bg-white px-4 py-2 text-sm text-[#6B5B52] transition-colors hover:border-[#6B1D36] hover:text-[#6B1D36]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENIDO
      ===================================================== */}

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* ===================================================
            INICIO
        =================================================== */}

        {activeSection === "inicio" && (
          <>
            <div className="mb-10">
              <h2 className="font-serif text-3xl text-[#6B1D36] md:text-4xl">
                Panel de administración
              </h2>

              <p
                className="mt-2 text-[#6B5B52]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Administra las invitaciones y confirmaciones de los invitados.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* INVITACIONES */}

              <button
                onClick={() => setActiveSection("invitaciones")}
                className="group rounded-2xl border border-[#E8E0DB] bg-white p-7 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#6B1D36]/10">
                  <Users className="h-6 w-6 text-[#6B1D36]" />
                </div>

                <h3 className="mb-2 font-serif text-2xl text-[#6B1D36]">
                  Invitaciones
                </h3>

                <p
                  className="mb-5 text-sm leading-relaxed text-[#6B5B52]"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Crea y administra las invitaciones de las familias.
                </p>

                <div className="flex items-center justify-between border-t border-[#E8E0DB] pt-4">
                  <span
                    className="text-sm text-[#8A7A70]"
                    style={{
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {totalInvitations}{" "}
                    {totalInvitations === 1 ? "invitación" : "invitaciones"}
                  </span>

                  <span className="text-[#6B1D36] transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </button>

              {/* CONFIRMACIONES */}

              <button
                onClick={() => setActiveSection("confirmaciones")}
                className="group rounded-2xl border border-[#E8E0DB] bg-white p-7 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#D4AF37]/15">
                  <ShieldCheck className="h-6 w-6 text-[#B08D19]" />
                </div>

                <h3 className="mb-2 font-serif text-2xl text-[#6B1D36]">
                  Confirmaciones
                </h3>

                <p
                  className="mb-5 text-sm leading-relaxed text-[#6B5B52]"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Consulta el estado de asistencia de tus invitados.
                </p>

                <div className="flex items-center justify-between border-t border-[#E8E0DB] pt-4">
                  <span
                    className="text-sm text-[#8A7A70]"
                    style={{
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {confirmedInvitations} confirmadas
                  </span>

                  <span className="text-[#6B1D36] transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </button>

              {/* GESTIÓN DE INVITACIONES */}

              <button
                onClick={() => setActiveSection("invitaciones")}
                className="group rounded-2xl border border-[#E8E0DB] bg-white p-7 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#6B1D36]/10">
                  <Trash2 className="h-6 w-6 text-[#6B1D36]" />
                </div>

                <h3 className="mb-2 font-serif text-2xl text-[#6B1D36]">
                  Gestión de invitaciones
                </h3>

                <p
                  className="mb-5 text-sm leading-relaxed text-[#6B5B52]"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Administra tus invitaciones y elimina aquellas que ya no
                  necesites.
                </p>

                <div className="flex items-center justify-between border-t border-[#E8E0DB] pt-4">
                  <span
                    className="text-sm text-[#8A7A70]"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    Administrar
                  </span>

                  <span className="text-[#6B1D36] transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </button>
            </div>
          </>
        )}

        {/* ===================================================
            INVITACIONES
        =================================================== */}

        {activeSection === "invitaciones" && (
          <>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <button
                  onClick={() => setActiveSection("inicio")}
                  className="mb-4 flex items-center gap-2 text-sm text-[#6B1D36] transition-colors hover:text-[#8B2E4A]"
                  style={{
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver al panel
                </button>

                <h2 className="font-serif text-3xl text-[#6B1D36]">
                  Invitaciones
                </h2>

                <p
                  className="mt-1 text-[#6B5B52]"
                  style={{
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Crea y administra los códigos de acceso de tus invitados.
                </p>
              </div>
            </div>

            {/* ESTADÍSTICAS */}

            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[#E8E0DB] bg-white p-5 shadow-sm">
                <p
                  className="text-sm text-[#8A7A70]"
                  style={{
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Total de invitaciones
                </p>

                <p className="mt-1 font-serif text-3xl text-[#6B1D36]">
                  {totalInvitations}
                </p>
              </div>

              <div className="rounded-xl border border-[#E8E0DB] bg-white p-5 shadow-sm">
                <p
                  className="text-sm text-[#8A7A70]"
                  style={{
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Confirmadas
                </p>

                <p className="mt-1 font-serif text-3xl text-[#6B1D36]">
                  {confirmedInvitations}
                </p>
              </div>

              <div className="rounded-xl border border-[#E8E0DB] bg-white p-5 shadow-sm">
                <p
                  className="text-sm text-[#8A7A70]"
                  style={{
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Pendientes
                </p>

                <p className="mt-1 font-serif text-3xl text-[#6B1D36]">
                  {pendingInvitations}
                </p>
              </div>
            </div>

            {/* CREAR INVITACIÓN */}

            <div className="mb-8 rounded-2xl border border-[#E8E0DB] bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6">
                <h3 className="font-serif text-2xl text-[#6B1D36]">
                  Nueva invitación
                </h3>

                <p
                  className="mt-1 text-sm text-[#6B5B52]"
                  style={{
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Genera un código único para una familia.
                </p>
              </div>

              <form
                onSubmit={handleCreateInvitation}
                className="grid gap-5 md:grid-cols-[1fr_180px_auto] md:items-end"
              >
                <div>
                  <label
                    className="mb-2 block text-sm font-medium text-[#6B1D36]"
                    style={{
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    Apellidos de la familia
                  </label>

                  <input
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="Ej. Hernández López"
                    className="w-full rounded-lg border border-[#E8E0DB] px-4 py-3 outline-none transition-all focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10"
                    style={{
                      fontFamily: "var(--font-sans)",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-sm font-medium text-[#6B1D36]"
                    style={{
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    Número de pases
                  </label>

                  <select
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(Number(e.target.value))}
                    className="w-full rounded-lg border border-[#E8E0DB] bg-white px-4 py-3 outline-none transition-all focus:border-[#D4AF37]"
                    style={{
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {Array.from({ length: 15 }, (_, index) => index + 1).map(
                      (number) => (
                        <option key={number} value={number}>
                          {number} {number === 1 ? "persona" : "personas"}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#6B1D36] px-6 py-3 font-medium text-white transition-colors hover:bg-[#8B2E4A] disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <Plus className="h-4 w-4" />

                  {creating ? "Creando..." : "Crear invitación"}
                </button>
              </form>
            </div>

            {/* LISTADO */}

            <div className="rounded-2xl border border-[#E8E0DB] bg-white shadow-sm">
              <div className="border-b border-[#E8E0DB] p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-serif text-2xl text-[#6B1D36]">
                      Invitaciones registradas
                    </h3>

                    <p
                      className="mt-1 text-sm text-[#8A7A70]"
                      style={{
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {filteredInvitations.length}{" "}
                      {filteredInvitations.length === 1
                        ? "resultado"
                        : "resultados"}
                    </p>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9B8D85]" />

                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar familia o código..."
                      className="w-full rounded-lg border border-[#E8E0DB] py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#D4AF37]"
                      style={{
                        fontFamily: "var(--font-sans)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* TABLA DESKTOP */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E8E0DB] bg-[#FAF7F5]">
                      <th className="px-6 py-4 text-left">
                        <span
                          className="text-xs font-semibold uppercase tracking-wide text-[#8A7A70]"
                          style={{
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          Familia
                        </span>
                      </th>

                      <th className="px-6 py-4 text-left">
                        <span
                          className="text-xs font-semibold uppercase tracking-wide text-[#8A7A70]"
                          style={{
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          Código
                        </span>
                      </th>

                      <th className="px-6 py-4 text-center">
                        <span
                          className="text-xs font-semibold uppercase tracking-wide text-[#8A7A70]"
                          style={{
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          Pases
                        </span>
                      </th>

                      <th className="px-6 py-4 text-center">
                        <span
                          className="text-xs font-semibold uppercase tracking-wide text-[#8A7A70]"
                          style={{
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          Estado
                        </span>
                      </th>
                      <th className="px-6 py-4 text-center">
                        <span
                          className="text-xs font-semibold uppercase tracking-wide text-[#8A7A70]"
                          style={{ fontFamily: "var(--font-sans)" }}
                        >
                          Acciones
                        </span>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredInvitations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <p
                            className="text-[#8A7A70]"
                            style={{
                              fontFamily: "var(--font-sans)",
                            }}
                          >
                            No se encontraron invitaciones.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredInvitations.map((invitation) => (
                        <tr
                          key={invitation.id}
                          className="border-b border-[#E8E0DB] last:border-b-0"
                        >
                          <td className="px-6 py-4">
                            <p className="font-medium text-[#4A403B]">
                              {invitation.apellidos_familia}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-[#FAF7F5] px-3 py-1.5 font-mono text-sm font-semibold text-[#6B1D36]">
                                {invitation.codigo_invitacion || "—"}
                              </span>

                              {invitation.codigo_invitacion && (
                                <button
                                  onClick={() =>
                                    handleCopyCode(
                                      invitation.codigo_invitacion!,
                                    )
                                  }
                                  title="Copiar código"
                                  className="rounded-md p-2 text-[#8A7A70] transition-colors hover:bg-[#FAF7F5] hover:text-[#6B1D36]"
                                >
                                  {copiedCode ===
                                  invitation.codigo_invitacion ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <span className="text-sm text-[#6B5B52]">
                              {invitation.pases_utilizados || 0} /{" "}
                              {invitation.cupo_maximo}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-center">
                            {invitation.asistencia ? (
                              <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                Confirmada
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-[#FAF7F5] px-3 py-1 text-xs font-medium text-[#8A7A70]">
                                Pendiente
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteInvitation(invitation)}
                              title="Eliminar invitación"
                              className="inline-flex items-center justify-center rounded-lg p-2 text-[#8A7A70] transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditInvitation(invitation)}
                              title="Editar invitación"
                              className="inline-flex items-center justify-center rounded-lg p-2 text-[#8A7A70] transition-colors hover:bg-[#F8F0F2] hover:text-[#6B1D36]"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* TARJETAS MÓVIL */}

              <div className="divide-y divide-[#E8E0DB] md:hidden">
                {filteredInvitations.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p
                      className="text-[#8A7A70]"
                      style={{
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      No se encontraron invitaciones.
                    </p>
                  </div>
                ) : (
                  filteredInvitations.map((invitation) => (
                    <div key={invitation.id} className="p-5">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-medium text-[#4A403B]">
                            {invitation.apellidos_familia}
                          </h4>

                          <p
                            className="mt-1 text-xs text-[#8A7A70]"
                            style={{
                              fontFamily: "var(--font-sans)",
                            }}
                          >
                            Cupo máximo: {invitation.cupo_maximo}
                          </p>
                        </div>

                        {invitation.asistencia ? (
                          <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            Confirmada
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-[#FAF7F5] px-2.5 py-1 text-xs font-medium text-[#8A7A70]">
                            Pendiente
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between rounded-lg bg-[#FAF7F5] p-3">
                        <div>
                          <p
                            className="mb-1 text-xs text-[#8A7A70]"
                            style={{
                              fontFamily: "var(--font-sans)",
                            }}
                          >
                            Código
                          </p>

                          <span className="font-mono font-semibold text-[#6B1D36]">
                            {invitation.codigo_invitacion || "—"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          {invitation.codigo_invitacion && (
                            <button
                              onClick={() =>
                                handleCopyCode(invitation.codigo_invitacion!)
                              }
                              title="Copiar código"
                              className="rounded-md p-2 text-[#6B1D36] transition-colors hover:bg-white"
                            >
                              {copiedCode === invitation.codigo_invitacion ? (
                                <Check className="h-5 w-5 text-green-600" />
                              ) : (
                                <Copy className="h-5 w-5" />
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteInvitation(invitation)}
                            title="Eliminar invitación"
                            className="rounded-md p-2 text-[#8A7A70] transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-[#6B5B52]">
                        Pases utilizados:{" "}
                        <strong>
                          {invitation.pases_utilizados || 0} /{" "}
                          {invitation.cupo_maximo}
                        </strong>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* ===================================================
            CONFIRMACIONES
        =================================================== */}

        {activeSection === "confirmaciones" && (
          <>
            {/* CABECERA */}

            <div className="mb-8">
              <button
                onClick={() => setActiveSection("inicio")}
                className="mb-4 flex items-center gap-2 text-sm text-[#6B1D36] transition-colors hover:text-[#8B2E4A]"
                style={{
                  fontFamily: "var(--font-sans)",
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al panel
              </button>

              <h2 className="font-serif text-3xl text-[#6B1D36] md:text-4xl">
                Confirmaciones
              </h2>

              <p
                className="mt-2 text-[#6B5B52]"
                style={{
                  fontFamily: "var(--font-sans)",
                }}
              >
                Consulta el estado de asistencia de tus invitados.
              </p>
            </div>

            {/* =================================================
                ESTADÍSTICAS
            ================================================= */}

            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* FAMILIAS */}

              <div className="rounded-2xl border border-[#E8E0DB] bg-white p-5 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#6B1D36]/10">
                  <Users className="h-5 w-5 text-[#6B1D36]" />
                </div>

                <p
                  className="text-sm text-[#8A7A70]"
                  style={{
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Familias
                </p>

                <p className="mt-1 font-serif text-3xl text-[#6B1D36]">
                  {totalInvitations}
                </p>
              </div>

              {/* CONFIRMADAS */}

              <div className="rounded-2xl border border-[#E8E0DB] bg-white p-5 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                  <CheckCircle2 className="h-5 w-5 text-green-700" />
                </div>

                <p
                  className="text-sm text-[#8A7A70]"
                  style={{
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Confirmadas
                </p>

                <p className="mt-1 font-serif text-3xl text-[#6B1D36]">
                  {confirmedInvitations}
                </p>
              </div>

              {/* PENDIENTES */}

              <div className="rounded-2xl border border-[#E8E0DB] bg-white p-5 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF7F5]">
                  <Clock3 className="h-5 w-5 text-[#6B1D36]" />
                </div>

                <p
                  className="text-sm text-[#8A7A70]"
                  style={{
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Pendientes
                </p>

                <p className="mt-1 font-serif text-3xl text-[#6B1D36]">
                  {pendingInvitations}
                </p>
              </div>

              {/* PERSONAS */}

              <div className="rounded-2xl border border-[#E8E0DB] bg-white p-5 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#D4AF37]/15">
                  <Ticket className="h-5 w-5 text-[#B08D19]" />
                </div>

                <p
                  className="text-sm text-[#8A7A70]"
                  style={{
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Personas
                </p>

                <p className="mt-1 font-serif text-3xl text-[#6B1D36]">
                  {confirmedGuests}
                </p>
              </div>

              {/* DISPONIBLES */}

              <div className="rounded-2xl border border-[#E8E0DB] bg-white p-5 shadow-sm">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#6B1D36]/10">
                  <Users className="h-5 w-5 text-[#6B1D36]" />
                </div>

                <p
                  className="text-sm text-[#8A7A70]"
                  style={{
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Pases disponibles
                </p>

                <p className="mt-1 font-serif text-3xl text-[#6B1D36]">
                  {availableGuests}
                </p>
              </div>
            </div>

            {/* =================================================
                RESUMEN DE ASISTENCIA
            ================================================= */}

            <div className="mb-8 rounded-2xl border border-[#E8E0DB] bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-2xl text-[#6B1D36]">
                    Asistencia
                  </h3>

                  <p
                    className="mt-1 text-sm text-[#8A7A70]"
                    style={{
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {confirmedGuests} de {totalGuestsInvited} personas invitadas
                    han confirmado.
                  </p>
                </div>

                <span className="font-serif text-2xl text-[#6B1D36]">
                  {totalGuestsInvited > 0
                    ? Math.round((confirmedGuests / totalGuestsInvited) * 100)
                    : 0}
                  %
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-[#E8E0DB]">
                <div
                  className="h-full rounded-full bg-[#6B1D36] transition-all duration-500"
                  style={{
                    width: `${
                      totalGuestsInvited > 0
                        ? Math.min(
                            (confirmedGuests / totalGuestsInvited) * 100,
                            100,
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* =================================================
                BÚSQUEDA Y FILTROS
            ================================================= */}

            <div className="mb-6 rounded-2xl border border-[#E8E0DB] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* BUSCADOR */}

                <div className="relative w-full lg:max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9B8D85]" />

                  <input
                    type="text"
                    value={confirmationSearch}
                    onChange={(e) => setConfirmationSearch(e.target.value)}
                    placeholder="Buscar familia, código o comentario..."
                    className="w-full rounded-lg border border-[#E8E0DB] py-3 pl-9 pr-4 text-sm outline-none transition-all focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/10"
                    style={{
                      fontFamily: "var(--font-sans)",
                    }}
                  />
                </div>

                {/* FILTROS */}

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setConfirmationFilter("todos")}
                    className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                      confirmationFilter === "todos"
                        ? "bg-[#6B1D36] text-white"
                        : "border border-[#E8E0DB] bg-white text-[#6B5B52] hover:border-[#6B1D36]"
                    }`}
                    style={{
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    Todos
                  </button>

                  <button
                    onClick={() => setConfirmationFilter("confirmadas")}
                    className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                      confirmationFilter === "confirmadas"
                        ? "bg-[#6B1D36] text-white"
                        : "border border-[#E8E0DB] bg-white text-[#6B5B52] hover:border-[#6B1D36]"
                    }`}
                    style={{
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    Confirmadas
                  </button>

                  <button
                    onClick={() => setConfirmationFilter("pendientes")}
                    className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                      confirmationFilter === "pendientes"
                        ? "bg-[#6B1D36] text-white"
                        : "border border-[#E8E0DB] bg-white text-[#6B5B52] hover:border-[#6B1D36]"
                    }`}
                    style={{
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    Pendientes
                  </button>
                </div>
              </div>

              <p
                className="mt-4 text-xs text-[#8A7A70]"
                style={{
                  fontFamily: "var(--font-sans)",
                }}
              >
                Mostrando {filteredConfirmations.length}{" "}
                {filteredConfirmations.length === 1 ? "familia" : "familias"}
              </p>
            </div>

            {/* =================================================
                TABLA DE CONFIRMACIONES
            ================================================= */}

            <div className="mb-8 overflow-hidden rounded-2xl border border-[#E8E0DB] bg-white shadow-sm">
              {/* DESKTOP */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E8E0DB] bg-[#FAF7F5]">
                      <th className="px-5 py-4 text-left">
                        <span
                          className="text-xs font-semibold uppercase tracking-wide text-[#8A7A70]"
                          style={{
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          Familia
                        </span>
                      </th>

                      <th className="px-5 py-4 text-left">
                        <span
                          className="text-xs font-semibold uppercase tracking-wide text-[#8A7A70]"
                          style={{
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          Código
                        </span>
                      </th>

                      <th className="px-5 py-4 text-center">
                        <span
                          className="text-xs font-semibold uppercase tracking-wide text-[#8A7A70]"
                          style={{
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          Pases
                        </span>
                      </th>

                      <th className="px-5 py-4 text-center">
                        <span
                          className="text-xs font-semibold uppercase tracking-wide text-[#8A7A70]"
                          style={{
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          Estado
                        </span>
                      </th>

                      <th className="px-5 py-4 text-left">
                        <span
                          className="text-xs font-semibold uppercase tracking-wide text-[#8A7A70]"
                          style={{
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          Confirmación
                        </span>
                      </th>

                      <th className="px-5 py-4 text-left">
                        <span
                          className="text-xs font-semibold uppercase tracking-wide text-[#8A7A70]"
                          style={{
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          Alergias / comentarios
                        </span>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredConfirmations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <Search className="mx-auto mb-3 h-8 w-8 text-[#D0C5BE]" />

                          <p
                            className="text-[#8A7A70]"
                            style={{
                              fontFamily: "var(--font-sans)",
                            }}
                          >
                            No se encontraron familias con esos criterios.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredConfirmations.map((invitation) => (
                        <tr
                          key={invitation.id}
                          className="border-b border-[#E8E0DB] last:border-b-0"
                        >
                          {/* FAMILIA */}

                          <td className="px-5 py-4">
                            <p className="font-medium text-[#4A403B]">
                              {invitation.apellidos_familia}
                            </p>
                          </td>

                          {/* CÓDIGO */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-[#FAF7F5] px-2.5 py-1.5 font-mono text-xs font-semibold text-[#6B1D36]">
                                {invitation.codigo_invitacion || "—"}
                              </span>

                              {invitation.codigo_invitacion && (
                                <button
                                  onClick={() =>
                                    handleCopyCode(
                                      invitation.codigo_invitacion!,
                                    )
                                  }
                                  title="Copiar código"
                                  className="rounded-md p-1.5 text-[#8A7A70] transition-colors hover:bg-[#FAF7F5] hover:text-[#6B1D36]"
                                >
                                  {copiedCode ===
                                  invitation.codigo_invitacion ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>

                          {/* PASES */}

                          <td className="px-5 py-4 text-center">
                            {invitation.asistencia ? (
                              <span className="text-sm text-[#6B5B52]">
                                <strong>
                                  {invitation.pases_utilizados || 0}
                                </strong>{" "}
                                / {invitation.cupo_maximo}
                              </span>
                            ) : (
                              <span className="text-sm text-[#8A7A70]">
                                — / {invitation.cupo_maximo}
                              </span>
                            )}
                          </td>

                          {/* ESTADO */}

                          <td className="px-5 py-4 text-center">
                            {invitation.asistencia ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Confirmada
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF7F5] px-3 py-1 text-xs font-medium text-[#8A7A70]">
                                <Clock3 className="h-3.5 w-3.5" />
                                Pendiente
                              </span>
                            )}
                          </td>

                          {/* FECHA */}

                          <td className="px-5 py-4">
                            <span
                              className="text-sm text-[#6B5B52]"
                              style={{
                                fontFamily: "var(--font-sans)",
                              }}
                            >
                              {formatConfirmationDate(
                                invitation.fecha_confirmacion,
                              )}
                            </span>
                          </td>

                          {/* ALERGIAS */}

                          <td className="max-w-xs px-5 py-4">
                            {invitation.alergias &&
                            invitation.alergias.trim() !== "" ? (
                              <div className="flex items-start gap-2">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#B08D19]" />

                                <span
                                  className="text-sm leading-relaxed text-[#6B5B52]"
                                  style={{
                                    fontFamily: "var(--font-sans)",
                                  }}
                                >
                                  {invitation.alergias}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-[#B8ACA5]">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* MÓVIL */}

              <div className="divide-y divide-[#E8E0DB] md:hidden">
                {filteredConfirmations.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <Search className="mx-auto mb-3 h-8 w-8 text-[#D0C5BE]" />

                    <p
                      className="text-sm text-[#8A7A70]"
                      style={{
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      No se encontraron familias.
                    </p>
                  </div>
                ) : (
                  filteredConfirmations.map((invitation) => (
                    <div key={invitation.id} className="p-5">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-medium text-[#4A403B]">
                            {invitation.apellidos_familia}
                          </h4>

                          <div className="mt-1 flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-[#6B1D36]">
                              {invitation.codigo_invitacion || "—"}
                            </span>

                            {invitation.codigo_invitacion && (
                              <button
                                onClick={() =>
                                  handleCopyCode(invitation.codigo_invitacion!)
                                }
                                className="text-[#8A7A70]"
                              >
                                {copiedCode === invitation.codigo_invitacion ? (
                                  <Check className="h-3.5 w-3.5 text-green-600" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {invitation.asistencia ? (
                          <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            Confirmada
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-[#FAF7F5] px-2.5 py-1 text-xs font-medium text-[#8A7A70]">
                            Pendiente
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-[#FAF7F5] p-3">
                          <p
                            className="text-xs text-[#8A7A70]"
                            style={{
                              fontFamily: "var(--font-sans)",
                            }}
                          >
                            Pases
                          </p>

                          <p className="mt-1 text-sm font-medium text-[#6B1D36]">
                            {invitation.asistencia
                              ? invitation.pases_utilizados || 0
                              : 0}{" "}
                            / {invitation.cupo_maximo}
                          </p>
                        </div>

                        <div className="rounded-lg bg-[#FAF7F5] p-3">
                          <p
                            className="text-xs text-[#8A7A70]"
                            style={{
                              fontFamily: "var(--font-sans)",
                            }}
                          >
                            Confirmación
                          </p>

                          <p className="mt-1 text-sm text-[#6B5B52]">
                            {formatConfirmationDate(
                              invitation.fecha_confirmacion,
                            )}
                          </p>
                        </div>
                      </div>

                      {invitation.alergias &&
                        invitation.alergias.trim() !== "" && (
                          <div className="mt-3 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#B08D19]" />

                              <div>
                                <p className="mb-1 text-xs font-medium text-[#8A6D12]">
                                  Alergias / comentarios
                                </p>

                                <p
                                  className="text-sm leading-relaxed text-[#6B5B52]"
                                  style={{
                                    fontFamily: "var(--font-sans)",
                                  }}
                                >
                                  {invitation.alergias}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* =================================================
                ALERGIAS Y COMENTARIOS
            ================================================= */}

            {invitationsWithAllergies.length > 0 && (
              <div className="rounded-2xl border border-[#D4AF37]/30 bg-white shadow-sm">
                <div className="border-b border-[#E8E0DB] p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/15">
                      <AlertCircle className="h-5 w-5 text-[#B08D19]" />
                    </div>

                    <div>
                      <h3 className="font-serif text-2xl text-[#6B1D36]">
                        Alergias y comentarios
                      </h3>

                      <p
                        className="mt-1 text-sm text-[#6B5B52]"
                        style={{
                          fontFamily: "var(--font-sans)",
                        }}
                      >
                        {invitationsWithAllergies.length}{" "}
                        {invitationsWithAllergies.length === 1
                          ? "familia ha"
                          : "familias han"}{" "}
                        indicado información especial.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-[#E8E0DB]">
                  {invitationsWithAllergies.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-[#4A403B]">
                          {invitation.apellidos_familia}
                        </p>

                        <p
                          className="mt-1 font-mono text-xs text-[#8A7A70]"
                          style={{
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          {invitation.codigo_invitacion}
                        </p>
                      </div>

                      <div className="rounded-lg bg-[#FAF7F5] p-3 sm:max-w-xl">
                        <p
                          className="text-sm leading-relaxed text-[#6B5B52]"
                          style={{
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          {invitation.alergias}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SIN ALERGIAS */}

            {invitations.length > 0 &&
              invitationsWithAllergies.length === 0 && (
                <div className="rounded-2xl border border-[#E8E0DB] bg-white p-8 text-center shadow-sm">
                  <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-green-600" />

                  <h3 className="font-serif text-xl text-[#6B1D36]">
                    Sin alergias registradas
                  </h3>

                  <p
                    className="mt-1 text-sm text-[#8A7A70]"
                    style={{
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    Ninguna familia ha indicado alergias o comentarios
                    especiales.
                  </p>
                </div>
              )}
          </>
        )}

        {editingInvitation && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-[#3E2A2F]">
                  Editar invitación
                </h2>

                <p className="mt-1 text-sm text-[#8A7A70]">
                  Actualiza los datos de esta familia.
                </p>
              </div>

              <form onSubmit={handleUpdateInvitation} className="space-y-5">
                <div>
                  <label
                    htmlFor="edit-apellidos"
                    className="mb-2 block text-sm font-medium text-[#5A464D]"
                  >
                    Apellidos de la familia
                  </label>

                  <input
                    id="edit-apellidos"
                    type="text"
                    value={editForm.apellidos_familia}
                    onChange={(e) =>
                      setEditForm((current) => ({
                        ...current,
                        apellidos_familia: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-[#E5DADD] px-4 py-3 text-sm outline-none transition focus:border-[#6B1D36] focus:ring-2 focus:ring-[#6B1D36]/10"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-cupo"
                    className="mb-2 block text-sm font-medium text-[#5A464D]"
                  >
                    Cupo máximo
                  </label>

                  <input
                    id="edit-cupo"
                    type="number"
                    min={1}
                    value={editForm.cupo_maximo}
                    onChange={(e) =>
                      setEditForm((current) => ({
                        ...current,
                        cupo_maximo: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-[#E5DADD] px-4 py-3 text-sm outline-none transition focus:border-[#6B1D36] focus:ring-2 focus:ring-[#6B1D36]/10"
                    required
                  />
                </div>

                <div className="rounded-xl bg-[#FAF7F5] p-4">
                  <p className="text-xs text-[#8A7A70]">Código de invitación</p>

                  <p className="mt-1 font-mono font-semibold text-[#6B1D36]">
                    {editingInvitation.codigo_invitacion}
                  </p>

                  <p className="mt-2 text-xs text-[#A18F96]">
                    El código no se puede modificar.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingInvitation(null)}
                    className="rounded-xl border border-[#E5DADD] px-5 py-2.5 text-sm font-medium text-[#6B1D36] transition hover:bg-[#FAF7F5]"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-[#6B1D36] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#58172C]"
                  >
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
