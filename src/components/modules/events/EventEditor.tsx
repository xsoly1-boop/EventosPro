"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  User, 
  Map, 
  Sliders, 
  FileText, 
  Plus, 
  Trash2, 
  Pencil, 
  Save, 
  Utensils, 
  Briefcase, 
  Percent, 
  ArrowRight,
  TrendingUp,
  Tag,
  Share2
} from "lucide-react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from "firebase/firestore";

interface ClientInfo {
  name: string;
  phone: string;
  email: string;
  rfc: string;
  address: string;
}

interface FixedService {
  name: string;
  price: number;
}

interface EventData {
  id: string;
  title: string;
  date: string;
  guestLimit: number;
  status: "borrador" | "cotizacion" | "pre-reserva" | "contrato";
  openSeatingMode: boolean | "hibrido";
  clientInfo: ClientInfo;
  menu: string; // e.g. "Espagueti al burro, lomo adobado, papas al gratin"
  packageName?: string;
  packagePrice?: number;
  fixedServices: FixedService[];
  discountPercent: number;
  discountFixed: number;
  enableBalcony?: boolean;
  paidAmount?: number;
}

export default function EventEditor() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Form state
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");

  // Form Fields State
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [guestLimit, setGuestLimit] = useState(150);
  const [status, setStatus] = useState<"borrador" | "cotizacion" | "pre-reserva" | "contrato">("borrador");
  const [openSeatingMode, setOpenSeatingMode] = useState<boolean | "hibrido">(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientRfc, setClientRfc] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [menu, setMenu] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountFixed, setDiscountFixed] = useState(0);
  const [enableBalcony, setEnableBalcony] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);
  const [packageName, setPackageName] = useState("Paquete Básico Imperial");
  const [packagePrice, setPackagePrice] = useState(350);

  // Fixed Services editing inside form
  const [fixedServices, setFixedServices] = useState<FixedService[]>([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState(0);

  // Dynamic databases catalog state hooks
  const [dbServices, setDbServices] = useState<{ name: string; price: number }[]>([]);
  const [dbMenus, setDbMenus] = useState<{ label: string; items: string }[]>([]);
  const [dbPackages, setDbPackages] = useState<{ name: string; price: number; description: string }[]>([]);

  useEffect(() => {
    if (!db) return;
    const unsubSvc = onSnapshot(collection(db, "catalog_services"), (snap) => {
      const list: any[] = [];
      snap.forEach(docSnap => list.push(docSnap.data()));
      setDbServices(list);
    });
    const unsubMenus = onSnapshot(collection(db, "catalog_menus"), (snap) => {
      const list: any[] = [];
      snap.forEach(docSnap => list.push(docSnap.data()));
      setDbMenus(list);
    });
    const unsubPkgs = onSnapshot(collection(db, "catalog_packages"), (snap) => {
      const list: any[] = [];
      snap.forEach(docSnap => list.push(docSnap.data()));
      setDbPackages(list);
    });
    return () => {
      unsubSvc();
      unsubMenus();
      unsubPkgs();
    };
  }, []);

  // Standard predefined service catalog (for quick insert)
  const serviceCatalog = dbServices.length > 0 ? dbServices : [
    { name: "DJ Premium & Cabina Pro", price: 1200 },
    { name: "Banquete Gourmet 3 tiempos", price: 2500 },
    { name: "Mesa de Dulces Temática", price: 450 },
    { name: "Personal de Animación & Hostess", price: 600 },
    { name: "Servicio de Valet Parking Pro", price: 350 },
    { name: "Pista de Baile LED Extra", price: 800 },
    { name: "Fotografía & Video Digital", price: 950 },
    { name: "Grupo Musical en Vivo Pro", price: 4500 },
    { name: "Banda Sinaloense Premium", price: 5500 },
    { name: "Solista Acústico Saxofón", price: 1800 },
    { name: "Show de Pirotecnia Fria & Laser", price: 2200 },
    { name: "Cabina Giratoria 360 Video", price: 1500 },
  ];

  // Standard predefined menu templates (for quick selection)
  const menuTemplates = dbMenus.length > 0 ? dbMenus : [
    { label: "Banquete Clásico VIP", items: "Espagueti al burro, lomo adobado, papas al gratin" },
    { label: "Menú Gourmet Tres Tiempos", items: "Ensalada César con pollo, pechuga rellena con puré, postre tres leches" },
    { label: "Cena de Gala Internacional", items: "Crema de elote, lomo en salsa de ciruela, volcán de chocolate" },
    { label: "Opción Saludable / Vegetariano", items: "Ensalada de espinacas y fresas, lasaña de verduras, brocheta de frutas" }
  ];

  const safeFormatDate = (dateVal: any): string => {
    if (!dateVal) return new Date().toISOString().split("T")[0];
    if (typeof dateVal === "string") return dateVal;
    if (dateVal && typeof dateVal === "object" && typeof dateVal.toDate === "function") {
      try {
        return dateVal.toDate().toISOString().split("T")[0];
      } catch (e) {}
    }
    if (dateVal && typeof dateVal === "object" && dateVal.seconds !== undefined) {
      try {
        return new Date(dateVal.seconds * 1000).toISOString().split("T")[0];
      } catch (e) {}
    }
    return String(dateVal);
  };

  const handleCopyShareLink = (eventId: string) => {
    const url = `${window.location.origin}/?share=${eventId}`;
    navigator.clipboard.writeText(url);
    alert(`¡Enlace del Portal del Anfitrión copiado al portapapeles!\n\n${url}`);
  };

  useEffect(() => {
    if (!db) return;

    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      const list: EventData[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          title: data.title || "Evento Sin Nombre",
          date: safeFormatDate(data.date),
          guestLimit: data.guestLimit || data.guestsCount || 150,
          status: data.status || "borrador",
          openSeatingMode: data.openSeatingMode !== undefined ? data.openSeatingMode : false,
          clientInfo: data.clientInfo || { name: "", phone: "", email: "", rfc: "", address: "" },
          menu: data.menu || "",
          packageName: data.packageName || "Paquete Básico Imperial",
          packagePrice: Number(data.packagePrice) || 350,
          fixedServices: data.fixedServices || [],
          discountPercent: data.discountPercent || 0,
          discountFixed: data.discountFixed || 0,
          enableBalcony: data.enableBalcony || false,
          paidAmount: data.paidAmount || 0,
        });
      });

      if (snapshot.empty) {
        // Initial Seeding of Mock Events
        const defaults: EventData[] = [
          {
            id: "event-123",
            title: "Gran Gala SocialesVIP",
            date: "2026-07-15",
            guestLimit: 250,
            status: "contrato",
            openSeatingMode: "hibrido",
            enableBalcony: true,
            paidAmount: 45000,
            clientInfo: {
              name: "Sofía Montenegro",
              phone: "555-402-9988",
              email: "sofia.m@example.com",
              rfc: "MONS880715H02",
              address: "Av. Las Lomas #450, Ciudad VIP"
            },
            menu: "Espagueti al burro, lomo adobado, papas al gratin",
            fixedServices: [
              { name: "DJ Premium & Cabina Pro", price: 1200 },
              { name: "Banquete Gourmet 3 tiempos", price: 2500 }
            ],
            discountPercent: 10,
            discountFixed: 0
          },
          {
            id: "event-456",
            title: "XV Años de Valeria",
            date: "2026-08-20",
            guestLimit: 180,
            status: "pre-reserva",
            openSeatingMode: false,
            clientInfo: {
              name: "Carlos Mendoza",
              phone: "555-223-9090",
              email: "carlos.m@example.com",
              rfc: "MENC750820T12",
              address: "Col. Campestre #120, Ciudad VIP"
            },
            menu: "Ensalada César con pollo, pechuga rellena con puré, postre tres leches",
            fixedServices: [
              { name: "Personal de Animación & Hostess", price: 600 }
            ],
            discountPercent: 0,
            discountFixed: 150
          }
        ];
        defaults.forEach(async (ev) => {
          await setDoc(doc(db, "events", ev.id), ev);
        });
        setEvents(defaults);
      } else {
        setEvents(list);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEditClick = (event: EventData) => {
    setEditingEvent(event);
    setIsCreating(false);
    setTitle(event.title);
    setDate(event.date);
    setGuestLimit(event.guestLimit);
    setStatus(event.status);
    setOpenSeatingMode(event.openSeatingMode);
    setClientName(event.clientInfo.name);
    setClientPhone(event.clientInfo.phone);
    setClientEmail(event.clientInfo.email);
    setClientRfc(event.clientInfo.rfc);
    setClientAddress(event.clientInfo.address);
    setMenu(event.menu);
    setPackageName(event.packageName || "Paquete Básico Imperial");
    setPackagePrice(Number(event.packagePrice) || 350);
    setFixedServices(event.fixedServices);
    setDiscountPercent(event.discountPercent);
    setDiscountFixed(event.discountFixed);
    setEnableBalcony(event.enableBalcony || false);
    setPaidAmount(event.paidAmount || 0);
  };

  const handleCreateClick = () => {
    setEditingEvent(null);
    setIsCreating(true);
    setTitle("");
    setDate(new Date().toISOString().split("T")[0]);
    setGuestLimit(150);
    setStatus("borrador");
    setOpenSeatingMode(false);
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setClientRfc("");
    setClientAddress("");
    setMenu("");
    setPackageName("Paquete Básico Imperial");
    setPackagePrice(350);
    setFixedServices([]);
    setDiscountPercent(0);
    setDiscountFixed(0);
    setEnableBalcony(false);
    setPaidAmount(0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    const id = editingEvent ? editingEvent.id : `event-${Date.now()}`;
    
    let targetStatus = status;
    if (status === "pre-reserva" && Number(paidAmount) > 0) {
      targetStatus = "contrato";
      setStatus("contrato");
    }

    const payload: EventData = {
      id,
      title,
      date,
      guestLimit: Number(guestLimit),
      status: targetStatus,
      openSeatingMode,
      clientInfo: {
        name: clientName,
        phone: clientPhone,
        email: clientEmail,
        rfc: clientRfc,
        address: clientAddress
      },
      menu,
      packageName,
      packagePrice: Number(packagePrice),
      fixedServices,
      discountPercent: Number(discountPercent),
      discountFixed: Number(discountFixed),
      enableBalcony,
      paidAmount: Number(paidAmount),
    };

    await setDoc(doc(db, "events", id), payload, { merge: true });
    
    // Also save financial transaction log to Firestore if status became "contrato"
    if (targetStatus === "contrato" && (!editingEvent || editingEvent.status !== "contrato")) {
      const transId = `trans-${id}-${Date.now()}`;
      await setDoc(doc(db, "transactions", transId), {
        id: transId,
        date: new Date().toISOString(),
        concept: `Reserva Contrato: ${title}`,
        amount: 1500, // standard base deposit
        type: "ingreso",
        category: "Eventos"
      });
    }

    setEditingEvent(null);
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    if (window.confirm("¿Seguro que deseas eliminar permanentemente este evento y todos sus registros?")) {
      await deleteDoc(doc(db, "events", id));
    }
  };

  // Add services helpers
  const handleAddService = () => {
    if (!newServiceName || newServicePrice <= 0) return;
    setFixedServices([...fixedServices, { name: newServiceName, price: Number(newServicePrice) }]);
    setNewServiceName("");
    setNewServicePrice(0);
  };

  const handleRemoveService = (idx: number) => {
    const updated = [...fixedServices];
    updated.splice(idx, 1);
    setFixedServices(updated);
  };

  const promoteEventStatus = async (eventId: string, currentStatus: string) => {
    if (!db) return;
    const nextStatusMap: { [key: string]: "cotizacion" | "pre-reserva" | "contrato" } = {
      "borrador": "cotizacion",
      "cotizacion": "pre-reserva",
      "pre-reserva": "contrato"
    };
    const nextStatus = nextStatusMap[currentStatus];
    if (nextStatus) {
      const eventDocRef = doc(db, "events", eventId);
      await updateDoc(eventDocRef, { status: nextStatus });

      if (nextStatus === "contrato") {
        const transId = `trans-${eventId}-${Date.now()}`;
        await setDoc(doc(db, "transactions", transId), {
          id: transId,
          date: new Date().toISOString(),
          concept: `Aprobación Contrato (Pipeline)`,
          amount: 1500,
          type: "ingreso",
          category: "Eventos"
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <span className="text-[10px] text-gold tracking-widest font-semibold uppercase">
            Administración General
          </span>
          <h1 className="text-2xl font-semibold text-white tracking-wide mt-1">
            Gestión Unificada de Eventos
          </h1>
          <p className="text-xs text-gray-500 font-light mt-0.5">
            Crea, modifica y reprograma contratos, reservas, menús de cocina y aforos del salón.
          </p>
        </div>

        <button
          onClick={handleCreateClick}
          className="py-2.5 px-5 bg-gold hover:bg-gold-hover text-obsidian rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 self-start md:self-auto shadow-[0_4px_15px_rgba(212,175,55,0.15)]"
        >
          <Plus className="h-4 w-4" />
          Nuevo Evento / Reserva
        </button>
      </div>

      {/* Editor & List layout split */}
      {isCreating || editingEvent ? (
        <form onSubmit={handleSave} className="glass-dark rounded-2xl border border-white/5 p-6 space-y-6 animate-scale-up max-w-4xl mx-auto">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              {editingEvent ? `Modificar Evento: ${editingEvent.title}` : "Crear Nueva Reserva / Cotización"}
            </h3>
            <button
              type="button"
              onClick={() => {
                setEditingEvent(null);
                setIsCreating(false);
              }}
              className="text-gray-500 hover:text-white text-xs"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section 1: Event Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gold uppercase tracking-wider border-b border-white/5 pb-1">
                Datos del Evento
              </h4>

              <div>
                <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">Título del Evento</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Boda Sofía & Alejandro"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-gold/30"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">Paquete Base de Evento (Precio por Persona)</label>
                <select
                  value={
                    (() => {
                      const pkgsList = dbPackages.length > 0 ? dbPackages : [
                        { name: "Paquete Básico Imperial", price: 350 },
                        { name: "Paquete Premium Imperial", price: 600 },
                        { name: "Paquete VIP Imperial", price: 950 }
                      ];
                      const idx = pkgsList.findIndex(p => p.name === packageName);
                      return idx >= 0 ? idx : "";
                    })()
                  }
                  onChange={(e) => {
                    const pkgsList = dbPackages.length > 0 ? dbPackages : [
                      { name: "Paquete Básico Imperial", price: 350 },
                      { name: "Paquete Premium Imperial", price: 600 },
                      { name: "Paquete VIP Imperial", price: 950 }
                    ];
                    if (e.target.value !== "") {
                      const pkg = pkgsList[Number(e.target.value)];
                      setPackageName(pkg.name);
                      setPackagePrice(pkg.price);
                    }
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-gold/30"
                >
                  {(dbPackages.length > 0 ? dbPackages : [
                    { name: "Paquete Básico Imperial", price: 350 },
                    { name: "Paquete Premium Imperial", price: 600 },
                    { name: "Paquete VIP Imperial", price: 950 }
                  ]).map((pkg, idx) => (
                    <option key={idx} value={idx}>
                      {pkg.name} (${pkg.price.toLocaleString("es-MX")} / Persona)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">Fecha del Evento</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">Aforo Máximo</label>
                  <input
                    type="number"
                    required
                    value={guestLimit}
                    onChange={(e) => setGuestLimit(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">Monto Abonado ($)</label>
                  <input
                    type="number"
                    required
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">Estado de Reserva</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-gold/30"
                  >
                    <option value="borrador">Borrador (Nuevo)</option>
                    <option value="cotizacion">Cotización (Prospecto)</option>
                    <option value="pre-reserva">Pre-reserva (Pendiente)</option>
                    <option value="contrato">Contrato Firmado (Bloqueado)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">Tipo de Aforo en Plano</label>
                  <select
                    value={openSeatingMode === true ? "libre" : openSeatingMode === "hibrido" ? "hibrido" : "fijo"}
                    onChange={(e) => {
                      if (e.target.value === "hibrido") {
                        setOpenSeatingMode("hibrido");
                      } else {
                        setOpenSeatingMode(e.target.value === "libre" ? true : false);
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-gold/30"
                  >
                    <option value="fijo">Asignación Fija (Mesas)</option>
                    <option value="libre">Aforo Libre (Llegada)</option>
                    <option value="hibrido">Híbrido (VIP + Libre)</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <label className="flex items-center gap-2 text-xs text-gray-300 hover:text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enableBalcony}
                    onChange={(e) => setEnableBalcony(e.target.checked)}
                    className="accent-gold rounded border-white/10 bg-black/40 h-4 w-4"
                  />
                  <span className="font-medium text-white">Mesas extras Balcón</span>
                </label>
                <p className="text-[10px] text-gray-400 font-light mt-1 pl-6">
                  Permite habilitar y numerar mesas adicionales en la zona superior del balcón para asignación de invitados.
                </p>
              </div>
            </div>

            {/* Section 2: Client Info */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gold uppercase tracking-wider border-b border-white/5 pb-1">
                Responsable del Contrato
              </h4>

              <div>
                <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sofía Montenegro"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-gold/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">Teléfono</label>
                  <input
                    type="tel"
                    required
                    placeholder="555-123-4567"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="sofia@ejemplo.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-gold/30 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">RFC / DNI</label>
                  <input
                    type="text"
                    placeholder="RFC o ID"
                    value={clientRfc}
                    onChange={(e) => setClientRfc(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30 font-mono uppercase"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">Dirección Física</label>
                  <input
                    type="text"
                    placeholder="Calle, No. Colonia"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Kitchen Menu Configuration */}
          <div className="border-t border-white/5 pt-5 space-y-4">
            <div className="flex items-center gap-2">
              <Utensils className="text-gold h-4 w-4" />
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                Menú de Cocina del Evento
              </h4>
            </div>
            
            {/* Quick Templates Selector */}
            <div className="flex flex-wrap gap-2">
              {menuTemplates.map((tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMenu(tpl.items)}
                  className="px-2.5 py-1 bg-white/5 hover:bg-gold/20 border border-white/10 rounded-lg text-[10px] text-gray-300 hover:text-white transition-all duration-300"
                >
                  Cargar: {tpl.label}
                </button>
              ))}
            </div>

            <div>
              <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">
                Detalle del Menú (Aparecerá en el Cronograma impreso)
              </label>
              <textarea
                rows={3}
                placeholder="Ej. Espagueti al burro, lomo adobado, papas al gratin..."
                value={menu}
                onChange={(e) => setMenu(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold/30 font-light leading-relaxed"
              />
            </div>
          </div>

          {/* Section 4: Preset Fixed Services & Discounts */}
          <div className="border-t border-white/5 pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Services catalog loading */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Briefcase className="text-gold h-4 w-4" />
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Servicios y Adicionales del Evento
                </h4>
              </div>

              {/* Add Custom / Predefined Service */}
              <div className="flex gap-2">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      const item = serviceCatalog[Number(e.target.value)];
                      setNewServiceName(item.name);
                      setNewServicePrice(item.price);
                    }
                  }}
                  className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-gray-400 focus:outline-none focus:border-gold/30 max-w-[150px] shrink-0"
                >
                  <option value="">-- Cargar Catálogo --</option>
                  {serviceCatalog.map((item, idx) => (
                    <option key={idx} value={idx}>{item.name} (${item.price})</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Servicio personalizado"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30"
                />
                <input
                  type="number"
                  placeholder="$ Precio"
                  value={newServicePrice || ""}
                  onChange={(e) => setNewServicePrice(Number(e.target.value))}
                  className="w-20 bg-white/5 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-gold/30 text-right"
                />
                <button
                  type="button"
                  onClick={handleAddService}
                  className="px-3 bg-gold hover:bg-gold-hover text-obsidian rounded-xl text-xs font-bold transition-all"
                >
                  +
                </button>
              </div>

              {/* Services List */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {fixedServices.map((srv, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white/5 border border-white/5 text-xs text-gray-300">
                    <span>{srv.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-gold font-bold">${srv.price}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(idx)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Discounts and Summary Panel */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Percent className="text-gold h-4 w-4" />
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Descuentos y Promociones
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">Descuento (%)</label>
                  <input
                    type="number"
                    max={100}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30 font-mono text-right"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-light uppercase block mb-1">Descuento Fijo ($)</label>
                  <input
                    type="number"
                    value={discountFixed}
                    onChange={(e) => setDiscountFixed(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-gold/30 font-mono text-right"
                  />
                </div>
              </div>

              {/* Total calculations */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs text-gold font-semibold border-b border-white/5 pb-2 mb-2">
                  <span>Concepto</span>
                  <span>Total</span>
                </div>
                
                {/* Base Package Row */}
                <div className="flex justify-between text-[11px] text-white font-medium">
                  <div className="flex flex-col">
                    <span>Costo Base: {packageName}</span>
                    <span className="text-[10px] text-gray-500 font-normal font-mono">(${packagePrice.toFixed(2)} x {guestLimit} Pax)</span>
                  </div>
                  <span className="font-mono">${(packagePrice * guestLimit).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                </div>

                {/* Additional Services */}
                {fixedServices.map((srv, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] text-gray-400 font-light pt-1.5">
                    <span>{srv.name}</span>
                    <span className="font-mono">${srv.price.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
                
                {fixedServices.length > 0 && (
                  <div className="border-t border-white/5 pt-1.5 flex justify-between text-[11px] text-gray-500 font-light">
                    <span>Subtotal Adicionales</span>
                    <span className="font-mono">${fixedServices.reduce((acc, s) => acc + s.price, 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="border-t border-white/5 pt-2 flex flex-col gap-1 text-xs">
                  {/* Calculations variables */}
                  {(() => {
                    const baseCost = packagePrice * guestLimit;
                    const servicesCost = fixedServices.reduce((acc, s) => acc + s.price, 0);
                    const subTotal = baseCost + servicesCost;
                    const pctDiscount = subTotal * discountPercent / 100;
                    const totalNeto = Math.max(0, subTotal - pctDiscount - discountFixed);
                    
                    return (
                      <>
                        {discountPercent > 0 && (
                          <div className="flex justify-between text-red-400">
                            <span>Descuento % ({discountPercent}%)</span>
                            <span className="font-mono">-${pctDiscount.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        {discountFixed > 0 && (
                          <div className="flex justify-between text-red-400">
                            <span>Descuento Fijo</span>
                            <span className="font-mono">-${discountFixed.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-white text-sm pt-2.5 border-t border-white/5">
                          <span>Monto Total Neto</span>
                          <span className="text-gold font-mono">
                            ${totalNeto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
            <button
              type="button"
              onClick={() => {
                setEditingEvent(null);
                setIsCreating(false);
              }}
              className="py-2 px-5 rounded-xl border border-gray-700 hover:bg-white/5 text-xs text-gray-400 uppercase font-semibold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 bg-gold hover:bg-gold-hover text-obsidian rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              <Save className="h-4 w-4 inline mr-1" />
              Guardar Contrato / Cotización
            </button>
          </div>
        </form>
      ) : (
        // List/Pipeline Container
        <div className="space-y-6">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit gap-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`py-1.5 px-4 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${
                viewMode === "kanban" ? "bg-gold text-obsidian" : "text-gray-400 hover:text-white"
              }`}
            >
              Pipeline Kanban
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`py-1.5 px-4 rounded-lg text-xs font-semibold tracking-wide transition-all duration-300 ${
                viewMode === "list" ? "bg-gold text-obsidian" : "text-gray-400 hover:text-white"
              }`}
            >
              Vista Tarjetas
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20 text-xs text-gray-500 font-light flex flex-col items-center gap-3">
              <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              <span>Sincronizando eventos en tiempo real...</span>
            </div>
          ) : viewMode === "list" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((ev) => {
                const baseCost = (ev.packagePrice || 350) * (ev.guestLimit || 150);
                const subTotal = baseCost + ev.fixedServices.reduce((acc, s) => acc + s.price, 0);
                const discount = (subTotal * ev.discountPercent / 100) + ev.discountFixed;
                const total = Math.max(0, subTotal - discount);

                return (
                  <div key={ev.id} className="glass p-5 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-gold/30 hover:shadow-[0_4px_25px_rgba(212,175,55,0.03)] transition-all duration-300 relative group overflow-hidden">
                    <div>
                      {/* Top bar tags */}
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          ev.status === "contrato" 
                            ? "bg-green-500/10 border border-green-500/20 text-green-400"
                            : ev.status === "pre-reserva"
                            ? "bg-gold/10 border border-gold/20 text-gold"
                            : ev.status === "cotizacion"
                            ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                            : "bg-gray-500/10 border border-gray-500/20 text-gray-400"
                        }`}>
                          {ev.status === "contrato" ? "Contrato" : ev.status === "pre-reserva" ? "Pre-reserva" : ev.status === "cotizacion" ? "Cotización" : "Borrador"}
                        </span>

                        <span className="text-[10px] text-gray-400 font-mono font-semibold flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gold" />
                          {ev.date}
                        </span>
                      </div>

                      {/* Title & Client details */}
                      <h3 className="text-base font-semibold text-white group-hover:text-gold transition-colors duration-300">
                        {ev.title}
                      </h3>
                      
                      <div className="mt-4 space-y-1.5 text-xs font-light text-gray-400">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-gray-500" />
                          <span>Responsable: <strong className="text-white font-normal">{ev.clientInfo.name || "Sin registrar"}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Map className="h-3.5 w-3.5 text-gray-500" />
                          <span>Aforo: <strong className="text-white font-normal">{ev.guestLimit} pax ({ev.openSeatingMode === true ? "Aforo Libre" : ev.openSeatingMode === "hibrido" ? "Híbrido" : "Asignación Fija"})</strong></span>
                        </div>
                        {ev.menu && (
                          <div className="flex items-center gap-2">
                            <Utensils className="h-3.5 w-3.5 text-gray-500" />
                            <span className="truncate">Menú: <strong className="text-white font-normal">{ev.menu}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Billing Details & Edit/Delete triggers */}
                    <div className="border-t border-white/5 pt-4 mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-gray-500 block uppercase font-mono">Monto Total</span>
                        <span className="text-gold font-mono font-bold text-base">${total.toFixed(2)}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyShareLink(ev.id)}
                          className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition-all duration-300"
                          title="Copiar Enlace del Portal del Anfitrión"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(ev)}
                          className="p-2 rounded-lg bg-gold/10 hover:bg-gold/25 border border-gold/20 text-gold transition-all duration-300"
                          title="Editar / Modificar Evento"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all duration-300"
                          title="Eliminar Evento"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {events.length === 0 && (
                <div className="col-span-2 text-center py-20 text-xs text-gray-500 italic">
                  No hay contratos o reservas registradas en el sistema.
                </div>
              )}
            </div>
          ) : (
            // Visual Kanban Board columns grid
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column 1: Cotizaciones (includes borradores) */}
              <div className="glass-dark border border-white/5 rounded-2xl p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                    Cotizaciones ({events.filter(e => e.status === "cotizacion" || e.status === "borrador").length})
                  </span>
                </div>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {events.filter(e => e.status === "cotizacion" || e.status === "borrador").map((ev) => {
                    const baseCost = (ev.packagePrice || 350) * (ev.guestLimit || 150);
                    const subTotal = baseCost + ev.fixedServices.reduce((acc, s) => acc + s.price, 0);
                    const total = Math.max(0, subTotal * (1 - ev.discountPercent / 100) - ev.discountFixed);
                    return (
                      <div key={ev.id} className="glass p-4 rounded-xl border border-white/5 hover:border-gold/20 transition-all space-y-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-semibold text-white truncate">{ev.title}</h4>
                            {ev.status === "borrador" && (
                              <span className="text-[8px] px-1.5 py-0.5 rounded bg-gray-500/15 border border-gray-500/25 text-gray-400 uppercase font-bold tracking-wider shrink-0">Borrador</span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">{ev.date} • {ev.clientInfo.name}</p>
                          <span className="text-[11px] font-mono text-gold font-semibold block mt-2">${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-white/5 pt-2">
                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => handleEditClick(ev)}
                              className="text-[10px] text-gray-400 hover:text-white"
                            >
                              Detalles
                            </button>
                            <button
                              onClick={() => handleCopyShareLink(ev.id)}
                              className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                              title="Copiar Enlace Portal Anfitrión"
                            >
                              <Share2 className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => promoteEventStatus(ev.id, ev.status)}
                            className="px-2 py-1 bg-gold/10 hover:bg-gold text-gold hover:text-obsidian rounded text-[9px] uppercase font-bold tracking-wider transition-colors flex items-center gap-1"
                          >
                            {ev.status === "borrador" ? "Cotizar" : "Reservar"} <ArrowRight className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {events.filter(e => e.status === "cotizacion" || e.status === "borrador").length === 0 && (
                    <p className="text-[11px] text-gray-600 italic text-center py-4">Sin cotizaciones</p>
                  )}
                </div>
              </div>

              {/* Column 2: Pre-reservas */}
              <div className="glass-dark border border-white/5 rounded-2xl p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs font-semibold text-gold uppercase tracking-wider">
                    Pre-reservas ({events.filter(e => e.status === "pre-reserva").length})
                  </span>
                </div>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {events.filter(e => e.status === "pre-reserva").map((ev) => {
                    const baseCost = (ev.packagePrice || 350) * (ev.guestLimit || 150);
                    const subTotal = baseCost + ev.fixedServices.reduce((acc, s) => acc + s.price, 0);
                    const total = Math.max(0, subTotal * (1 - ev.discountPercent / 100) - ev.discountFixed);
                    return (
                      <div key={ev.id} className="glass p-4 rounded-xl border border-gold/10 hover:border-gold/30 transition-all space-y-3">
                        <div>
                          <h4 className="text-xs font-semibold text-white truncate">{ev.title}</h4>
                          <p className="text-[10px] text-gray-400 mt-1">{ev.date} • {ev.clientInfo.name}</p>
                          <span className="text-[11px] font-mono text-gold font-semibold block mt-2">${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-white/5 pt-2">
                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => handleEditClick(ev)}
                              className="text-[10px] text-gray-400 hover:text-white"
                            >
                              Detalles
                            </button>
                            <button
                              onClick={() => handleCopyShareLink(ev.id)}
                              className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                              title="Copiar Enlace Portal Anfitrión"
                            >
                              <Share2 className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => promoteEventStatus(ev.id, "pre-reserva")}
                            className="px-2 py-1 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-obsidian border border-green-500/20 rounded text-[9px] uppercase font-bold tracking-wider transition-colors flex items-center gap-1"
                          >
                            Firmar Contrato <ArrowRight className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {events.filter(e => e.status === "pre-reserva").length === 0 && (
                    <p className="text-[11px] text-gray-600 italic text-center py-4">Sin pre-reservas</p>
                  )}
                </div>
              </div>

              {/* Column 3: Contratos */}
              <div className="glass-dark border border-white/5 rounded-2xl p-4 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">
                    Contratos Firmados ({events.filter(e => e.status === "contrato").length})
                  </span>
                </div>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {events.filter(e => e.status === "contrato").map((ev) => {
                    const baseCost = (ev.packagePrice || 350) * (ev.guestLimit || 150);
                    const subTotal = baseCost + ev.fixedServices.reduce((acc, s) => acc + s.price, 0);
                    const total = Math.max(0, subTotal * (1 - ev.discountPercent / 100) - ev.discountFixed);
                    return (
                      <div key={ev.id} className="glass p-4 rounded-xl border border-green-500/10 hover:border-green-500/30 transition-all space-y-3">
                        <div>
                          <h4 className="text-xs font-semibold text-white truncate">{ev.title}</h4>
                          <p className="text-[10px] text-gray-400 mt-1">{ev.date} • {ev.clientInfo.name}</p>
                          <span className="text-[11px] font-mono text-emerald-400 font-semibold block mt-2">${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-white/5 pt-2">
                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => handleEditClick(ev)}
                              className="text-[10px] text-gray-400 hover:text-white"
                            >
                              Detalles
                            </button>
                            <button
                              onClick={() => handleCopyShareLink(ev.id)}
                              className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                              title="Copiar Enlace Portal Anfitrión"
                            >
                              <Share2 className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="text-[9px] text-green-400 font-bold uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                            Confirmado
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {events.filter(e => e.status === "contrato").length === 0 && (
                    <p className="text-[11px] text-gray-600 italic text-center py-4">Sin contratos firmados</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
