export default function PrimaryButton({
  children,
  onClick,
  variant = "primary",
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "danger" | "elderly" | "white";
  className?: string;
  style?: React.CSSProperties;
}) {
  const colors = {
    primary: {
      background: "#1976D2", // ANZENブルー
      color: "white",
      border: "none",
    },
    danger: {
      background: "#E53935", // 災害モード赤
      color: "white",
      border: "none",
    },
    elderly: {
      background: "linear-gradient(135deg, #F5A623, #F76B1C)", // 高齢者オレンジ
      color: "white",
      border: "none",
    },
    white: {
      background: "white",
      color: "#333",
      border: "1px solid #ddd",
    },
  };

  return (
    <button
      onClick={onClick}
      className={`w-full font-semibold rounded-xl shadow-soft ${className}`}
      style={{
        height: "52px",
        borderRadius: "14px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        background: colors[variant].background,
        color: colors[variant].color,
        border: colors[variant].border,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
