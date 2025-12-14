import { Navbar } from "@/components/Navbar";
import { RightPanel } from "@/components/RightPanel";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans, Onest } from "next/font/google";

const dmSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-dm-sans",
});

const onest = Onest({
    subsets: ["latin"],
    variable: "--font-onest",
});

export const metadata: Metadata = {
    title: "Midfield",
    description: "Football intelligence platform",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${dmSans.variable} ${onest.variable}`} suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{
                    __html: `
                    (function () {
                        try {
                            var theme = localStorage.getItem('midfield-theme');
                            var root = document.documentElement;
                            root.classList.remove('dark');
                            if (theme === 'dark') {
                                root.classList.add('dark');
                            }
                        } catch (e) {}
                    })();
                `
                }} />
            </head>
            <body className="min-h-screen antialiased selection:bg-emerald-100 dark:selection:bg-emerald-900/50 flex flex-col">
                <ThemeProvider>
                    <Navbar />

                    <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                            {/* Main Content */}
                            <main className="flex-1 min-w-0 w-full">
                                {children}
                            </main>

                            {/* Right Widgets - Desktop */}
                            <aside className="hidden lg:block w-[320px] shrink-0 sticky top-20">
                                <RightPanel />
                            </aside>
                        </div>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
