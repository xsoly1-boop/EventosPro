"use client";

import React, { useState } from "react";
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

  // Initial event reservations
  const [reservations, setReservations] = useState<EventReservation[]>([
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
  ]);

  // Modal form states
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"Boda" | "XV Años" | "Graduación" | "Corporativo" | "Otro">("Boda");
  const [newTimeStart, setNewTimeStart] = useState("18:00");
  const [newTimeEnd, setNewTimeEnd] = useState("02:00");
  const [newGuests, setNewGuests] = useState("150");
  const [newClient, setNewClient] = useState("");

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

  const handleAddReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newClient) return;

    const newRes: EventReservation = {
      id: Date.now().toString(),
      title: newTitle,
      type: newType,
      date: selectedDateStr,
      timeStart: newTimeStart,
      timeEnd: newTimeEnd,
      guestsCount: Number(newGuests),
      clientName: newClient,
      status: "Pre-reservado"
    };

    setReservations([...reservations, newRes]);
    setNewTitle("");
    setNewClient("");
    setShowAddModal(false);
  };

  const handleToggleStatus = (id: string) => {
    setReservations(reservations.map(res => 
      res.id === id 
        ? { ...res, status: res.status === "Confirmado" ? "Pre-reservado" : "Confirmado" }
        : res
    ));
  };

  const handleDeleteReservation = (id: string) => {
    setReservations(reservations.filter(res => res.id !== id));
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
          {/* Calendar Header Controls */}
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon className="text-gold h-4 w-4" />
              {monthYearLabel}
            </h3>

            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-all duration-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-all duration-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekdays Labels */}
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] text-gray-500 font-mono uppercase tracking-wider">
            <span>Dom</span>
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty boxes for days of previous month */}
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} className="aspect-square bg-transparent" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const year = currentDate.getFullYear();
              const month = String(currentDate.getMonth() + 1).padStart(2, "0");
              const dateStr = `${year}-${month}-${String(day).padStart(2, "0")}`;
              const isSelected = selectedDateStr === dateStr;
              
              const dayEvents = getEventsForDay(day);
              const hasEvents = dayEvents.length > 0;
              const hasConfirmed = dayEvents.some(e => e.status === "Confirmado");

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`aspect-square rounded-xl p-1.5 flex flex-col justify-between border text-left transition-all duration-300 relative group ${
                    isSelected
                      ? "bg-gold/10 border-gold text-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                      : "bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  <span className={`text-xs ${isSelected ? "font-bold text-gold" : "text-gray-300"}`}>
                    {day}
                  </span>

                  {/* Event indicators */}
                  {hasEvents && (
                    <div className="flex gap-1 mt-auto">
                      {dayEvents.slice(0, 3).map((e, eIdx) => (
                        <div
                          key={eIdx}
                          className={`w-1.5 h-1.5 rounded-full ${
                            e.status === "Confirmado" ? "bg-gold animate-pulse" : "bg-zafiro/80"
                          }`}
                          title={e.title}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Day Details & Actions */}
        <div className="space-y-6 lg:col-span-1">
          {/* Selected Date Details Panel */}
          <div className="glass-dark rounded-2xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-mono tracking-wider">
                {selectedDateStr}
              </span>
              <button
                onClick={() => setShowAddModal(true)}
                className="py-1 px-3 bg-gold/10 border border-gold/20 hover:bg-gold/20 text-gold rounded-lg text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300"
              >
                <Plus className="h-3 w-3" />
                Agendar
              </button>
            </div>

            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Eventos Programados
            </h3>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {selectedDayEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="glass p-4 rounded-xl border border-white/5 space-y-3 hover:border-white/10 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-semibold text-white leading-snug">{event.title}</h4>
                      <span className="text-[9px] font-mono text-gold/80 block mt-1">
                        Cliente: {event.clientName}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider shrink-0 ${
                      event.status === "Confirmado"
                        ? "bg-green-500/10 border border-green-500/20 text-green-400"
                        : "bg-zafiro/15 border border-zafiro/30 text-gold"
                    }`}>
                      {event.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-gold/60" />
                      <span>{event.timeStart} - {event.timeEnd} hs</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3 w-3 text-gold/60" />
                      <span>{event.guestsCount} Aforo</span>
                    </div>
                  </div>

                  {/* Actions inside list */}
                  <div className="flex gap-2 pt-2 border-t border-white/5 justify-between">
                    <button
                      onClick={() => handleToggleStatus(event.id)}
                      className="text-[9px] text-gold/80 hover:text-gold uppercase tracking-wider font-semibold"
                    >
                      {event.status === "Confirmado" ? "Pasar a Pre-reserva" : "Confirmar Reserva"}
                    </button>
                    <button
                      onClick={() => handleDeleteReservation(event.id)}
                      className="text-[9px] text-red-400 hover:text-red-300 uppercase tracking-wider font-semibold"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}

              {selectedDayEvents.length === 0 && (
                <div className="py-8 text-center text-gray-500 italic text-xs flex flex-col items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-gray-600" />
                  <span>Día disponible para reservaciones.</span>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Summary Statistics Card */}
          <div className="glass-dark rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <CalendarCheck className="text-gold h-4 w-4" />
              Resumen del Mes
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                <span className="text-[9px] text-gray-500 block uppercase tracking-wider">Confirmados</span>
                <span className="text-lg font-bold text-gold block mt-0.5">
                  {reservations.filter(r => r.status === "Confirmado" && r.date.startsWith("2026-06")).length}
                </span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                <span className="text-[9px] text-gray-500 block uppercase tracking-wider">Pre-reservas</span>
                <span className="text-lg font-bold text-white/80 block mt-0.5">
                  {reservations.filter(r => r.status === "Pre-reservado" && r.date.startsWith("2026-06")).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Booking Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 bg-obsidian/85 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="glass-dark rounded-2xl border border-gold/20 max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Nueva Reserva para el {selectedDateStr}
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
                  placeholder="Ej. Boda de Carlos & Diana"
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30"
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                    Hora de Inicio
                  </label>
                  <input
                    type="text"
                    required
                    value={newTimeStart}
                    onChange={(e) => setNewTimeStart(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                    Hora de Finalización
                  </label>
                  <input
                    type="text"
                    required
                    value={newTimeEnd}
                    onChange={(e) => setNewTimeEnd(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                  Nombre del Cliente / Anfitrión
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Roberto Martínez"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gold text-obsidian rounded-xl text-xs font-semibold uppercase hover:bg-gold-hover transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] pt-2"
              >
                <Plus className="h-4 w-4" />
                Registrar Pre-reservación
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
