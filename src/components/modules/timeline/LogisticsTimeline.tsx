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
  Sparkles,
  Trash2
} from "lucide-react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  onSnapshot 
} from "firebase/firestore";

interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description: string;
  responsible: string;
  completed: boolean;
  requiredStaff?: string[];
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

  // Dynamic print and events list configuration states
  const [events, setEvents] = useState<{ id: string; title: string; menu?: string }[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printLogo, setPrintLogo] = useState("imperial");
  const [printPaperSize, setPrintPaperSize] = useState("letter");
  const [printObservations, setPrintObservations] = useState("");

  // Reactive states from Firestore
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);

  // Form states for adding custom timeline milestone
  const [newTime, setNewTime] = useState("18:00");
  const [newTitle, setNewTitle] = useState("");
  const [newResponsible, setNewResponsible] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [reqStaff, setReqStaff] = useState<string[]>(["Cocina", "Cabina", "Animación", "Valet Parking", "Meseros", "Show", "Fotógrafo"]);

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

  // Load events list dynamically from Firestore
  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, title: doc.data().title || doc.id, menu: doc.data().menu || "" });
      });
      if (!list.some(e => e.id === "event-123")) {
        list.unshift({ id: "event-123", title: "Gran Gala SocialesVIP", menu: "Espagueti al burro, lomo adobado, papas al gratin" });
      }
      setEvents(list);
    });
    return () => unsubscribe();
  }, []);

  // 1. Subscribe to Timeline Items Collection & config document
  useEffect(() => {
    if (!db) return;

    // Timeline Items
    const timelineRef = collection(db, "timeline");
    const unsubscribeTimeline = onSnapshot(timelineRef, (snapshot) => {
      const list: TimelineItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          time: data.time || "",
          title: data.title || "",
          description: data.description || "",
          responsible: data.responsible || "",
          completed: data.completed || false,
          requiredStaff: data.requiredStaff || []
        });
      });

      // Sort timeline items chronologically
      list.sort((a, b) => a.time.localeCompare(b.time));

      if (snapshot.empty) {
        // Seed default timeline
        const defaults: TimelineItem[] = [
          { id: "t-1", time: "17:00", title: "Arribo del Coordinador", description: "Revisión final de mantelería, vajilla y confirmación del personal de cocina.", responsible: "Coordinador", completed: true },
          { id: "t-2", time: "17:30", title: "Montaje técnico DJ & Iluminación", description: "Pruebas de sonido acústico y calibración de luces robóticas móviles.", responsible: "Proveedor DJ", completed: true },
          { id: "t-3", time: "18:00", title: "Apertura de Puertas", description: "Hostess listas en entrada con escáner QR. Validación de aforo activa.", responsible: "Hostess / Staff", completed: false },
          { id: "t-4", time: "18:30", title: "Cóctel de Bienvenida", description: "Servicio de canapés y bebidas en zona de jardín/vestíbulo.", responsible: "Cocina / Barra", completed: false },
          { id: "t-5", time: "19:30", title: "Entrada de Honor de Anfitriones", description: "Música especial activada. Coordinador activa pirotecnia fría interna.", responsible: "Coordinador / DJ", completed: false },
          { id: "t-6", time: "20:00", title: "Servicio de Cena (3 tiempos)", description: "Servicio simultáneo por mesas. Coordinador supervisa tiempos de cocina.", responsible: "Cocina / Meseros", completed: false },
          { id: "t-7", time: "21:30", title: "Brindis & Vals", description: "Entrega de copas de champaña a invitados. Protocolo de micrófonos listo.", responsible: "Coordinador", completed: false },
          { id: "t-8", time: "22:00", title: "Apertura de Pista de Baile", description: "Efectos visuales a máxima potencia. Dj inicia set principal.", responsible: "Proveedor DJ", completed: false },
        ];
        defaults.forEach(async (item) => {
          await setDoc(doc(db, "timeline", item.id), {
            time: item.time,
            title: item.title,
            description: item.description,
            responsible: item.responsible,
            completed: item.completed,
          });
        });
        setTimeline(defaults);
      } else {
        setTimeline(list);
      }
    });

    // Timeline Configuration Document
    const configRef = doc(db, "settings", "timeline_config");
    const unsubscribeConfig = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.eventTime !== undefined) setEventTime(data.eventTime);
        if (data.selectedEvent !== undefined) setSelectedEvent(data.selectedEvent);
        if (data.isLaunched !== undefined) setIsLaunched(data.isLaunched);
      }
    });

    return () => {
      unsubscribeTimeline();
      unsubscribeConfig();
    };
  }, []);

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

  const handleToggleComplete = async (id: string) => {
    if (!db) return;
    const item = timeline.find((t) => t.id === id);
    if (!item) return;

    await setDoc(doc(db, "timeline", id), {
      completed: !item.completed
    }, { merge: true });
  };

  const handleLaunchConvocatoria = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmLaunch = async () => {
    setShowConfirmModal(false);
    setIsLaunched(true);

    if (db) {
      await setDoc(doc(db, "settings", "timeline_config"), { 
        eventTime,
        selectedEvent,
        isLaunched: true 
      }, { merge: true });
    }

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

  const handleResetConvocatoria = async () => {
    setIsLaunched(false);
    if (db) {
      await setDoc(doc(db, "settings", "timeline_config"), { 
        isLaunched: false 
      }, { merge: true });
    }
    setStaffCalls(prev => prev.map(call => ({ ...call, status: "pendiente" })));
  };

  const handleEventTimeChange = async (val: string) => {
    setEventTime(val);
    if (db) {
      await setDoc(doc(db, "settings", "timeline_config"), { eventTime: val }, { merge: true });
    }
  };

  const handleAddTimelineItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newResponsible.trim() || !db) return;
    
    const id = `t-${Date.now()}`;
    await setDoc(doc(db, "timeline", id), {
      time: newTime,
      title: newTitle,
      description: newDesc,
      responsible: newResponsible,
      completed: false,
      requiredStaff: reqStaff
    });
    
    setNewTitle("");
    setNewResponsible("");
    setNewDesc("");
    setReqStaff(["Cocina", "Cabina", "Animación", "Valet Parking", "Meseros", "Show", "Fotógrafo"]);
  };

  const handleDeleteTimelineItem = async (id: string) => {
    if (!db) return;
    if (window.confirm("¿Seguro que deseas eliminar este hito del cronograma?")) {
      await deleteDoc(doc(db, "timeline", id));
    }
  };

  const handleSelectedEventChange = async (val: string) => {
    setSelectedEvent(val);
    if (db) {
      await setDoc(doc(db, "settings", "timeline_config"), { selectedEvent: val }, { merge: true });
    }
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
          <div className="flex gap-2">
            <button
              onClick={() => setShowPrintModal(true)}
              className="py-1 px-3 bg-gold/10 hover:bg-gold/25 border border-gold/20 text-gold rounded-lg text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300"
            >
              Imprimir Cronograma
            </button>
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
              onChange={(e) => handleSelectedEventChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30 disabled:opacity-50"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.title}>{ev.title}</option>
              ))}
              {events.length === 0 && (
                <>
                  <option value="Boda de Sofía & Alejandro">Boda de Sofía & Alejandro</option>
                  <option value="XV Años de Valeria">XV Años de Valeria</option>
                  <option value="Cena Corporativa TechCorp">Cena Corporativa TechCorp</option>
                </>
              )}
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
              onChange={(e) => handleEventTimeChange(e.target.value)}
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

        {/* Custom Milestone/Task Creation Form */}
        <form onSubmit={handleAddTimelineItem} className="border-t border-white/5 pt-5 mt-4 space-y-4">
          <div className="flex items-center gap-1.5 text-gold text-xs font-semibold uppercase tracking-wider">
            <span>+ Personalizar Cronograma (Agregar Tarea / Hito)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Hora de Tarea</label>
              <input
                type="time"
                required
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
              />
            </div>

            <div>
              <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Título de Actividad</label>
              <input
                type="text"
                required
                placeholder="Ej. Entrada de Mariachi"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold/30"
              />
            </div>

            <div>
              <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Responsable</label>
              <input
                type="text"
                required
                placeholder="Ej. Staff / DJ"
                value={newResponsible}
                onChange={(e) => setNewResponsible(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-gold/30"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 bg-gold hover:bg-gold-hover text-obsidian rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Agregar Hito
              </button>
            </div>
          </div>

          <div>
            <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">Descripción / Notas Logísticas</label>
            <input
              type="text"
              placeholder="Ej. Ingresa mariachi por puerta trasera, Dj apaga audio principal..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-1.5 text-xs text-white focus:outline-none focus:border-gold/30 font-light"
            />
          </div>

          <div className="border-t border-white/5 pt-3">
            <span className="text-[9px] text-gray-500 font-bold uppercase block mb-2">Personal / Categorías Requeridas</span>
            <div className="flex flex-wrap gap-4 text-[11px]">
              {["Cocina", "Cabina", "Animación", "Valet Parking", "Meseros", "Show", "Fotógrafo"].map((cat) => (
                <label key={cat} className="flex items-center gap-1.5 text-gray-300 hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={reqStaff.includes(cat)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setReqStaff([...reqStaff, cat]);
                      } else {
                        setReqStaff(reqStaff.filter((c) => c !== cat));
                      }
                    }}
                    className="accent-gold rounded border-gray-700 bg-black h-3.5 w-3.5"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>
        </form>

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

      {/* Timeline items list */}
      <div className="relative border-l border-white/5 ml-4 md:ml-6 space-y-6 pt-6 no-print">
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
                    {item.requiredStaff && item.requiredStaff.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.requiredStaff.map((cat) => (
                          <span key={cat} className="text-[8px] font-bold uppercase tracking-wider bg-gold/10 border border-gold/20 text-gold px-1.5 py-0.5 rounded">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold bg-white/5 px-2 py-0.5 rounded uppercase border border-white/5">
                      <User className="h-2.5 w-2.5 text-gold/60" />
                      <span>{item.responsible}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteTimelineItem(item.id)}
                      className="text-red-400 hover:text-red-300 p-1 hover:bg-white/5 rounded transition-colors"
                      title="Eliminar Hito"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
                className="w-1/2 py-2.5 rounded-lg border border-gray-700 text-gray-400 text-xs font-semibold uppercase hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmLaunch}
                className="w-1/2 py-2.5 rounded-lg bg-gold hover:bg-gold-hover text-obsidian text-xs font-bold uppercase tracking-wider transition-colors shadow-[0_4px_15px_rgba(212,175,55,0.15)]"
              >
                Confirmar y Lanzar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print settings configuration modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-obsidian/85 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm no-print">
          <div className="glass-dark rounded-2xl border border-gold/20 max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Configuración de Impresión
              </h3>
              <button 
                onClick={() => setShowPrintModal(false)}
                className="text-gray-500 hover:text-white text-xs"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                  Logotipo en Cabecera
                </label>
                <select
                  value={printLogo}
                  onChange={(e) => setPrintLogo(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="imperial">Grand Salón Imperial</option>
                  <option value="none">Sin Logotipo</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                  Tamaño de Papel
                </label>
                <select
                  value={printPaperSize}
                  onChange={(e) => setPrintPaperSize(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="letter">Carta (8.5" x 11")</option>
                  <option value="a4">A4 (210mm x 297mm)</option>
                  <option value="legal">Oficio (8.5" x 14")</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                  Observaciones Generales (Pie de Página)
                </label>
                <textarea
                  rows={3}
                  placeholder="Instrucciones adicionales para el staff durante el montaje..."
                  value={printObservations}
                  onChange={(e) => setPrintObservations(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="w-1/2 py-2.5 rounded-lg border border-gray-700 text-gray-400 text-xs font-semibold uppercase hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPrintModal(false);
                    setTimeout(() => window.print(), 300);
                  }}
                  className="w-1/2 py-2.5 bg-gold hover:bg-gold-hover text-obsidian rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-[0_4px_15px_rgba(212,175,55,0.15)]"
                >
                  Imprimir Ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable template container (Only shown on physical print) */}
      <div className="hidden print:block text-black p-8 bg-white w-full h-full text-xs font-sans">
        <div className="flex justify-between items-center border-b-2 border-gray-400 pb-4 mb-6">
          <div>
            {printLogo === "imperial" && (
              <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900">Grand Salón Imperial</h2>
            )}
            <h1 className="text-2xl font-extrabold mt-1 text-black uppercase">Cronograma de Servicio del Evento</h1>
            <p className="text-xs text-gray-600 mt-1">
              Evento: <strong className="text-black font-semibold">{selectedEvent}</strong> | Hora de Inicio: <strong className="text-black font-semibold">{eventTime} hrs</strong>
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 font-mono">SocialesVIP Logística</span>
          </div>
        </div>

        {/* Dynamic Predefined Menu Section */}
        {events.find(e => e.title === selectedEvent)?.menu && (
          <div className="border border-gray-300 rounded-xl p-4 bg-gray-50 mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1">Menú de Cocina Seleccionado</h3>
            <p className="text-xs text-gray-800 font-serif leading-relaxed italic">
              {events.find(e => e.title === selectedEvent)?.menu}
            </p>
          </div>
        )}

        {/* Timeline printed list table */}
        <table className="w-full text-left border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-gray-700 font-bold uppercase text-[10px]">
              <th className="py-2.5 px-3 border border-gray-300 w-24">Hora</th>
              <th className="py-2.5 px-3 border border-gray-300">Actividad Logística</th>
              <th className="py-2.5 px-3 border border-gray-300">Descripción de Operación</th>
              <th className="py-2.5 px-3 border border-gray-300 w-32">Responsable</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {timeline.map((item) => (
              <tr key={item.id} className="text-gray-900">
                <td className="py-2.5 px-3 border border-gray-300 font-mono font-bold">{item.time} hrs</td>
                <td className="py-2.5 px-3 border border-gray-300 font-bold">
                  <div>{item.title}</div>
                  {item.requiredStaff && item.requiredStaff.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.requiredStaff.map((cat) => (
                        <span key={cat} className="text-[8px] font-extrabold uppercase tracking-wider bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded border border-gray-300">
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="py-2.5 px-3 border border-gray-300 text-gray-600 leading-normal">{item.description}</td>
                <td className="py-2.5 px-3 border border-gray-300">{item.responsible}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Print general observations at bottom */}
        {printObservations && (
          <div className="border-t border-gray-300 pt-4 mt-8">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">Observaciones Generales para el Staff</h4>
            <p className="text-xs text-gray-600 leading-relaxed font-light">{printObservations}</p>
          </div>
        )}
      </div>

      {/* Global CSS style block for printing adjustments */}
      <style>{`
        @media print {
          /* Force page margins and hide app framework */
          body {
            background: white !important;
            color: black !important;
          }
          aside, nav, button, .no-print, select, input, label, .glass, .glass-dark {
            display: none !important;
          }
          main, #root, .flex-grow {
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          /* Custom paper sizes */
          @page {
            size: ${printPaperSize === "letter" ? "letter" : printPaperSize === "a4" ? "A4" : "8.5in 14in"};
            margin: 1.5cm;
          }
        }
      `}</style>
    </div>
  );
}
