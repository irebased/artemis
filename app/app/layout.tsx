import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { Analytics } from "@vercel/analytics/next"


export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7230406387622460" crossOrigin="anonymous" />
      </head>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Analytics />
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <div className="rounded-lg bg-yellow-800 bg-opacity-40 m-8 p-2 border-yellow-700 border-2 flex-col">
                <h2 className="text-xl font-bold">Artemis 1.0 end of life</h2>
                Thank you for using the Artemis dashboard project! As of February 4, 2026, this version
                is no longer being maintained and may contain bugs. "Artemis 2.0" is called
                CipherInspector and has officially launched. The comparable tool to this dashbaord can be
                found&nbsp;<a href="https://app.cipherinspector.com/playground" target="_blank" className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600">here.</a>
                &nbsp;Thank you for your support!
            </div>
            <main className="margin-auto px-16 pt-8 flex-grow w-100">
              {children}
            </main>
            <footer className="w-full border-t border-divider">
              <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="text-center text-default-600">
                  <p>
                    Made with <span className="text-red-500">♥</span> by{" "}
                    <a
                      href="https://github.com/irebased"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 underline-offset-2 underline"
                    >
                      rebase
                    </a>
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
