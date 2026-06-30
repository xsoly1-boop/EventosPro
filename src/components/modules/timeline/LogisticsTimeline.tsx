"use client";

import React, { useState, useEffect } from "react";
import { 
  Clock, 
  CheckSquare, 
  Square, 
  User, 
  Compass, 
  HelpCircle,
  MessageSquare,
  Send,
  Check,
  CheckCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles
} from "lucide-react";

interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description: string;
  responsible: string;
  completed: boolean;
}

interface StaffNotification {
  id: string;
  name: string;
  role: string;
  category: "Cocina" | "Cabina" | "Animación" | "Valet Parking" | "Meseros" | "Show" | "Fotógrafo";
  offsetHours: number; // offset value
  offsetUnit: "horas" | "minutos";
  phone: string;
  status: "pendiente" | "encolado" | "enviado" | "entregado";
  callTimeStr?: string;
}

export default function LogisticsTimeline() {
  const [eventTime, setEventTime] = useState<string>("20:00");
  const [selectedEvent, setSelectedEvent] = useState<string>("Boda de Sofía & Alejandro");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLaunched, setIsLaunched] = useState(false);

  // Initial timeline items
  const [timeline, setTimeline] = useState<TimelineItem[]>([
    {
      id: "t-1",
      time: "17:00",
      title: "Arribo del Coordinador",
      description: "Revisión final de mantelería, vajilla y confirmación del personal de cocina.",
      responsible: "Coordinador",
      completed: true,
    },
    {
      id: "t-2",
      time: "17:30",
      title: "Montaje técnico DJ & Iluminación",
      description: "Pruebas de sonido acústico y calibración de luces robóticas móviles.",
      responsible: "Proveedor DJ",
      completed: true,
    },
    {
      id: "t-3",
      time: "18:00",
      title: "Apertura de Puertas",
      description: "Hostess listas en entrada con escáner QR. Validación de aforo activa.",
      responsible: "Hostess / Staff",
      completed: false,
    },
    {
      id: "t-4",
      time: "18:30",
      title: "Cóctel de Bienvenida",
      description: "Servicio de canapés y bebidas en zona de jardín/vestíbulo.",
      responsible: "Cocina / Barra",
      completed: false,
    },
    {
      id: "t-5",
      time: "19:30",
      title: "Entrada de Honor de Anfitriones",
      description: "Música especial activada. Coordinador activa pirotecnia fría interna.",
      responsible: "Coordinador / DJ",
      completed: false,
    },
    {
      id: "t-6",
      time: "20:00",
      title: "Servicio de Cena (3 tiempos)",
      description: "Servicio simultáneo por mesas. Coordinador supervisa tiempos de cocina.",
      responsible: "Cocina / Meseros",
      completed: false,
    },
    {
      id: "t-7",
      time: "21:30",
      title: "Brindis & Vals",
      description: "Entrega de copas de champaña a invitados. Protocolo de micrófonos listo.",
      responsible: "Coordinador",
      completed: false,
    },
    {
      id: "t-8",
      time: "22:00",
      title: "Apertura de Pista de Baile",
      description: "Efectos visuales a máxima potencia. Dj inicia set principal.",
      responsible: "Proveedor DJ",
      completed: false,
    },
  ]);

  // Initial staff notifications list with predefined offsets
  const [staffCalls, setStaffCalls] = useState<StaffNotification[]>([
    { id: "s-1", name: "Pedro Ruiz", role: "Chef Ejecutivo", category: "Cocina", offsetHours: 4, offsetUnit: "horas", phone: "+52 55 1234 5678", status: "pendiente" },
    { id: "s-2", name: "Carlos Mendoza", role: "DJ Residente", category: "Cabina", offsetHours: 2, offsetUnit: "horas", phone: "+52 55 2345 6789", status: "pendiente" },
    { id: "s-3", name: "Sofía Montenegro", role: "Coordinadora", category: "Animación", offsetHours: 1, offsetUnit: "horas", phone: "+52 55 3456 7890", status: "pendiente" },
    { id: "s-4", name: "Juan Gómez", role: "Supervisor Parking", category: "Valet Parking", offsetHours: 1, offsetUnit: "horas", phone: "+52 55 4567 8901", status: "pendiente" },
    { id: "s-5", name: "Mariana Rojas", role: "Jefa de Servicio", category: "Meseros", offsetHours: 3, offsetUnit: "horas", phone: "+52 55 5678 9012", status: "pendiente" },
    { id: "s-6", name: "Eduardo Pérez", role: "Jefe de Bartenders", category: "Show", offsetHours: 0, offsetUnit: "horas", phone: "+52 55 6789 0123", status: "pendiente" },
    { id: "s-7", name: "Esteban Vega", role: "Fotógrafo Oficial", category: "Fotógrafo", offsetHours: 1, offsetUnit: "horas", phone: "+52 55 7890 1234", status: "pendiente" },
  ]);

  // Function to calculate individual call times based on event time, offset and unit
  const calculateCallTime = (time: string, offsetVal: number, offsetUnit: "horas" | "minutos"): string => {
    const [hours, minutes] = time.split(":").map(Number);
    let totalMinutes = hours * 60 + minutes;
    
    // Convert offset to minutes
    const offsetInMinutes = offsetUnit === "horas" ? offsetVal * 60 : offsetVal;
    totalMinutes -= offsetInMinutes;
    
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60; // wrap around day limit
    }
    
    const targetHour = Math.floor(totalMinutes / 60) % 24;
    const targetMin = totalMinutes % 60;
    
    return `${String(targetHour).padStart(2, "0")}:${String(targetMin).padStart(2, "0")}`;
  };

  // Re-calculate call times when event time changes, reading custom settings from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const offValCocina = Number(localStorage.getItem("svip_offset_val_Cocina") || "4");
      const offUnitCocina = (localStorage.getItem("svip_offset_unit_Cocina") as any) || "horas";

      const offValMeseros = Number(localStorage.getItem("svip_offset_val_Meseros") || "3");
      const offUnitMeseros = (localStorage.getItem("svip_offset_unit_Meseros") as any) || "horas";

      const offValCabina = Number(localStorage.getItem("svip_offset_val_Cabina") || "2");
      const offUnitCabina = (localStorage.getItem("svip_offset_unit_Cabina") as any) || "horas";

      const offValAnim = Number(localStorage.getItem("svip_offset_val_Animacion") || "1");
      const offUnitAnim = (localStorage.getItem("svip_offset_unit_Animacion") as any) || "horas";

      const offValValet = Number(localStorage.getItem("svip_offset_val_Valet") || "1");
      const offUnitValet = (localStorage.getItem("svip_offset_unit_Valet") as any) || "horas";

      const offValShow = Number(localStorage.getItem("svip_offset_val_Show") || "0");
      const offUnitShow = (localStorage.getItem("svip_offset_unit_Show") as any) || "horas";

      const offValFoto = Number(localStorage.getItem("svip_offset_val_Fotografo") || "1");
      const offUnitFoto = (localStorage.getItem("svip_offset_unit_Fotografo") as any) || "horas";

      setStaffCalls(prev => prev.map(call => {
        let val = call.offsetHours;
        let unit: "horas" | "minutos" = call.offsetUnit;

        if (call.category === "Cocina") { val = offValCocina; unit = offUnitCocina; }
        if (call.category === "Meseros") { val = offValMeseros; unit = offUnitMeseros; }
        if (call.category === "Cabina") { val = offValCabina; unit = offUnitCabina; }
        if (call.category === "Animación") { val = offValAnim; unit = offUnitAnim; }
        if (call.category === "Valet Parking") { val = offValValet; unit = offUnitValet; }
        if (call.category === "Show") { val = offValShow; unit = offUnitShow; }
        if (call.category === "Fotógrafo") { val = offValFoto; unit = offUnitFoto; }

        return {
          ...call,
          offsetHours: val,
          offsetUnit: unit,
          callTimeStr: calculateCallTime(eventTime, val, unit)
        };
      }));
    }
  }, [eventTime]);

  const handleToggleComplete = (id: string) => {
    setTimeline(
      timeline.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleLaunchConvocatoria = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmLaunch = () => {
    setShowConfirmModal(false);
    setIsLaunched(true);

    // Set all to queued first
    setStaffCalls(prev => prev.map(call => ({ ...call, status: "encolado" })));

    // Simulate sending sequence in background with timers
    setTimeout(() => {
      // Cocina, Meseros and Fotógrafo are sent (long offsets)
      setStaffCalls(prev => prev.map(call => 
        call.category === "Cocina" || call.category === "Meseros" || call.category === "Fotógrafo"
          ? { ...call, status: "enviado" }
          : call
      ));
    }, 1500);

    setTimeout(() => {
      // Cocina, Meseros and Fotógrafo are delivered, Cabina is sent
      setStaffCalls(prev => prev.map(call => {
        if (call.category === "Cocina" || call.category === "Meseros" || call.category === "Fotógrafo") {
          return { ...call, status: "entregado" };
        }
        if (call.category === "Cabina") {
          return { ...call, status: "enviado" };
        }
        return call;
      }));
    }, 3500);

    setTimeout(() => {
      // Cabina is delivered, Valet & Animación are sent
      setStaffCalls(prev => prev.map(call => {
        if (call.category === "Cabina") {
          return { ...call, status: "entregado" };
        }
        if (call.category === "Valet Parking" || call.category === "Animación") {
          return { ...call, status: "enviado" };
        }
        return call;
      }));
    }, 5500);

    setTimeout(() => {
      // Valet, Animación & Show are sent/delivered
      setStaffCalls(prev => prev.map(call => ({ ...call, status: "entregado" })));
    }, 7500);
  };

  const handleResetConvocatoria = () => {
    setIsLaunched(false);
    setStaffCalls(prev => prev.map(call => ({ ...call, status: "pendiente" })));
  };

  const totalItems = timeline.length;
  const completedItems = timeline.filter((t) => t.completed).length;
  const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="p-4 space-y-6 w-full max-w-4xl mx-auto">
      {/* Progress Card */}
      <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block mb-1">
            Operación del Evento
          </span>
          <h2 className="text-xl font-semibold text-white">Cronograma en Tiempo Real</h2>
          <p className="text-gray-400 text-xs font-light mt-1">
            Checklist minuto a minuto del flujo logístico del día del evento.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-4">
          <div className="text-right">
            <span className="text-2xl font-bold text-gold font-mono">
              {completedItems}/{totalItems}
            </span>
            <span className="text-[10px] text-gray-500 uppercase font-semibold block">Pasos Listos</span>
          </div>
          <div className="w-32 bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
            <div
              className="bg-gold h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Launcher Panel ("El Botón Mágico") */}
      <div className="glass-dark p-6 rounded-2xl border border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-gold h-5 w-5 animate-pulse" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Convocatoria Automatizada de Staff (WhatsApp)
            </h3>
          </div>
          {isLaunched && (
            <button
              onClick={handleResetConvocatoria}
              className="py-1 px-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300"
            >
              <RotateCcw className="h-3 w-3" />
              Reiniciar Convocatoria
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Event Selector */}
          <div>
            <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
              Seleccionar Evento
            </label>
            <select
              disabled={isLaunched}
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30 disabled:opacity-50"
            >
              <option value="Boda de Sofía & Alejandro">Boda de Sofía & Alejandro</option>
              <option value="XV Años de Valeria">XV Años de Valeria</option>
              <option value="Cena Corporativa TechCorp">Cena Corporativa TechCorp</option>
            </select>
          </div>

          {/* Time Picker */}
          <div>
            <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
              Hora de Inicio del Evento
            </label>
            <input
              type="time"
              disabled={isLaunched}
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30 disabled:opacity-50 font-mono"
            />
          </div>

          {/* Trigger Button */}
          <div className="flex items-end">
            {!isLaunched ? (
              <button
                onClick={handleLaunchConvocatoria}
                className="w-full py-3 bg-gold hover:bg-gold-hover text-obsidian rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-300 shadow-[0_4px_15px_rgba(212,175,55,0.15)]"
              >
                <Send className="h-4 w-4" />
                Lanzar Convocatoria
              </button>
            ) : (
              <div className="w-full py-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs font-semibold uppercase text-center flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4 animate-bounce" />
                Convocatoria Activa
              </div>
            )}
          </div>
        </div>

        {/* Live Messages Status List */}
        {isLaunched && (
          <div className="mt-4 bg-white/[0.01] border border-white/5 rounded-xl p-4 space-y-3">
            <h4 className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              Cola de Envío en Tiempo Real ( WhatsApp )
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {staffCalls.map((call) => {
                const isSent = call.status === "enviado";
                const isDelivered = call.status === "entregado";
                const isQueued = call.status === "encolado";

                return (
                  <div 
                    key={call.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-obsidian border border-white/5 hover:border-white/10 transition-all duration-300"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-white">{call.name}</span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-gold/10 text-gold uppercase font-semibold">
                          {call.category}
                        </span>
                      </div>
                      <p className="text-[9px] text-gray-500 font-light">
                        Llamado: <span className="font-semibold text-gray-300">{call.callTimeStr} hrs</span> ({call.offsetHours} {call.offsetUnit === "horas" ? "h" : "min"} antes)
                      </p>
                    </div>

                    {/* Delivery Status Icons */}
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-mono capitalize ${
                        isDelivered ? "text-green-400" : isSent ? "text-gold" : "text-gray-500"
                      }`}>
                        {call.status}
                      </span>
                      {isDelivered ? (
                        <CheckCheck className="text-green-400 h-4.5 w-4.5" />
                      ) : isSent ? (
                        <Check className="text-gold h-4.5 w-4.5" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gold/40 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-obsidian/85 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="glass-dark rounded-2xl border border-gold/20 max-w-lg w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-start gap-3 border-b border-white/5 pb-3">
              <AlertTriangle className="text-gold h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Confirmar Lanzamiento de Convocatoria
                </h3>
                <p className="text-gray-400 text-xs font-light mt-0.5">
                  Esta acción encolará y programará los llamados individuales para todo el staff.
                </p>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl space-y-2 border border-white/5">
              <p className="text-xs text-gray-300 leading-relaxed">
                Se enviarán <span className="text-gold font-bold">{staffCalls.length} mensajes</span> en total por WhatsApp para el evento <span className="text-white font-semibold">"{selectedEvent}"</span> programado a las <span className="text-gold font-mono font-semibold">{eventTime} hrs</span>.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider block">
                Resumen de llamados a programar:
              </span>
              <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1 text-xs">
                {staffCalls.map((call) => (
                  <div key={call.id} className="flex justify-between items-center text-gray-400 py-1 border-b border-white/5">
                    <span>{call.name} ({call.role})</span>
                    <span className="text-white font-mono font-semibold">
                      {call.callTimeStr} hrs ({call.offsetHours} {call.offsetUnit === "horas" ? "horas" : "minutos"} antes)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-1/2 py-2.5 rounded-lg border border-gray-700 text-gray-400 text-xs font-semibold uppercase hover:bg-white/5 transition-all duration-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmLaunch}
                className="w-1/2 py-2.5 rounded-lg bg-gold hover:bg-gold-hover text-obsidian text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_4px_15px_rgba(212,175,55,0.15)]"
              >
                Confirmar y Lanzar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline items list */}
      <div className="relative border-l border-white/5 ml-4 md:ml-6 space-y-6 pt-2">
        {timeline.map((item, idx) => {
          return (
            <div key={item.id} className="relative pl-8 md:pl-10 group">
              {/* Bullet indicator */}
              <div
                onClick={() => handleToggleComplete(item.id)}
                className={`absolute left-0 top-0.5 -translate-x-1/2 w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer transition-all duration-300 z-10 ${
                  item.completed
                    ? "bg-gold border-gold text-obsidian"
                    : "bg-obsidian border-gray-700 text-gray-500 hover:border-gold"
                }`}
              >
                {item.completed ? (
                  <CheckSquare className="h-3.5 w-3.5" />
                ) : (
                  <Square className="h-3.5 w-3.5" />
                )}
              </div>

              {/* Box */}
              <div
                className={`glass p-5 rounded-xl border transition-all duration-300 ${
                  item.completed
                    ? "border-gold/20 bg-gold/[0.02]"
                    : "border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-gold text-xs font-semibold font-mono bg-gold/10 px-2.5 py-1 rounded border border-gold/20">
                      <Clock className="h-3 w-3" />
                      <span>{item.time} hrs</span>
                    </div>
                    <h3
                      className={`text-sm font-semibold transition-all ${
                        item.completed ? "text-gray-400 line-through font-light" : "text-white"
                      }`}
                    >
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold bg-white/5 px-2 py-0.5 rounded uppercase border border-white/5">
                    <User className="h-2.5 w-2.5 text-gold/60" />
                    <span>{item.responsible}</span>
                  </div>
                </div>

                <p
                  className={`text-xs font-light leading-relaxed ${
                    item.completed ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
