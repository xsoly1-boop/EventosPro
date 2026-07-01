"use client";
// Orchestrator — reads loginTheme from Firestore and renders the correct theme

import React, { useState, useEffect } from "react";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import ThemeOne from "./themes/ThemeOne";
import ThemeTwo from "./themes/ThemeTwo";
import ThemeThree from "./themes/ThemeThree";
import type { ThemeProps } from "./themes/types";

export type LoginTheme = "1" | "2" | "3";

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
  const [loginTheme, setLoginTheme] = useState<LoginTheme>("1");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [portalTitle, setPortalTitle] = useState<string>("");
  const [brandName, setBrandName] = useState<string>("");
  const [logoWidth, setLogoWidth] = useState<number>(0);
  const [logoHeight, setLogoHeight] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
    if (!db) return;
    
    // Only set default branding theme in Firestore if not existing yet to avoid overwriting user selections
    const checkDefaultBranding = async () => {
      try {
        const { doc, getDoc, setDoc } = await import("firebase/firestore");
        const snap = await getDoc(doc(db, "settings", "branding"));
        if (!snap.exists() || !snap.data()?.loginTheme) {
          await setDoc(doc(db, "settings", "branding"), { loginTheme: "1" }, { merge: true });
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkDefaultBranding();

    // Subscribe to branding settings for real-time theme switching
    const unsub = onSnapshot(doc(db, "settings", "branding"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const theme = data?.loginTheme as LoginTheme;
        if (theme && ["1","2","3"].includes(theme)) setLoginTheme(theme);
        if (data?.logoUrl !== undefined) setLogoUrl(data.logoUrl);
        if (data?.portalTitle !== undefined) setPortalTitle(data.portalTitle);
        if (data?.brandName !== undefined) setBrandName(data.brandName);
        if (data?.logoWidth !== undefined) setLogoWidth(Number(data.logoWidth) || 0);
        if (data?.logoHeight !== undefined) setLogoHeight(Number(data.logoHeight) || 0);
      }
    });
    return () => unsub();
  }, []);

  const handleHostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = hostCode.trim();
    if (!code) return;
    setError(""); setLoading(true);
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

  const handleRowAction = (action: "admin" | "host-code" | "scanner") => {
    if (action === "admin") { setAuthRole("admin"); setEmail(""); setPassword(""); setError(""); setActiveForm("auth-fields"); }
    else if (action === "host-code") { setError(""); setHostCode(""); setActiveForm("host-code"); }
    else { window.location.href = "/scanner"; }
  };

  const themeProps: ThemeProps = {
    activeForm, setActiveForm,
    authRole, hostCode, setHostCode,
    email, setEmail, password, setPassword,
    loading, error, setError, mounted,
    handleHostSubmit, handleAuthSubmit,
    handleRowAction, loginDemo,
    logoUrl,
    portalTitle,
    brandName,
    logoWidth,
    logoHeight,
  };

  if (loginTheme === "1") return <ThemeOne {...themeProps} />;
  if (loginTheme === "3") return <ThemeThree {...themeProps} />;
  return <ThemeTwo {...themeProps} />;
}
