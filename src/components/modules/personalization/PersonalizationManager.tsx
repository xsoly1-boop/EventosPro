"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Check, Image as ImageIcon, Link2, KeyRound, Copy, ExternalLink, Type, Tag } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, collection, onSnapshot, setDoc } from "firebase/firestore";

type LoginTheme = "1" | "2" | "3";

interface EventAccessCode {
  id: string;
  title: string;
  date: string;
  status: string;
}

export default function PersonalizationManager() {
  const [loginTheme, setLoginTheme] = useState<LoginTheme>("1");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [brandName, setBrandName] = useState<string>("");
  const [portalTitle, setPortalTitle] = useState<string>("");
  const [themeSaved, setThemeSaved] = useState(false);
  const [logoSaved, setLogoSaved] = useState(false);
  const [brandSaved, setBrandSaved] = useState(false);
  const [events, setEvents] = useState<EventAccessCode[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Subscribe to branding settings
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, "settings", "branding"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.loginTheme && ["1", "2", "3"].includes(data.loginTheme)) {
          setLoginTheme(data.loginTheme as LoginTheme);
        }
        if (data.logoUrl !== undefined) setLogoUrl(data.logoUrl);
        if (data.brandName !== undefined) setBrandName(data.brandName);
        if (data.portalTitle !== undefined) setPortalTitle(data.portalTitle);
      }
    });
    return () => unsub();
  }, []);

  // Subscribe to events for access codes
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, "events"), (snap) => {
      const list: EventAccessCode[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          title: data.title || "Evento Sin Nombre",
          date: data.date || "",
          status: data.status || "cotizacion",
        });
      });
      list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      setEvents(list);
    });
    return () => unsub();
  }, []);

  const handleSaveTheme = async (theme: LoginTheme) => {
    if (!db) return;
    setLoginTheme(theme);
    await setDoc(doc(db, "settings", "branding"), { loginTheme: theme }, { merge: true });
    setThemeSaved(true);
    setTimeout(() => setThemeSaved(false), 2500);
  };

  const handleSaveLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    await setDoc(doc(db, "settings", "branding"), { logoUrl: logoUrl.trim() }, { merge: true });
    setLogoSaved(true);
    setTimeout(() => setLogoSaved(false), 2500);
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    await setDoc(doc(db, "settings", "branding"), {
      brandName: brandName.trim(),
      portalTitle: portalTitle.trim(),
    }, { merge: true });
    setBrandSaved(true);
    setTimeout(() => setBrandSaved(false), 2500);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      cotizacion: { label: "Cotización", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
      confirmado: { label: "Confirmado", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
      cancelado: { label: "Cancelado", color: "text-red-400 bg-red-400/10 border-red-400/20" },
      finalizado: { label: "Finalizado", color: "text-gray-400 bg-gray-400/10 border-gray-400/20" },
    };
    return map[status] || { label: status, color: "text-gray-400 bg-gray-400/10 border-gray-400/20" };
  };

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto py-4 animate-fade-in">
      {/* Header */}
      <div>
        <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block mb-1">
          Identidad Visual
        </span>
        <h1 className="text-3xl font-light text-white">
          Módulo de <span className="font-semibold text-gold">Personalización</span>
        </h1>
        <p className="text-gray-400 text-xs font-light mt-1">
          Modifica el tema, logotipo, nombre de marca y comparte los códigos de acceso con tus clientes.
        </p>
      </div>

      {/* Row 1: Logo + Branding Text + Access Codes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Logo customization */}
        <div className="glass-dark rounded-2xl p-6 border border-white/5 h-fit lg:col-span-1 space-y-5">
          <div className="flex items-center gap-2">
            <ImageIcon className="text-gold h-4 w-4" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Logotipo</h3>
          </div>
          <p className="text-xs text-gray-400 font-light leading-relaxed">
            URL externa de tu logotipo. Se muestra en el login y la barra lateral.
          </p>
          <form onSubmit={handleSaveLogo} className="space-y-4 pt-1">
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="url"
                required
                placeholder="https://ejemplo.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-obsidian border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-gold text-xs transition-all"
              />
            </div>
            {logoUrl.trim() && (
              <div className="bg-black/60 border border-white/5 rounded-xl p-4 flex items-center justify-center min-h-[70px] backdrop-blur-sm">
                <img
                  src={logoUrl.trim()}
                  alt="Vista previa"
                  className="max-h-10 object-contain"
                  onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                />
              </div>
            )}
            <button type="submit" className="w-full py-2.5 bg-gold hover:bg-gold-hover text-obsidian rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
              {logoSaved ? (<><Check className="h-4 w-4" /><span>Guardado</span></>) : (<span>Actualizar Logo</span>)}
            </button>
          </form>
        </div>

        {/* Center: Brand Name & Portal Title */}
        <div className="glass-dark rounded-2xl p-6 border border-white/5 h-fit lg:col-span-1 space-y-5">
          <div className="flex items-center gap-2">
            <Type className="text-gold h-4 w-4" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Marca & Título</h3>
          </div>
          <p className="text-xs text-gray-400 font-light leading-relaxed">
            Nombre de la marca y título del portal de acceso. Se reflejan en toda la plataforma.
          </p>
          <form onSubmit={handleSaveBranding} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 font-medium uppercase block">Nombre de Marca</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="SocialesVIP"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-obsidian border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-gold text-xs transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 font-medium uppercase block">Título del Portal</label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Gestión Premium de Eventos Sociales"
                  value={portalTitle}
                  onChange={(e) => setPortalTitle(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-obsidian border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-gold text-xs transition-all"
                />
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-gold hover:bg-gold-hover text-obsidian rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
              {brandSaved ? (<><Check className="h-4 w-4" /><span>Guardado</span></>) : (<span>Actualizar Marca</span>)}
            </button>
          </form>
        </div>

        {/* Right: Access Codes for Clients */}
        <div className="glass-dark rounded-2xl p-6 border border-white/5 h-fit lg:col-span-1 space-y-5">
          <div className="flex items-center gap-2">
            <KeyRound className="text-gold h-4 w-4" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Códigos de Acceso</h3>
          </div>
          <p className="text-xs text-gray-400 font-light leading-relaxed">
            Código de cada evento para que el cliente acceda al <strong className="text-white/80">Panel de Anfitrión</strong> y gestione invitados y mesas.
          </p>

          {events.length === 0 ? (
            <div className="text-center py-6 text-gray-600 text-xs">
              No hay eventos registrados aún.
            </div>
          ) : (
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
              {events.map((ev) => {
                const statusInfo = getStatusLabel(ev.status);
                return (
                  <div key={ev.id} className="bg-black/50 border border-white/5 rounded-xl p-4 space-y-3 hover:border-gold/20 transition-all duration-300">
                    {/* Event info */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate">{ev.title}</h4>
                        <p className="text-[10px] text-gray-500 font-light mt-0.5">{ev.date || "Sin fecha"}</p>
                      </div>
                      <span className={`text-[8px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider shrink-0 ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Access Code Display */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-obsidian rounded-lg border border-gold/20 px-3 py-2 flex items-center justify-center">
                        <span className="text-gold font-mono font-bold text-sm tracking-[0.2em] uppercase select-all">
                          {ev.id}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(ev.id)}
                        className={`shrink-0 p-2.5 rounded-lg border transition-all duration-300 ${
                          copiedId === ev.id
                            ? "bg-gold/20 border-gold/40 text-gold"
                            : "bg-white/5 border-white/10 text-gray-400 hover:text-gold hover:border-gold/30"
                        }`}
                        title="Copiar código"
                      >
                        {copiedId === ev.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    {/* Share link */}
                    <a
                      href={`/?share=${ev.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 hover:text-gold transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Abrir portal de invitados</span>
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Theme Selection (full width) */}
      <div className="glass-dark rounded-2xl p-6 border border-white/5 space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Sparkles className="text-gold h-4 w-4" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Diseño del Portal de Acceso</h3>
          </div>
          {themeSaved && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gold/10 border border-gold/30 text-gold rounded-full text-[10px] font-semibold animate-fade-in">
              <Check className="h-3.5 w-3.5" />
              Tema Guardado
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: "1",
              title: "Tema 1: Tall Cards",
              desc: "Diseño cinematográfico completo. Tarjetas verticales premium Aether con fondo del salón a la vista.",
              preview: "/theme-preview-1.jpg"
            },
            {
              id: "2",
              title: "Tema 2: Split Hero",
              desc: "División a dos paneles: hero izquierdo con imagen de salón y controles a la derecha.",
              preview: "/theme-preview-2.jpg"
            },
            {
              id: "3",
              title: "Tema 3: Neon Glow",
              desc: "Misticismo y lujo minimalista con halos dorados pulsando alrededor de iconos centrales.",
              preview: "/theme-preview-3.jpg"
            }
          ].map((theme) => (
            <div
              key={theme.id}
              onClick={() => handleSaveTheme(theme.id as LoginTheme)}
              className={`group rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 ${
                loginTheme === theme.id
                  ? "border-gold bg-gold/[0.03] shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                  : "border-white/5 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.03]"
              }`}
            >
              <div className="relative aspect-video overflow-hidden border-b border-white/5">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('${theme.preview}')` }}
                />
                {loginTheme === theme.id && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gold text-obsidian flex items-center justify-center shadow-lg">
                      <Check className="h-5 w-5" />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-semibold ${loginTheme === theme.id ? "text-gold" : "text-white"}`}>
                    {theme.title}
                  </h4>
                  {loginTheme === theme.id && (
                    <span className="text-[8px] bg-gold/10 border border-gold/30 text-gold px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                      Activo
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 font-light leading-relaxed">
                  {theme.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
