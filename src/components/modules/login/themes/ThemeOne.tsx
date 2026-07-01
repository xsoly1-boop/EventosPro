"use client";
// TEMA 1 — Tall Cards con imagen de fondo + panel frosted inferior

import React from "react";
import { Shield, User, QrCode, Sparkles, KeyRound, Mail, Lock, AlertCircle, ArrowRight, Star, ChevronRight } from "lucide-react";
import { ThemeProps, ACCESS_ROWS } from "./types";

const ICONS = { admin: Shield, client: User, staff: QrCode };

export default function ThemeOne({ activeForm, setActiveForm, authRole, hostCode, setHostCode, email, setEmail, password, setPassword, loading, error, setError, mounted, handleHostSubmit, handleAuthSubmit, handleRowAction, loginDemo }: ThemeProps) {

  /* ── MENU ─────────────────────────────────────────── */
  if (activeForm === "menu") return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #1a1408 0%, #050505 60%)" }}>
      {/* Background base */}
      <div className="absolute inset-0 bg-cover bg-center opacity-35" style={{ backgroundImage: "url('/login-bg.jpg')" }} />
      <div className="absolute inset-0 bg-black/70" />

      {/* Header */}
      <div className="relative z-10 text-center mb-10"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-16px)", transition: "all 0.7s ease" }}>
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-gold/15 border border-gold/25 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.25)]">
            <Sparkles className="h-4 w-4 text-gold" />
          </div>
          <span className="text-xs font-semibold tracking-[0.3em] text-gold/80 uppercase">SocialesVIP</span>
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
              className="group relative rounded-2xl overflow-hidden text-left cursor-pointer h-[360px] flex flex-col justify-end"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(30px)",
                transition: `opacity 0.6s ease ${0.1 + i * 0.15}s, transform 0.6s ease ${0.1 + i * 0.15}s`,
              }}>
              {/* Full-bleed background image */}
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${row.bg}')` }} />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20 group-hover:from-black/95 transition-all duration-500" />
              {/* Gold border on hover */}
              <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-gold/50 transition-colors duration-500" />
              {/* Featured ring */}
              {row.featured && <div className="absolute inset-0 rounded-2xl ring-2 ring-gold/30 group-hover:ring-gold/60 transition-all duration-500" />}

              {/* Content panel */}
              <div className="relative z-10 p-6 space-y-3 backdrop-blur-[2px]">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-400 ${row.featured ? "bg-gold/20 border-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.3)]" : "bg-white/10 border-white/20 group-hover:bg-gold/15 group-hover:border-gold/30"}`}>
                  <Icon className={`h-4 w-4 ${row.featured ? "text-gold" : "text-white group-hover:text-gold"} transition-colors duration-300`} />
                </div>
                <div>
                  <span className="text-[9px] text-gold/60 font-semibold tracking-[0.2em] uppercase block mb-0.5">{row.eyebrow}</span>
                  <h3 className="text-lg font-semibold text-white group-hover:text-gold transition-colors duration-300">{row.title}</h3>
                  <p className="text-gray-400 text-xs font-light mt-1 leading-relaxed">{row.desc}</p>
                </div>
                <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  row.featured
                    ? "bg-gold text-obsidian shadow-[0_2px_15px_rgba(212,175,55,0.4)] group-hover:shadow-[0_4px_25px_rgba(212,175,55,0.6)]"
                    : "border border-white/20 text-white group-hover:border-gold/50 group-hover:bg-gold/10 group-hover:text-gold"
                }`}>
                  <span>{row.buttonLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
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
      <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('/login-bg.jpg')" }} />
      <div className="absolute inset-0 bg-black/75" />
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
      <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('/login-bg.jpg')" }} />
      <div className="absolute inset-0 bg-black/75" />
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
              <div className="pt-1 space-y-2">
                <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-amber-400 text-obsidian text-xs font-bold uppercase tracking-wider shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <><div className="w-3.5 h-3.5 border-2 border-obsidian border-t-transparent rounded-full animate-spin" /><span>Iniciando...</span></> : <><span>Iniciar Sesión</span><ArrowRight className="h-3.5 w-3.5" /></>}
                </button>
                <button type="button" onClick={() => loginDemo(authRole)} className="w-full py-3 rounded-xl border border-white/10 text-gray-400 text-xs font-semibold uppercase hover:bg-white/5 hover:border-gold/20 hover:text-gold transition-all">Entrar Demo</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
