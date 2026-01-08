import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LayoutContent } from "@/components/LayoutContent";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SearchProvider } from "@/context/SearchContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { GlobalSearchLayout } from "@/components/GlobalSearchLayout";
import { OnboardingProvider } from "@/components/OnboardingProvider";
import { GlobalWelcomeModal } from "@/components/GlobalWelcomeModal";
import { AuthModalProvider } from "@/components/ui/AuthModalProvider";
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
    metadataBase: new URL("https://midfield.one"), // Replace with actual production URL
    openGraph: {
        title: "Midfield",
        description: "The intelligent football platform bridging stats and community.",
        url: "https://midfield.one",
        siteName: "Midfield",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Midfield",
        description: "The intelligent football platform bridging stats and community.",
        creator: "@midfield_ai",
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#171717' },
    ],
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
                            if (theme === 'dark' || !theme) {
                                root.classList.add('dark');
                            }
                        } catch (e) {}
                    })();
                `
                }} />
            </head>
            <body className="min-h-screen antialiased selection:bg-emerald-100 dark:selection:bg-emerald-900/50 flex flex-col">
                <ThemeProvider>
                    <AuthModalProvider>
                        <SearchProvider>
                            <NotificationProvider>
                                <OnboardingProvider>
                                    <div className="flex flex-col min-h-screen">
                                        <Suspense>
                                            <Navbar />
                                        </Suspense>

                                        <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 pt-24 sm:pt-28 pb-12 sm:pb-16">
                                            <GlobalSearchLayout>
                                                <LayoutContent>
                                                    {children}
                                                </LayoutContent>
                                            </GlobalSearchLayout>
                                        </div>

                                        <Footer className="mt-16" />
                                    </div>
                                    <GlobalWelcomeModal />
                                </OnboardingProvider>
                            </NotificationProvider>
                        </SearchProvider>
                    </AuthModalProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
