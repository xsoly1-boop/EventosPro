"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoginPortal from "@/components/modules/login/LoginPortal";
import TableMap from "@/components/modules/tables/TableMap";
import QuotesManager from "@/components/modules/quotes/QuotesManager";
import FinanceDashboard from "@/components/modules/finance/FinanceDashboard";
import LogisticsTimeline from "@/components/modules/timeline/LogisticsTimeline";
import QRScanner from "@/components/modules/scanner/QRScanner";
import SettingsManager from "@/components/modules/settings/SettingsManager";
import CalendarDashboard from "@/components/modules/calendar/CalendarDashboard";

import { 
  LayoutDashboard, 
  Map, 
  FileSpreadsheet, 
  WalletCards, 
  Clock, 
  QrCode, 
  Sliders,
  CalendarDays,
  LogOut, 
  User, 
  Sparkles,
  ChevronRight
} from "lucide-react";

type TabType = "overview" | "tables" | "quotes" | "finance" | "timeline" | "scanner" | "settings" | "calendar";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-500 font-light mt-4 tracking-widest uppercase animate-pulse">
          Cargando Sesión...
        </span>
      </div>
    );
  }

  if (!user) {
    return <LoginPortal />;
  }

  // RBAC Tab filtering
  const navigationItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "dueño", "gerencia", "host", "staff", "client"] },
    { id: "tables", label: "Plano de Mesas", icon: Map, roles: ["admin", "dueño", "gerencia", "host", "client"] },
    { id: "calendar", label: "Calendario & Reservas", icon: CalendarDays, roles: ["admin", "dueño", "gerencia", "host", "staff", "client"] },
    { id: "quotes", label: "Cotizaciones", icon: FileSpreadsheet, roles: ["admin", "dueño", "gerencia"] },
    { id: "finance", label: "Finanzas", icon: WalletCards, roles: ["admin", "dueño"] },
    { id: "timeline", label: "Cronograma", icon: Clock, roles: ["admin", "dueño", "gerencia", "staff"] },
    { id: "scanner", label: "Escáner & Aforo", icon: QrCode, roles: ["admin", "dueño", "gerencia", "host"] },
    { id: "settings", label: "Personal & Config.", icon: Sliders, roles: ["admin", "dueño"] },
  ];

  const allowedTabs = navigationItems.filter(item => item.roles.includes(user.role || ""));

  const renderActiveContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab user={user} setActiveTab={setActiveTab} allowedTabs={allowedTabs} />;
      case "tables":
        // TableMap has its own sidebar, so we render it full screen or integrated.
        // Let's render it full screen with a back button returning to the main dashboard.
        return <TableMap onBack={() => setActiveTab("overview")} />;
      case "quotes":
        return <QuotesManager />;
      case "finance":
        return <FinanceDashboard />;
      case "timeline":
        return <LogisticsTimeline />;
      case "scanner":
        return <QRScanner />;
      case "settings":
        return <SettingsManager />;
      case "calendar":
        return <CalendarDashboard />;
      default:
        return <OverviewTab user={user} setActiveTab={setActiveTab} allowedTabs={allowedTabs} />;
    }
  };

  // If activeTab is "tables", it handles its own layout, so we render it directly
  if (activeTab === "tables") {
    return <TableMap onBack={() => setActiveTab("overview")} />;
  }

  return (
    <div className="min-h-screen bg-obsidian flex flex-col md:flex-row relative text-foreground">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 glass border-b md:border-b-0 md:border-r border-gold/10 p-6 flex flex-col justify-between shrink-0 md:h-screen md:sticky md:top-0 z-20">
        <div className="space-y-8">
          {/* Logo Branding */}
          <div className="flex items-center gap-2">
            <Sparkles className="text-gold h-5 w-5 animate-pulse" />
            <span className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">
              SocialesVIP
            </span>
          </div>

          {/* User profile card */}
          <div className="glass-dark p-4 rounded-xl border border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20 text-gold font-bold text-xs uppercase">
              {user.displayName?.substring(0, 2) || "US"}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold text-white truncate">{user.displayName}</h4>
              <span className="text-[9px] font-mono text-gold uppercase tracking-wider block mt-0.5">
                Rol: {user.role === "admin" ? "Admin Master" : 
                      user.role === "dueño" ? "Dueño" : 
                      user.role === "gerencia" ? "Gerencia" : 
                      user.role === "host" ? "Host / Hostess" : 
                      user.role === "staff" ? "Staff" : 
                      user.role === "client" ? "Anfitrión" : user.role}
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {allowedTabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-light tracking-wide flex items-center gap-3 transition-all duration-300 ${
                    isActive
                      ? "bg-gold/10 border border-gold/20 text-gold font-semibold shadow-[0_0_15px_rgba(212,175,55,0.05)]"
                      : "border border-transparent text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="pt-6 border-t border-white/5 mt-6">
          <button
            onClick={logout}
            className="w-full py-2.5 px-4 rounded-lg text-xs border border-red-500/20 text-red-400 font-semibold uppercase hover:bg-red-500/10 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto max-h-screen z-10 relative">
        {renderActiveContent()}
      </main>
    </div>
  );
}

// Subcomponent: Overview Dashboard Landing
interface OverviewProps {
  user: any;
  setActiveTab: (tab: TabType) => void;
  allowedTabs: any[];
}

function OverviewTab({ user, setActiveTab, allowedTabs }: OverviewProps) {
  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto py-4">
      <div>
        <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block mb-1">
          Bienvenido
        </span>
        <h1 className="text-3xl font-light text-white">
          Panel de Control: <span className="font-semibold text-gold capitalize">
            {user.role === "admin" ? "Admin Master" : 
             user.role === "dueño" ? "Dueño (Propietario)" : 
             user.role === "gerencia" ? "Gerencia" : 
             user.role === "host" ? "Host / Hostess" : 
             user.role === "staff" ? "Personal (Staff)" : 
             user.role === "client" ? "Anfitrión / Cliente" : user.role}
          </span>
        </h1>
        <p className="text-gray-400 text-xs font-light mt-1">
          Aquí tienes los accesos directos a los módulos asignados a tu cuenta de usuario.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allowedTabs.filter(tab => tab.id !== "overview").map((tab) => {
          const Icon = tab.icon;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className="glass p-6 rounded-2xl border border-white/5 flex justify-between items-center cursor-pointer hover:border-gold/30 hover:shadow-[0_4px_20px_rgba(212,175,55,0.05)] transition-all duration-500 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 transition-all duration-300">
                  <Icon className="text-gold h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm group-hover:text-gold transition-colors duration-300">
                    {tab.label}
                  </h3>
                  <p className="text-gray-400 text-xs font-light mt-0.5">
                    {tab.id === "tables" && "Asigna invitados en el croquis 2D interactivo de 30m."}
                    {tab.id === "quotes" && "Administra presupuestos dinámicos y contratos."}
                    {tab.id === "finance" && "Registra abonos y evalúa rentabilidad neta del salón."}
                    {tab.id === "timeline" && "Logística del día minuto a minuto para coordinación."}
                    {tab.id === "scanner" && "Escanea códigos QR de aforo en la entrada principal."}
                    {tab.id === "settings" && "Gestiona al personal y los límites físicos del salón."}
                    {tab.id === "calendar" && "Verifica disponibilidad del salón y agenda/confirma reservaciones de eventos."}
                  </p>
                </div>
              </div>
              <ChevronRight className="text-gray-600 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300 h-5 w-5" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
