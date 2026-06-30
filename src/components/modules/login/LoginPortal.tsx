"use client";

import React, { useState } from "react";
import { Shield, User, QrCode, Sparkles, KeyRound, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth, UserRole } from "@/hooks/useAuth";

export default function LoginPortal() {
  const { login, loginDemo } = useAuth();
  
  // Navigation states
  const [activeForm, setActiveForm] = useState<"menu" | "host-code" | "auth-fields">("menu");
  const [authRole, setAuthRole] = useState<UserRole>(null);
  
  // Form states
  const [hostCode, setHostCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleHostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hostCode.trim() === "SVIP-2026") {
      loginDemo("client");
    } else {
      setError("Código inválido. Prueba con 'SVIP-2026' para la demostración.");
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      // Auth success is handled reactively by the AuthProvider state
    } catch (err: any) {
      console.error("Login failed:", err);
      // Map common Firebase errors to user friendly messages
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
      } else {
        setError("Error de autenticación: " + (err.message || "Inténtalo de nuevo."));
      }
    } finally {
      setLoading(false);
    }
  };

  const openAuthForm = (role: UserRole) => {
    setAuthRole(role);
    setEmail("");
    setPassword("");
    setError("");
    setActiveForm("auth-fields");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Title & Branding */}
      <div className="text-center mb-16 max-w-2xl z-10 animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="text-gold h-6 w-6 animate-pulse" />
          <span className="text-sm font-semibold tracking-[0.25em] text-gold uppercase">
            SocialesVIP
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mb-4">
          Gestión Premium de <br />
          <span className="font-semibold bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent">
            Eventos Sociales
          </span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base font-light max-w-md mx-auto">
          Plataforma de alta costura digital para la planificación, logística y control de accesos exclusivos.
        </p>
      </div>

      {/* View 1: Main Menu Cards */}
      {activeForm === "menu" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full z-10">
          {/* Card 1: Admin */}
          <div className="glass-gold rounded-2xl p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:border-gold/50 group hover:shadow-[0_10px_30px_rgba(212,175,55,0.15)]">
            <div>
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-6 border border-gold/20 group-hover:bg-gold/20 transition-all duration-500">
                <Shield className="text-gold h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors duration-300">
                Administrador
              </h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed mb-8">
                Control y cotización de eventos, gestión financiera global, asignación de personal y logística del salón.
              </p>
            </div>
            <button
              onClick={() => openAuthForm("admin")}
              className="w-full py-3 rounded-lg border border-gold/30 text-gold text-xs font-semibold uppercase tracking-wider hover:bg-gold hover:text-obsidian transition-all duration-300 active:scale-[0.98]"
            >
              Cuentas de Control
            </button>
          </div>

          {/* Card 2: Anfitrión / Cliente */}
          <div className="glass-gold rounded-2xl p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:border-gold/50 group hover:shadow-[0_10px_30px_rgba(212,175,55,0.15)] relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-gold/10 blur-xl pointer-events-none group-hover:bg-gold/20 transition-all duration-500" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-6 border border-gold/20 group-hover:bg-gold/20 transition-all duration-500">
                <User className="text-gold h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors duration-300">
                Anfitrión / Cliente
              </h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed mb-8">
                Portal de auto-gestión para distribuir invitados, diseñar planos de mesas interactivos en 2D y ver estados de cuenta.
              </p>
            </div>
            <button
              onClick={() => {
                setError("");
                setHostCode("");
                setActiveForm("host-code");
              }}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-gold to-gold-hover text-obsidian text-xs font-bold uppercase tracking-wider hover:shadow-[0_5px_15px_rgba(212,175,55,0.4)] transition-all duration-300 active:scale-[0.98]"
            >
              Código de Anfitrión
            </button>
          </div>

          {/* Card 3: Staff de Recepción */}
          <div className="glass-gold rounded-2xl p-8 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:border-gold/50 group hover:shadow-[0_10px_30px_rgba(212,175,55,0.15)]">
            <div>
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-6 border border-gold/20 group-hover:bg-gold/20 transition-all duration-500">
                <QrCode className="text-gold h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gold transition-colors duration-300">
                Staff de Recepción
              </h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed mb-8">
                Escáner QR ultra rápido en tiempo real para control de accesos e invitados en la recepción del salón.
              </p>
            </div>
            <button
              onClick={() => openAuthForm("staff")}
              className="w-full py-3 rounded-lg border border-gold/30 text-gold text-xs font-semibold uppercase tracking-wider hover:bg-gold hover:text-obsidian transition-all duration-300 active:scale-[0.98]"
            >
              Escanear Pases
            </button>
          </div>
        </div>
      )}

      {/* View 2: Host Code Entry Form */}
      {activeForm === "host-code" && (
        <div className="glass-gold rounded-2xl p-8 max-w-md w-full z-10 animate-fade-in border border-gold/30">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4 border border-gold/20">
              <KeyRound className="text-gold h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Ingresar Código</h3>
            <p className="text-gray-400 text-xs font-light mb-6">
              Digita tu clave de evento único asignado para acceder a tu panel de mesas.
            </p>
          </div>

          <form onSubmit={handleHostSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={hostCode}
                onChange={(e) => {
                  setHostCode(e.target.value.toUpperCase());
                  setError("");
                }}
                placeholder="Ej: SVIP-2026"
                className="w-full px-4 py-3 rounded-lg bg-obsidian border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all duration-300 text-center tracking-widest uppercase font-semibold text-sm"
              />
              {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setActiveForm("menu")}
                className="w-1/2 py-3 rounded-lg border border-gray-700 text-gray-400 text-xs font-semibold uppercase hover:bg-white/5 transition-colors duration-300"
              >
                Volver
              </button>
              <button
                type="submit"
                className="w-1/2 py-3 rounded-lg bg-gold hover:bg-gold-hover text-obsidian text-xs font-bold uppercase tracking-wider transition-all duration-300"
              >
                Acceder
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <span className="text-[10px] text-gray-500">Demo Code: SVIP-2026</span>
          </div>
        </div>
      )}

      {/* View 3: Strict Auth Form (Email & Password) */}
      {activeForm === "auth-fields" && (
        <div className="glass-gold rounded-2xl p-8 max-w-md w-full z-10 animate-fade-in border border-gold/30">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4 border border-gold/20">
              {authRole === "admin" ? (
                <Shield className="text-gold h-5 w-5" />
              ) : (
                <QrCode className="text-gold h-5 w-5" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Autenticación: {authRole === "admin" ? "Administrador" : "Recepción"}
            </h3>
            <p className="text-gray-400 text-xs font-light mb-6">
              Ingresa tus credenciales registradas en la consola de Firebase.
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg flex items-start gap-2 text-left">
                <AlertCircle className="text-red-500 h-4 w-4 shrink-0 mt-0.5" />
                <span className="text-red-200 text-xs font-light">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-obsidian border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all duration-300 text-xs"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-obsidian border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-all duration-300 text-xs"
              />
            </div>

            {/* Submit & Back buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-gold to-gold-hover text-obsidian text-xs font-bold uppercase tracking-wider hover:shadow-[0_5px_15px_rgba(212,175,55,0.3)] transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-obsidian border-t-transparent rounded-full animate-spin" />
                    <span>Iniciando Sesión...</span>
                  </>
                ) : (
                  <span>Iniciar Sesión</span>
                )}
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveForm("menu")}
                  className="w-1/2 py-2.5 rounded-lg border border-gray-700 text-gray-400 text-xs font-semibold uppercase hover:bg-white/5 transition-all duration-300"
                >
                  Volver
                </button>
                
                {/* Bypass Demo Button */}
                <button
                  type="button"
                  onClick={() => loginDemo(authRole)}
                  className="w-1/2 py-2.5 rounded-lg border border-gold/20 text-gold text-xs font-semibold uppercase hover:bg-gold/5 transition-all duration-300"
                >
                  Entrar como Demo
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Footer copyright */}
      <div className="mt-20 text-[10px] text-gray-600 tracking-[0.2em] uppercase z-10">
        © 2026 SocialesVIP. Todos los derechos reservados.
      </div>
    </div>
  );
}
