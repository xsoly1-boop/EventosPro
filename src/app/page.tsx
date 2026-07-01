"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, collection, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import LoginPortal from "@/components/modules/login/LoginPortal";
import TableMap from "@/components/modules/tables/TableMap";
import QuotesManager from "@/components/modules/quotes/QuotesManager";
import FinanceDashboard from "@/components/modules/finance/FinanceDashboard";
import LogisticsTimeline from "@/components/modules/timeline/LogisticsTimeline";
import QRScanner from "@/components/modules/scanner/QRScanner";
import SettingsManager from "@/components/modules/settings/SettingsManager";
import CalendarDashboard from "@/components/modules/calendar/CalendarDashboard";
import EventEditor from "@/components/modules/events/EventEditor";
import HostPortal from "@/components/modules/events/HostPortal";
import PersonalizationManager from "@/components/modules/personalization/PersonalizationManager";

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
  ChevronRight,
  Plus,
  Palette,
  Camera,
  X,
  FileImage
} from "lucide-react";

type TabType = "overview" | "tables" | "quotes" | "finance" | "timeline" | "scanner" | "settings" | "calendar" | "events" | "personalization";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loginTheme, setLoginTheme] = useState<string>("1");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [brandName, setBrandName] = useState<string>("");
  const [logoWidth, setLogoWidth] = useState<number>(0);
  const [logoHeight, setLogoHeight] = useState<number>(0);

  useEffect(() => {
    if (!db) return;
    const unsubBranding = onSnapshot(doc(db, "settings", "branding"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.loginTheme) setLoginTheme(data.loginTheme);
        if (data?.logoUrl !== undefined) setLogoUrl(data.logoUrl);
        if (data?.brandName !== undefined) setBrandName(data.brandName);
        if (data?.logoWidth !== undefined) setLogoWidth(Number(data.logoWidth) || 0);
        if (data?.logoHeight !== undefined) setLogoHeight(Number(data.logoHeight) || 0);
      }
    });
    return () => unsubBranding();
  }, []);
  
  // Read share URL param for public host guest registration portal
  const [shareEventId, setShareEventId] = useState<string | null>(null);

  const [dbPermissions, setDbPermissions] = useState<any[]>([]);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [dashboardReceiptPreview, setDashboardReceiptPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!db) return;
    const unsubRoles = onSnapshot(doc(db, "settings", "roles"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.permissions) {
          setDbPermissions(data.permissions);
        }
      }
    });
    return () => unsubRoles();
  }, []);

  useEffect(() => {
    if (!db) return;
    const unsubPayments = onSnapshot(collection(db, "payment_reports"), (snap) => {
      const pendingList: any[] = [];
      snap.forEach(docSnap => {
        const d = docSnap.data();
        if (d.status === "pending") {
          pendingList.push({ id: docSnap.id, ...d });
        }
      });
      setPendingPayments(pendingList);
      setPendingPaymentsCount(pendingList.length);
    });
    return () => unsubPayments();
  }, []);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const share = searchParams.get("share");
      if (share) {
        setShareEventId(share);
      }
    }
  }, []);

  if (shareEventId) {
    return (
      <HostPortal 
        eventId={shareEventId} 
        onBackToLogin={() => {
          setShareEventId(null);
          if (typeof window !== "undefined") {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }} 
      />
    );
  }

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
    { id: "events", label: "Gestión de Eventos", icon: Sparkles, roles: ["admin", "dueño", "gerencia"] },
    { id: "tables", label: "Plano de Mesas", icon: Map, roles: ["admin", "dueño", "gerencia", "host", "client"] },
    { id: "calendar", label: "Calendario & Reservas", icon: CalendarDays, roles: ["admin", "dueño", "gerencia", "host", "staff", "client"] },
    { id: "quotes", label: "Cotizaciones", icon: FileSpreadsheet, roles: ["admin", "dueño", "gerencia"] },
    { id: "finance", label: "Finanzas", icon: WalletCards, roles: ["admin", "dueño"] },
    { id: "timeline", label: "Cronograma", icon: Clock, roles: ["admin", "dueño", "gerencia", "staff"] },
    { id: "scanner", label: "Escáner & Aforo", icon: QrCode, roles: ["admin", "dueño", "gerencia", "host"] },
    { id: "settings", label: "Personal & Config.", icon: Sliders, roles: ["admin", "dueño", "gerencia"] },
    { id: "personalization", label: "Personalización", icon: Palette, roles: ["admin", "dueño"] },
  ];

  const userPermissions = dbPermissions.find(p => p.role === user?.role);

  const allowedTabs = navigationItems.filter(item => {
    if (!user) return false;
    // Admin and dueño always have access to all modules
    if (user.role === "admin" || user.role === "dueño") return true;
    
    if (userPermissions && userPermissions.modules) {
      const moduleMapping: Record<string, string> = {
        overview: "dashboard",
        tables: "mesas",
        calendar: "calendario",
        quotes: "cotizaciones",
        finance: "finanzas",
        timeline: "cronograma",
        scanner: "escáner",
        events: "eventos"
      };
      const moduleKey = moduleMapping[item.id];
      if (moduleKey && userPermissions.modules[moduleKey] !== undefined) {
        return userPermissions.modules[moduleKey];
      }
    }
    return item.roles.includes(user.role || "");
  });

  const renderActiveContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab 
            user={user} 
            setActiveTab={setActiveTab} 
            allowedTabs={allowedTabs} 
            loginTheme={loginTheme} 
            pendingPayments={pendingPayments}
            setDashboardReceiptPreview={setDashboardReceiptPreview}
          />
        );
      case "tables":
        // TableMap has its own sidebar, so we render it full screen or integrated.
        // Let's render it full screen with a back button returning to the main dashboard.
        return <TableMap onBack={() => setActiveTab("overview")} />;
      case "quotes":
        return <QuotesManager setActiveTab={setActiveTab} />;
      case "finance":
        return <FinanceDashboard />;
      case "timeline":
        return <LogisticsTimeline />;
      case "scanner":
        return <QRScanner />;
      case "settings":
        return <SettingsManager />;
      case "personalization":
        return <PersonalizationManager />;
      case "calendar":
        return <CalendarDashboard />;
      case "events":
        return <EventEditor />;
      default:
        return <OverviewTab user={user} setActiveTab={setActiveTab} allowedTabs={allowedTabs} loginTheme={loginTheme} />;
    }
  };

  // If activeTab is "tables", it handles its own layout, so we render it directly
  if (activeTab === "tables") {
    return (
      <div className={`min-h-screen bg-obsidian text-foreground overflow-hidden theme-${loginTheme} relative`}>
        {/* Background Image for Theme 1 */}
        {loginTheme === "1" && (
          <>
            <div className="absolute inset-0 bg-cover bg-center opacity-40 z-0" style={{ backgroundImage: "url('/login-bg.jpg')" }} />
            <div className="absolute inset-0 bg-black/50 z-0" />
          </>
        )}
        <div className="relative z-10 w-full h-full">
          <TableMap onBack={() => setActiveTab("overview")} />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-obsidian flex flex-col md:flex-row relative text-foreground overflow-hidden theme-${loginTheme}`}>
      {/* Background Image for Theme 1 */}
      {loginTheme === "1" && (
        <>
          <div className="absolute inset-0 bg-cover bg-center opacity-40 z-0" style={{ backgroundImage: "url('/login-bg.jpg')" }} />
          <div className="absolute inset-0 bg-black/50 z-0" />
        </>
      )}

      {/* Sidebar Navigation */}
      <aside className={`w-full md:w-64 backdrop-blur-md bg-black/40 border-b md:border-b-0 md:border-r ${loginTheme === "1" ? "border-gold/20" : "border-white/5"} p-6 flex flex-col justify-between shrink-0 md:h-screen md:sticky md:top-0 z-20`}>
        <div className="space-y-8">
          {/* Logo Branding */}
          <div className="flex items-center gap-2 min-h-[32px]">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo"
                style={{
                  width: logoWidth ? `${logoWidth}px` : undefined,
                  height: logoHeight ? `${logoHeight}px` : undefined,
                  maxWidth: '180px',
                  objectFit: 'contain',
                }}
                className={!logoWidth && !logoHeight ? "max-h-8 object-contain" : ""}
              />
            ) : (
              <>
                <Sparkles className="text-gold h-5 w-5 animate-pulse" />
                <span className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">
                  {brandName || "SocialesVIP"}
                </span>
              </>
            )}
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
                  {item.id === "finance" && pendingPaymentsCount > 0 && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-pulse">
                      {pendingPaymentsCount}
                    </span>
                  )}
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

      {/* Selected Receipt Preview Modal */}
      {dashboardReceiptPreview && (
        <div className="fixed inset-0 bg-obsidian/95 flex items-center justify-center p-4 z-[60] animate-fade-in backdrop-blur-md">
          <div className="relative max-w-3xl w-full max-h-[85vh] flex flex-col items-center justify-center animate-scale-up">
            <button
              onClick={() => setDashboardReceiptPreview(null)}
              className="absolute -top-12 right-0 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all shadow-lg active:scale-95"
              title="Cerrar vista"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="bg-obsidian border border-white/15 rounded-2xl overflow-hidden shadow-2xl p-4 flex items-center justify-center max-h-[80vh]">
              <img
                src={dashboardReceiptPreview}
                alt="Comprobante de Pago"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            <p className="text-[10px] text-gray-500 font-light mt-3 tracking-wider uppercase font-mono">
              Comprobante de transferencia / depósito
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Overview Dashboard Landing
interface OverviewProps {
  user: any;
  setActiveTab: (tab: TabType) => void;
  allowedTabs: any[];
  loginTheme: string;
  pendingPayments?: any[];
  setDashboardReceiptPreview?: (url: string | null) => void;
}

function OverviewTab({ 
  user, 
  setActiveTab, 
  allowedTabs, 
  loginTheme, 
  pendingPayments = [], 
  setDashboardReceiptPreview 
}: OverviewProps) {
  const isClient = user.role === "client";
  const clientEventId = typeof window !== "undefined" ? localStorage.getItem("svip_client_event_id") || "event-123" : "event-123";

  const [eventData, setEventData] = useState<any>(null);
  const [guestsCount, setGuestsCount] = useState(0);
  const [seatedCount, setSeatedCount] = useState(0);

  // Payment reporting states
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payAmount, setPayAmount] = useState("");
  const [payReference, setPayReference] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [isPayReporting, setIsPayReporting] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string>("");
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setReceiptImage(dataUrl);
        }
        setIsCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApproveReport = async (report: any) => {
    if (!db) return;
    if (window.confirm(`¿Seguro que deseas autorizar el pago por $${report.amount.toLocaleString()} de ${report.clientName}?`)) {
      try {
        await setDoc(doc(db, "payment_reports", report.id), { status: "approved" }, { merge: true });

        const eventRef = doc(db, "events", report.eventId);
        const eventSnap = await getDoc(eventRef);
        if (eventSnap.exists()) {
          const currentPaid = eventSnap.data().paidAmount || 0;
          await setDoc(eventRef, { paidAmount: currentPaid + report.amount }, { merge: true });
        }

        const txId = `tx-${Date.now()}`;
        await setDoc(doc(db, "transactions", txId), {
          amount: report.amount,
          type: "abono",
          method: "transferencia",
          reference: `Abono Autorizado: ${report.reference} (${report.clientName})`,
          date: report.date || new Date().toISOString().split("T")[0]
        });

        alert("Pago autorizado con éxito. Se ha reflejado en el evento e ingresado a las finanzas.");
      } catch (err) {
        console.error(err);
        alert("Error al autorizar el pago.");
      }
    }
  };

  const handleRejectReport = async (reportId: string) => {
    if (!db) return;
    if (window.confirm("¿Seguro que deseas rechazar este reporte de pago?")) {
      try {
        await setDoc(doc(db, "payment_reports", reportId), { status: "rejected" }, { merge: true });
        alert("Reporte de pago rechazado.");
      } catch (err) {
        console.error(err);
        alert("Error al rechazar el reporte.");
      }
    }
  };

  useEffect(() => {
    if (!db || !isClient) return;
    const unsub = onSnapshot(collection(db, "payment_reports"), (snap) => {
      const list: any[] = [];
      snap.forEach(docSnap => {
        const d = docSnap.data();
        if (d.eventId === clientEventId) {
          list.push({ id: docSnap.id, ...d });
        }
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReports(list);
    });
    return () => unsub();
  }, [clientEventId, isClient]);

  const handleReportPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || !payReference || !db) return;
    setIsPayReporting(true);
    try {
      const reportId = `report-${Date.now()}`;
      await setDoc(doc(db, "payment_reports", reportId), {
        eventId: clientEventId,
        eventTitle: eventData?.title || "Evento Sin Título",
        clientName: eventData?.clientInfo?.name || "Anfitrión",
        date: payDate,
        amount: Number(payAmount),
        reference: payReference,
        receiptImage: receiptImage || null,
        status: "pending",
        createdAt: new Date().toISOString()
      });
      setPayAmount("");
      setPayReference("");
      setReceiptImage("");
      alert("Reporte de pago enviado con éxito. Pendiente de verificación por gerencia.");
    } catch (err) {
      console.error(err);
      alert("Error al enviar el reporte.");
    } finally {
      setIsPayReporting(false);
    }
  };

  useEffect(() => {
    if (!db || !isClient) return;

    // Load event info
    const unsubEvent = onSnapshot(doc(db, "events", clientEventId), (docSnap) => {
      if (docSnap.exists()) {
        setEventData(docSnap.data());
      }
    });

    // Load guest info to show registration progress
    const unsubGuests = onSnapshot(collection(db, "events", clientEventId, "guests"), (snap) => {
      let count = 0;
      let seated = 0;
      snap.forEach(docSnap => {
        const d = docSnap.data();
        const t = d.tickets || 1;
        count += t;
        if (d.tableId !== null && d.tableId !== undefined) {
          seated += t;
        }
      });
      setGuestsCount(count);
      setSeatedCount(seated);
    });

    return () => {
      unsubEvent();
      unsubGuests();
    };
  }, [clientEventId, isClient]);

  // Financial Calculations
  const totalCost = eventData?.fixedServices?.reduce((acc: number, s: any) => acc + s.price, 0) * (1 - (eventData?.discountPercent || 0) / 100) - (eventData?.discountFixed || 0) || 0;
  const paidAmount = eventData?.paidAmount || 0;
  const balanceDue = Math.max(0, totalCost - paidAmount);
  const paidPercent = totalCost > 0 ? (paidAmount / totalCost) * 100 : 0;

  // Days Countdown
  const getDaysLeft = () => {
    if (!eventData?.date) return 0;
    const evDate = new Date(eventData.date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = evDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };
  const daysLeft = getDaysLeft();

  if (isClient) {
    return (
      <div className="space-y-6 w-full max-w-4xl mx-auto py-4">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-gold/10 via-obsidian to-obsidian p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block">
              Tu Panel de Anfitrión
            </span>
            <h1 className="text-3xl font-light text-white leading-tight">
              ¡Hola, <span className="font-semibold text-gold">{eventData?.clientInfo?.name || "Anfitrión"}</span>!
            </h1>
            <p className="text-xs text-gray-300 font-light max-w-md">
              Estamos preparando cada detalle para <span className="font-medium text-white">{eventData?.title || "tu gran evento"}</span>. Aquí puedes ver el estatus en tiempo real.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[140px] shadow-lg shrink-0">
            <span className="text-[10px] text-gray-400 font-light uppercase tracking-wider block mb-1">
              Cuenta Regresiva
            </span>
            <span className="text-3xl font-mono font-bold text-gold">
              {daysLeft > 0 ? daysLeft : 0}
            </span>
            <span className="text-[10px] text-gray-400 font-light mt-0.5">
              {daysLeft === 1 ? "Día restante" : "Días restantes"}
            </span>
          </div>
        </div>

        {/* Financial Progress Panel */}
        <div className="glass-dark rounded-2xl p-6 border border-white/5 space-y-6">
          <div>
            <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block mb-1">
              Finanzas del Evento
            </span>
            <h2 className="text-lg font-light text-white">
              Resumen de Pagos y Contrato
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[9px] text-gray-400 font-light uppercase block">Costo Total Contratado</span>
              <span className="text-xl font-mono font-bold text-white">${totalCost.toLocaleString()}</span>
            </div>
            <div className="glass p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[9px] text-gray-400 font-light uppercase block">Monto Abonado</span>
              <span className="text-xl font-mono font-bold text-emerald-400">${paidAmount.toLocaleString()}</span>
            </div>
            <div className="glass p-4 rounded-xl border border-white/5 space-y-1">
              <span className="text-[9px] text-gray-400 font-light uppercase block">Saldo Pendiente</span>
              <span className="text-xl font-mono font-bold text-rose-400">${balanceDue.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-gray-400">Progreso de Pago</span>
              <span className="text-gold font-bold">{paidPercent.toFixed(1)}% liquidado</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-gold via-emerald-400 to-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(100, paidPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Payment Reporter & Log Tab */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Form */}
          <form onSubmit={handleReportPayment} className="glass-dark rounded-2xl p-6 border border-white/5 space-y-4">
            <div>
              <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block mb-1">
                Registrar Pagos
              </span>
              <h3 className="text-sm font-semibold text-white">Reportar Nuevo Pago</h3>
              <p className="text-[10px] text-gray-400 font-light mt-1">
                Selecciona la fecha, el monto y escribe el folio del recibo físico, ventanilla bancaria o transferencia.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[9px] text-gray-400 font-light uppercase block mb-1">Fecha del Pago</label>
                <input
                  type="date"
                  required
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] text-gray-400 font-light uppercase block mb-1">Monto del Pago ($)</label>
                <input
                  type="number"
                  required
                  placeholder="Ej. 15000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] text-gray-400 font-light uppercase block mb-1">Referencia / Folio / Ticket</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Folio 8945, Ventanilla, Transf. STP..."
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30"
                />
              </div>

              {/* Screenshot/Receipt Upload */}
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-400 font-light uppercase block mb-1">
                  Foto de Comprobante / Transferencia (Opcional)
                </label>
                
                {receiptImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-gold/30 bg-black/40 p-2 flex items-center justify-between gap-3 group animate-scale-up">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileImage className="h-5 w-5 text-gold shrink-0" />
                      <span className="text-[10px] text-gray-300 truncate font-mono">Comprobante Cargado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <img src={receiptImage} alt="Comprobante preview" className="w-8 h-8 rounded object-cover border border-white/10" />
                      <button
                        type="button"
                        onClick={() => setReceiptImage("")}
                        className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                        title="Eliminar comprobante"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="relative border border-dashed border-white/10 hover:border-gold/30 rounded-xl py-3 px-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-black/20 hover:bg-black/40 transition-all duration-300 group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isCompressing}
                    />
                    <Camera className="h-5 w-5 text-gray-500 group-hover:text-gold transition-colors" />
                    <span className="text-[10px] text-gray-400 group-hover:text-gray-200 transition-colors font-medium">
                      {isCompressing ? "Procesando..." : "Subir Captura / Foto"}
                    </span>
                    <span className="text-[8px] text-gray-600 font-light">Máx. 5MB. Se optimizará automáticamente.</span>
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={isPayReporting}
                className="w-full py-2.5 bg-gold hover:bg-gold-hover text-obsidian rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-300 disabled:opacity-50"
              >
                {isPayReporting ? "Enviando..." : "Reportar Pago"}
              </button>
            </div>
          </form>

          {/* History */}
          <div className="glass-dark rounded-2xl p-6 border border-white/5 flex flex-col justify-between gap-4">
            <div>
              <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block mb-1">
                Seguimiento
              </span>
              <h3 className="text-sm font-semibold text-white">Historial de Reportes</h3>
              <p className="text-[10px] text-gray-400 font-light mt-1">
                Una vez verificado y autorizado por el personal (gerencia o propietario) se reflejará en los abonos.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[220px] space-y-2 pr-1">
              {reports.map((rep) => (
                <div key={rep.id} className="glass p-3 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-semibold text-white">${rep.amount.toLocaleString()}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5 font-mono">{rep.date} | Ref: {rep.reference}</div>
                  </div>
                  <div>
                    {rep.status === "pending" && (
                      <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[9px] font-semibold">
                        Pendiente
                      </span>
                    )}
                    {rep.status === "approved" && (
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[9px] font-semibold">
                        Autorizado
                      </span>
                    )}
                    {rep.status === "rejected" && (
                      <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-[9px] font-semibold">
                        Rechazado
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {reports.length === 0 && (
                <div className="h-full flex items-center justify-center text-center text-gray-500 italic text-[11px] py-8">
                  No hay reportes de pagos enviados aún.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logistics & Seating Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Guest Registration Progress */}
          <div className="glass-dark rounded-2xl p-6 border border-white/5 space-y-4">
            <div>
              <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block mb-1">
                Pase de Lista
              </span>
              <h3 className="text-sm font-semibold text-white">Registro de Invitados</h3>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Total Pre-Registrados</span>
                <span className="text-xs text-white font-mono font-semibold">
                  {guestsCount} / {eventData?.guestLimit || 150} pax
                </span>
              </div>
              
              <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gold rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, (guestsCount / (eventData?.guestLimit || 150)) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Asignados a Mesas (Croquis)</span>
                <span className="text-xs text-white font-mono font-semibold">
                  {seatedCount} / {guestsCount || 1} pax
                </span>
              </div>
              
              <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gold rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, (seatedCount / (guestsCount || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="glass-dark rounded-2xl p-6 border border-white/5 flex flex-col justify-between gap-6">
            <div>
              <span className="text-[10px] text-gold tracking-widest font-semibold uppercase block mb-1">
                Accesos Directos
              </span>
              <h3 className="text-sm font-semibold text-white">Acciones Operativas</h3>
            </div>

            <div className="space-y-3">
              {allowedTabs.some(t => t.id === "tables") && (
                <button
                  onClick={() => setActiveTab("tables")}
                  className="w-full py-3 bg-gold hover:bg-gold-hover text-obsidian rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-300 flex items-center justify-center gap-2 shadow-lg"
                >
                  <Map className="h-4 w-4" />
                  Organizar Croquis de Mesas
                </button>
              )}
              
              <a
                href={`/?share=${clientEventId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4 text-gold" />
                Registrar Nuevos Invitados
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto py-4">
      {loginTheme === "1" && (
        <style>{`
          @keyframes borderShimmer {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .dashboard-card-border {
            background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(212,175,55,0.35), rgba(255,255,255,0.06));
            background-size: 200% 200%;
            animation: borderShimmer 4s linear infinite;
          }
          .dashboard-card-border:hover {
            background: linear-gradient(90deg, rgba(212,175,55,0.35), rgba(251,191,36,0.9), rgba(212,175,55,0.35));
            background-size: 200% 200%;
            animation: borderShimmer 2s linear infinite;
          }
        `}</style>
      )}

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

      {/* Notifications / Pending Payment Reports Alert */}
      {!isClient && pendingPayments.length > 0 && (
        <div className="glass-dark border border-gold/30 rounded-2xl p-5 space-y-4 animate-scale-up shadow-[0_0_20px_rgba(212,175,55,0.05)]">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <h3 className="text-xs font-semibold text-gold uppercase tracking-wider">
              Notificaciones de Pago Pendientes ({pendingPayments.length})
            </h3>
          </div>
          <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
            {pendingPayments.map((rep) => (
              <div key={rep.id} className="glass p-3 rounded-xl border border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                <div>
                  <div className="text-white font-medium">
                    {rep.clientName} ha reportado un pago de <span className="text-emerald-400 font-bold font-mono">${rep.amount.toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    Evento: {rep.eventTitle} | Ref: {rep.reference} | Fecha: {rep.date}
                  </div>
                </div>
                <div className="flex gap-1.5 self-end sm:self-auto shrink-0 items-center">
                  {rep.receiptImage && setDashboardReceiptPreview && (
                    <button
                      type="button"
                      onClick={() => setDashboardReceiptPreview(rep.receiptImage)}
                      className="py-1 px-2.5 bg-gold/10 hover:bg-gold/25 border border-gold/20 text-gold rounded-lg text-[10px] uppercase font-bold transition-all"
                    >
                      Ver Ticket
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleApproveReport(rep)}
                    className="py-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] uppercase font-bold transition-all"
                  >
                    Autorizar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRejectReport(rep.id)}
                    className="py-1 px-2.5 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-400 rounded-lg text-[10px] uppercase font-bold transition-all"
                  >
                    Rechazar
                  </button>
                  {allowedTabs.some(t => t.id === "finance") && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("finance")}
                      className="py-1 px-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-[10px] uppercase font-bold transition-all"
                    >
                      Ir a Finanzas
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allowedTabs.filter(tab => tab.id !== "overview").map((tab) => {
          const Icon = tab.icon;

          if (loginTheme === "1") {
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer p-[2.5px] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
              >
                {/* Glowing border container */}
                <div className="absolute inset-0 rounded-2xl dashboard-card-border" />

                {/* Inner Card content */}
                <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-black/80 backdrop-blur-md p-6 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 transition-all duration-300 shadow-[0_0_10px_rgba(212,175,55,0.1)] group-hover:shadow-[0_0_15px_rgba(212,175,55,0.25)]">
                      <Icon className="text-gold h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm group-hover:text-gold transition-colors duration-300">
                        {tab.label}
                      </h3>
                      <p className="text-gray-400 text-xs font-light mt-0.5 max-w-[280px]">
                        {tab.id === "events" && "Configura detalles operativos de contratos, menús de cocina y aforos del salón."}
                        {tab.id === "tables" && "Asigna invitados en el croquis 2D interactivo de 30m."}
                        {tab.id === "quotes" && "Administra presupuestos dinámicos y contratos."}
                        {tab.id === "finance" && "Registra abonos y evalúa rentabilidad neta del salón."}
                        {tab.id === "timeline" && "Logística del día minuto a minuto para coordination."}
                        {tab.id === "scanner" && "Escanea códigos QR de aforo en la entrada principal."}
                        {tab.id === "settings" && "Gestiona al personal y los límites físicos del salón."}
                        {tab.id === "calendar" && "Verifica disponibilidad del salón y agenda/confirma reservaciones de eventos."}
                        {tab.id === "personalization" && "Personaliza el logotipo del portal y selecciona temas exclusivos."}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-600 group-hover:text-gold group-hover:translate-x-1 transition-all duration-300 h-5 w-5 shrink-0" />
                </div>
              </div>
            );
          }

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
                    {tab.id === "events" && "Configura detalles operativos de contratos, menús de cocina y aforos del salón."}
                    {tab.id === "tables" && "Asigna invitados en el croquis 2D interactivo de 30m."}
                    {tab.id === "quotes" && "Administra presupuestos dinámicos y contratos."}
                    {tab.id === "finance" && "Registra abonos y evalúa rentabilidad neta del salón."}
                    {tab.id === "timeline" && "Logística del día minuto a minuto para coordinación."}
                    {tab.id === "scanner" && "Escanea códigos QR de aforo en la entrada principal."}
                    {tab.id === "settings" && "Gestiona al personal y los límites físicos del salón."}
                    {tab.id === "calendar" && "Verifica disponibilidad del salón y agenda/confirma reservaciones de eventos."}
                    {tab.id === "personalization" && "Personaliza el logotipo del portal y selecciona temas exclusivos."}
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
