"use client";

import React, { useState } from "react";
import { FileText, Plus, CheckCircle, Trash2, Edit3, DollarSign, Users, Award } from "lucide-react";

interface QuoteItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface Quote {
  id: string;
  clientName: string;
  phone: string;
  date: string;
  guestsCount: number;
  items: QuoteItem[];
  status: "borrador" | "enviada" | "aprobada";
}

export default function QuotesManager() {
  const [quotes, setQuotes] = useState<Quote[]>([
    {
      id: "q-1",
      clientName: "Sofía Ramos",
      phone: "5598765432",
      date: "2026-10-18",
      guestsCount: 200,
      status: "enviada",
      items: [
        { id: "i-1", name: "Banquete premium 3 tiempos", price: 450, qty: 200 },
        { id: "i-2", name: "DJ, audio e iluminación robótica", price: 15000, qty: 1 },
        { id: "i-3", name: "Barra de bebidas libre nacional", price: 180, qty: 200 },
      ],
    },
    {
      id: "q-2",
      clientName: "Ing. Javier López",
      phone: "5512345678",
      date: "2026-12-05",
      guestsCount: 150,
      status: "borrador",
      items: [
        { id: "i-4", name: "Renta de Salón Imperial", price: 25000, qty: 1 },
        { id: "i-5", name: "Menú infantil y animación", price: 220, qty: 150 },
      ],
    },
  ]);

  const [activeQuoteId, setActiveQuoteId] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [guestsCount, setGuestsCount] = useState(150);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [newItemQty, setNewItemQty] = useState(1);

  const activeQuote = quotes.find((q) => q.id === activeQuoteId);

  const calculateTotal = (itemsList: QuoteItem[]) => {
    return itemsList.reduce((acc, item) => acc + item.price * item.qty, 0);
  };

  const handleCreateQuote = () => {
    const newQuote: Quote = {
      id: `q-${Date.now()}`,
      clientName: "Nuevo Prospecto",
      phone: "",
      date: new Date().toISOString().split("T")[0],
      guestsCount: 150,
      status: "borrador",
      items: [
        { id: `i-${Date.now()}-1`, name: "Servicio de Salón Base", price: 20000, qty: 1 },
      ],
    };
    setQuotes([newQuote, ...quotes]);
    setActiveQuoteId(newQuote.id);
    loadQuoteData(newQuote);
  };

  const loadQuoteData = (q: Quote) => {
    setClientName(q.clientName);
    setGuestsCount(q.guestsCount);
    setItems([...q.items]);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: QuoteItem = {
      id: `i-${Date.now()}`,
      name: newItemName,
      price: newItemPrice,
      qty: newItemQty,
    };

    setItems([...items, newItem]);
    setNewItemName("");
    setNewItemPrice(0);
    setNewItemQty(1);
  };

  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const handleSaveQuote = () => {
    if (!activeQuoteId) return;
    setQuotes(
      quotes.map((q) =>
        q.id === activeQuoteId
          ? { ...q, clientName, guestsCount, items }
          : q
      )
    );
    alert("Cotización guardada exitosamente.");
  };

  const handleApproveQuote = (id: string) => {
    setQuotes(
      quotes.map((q) =>
        q.id === id ? { ...q, status: "aprobada" as const } : q
      )
    );
    alert("Cotización Aprobada. Se ha generado un nuevo Evento Reservado y credenciales para el cliente.");
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 p-4">
      {/* Sidebar: List of Quotes */}
      <div className="w-full lg:w-80 shrink-0 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gold tracking-wider uppercase">
            Cotizaciones
          </h3>
          <button
            onClick={handleCreateQuote}
            className="p-2 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            Nueva
          </button>
        </div>

        <div className="space-y-3">
          {quotes.map((q) => {
            const total = calculateTotal(q.items);
            const isActive = q.id === activeQuoteId;
            return (
              <div
                key={q.id}
                onClick={() => {
                  setActiveQuoteId(isActive ? null : q.id);
                  if (!isActive) loadQuoteData(q);
                }}
                className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
                  isActive
                    ? "bg-gold/10 border-gold shadow-[0_4px_20px_rgba(212,175,55,0.08)]"
                    : "bg-white/5 border-white/5 hover:border-gold/20 hover:bg-white/10"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-white text-sm">{q.clientName}</h4>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase border ${
                      q.status === "aprobada"
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/20"
                        : q.status === "enviada"
                        ? "bg-zafiro/20 text-zafiro border-zafiro/25"
                        : "bg-gray-800 text-gray-400 border-gray-700"
                    }`}
                  >
                    {q.status}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-400 font-light">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-gold/60" />
                    <span>{q.guestsCount} Invitados</span>
                  </div>
                  <div className="font-semibold text-gold">
                    ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Panel: Editor */}
      <div className="flex-grow">
        {activeQuote ? (
          <div className="glass rounded-2xl p-6 border border-gold/10 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block mb-1">
                  Editor de Cotización
                </span>
                <h2 className="text-xl font-light text-white">
                  Presupuesto para <span className="font-semibold">{clientName}</span>
                </h2>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveQuote}
                  className="px-4 py-2 rounded-lg border border-gold/30 text-gold text-xs font-semibold uppercase hover:bg-gold/10 transition-colors"
                >
                  Guardar Borrador
                </button>
                {activeQuote.status !== "aprobada" && (
                  <button
                    onClick={() => handleApproveQuote(activeQuote.id)}
                    className="px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-obsidian text-xs font-bold uppercase transition-colors"
                  >
                    Aprobar Evento
                  </button>
                )}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase block mb-1.5">
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-obsidian border border-gray-700 text-white focus:outline-none focus:border-gold text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold uppercase block mb-1.5">
                  Aforo Estimado
                </label>
                <input
                  type="number"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg bg-obsidian border border-gray-700 text-white focus:outline-none focus:border-gold text-sm"
                />
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h4 className="text-xs font-semibold text-gold tracking-wider uppercase mb-3">
                Conceptos y Servicios
              </h4>
              <div className="space-y-2 border border-white/5 rounded-xl p-4 bg-white/[0.01]">
                <div className="grid grid-cols-12 text-xs text-gray-500 font-bold border-b border-white/5 pb-2 mb-2">
                  <div className="col-span-6">Concepto</div>
                  <div className="col-span-2 text-right">Precio</div>
                  <div className="col-span-1 text-center">Cant</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                  <div className="col-span-1"></div>
                </div>

                <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 text-sm text-gray-300 items-center hover:bg-white/5 py-1.5 px-2 rounded-lg transition-colors"
                    >
                      <div className="col-span-6 font-light">{item.name}</div>
                      <div className="col-span-2 text-right font-mono">
                        ${item.price.toLocaleString("es-MX")}
                      </div>
                      <div className="col-span-1 text-center font-mono">{item.qty}</div>
                      <div className="col-span-2 text-right font-semibold text-white font-mono">
                        ${(item.price * item.qty).toLocaleString("es-MX")}
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-500 hover:text-red-400 p-1 hover:bg-white/5 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form to Add Item */}
                <form onSubmit={handleAddItem} className="grid grid-cols-12 gap-2 border-t border-white/5 pt-4 mt-2">
                  <div className="col-span-5">
                    <input
                      type="text"
                      required
                      placeholder="Nuevo concepto..."
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-obsidian border border-gray-700 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      required
                      placeholder="Precio..."
                      value={newItemPrice || ""}
                      onChange={(e) => setNewItemPrice(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-obsidian border border-gray-700 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      required
                      placeholder="Cant..."
                      value={newItemQty || ""}
                      onChange={(e) => setNewItemQty(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-obsidian border border-gray-700 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <button
                      type="submit"
                      className="w-full py-1.5 rounded-lg bg-gold hover:bg-gold-hover text-obsidian text-xs font-bold uppercase transition-colors"
                    >
                      Añadir
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Total Balance */}
            <div className="flex justify-between items-center border-t border-white/5 pt-6 bg-white/[0.01] -mx-6 -mb-6 p-6 rounded-b-2xl">
              <span className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
                Total de Cotización
              </span>
              <div className="text-3xl font-bold text-gold font-mono">
                ${calculateTotal(items).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-12 border border-white/5 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mb-6">
              <FileText className="text-gold h-8 w-8" />
            </div>
            <h3 className="text-xl font-light text-white mb-2">Editor de Cotizaciones</h3>
            <p className="text-gray-400 text-sm font-light max-w-sm">
              Selecciona una cotización de la lista de prospección en el panel lateral o presiona "Nueva" para crear un presupuesto.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
