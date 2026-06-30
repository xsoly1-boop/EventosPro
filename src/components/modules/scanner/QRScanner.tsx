"use client";

import React, { useState, useEffect } from "react";
import { QrCode, Camera, Users, Search, CheckCircle, AlertTriangle } from "lucide-react";
import { useEventTables } from "@/hooks/useEventTables";

export default function QRScanner() {
  const { guests, loading, assignGuest } = useEventTables("event-123");
  const [searchQuery, setSearchQuery] = useState("");
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Total Capacity Calculations
  const checkedInCount = guests.filter((g) => g.tableId !== null && g.seatIndex !== null).length; // assigned seats as active attendance
  const totalGuests = guests.length;
  const attendanceRate = totalGuests > 0 ? (checkedInCount / totalGuests) * 100 : 0;

  const handleManualCheckIn = async (guestId: string) => {
    // Check in is represented by assigning them to a default first empty seat, or simulating a check-in status
    try {
      // Find first empty seat
      // Simple seat check
      let assigned = false;
      for (let tableNum = 1; tableNum <= 26; tableNum++) {
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

  const handleSimulateScan = () => {
    // Select a random unassigned guest
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
      {/* Attendance summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
              Aforo Total Salón
            </span>
            <h3 className="text-2xl font-bold text-white font-mono">
              {checkedInCount} <span className="text-gray-500 text-sm">/ {totalGuests}</span>
            </h3>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-4">
            <div className="bg-gold h-full rounded-full" style={{ width: `${attendanceRate}%` }} />
          </div>
        </div>

        <div className="glass p-5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
              Porcentaje Asistencia
            </span>
            <h3 className="text-2xl font-bold text-gold font-mono">
              {attendanceRate.toFixed(1)}%
            </h3>
          </div>
          <span className="text-[10px] text-gray-400 mt-4 font-light">En tiempo real vía escáner QR</span>
        </div>

        <div className="glass p-5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
              Invitados Fuera
            </span>
            <h3 className="text-2xl font-bold text-red-400 font-mono">
              {totalGuests - checkedInCount}
            </h3>
          </div>
          <span className="text-[10px] text-gray-400 mt-4 font-light">Pendientes de arribo</span>
        </div>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulated QR camera view */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="text-sm font-semibold text-gold tracking-wider uppercase">
            Cámara de Escaneo
          </h4>
          <div className="glass-dark rounded-2xl border border-white/5 overflow-hidden flex flex-col items-center justify-center p-8 aspect-video relative bg-black min-h-[300px]">
            {isCameraActive ? (
              <div className="text-center space-y-4 flex flex-col items-center">
                {/* Laser overlay animation */}
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

          {/* Scan result banner */}
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
            Búsqueda Logística de Invitados
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
    </div>
  );
}
