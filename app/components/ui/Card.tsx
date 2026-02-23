export default function Card({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`p-4 bg-white rounded-xl shadow-soft ${className}`}
      style={{
        borderRadius: "14px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
