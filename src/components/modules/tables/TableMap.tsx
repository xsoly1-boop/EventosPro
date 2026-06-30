"use client";

import React, { useState, useEffect } from "react";
import { MoveLeft, HelpCircle, Users } from "lucide-react";
import { useEventTables } from "@/hooks/useEventTables";

interface Guest {
  id: string;
  name: string;
  tickets: number;
}

interface Assignment {
  [seatKey: string]: {
    guestId: string;
    name: string;
  };
}

interface TableMapProps {
  onBack: () => void;
}

export default function TableMap({ onBack }: TableMapProps) {
  const { guests, loading, error, assignGuest, unassignGuest, seedMockData } = useEventTables("event-123");

  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [draggedGuestId, setDraggedGuestId] = useState<string | null>(null);

  // Auto-seed mock data on initial load
  useEffect(() => {
    seedMockData();
  }, []);

  // Compute unassigned list and assignments dictionary reactively from Firestore guests state
  const unassignedGuests = guests.filter((g) => g.tableId === null);
  
  const assignments: Assignment = {};
  guests.forEach((g) => {
    if (g.tableId !== null && g.seatIndex !== null) {
      assignments[`${g.tableId}-${g.seatIndex}`] = {
        guestId: g.id,
        name: g.name,
      };
    }
  });

  // Layout Parameters: Aspect Ratio 9:50
  // SVG Canvas dimensions: Width 900, Height 5000
  const canvasWidth = 900;
  const canvasHeight = 5000;

  // Dynamic tables state
  const [totalTables, setTotalTables] = useState<number>(26);

  // Fixed Balcony tables configuration
  const balconyTables = [
    { id: "balcony-1", cx: 220, cy: 220, tableNumber: 101, displayNum: 1 },
    { id: "balcony-2", cx: 450, cy: 220, tableNumber: 102, displayNum: 2 },
    { id: "balcony-3", cx: 680, cy: 220, tableNumber: 103, displayNum: 3 },
  ];

  // Generate Table Coordinates dynamically based on state
  const tables: { id: number; cx: number; cy: number; tableNumber: number }[] = [];
  const startY = 900;
  const endY = 4700;

  const numLeft = Math.ceil(totalTables / 2);
  const numRight = Math.floor(totalTables / 2);

  // Left side tables in zigzag
  const stepYLeft = numLeft > 1 ? (endY - startY) / (numLeft - 1) : 0;
  for (let i = 0; i < numLeft; i++) {
    const cy = numLeft > 1 ? startY + i * stepYLeft : (startY + endY) / 2;
    const isZig = i % 2 === 0;
    tables.push({
      id: i * 2,
      cx: isZig ? 180 : 230,
      cy: cy,
      tableNumber: i + 1,
    });
  }

  // Right side tables in zigzag
  const stepYRight = numRight > 1 ? (endY - startY) / (numRight - 1) : 0;
  for (let i = 0; i < numRight; i++) {
    const cy = numRight > 1 ? startY + i * stepYRight : (startY + endY) / 2;
    const isZig = i % 2 === 0;
    tables.push({
      id: i * 2 + 1,
      cx: isZig ? 720 : 670,
      cy: cy,
      tableNumber: numLeft + i + 1,
    });
  }

  // Handle Drag Start
  const handleDragStart = (guestId: string) => {
    setDraggedGuestId(guestId);
  };

  // Handle Drop on Seat (saves to Firestore)
  const handleSeatDrop = async (tableNumber: number, seatIndex: number) => {
    const guestId = draggedGuestId || selectedGuestId;
    if (!guestId) return;

    try {
      await assignGuest(guestId, tableNumber, seatIndex);
    } catch (err) {
      console.error("Failed to assign seat in Firestore:", err);
    } finally {
      setDraggedGuestId(null);
      setSelectedGuestId(null);
    }
  };

  // Handle click to assign (alternative/fallback for mobile)
  const handleSeatClick = async (tableNumber: number, seatIndex: number) => {
    const seatKey = `${tableNumber}-${seatIndex}`;
    const existingAssignment = assignments[seatKey];

    if (existingAssignment) {
      try {
        await unassignGuest(tableNumber, seatIndex);
      } catch (err) {
        console.error("Failed to unassign seat in Firestore:", err);
      }
    } else if (selectedGuestId) {
      await handleSeatDrop(tableNumber, seatIndex);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex flex-col md:flex-row relative">
      {/* Sidebar Panel - Glassmorphism */}
      <div className="w-full md:w-80 glass border-r border-gold/10 p-6 flex flex-col justify-between z-20 shrink-0 md:h-screen md:sticky md:top-0">
        <div>
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-gold/30 hover:text-gold transition-all duration-300"
            >
              <MoveLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-[10px] text-gold tracking-widest font-semibold uppercase">
                Panel Cliente
              </span>
              <h2 className="text-lg font-medium text-white">Diseño de Mesas</h2>
            </div>
          </div>

          {/* User Guide Card */}
          <div className="glass-dark rounded-xl p-4 mb-6 border border-white/5">
            <div className="flex items-start gap-3">
              <HelpCircle className="text-gold h-4 w-4 shrink-0 mt-0.5" />
              <div className="text-[11px] text-gray-400 font-light leading-relaxed">
                <p className="font-semibold text-white mb-1">¿Cómo asignar?</p>
                1. Selecciona o arrastra un invitado de la lista.<br />
                2. Suéltalo o haz clic sobre cualquier silla vacía en el plano.<br />
                3. Haz clic en una silla ocupada para remover al invitado.
              </div>
            </div>
          </div>

          {/* Dynamic Tables Controller */}
          <div className="glass-dark rounded-xl p-4 mb-6 border border-white/5">
            <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block mb-1">
              Configuración de Aforo
            </span>
            <label className="text-[11px] text-gray-400 font-light block mb-2">
              Cantidad de Mesas: <span className="text-white font-bold text-xs">{totalTables}</span>
            </label>
            <input
              type="range"
              min="4"
              max="26"
              step="1"
              value={totalTables}
              onChange={(e) => setTotalTables(Number(e.target.value))}
              className="w-full accent-gold bg-white/10 rounded-lg appearance-none h-1 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-gray-500 mt-1 font-mono">
              <span>4 Mesas</span>
              <span>26 Mesas</span>
            </div>
          </div>

          {/* Draggable Guests List */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
              <Users className="h-4 w-4 text-gold" />
              <span>Invitados por Asignar ({unassignedGuests.length})</span>
            </div>

            <div className="space-y-2.5 max-h-[40vh] md:max-h-[50vh] overflow-y-auto pr-1">
              {loading ? (
                <div className="text-center py-10 text-xs text-gray-500 font-light flex flex-col items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                  <span>Sincronizando Firestore...</span>
                </div>
              ) : (
                <>
                  {unassignedGuests.map((guest) => {
                    const isSelected = selectedGuestId === guest.id;
                    return (
                      <div
                        key={guest.id}
                        draggable
                        onDragStart={() => handleDragStart(guest.id)}
                        onClick={() => setSelectedGuestId(isSelected ? null : guest.id)}
                        className={`p-3 rounded-lg border text-xs font-light transition-all duration-300 cursor-pointer select-none flex justify-between items-center ${
                          isSelected
                            ? "bg-gold/20 border-gold text-white shadow-[0_0_10px_rgba(212,175,55,0.1)]"
                            : "bg-white/5 border-white/5 text-gray-300 hover:border-gold/30 hover:bg-white/10"
                        }`}
                      >
                        <span>{guest.name}</span>
                        <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-gold border border-gold/20">
                          {guest.tickets} Pases
                        </span>
                      </div>
                    );
                  })}

                  {unassignedGuests.length === 0 && (
                    <div className="text-center py-8 text-xs text-gray-500 font-light">
                      Todos los invitados han sido asignados al plano.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status Indicator Legend */}
        <div className="border-t border-white/5 pt-6 mt-6">
          <h4 className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-3">
            Estados del Aforo
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-3 h-3 rounded-full border border-gray-600 bg-transparent" />
              <span>Vacío</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-3 h-3 rounded-full bg-gold" />
              <span>Ocupado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Area - Scrollable Container */}
      <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-8 overflow-y-auto max-h-screen">
        <div className="max-w-xl w-full text-center mb-6">
          <h3 className="text-sm font-semibold text-gold tracking-widest uppercase mb-1">
            Plano 2D del Salón
          </h3>
          <p className="text-xs text-gray-500 font-light">
            Visualización geométrica del montaje ({numLeft} mesas izq. y {numRight} der. en zigzag)
          </p>
        </div>

        {/* Scrollable layout box */}
        <div className="relative glass-dark border border-white/5 rounded-2xl w-full max-w-[450px] aspect-[9/50] overflow-y-auto shadow-2xl bg-black">
          {/* SVG Plan Render */}
          <svg
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
            className="w-full h-auto pointer-events-auto"
            style={{ minHeight: "2500px" }}
          >
            {/* Ambient Background Grid lines */}
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Zona de Balcón - Delineación Visual */}
            <g>
              {/* Dotted border line marking the Balcony area */}
              <line
                x1="40"
                y1="380"
                x2="860"
                y2="380"
                className="stroke-gold/20 stroke-[2] stroke-dasharray-[6,6]"
              />
              <rect
                x="350"
                y="355"
                width="200"
                height="50"
                rx="4"
                className="fill-obsidian stroke-gold/20 stroke-[1]"
              />
              <text
                x="450"
                y="385"
                textAnchor="middle"
                className="fill-gold font-semibold tracking-[0.3em] text-[10px] uppercase"
              >
                ZONA BALCÓN
              </text>
            </g>

            {/* Renderizar 3 Mesas de Balcón Fijas */}
            {balconyTables.map((table) => {
              const tableRadius = 60;
              const chairsCount = 10;
              const chairRadius = 14;
              const placementRadius = 88;

              const chairs: { cx: number; cy: number; key: string }[] = [];
              for (let j = 0; j < chairsCount; j++) {
                const angle = (j * 2 * Math.PI) / chairsCount;
                chairs.push({
                  cx: table.cx + placementRadius * Math.cos(angle),
                  cy: table.cy + placementRadius * Math.sin(angle),
                  key: `${table.tableNumber}-${j}`,
                });
              }

              return (
                <g key={table.id} className="group/table">
                  <circle
                    cx={table.cx}
                    cy={table.cy}
                    r={tableRadius + 15}
                    className="fill-transparent stroke-white/[0.02] stroke-[1]"
                  />

                  {chairs.map((chair, seatIndex) => {
                    const assigned = assignments[chair.key];

                    return (
                      <g
                        key={chair.key}
                        onClick={() => handleSeatClick(table.tableNumber, seatIndex)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleSeatDrop(table.tableNumber, seatIndex)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={chair.cx}
                          cy={chair.cy}
                          r={chairRadius}
                          className={`transition-all duration-300 ${
                            assigned
                              ? "fill-gold stroke-gold-hover stroke-[2]"
                              : "fill-obsidian stroke-gray-700 hover:stroke-gold/70 stroke-[1]"
                          }`}
                        />
                        {assigned && (
                          <text
                            x={chair.cx}
                            y={chair.cy + 3}
                            textAnchor="middle"
                            className="fill-obsidian font-bold text-[8px] pointer-events-none"
                          >
                            {assigned.name.substring(0, 2).toUpperCase()}
                          </text>
                        )}
                        <title>
                          {assigned
                            ? `Ocupado por: ${assigned.name}`
                            : `Balcón ${table.displayNum} - Silla ${seatIndex + 1}`}
                        </title>
                      </g>
                    );
                  })}

                  <circle
                    cx={table.cx}
                    cy={table.cy}
                    r={tableRadius}
                    className="fill-dark-gray stroke-gold/40 stroke-[2] shadow-lg group-hover/table:stroke-gold transition-colors duration-300"
                  />

                  <text
                    x={table.cx}
                    y={table.cy - 5}
                    textAnchor="middle"
                    className="fill-gold font-semibold text-xs tracking-wider"
                  >
                    BALCÓN
                  </text>
                  <text
                    x={table.cx}
                    y={table.cy + 15}
                    textAnchor="middle"
                    className="fill-white font-bold text-lg"
                  >
                    {table.displayNum}
                  </text>
                </g>
              );
            })}

            {/* 1. Cabecera (Mesa Principal) */}
            <g>
              <rect
                x="250"
                y="460"
                width="400"
                height="90"
                rx="8"
                className="fill-dark-gray stroke-gold stroke-[2] shadow-xl"
              />
              <text
                x="450"
                y="510"
                textAnchor="middle"
                className="fill-gold font-light tracking-[0.2em] text-sm uppercase"
              >
                Mesa Principal de Honor
              </text>
            </g>

            {/* 2. Pista de Baile Central */}
            <g>
              <rect
                x="380"
                y="900"
                width="140"
                height="3800"
                rx="6"
                className="fill-zafiro/5 stroke-zafiro/25 stroke-[1] stroke-dasharray-[10,5]"
              />
              {/* Vertical Dance Floor text markers */}
              {[1500, 2500, 3550, 4300].map((textY, idx) => (
                <text
                  key={idx}
                  x="450"
                  y={textY}
                  textAnchor="middle"
                  transform={`rotate(-90 450 ${textY})`}
                  className="fill-zafiro/30 font-semibold tracking-[0.4em] text-[11px] uppercase pointer-events-none"
                >
                  Pista de Baile
                </text>
              ))}
            </g>

            {/* 3. Mesas y Sillas */}
            {tables.map((table) => {
              const tableRadius = 60;
              const chairsCount = 10;
              const chairRadius = 14;
              const placementRadius = 88;

              // Build chairs coordinates
              const chairs: { cx: number; cy: number; key: string }[] = [];
              for (let j = 0; j < chairsCount; j++) {
                const angle = (j * 2 * Math.PI) / chairsCount;
                chairs.push({
                  cx: table.cx + placementRadius * Math.cos(angle),
                  cy: table.cy + placementRadius * Math.sin(angle),
                  key: `${table.tableNumber}-${j}`,
                });
              }

              return (
                <g key={table.id} className="group/table">
                  {/* Outer Table Circle Ring */}
                  <circle
                    cx={table.cx}
                    cy={table.cy}
                    r={tableRadius + 15}
                    className="fill-transparent stroke-white/[0.02] stroke-[1]"
                  />

                  {/* Draw Chairs around the table */}
                  {chairs.map((chair, seatIndex) => {
                    const assigned = assignments[chair.key];
                    const isDragOver = false; // logic placeholder

                    return (
                      <g
                        key={chair.key}
                        onClick={() => handleSeatClick(table.tableNumber, seatIndex)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleSeatDrop(table.tableNumber, seatIndex)}
                        className="cursor-pointer"
                      >
                        {/* Chair Seat Circle */}
                        <circle
                          cx={chair.cx}
                          cy={chair.cy}
                          r={chairRadius}
                          className={`transition-all duration-300 ${
                            assigned
                              ? "fill-gold stroke-gold-hover stroke-[2]"
                              : "fill-obsidian stroke-gray-700 hover:stroke-gold/70 stroke-[1]"
                          }`}
                        />
                        {/* Chair Initials if Assigned */}
                        {assigned && (
                          <text
                            x={chair.cx}
                            y={chair.cy + 3}
                            textAnchor="middle"
                            className="fill-obsidian font-bold text-[8px] pointer-events-none"
                          >
                            {assigned.name.substring(0, 2).toUpperCase()}
                          </text>
                        )}
                        {/* Seat number tooltip trigger on hover */}
                        <title>
                          {assigned
                            ? `Ocupado por: ${assigned.name}`
                            : `Mesa ${table.tableNumber} - Silla ${seatIndex + 1}`}
                        </title>
                      </g>
                    );
                  })}

                  {/* Draw main round table */}
                  <circle
                    cx={table.cx}
                    cy={table.cy}
                    r={tableRadius}
                    className="fill-dark-gray stroke-gold/40 stroke-[2] shadow-lg group-hover/table:stroke-gold transition-colors duration-300"
                  />

                  {/* Table Label */}
                  <text
                    x={table.cx}
                    y={table.cy - 5}
                    textAnchor="middle"
                    className="fill-gold font-semibold text-xs tracking-wider"
                  >
                    MESA
                  </text>
                  <text
                    x={table.cx}
                    y={table.cy + 15}
                    textAnchor="middle"
                    className="fill-white font-bold text-lg"
                  >
                    {table.tableNumber}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
