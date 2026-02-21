import "./globals.css";
import { Noto_Sans_JP } from "next/font/google";

const noto = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "ANZEN - あなたの安全を、いつでもどこでも",
  description:
    "ANZEN は、危険エリアの共有・通知・地図表示を通じて、あなたの安全を守るためのコミュニティアプリです。",
  keywords: ["ANZEN", "安全", "防犯", "危険エリア", "地図", "通知"],
  openGraph: {
    title: "ANZEN - あなたの安全を、いつでもどこでも",
    description:
      "危険エリアの共有・通知・地図表示を通じて、あなたの安全を守るアプリ。",
    url: "https://your-domain.com",
    siteName: "ANZEN",
    images: [
      {
        url: "/ogp.png",
        width: 1200,
        height: 630,
        alt: "ANZEN OGP Image",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ANZEN - あなたの安全を、いつでもどこでも",
    description:
      "危険エリアの共有・通知・地図表示を通じて、あなたの安全を守るアプリ。",
    images: ["/ogp.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className={noto.className}>{children}</body>
    </html>
  );
}
