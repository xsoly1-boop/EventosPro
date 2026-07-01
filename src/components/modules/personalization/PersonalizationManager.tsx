"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Check, Image as ImageIcon, Link2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

type LoginTheme = "1" | "2" | "3";

export default function PersonalizationManager() {
  const [loginTheme, setLoginTheme] = useState<LoginTheme>("1");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [themeSaved, setThemeSaved] = useState(false);
  const [logoSaved, setLogoSaved] = useState(false);

  // Subscribe to branding settings
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, "settings", "branding"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.loginTheme && ["1", "2", "3"].includes(data.loginTheme)) {
          setLoginTheme(data.loginTheme as LoginTheme);
        }
        if (data.logoUrl) {
          setLogoUrl(data.logoUrl);
        }
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
    await setDoc(doc(db, "settings", "branding"), { logoUrl: logoUrl.trim() }, { merge: true });
    setLogoSaved(true);
    setTimeout(() => setLogoSaved(false), 2500);
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto py-4 animate-fade-in">
      {/* Header */}
      <div>
        <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block mb-1">
          Identidad Visual
        </span>
        <h1 className="text-3xl font-light text-white">
          Módulo de <span className="font-semibold text-gold">Personalización</span>
        </h1>
        <p className="text-gray-400 text-xs font-light mt-1">
          Modifica el tema de la plataforma y el logotipo principal para alinear la experiencia a tu marca.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Logo customization */}
        <div className="glass-dark rounded-2xl p-6 border border-white/5 h-fit lg:col-span-1 space-y-5">
          <div className="flex items-center gap-2">
            <ImageIcon className="text-gold h-4 w-4" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Logotipo del Portal</h3>
          </div>
          <p className="text-xs text-gray-400 font-light leading-relaxed">
            Adjunta la URL externa de tu logotipo en alta resolución. Se aplicará en el inicio de sesión y en la barra lateral del panel de control.
          </p>

          <form onSubmit={handleSaveLogo} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-[10px] text-gray-400 font-medium uppercase block">Enlace URL del Logo</label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="url"
                  required
                  placeholder="https://ejemplo.com/mi-logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-obsidian border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:border-gold text-xs transition-all"
                />
              </div>
            </div>

            {logoUrl.trim() && (
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 font-medium uppercase block">Vista Previa del Logotipo</label>
                <div className="bg-black/60 border border-white/5 rounded-xl p-4 flex items-center justify-center min-h-[90px] backdrop-blur-sm">
                  <img
                    src={logoUrl.trim()}
                    alt="Vista previa del logo"
                    className="max-h-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-gold hover:bg-gold-hover text-obsidian rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              {logoSaved ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Guardado con Éxito</span>
                </>
              ) : (
                <span>Actualizar Logotipo</span>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Theme Selection */}
        <div className="glass-dark rounded-2xl p-6 border border-white/5 lg:col-span-2 space-y-6">
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
                {/* Preview Thumbnail */}
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

                {/* Body Info */}
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
    </div>
  );
}
