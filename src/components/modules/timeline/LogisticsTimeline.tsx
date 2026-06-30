"use client";

import React, { useState } from "react";
import { Clock, CheckSquare, Square, User, Compass, HelpCircle } from "lucide-react";

interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description: string;
  responsible: string;
  completed: boolean;
}

export default function LogisticsTimeline() {
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

  const handleToggleComplete = (id: string) => {
    setTimeline(
      timeline.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const totalItems = timeline.length;
  const completedItems = timeline.filter((t) => t.completed).length;
  const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="p-4 space-y-6 w-full max-w-4xl mx-auto">
      {/* Progress Card */}
      <div className="glass p-6 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
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
          {/* Circular/Line Progress */}
          <div className="w-32 bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
            <div
              className="bg-gold h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

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
                    {/* Time indicator */}
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

                  {/* Responsible badge */}
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
