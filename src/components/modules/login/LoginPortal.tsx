"use client";

import React, { useState, useEffect } from "react";
import { Shield, User, QrCode, Sparkles, KeyRound, Mail, Lock, AlertCircle, ArrowRight, Star } from "lucide-react";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

/* ── Floating orb component ─────────────────────────────── */
function Orb({ cx, cy, r, delay = 0 }: { cx: string; cy: string; r: number; delay?: number }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: cx, top: cy,
        width: r * 2, height: r * 2,
        transform: "translate(-50%,-50%)",
        background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)",
        animation: `pulse ${3 + delay}s ease-in-out ${delay}s infinite alternate`,
        filter: "blur(40px)",
      }}
    />
  );
}

/* ── Card data ───────────────────────────────────────────── */
const CARDS = [
  {
    id: "admin",
    icon: Shield,
    badge: "Acceso Seguro",
    title: "Administrador",
    desc: "Control financiero global, cotización de eventos, gestión de personal y logística del salón.",
    action: "admin" as const,
    buttonLabel: "Cuentas de Control",
    accent: "from-amber-400/20 to-yellow-600/10",
    glow: "rgba(212,175,55,0.25)",
  },
  {
    id: "client",
    icon: User,
    badge: "Portal Exclusivo",
    title: "Anfitrión / Cliente",
    desc: "Auto-gestión de invitados, planos de mesas interactivos, estado de cuenta y abonos en tiempo real.",
    action: "host-code" as const,
    buttonLabel: "Código de Anfitrión",
    accent: "from-amber-300/25 to-gold/10",
    glow: "rgba(251,191,36,0.30)",
    featured: true,
  },
  {
    id: "staff",
    icon: QrCode,
    badge: "Acceso Directo",
    title: "Staff de Recepción",
    desc: "Escáner QR ultra rápido en tiempo real para control de accesos e invitados en la entrada del salón.",
    action: "scanner" as const,
    buttonLabel: "Escanear Pases",
    accent: "from-gold/15 to-amber-500/5",
    glow: "rgba(212,175,55,0.20)",
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
    setError("");
    setLoading(true);
    if (code === "SVIP-2026") {
      localStorage.setItem("svip_client_event_id", "event-123");
      loginDemo("client");
      setLoading(false);
      return;
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
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Credenciales incorrectas. Verifica tu correo y contraseña.");
      } else {
        setError("Error de autenticación: " + (err.message || "Inténtalo de nuevo."));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCardAction = (card: typeof CARDS[0]) => {
    if (card.action === "admin") { setAuthRole("admin"); setEmail(""); setPassword(""); setError(""); setActiveForm("auth-fields"); }
    else if (card.action === "host-code") { setError(""); setHostCode(""); setActiveForm("host-code"); }
    else if (card.action === "scanner") { window.location.href = "/scanner"; }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* ── Background image ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      />

      {/* ── Overlay layers ── */}
      {/* 1. Dark base */}
      <div className="absolute inset-0 bg-black/70" />
      {/* 2. Radial vignette — darkens edges */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 20%, rgba(0,0,0,0.75) 100%)" }} />
      {/* 3. Gold center glow */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.07) 0%, transparent 60%)" }} />
      {/* 4. Bottom fade to full black */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" />



      {/* ── Branding header ── */}
      <div
        className="text-center mb-16 max-w-2xl z-10"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.8s ease, transform 0.8s ease" }}
      >
        {/* Logo mark */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/30 to-gold/5 border border-gold/30 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              <Sparkles className="text-gold h-5 w-5" />
            </div>
            <div className="absolute inset-0 rounded-xl animate-ping border border-gold/20 opacity-30" />
          </div>
          <span className="text-xs font-semibold tracking-[0.35em] text-gold/80 uppercase">
            SocialesVIP
          </span>
        </div>

        <h1 className="text-4xl md:text-[3.25rem] font-extralight tracking-tight text-white leading-tight mb-5">
          Gestión Premium de<br />
          <span
            className="font-semibold"
            style={{ background: "linear-gradient(90deg, #D4AF37, #fff 50%, #D4AF37)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            Eventos Sociales
          </span>
        </h1>

        <p className="text-gray-400 text-sm font-light max-w-md mx-auto leading-relaxed">
          Plataforma de alta costura digital para la planificación, logística y control de accesos exclusivos.
        </p>

        {/* Decorative line */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/40" />
          <Star className="h-3 w-3 text-gold/50 fill-gold/30" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/40" />
        </div>
      </div>

      {/* ── View 1: Main Cards ── */}
      {activeForm === "menu" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full z-10">
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="group relative rounded-2xl p-[1px] cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.03) 60%, rgba(212,175,55,0.12))",
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(30px)",
                  transition: `opacity 0.7s ease ${0.1 + i * 0.15}s, transform 0.7s ease ${0.1 + i * 0.15}s`,
                }}
                onClick={() => handleCardAction(card)}
              >
                {/* Glow on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${card.glow} 0%, transparent 70%)` }}
                />

                {/* Card body */}
                <div className={`relative h-full rounded-2xl p-7 flex flex-col justify-between overflow-hidden
                  bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-sm
                  group-hover:-translate-y-2 group-hover:shadow-[0_20px_60px_rgba(212,175,55,0.12)]
                  transition-all duration-500 ease-out
                  ${card.featured ? "ring-1 ring-gold/20" : ""}
                `}>

                  {/* Featured badge */}
                  {card.featured && (
                    <div className="absolute top-4 right-4">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gold/80 bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                    </div>
                  )}

                  {/* Background accent gradient */}
                  <div className={`absolute -right-10 -top-10 w-36 h-36 rounded-full bg-gradient-to-br ${card.accent} blur-2xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div>
                    {/* Badge */}
                    <span className="text-[9px] font-semibold tracking-[0.2em] text-gold/60 uppercase block mb-4">
                      {card.badge}
                    </span>

                    {/* Icon */}
                    <div className="relative w-12 h-12 rounded-xl mb-6">
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 group-hover:border-gold/40 transition-all duration-500" />
                      <div className="absolute inset-0 rounded-xl flex items-center justify-center">
                        <Icon className="text-gold h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-gold transition-colors duration-300">
                      {card.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-500 text-sm font-light leading-relaxed mb-8">
                      {card.desc}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <div className={`relative flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300
                    ${card.featured
                      ? "bg-gradient-to-r from-gold to-amber-400 text-obsidian shadow-[0_4px_20px_rgba(212,175,55,0.35)] group-hover:shadow-[0_6px_30px_rgba(212,175,55,0.5)]"
                      : "border border-gold/20 text-gold group-hover:bg-gold/5 group-hover:border-gold/40"
                    }`}
                  >
                    <span>{card.buttonLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── View 2: Host Code Form ── */}
      {activeForm === "host-code" && (
        <div className="relative max-w-md w-full z-10">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/10 to-transparent blur-xl pointer-events-none" />
          <div className="relative rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.3), rgba(212,175,55,0.05) 50%, rgba(212,175,55,0.2))" }}>
            <div className="rounded-2xl p-8 bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-md">

              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative w-14 h-14 mb-5">
                  <div className="absolute inset-0 rounded-xl bg-gold/10 border border-gold/20 animate-pulse" />
                  <div className="absolute inset-0 rounded-xl flex items-center justify-center">
                    <KeyRound className="text-gold h-6 w-6" />
                  </div>
                </div>
                <span className="text-[9px] tracking-[0.25em] text-gold/60 uppercase font-semibold mb-2">Portal Anfitrión</span>
                <h3 className="text-xl font-semibold text-white mb-2">Ingresar Código</h3>
                <p className="text-gray-400 text-xs font-light leading-relaxed max-w-xs">
                  Digita tu clave de evento único asignado para acceder a tu panel de gestión.
                </p>
              </div>

              <form onSubmit={handleHostSubmit} className="space-y-4">
                <input
                  type="text"
                  value={hostCode}
                  onChange={(e) => { setHostCode(e.target.value.toUpperCase()); setError(""); }}
                  placeholder="SVIP-XXXX"
                  className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-gold/40 text-center tracking-[0.3em] uppercase font-semibold text-sm transition-all duration-300"
                />
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-xs bg-red-950/30 border border-red-500/20 rounded-xl px-3 py-2.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setActiveForm("menu")}
                    className="w-1/2 py-3 rounded-xl border border-white/10 text-gray-400 text-xs font-semibold uppercase hover:bg-white/5 transition-all duration-300">
                    Volver
                  </button>
                  <button type="submit" disabled={loading}
                    className="w-1/2 py-3 rounded-xl bg-gradient-to-r from-gold to-amber-400 text-obsidian text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.5)] disabled:opacity-50">
                    {loading ? "Verificando..." : "Acceder"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── View 3: Admin Auth Form ── */}
      {activeForm === "auth-fields" && (
        <div className="relative max-w-md w-full z-10">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-gold/8 to-transparent blur-xl pointer-events-none" />
          <div className="relative rounded-2xl p-[1px]" style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.04) 50%, rgba(212,175,55,0.18))" }}>
            <div className="rounded-2xl p-8 bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-md">

              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative w-14 h-14 mb-5">
                  <div className="absolute inset-0 rounded-xl bg-gold/10 border border-gold/20" />
                  <div className="absolute inset-0 rounded-xl flex items-center justify-center">
                    <Shield className="text-gold h-6 w-6" />
                  </div>
                </div>
                <span className="text-[9px] tracking-[0.25em] text-gold/60 uppercase font-semibold mb-2">Acceso Seguro</span>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {authRole === "admin" ? "Administrador" : "Recepción"}
                </h3>
                <p className="text-gray-400 text-xs font-light leading-relaxed max-w-xs">
                  Ingresa tus credenciales registradas para acceder al sistema.
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-3">
                {error && (
                  <div className="flex items-start gap-2 text-red-400 text-xs bg-red-950/30 border border-red-500/20 rounded-xl px-3 py-2.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-gold/40 text-xs transition-all duration-300" />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-gold/40 text-xs transition-all duration-300" />
                </div>

                <div className="space-y-2 pt-2">
                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold to-amber-400 text-obsidian text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.5)] flex items-center justify-center gap-2 disabled:opacity-50">
                    {loading
                      ? <><div className="w-4 h-4 border-2 border-obsidian border-t-transparent rounded-full animate-spin" /><span>Iniciando...</span></>
                      : <span>Iniciar Sesión</span>
                    }
                  </button>

                  <div className="flex gap-2">
                    <button type="button" onClick={() => setActiveForm("menu")}
                      className="w-1/2 py-2.5 rounded-xl border border-white/10 text-gray-400 text-xs font-semibold uppercase hover:bg-white/5 transition-all duration-300">
                      Volver
                    </button>
                    <button type="button" onClick={() => loginDemo(authRole)}
                      className="w-1/2 py-2.5 rounded-xl border border-gold/20 text-gold text-xs font-semibold uppercase hover:bg-gold/5 hover:border-gold/30 transition-all duration-300">
                      Entrar Demo
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div
        className="mt-20 z-10 text-center"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 1s ease 0.5s" }}
      >
        <p className="text-[10px] text-gray-600 tracking-[0.2em] uppercase">
          © 2026 SocialesVIP · Todos los derechos reservados
        </p>
      </div>

      <style jsx>{`
        @keyframes pulse {
          from { transform: translate(-50%,-50%) scale(1); opacity: 0.6; }
          to   { transform: translate(-50%,-50%) scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
