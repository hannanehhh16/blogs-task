import type { Metadata } from "next";
import { Geist, Newsreader } from "next/font/google";
import "./globals.css";

const sans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const serif = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s · Placeholder Journal",
    default: "Placeholder Journal",
  },
  description: "Posts and authors from the JSONPlaceholder API.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink">
        <a
          href="#main-content"
          className="sr-only rounded-md bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
        >
          Skip to content
        </a>

        <header className="border-b border-rule">
          <div className="mx-auto flex max-w-5xl items-baseline justify-between px-4 py-5 sm:px-6">
            <p className="font-serif text-xl font-semibold tracking-tight">
              Placeholder Journal
            </p>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>

        <footer className="border-t border-rule">
          <p className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted sm:px-6">
            Content from{" "}
            <a
              href="https://jsonplaceholder.typicode.com"
              className="underline underline-offset-4 hover:text-ink"
            >
              JSONPlaceholder
            </a>
            .
          </p>
        </footer>
      </body>
    </html>
  );
}
