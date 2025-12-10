import { Navbar } from "@/components/Navbar";
import { RightPanel } from "@/components/RightPanel";
import "./globals.css";
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: "Midfield",
    description: "The structured home for intelligent football discussion.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
            <body className="min-h-screen bg-background antialiased selection:bg-primary/20 flex flex-col">
                <Navbar />

                <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 py-8 items-start min-h-[calc(100vh-4rem)]">
                        {/* Main Content (now full width on left, with right sidebar widgets) */}
                        <main className="flex-1 min-w-0">
                            {children}
                        </main>

                        {/* Right Widgets - Desktop */}
                        <RightPanel />
                    </div>
                </div>
            </body>
        </html>
    );
}
