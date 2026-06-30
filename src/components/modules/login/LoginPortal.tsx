"use client";

import React, { useState, useEffect } from "react";
import {
  Shield, User, QrCode, Sparkles, KeyRound,
  Mail, Lock, AlertCircle, ArrowRight, Star, ChevronRight
} from "lucide-react";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

/* ── Access row definitions ─────────────────────────────── */
const ACCESS_ROWS = [
  {
    id: "admin",
    icon: Shield,
    eyebrow: "Acceso Seguro",
    title: "Administrador",
    desc: "Control financiero global, cotizaciones, gestión de personal y logística del salón.",
    action: "admin" as const,
    buttonLabel: "Cuentas de Control",
    featured: false,
  },
  {
    id: "client",
    icon: User,
    eyebrow: "Portal Exclusivo",
    title: "Anfitrión / Cliente",
    desc: "Auto-gestión de invitados, plano de mesas interactivo, estado de cuenta y abonos.",
    action: "host-code" as const,
    buttonLabel: "Código de Anfitrión",
    featured: true,
  },
  {
    id: "staff",
    icon: QrCode,
    eyebrow: "Acceso Directo",
    title: "Staff de Recepción",
    desc: "Escáner QR en tiempo real para control de accesos e invitados en recepción.",
    action: "scanner" as const,
    buttonLabel: "Escanear Pases",
    featured: false,
  },
];

export default function LoginPortal() {
  const { login, loginDemo } = useAuth();

  const [activeForm, setActiveForm] = useState<"menu" | "host-code" | "auth-fields">("menu");
  const [authRole, setAuthRole] = useState<UserRole>(null);
  const [hostCode, setHostCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleHostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = hostCode.trim();
    if (!code) return;
    setError(""); setLoading(true);
    if (code === "SVIP-2026") {
      localStorage.setItem("svip_client_event_id", "event-123");
      loginDemo("client"); setLoading(false); return;
    }
    if (db) {
      try {
        const snap = await getDoc(doc(db, "events", code));
        if (snap.exists()) { localStorage.setItem("svip_client_event_id", code); loginDemo("client"); setLoading(false); return; }
        const snap2 = await getDoc(doc(db, "events", code.toLowerCase()));
        if (snap2.exists()) { localStorage.setItem("svip_client_event_id", code.toLowerCase()); loginDemo("client"); setLoading(false); return; }
      } catch {}
    }
    setError("Código inválido o no registrado. Verifica tu clave de evento.");
    setLoading(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      if (["auth/invalid-credential","auth/user-not-found","auth/wrong-password"].includes(err.code)) {
        setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
      } else {
        setError("Error de autenticación: " + (err.message || "Inténtalo de nuevo."));
      }
    } finally { setLoading(false); }
  };

  const handleRowAction = (action: typeof ACCESS_ROWS[0]["action"]) => {
    if (action === "admin") { setAuthRole("admin"); setEmail(""); setPassword(""); setError(""); setActiveForm("auth-fields"); }
    else if (action === "host-code") { setError(""); setHostCode(""); setActiveForm("host-code"); }
    else { window.location.href = "/scanner"; }
  };

  /* ── LEFT PANEL (shared across all views) ───────────────── */
  const LeftPanel = () => (
    <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden">
      {/* Hero image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-panel.jpg')" }}
      />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 60%, rgba(10,10,10,0.95))" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 40% 50%, rgba(212,175,55,0.08) 0%, transparent 65%)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-48" style={{ background: "linear-gradient(to top, rgba(10,10,10,0.9), transparent)" }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gold/15 border border-gold/25 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.25)]">
            <Sparkles className="h-4 w-4 text-gold" />
          </div>
          <span className="text-xs font-semibold tracking-[0.3em] text-gold/80 uppercase">SocialesVIP</span>
        </div>

        {/* Center branding */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-gold/50" />
            <span className="text-[10px] text-gold/60 tracking-[0.25em] uppercase font-semibold">Gestión Premium</span>
          </div>
          <h1 className="text-4xl font-light text-white leading-tight">
            Eventos Sociales<br />
            <span className="font-semibold" style={{
              background: "linear-gradient(90deg, #D4AF37, #FDE68A, #D4AF37)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>de Alta Distinción</span>
          </h1>
          <p className="text-gray-400 text-sm font-light leading-relaxed max-w-xs">
            Plataforma integral para la planificación, logística y control de accesos de eventos exclusivos.
          </p>

          {/* Stats row */}
          <div className="flex gap-6 pt-2">
            {[["500+","Eventos"], ["98%","Satisfacción"], ["24/7","Soporte"]].map(([val, label]) => (
              <div key={label}>
                <div className="text-gold font-bold text-lg font-mono">{val}</div>
                <div className="text-gray-500 text-[10px] uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 text-[10px] text-gray-600 tracking-widest uppercase">
          <Star className="h-2.5 w-2.5 text-gold/40 fill-gold/20" />
          <span>© 2026 SocialesVIP · Todos los derechos reservados</span>
        </div>
      </div>
    </div>
  );

  /* ── RIGHT PANEL wrapper ─────────────────────────────────── */
  const RightPanel = ({ children }: { children: React.ReactNode }) => (
    <div className="relative flex lg:w-1/2 w-full min-h-screen flex-col justify-center px-8 md:px-14 py-12"
      style={{ background: "linear-gradient(160deg, #0e0e0e 0%, #080808 100%)" }}>
      {/* Subtle top-left glow */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)", filter: "blur(40px)" }} />
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(212,175,55,1) 1px, transparent 1px), linear-gradient(90deg,rgba(212,175,55,1) 1px,transparent 1px)",
          backgroundSize: "48px 48px"
        }} />
      <div className="relative z-10 w-full max-w-md mx-auto">
        {children}
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════
     VIEW 1 — Main menu
  ══════════════════════════════════════════════════════════ */
  if (activeForm === "menu") return (
    <div className="flex min-h-screen bg-obsidian">
      <LeftPanel />
      <RightPanel>
        {/* Header */}
        <div className="mb-10" style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "all 0.6s ease" }}>
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/25 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-gold" />
            </div>
            <span className="text-xs font-semibold tracking-[0.3em] text-gold/80 uppercase">SocialesVIP</span>
          </div>
          <p className="text-[10px] text-gold/60 tracking-[0.25em] uppercase font-semibold mb-2">Bienvenido</p>
          <h2 className="text-2xl font-semibold text-white">Selecciona tu acceso</h2>
          <p className="text-gray-500 text-xs font-light mt-1.5">Elige el portal que corresponde a tu rol para continuar.</p>
        </div>

        {/* Access rows */}
        <div className="space-y-3">
          {ACCESS_ROWS.map((row, i) => {
            const Icon = row.icon;
            return (
              <button
                key={row.id}
                onClick={() => handleRowAction(row.action)}
                className="group w-full text-left relative rounded-2xl p-[1px] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: row.featured
                    ? "linear-gradient(135deg, rgba(212,175,55,0.5), rgba(212,175,55,0.1) 50%, rgba(212,175,55,0.4))"
                    : "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.06))",
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateX(0)" : "translateX(20px)",
                  transition: `opacity 0.5s ease ${0.15 + i * 0.1}s, transform 0.5s ease ${0.15 + i * 0.1}s, scale 0.2s ease`,
                }}
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                  style={{ boxShadow: row.featured ? "0 0 30px rgba(212,175,55,0.2)" : "0 0 20px rgba(255,255,255,0.04)" }} />

                <div className={`flex items-center gap-4 rounded-2xl px-5 py-4 transition-colors duration-300 ${
                  row.featured
                    ? "bg-gradient-to-r from-gold/[0.12] to-amber-400/[0.06] group-hover:from-gold/[0.18] group-hover:to-amber-400/[0.1]"
                    : "bg-white/[0.03] group-hover:bg-white/[0.06]"
                }`}>
                  {/* Icon */}
                  <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    row.featured
                      ? "bg-gold/20 border border-gold/30 group-hover:bg-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                      : "bg-white/5 border border-white/10 group-hover:border-gold/20 group-hover:bg-gold/10"
                  }`}>
                    <Icon className={`h-4.5 w-4.5 transition-colors duration-300 ${row.featured ? "text-gold" : "text-gray-400 group-hover:text-gold"}`} style={{ width: "1.1rem", height: "1.1rem" }} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[9px] font-semibold tracking-[0.2em] uppercase ${row.featured ? "text-gold/70" : "text-gray-500"}`}>
                        {row.eyebrow}
                      </span>
                      {row.featured && (
                        <span className="text-[8px] font-bold uppercase tracking-widest text-obsidian bg-gold px-1.5 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-semibold transition-colors duration-300 ${row.featured ? "text-white" : "text-gray-200 group-hover:text-white"}`}>
                      {row.title}
                    </p>
                    <p className="text-gray-500 text-[11px] font-light mt-0.5 leading-relaxed line-clamp-1">
                      {row.desc}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    row.featured
                      ? "bg-gold text-obsidian shadow-[0_2px_12px_rgba(212,175,55,0.4)] group-hover:shadow-[0_4px_20px_rgba(212,175,55,0.6)] group-hover:scale-110"
                      : "bg-white/5 text-gray-400 group-hover:bg-gold group-hover:text-obsidian group-hover:scale-110"
                  }`}>
                    <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Divider + footer */}
        <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] text-gray-600 font-light">Plataforma segura · SSL</span>
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-1 h-1 rounded-full bg-gold/30" style={{ animation: `pulse 2s ease ${i*0.3}s infinite` }} />
            ))}
          </div>
        </div>
      </RightPanel>
    </div>
  );

  /* ══════════════════════════════════════════════════════════
     VIEW 2 — Host Code form
  ══════════════════════════════════════════════════════════ */
  if (activeForm === "host-code") return (
    <div className="flex min-h-screen bg-obsidian">
      <LeftPanel />
      <RightPanel>
        <button onClick={() => setActiveForm("menu")}
          className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gold uppercase tracking-widest font-semibold mb-10 transition-colors duration-200">
          <ChevronRight className="h-3 w-3 rotate-180" />
          Volver al menú
        </button>

        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <KeyRound className="text-gold h-6 w-6" />
          </div>
          <p className="text-[10px] text-gold/60 tracking-[0.25em] uppercase font-semibold mb-1.5">Portal Anfitrión</p>
          <h2 className="text-2xl font-semibold text-white mb-2">Ingresar Código</h2>
          <p className="text-gray-500 text-xs font-light leading-relaxed">
            Introduce la clave de evento única asignada por el organizador del salón.
          </p>
        </div>

        <form onSubmit={handleHostSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block mb-2">Código de Evento</label>
            <input
              type="text"
              value={hostCode}
              onChange={(e) => { setHostCode(e.target.value.toUpperCase()); setError(""); }}
              placeholder="SVIP-XXXX"
              autoFocus
              className="w-full px-5 py-4 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-gold/40 focus:bg-white/[0.06] text-center tracking-[0.3em] uppercase font-semibold text-sm transition-all duration-300"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2.5 text-red-400 text-xs bg-red-950/30 border border-red-500/15 rounded-xl px-4 py-3">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-amber-400 text-obsidian text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.45)] disabled:opacity-50 flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-3.5 h-3.5 border-2 border-obsidian border-t-transparent rounded-full animate-spin" /><span>Verificando...</span></>
              : <><span>Acceder al Panel</span><ArrowRight className="h-3.5 w-3.5" /></>
            }
          </button>
        </form>
      </RightPanel>
    </div>
  );

  /* ══════════════════════════════════════════════════════════
     VIEW 3 — Admin auth form
  ══════════════════════════════════════════════════════════ */
  return (
    <div className="flex min-h-screen bg-obsidian">
      <LeftPanel />
      <RightPanel>
        <button onClick={() => setActiveForm("menu")}
          className="flex items-center gap-1.5 text-[10px] text-gray-500 hover:text-gold uppercase tracking-widest font-semibold mb-10 transition-colors duration-200">
          <ChevronRight className="h-3 w-3 rotate-180" />
          Volver al menú
        </button>

        <div className="mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-5 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <Shield className="text-gold h-6 w-6" />
          </div>
          <p className="text-[10px] text-gold/60 tracking-[0.25em] uppercase font-semibold mb-1.5">Acceso Administrativo</p>
          <h2 className="text-2xl font-semibold text-white mb-2">Iniciar Sesión</h2>
          <p className="text-gray-500 text-xs font-light leading-relaxed">
            Ingresa tus credenciales registradas para acceder al sistema de gestión.
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-3">
          {error && (
            <div className="flex items-start gap-2.5 text-red-400 text-xs bg-red-950/30 border border-red-500/15 rounded-xl px-4 py-3 mb-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block mb-2">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com" autoFocus
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-gold/40 focus:bg-white/[0.06] text-xs transition-all duration-300" />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-gold/40 focus:bg-white/[0.06] text-xs transition-all duration-300" />
            </div>
          </div>

          <div className="pt-2 space-y-2.5">
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-amber-400 text-obsidian text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.45)] flex items-center justify-center gap-2 disabled:opacity-50">
              {loading
                ? <><div className="w-3.5 h-3.5 border-2 border-obsidian border-t-transparent rounded-full animate-spin" /><span>Iniciando sesión...</span></>
                : <><span>Iniciar Sesión</span><ArrowRight className="h-3.5 w-3.5" /></>
              }
            </button>

            <button type="button" onClick={() => loginDemo(authRole)}
              className="w-full py-3 rounded-xl border border-white/8 text-gray-400 text-xs font-semibold uppercase hover:bg-white/[0.04] hover:border-gold/20 hover:text-gold transition-all duration-300">
              Entrar como Demo
            </button>
          </div>
        </form>
      </RightPanel>
    </div>
  );
}
