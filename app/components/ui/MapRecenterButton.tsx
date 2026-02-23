"use client";

export default function MapRecenterButton({
  onClick,
  className = "",
  style = {},
}: {
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center ${className}`}
      style={{
        position: "absolute",
        bottom: "120px",
        right: "16px",
        width: "48px",
        height: "48px",
        background: "white",
        borderRadius: "14px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        fontSize: "22px",
        zIndex: 9999,
        ...style,
      }}
    >
      📍
    </button>
  );
}
