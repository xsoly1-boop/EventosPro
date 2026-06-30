"use client";

import { useEffect, useState } from "react";
import { 
  collection, 
  doc, 
  onSnapshot, 
  updateDoc, 
  writeBatch, 
  query, 
  getDocs,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface FirestoreGuest {
  id: string;
  name: string;
  tickets: number;
  tableId: number | null; // number represents tableNumber, null represents unassigned
  seatIndex: number | null; // index of the seat at the table
}

export function useEventTables(eventId: string = "event-123") {
  const [guests, setGuests] = useState<FirestoreGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Listen to Guests in Real-Time
  useEffect(() => {
    if (!db) return;

    setLoading(true);
    const guestsRef = collection(db, "events", eventId, "guests");

    const unsubscribe = onSnapshot(
      guestsRef,
      (snapshot) => {
        const guestsList: FirestoreGuest[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          guestsList.push({
            id: doc.id,
            name: data.name || "Invitado Sin Nombre",
            tickets: data.tickets || 1,
            tableId: data.tableId !== undefined ? data.tableId : null,
            seatIndex: data.seatIndex !== undefined ? data.seatIndex : null,
          });
        });
        setGuests(guestsList);
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to guests:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [eventId]);

  // 2. Assign Guest to Seat in Firestore
  const assignGuest = async (guestId: string, tableNumber: number, seatIndex: number) => {
    if (!db) return;
    try {
      // First, check if someone else is in that seat and unassign them (if any)
      const seatConflict = guests.find(
        (g) => g.tableId === tableNumber && g.seatIndex === seatIndex
      );

      const batch = writeBatch(db);

      if (seatConflict) {
        const conflictDocRef = doc(db, "events", eventId, "guests", seatConflict.id);
        batch.update(conflictDocRef, { tableId: null, seatIndex: null });
      }

      // Update target guest
      const guestDocRef = doc(db, "events", eventId, "guests", guestId);
      batch.update(guestDocRef, { tableId: tableNumber, seatIndex: seatIndex });

      await batch.commit();
    } catch (err) {
      console.error("Error assigning guest:", err);
      throw err;
    }
  };

  // 3. Unassign Guest from Seat in Firestore
  const unassignGuest = async (tableNumber: number, seatIndex: number) => {
    if (!db) return;
    try {
      const assignedGuest = guests.find(
        (g) => g.tableId === tableNumber && g.seatIndex === seatIndex
      );

      if (assignedGuest) {
        const guestDocRef = doc(db, "events", eventId, "guests", assignedGuest.id);
        await updateDoc(guestDocRef, {
          tableId: null,
          seatIndex: null,
        });
      }
    } catch (err) {
      console.error("Error unassigning guest:", err);
      throw err;
    }
  };

  // 4. Seed Mock Data to Firestore if Empty
  const seedMockData = async () => {
    if (!db) return;
    try {
      const guestsRef = collection(db, "events", eventId, "guests");
      const q = query(guestsRef, limit(1));
      const querySnapshot = await getDocs(q);

      // Only seed if no guests exist
      if (querySnapshot.empty) {
        const batch = writeBatch(db);
        const mockGuests = [
          { name: "Sr. y Sra. Arriaga", tickets: 2 },
          { name: "Lic. Alejandro Torres", tickets: 1 },
          { name: "Dra. Sofía Mendoza", tickets: 1 },
          { name: "Ing. Roberto Garza", tickets: 1 },
          { name: "Familia Villareal (5 pax)", tickets: 5 },
          { name: "Srita. Elena Montes", tickets: 1 },
          { name: "Dr. Carlos Fuentes", tickets: 2 },
          { name: "Gabriela Leyva", tickets: 1 },
          { name: "Familia Peralta (4 pax)", tickets: 4 },
          { name: "Arq. Manuel Ortiz", tickets: 1 },
          { name: "Lic. Clara Salazar", tickets: 2 },
          { name: "Ing. Damián Herrera", tickets: 1 },
          { name: "Familia Valenzuela (6 pax)", tickets: 6 },
          { name: "Dra. Patricia Luna", tickets: 1 },
          { name: "Sra. Mercedes Silva", tickets: 2 },
        ];

        mockGuests.forEach((g, idx) => {
          const newDocRef = doc(collection(db, "events", eventId, "guests"));
          batch.set(newDocRef, {
            name: g.name,
            tickets: g.tickets,
            tableId: null,
            seatIndex: null,
          });
        });

        // Initialize event metadata as well
        const eventDocRef = doc(db, "events", eventId);
        batch.set(eventDocRef, {
          title: "Gran Gala SocialesVIP",
          date: new Date(),
          guestLimit: 250,
        }, { merge: true });

        await batch.commit();
        console.log("Mock data successfully seeded to Firestore!");
      }
    } catch (err) {
      console.error("Error seeding mock data:", err);
    }
  };

  return {
    guests,
    loading,
    error,
    assignGuest,
    unassignGuest,
    seedMockData,
  };
}
