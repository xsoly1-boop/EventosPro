"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Check, Image as ImageIcon, Link2, Type, Tag, Maximize2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

type LoginTheme = "1" | "2" | "3";


export default function PersonalizationManager() {
  const [loginTheme, setLoginTheme] = useState<LoginTheme>("1");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [brandName, setBrandName] = useState<string>("");
  const [portalTitle, setPortalTitle] = useState<string>("");
  const [logoWidth, setLogoWidth] = useState<number>(0);
  const [logoHeight, setLogoHeight] = useState<number>(0);
  const [themeSaved, setThemeSaved] = useState(false);
  const [logoSaved, setLogoSaved] = useState(false);
  const [brandSaved, setBrandSaved] = useState(false);

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
        if (data.logoWidth !== undefined) setLogoWidth(Number(data.logoWidth) || 0);
        if (data.logoHeight !== undefined) setLogoHeight(Number(data.logoHeight) || 0);
      }
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
    await setDoc(doc(db, "settings", "branding"), {
      logoUrl: logoUrl.trim(),
      logoWidth: logoWidth || 0,
      logoHeight: logoHeight || 0,
    }, { merge: true });
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

      {/* Row 1: Logo + Branding Text */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

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
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 font-medium uppercase block">URL del Logo</label>
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
            </div>

            {/* Size Controls */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-500 font-medium uppercase flex items-center gap-1.5">
                <Maximize2 className="h-3 w-3" /> Tamaño del Logo (px)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-semibold">W</span>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    placeholder="Auto"
                    value={logoWidth || ""}
                    onChange={(e) => setLogoWidth(Number(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-lg bg-obsidian border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-gold text-xs transition-all text-center"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-semibold">H</span>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    placeholder="Auto"
                    value={logoHeight || ""}
                    onChange={(e) => setLogoHeight(Number(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-lg bg-obsidian border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-gold text-xs transition-all text-center"
                  />
                </div>
              </div>
              <p className="text-[9px] text-gray-600 font-light">Deja en 0 o vacío para tamaño automático.</p>
            </div>

            {/* Preview */}
            {logoUrl.trim() && (
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-500 font-medium uppercase block">Vista Previa</label>
                <div className="bg-black/60 border border-white/5 rounded-xl p-4 flex items-center justify-center min-h-[70px] backdrop-blur-sm">
                  <img
                    src={logoUrl.trim()}
                    alt="Vista previa"
                    style={{
                      width: logoWidth ? `${logoWidth}px` : undefined,
                      height: logoHeight ? `${logoHeight}px` : undefined,
                      maxWidth: '100%',
                      objectFit: 'contain',
                    }}
                    className={!logoWidth && !logoHeight ? "max-h-12 object-contain" : ""}
                    onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                  />
                </div>
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
