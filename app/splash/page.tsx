"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 1500); // 1.5秒後にログインへ

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Image
        src="/logos/logo-login.png"
        alt="ANZEN Splash Logo"
        width={220}
        height={220}
        priority
        className="animate-pulse"
      />
    </div>
  );
}
