"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Sliders, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  MapPin, 
  DollarSign, 
  Maximize2, 
  UserPlus,
  ShieldCheck,
  Building,
  Check,
  X,
  Pencil,
  Lock
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from "firebase/firestore";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  category: "Cocina" | "Cabina" | "Animación" | "Valet Parking" | "Meseros" | "Show" | "Fotógrafo" | "Otro";
  email: string;
  status: "Activo" | "Inactivo";
}

export default function SettingsManager() {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<"staff" | "salon" | "roles">("staff");
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  
  const isGlobalEditable = user?.role === "admin" || user?.role === "dueño";

  // Reactive Staff Members Data from Firestore
  const [staff, setStaff] = useState<StaffMember[]>([]);

  // Form states for new staff
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newCategory, setNewCategory] = useState<"Cocina" | "Cabina" | "Animación" | "Valet Parking" | "Meseros" | "Show" | "Fotógrafo" | "Otro">("Cocina");
  const [newEmail, setNewEmail] = useState("");

  // Salon configurations state
  const [salonName, setSalonName] = useState("Grand Salón Imperial");
  const [salonAddress, setSalonAddress] = useState("Av. Las Lomas #450, Ciudad VIP");
  const [baseRent, setBaseRent] = useState("5000");
  const [securityDeposit, setSecurityDeposit] = useState("1500");
  const [openSeatingMode, setOpenSeatingMode] = useState<boolean | "hibrido">(false);
  const [isSaved, setIsSaved] = useState(false);

  // Time Offsets values and units states
  const [offsetValCocina, setOffsetValCocina] = useState(4);
  const [offsetUnitCocina, setOffsetUnitCocina] = useState<"horas" | "minutos">("horas");

  const [offsetValMeseros, setOffsetValMeseros] = useState(3);
  const [offsetUnitMeseros, setOffsetUnitMeseros] = useState<"horas" | "minutos">("horas");

  const [offsetValCabina, setOffsetValCabina] = useState(2);
  const [offsetUnitCabina, setOffsetUnitCabina] = useState<"horas" | "minutos">("horas");

  const [offsetValAnimacion, setOffsetValAnimacion] = useState(1);
  const [offsetUnitAnimacion, setOffsetUnitAnimacion] = useState<"horas" | "minutos">("horas");

  const [offsetValValet, setOffsetValValet] = useState(1);
  const [offsetUnitValet, setOffsetUnitValet] = useState<"horas" | "minutos">("horas");

  const [offsetValShow, setOffsetValShow] = useState(0);
  const [offsetUnitShow, setOffsetUnitShow] = useState<"horas" | "minutos">("horas");

  const [offsetValFotografo, setOffsetValFotografo] = useState(1);
  const [offsetUnitFotografo, setOffsetUnitFotografo] = useState<"horas" | "minutos">("horas");

  // Editable Physical Salon Limits (Only by dueño / admin)
  const [salonWidth, setSalonWidth] = useState(12);
  const [salonLength, setSalonLength] = useState(30);
  const [danceFloorWidth, setDanceFloorWidth] = useState(4.0);
  const [balconyTablesCount, setBalconyTablesCount] = useState(3);
  const [balconyMarginPx, setBalconyMarginPx] = useState(5);

  // Role permissions state
  const [rolePermissions, setRolePermissions] = useState([
    { 
      role: "admin", 
      label: "Admin Master", 
      desc: "Acceso total a código, bases de datos y configuraciones.", 
      modules: { dashboard: true, mesas: true, calendario: true, cotizaciones: true, finanzas: true, cronograma: true, escáner: true, config: true } 
    },
    { 
      role: "dueño", 
      label: "Dueño / Propietario", 
      desc: "Acceso total al negocio, finanzas, métricas y gestión de toda la plantilla.", 
      modules: { dashboard: true, mesas: true, calendario: true, cotizaciones: true, finanzas: true, cronograma: true, escáner: true, config: true } 
    },
    { 
      role: "gerencia", 
      label: "Gerencia", 
      desc: "Permisos altos. Crea eventos, cronograma y lanza convocatoria. Sin finanzas.", 
      modules: { dashboard: true, mesas: true, calendario: true, cotizaciones: true, finanzas: false, cronograma: true, escáner: true, config: false } 
    },
    { 
      role: "host", 
      label: "Host / Hostess", 
      desc: "Área de recepción: lista de invitados, croquis, check-in y escáner QR.", 
      modules: { dashboard: true, mesas: true, calendario: true, cotizaciones: false, finanzas: false, cronograma: false, escáner: true, config: false } 
    },
    { 
      role: "staff", 
      label: "Personal (Staff)", 
      desc: "Solo lectura. Consulta de eventos asignados y horarios de llegada.", 
      modules: { dashboard: true, mesas: false, calendario: true, cotizaciones: false, font_mono: false, finanzas: false, cronograma: true, escáner: false, config: false } 
    },
  ]);
  const [isRolesSaved, setIsRolesSaved] = useState(false);

  // Load and subscribe from Firestore (with seeding fallback)
  useEffect(() => {
    if (!db) return;

    // 1. Subscribe to Staff Collection
    const staffRef = collection(db, "staff");
    const unsubscribeStaff = onSnapshot(staffRef, (snapshot) => {
      const staffList: StaffMember[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        staffList.push({
          id: doc.id,
          name: data.name,
          role: data.role,
          category: data.category,
          email: data.email,
          status: data.status,
        });
      });

      if (snapshot.empty) {
        // Initial Seeding
        const defaults: StaffMember[] = [
          { id: "1", name: "Sofía Montenegro", role: "Coordinadora", category: "Animación", email: "sofia.m@socialesvip.com", status: "Activo" },
          { id: "2", name: "Carlos Mendoza", role: "DJ Residente", category: "Cabina", email: "carlos.dj@socialesvip.com", status: "Activo" },
          { id: "3", name: "Eduardo Pérez", role: "Jefe de Bartenders", category: "Show", email: "eduardo.p@socialesvip.com", status: "Activo" },
          { id: "4", name: "Pedro Ruiz", role: "Chef Ejecutivo", category: "Cocina", email: "pedro.c@socialesvip.com", status: "Activo" },
          { id: "5", name: "Mariana Rojas", role: "Jefa de Servicio", category: "Meseros", email: "mariana.r@socialesvip.com", status: "Inactivo" },
          { id: "6", name: "Juan Gómez", role: "Supervisor Parking", category: "Valet Parking", email: "juan.g@socialesvip.com", status: "Activo" },
          { id: "7", name: "Esteban Vega", role: "Fotógrafo Oficial", category: "Fotógrafo", email: "esteban.v@socialesvip.com", status: "Activo" },
        ];
        defaults.forEach(async (member) => {
          await setDoc(doc(db, "staff", member.id), {
            name: member.name,
            role: member.role,
            category: member.category,
            email: member.email,
            status: member.status,
          });
        });
        setStaff(defaults);
      } else {
        setStaff(staffList);
      }
    });

    // 2. Subscribe to Salon settings
    const salonDocRef = doc(db, "settings", "salon");
    const unsubscribeSalon = onSnapshot(salonDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSalonName(data.salonName || "Grand Salón Imperial");
        setSalonAddress(data.salonAddress || "Av. Las Lomas #450, Ciudad VIP");
        setBaseRent(data.baseRent || "5000");
        setSecurityDeposit(data.securityDeposit || "1500");

        setOffsetValCocina(data.offsetValCocina ?? 4);
        setOffsetUnitCocina(data.offsetUnitCocina || "horas");
        setOffsetValMeseros(data.offsetValMeseros ?? 3);
        setOffsetUnitMeseros(data.offsetUnitMeseros || "horas");
        setOffsetValCabina(data.offsetValCabina ?? 2);
        setOffsetUnitCabina(data.offsetUnitCabina || "horas");
        setOffsetValAnimacion(data.offsetValAnimacion ?? 1);
        setOffsetUnitAnimacion(data.offsetUnitAnimacion || "horas");
        setOffsetValValet(data.offsetValValet ?? 1);
        setOffsetUnitValet(data.offsetUnitValet || "horas");
        setOffsetValShow(data.offsetValShow ?? 0);
        setOffsetUnitShow(data.offsetUnitShow || "horas");
        setOffsetValFotografo(data.offsetValFotografo ?? 1);
        setOffsetUnitFotografo(data.offsetUnitFotografo || "horas");

        setSalonWidth(data.salonWidth ?? 12);
        setSalonLength(data.salonLength ?? 30);
        setDanceFloorWidth(data.danceFloorWidth ?? 4.0);
        setBalconyTablesCount(data.balconyTablesCount ?? 3);
        setBalconyMarginPx(data.balconyMarginPx ?? 5);

        if (data.openSeatingMode !== undefined) {
          setOpenSeatingMode(data.openSeatingMode);
        } else {
          setOpenSeatingMode(false);
        }
      }
    });

    // 3. Subscribe to Roles permissions
    const rolesDocRef = doc(db, "settings", "roles");
    const unsubscribeRoles = onSnapshot(rolesDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.permissions) {
          setRolePermissions(data.permissions);
        }
      }
    });

    return () => {
      unsubscribeStaff();
      unsubscribeSalon();
      unsubscribeRoles();
    };
  }, [db]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRole || !newEmail) return;

    const id = Date.now().toString();
    await setDoc(doc(db, "staff", id), {
      name: newName,
      role: newRole,
      category: newCategory,
      email: newEmail,
      status: "Activo"
    });

    setNewName("");
    setNewRole("");
    setNewEmail("");
  };

  const handleToggleStatus = async (id: string) => {
    const member = staff.find(m => m.id === id);
    if (!member) return;
    await updateDoc(doc(db, "staff", id), {
      status: member.status === "Activo" ? "Inactivo" : "Activo"
    });
  };

  const handleDeleteStaff = async (id: string) => {
    await deleteDoc(doc(db, "staff", id));
  };

  const handleSaveSalon = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      salonName,
      salonAddress,
      baseRent,
      securityDeposit,
      openSeatingMode,
      offsetValCocina,
      offsetUnitCocina,
      offsetValMeseros,
      offsetUnitMeseros,
      offsetValCabina,
      offsetUnitCabina,
      offsetValAnimacion,
      offsetUnitAnimacion,
      offsetValValet,
      offsetUnitValet,
      offsetValShow,
      offsetUnitShow,
      offsetValFotografo,
      offsetUnitFotografo
    };

    if (isGlobalEditable) {
      payload.salonWidth = salonWidth;
      payload.salonLength = salonLength;
      payload.danceFloorWidth = danceFloorWidth;
      payload.balconyTablesCount = balconyTablesCount;
      payload.balconyMarginPx = balconyMarginPx;
    }

    await setDoc(doc(db, "settings", "salon"), payload, { merge: true });

    // Also write to local storage as fallback/quick access
    if (typeof window !== "undefined") {
      localStorage.setItem("svip_offset_val_Cocina", String(offsetValCocina));
      localStorage.setItem("svip_offset_unit_Cocina", offsetUnitCocina);
      localStorage.setItem("svip_offset_val_Meseros", String(offsetValMeseros));
      localStorage.setItem("svip_offset_unit_Meseros", offsetUnitMeseros);
      localStorage.setItem("svip_offset_val_Cabina", String(offsetValCabina));
      localStorage.setItem("svip_offset_unit_Cabina", offsetUnitCabina);
      localStorage.setItem("svip_offset_val_Animacion", String(offsetValAnimacion));
      localStorage.setItem("svip_offset_unit_Animacion", offsetUnitAnimacion);
      localStorage.setItem("svip_offset_val_Valet", String(offsetValValet));
      localStorage.setItem("svip_offset_unit_Valet", offsetUnitValet);
      localStorage.setItem("svip_offset_val_Show", String(offsetValShow));
      localStorage.setItem("svip_offset_unit_Show", offsetUnitShow);
      localStorage.setItem("svip_offset_val_Fotografo", String(offsetValFotografo));
      localStorage.setItem("svip_offset_unit_Fotografo", offsetUnitFotografo);
      if (isGlobalEditable) {
        localStorage.setItem("svip_param_salonWidth", String(salonWidth));
        localStorage.setItem("svip_param_salonLength", String(salonLength));
        localStorage.setItem("svip_param_danceFloorWidth", String(danceFloorWidth));
        localStorage.setItem("svip_param_balconyTablesCount", String(balconyTablesCount));
        localStorage.setItem("svip_param_balconyMarginPx", String(balconyMarginPx));
      }
    }

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleTogglePermission = (roleIdx: number, moduleKey: string) => {
    const updated = [...rolePermissions];
    const roleObj = updated[roleIdx];
    const mods = roleObj.modules as any;
    mods[moduleKey] = !mods[moduleKey];
    setRolePermissions(updated);
  };

  const handleSaveRoles = async () => {
    await setDoc(doc(db, "settings", "roles"), { permissions: rolePermissions }, { merge: true });
    setIsRolesSaved(true);
    setTimeout(() => setIsRolesSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <span className="text-[10px] text-gold tracking-widest font-semibold uppercase">
            Admin Master Control
          </span>
          <h1 className="text-2xl font-semibold text-white tracking-wide mt-1">
            Personal & Configuración
          </h1>
        </div>

        {/* Sub Tabs Toggle */}
        <div className="flex flex-wrap bg-white/5 p-1 rounded-lg border border-white/5 shrink-0 self-start md:self-auto gap-1">
          <button
            onClick={() => setActiveSubTab("staff")}
            className={`py-1.5 px-4 rounded-md text-xs tracking-wide transition-all duration-300 flex items-center gap-2 ${
              activeSubTab === "staff"
                ? "bg-gold text-obsidian font-semibold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Gestionar Personal
          </button>
          {user?.role !== "gerencia" && (
            <button
              onClick={() => setActiveSubTab("roles")}
              className={`py-1.5 px-4 rounded-md text-xs tracking-wide transition-all duration-300 flex items-center gap-2 ${
                activeSubTab === "roles"
                  ? "bg-gold text-obsidian font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Roles & Permisos
            </button>
          )}
          <button
            onClick={() => setActiveSubTab("salon")}
            className={`py-1.5 px-4 rounded-md text-xs tracking-wide transition-all duration-300 flex items-center gap-2 ${
              activeSubTab === "salon"
                ? "bg-gold text-obsidian font-semibold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            Configuración del Salón
          </button>
        </div>
      </div>

      {/* Staff Management Content */}
      {activeSubTab === "staff" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Staff Member Form */}
          <div className="glass-dark rounded-2xl p-6 border border-white/5 h-fit lg:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <UserPlus className="text-gold h-4 w-4" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Registrar Personal
              </h3>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30 font-light"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                    Categoría (Tag)
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30"
                  >
                    <option value="Cocina">Cocina</option>
                    <option value="Cabina">Cabina</option>
                    <option value="Animación">Animación</option>
                    <option value="Valet Parking">Valet Parking</option>
                    <option value="Meseros">Meseros</option>
                    <option value="Show">Show</option>
                    <option value="Fotógrafo">Fotógrafo</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                    Puesto / Puesto
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Chef, Mesero B"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30 font-light"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  placeholder="juan@socialesvip.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30 font-light"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gold text-obsidian rounded-xl text-xs font-semibold uppercase hover:bg-gold-hover transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] mt-2 shadow-[0_4px_15px_rgba(212,175,55,0.15)]"
              >
                <Plus className="h-4 w-4" />
                Agregar al Equipo
              </button>
            </form>
          </div>

          {/* Staff Members List */}
          <div className="glass-dark rounded-2xl p-6 border border-white/5 lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="text-gold h-4 w-4" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Personal Activo del Salón
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-light">
                <thead>
                  <tr className="text-gray-400 border-b border-white/5 uppercase text-[9px] tracking-wider font-mono">
                    <th className="py-3 px-4">Miembro</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Puesto / Rol</th>
                    <th className="py-3 px-4">Contacto</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {staff.map((member) => (
                    <tr key={member.id} className="text-gray-300 hover:bg-white/[0.01]">
                      <td className="py-4 px-4 font-normal text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20 text-gold font-bold text-xs uppercase">
                            {member.name.substring(0, 2)}
                          </div>
                          <span>{member.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="bg-gold/10 border border-gold/20 text-gold px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider">
                          {member.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-400 text-[11px] font-light">
                          {member.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-[10px] text-gray-400">
                        {member.email}
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleStatus(member.id)}
                          className={`px-2 py-1 rounded text-[10px] font-semibold tracking-wide ${
                            member.status === "Activo"
                              ? "bg-green-500/10 border border-green-500/20 text-green-400"
                              : "bg-red-500/10 border border-red-500/20 text-red-400"
                          }`}
                        >
                          {member.status}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingStaff(member)}
                            className="p-1.5 bg-gold/10 hover:bg-gold/25 border border-gold/20 text-gold rounded-lg transition-all duration-300"
                            title="Editar Perfil"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(member.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all duration-300"
                            title="Eliminar Personal"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {staff.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 italic">
                        No hay personal registrado en el salón.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Roles & Permisos Tab */}
      {activeSubTab === "roles" && (
        <div className="glass-dark rounded-2xl p-6 border border-white/5 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-gold h-4 w-4" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Matriz de Roles y Permisos de Módulos (RBAC)
              </h3>
            </div>
            <div className="flex items-center gap-3">
              {isRolesSaved && (
                <span className="text-xs text-green-400 flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                  Permisos de Rol guardados
                </span>
              )}
              <button
                onClick={handleSaveRoles}
                className="py-2 px-5 bg-gold text-obsidian rounded-xl text-xs font-semibold uppercase hover:bg-gold-hover transition-all duration-300"
              >
                Guardar Matriz
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-light">
              <thead>
                <tr className="text-gray-400 border-b border-white/5 uppercase text-[9px] tracking-wider font-mono">
                  <th className="py-3 px-4 w-1/4">Rol y Descripción</th>
                  <th className="py-3 px-2 text-center">Dashboard</th>
                  <th className="py-3 px-2 text-center">Plan Mesas</th>
                  <th className="py-3 px-2 text-center">Calendario</th>
                  <th className="py-3 px-2 text-center">Cotizaciones</th>
                  <th className="py-3 px-2 text-center">Finanzas</th>
                  <th className="py-3 px-2 text-center">Cronograma</th>
                  <th className="py-3 px-2 text-center">Escáner QR</th>
                  <th className="py-3 px-2 text-center">Config System</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rolePermissions.map((roleObj, roleIdx) => {
                  const mods = roleObj.modules as any;
                  return (
                    <tr key={roleObj.role} className="text-gray-300 hover:bg-white/[0.01]">
                      <td className="py-4 px-4">
                        <h4 className="text-xs font-semibold text-white">{roleObj.label}</h4>
                        <p className="text-[10px] text-gray-500 font-light mt-1 leading-normal">
                          {roleObj.desc}
                        </p>
                      </td>
                      
                      {Object.keys(roleObj.modules).map((moduleKey) => {
                        const isChecked = mods[moduleKey];
                        const isDisabled = roleObj.role === "admin";

                        return (
                          <td key={moduleKey} className="py-4 px-2 text-center">
                            <button
                              disabled={isDisabled}
                              onClick={() => handleTogglePermission(roleIdx, moduleKey)}
                              className={`w-6 h-6 rounded-lg border transition-all duration-300 flex items-center justify-center mx-auto ${
                                isChecked
                                  ? "bg-gold/10 border-gold text-gold"
                                  : "bg-white/5 border-white/10 text-gray-600 hover:border-white/20"
                              } ${isDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              {isChecked ? <Check className="h-3.5 w-3.5" /> : <X className="h-2.5 w-2.5" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Salon Settings Content */}
      {activeSubTab === "salon" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Salon Info Form */}
          <div className="glass-dark rounded-2xl p-6 border border-white/5 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Building className="text-gold h-4 w-4" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Configuración de Parámetros Físicos & Operativos
              </h3>
            </div>

            <form onSubmit={handleSaveSalon} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                    Nombre del Salón
                  </label>
                  <input
                    type="text"
                    required
                    value={salonName}
                    onChange={(e) => setSalonName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30 font-light"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                    Modo Distribución de Asientos
                  </label>
                  <select
                    value={openSeatingMode === true ? "libre" : openSeatingMode === "hibrido" ? "hibrido" : "fijo"}
                    onChange={(e) => {
                      if (e.target.value === "hibrido") {
                        setOpenSeatingMode("hibrido");
                      } else {
                        setOpenSeatingMode(e.target.value === "libre" ? true : false);
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30"
                  >
                    <option value="fijo">Asignación Fija (Listado & Croquis)</option>
                    <option value="libre">Aforo Libre (Orden de Llegada)</option>
                    <option value="hibrido">Híbrido (Asignación VIP + Aforo General)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                    Ubicación / Dirección
                  </label>
                  <input
                    type="text"
                    required
                    value={salonAddress}
                    onChange={(e) => setSalonAddress(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30 font-light"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                    Costo Renta Base (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-gray-500 text-xs">$</span>
                    <input
                      type="number"
                      required
                      value={baseRent}
                      onChange={(e) => setBaseRent(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30 font-light"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                    Depósito de Garantía (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-gray-500 text-xs">$</span>
                    <input
                      type="number"
                      required
                      value={securityDeposit}
                      onChange={(e) => setSecurityDeposit(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30 font-light"
                    />
                  </div>
                </div>
              </div>

              {/* Category Time Offsets Section */}
              <div className="border-t border-white/5 pt-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Sliders className="text-gold h-4 w-4" />
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                    Desfases de Convocatoria por Categoría (Convocatoria WhatsApp)
                  </h4>
                </div>
                <p className="text-[11px] text-gray-500 font-light leading-normal">
                  Define cuántas horas o minutos antes del inicio del evento se debe enviar la notificación automática a cada categoría de staff.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Cocina */}
                  <div>
                    <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                      Cocina (Desfase)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        required
                        min={0}
                        max={60}
                        value={offsetValCocina}
                        onChange={(e) => setOffsetValCocina(Number(e.target.value))}
                        className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                      />
                      <select
                        value={offsetUnitCocina}
                        onChange={(e) => setOffsetUnitCocina(e.target.value as any)}
                        className="flex-grow bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-gold/30"
                      >
                        <option value="horas">Horas antes</option>
                        <option value="minutos">Minutos antes</option>
                      </select>
                    </div>
                  </div>

                  {/* Meseros */}
                  <div>
                    <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                      Meseros (Desfase)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        required
                        min={0}
                        max={60}
                        value={offsetValMeseros}
                        onChange={(e) => setOffsetValMeseros(Number(e.target.value))}
                        className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                      />
                      <select
                        value={offsetUnitMeseros}
                        onChange={(e) => setOffsetUnitMeseros(e.target.value as any)}
                        className="flex-grow bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-gold/30"
                      >
                        <option value="horas">Horas antes</option>
                        <option value="minutos">Minutos antes</option>
                      </select>
                    </div>
                  </div>

                  {/* Cabina */}
                  <div>
                    <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                      Cabina / DJ (Desfase)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        required
                        min={0}
                        max={60}
                        value={offsetValCabina}
                        onChange={(e) => setOffsetValCabina(Number(e.target.value))}
                        className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                      />
                      <select
                        value={offsetUnitCabina}
                        onChange={(e) => setOffsetUnitCabina(e.target.value as any)}
                        className="flex-grow bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-gold/30"
                      >
                        <option value="horas">Horas antes</option>
                        <option value="minutos">Minutos antes</option>
                      </select>
                    </div>
                  </div>

                  {/* Animacion */}
                  <div>
                    <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                      Animación (Desfase)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        required
                        min={0}
                        max={60}
                        value={offsetValAnimacion}
                        onChange={(e) => setOffsetValAnimacion(Number(e.target.value))}
                        className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                      />
                      <select
                        value={offsetUnitAnimacion}
                        onChange={(e) => setOffsetUnitAnimacion(e.target.value as any)}
                        className="flex-grow bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-gold/30"
                      >
                        <option value="horas">Horas antes</option>
                        <option value="minutos">Minutos antes</option>
                      </select>
                    </div>
                  </div>

                  {/* Valet */}
                  <div>
                    <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                      Valet Parking (Desfase)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        required
                        min={0}
                        max={60}
                        value={offsetValValet}
                        onChange={(e) => setOffsetValValet(Number(e.target.value))}
                        className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                      />
                      <select
                        value={offsetUnitValet}
                        onChange={(e) => setOffsetUnitValet(e.target.value as any)}
                        className="flex-grow bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-gold/30"
                      >
                        <option value="horas">Horas antes</option>
                        <option value="minutos">Minutos antes</option>
                      </select>
                    </div>
                  </div>

                  {/* Show */}
                  <div>
                    <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                      Show (Desfase)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        required
                        min={0}
                        max={60}
                        value={offsetValShow}
                        onChange={(e) => setOffsetValShow(Number(e.target.value))}
                        className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                      />
                      <select
                        value={offsetUnitShow}
                        onChange={(e) => setOffsetUnitShow(e.target.value as any)}
                        className="flex-grow bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-gold/30"
                      >
                        <option value="horas">Horas antes</option>
                        <option value="minutos">Minutos antes</option>
                      </select>
                    </div>
                  </div>

                  {/* Fotografo */}
                  <div>
                    <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                      Fotógrafo (Desfase)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        required
                        min={0}
                        max={60}
                        value={offsetValFotografo}
                        onChange={(e) => setOffsetValFotografo(Number(e.target.value))}
                        className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                      />
                      <select
                        value={offsetUnitFotografo}
                        onChange={(e) => setOffsetUnitFotografo(e.target.value as any)}
                        className="flex-grow bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-gold/30"
                      >
                        <option value="horas">Horas antes</option>
                        <option value="minutos">Minutos antes</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <p className="text-[10px] text-gray-500 font-light italic">
                  * Estos valores se usarán para presupuestos automáticos en el módulo de Cotizaciones.
                </p>
                
                <div className="flex items-center gap-3">
                  {isSaved && (
                    <span className="text-xs text-green-400 flex items-center gap-1.5 animate-fade-in">
                      <CheckCircle2 className="h-4 w-4" />
                      Configuración guardada
                    </span>
                  )}
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-gold text-obsidian rounded-xl text-xs font-semibold uppercase hover:bg-gold-hover transition-all duration-300 active:scale-[0.98]"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Salon Current Physical Limits Form / Display */}
          <div className="glass-dark rounded-2xl p-6 border border-white/5 lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Maximize2 className="text-gold h-4 w-4" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Límites Físicos Activos
                </h3>
              </div>
              {!isGlobalEditable && (
                <span title="Solo lectura para Gerencia">
                  <Lock className="text-gray-600 h-3.5 w-3.5" />
                </span>
              )}
            </div>

            <div className="space-y-4 text-xs font-light text-gray-400">
              {/* Ancho del Salón */}
              <div className="border-b border-white/5 pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span>Ancho del Salón</span>
                  {!isGlobalEditable && (
                    <span className="text-white font-mono font-semibold">{salonWidth} metros</span>
                  )}
                </div>
                {isGlobalEditable && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={salonWidth}
                      onChange={(e) => setSalonWidth(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-gold/30 font-mono text-right"
                    />
                    <span className="text-[10px] text-gray-500">mts</span>
                  </div>
                )}
              </div>

              {/* Largo del Salón */}
              <div className="border-b border-white/5 pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span>Largo del Salón</span>
                  {!isGlobalEditable && (
                    <span className="text-white font-mono font-semibold">{salonLength} metros</span>
                  )}
                </div>
                {isGlobalEditable && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={salonLength}
                      onChange={(e) => setSalonLength(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-gold/30 font-mono text-right"
                    />
                    <span className="text-[10px] text-gray-500">mts</span>
                  </div>
                )}
              </div>

              {/* Pista de Baile */}
              <div className="border-b border-white/5 pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span>Pista de Baile</span>
                  {!isGlobalEditable && (
                    <span className="text-white font-mono font-semibold">{danceFloorWidth} metros (Central)</span>
                  )}
                </div>
                {isGlobalEditable && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={danceFloorWidth}
                      onChange={(e) => setDanceFloorWidth(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-gold/30 font-mono text-right"
                    />
                    <span className="text-[10px] text-gray-500">mts</span>
                  </div>
                )}
              </div>

              {/* Mesas de Balcón */}
              <div className="border-b border-white/5 pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span>Mesas de Balcón</span>
                  {!isGlobalEditable && (
                    <span className="text-white font-mono font-semibold">{balconyTablesCount} Mesas (Fijas)</span>
                  )}
                </div>
                {isGlobalEditable && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={balconyTablesCount}
                      onChange={(e) => setBalconyTablesCount(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-gold/30 font-mono text-right"
                    />
                    <span className="text-[10px] text-gray-500">uds</span>
                  </div>
                )}
              </div>

              {/* Aforo Balcón Margen */}
              <div className="pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span>Aforo Balcón Margen</span>
                  {!isGlobalEditable && (
                    <span className="text-white font-mono font-semibold">{balconyMarginPx} px (Estricto)</span>
                  )}
                </div>
                {isGlobalEditable && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={balconyMarginPx}
                      onChange={(e) => setBalconyMarginPx(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-gold/30 font-mono text-right"
                    />
                    <span className="text-[10px] text-gray-500">px</span>
                  </div>
                )}
              </div>

              {!isGlobalEditable && (
                <p className="text-[9px] text-gray-500 italic mt-2 leading-relaxed">
                  * Los límites físicos solo son editables por el Dueño o Admin Master del sistema.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Profile Modal */}
      {editingStaff && (
        <div className="fixed inset-0 bg-obsidian/85 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="glass-dark rounded-2xl border border-gold/20 max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Editar Perfil de Staff
              </h3>
              <button 
                onClick={() => setEditingStaff(null)}
                className="text-gray-500 hover:text-white text-xs"
              >
                Cerrar
              </button>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                await setDoc(doc(db, "staff", editingStaff.id), {
                  name: editingStaff.name,
                  role: editingStaff.role,
                  category: editingStaff.category,
                  email: editingStaff.email,
                  status: editingStaff.status
                }, { merge: true });
                setEditingStaff(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                    Categoría (Tag)
                  </label>
                  <select
                    value={editingStaff.category}
                    onChange={(e) => setEditingStaff({ ...editingStaff, category: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30"
                  >
                    <option value="Cocina">Cocina</option>
                    <option value="Cabina">Cabina</option>
                    <option value="Animación">Animación</option>
                    <option value="Valet Parking">Valet Parking</option>
                    <option value="Meseros">Meseros</option>
                    <option value="Show">Show</option>
                    <option value="Fotógrafo">Fotógrafo</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                    Puesto / Rol
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStaff.role}
                    onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={editingStaff.email}
                  onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="w-1/2 py-2.5 rounded-lg border border-gray-700 text-gray-400 text-xs font-semibold uppercase hover:bg-white/5 transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-gold hover:bg-gold-hover text-obsidian rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
