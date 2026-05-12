import "./globals.css";
import "leaflet/dist/leaflet.css";
import { ReactNode } from "react";
import { Noto_Sans_JP } from "next/font/google";
import Header from "./components/Header";

const noto = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "ANZEN - あなたの安全を、いつでもどこでも",
  description:
    "ANZEN は、危険エリアの共有・通知・地図表示を通じて、あなたの安全を守るためのコミュニティアプリです。",
  keywords: ["ANZEN", "安全", "防犯", "危険エリア", "地図", "通知"],
  manifest: "/manifest.json",
  themeColor: "#1E90FF",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ANZEN",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" style={{ height: "100%", margin: 0, padding: 0 }}>
      <head>
        {/* ★ iPhone が PWA と認識するために必須 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="ANZEN" />

        {/* ★ ホーム画面アイコン（必須） */}
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* ★ PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* ★ iOS のズーム抑制（UI がズレない） */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>

      <body
        className={noto.className}
        style={{
          height: "100dvh",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          background: "#fff",
        }}
      >
        <Header title="ANZEN" />

        <main
          style={{
            flex: 1,
            position: "relative",
            height: "100%",
            overflow: "hidden",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
