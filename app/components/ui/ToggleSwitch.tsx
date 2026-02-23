export default function ToggleSwitch({
  value,
  onChange,
  className = "",
  style = {},
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-20 h-10 rounded-full transition flex items-center ${className}`}
      style={{
        background: value ? "#2563EB" : "#EF4444", // ANZENブルー / 赤
        padding: "4px",
        borderRadius: "9999px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        ...style,
      }}
    >
      <div
        className="bg-white rounded-full shadow transition-transform"
        style={{
          width: "32px",
          height: "32px",
          transform: value ? "translateX(40px)" : "translateX(0px)",
        }}
      ></div>
    </button>
  );
}
