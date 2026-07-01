import { UserRole } from "@/hooks/useAuth";
import React from "react";

export interface ThemeProps {
  activeForm: "menu" | "host-code" | "auth-fields";
  setActiveForm: (f: "menu" | "host-code" | "auth-fields") => void;
  authRole: UserRole;
  hostCode: string;
  setHostCode: (c: string) => void;
  email: string;
  setEmail: (e: string) => void;
  password: string;
  setPassword: (p: string) => void;
  loading: boolean;
  error: string;
  setError: (e: string) => void;
  mounted: boolean;
  handleHostSubmit: (e: React.FormEvent) => void;
  handleAuthSubmit: (e: React.FormEvent) => void;
  handleRowAction: (action: "admin" | "host-code" | "scanner") => void;
  loginDemo: (role: UserRole) => void;
  logoUrl?: string;
  portalTitle?: string;
  brandName?: string;
  logoWidth?: number;
  logoHeight?: number;
}

export const ACCESS_ROWS = [
  {
    id: "admin",
    eyebrow: "Acceso Seguro",
    title: "Administrador",
    desc: "Control financiero global, cotizaciones, gestión de personal y logística del salón.",
    action: "admin" as const,
    buttonLabel: "Cuentas de Control",
    featured: false,
    bg: "/card-admin.jpg",
  },
  {
    id: "client",
    eyebrow: "Portal Exclusivo",
    title: "Anfitrión / Cliente",
    desc: "Auto-gestión de invitados, plano de mesas, estado de cuenta y abonos en tiempo real.",
    action: "host-code" as const,
    buttonLabel: "Código de Anfitrión",
    featured: true,
    bg: "/card-client.jpg",
  },
  {
    id: "staff",
    eyebrow: "Acceso Directo",
    title: "Staff de Recepción",
    desc: "Escáner QR en tiempo real para control de accesos e invitados en recepción.",
    action: "scanner" as const,
    buttonLabel: "Escanear Pases",
    featured: false,
    bg: "/card-scanner.jpg",
  },
];
