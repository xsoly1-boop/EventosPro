"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Users, 
  Check, 
  Info,
  CalendarCheck,
  AlertCircle
} from "lucide-react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from "firebase/firestore";

interface EventReservation {
  id: string;
  title: string;
  type: "Boda" | "XV Años" | "Graduación" | "Corporativo" | "Otro";
  date: string; // YYYY-MM-DD
  timeStart: string;
  timeEnd: string;
  guestsCount: number;
  clientName: string;
  status: "Pre-reservado" | "Confirmado";
}

export default function CalendarDashboard() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 30)); // Set default to June 2026
  const [selectedDateStr, setSelectedDateStr] = useState<string>("2026-06-20");
  const [showAddModal, setShowAddModal] = useState(false);
  const [preReserveDraft, setPreReserveDraft] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem("svip_pre_reserve_draft");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setPreReserveDraft(parsed);
        if (parsed.date) {
          setSelectedDateStr(parsed.date);
          const parts = parsed.date.split("-");
          if (parts.length === 3) {
            setCurrentDate(new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Reactive state from Firestore
  const [reservations, setReservations] = useState<EventReservation[]>([]);

  // Modal form states
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"Boda" | "XV Años" | "Graduación" | "Corporativo" | "Otro">("Boda");
  const [newTimeStart, setNewTimeStart] = useState("18:00");
  const [newTimeEnd, setNewTimeEnd] = useState("02:00");
  const [newGuests, setNewGuests] = useState("150");
  const [newClient, setNewClient] = useState("");

  const safeFormatDate = (dateVal: any): string => {
    if (!dateVal) return "";
    if (typeof dateVal === "string") return dateVal;
    if (dateVal && typeof dateVal === "object" && typeof dateVal.toDate === "function") {
      try {
        return dateVal.toDate().toISOString().split("T")[0];
      } catch (e) {}
    }
    if (dateVal && typeof dateVal === "object" && dateVal.seconds !== undefined) {
      try {
        return new Date(dateVal.seconds * 1000).toISOString().split("T")[0];
      } catch (e) {}
    }
    return String(dateVal);
  };

  // 1. Subscribe to Firestore events collection
  useEffect(() => {
    if (!db) return;

    const eventsRef = collection(db, "events");
    const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
      const list: EventReservation[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          title: data.title || "",
          type: data.type || "Otro",
          date: safeFormatDate(data.date),
          timeStart: data.timeStart || "",
          timeEnd: data.timeEnd || "",
          guestsCount: data.guestsCount || 150,
          clientName: data.clientName || "",
          status: data.status || "Pre-reservado",
        });
      });

      if (snapshot.empty) {
        // Seed default events
        const defaults: EventReservation[] = [
          {
            id: "1",
            title: "Boda de Sofía & Alejandro",
            type: "Boda",
            date: "2026-06-20",
            timeStart: "17:00",
            timeEnd: "02:00",
            guestsCount: 150,
            clientName: "Sofía Montenegro",
            status: "Confirmado"
          },
          {
            id: "2",
            title: "XV Años de Valeria",
            type: "XV Años",
            date: "2026-06-13",
            timeStart: "18:00",
            timeEnd: "03:00",
            guestsCount: 220,
            clientName: "Ricardo Mendoza",
            status: "Confirmado"
          },
          {
            id: "3",
            title: "Cena Anual Corporativa TechCorp",
            type: "Corporativo",
            date: "2026-06-27",
            timeStart: "19:00",
            timeEnd: "00:00",
            guestsCount: 180,
            clientName: "Laura Ortiz (TechCorp)",
            status: "Pre-reservado"
          },
          {
            id: "4",
            title: "Graduación Medicina UNAM",
            type: "Graduación",
            date: "2026-06-06",
            timeStart: "20:00",
            timeEnd: "04:00",
            guestsCount: 250,
            clientName: "Dr. Javier Torres",
            status: "Confirmado"
          }
        ];
        defaults.forEach(async (ev) => {
          await setDoc(doc(db, "events", ev.id), {
            title: ev.title,
            type: ev.type,
            date: ev.date,
            timeStart: ev.timeStart,
            timeEnd: ev.timeEnd,
            guestsCount: ev.guestsCount,
            clientName: ev.clientName,
            status: ev.status,
          });
        });
        setReservations(defaults);
      } else {
        setReservations(list);
      }
    });

    return () => unsubscribe();
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return days;
  };

  const getFirstDayOfMonthIndex = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // Sunday = 0
    return firstDay;
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayIndex = getFirstDayOfMonthIndex(currentDate);

  // Format month and year label
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const monthYearLabel = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  // Helper to check if a day has events
  const getEventsForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const dateStr = `${year}-${month}-${String(day).padStart(2, "0")}`;
    return reservations.filter(r => r.date === dateStr);
  };

  const handleAddReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newClient || !db) return;

    const newId = Date.now().toString();
    const newRes: EventReservation = {
      id: newId,
      title: newTitle,
      type: newType,
      date: selectedDateStr,
      timeStart: newTimeStart,
      timeEnd: newTimeEnd,
      guestsCount: Number(newGuests),
      clientName: newClient,
      status: "Pre-reservado"
    };

    await setDoc(doc(db, "events", newId), {
      title: newRes.title,
      type: newRes.type,
      date: newRes.date,
      timeStart: newRes.timeStart,
      timeEnd: newRes.timeEnd,
      guestsCount: newRes.guestsCount,
      clientName: newRes.clientName,
      status: newRes.status,
    });

    setNewTitle("");
    setNewClient("");
    setShowAddModal(false);
  };

  const handleToggleStatus = async (id: string) => {
    if (!db) return;
    const res = reservations.find(r => r.id === id);
    if (!res) return;
    
    await setDoc(doc(db, "events", id), {
      status: res.status === "Confirmado" ? "Pre-reservado" : "Confirmado"
    }, { merge: true });
  };

  const handleDeleteReservation = async (id: string) => {
    if (!db) return;
    await deleteDoc(doc(db, "events", id));
  };

  // Get selected day details
  const selectedDayEvents = reservations.filter(r => r.date === selectedDateStr);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block">
          Logística del Salón
        </span>
        <h1 className="text-2xl font-semibold text-white tracking-wide mt-1">
          Reservaciones & Calendario
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar View */}
        <div className="glass-dark rounded-2xl p-6 border border-white/5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon className="text-gold h-4.5 w-4.5" />
              Vista Mensual ({monthYearLabel})
            </h3>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrevMonth}
                className="p-1 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Grid Table */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Days of week */}
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(day => (
              <div key={day} className="text-[9px] text-gray-500 uppercase font-semibold font-mono py-2">
                {day}
              </div>
            ))}

            {/* Empty slots for offset */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="aspect-square bg-white/[0.01] border border-white/[0.02] rounded-lg opacity-40" />
            ))}

            {/* Calendar Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dayEvents = getEventsForDay(dayNum);
              const year = currentDate.getFullYear();
              const month = String(currentDate.getMonth() + 1).padStart(2, "0");
              const currentDayStr = `${year}-${month}-${String(dayNum).padStart(2, "0")}`;
              const isSelected = currentDayStr === selectedDateStr;

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDateStr(currentDayStr)}
                  className={`aspect-square p-1 rounded-lg border transition-all duration-300 cursor-pointer flex flex-col justify-between text-left ${
                    isSelected 
                      ? "bg-gold/10 border-gold shadow-[0_2px_10px_rgba(212,175,55,0.06)]"
                      : "bg-white/5 border-white/[0.03] hover:border-gold/30 hover:bg-white/10"
                  }`}
                >
                  <span className={`text-[10px] font-semibold font-mono ${isSelected ? "text-gold" : "text-gray-400"}`}>
                    {dayNum}
                  </span>

                  {dayEvents.length > 0 && (
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map(ev => (
                        <div 
                          key={ev.id} 
                          className={`text-[8px] font-semibold px-1 rounded truncate leading-tight border ${
                            ev.type === "Boda" 
                              ? "bg-gold/10 text-gold border-gold/20" 
                              : ev.type === "XV Años" 
                              ? "bg-violet-950/40 text-violet-300 border-violet-500/20" 
                              : ev.type === "Corporativo"
                              ? "bg-blue-950/40 text-blue-300 border-blue-500/20"
                              : "bg-gray-800 text-gray-300 border-gray-700"
                          }`}
                          title={ev.title}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[7px] text-gray-500 font-bold text-center">
                          +{dayEvents.length - 2} más
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Reservations Sidebar */}
        <div className="glass-dark rounded-2xl p-6 border border-white/5 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block">
                Día Seleccionado
              </span>
              <h3 className="text-sm font-semibold text-white font-mono mt-0.5">
                {selectedDateStr}
              </h3>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-1.5 rounded-lg bg-gold text-obsidian hover:bg-gold-hover transition-colors"
              title="Reservar Fecha"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {preReserveDraft && (
              <div className="p-4 rounded-xl bg-gold/10 border border-gold/30 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] font-semibold bg-gold text-obsidian px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                      PRE-RESERVA PENDIENTE
                    </span>
                    <h4 className="text-xs font-semibold text-white mt-1.5">
                      Confirmar Fecha para: {preReserveDraft.clientName}
                    </h4>
                  </div>
                </div>

                <div className="text-[10px] text-gray-300 space-y-1 bg-black/45 p-2.5 rounded-lg border border-white/5 font-mono">
                  <div>WhatsApp: {preReserveDraft.phone || "N/A"}</div>
                  <div>Aforo: {preReserveDraft.guestsCount} pax</div>
                  <div>Paquete: {preReserveDraft.packageName}</div>
                  <div>Fecha Propuesta: {preReserveDraft.date}</div>
                </div>

                <div className="text-[9px] text-amber-400 font-light flex gap-1 items-start leading-tight">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <span>
                    <strong>Condición:</strong> Si el cliente no formaliza la reserva con anticipo, perderá la fecha del apartado.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={async () => {
                      if (!db) return;
                      // Check date availability
                      const isOccupied = reservations.some(res => res.date === selectedDateStr);
                      if (isOccupied) {
                        alert(`Atención: Ya hay un evento agendado para la fecha ${selectedDateStr}. Selecciona otro día en el calendario.`);
                        return;
                      }

                      if (window.confirm(`¿Confirmar Pre-reserva para el día ${selectedDateStr}?`)) {
                        try {
                          const eventId = `event-${Date.now()}`;
                          const newEvent = {
                            title: `Evento de ${preReserveDraft.clientName}`,
                            type: "Boda",
                            date: selectedDateStr,
                            timeStart: "17:00",
                            timeEnd: "02:00",
                            guestsCount: preReserveDraft.guestsCount,
                            clientName: preReserveDraft.clientName,
                            phone: preReserveDraft.phone,
                            status: "pre-reserva",
                            paidAmount: 0,
                            totalCost: preReserveDraft.guestsCount * preReserveDraft.packagePrice,
                            enableBalcony: false,
                            honorCapacity: 5,
                            guests: [],
                            timeline: []
                          };

                          await setDoc(doc(db, "events", eventId), newEvent);
                          
                          // Mark quote as approved
                          await setDoc(doc(db, "quotes", preReserveDraft.quoteId), { status: "aprobada" }, { merge: true });

                          // Clean up localStorage and state
                          localStorage.removeItem("svip_pre_reserve_draft");
                          setPreReserveDraft(null);

                          alert(`Pre-reserva creada con éxito para el día ${selectedDateStr}.`);
                        } catch (err) {
                          console.error(err);
                          alert("Error al confirmar la Pre-reserva.");
                        }
                      }
                    }}
                    className="w-full py-1.5 bg-gold hover:bg-gold-hover text-obsidian rounded-lg text-[10px] font-bold uppercase transition-colors"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("¿Seguro que deseas descartar este borrador de pre-reserva?")) {
                        localStorage.removeItem("svip_pre_reserve_draft");
                        setPreReserveDraft(null);
                      }
                    }}
                    className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg text-[10px] uppercase transition-colors"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            )}

            {selectedDayEvents.map((res) => (
              <div 
                key={res.id}
                className="p-4 rounded-xl bg-obsidian border border-white/5 space-y-3 relative group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[8px] font-semibold px-2 py-0.5 rounded font-mono uppercase tracking-wider border ${
                      res.type === "Boda" 
                        ? "bg-gold/10 text-gold border-gold/20" 
                        : res.type === "XV Años" 
                        ? "bg-violet-950/40 text-violet-300 border-violet-500/20" 
                        : "bg-gray-800 text-gray-400 border-gray-700"
                    }`}>
                      {res.type}
                    </span>
                    <h4 className="text-xs font-semibold text-white mt-1.5">{res.title}</h4>
                  </div>

                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                    res.status === "Confirmado" 
                      ? "bg-green-500/10 text-green-400 border border-green-500/25"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                  }`}>
                    {res.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 border-t border-white/5 pt-2.5">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-gold/60" />
                    <span>{res.timeStart} - {res.timeEnd} hrs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-gold/60" />
                    <span>{res.guestsCount} pers.</span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-white/5 pt-2">
                  <span className="text-[9px] text-gray-500">Host: <span className="text-gray-300 font-light">{res.clientName}</span></span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleStatus(res.id)}
                      className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors"
                      title="Alternar Estado"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteReservation(res.id)}
                      className="p-1 hover:bg-white/5 rounded text-red-500 hover:text-red-400 transition-colors"
                      title="Eliminar Evento"
                    >
                      <Plus className="h-3.5 w-3.5 rotate-45" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {selectedDayEvents.length === 0 && (
              <div className="p-8 text-center text-gray-500 italic text-xs flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl">
                <Info className="h-5 w-5 text-gray-600 mb-2" />
                <span>Fecha disponible para reservación.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Reservation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-obsidian/85 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="glass-dark rounded-2xl border border-gold/20 max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
                <CalendarCheck className="text-gold h-4.5 w-4.5" />
                Reservar Fecha ({selectedDateStr})
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-white text-xs"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleAddReservation} className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                  Nombre del Evento
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Boda de Carlos & Maria"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                    Tipo de Evento
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30"
                  >
                    <option value="Boda">Boda</option>
                    <option value="XV Años">XV Años</option>
                    <option value="Graduación">Graduación</option>
                    <option value="Corporativo">Corporativo</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                    Aforo Estimado
                  </label>
                  <input
                    type="number"
                    required
                    value={newGuests}
                    onChange={(e) => setNewGuests(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                    Hora de Inicio
                  </label>
                  <input
                    type="time"
                    required
                    value={newTimeStart}
                    onChange={(e) => setNewTimeStart(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                    Hora de Fin
                  </label>
                  <input
                    type="time"
                    required
                    value={newTimeEnd}
                    onChange={(e) => setNewTimeEnd(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                  Cliente Anfitrión
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nombre del anfitrión..."
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-lg border border-gray-700 text-gray-400 text-xs font-semibold uppercase hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-gold hover:bg-gold-hover text-obsidian rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-[0_4px_15px_rgba(212,175,55,0.15)]"
                >
                  Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
