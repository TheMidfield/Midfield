"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AuthModal } from "./AuthModal";

export type AuthContext = "take" | "reply" | "bookmark" | "default";

interface AuthModalContextType {
    isAuthModalOpen: boolean;
    authModalContext: AuthContext;
    openAuthModal: (context?: AuthContext, mode?: "signin" | "signup") => void;
    closeAuthModal: () => void;
    requireAuth: (isAuthenticated: boolean, context?: AuthContext) => boolean;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalContext, setAuthModalContext] = useState<AuthContext>("default");
    const [initialMode, setInitialMode] = useState<"signin" | "signup">("signup");

    const openAuthModal = useCallback((context: AuthContext = "default", mode: "signin" | "signup" = "signup") => {
        setAuthModalContext(context);
        setInitialMode(mode);
        setIsAuthModalOpen(true);
    }, []);

    const closeAuthModal = useCallback(() => {
        setIsAuthModalOpen(false);
    }, []);

    const requireAuth = useCallback((isAuthenticated: boolean, context: AuthContext = "default"): boolean => {
        if (!isAuthenticated) {
            openAuthModal(context);
            return false;
        }
        return true;
    }, [openAuthModal]);

    return (
        <AuthModalContext.Provider
            value={{
                isAuthModalOpen,
                authModalContext,
                openAuthModal,
                closeAuthModal,
                requireAuth,
            }}
        >
            {children}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={closeAuthModal}
                context={authModalContext}
                initialMode={initialMode}
            />
        </AuthModalContext.Provider>
    );
}

export function useAuthModal() {
    const context = useContext(AuthModalContext);
    if (context === undefined) {
        throw new Error("useAuthModal must be used within an AuthModalProvider");
    }
    return context;
}
