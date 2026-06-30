"use client";

import QRScanner from "@/components/modules/scanner/QRScanner";

export default function ScannerPage() {
  return (
    <div className="min-h-screen bg-obsidian">
      <QRScanner />
    </div>
  );
}
