"use client";

import React, { useState } from "react";
import { DollarSign, Landmark, ArrowUpRight, ArrowDownRight, Plus, Receipt } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  type: "abono" | "reembolso" | "gasto_operativo";
  method: "transferencia" | "tarjeta" | "efectivo";
  reference: string;
  date: string;
}

export default function FinanceDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "t-1", amount: 50000, type: "abono", method: "transferencia", reference: "TRF-9238", date: "2026-06-15" },
    { id: "t-2", amount: 20000, type: "abono", method: "tarjeta", reference: "VISA-1122", date: "2026-06-20" },
    { id: "t-3", amount: 15000, type: "gasto_operativo", method: "efectivo", reference: "Pago Flores", date: "2026-06-22" },
    { id: "t-4", amount: 25000, type: "gasto_operativo", method: "transferencia", reference: "Catering Anticipo", date: "2026-06-25" },
  ]);

  // Form states to register transaction
  const [showAddForm, setShowAddForm] = useState(false);
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<"abono" | "reembolso" | "gasto_operativo">("abono");
  const [method, setMethod] = useState<"transferencia" | "tarjeta" | "efectivo">("transferencia");
  const [reference, setReference] = useState("");

  const totalEventCost = 150000; // Mock base event budget

  const totalIncomes = transactions
    .filter((t) => t.type === "abono")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "gasto_operativo")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalReimbursed = transactions
    .filter((t) => t.type === "reembolso")
    .reduce((acc, t) => acc + t.amount, 0);

  const netRevenue = totalIncomes - totalReimbursed;
  const pendingBalance = totalEventCost - netRevenue;
  
  // Profitability = (Net Revenue - Expenses) / Net Revenue (or relative to cost)
  const netProfit = netRevenue - totalExpenses;
  const profitabilityMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const newTx: Transaction = {
      id: `t-${Date.now()}`,
      amount,
      type,
      method,
      reference: reference.trim() || "N/A",
      date: new Date().toISOString().split("T")[0],
    };

    setTransactions([newTx, ...transactions]);
    setAmount(0);
    setReference("");
    setShowAddForm(false);
  };

  return (
    <div className="p-4 space-y-6 w-full max-w-6xl mx-auto">
      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI 1: Costo del Evento */}
        <div className="glass p-5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
              Presupuesto Total Evento
            </span>
            <h3 className="text-2xl font-bold text-white font-mono">
              ${totalEventCost.toLocaleString("es-MX")}
            </h3>
          </div>
          <div className="text-[10px] text-gray-400 mt-4 flex items-center gap-1 font-light">
            <Landmark className="h-3.5 w-3.5 text-gold" />
            <span>Valor base cotizado</span>
          </div>
        </div>

        {/* KPI 2: Pagos Registrados */}
        <div className="glass p-5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
              Abonos Recibidos
            </span>
            <h3 className="text-2xl font-bold text-emerald-400 font-mono">
              ${totalIncomes.toLocaleString("es-MX")}
            </h3>
          </div>
          <div className="text-[10px] text-emerald-400 mt-4 flex items-center gap-1 font-semibold">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>{((totalIncomes / totalEventCost) * 100).toFixed(0)}% cubierto</span>
          </div>
        </div>

        {/* KPI 3: Saldo Pendiente */}
        <div className="glass p-5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
              Saldo Pendiente (CxC)
            </span>
            <h3 className="text-2xl font-bold text-red-400 font-mono">
              ${pendingBalance.toLocaleString("es-MX")}
            </h3>
          </div>
          <div className="text-[10px] text-red-400 mt-4 flex items-center gap-1 font-semibold">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span>Por cobrar</span>
          </div>
        </div>

        {/* KPI 4: Rentabilidad */}
        <div className="glass p-5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
              Margen de Rentabilidad Neta
            </span>
            <h3 className="text-2xl font-bold text-gold font-mono">
              {profitabilityMargin.toFixed(1)}%
            </h3>
          </div>
          <div className="text-[10px] text-gold mt-4 flex items-center gap-1 font-semibold">
            <DollarSign className="h-3.5 w-3.5" />
            <span>Utilidad neta: ${netProfit.toLocaleString("es-MX")}</span>
          </div>
        </div>
      </div>

      {/* Main Content split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Transaction list */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-gold tracking-wider uppercase">
              Registro de Transacciones
            </h4>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-2 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold border border-gold/20 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300"
            >
              <Plus className="h-3.5 w-3.5" />
              Nueva
            </button>
          </div>

          <div className="glass rounded-2xl border border-white/5 p-6 bg-white/[0.01]">
            <div className="space-y-4">
              <div className="grid grid-cols-12 text-xs text-gray-500 font-bold border-b border-white/5 pb-2">
                <div className="col-span-3">Fecha</div>
                <div className="col-span-4">Referencia</div>
                <div className="col-span-2">Método</div>
                <div className="col-span-3 text-right">Monto</div>
              </div>

              <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="grid grid-cols-12 text-sm text-gray-300 items-center py-2 border-b border-white/[0.02] last:border-b-0"
                  >
                    <div className="col-span-3 font-light text-xs">{tx.date}</div>
                    <div className="col-span-4 font-light text-white flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          tx.type === "abono"
                            ? "bg-emerald-400"
                            : tx.type === "reembolso"
                            ? "bg-red-400"
                            : "bg-orange-400"
                        }`}
                      />
                      <span>{tx.reference}</span>
                    </div>
                    <div className="col-span-2 text-xs text-gray-500 font-light capitalize">
                      {tx.method}
                    </div>
                    <div
                      className={`col-span-3 text-right font-semibold font-mono ${
                        tx.type === "abono"
                          ? "text-emerald-400"
                          : tx.type === "reembolso"
                          ? "text-red-400"
                          : "text-orange-400"
                      }`}
                    >
                      {tx.type === "gasto_operativo" || tx.type === "reembolso" ? "-" : "+"}
                      ${tx.amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Transaction Register Form (Floating look) */}
        <div className="lg:col-span-4">
          {showAddForm ? (
            <div className="glass rounded-2xl p-6 border border-gold/20 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Landmark className="text-gold h-5 w-5" />
                <h4 className="font-semibold text-white text-sm">Registrar Operación</h4>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">Monto ($)</label>
                  <input
                    type="number"
                    required
                    value={amount || ""}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-obsidian border border-gray-700 text-white focus:outline-none focus:border-gold text-xs"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">Tipo</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-obsidian border border-gray-700 text-white focus:outline-none focus:border-gold text-xs capitalize"
                  >
                    <option value="abono">Abono (Ingreso)</option>
                    <option value="gasto_operativo">Gasto Operativo (Egreso)</option>
                    <option value="reembolso">Reembolso</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">Método</label>
                  <select
                    value={method}
                    onChange={(e: any) => setMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-obsidian border border-gray-700 text-white focus:outline-none focus:border-gold text-xs capitalize"
                  >
                    <option value="transferencia">Transferencia bancaria</option>
                    <option value="tarjeta">Tarjeta de crédito/débito</option>
                    <option value="efectivo">Efectivo</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 font-semibold block mb-1">Referencia</label>
                  <input
                    type="text"
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-obsidian border border-gray-700 text-white focus:outline-none focus:border-gold text-xs"
                    placeholder="Ej. Transferencia Banco"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="w-1/2 py-2 rounded-lg border border-gray-700 text-gray-400 text-xs font-semibold uppercase hover:bg-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2 rounded-lg bg-gold hover:bg-gold-hover text-obsidian text-xs font-bold uppercase"
                  >
                    Registrar
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 border border-white/5 text-center py-12">
              <Landmark className="text-gold/40 h-10 w-10 mx-auto mb-4" />
              <h5 className="text-white text-xs font-semibold mb-1">Cálculo de Utilidad</h5>
              <p className="text-gray-400 text-[10px] font-light max-w-xs mx-auto leading-relaxed">
                El margen neto se recalcula instantáneamente tras ingresar abonos o egresos operativos asociados a la logística.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
