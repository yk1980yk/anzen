'use client'

export default function NotificationBanner({ message, level }) {
  if (!message) return null

  const bgColor =
    level === 3
      ? 'bg-red-600'
      : level === 2
      ? 'bg-orange-500'
      : 'bg-yellow-400'

  return (
    <div
      className={`${bgColor} text-white px-4 py-3 rounded shadow-md fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999]`}
    >
      {message}
    </div>
  )
}
