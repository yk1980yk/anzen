"use client";

import { useEffect } from "react";

export default function NotificationBanner({
  message,
  subMessage,
  variant = "info",
  position = "center",
  duration = 3000,
  onClose,
}: {
  message: string;
  subMessage?: string;
  variant?: "info" | "success" | "warning" | "danger";
  position?: "top" | "center" | "bottom";
  duration?: number;
  onClose?: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose && onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    info: "#1976D2",
    success: "#27AE60",
    warning: "#E67E22",
    danger: "#E53935",
  };

  const positions = {
    top: { top: "20px" },
    center: { top: "30%" },
    bottom: { bottom: "20px" },
  };

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "20px 26px",
        background: "white",
        borderRadius: "14px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        zIndex: 9999,
        textAlign: "center",
        width: "85%",
        maxWidth: "360px",
        ...positions[position],
      }}
    >
      <div
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          color: colors[variant],
        }}
      >
        {message}
      </div>

      {subMessage && (
        <div style={{ fontSize: "14px", marginTop: "6px", color: "#555" }}>
          {subMessage}
        </div>
      )}
    </div>
  );
}
