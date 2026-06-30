"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import LoginPortal from "@/components/modules/login/LoginPortal";
import TableMap from "@/components/modules/tables/TableMap";
import { ShieldAlert, QrCode } from "lucide-react";

export default function Home() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-500 font-light mt-4 tracking-widest uppercase animate-pulse">
          Cargando Sesión...
        </span>
      </div>
    );
  }

  if (!user) {
    return <LoginPortal />;
  }

  // RBAC Redirection logic
  if (user.role === "client") {
    return <TableMap onBack={logout} />;
  }

  // Fallback views for other roles for prototyping
  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-gold p-8 rounded-2xl max-w-md w-full border border-gold/30">
        <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6 border border-gold/20">
          {user.role === "admin" ? (
            <ShieldAlert className="text-gold h-8 w-8" />
          ) : (
            <QrCode className="text-gold h-8 w-8" />
          )}
        </div>
        
        <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block mb-1">
          Sesión de Demostración
        </span>
        <h2 className="text-2xl font-light text-white mb-2">
          Portal de {user.role === "admin" ? "Administrador" : "Recepción"}
        </h2>
        <p className="text-gray-400 text-xs font-light mb-8 leading-relaxed">
          Bienvenido, <strong className="text-white">{user.displayName}</strong>. Este módulo está actualmente bajo el plan de desarrollo. Por ahora, puedes cerrar sesión y usar el portal de "Anfitrión" para probar el Croquis 2D de mesas.
        </p>

        <button
          onClick={logout}
          className="w-full py-3 rounded-lg border border-gold/30 text-gold text-xs font-semibold uppercase tracking-wider hover:bg-gold hover:text-obsidian transition-all duration-300"
        >
          Cerrar Sesión / Volver
        </button>
      </div>
    </div>
  );
}
