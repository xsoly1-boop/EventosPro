"use client";
// TEMA 1 — Tall Cards con imagen de fondo + panel frosted inferior

import React from "react";
import { Shield, User, QrCode, Sparkles, KeyRound, Mail, Lock, AlertCircle, ArrowRight, Star, ChevronRight } from "lucide-react";
import { ThemeProps, ACCESS_ROWS } from "./types";

const ICONS = { admin: Shield, client: User, staff: QrCode };

export default function ThemeOne({ activeForm, setActiveForm, authRole, hostCode, setHostCode, email, setEmail, password, setPassword, loading, error, setError, mounted, handleHostSubmit, handleAuthSubmit, handleRowAction, loginDemo, logoUrl }: ThemeProps) {

  /* ── MENU ─────────────────────────────────────────── */
  if (activeForm === "menu") return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #1a1408 0%, #050505 60%)" }}>
      {/* Background base */}
      <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: "url('/login-bg.jpg')" }} />
      <div className="absolute inset-0 bg-black/20" />

      {/* Custom Styles for loading borders */}
      <style>{`
        @keyframes borderShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .theme-card-border {
          background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(212,175,55,0.3), rgba(255,255,255,0.06));
          background-size: 200% 200%;
          animation: borderShimmer 3s linear infinite;
        }
        .theme-card-border:hover {
          background: linear-gradient(90deg, rgba(212,175,55,0.3), rgba(251,191,36,0.9), rgba(212,175,55,0.3));
          background-size: 200% 200%;
          animation: borderShimmer 1.8s linear infinite;
        }
        .theme-card-border-featured {
          background: linear-gradient(90deg, rgba(212,175,55,0.3), rgba(251,191,36,0.8), rgba(212,175,55,0.3));
          background-size: 200% 200%;
          animation: borderShimmer 2.2s linear infinite;
        }
        .theme-card-border-featured:hover {
          background: linear-gradient(90deg, rgba(251,191,36,0.6), rgba(255,255,255,1), rgba(251,191,36,0.6));
          background-size: 200% 200%;
          animation: borderShimmer 1.2s linear infinite;
        }
      `}</style>

      {/* Header */}
      <div className="relative z-10 text-center mb-10"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-16px)", transition: "all 0.7s ease" }}>
        <div className="flex items-center justify-center gap-2.5 mb-4 min-h-[48px]">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="max-h-14 object-contain filter drop-shadow-[0_2px_10px_rgba(212,175,55,0.25)]" />
          ) : (
            <>
              <div className="w-9 h-9 rounded-lg bg-gold/15 border border-gold/25 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.25)]">
                <Sparkles className="h-4 w-4 text-gold" />
              </div>
              <span className="text-xs font-semibold tracking-[0.3em] text-gold/80 uppercase">SocialesVIP</span>
            </>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-light text-white mb-3">
          Gestión Premium de{" "}
          <span className="font-semibold" style={{ background: "linear-gradient(90deg,#D4AF37,#FDE68A,#D4AF37)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Eventos Sociales
          </span>
        </h1>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="h-px w-10 bg-gold/40" />
          <Star className="h-2.5 w-2.5 text-gold/50 fill-gold/20" />
          <div className="h-px w-10 bg-gold/40" />
        </div>
      </div>

      {/* Cards grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl">
        {ACCESS_ROWS.map((row, i) => {
          const Icon = ICONS[row.id as keyof typeof ICONS];
          return (
            <button key={row.id} onClick={() => handleRowAction(row.action)}
              className="group relative rounded-[28px] overflow-hidden text-left cursor-pointer h-[440px] flex flex-col justify-end p-[3px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(30px)",
                transition: `opacity 0.6s ease ${0.1 + i * 0.15}s, transform 0.6s ease ${0.1 + i * 0.15}s, scale 0.2s ease`,
              }}>
              {/* Shimmer glowing gold border wrapper */}
              <div className={`absolute inset-0 rounded-[28px] transition-all duration-500 ${row.featured ? 'theme-card-border-featured' : 'theme-card-border'}`} />

              {/* Card inner body */}
              <div className="relative w-full h-full rounded-[25px] overflow-hidden bg-black flex flex-col justify-between p-4">
                {/* Upper Section: Image */}
                <div className="absolute inset-0 z-0">
                  <div className="w-full h-full bg-cover bg-center transition-transform duration-750 group-hover:scale-105"
                    style={{ backgroundImage: `url('${row.bg}')` }} />
                  {/* Subtle dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60 transition-all duration-500 group-hover:via-black/50" />
                </div>

                {/* Empty spacer to push content to bottom half */}
                <div className="h-[40%]" />

                {/* Floating Glassmorphic Bottom Panel */}
                <div className="relative z-10 w-full rounded-2xl border border-white/20 bg-black/60 backdrop-blur-xl p-5 text-center flex flex-col items-center justify-between gap-4 shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
                  {/* Icon & Title */}
                  <div className="space-y-1.5 flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border mb-1 transition-all duration-400 ${row.featured ? "bg-gold/20 border-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.3)]" : "bg-white/10 border-white/20 group-hover:bg-gold/15 group-hover:border-gold/30"}`}>
                      <Icon className={`h-4 w-4 ${row.featured ? "text-gold" : "text-white group-hover:text-gold"} transition-colors duration-300`} />
                    </div>
                    <span className="text-[8px] text-gold font-bold tracking-[0.25em] uppercase block">
                      {row.eyebrow}
                    </span>
                    <h3 className="text-sm font-bold text-white tracking-wider uppercase group-hover:text-gold transition-colors duration-300">
                      {row.title}
                    </h3>
                  </div>

                  {/* Action Gold Button */}
                  <div className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-gold to-amber-500 text-obsidian text-[10px] font-bold uppercase tracking-widest shadow-[0_4px_15px_rgba(212,175,55,0.3)] transition-all group-hover:shadow-[0_4px_25px_rgba(212,175,55,0.6)] flex items-center justify-center gap-2 active:scale-[0.97]">
                    <span>{row.buttonLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="relative z-10 mt-8 text-[10px] text-gray-600 tracking-[0.2em] uppercase">
        © 2026 SocialesVIP · Todos los derechos reservados
      </div>
    </div>
  );

  /* ── HOST CODE FORM ───────────────────────────────── */
  if (activeForm === "host-code") return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #1a1408 0%, #050505 70%)" }}>
      <div className="absolute inset-0 bg-cover bg-center opacity-85" style={{ backgroundImage: "url('/login-bg.jpg')" }} />
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 w-full max-w-md">
        <button onClick={() => setActiveForm("menu")} className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gold uppercase tracking-widest font-semibold mb-8 transition-colors">
          <ChevronRight className="h-3 w-3 rotate-180" /> Volver
        </button>
        <div className="rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg,rgba(212,175,55,0.35),rgba(212,175,55,0.05) 50%,rgba(212,175,55,0.25))" }}>
          <div className="rounded-2xl p-8 bg-black/80 backdrop-blur-md space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4"><KeyRound className="text-gold h-6 w-6" /></div>
              <p className="text-[10px] text-gold/60 tracking-[0.25em] uppercase font-semibold mb-1">Portal Anfitrión</p>
              <h2 className="text-xl font-semibold text-white">Ingresar Código</h2>
              <p className="text-gray-500 text-xs font-light mt-2">Introduce la clave de evento asignada por el organizador.</p>
            </div>
            <form onSubmit={handleHostSubmit} className="space-y-4">
              <input type="text" value={hostCode} onChange={(e) => { setHostCode(e.target.value.toUpperCase()); setError(""); }} placeholder="SVIP-XXXX" autoFocus
                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-gold/40 text-center tracking-[0.3em] uppercase font-semibold text-sm transition-all" />
              {error && <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/30 border border-red-500/20 rounded-xl px-4 py-3"><AlertCircle className="h-3.5 w-3.5 shrink-0" /><span>{error}</span></div>}
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-amber-400 text-obsidian text-xs font-bold uppercase tracking-wider transition-all shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.5)] disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><div className="w-3.5 h-3.5 border-2 border-obsidian border-t-transparent rounded-full animate-spin" /><span>Verificando...</span></> : <><span>Acceder</span><ArrowRight className="h-3.5 w-3.5" /></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── AUTH FORM ────────────────────────────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #1a1408 0%, #050505 70%)" }}>
      <div className="absolute inset-0 bg-cover bg-center opacity-85" style={{ backgroundImage: "url('/login-bg.jpg')" }} />
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 w-full max-w-md">
        <button onClick={() => setActiveForm("menu")} className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gold uppercase tracking-widest font-semibold mb-8 transition-colors">
          <ChevronRight className="h-3 w-3 rotate-180" /> Volver
        </button>
        <div className="rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg,rgba(212,175,55,0.35),rgba(212,175,55,0.05) 50%,rgba(212,175,55,0.25))" }}>
          <div className="rounded-2xl p-8 bg-black/80 backdrop-blur-md space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4"><Shield className="text-gold h-6 w-6" /></div>
              <p className="text-[10px] text-gold/60 tracking-[0.25em] uppercase font-semibold mb-1">Acceso Administrativo</p>
              <h2 className="text-xl font-semibold text-white">Iniciar Sesión</h2>
              <p className="text-gray-500 text-xs font-light mt-2">Ingresa tus credenciales para acceder al sistema.</p>
            </div>
            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {error && <div className="flex items-start gap-2 text-red-400 text-xs bg-red-950/30 border border-red-500/20 rounded-xl px-4 py-3"><AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" /><span>{error}</span></div>}
              <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" autoFocus className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-gold/40 text-xs transition-all" /></div>
              <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" /><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-gold/40 text-xs transition-all" /></div>
              <div className="pt-1">
                <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-amber-400 text-obsidian text-xs font-bold uppercase tracking-wider shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <><div className="w-3.5 h-3.5 border-2 border-obsidian border-t-transparent rounded-full animate-spin" /><span>Iniciando...</span></> : <><span>Iniciar Sesión</span><ArrowRight className="h-3.5 w-3.5" /></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
