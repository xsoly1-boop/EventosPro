"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center text-gold font-light text-xs uppercase tracking-widest">
      Redireccionando...
    </div>
  );
}
