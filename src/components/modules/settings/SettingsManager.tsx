"use client";

import React, { useState } from "react";
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
  Building
} from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: "Activo" | "Inactivo";
}

export default function SettingsManager() {
  const [activeSubTab, setActiveSubTab] = useState<"staff" | "salon">("staff");
  
  // Mock Staff Members Data
  const [staff, setStaff] = useState<StaffMember[]>([
    { id: "1", name: "Sofía Montenegro", role: "Coordinadora General", email: "sofia.m@socialesvip.com", status: "Activo" },
    { id: "2", name: "Carlos Mendoza", role: "DJ Residente", email: "carlos.dj@socialesvip.com", status: "Activo" },
    { id: "3", name: "Eduardo Pérez", role: "Jefe de Bartenders", email: "eduardo.p@socialesvip.com", status: "Activo" },
    { id: "4", name: "Mariana Rojas", role: "Supervisora de Mesas", email: "mariana.r@socialesvip.com", status: "Inactivo" },
  ]);

  // Form states for new staff
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // Salon configurations state
  const [salonName, setSalonName] = useState("Grand Salón Imperial");
  const [salonAddress, setSalonAddress] = useState("Av. Las Lomas #450, Ciudad VIP");
  const [baseRent, setBaseRent] = useState("5000");
  const [securityDeposit, setSecurityDeposit] = useState("1500");
  const [isSaved, setIsSaved] = useState(false);

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRole || !newEmail) return;

    const newMember: StaffMember = {
      id: Date.now().toString(),
      name: newName,
      role: newRole,
      email: newEmail,
      status: "Activo"
    };

    setStaff([...staff, newMember]);
    setNewName("");
    setNewRole("");
    setNewEmail("");
  };

  const handleToggleStatus = (id: string) => {
    setStaff(staff.map(member => 
      member.id === id 
        ? { ...member, status: member.status === "Activo" ? "Inactivo" : "Activo" } 
        : member
    ));
  };

  const handleDeleteStaff = (id: string) => {
    setStaff(staff.filter(member => member.id !== id));
  };

  const handleSaveSalon = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/5 shrink-0 self-start md:self-auto">
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

              <div>
                <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                  Puesto / Rol
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Bartender, Coordinador, DJ"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30 font-light"
                />
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
                  <tr className="text-gray-400 border-b border-white/5 uppercase text-[9px] tracking-wider">
                    <th className="py-3 px-4">Miembro</th>
                    <th className="py-3 px-4">Rol / Puesto</th>
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
                        <span className="bg-white/5 border border-white/10 px-2 py-1 rounded text-[10px] text-gray-400">
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
                        <button
                          onClick={() => handleDeleteStaff(member.id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-all duration-300"
                          title="Eliminar Personal"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {staff.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500 italic">
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

          {/* Salon Current Physical Limits (Read Only Status) */}
          <div className="glass-dark rounded-2xl p-6 border border-white/5 lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Maximize2 className="text-gold h-4 w-4" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Límites Físicos Activos
              </h3>
            </div>

            <div className="space-y-4 text-xs font-light text-gray-400">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Ancho del Salón</span>
                <span className="text-white font-mono font-semibold">12 metros</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Largo del Salón</span>
                <span className="text-white font-mono font-semibold">30 metros</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Pista de Baile</span>
                <span className="text-white font-mono font-semibold">4.0 metros (Central)</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span>Mesas de Balcón</span>
                <span className="text-white font-mono font-semibold">3 Mesas (Fijas)</span>
              </div>
              <div className="flex justify-between pb-2">
                <span>Aforo Balcón Margen</span>
                <span className="text-white font-mono font-semibold">5 px (Estricto)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
