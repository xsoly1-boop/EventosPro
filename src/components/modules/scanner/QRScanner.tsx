"use client";

import React, { useState, useEffect } from "react";
import { QrCode, Camera, Users, Search, CheckCircle, AlertTriangle, Plus, Minus } from "lucide-react";
import { useEventTables } from "@/hooks/useEventTables";
import { db } from "@/lib/firebase";
import { 
  doc, 
  collection,
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot 
} from "firebase/firestore";

export default function QRScanner() {
  const [selectedEventId, setSelectedEventId] = useState("event-123");
  const { guests, loading, assignGuest, unassignGuest, seedMockData } = useEventTables(selectedEventId);
  const [searchQuery, setSearchQuery] = useState("");
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Events list from database
  const [events, setEvents] = useState<{ id: string; title: string }[]>([]);

  // Seating Mode state
  const [openSeatingMode, setOpenSeatingMode] = useState<boolean | "hibrido">(false);
  const [totalTables, setTotalTables] = useState<number>(26);
  const [honorCapacity, setHonorCapacity] = useState<number>(6);

  // 1. Load active events list from Firestore
  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      const list: { id: string; title: string }[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, title: doc.data().title || doc.id });
      });
      // Deduplicate/add default demo if needed
      if (!list.some(e => e.id === "event-123")) {
        list.unshift({ id: "event-123", title: "Gran Gala SocialesVIP" });
      }
      setEvents(list);
    });
    return () => unsubscribe();
  }, []);

  // 2. Auto-seed guests when selected event changes
  useEffect(() => {
    seedMockData();
  }, [selectedEventId]);

  // 3. Subscribe to settings from Firestore to sync totalTables, honorCapacity, and openSeatingMode
  useEffect(() => {
    if (!db) return;
    const docRef = doc(db, "settings", "salon");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.totalTables !== undefined) setTotalTables(data.totalTables);
        if (data.honorCapacity !== undefined) setHonorCapacity(data.honorCapacity);
        if (data.openSeatingMode !== undefined) setOpenSeatingMode(data.openSeatingMode);
      }
    });
    return () => unsubscribe();
  }, []);

  // Total Capacity Calculations
  const checkedInCount = guests.filter((g) => g.tableId !== null && g.seatIndex !== null).length;
  // If openSeatingMode, total capacity is calculated from settings
  const capacityTotal = openSeatingMode ? (totalTables * 10) + honorCapacity : guests.length;
  const attendanceRate = capacityTotal > 0 ? (checkedInCount / capacityTotal) * 100 : 0;

  const handleManualCheckIn = async (guestId: string) => {
    try {
      let assigned = false;
      for (let tableNum = 1; tableNum <= totalTables; tableNum++) {
        for (let seatIdx = 0; seatIdx < 10; seatIdx++) {
          const isOccupied = guests.some((g) => g.tableId === tableNum && g.seatIndex === seatIdx);
          if (!isOccupied) {
            await assignGuest(guestId, tableNum, seatIdx);
            setScanResult({ success: true, message: `Invitado registrado en Mesa ${tableNum} - Silla ${seatIdx + 1}` });
            assigned = true;
            break;
          }
        }
        if (assigned) break;
      }
    } catch (err) {
      setScanResult({ success: false, message: "Error al registrar asistencia." });
    }
  };

  const handleRegisterAnonymousEntry = async (qty: number = 1) => {
    if (!db) return;
    try {
      let count = 0;
      for (let tableNum = 1; tableNum <= totalTables; tableNum++) {
        for (let seatIdx = 0; seatIdx < 10; seatIdx++) {
          const isOccupied = guests.some((g) => g.tableId === tableNum && g.seatIndex === seatIdx);
          if (!isOccupied) {
            const guestId = `anon-${tableNum}-${seatIdx}-${Date.now()}-${count}`;
            await setDoc(doc(db, "events", selectedEventId, "guests", guestId), {
              name: `Mesa ${tableNum} Silla ${seatIdx + 1}`,
              tickets: 1,
              tableId: tableNum,
              seatIndex: seatIdx
            });
            count++;
            if (count >= qty) {
              setScanResult({ success: true, message: `Ingreso Express registrado para grupo de ${qty} personas.` });
              return;
            }
          }
        }
      }
    } catch (err) {
      setScanResult({ success: false, message: "Error al registrar entrada express." });
    }
  };

  const handleRegisterAnonymousExit = async () => {
    if (!db) return;
    try {
      const occupied = guests.filter((g) => g.tableId !== null && g.seatIndex !== null);
      if (occupied.length === 0) {
        setScanResult({ success: false, message: "El salón ya se encuentra vacío." });
        return;
      }
      const target = occupied[occupied.length - 1];
      await unassignGuest(target.tableId as number, target.seatIndex as number);
      if (target.id.startsWith("anon-") || target.id.startsWith("guest-")) {
        await deleteDoc(doc(db, "events", selectedEventId, "guests", target.id));
      }
      setScanResult({ success: true, message: "Salida registrada exitosamente." });
    } catch (err) {
      setScanResult({ success: false, message: "Error al registrar salida." });
    }
  };

  const handleSimulateScan = () => {
    const unassigned = guests.filter((g) => g.tableId === null);
    if (unassigned.length === 0) {
      setScanResult({ success: false, message: "Todos los invitados ya se encuentran en el salón." });
      return;
    }
    const randomGuest = unassigned[Math.floor(Math.random() * unassigned.length)];
    handleManualCheckIn(randomGuest.id);
  };

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-6 w-full max-w-5xl mx-auto">
      {/* Event Selector Dropdown Card */}
      <div className="glass p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block mb-1">
            Recepción Activa
          </span>
          <h2 className="text-xl font-semibold text-white tracking-wide">Control de Acceso & Aforo</h2>
          <p className="text-gray-400 text-xs font-light mt-1">
            Gestiona la entrada de invitados generales y reservados por evento.
          </p>
        </div>
        <div className="w-full md:w-72 shrink-0">
          <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
            Seleccionar Evento Activo
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30 font-medium"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
              {openSeatingMode === true ? "Ocupación Total Salón" : "Aforo Total Salón"}
            </span>
            <h3 className="text-2xl font-bold text-white font-mono">
              {checkedInCount} <span className="text-gray-500 text-sm">/ {capacityTotal}</span>
            </h3>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-4">
            <div className="bg-gold h-full rounded-full" style={{ width: `${attendanceRate}%` }} />
          </div>
        </div>

        <div className="glass p-5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
              Porcentaje Ocupado
            </span>
            <h3 className="text-2xl font-bold text-gold font-mono">
              {attendanceRate.toFixed(1)}%
            </h3>
          </div>
          <span className="text-[10px] text-gray-400 mt-4 font-light">
            {openSeatingMode === true ? "Monitoreo en tiempo real (Clicker)" : "Recepción dual (QR + Aforo General)"}
          </span>
        </div>

        <div className="glass p-5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
              Asientos Disponibles
            </span>
            <h3 className="text-2xl font-bold text-emerald-400 font-mono">
              {capacityTotal - checkedInCount}
            </h3>
          </div>
          <span className="text-[10px] text-gray-400 mt-4 font-light">Lugares libres disponibles</span>
        </div>
      </div>

      {/* Main split */}
      {openSeatingMode === true ? (
        // Pure Open Seating Mode (Clicker Only)
        <div className="glass-dark rounded-2xl border border-white/5 p-8 max-w-2xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-2">
            <Users className="text-gold h-8 w-8" />
          </div>
          <div>
            <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block mb-1">
              Recepción / Entrada de Orden de Llegada
            </span>
            <h3 className="text-xl font-light text-white">Panel de Aforo Express</h3>
            <p className="text-gray-500 text-xs font-light max-w-md mx-auto mt-2 leading-relaxed">
              El evento está configurado en **Modo Aforo Libre**. No se requiere listado de invitados ni escaneo de pases QR. Usa el clicker de aforo para registrar la entrada y salida de personas.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 py-4">
            <div className="flex items-center gap-6">
              <button
                onClick={handleRegisterAnonymousExit}
                className="w-16 h-16 rounded-2xl bg-red-950/20 border border-red-500/20 hover:bg-red-950/40 text-red-400 flex items-center justify-center transition-all duration-300 active:scale-90"
                title="Registrar Salida"
              >
                <Minus className="h-6 w-6" />
              </button>
              
              <div className="text-center px-8">
                <span className="text-5xl font-extrabold text-white font-mono tracking-tight">
                  {checkedInCount}
                </span>
                <span className="text-[10px] text-gray-500 block uppercase font-mono mt-1">Ocupados</span>
              </div>

              <button
                onClick={() => handleRegisterAnonymousEntry(1)}
                className="w-16 h-16 rounded-2xl bg-gold hover:bg-gold-hover text-obsidian flex items-center justify-center transition-all duration-300 active:scale-90 shadow-[0_4px_20px_rgba(212,175,55,0.15)]"
                title="Registrar Entrada"
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => handleRegisterAnonymousEntry(2)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-gold/30 text-white text-xs font-semibold uppercase hover:bg-white/10 transition-colors"
              >
                +2 Personas
              </button>
              <button
                onClick={() => handleRegisterAnonymousEntry(4)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-gold/30 text-white text-xs font-semibold uppercase hover:bg-white/10 transition-colors"
              >
                +4 Personas
              </button>
              <button
                onClick={() => handleRegisterAnonymousEntry(6)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-gold/30 text-white text-xs font-semibold uppercase hover:bg-white/10 transition-colors"
              >
                +6 Personas
              </button>
            </div>
          </div>

          {scanResult && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 justify-center text-left max-w-md mx-auto animate-fade-in ${
                scanResult.success
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
                  : "bg-red-950/40 border-red-500/30 text-red-200"
              }`}
            >
              {scanResult.success ? (
                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-xs font-semibold">
                  {scanResult.success ? "Operación Registrada" : "Aviso"}
                </p>
                <p className="text-[11px] font-light mt-0.5 leading-relaxed">{scanResult.message}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Fixed Seating or Hybrid Mode
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: QR Scanner Camera & Headcount clicker (if Hybrid) */}
          <div className="lg:col-span-5 space-y-6">
            {openSeatingMode === "hibrido" && (
              <div className="glass-dark rounded-2xl border border-gold/10 p-5 space-y-4">
                <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block">
                  Aforo General (Asientos no reservados)
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={handleRegisterAnonymousExit}
                      className="px-3 py-1.5 rounded-lg bg-red-950/20 border border-red-500/20 text-red-400 text-xs hover:bg-red-950/40 transition-colors"
                    >
                      -1 Salida
                    </button>
                    <button
                      onClick={() => handleRegisterAnonymousEntry(1)}
                      className="px-3 py-1.5 rounded-lg bg-gold hover:bg-gold-hover text-obsidian text-xs font-semibold transition-colors"
                    >
                      +1 Entrada
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRegisterAnonymousEntry(2)}
                      className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-[9px] hover:bg-white/10"
                    >
                      +2
                    </button>
                    <button
                      onClick={() => handleRegisterAnonymousEntry(4)}
                      className="px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-[9px] hover:bg-white/10"
                    >
                      +4
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gold tracking-wider uppercase">
                Cámara de Escaneo QR
              </h4>
              <div className="glass-dark rounded-2xl border border-white/5 overflow-hidden flex flex-col items-center justify-center p-8 aspect-video relative bg-black min-h-[260px]">
                {isCameraActive ? (
                  <div className="text-center space-y-4 flex flex-col items-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gold opacity-55 shadow-[0_0_10px_#D4AF37] animate-bounce" />
                    <Camera className="h-12 w-12 text-gold animate-pulse mb-2" />
                    <span className="text-xs text-gold uppercase tracking-widest font-mono">
                      Buscando código QR de invitación...
                    </span>
                    <button
                      onClick={() => setIsCameraActive(false)}
                      className="px-4 py-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs font-semibold uppercase hover:bg-red-500/20 transition-all duration-300"
                    >
                      Desactivar Cámara
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <QrCode className="h-16 w-16 text-gray-700 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-white text-xs font-semibold">Cámara inactiva</p>
                      <p className="text-gray-500 text-[10px] max-w-xs mx-auto">
                        Activa la cámara frontal para escanear pases QR directamente desde dispositivos móviles.
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center pt-2">
                      <button
                        onClick={() => setIsCameraActive(true)}
                        className="px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-obsidian text-xs font-bold uppercase transition-colors"
                      >
                        Activar Cámara
                      </button>
                      <button
                        onClick={handleSimulateScan}
                        className="px-4 py-2 rounded-lg border border-white/10 hover:border-gold/30 text-white text-xs font-semibold uppercase hover:bg-white/5 transition-colors"
                      >
                        Simular Escaneo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {scanResult && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 animate-fade-in ${
                  scanResult.success
                    ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
                    : "bg-red-950/40 border-red-500/30 text-red-200"
                }`}
              >
                {scanResult.success ? (
                  <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-xs font-semibold">
                    {scanResult.success ? "Acceso Autorizado" : "Acceso Denegado"}
                  </p>
                  <p className="text-[11px] font-light mt-0.5 leading-relaxed">{scanResult.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Guest search & Manual Check-in */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="text-sm font-semibold text-gold tracking-wider uppercase">
              Búsqueda Logística de Invitados {openSeatingMode === "hibrido" && "VIP"}
            </h4>
            <div className="glass rounded-2xl border border-white/5 p-6 space-y-4 bg-white/[0.01]">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre de invitado..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-obsidian border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gold text-xs"
                />
              </div>

              <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                {filteredGuests.map((guest) => {
                  const isCheckedIn = guest.tableId !== null && guest.seatIndex !== null;
                  return (
                    <div
                      key={guest.id}
                      className="p-3 rounded-lg bg-white/5 border border-white/5 flex justify-between items-center text-xs"
                    >
                      <div>
                        <p className="text-white font-medium">{guest.name}</p>
                        <p className="text-gray-500 text-[10px] font-light mt-0.5">
                          {guest.tickets} pases {isCheckedIn ? `• Mesa ${guest.tableId} Silla ${(guest.seatIndex as number) + 1}` : ""}
                        </p>
                      </div>

                      <button
                        disabled={isCheckedIn}
                        onClick={() => handleManualCheckIn(guest.id)}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${
                          isCheckedIn
                            ? "bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 cursor-default"
                            : "bg-gold hover:bg-gold-hover text-obsidian active:scale-95"
                        }`}
                      >
                        {isCheckedIn ? "Ingresado" : "Ingresar"}
                      </button>
                    </div>
                  );
                })}

                {filteredGuests.length === 0 && (
                  <div className="text-center py-8 text-xs text-gray-500 font-light">
                    No se encontraron invitados que coincidan con la búsqueda.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
