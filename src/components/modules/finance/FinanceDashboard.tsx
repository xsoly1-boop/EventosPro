"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, Landmark, ArrowUpRight, ArrowDownRight, Plus, Receipt } from "lucide-react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from "firebase/firestore";

interface Transaction {
  id: string;
  amount: number;
  type: "abono" | "reembolso" | "gasto_operativo";
  method: "transferencia" | "tarjeta" | "efectivo";
  reference: string;
  date: string;
}

export default function FinanceDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Form states to register transaction
  const [showAddForm, setShowAddForm] = useState(false);
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<"abono" | "reembolso" | "gasto_operativo">("abono");
  const [method, setMethod] = useState<"transferencia" | "tarjeta" | "efectivo">("transferencia");
  const [reference, setReference] = useState("");

  const totalEventCost = 150000; // Mock base event budget

  // 1. Subscribe to Firestore transactions collection
  useEffect(() => {
    if (!db) return;

    const txsRef = collection(db, "transactions");
    const unsubscribe = onSnapshot(txsRef, (snapshot) => {
      const list: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          amount: data.amount || 0,
          type: data.type || "abono",
          method: data.method || "transferencia",
          reference: data.reference || "N/A",
          date: data.date || "",
        });
      });

      if (snapshot.empty) {
        // Seed default transactions
        const defaults: Transaction[] = [
          { id: "t-1", amount: 50000, type: "abono", method: "transferencia", reference: "TRF-9238", date: "2026-06-15" },
          { id: "t-2", amount: 20000, type: "abono", method: "tarjeta", reference: "VISA-1122", date: "2026-06-20" },
          { id: "t-3", amount: 15000, type: "gasto_operativo", method: "efectivo", reference: "Pago Flores", date: "2026-06-22" },
          { id: "t-4", amount: 25000, type: "gasto_operativo", method: "transferencia", reference: "Catering Anticipo", date: "2026-06-25" },
        ];
        defaults.forEach(async (t) => {
          await setDoc(doc(db, "transactions", t.id), {
            amount: t.amount,
            type: t.type,
            method: t.method,
            reference: t.reference,
            date: t.date,
          });
        });
        setTransactions(defaults);
      } else {
        setTransactions(list);
      }
    });

    return () => unsubscribe();
  }, []);

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

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !db) return;

    const newId = `t-${Date.now()}`;
    const newTx: Transaction = {
      id: newId,
      amount,
      type,
      method,
      reference: reference.trim() || "N/A",
      date: new Date().toISOString().split("T")[0],
    };

    await setDoc(doc(db, "transactions", newId), {
      amount: newTx.amount,
      type: newTx.type,
      method: newTx.method,
      reference: newTx.reference,
      date: newTx.date,
    });

    setAmount(0);
    setReference("");
    setShowAddForm(false);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!db) return;
    await deleteDoc(doc(db, "transactions", id));
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
            <ArrowUpRight className="h-4.5 w-4.5" />
            <span>Cobranza ingresada</span>
          </div>
        </div>

        {/* KPI 3: Cuentas por Cobrar */}
        <div className="glass p-5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
              Saldo Pendiente (CxC)
            </span>
            <h3 className="text-2xl font-bold text-amber-500 font-mono">
              ${pendingBalance.toLocaleString("es-MX")}
            </h3>
          </div>
          <div className="text-[10px] text-amber-500 mt-4 flex items-center gap-1 font-light">
            <DollarSign className="h-3.5 w-3.5" />
            <span>Por liquidar del total</span>
          </div>
        </div>

        {/* KPI 4: Rentabilidad */}
        <div className="glass p-5 rounded-xl border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">
              Rentabilidad Estimada
            </span>
            <h3 className="text-2xl font-bold text-white font-mono">
              {profitabilityMargin.toFixed(1)}%
            </h3>
          </div>
          <div className="text-[10px] text-gray-400 mt-4 flex items-center gap-1 font-light">
            <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />
            <span>Gasto operativo: ${totalExpenses.toLocaleString("es-MX")}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction History Table */}
        <div className="glass-dark p-6 rounded-2xl border border-white/5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <Receipt className="text-gold h-4.5 w-4.5" />
              Historial de Transacciones
            </h3>
            <button
              onClick={() => setShowAddForm(true)}
              className="py-1.5 px-4 rounded-xl bg-gold text-obsidian text-xs font-semibold uppercase hover:bg-gold-hover transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Registrar Movimiento
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-light">
              <thead>
                <tr className="text-gray-500 border-b border-white/5 uppercase text-[9px] tracking-wider font-mono">
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Concepto / Ref</th>
                  <th className="py-3 px-4 text-center">Método</th>
                  <th className="py-3 px-4 text-center">Tipo</th>
                  <th className="py-3 px-4 text-right">Monto</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {transactions.map((tx) => {
                  const isIncome = tx.type === "abono";
                  const isExpense = tx.type === "gasto_operativo";

                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.01]">
                      <td className="py-3.5 px-4 font-mono">{tx.date}</td>
                      <td className="py-3.5 px-4 text-white font-normal">{tx.reference}</td>
                      <td className="py-3.5 px-4 text-center capitalize">{tx.method}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-semibold uppercase ${
                          isIncome 
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/10" 
                            : isExpense
                            ? "bg-amber-950/40 text-amber-500 border border-amber-500/10"
                            : "bg-red-950/40 text-red-400 border border-red-500/10"
                        }`}>
                          {tx.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold font-mono ${
                        isIncome ? "text-emerald-400" : "text-amber-500"
                      }`}>
                        ${tx.amount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          className="text-red-500 hover:text-red-400 transition-colors p-1"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Profitability breakdown sidebar */}
        <div className="glass-dark p-6 rounded-2xl border border-white/5 space-y-4 h-fit">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-white/5 pb-4">
            Análisis de Margen de Utilidad
          </h3>

          <div className="space-y-4 text-xs font-light text-gray-400">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>Ingresos Netos (Abonos)</span>
              <span className="text-white font-mono font-semibold">${netRevenue.toLocaleString("es-MX")}</span>
            </div>

            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>Costos Operativos</span>
              <span className="text-amber-500 font-mono font-semibold">-${totalExpenses.toLocaleString("es-MX")}</span>
            </div>

            <div className="flex justify-between border-b border-white/5 pb-2">
              <span>Utilidad Neta Salón</span>
              <span className="text-emerald-400 font-mono font-bold">${netProfit.toLocaleString("es-MX")}</span>
            </div>

            <div className="pt-2">
              <span className="text-[10px] text-gray-500 uppercase font-semibold">
                Distribución del Presupuesto
              </span>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mt-2 flex border border-white/5">
                <div 
                  className="bg-emerald-400 h-full" 
                  style={{ width: `${(totalIncomes / totalEventCost) * 100}%` }} 
                  title="Cobrado"
                />
                <div 
                  className="bg-amber-500 h-full" 
                  style={{ width: `${(totalExpenses / totalEventCost) * 100}%` }} 
                  title="Gastado"
                />
              </div>
              <div className="flex gap-4 mt-2.5 text-[9px] text-gray-400">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Cobrado: {((totalIncomes / totalEventCost) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Gastado: {((totalExpenses / totalEventCost) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-obsidian/85 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="glass-dark rounded-2xl border border-gold/20 max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Registrar Movimiento Financiero
              </h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-white text-xs"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                  Monto (USD / MXN)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Monto de transacción..."
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                    Tipo de Movimiento
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30"
                  >
                    <option value="abono">Abono (Ingreso)</option>
                    <option value="reembolso">Reembolso (Salida)</option>
                    <option value="gasto_operativo">Gasto Operativo</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30"
                  >
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta de Crédito</option>
                    <option value="efectivo">Efectivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                  Referencia / Concepto
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Transferencia Anticipo, Pago Flores..."
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="w-1/2 py-2.5 rounded-lg border border-gray-700 text-gray-400 text-xs font-semibold uppercase hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-gold hover:bg-gold-hover text-obsidian rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-[0_4px_15px_rgba(212,175,55,0.15)]"
                >
                  Registrar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
