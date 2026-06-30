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

  // Layout Parameters: Aspect Ratio 12:30
  // SVG Canvas dimensions: Width 1200, Height 3000
  const canvasWidth = 1200;
  const canvasHeight = 3000;

  // Dynamic tables state
  const [totalTables, setTotalTables] = useState<number>(26);
  const [honorCapacity, setHonorCapacity] = useState<number>(6);

  const isDoubleHonor = honorCapacity > 6;
  const startY = isDoubleHonor ? 580 : 500;
  const endY = 2850;

  const danceFloorMarkers = isDoubleHonor 
    ? [950, 1650, 2350] 
    : [900, 1600, 2300];

  // Fixed Balcony tables configuration
  const balconyTables = [
    { id: "balcony-1", cx: 300, cy: 107, tableNumber: 101, displayNum: 1 },
    { id: "balcony-2", cx: 600, cy: 107, tableNumber: 102, displayNum: 2 },
    { id: "balcony-3", cx: 900, cy: 107, tableNumber: 103, displayNum: 3 },
  ];

  // Generate Table Coordinates dynamically based on state
  const tables: { id: number; cx: number; cy: number; tableNumber: number }[] = [];

  const numLeft = Math.ceil(totalTables / 2);
  const numRight = Math.floor(totalTables / 2);

  // Left side tables in zigzag
  const stepYLeft = numLeft > 1 ? (endY - startY) / (numLeft - 1) : 0;
  for (let i = 0; i < numLeft; i++) {
    const cy = numLeft > 1 ? startY + i * stepYLeft : (startY + endY) / 2;
    const isZig = i % 2 === 0;
    tables.push({
      id: i * 2,
      cx: isZig ? 105 : 296, // 105 for 3px from left wall, 296 for 2px from dance floor
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
      cx: isZig ? 1095 : 904, // 1095 for 3px from right wall, 904 for 2px from dance floor
      cy: cy,
      tableNumber: numLeft + i + 1,
    });
  }

  // Handle Drag Start
  const handleDragStart = (guestId: string) => {
    setDraggedGuestId(guestId);
  };

  // Handle Drop on Table (finds first empty seat and saves to Firestore)
  const handleTableDrop = async (tableNumber: number) => {
    const guestId = draggedGuestId || selectedGuestId;
    if (!guestId) return;

    // Head table 1 has dynamic seats, head table 2 has dynamic seats, other tables have 10 seats
    let chairsCount = 10;
    if (tableNumber === 0) {
      chairsCount = isDoubleHonor ? Math.ceil(honorCapacity / 2) : honorCapacity;
    } else if (tableNumber === 99) {
      chairsCount = Math.floor(honorCapacity / 2);
    }

    let targetSeatIndex = -1;

    for (let j = 0; j < chairsCount; j++) {
      const isOccupied = guests.some((g) => g.tableId === tableNumber && g.seatIndex === j);
      if (!isOccupied) {
        targetSeatIndex = j;
        break;
      }
    }

    if (targetSeatIndex !== -1) {
      try {
        await assignGuest(guestId, tableNumber, targetSeatIndex);
      } catch (err) {
        console.error("Failed to assign guest to table:", err);
      } finally {
        setDraggedGuestId(null);
        setSelectedGuestId(null);
      }
    } else {
      const tableName = tableNumber === 0 
        ? "Mesa de Honor 1" 
        : tableNumber === 99 
        ? "Mesa de Honor 2"
        : tableNumber > 100 
        ? `Balcón ${tableNumber - 100}` 
        : `Mesa ${tableNumber}`;
      alert(`La ${tableName} ya está llena (máx. ${chairsCount} invitados).`);
      setDraggedGuestId(null);
      setSelectedGuestId(null);
    }
  };

  // Handle click to assign to table (alternative/fallback for mobile)
  const handleTableClick = async (tableNumber: number) => {
    if (selectedGuestId) {
      await handleTableDrop(tableNumber);
    }
  };

  // Handle click to unassign from seat
  const handleSeatClick = async (tableNumber: number, seatIndex: number) => {
    const seatKey = `${tableNumber}-${seatIndex}`;
    const existingAssignment = assignments[seatKey];

    if (existingAssignment) {
      try {
        await unassignGuest(tableNumber, seatIndex);
      } catch (err) {
        console.error("Failed to unassign seat in Firestore:", err);
      }
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
          <div className="glass-dark rounded-xl p-4 mb-6 border border-white/5 space-y-4">
            <div>
              <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block mb-1">
                Aforo Salón General
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

            <div className="border-t border-white/5 pt-3">
              <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block mb-1">
                Aforo Mesa de Honor
              </span>
              <label className="text-[11px] text-gray-400 font-light block mb-2">
                Invitados: <span className="text-white font-bold text-xs">{honorCapacity}</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={honorCapacity}
                onChange={(e) => setHonorCapacity(Number(e.target.value))}
                className="w-full accent-gold bg-white/10 rounded-lg appearance-none h-1 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-gray-500 mt-1 font-mono">
                <span>1 Persona</span>
                <span>20 Personas</span>
              </div>
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
        <div 
          className="relative glass-dark border border-white/5 rounded-2xl w-full max-w-[500px] overflow-y-auto shadow-2xl bg-black"
          style={{ aspectRatio: "12/30" }}
        >
          {/* SVG Plan Render */}
          <svg
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
            className="w-full h-auto pointer-events-auto"
            style={{ minHeight: "1500px" }}
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
                x1="50"
                y1="214"
                x2="1150"
                y2="214"
                className="stroke-gold/20 stroke-[2] stroke-dasharray-[6,6]"
              />
              <rect
                x="500"
                y="214"
                width="200"
                height="36"
                rx="4"
                className="fill-obsidian stroke-gold/20 stroke-[1]"
              />
              <text
                x="600"
                y="236"
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
                <g 
                  key={table.id} 
                  className="group/table"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleTableDrop(table.tableNumber)}
                  onClick={() => handleTableClick(table.tableNumber)}
                >
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSeatClick(table.tableNumber, seatIndex);
                        }}
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

            {/* 1. Cabecera (Mesa Principal de Honor - Dinámica 1 o 2 Mesas en Vertical con Distribución Perimetral) */}
            {(() => {
              // Helper to build perimeter chairs positions for horizontal table (up to 10 per table)
              const getTablePerimeterChairs = (cx: number, cy: number, count: number) => {
                const slots = [
                  { dx: -45, dy: -65 },  // 1. Top mid-left
                  { dx: 45, dy: -65 },   // 2. Top mid-right
                  { dx: -45, dy: 65 },   // 3. Bottom mid-left
                  { dx: 45, dy: 65 },    // 4. Bottom mid-right
                  { dx: -165, dy: 0 },   // 5. Left
                  { dx: 165, dy: 0 },    // 6. Right
                  { dx: -115, dy: -65 }, // 7. Top far-left
                  { dx: 115, dy: -65 },  // 8. Top far-right
                  { dx: -115, dy: 65 },  // 9. Bottom far-left
                  { dx: 115, dy: 65 },   // 10. Bottom far-right
                ];

                return slots.slice(0, count).map((slot, index) => ({
                  cx: cx + slot.dx,
                  cy: cy + slot.dy,
                  seatIndex: index
                }));
              };

              // Helper to build perimeter chairs positions for rotated vertical table (up to 10 per table)
              const getTableVerticalPerimeterChairs = (cx: number, cy: number, count: number) => {
                const slots = [
                  { dx: -65, dy: -45 },  // 1. Left mid-top
                  { dx: -65, dy: 45 },   // 2. Left mid-bottom
                  { dx: 65, dy: -45 },   // 3. Right mid-top
                  { dx: 65, dy: 45 },    // 4. Right mid-bottom
                  { dx: 0, dy: -165 },   // 5. Top
                  { dx: 0, dy: 165 },    // 6. Bottom
                  { dx: -65, dy: -115 }, // 7. Left far-top
                  { dx: -65, dy: 115 },  // 8. Left far-bottom
                  { dx: 65, dy: -115 },  // 9. Right far-top
                  { dx: 65, dy: 115 },   // 10. Right far-bottom
                ];

                return slots.slice(0, count).map((slot, index) => ({
                  cx: cx + slot.dx,
                  cy: cy + slot.dy,
                  seatIndex: index
                }));
              };

              if (!isDoubleHonor) {
                // Case A: 1 Single Mesa de Honor (1 to 6 guests)
                const tableCy = 385; // Center of table y=335 to 435
                const chairs = getTablePerimeterChairs(600, tableCy, honorCapacity);

                return (
                  <g
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleTableDrop(0)}
                    onClick={() => handleTableClick(0)}
                    className="cursor-pointer group/honor"
                  >
                    {/* VIP Stage Ring */}
                    <rect
                      x="430"
                      y="320"
                      width="340"
                      height="130"
                      rx="14"
                      className="fill-transparent stroke-gold/10 stroke-[1] stroke-dasharray-[4,4]"
                    />

                    {/* Render VIP Chairs around the perimeter */}
                    {chairs.map((chair) => {
                      const chairKey = `0-${chair.seatIndex}`;
                      const assigned = assignments[chairKey];
                      const vipChairRadius = 15;

                      return (
                        <g
                          key={chairKey}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSeatClick(0, chair.seatIndex);
                          }}
                          className="cursor-pointer"
                        >
                          <circle
                            cx={chair.cx}
                            cy={chair.cy}
                            r={vipChairRadius}
                            className={`transition-all duration-300 ${
                              assigned
                                ? "fill-gold stroke-gold-hover stroke-[2] shadow-[0_0_10px_#D4AF37]"
                                : "fill-obsidian stroke-gold/30 hover:stroke-gold stroke-[1]"
                            }`}
                          />
                          {assigned && (
                            <text
                              x={chair.cx}
                              y={chair.cy + 3}
                              textAnchor="middle"
                              className="fill-obsidian font-bold text-[9px] pointer-events-none"
                            >
                              {assigned.name.substring(0, 2).toUpperCase()}
                            </text>
                          )}
                          <title>
                            {assigned
                              ? `Ocupado por: ${assigned.name}`
                              : `Mesa de Honor - Silla ${chair.seatIndex + 1}`}
                          </title>
                        </g>
                      );
                    })}

                    <rect
                      x="450"
                      y="335"
                      width="300"
                      height="100"
                      rx="10"
                      className="fill-dark-gray stroke-gold stroke-[3] shadow-[0_0_20px_rgba(212,175,55,0.15)] group-hover/honor:stroke-gold-hover transition-all duration-300"
                    />
                    <text
                      x="600"
                      y="390"
                      textAnchor="middle"
                      className="fill-gold font-semibold tracking-[0.15em] text-xs uppercase"
                    >
                      Mesa de Honor
                    </text>
                  </g>
                );
              } else {
                // Case B: 2 Mesas de Honor Rotadas 90 grados a los lados (7 to 20 guests)
                const tableCy = 385; // Vertical center
                const table1Cx = 450; // Left table center
                const table2Cx = 750; // Right table center
                
                const topSeatsCount = Math.ceil(honorCapacity / 2);
                const bottomSeatsCount = Math.floor(honorCapacity / 2);

                const leftChairs = getTableVerticalPerimeterChairs(table1Cx, tableCy, topSeatsCount);
                const rightChairs = getTableVerticalPerimeterChairs(table2Cx, tableCy, bottomSeatsCount);

                return (
                  <g className="group/honor-double">
                    {/* VIP Stage Ring covering both rotated tables */}
                    <rect
                      x="360"
                      y="200"
                      width="480"
                      height="370"
                      rx="14"
                      className="fill-transparent stroke-gold/10 stroke-[1] stroke-dasharray-[4,4]"
                    />

                    {/* Table 1 (Left) Group */}
                    <g
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleTableDrop(0)}
                      onClick={() => handleTableClick(0)}
                      className="cursor-pointer"
                    >
                      {/* Chairs Table 1 */}
                      {leftChairs.map((chair) => {
                        const chairKey = `0-${chair.seatIndex}`;
                        const assigned = assignments[chairKey];
                        const vipChairRadius = 14;

                        return (
                          <g
                            key={chairKey}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSeatClick(0, chair.seatIndex);
                            }}
                            className="cursor-pointer"
                          >
                            <circle
                              cx={chair.cx}
                              cy={chair.cy}
                              r={vipChairRadius}
                              className={`transition-all duration-300 ${
                                assigned
                                  ? "fill-gold stroke-gold-hover stroke-[2] shadow-[0_0_10px_#D4AF37]"
                                  : "fill-obsidian stroke-gold/30 hover:stroke-gold stroke-[1]"
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
                                : `Mesa de Honor 1 (Izquierda) - Silla ${chair.seatIndex + 1}`}
                            </title>
                          </g>
                        );
                      })}

                      <rect
                        x="400"
                        y="235"
                        width="100"
                        height="300"
                        rx="10"
                        className="fill-dark-gray stroke-gold stroke-[3] shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:stroke-gold-hover transition-all duration-300"
                      />
                      <text
                        x="450"
                        y="385"
                        textAnchor="middle"
                        transform="rotate(-90 450 385)"
                        className="fill-gold font-semibold tracking-[0.12em] text-xs uppercase"
                      >
                        Mesa de Honor 1
                      </text>
                    </g>

                    {/* Table 2 (Right) Group */}
                    <g
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleTableDrop(99)}
                      onClick={() => handleTableClick(99)}
                      className="cursor-pointer"
                    >
                      {/* Chairs Table 2 */}
                      {rightChairs.map((chair) => {
                        const chairKey = `99-${chair.seatIndex}`;
                        const assigned = assignments[chairKey];
                        const vipChairRadius = 14;

                        return (
                          <g
                            key={chairKey}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSeatClick(99, chair.seatIndex);
                            }}
                            className="cursor-pointer"
                          >
                            <circle
                              cx={chair.cx}
                              cy={chair.cy}
                              r={vipChairRadius}
                              className={`transition-all duration-300 ${
                                assigned
                                  ? "fill-gold stroke-gold-hover stroke-[2] shadow-[0_0_10px_#D4AF37]"
                                  : "fill-obsidian stroke-gold/30 hover:stroke-gold stroke-[1]"
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
                                : `Mesa de Honor 2 (Derecha) - Silla ${chair.seatIndex + 1}`}
                            </title>
                          </g>
                        );
                      })}

                      <rect
                        x="700"
                        y="235"
                        width="100"
                        height="300"
                        rx="10"
                        className="fill-dark-gray stroke-gold stroke-[3] shadow-[0_0_15px_rgba(212,175,55,0.15)] hover:stroke-gold-hover transition-all duration-300"
                      />
                      <text
                        x="750"
                        y="385"
                        textAnchor="middle"
                        transform="rotate(-90 750 385)"
                        className="fill-gold font-semibold tracking-[0.12em] text-xs uppercase"
                      >
                        Mesa de Honor 2
                      </text>
                    </g>
                  </g>
                );
              }
            })()}

            {/* 2. Pista de Baile Central */}
            <g>
              <rect
                x="400"
                y={startY}
                width="400"
                height={endY - startY}
                rx="6"
                className="fill-zafiro/5 stroke-zafiro/25 stroke-[1] stroke-dasharray-[10,5]"
              />
              {/* Vertical Dance Floor text markers */}
              {danceFloorMarkers.map((textY, idx) => (
                <text
                  key={idx}
                  x="600"
                  y={textY}
                  textAnchor="middle"
                  transform={`rotate(-90 600 ${textY})`}
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
                <g 
                  key={table.id} 
                  className="group/table"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleTableDrop(table.tableNumber)}
                  onClick={() => handleTableClick(table.tableNumber)}
                >
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

                    return (
                      <g
                        key={chair.key}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSeatClick(table.tableNumber, seatIndex);
                        }}
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
