"use client";

import { useState, useEffect } from "react";
import { WelcomeModal } from "@/components/notifications/WelcomeModal";

/**
 * Global Welcome Modal Handler
 * Listens for dev:open-welcome-modal events and shows the welcome modal
 * regardless of authentication status (unlike NotificationBell which only renders when logged in)
 */
export function GlobalWelcomeModal() {
    const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);

    useEffect(() => {
        const handleOpenWelcome = () => setIsWelcomeOpen(true);
        window.addEventListener('dev:open-welcome-modal', handleOpenWelcome);
        return () => window.removeEventListener('dev:open-welcome-modal', handleOpenWelcome);
    }, []);

    return (
        <WelcomeModal
            isOpen={isWelcomeOpen}
            onClose={() => setIsWelcomeOpen(false)}
        />
    );
}
