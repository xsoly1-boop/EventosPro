"use client";
// TEMA 3 — Neon Glow: fondo oscuro con estrellas, tarjetas con borde dorado pulsante e iconos centrados grandes

import React from "react";
import { Shield, User, QrCode, Sparkles, KeyRound, Mail, Lock, AlertCircle, ArrowRight, ChevronRight } from "lucide-react";
import { ThemeProps, ACCESS_ROWS } from "./types";

const ICONS = { admin: Shield, client: User, staff: QrCode };

const NeonBg = () => (
  <>
    {/* Deep black base */}
    <div className="absolute inset-0 bg-[#020202]" />
    {/* Star particles via CSS */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white"
          style={{
            width: Math.random() < 0.3 ? 2 : 1,
            height: Math.random() < 0.3 ? 2 : 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.1,
            animation: `pulse ${2 + Math.random() * 4}s ease ${Math.random() * 3}s infinite alternate`,
          }} />
      ))}
    </div>
    {/* Gold radial glow center */}
    <div className="absolute inset-0 pointer-events-none"
      style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(212,175,55,0.07) 0%, transparent 60%)" }} />
    {/* Light streak */}
    <div className="absolute top-1/3 left-0 right-0 h-px pointer-events-none"
      style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)" }} />
  </>
);

interface NeonFormProps {
  children: React.ReactNode;
  title: string;
  eyebrow: string;
  icon: React.ElementType;
  setActiveForm: (f: "menu" | "host-code" | "auth-fields") => void;
}

const NeonForm = ({ children, title, eyebrow, icon: Icon, setActiveForm }: NeonFormProps) => (
  <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
    <NeonBg />
    <div className="relative z-10 w-full max-w-md">
      <button onClick={() => setActiveForm("menu")} className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gold uppercase tracking-widest font-semibold mb-8 transition-colors">
        <ChevronRight className="h-3 w-3 rotate-180" /> Volver
      </button>
      <div className="rounded-2xl p-8 relative overflow-hidden"
        style={{ background: "rgba(8,8,8,0.9)", border: "1px solid rgba(212,175,55,0.4)", boxShadow: "0 0 40px rgba(212,175,55,0.15), inset 0 0 40px rgba(212,175,55,0.02)" }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)", filter: "blur(20px)", marginTop: "-12px" }} />
        <div className="flex flex-col items-center text-center mb-6 relative z-10">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 relative"
            style={{ background: "radial-gradient(circle,rgba(212,175,55,0.15) 0%,rgba(212,175,55,0.03) 70%)", border: "1px solid rgba(212,175,55,0.4)", boxShadow: "0 0 25px rgba(212,175,55,0.2)" }}>
            <Icon className="text-gold h-7 w-7" />
          </div>
          <span className="text-[9px] text-gold/60 tracking-[0.25em] uppercase font-semibold mb-1">{eyebrow}</span>
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  </div>
);

export default function ThemeThree({ activeForm, setActiveForm, authRole, hostCode, setHostCode, email, setEmail, password, setPassword, loading, error, setError, mounted, handleHostSubmit, handleAuthSubmit, handleRowAction, loginDemo }: ThemeProps) {

  /* ── MENU ─────────────────────────────────────────── */
  if (activeForm === "menu") return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      <NeonBg />

      {/* Header */}
      <div className="relative z-10 text-center mb-14"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(-16px)", transition: "all 0.7s ease" }}>
        <div className="flex items-center justify-center gap-2.5 mb-5">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", boxShadow: "0 0 20px rgba(212,175,55,0.3), inset 0 0 20px rgba(212,175,55,0.05)" }}>
              <Sparkles className="h-5 w-5 text-gold" />
            </div>
            <div className="absolute inset-0 rounded-xl animate-ping" style={{ border: "1px solid rgba(212,175,55,0.2)", opacity: 0.4 }} />
          </div>
          <span className="text-xs font-semibold tracking-[0.35em] text-gold/80 uppercase">SocialesVIP</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-light text-white mb-2">
          Acceso al{" "}
          <span className="font-bold" style={{ background: "linear-gradient(90deg,#D4AF37,#FDE68A 50%,#D4AF37)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Sistema
          </span>
        </h1>
        <p className="text-gray-500 text-sm font-light">Selecciona tu portal de acceso</p>
      </div>

      {/* Neon cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {ACCESS_ROWS.map((row, i) => {
          const Icon = ICONS[row.id as keyof typeof ICONS];
          return (
            <button key={row.id} onClick={() => handleRowAction(row.action)}
              className="group relative rounded-2xl p-8 text-center cursor-pointer flex flex-col items-center gap-5 transition-all duration-400 hover:-translate-y-2"
              style={{
                background: "rgba(10,10,10,0.8)",
                border: row.featured ? "1px solid rgba(212,175,55,0.6)" : "1px solid rgba(212,175,55,0.2)",
                boxShadow: row.featured
                  ? "0 0 30px rgba(212,175,55,0.25), inset 0 0 30px rgba(212,175,55,0.03)"
                  : "0 0 0px rgba(212,175,55,0)",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(30px)",
                transition: `opacity 0.6s ease ${0.1 + i * 0.15}s, transform 0.6s ease ${0.1 + i * 0.15}s, box-shadow 0.4s ease, border-color 0.4s ease`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 50px rgba(212,175,55,0.4), inset 0 0 30px rgba(212,175,55,0.05)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,175,55,0.7)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = row.featured ? "0 0 30px rgba(212,175,55,0.25), inset 0 0 30px rgba(212,175,55,0.03)" : "0 0 0px rgba(212,175,55,0)";
                (e.currentTarget as HTMLElement).style.borderColor = row.featured ? "rgba(212,175,55,0.6)" : "rgba(212,175,55,0.2)";
              }}
            >
              {/* Radial glow behind icon */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)", filter: "blur(20px)", marginTop: "-20px" }} />

              {/* Icon with animated ring */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full flex items-center justify-center relative"
                  style={{
                    background: "radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.03) 70%)",
                    border: "1px solid rgba(212,175,55,0.4)",
                    boxShadow: "0 0 25px rgba(212,175,55,0.2)",
                  }}>
                  <Icon className="h-8 w-8 text-gold" />
                </div>
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 rounded-full" style={{ border: "1px solid rgba(212,175,55,0.2)", animation: "ping 2s cubic-bezier(0,0,0.2,1) infinite", transform: "scale(1.25)", opacity: 0.5 }} />
                {row.featured && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold flex items-center justify-center text-obsidian text-[7px] font-bold">★</div>
                )}
              </div>

              {/* Text */}
              <div className="space-y-2">
                <span className="text-[9px] text-gold/50 font-semibold tracking-[0.2em] uppercase block">{row.eyebrow}</span>
                <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors duration-300">{row.title}</h3>
                <p className="text-gray-500 text-xs font-light leading-relaxed">{row.desc}</p>
              </div>

              {/* CTA */}
              <div className={`w-full py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                row.featured
                  ? "bg-gold text-obsidian shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:shadow-[0_0_30px_rgba(212,175,55,0.6)]"
                  : "border border-gold/30 text-gold group-hover:border-gold/60 group-hover:bg-gold/10"
              }`}>
                <span>{row.buttonLabel}</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="relative z-10 mt-12 text-[10px] text-gray-700 tracking-[0.2em] uppercase">
        © 2026 SocialesVIP · Plataforma segura SSL
      </div>
    </div>
  );

  if (activeForm === "host-code") return (
    <NeonForm title="Ingresar Código" eyebrow="Portal Anfitrión" icon={KeyRound} setActiveForm={setActiveForm}>
      <form onSubmit={handleHostSubmit} className="space-y-4">
        <input type="text" value={hostCode} onChange={(e) => { setHostCode(e.target.value.toUpperCase()); setError(""); }} placeholder="SVIP-XXXX" autoFocus
          className="w-full px-5 py-4 rounded-xl text-white placeholder-gray-600 focus:outline-none text-center tracking-[0.3em] uppercase font-semibold text-sm transition-all"
          style={{ background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.2)" }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(212,175,55,0.6)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(212,175,55,0.2)")} />
        {error && <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/30 border border-red-500/20 rounded-xl px-4 py-3"><AlertCircle className="h-3.5 w-3.5 shrink-0" /><span>{error}</span></div>}
        <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gold text-obsidian text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ boxShadow: "0 0 20px rgba(212,175,55,0.4)" }}>
          {loading ? <><div className="w-3.5 h-3.5 border-2 border-obsidian border-t-transparent rounded-full animate-spin" /><span>Verificando...</span></> : <><span>Acceder</span><ArrowRight className="h-3.5 w-3.5" /></>}
        </button>
      </form>
    </NeonForm>
  );

  return (
    <NeonForm title="Iniciar Sesión" eyebrow="Acceso Administrativo" icon={Shield} setActiveForm={setActiveForm}>
      <form onSubmit={handleAuthSubmit} className="space-y-3">
        {error && <div className="flex items-start gap-2 text-red-400 text-xs bg-red-950/30 border border-red-500/20 rounded-xl px-4 py-3"><AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" /><span>{error}</span></div>}
        {[{ icon: Mail, type: "email", val: email, set: setEmail, ph: "correo@ejemplo.com" }, { icon: Lock, type: "password", val: password, set: setPassword, ph: "••••••••" }].map(({ icon: FieldIcon, type, val, set, ph }, fi) => (
          <div key={type} className="relative">
            <FieldIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input type={type} required value={val} onChange={(e) => set(e.target.value)} placeholder={ph} autoFocus={fi === 0}
              className="w-full pl-11 pr-4 py-3.5 rounded-xl text-white placeholder-gray-600 focus:outline-none text-xs transition-all"
              style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.15)" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(212,175,55,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(212,175,55,0.15)")} />
          </div>
        ))}
        <div className="pt-1">
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gold text-obsidian text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ boxShadow: "0 0 20px rgba(212,175,55,0.4)" }}>
            {loading ? <><div className="w-3.5 h-3.5 border-2 border-obsidian border-t-transparent rounded-full animate-spin" /><span>Iniciando...</span></> : <><span>Iniciar Sesión</span><ArrowRight className="h-3.5 w-3.5" /></>}
          </button>
        </div>
      </form>
    </NeonForm>
  );
}
