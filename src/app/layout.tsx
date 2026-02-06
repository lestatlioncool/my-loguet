import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "文子と洋一の旅行記",
  description: "二人の大切な旅行の記録",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          precedence="default"
        />
      </head>
      <body className="bg-indigo-50 min-h-screen pb-24 text-gray-700 font-sans selection:bg-indigo-100 selection:text-indigo-800">
        <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-indigo-50">
          <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="font-bold text-indigo-800 text-base sm:text-lg flex items-center whitespace-nowrap overflow-hidden">
              <span>文子と洋一の旅行記</span>
            </h1>
          </div>
        </header>
        <main className="max-w-3xl mx-auto p-4 space-y-6">
          {children}
        </main>
      </body>
    </html>
  );
}