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

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ja" style={{ height: "100%", margin: 0, padding: 0 }}>
      <body
        className={noto.className}
        style={{
          height: "100dvh",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header title="ANZEN" />

        <main
          style={{
            flex: 1,
            position: "relative",
            height: "100%",
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
