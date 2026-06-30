"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, Trash2, CheckCircle, Sparkles, AlertCircle } from "lucide-react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from "firebase/firestore";
import { useEventTables } from "@/hooks/useEventTables";

interface HostPortalProps {
  eventId: string;
  onBackToLogin?: () => void;
}

export default function HostPortal({ eventId, onBackToLogin }: HostPortalProps) {
  const { guests, loading, assignGuest, unassignGuest } = useEventTables(eventId);
  
  // Event details
  const [eventTitle, setEventTitle] = useState("Cargando Evento...");
  const [guestLimit, setGuestLimit] = useState(150);

  // Form inputs
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestTickets, setNewGuestTickets] = useState(2);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!db) return;
    const docRef = doc(db, "events", eventId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEventTitle(data.title || "Evento Invitados");
        setGuestLimit(data.guestLimit || 150);
      }
    });
    return () => unsubscribe();
  }, [eventId]);

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim() || !db) return;

    // Check capacity limits
    const currentTotalTickets = guests.reduce((acc, g) => acc + g.tickets, 0);
    if (currentTotalTickets + newGuestTickets > guestLimit) {
      alert(`Has superado el límite de pases de tu evento (${guestLimit} pases).`);
      return;
    }

    try {
      const guestId = `guest-${Date.now()}`;
      await setDoc(doc(db, "events", eventId, "guests", guestId), {
        name: newGuestName,
        tickets: Number(newGuestTickets),
        tableId: null,
        seatIndex: null
      });
      setNewGuestName("");
      setNewGuestTickets(2);
      setSaveStatus("Invitado agregado con éxito");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!db) return;
    if (window.confirm("¿Seguro que deseas eliminar a este invitado de la lista?")) {
      await deleteDoc(doc(db, "events", eventId, "guests", guestId));
    }
  };

  const totalRegistered = guests.reduce((acc, g) => acc + g.tickets, 0);

  return (
    <div className="min-h-screen bg-obsidian text-foreground p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl glass-dark border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 z-10 relative">
        {/* Header branding */}
        <div className="flex justify-between items-center border-b border-white/5 pb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="text-gold h-5 w-5 animate-pulse" />
            <span className="text-xs font-semibold tracking-[0.2em] text-gold uppercase">
              SocialesVIP Portal Anfitrión
            </span>
          </div>
          {onBackToLogin && (
            <button
              onClick={onBackToLogin}
              className="text-[10px] text-gray-500 hover:text-white uppercase font-mono tracking-wider transition-colors"
            >
              Acceso Staff
            </button>
          )}
        </div>

        {/* Event welcome stats */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="text-center md:text-left">
            <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block mb-1">
              Registro de Listado Oficial
            </span>
            <h2 className="text-xl font-semibold text-white">{eventTitle}</h2>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center text-xs">
            <div>
              <span className="text-[9px] text-gray-500 block uppercase font-mono">Pases Disponibles</span>
              <span className="text-white font-bold font-mono">{guestLimit}</span>
            </div>
            <div>
              <span className="text-[9px] text-gray-500 block uppercase font-mono">Registrados</span>
              <span className="text-gold font-bold font-mono">{totalRegistered}</span>
            </div>
            <div>
              <span className="text-[9px] text-gray-500 block uppercase font-mono">Libres</span>
              <span className="text-emerald-400 font-bold font-mono">{guestLimit - totalRegistered}</span>
            </div>
          </div>
        </div>

        {/* Add Guest Form */}
        <form onSubmit={handleAddGuest} className="bg-white/[0.01] border border-white/5 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Plus className="h-4 w-4 text-gold" />
            Agregar Invitado / Familia
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">
                Nombre de Invitado o Familia
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Familia Hernández o Ing. Javier López"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-obsidian border border-gray-700 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="text-[9px] text-gray-500 font-bold uppercase block mb-1">
                Boletos / Pases
              </label>
              <input
                type="number"
                required
                min={1}
                max={20}
                value={newGuestTickets}
                onChange={(e) => setNewGuestTickets(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-obsidian border border-gray-700 text-white text-xs focus:outline-none focus:border-gold font-mono text-center"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            {saveStatus ? (
              <span className="text-[10px] text-green-400 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" />
                {saveStatus}
              </span>
            ) : (
              <span className="text-[9px] text-gray-500 italic">
                * Los cambios se sincronizan en tiempo real con la recepción del salón.
              </span>
            )}

            <button
              type="submit"
              className="py-2 px-5 bg-gold hover:bg-gold-hover text-obsidian rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300"
            >
              Registrar
            </button>
          </div>
        </form>

        {/* Guests List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-gold" />
            Lista de Invitados Registrados ({guests.length})
          </h3>

          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
            {guests.map((g) => (
              <div
                key={g.id}
                className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex justify-between items-center text-xs"
              >
                <div>
                  <h4 className="text-white font-medium">{g.name}</h4>
                  <span className="text-[10px] text-gray-500 block font-light mt-0.5">
                    {g.tickets} pases {g.tableId !== null ? `• Mesa ${g.tableId}` : "• Mesa no asignada"}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteGuest(g.id)}
                  className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all duration-300"
                  title="Eliminar de la lista"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

            {guests.length === 0 && !loading && (
              <div className="text-center py-10 text-xs text-gray-500 font-light flex flex-col items-center gap-2">
                <AlertCircle className="h-5 w-5 text-gray-600" />
                <span>No has registrado invitados en tu lista aún. ¡Comienza a agregar arriba!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
