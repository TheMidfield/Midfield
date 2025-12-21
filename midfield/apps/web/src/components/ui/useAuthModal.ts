"use client";

import { useState, useCallback } from "react";

export type AuthContext = "take" | "reply" | "bookmark" | "default";

interface UseAuthModalReturn {
    /** Whether the auth modal is currently open */
    isAuthModalOpen: boolean;
    /** The context for why we're showing the modal */
    authModalContext: AuthContext;
    /** Open the auth modal with optional context */
    openAuthModal: (context?: AuthContext) => void;
    /** Close the auth modal */
    closeAuthModal: () => void;
    /** 
     * Check if user is authenticated, if not, show auth modal.
     * Returns true if authenticated, false if not (and shows modal)
     */
    requireAuth: (isAuthenticated: boolean, context?: AuthContext) => boolean;
}

/**
 * Hook to manage auth modal state and authentication checks
 * 
 * @example
 * const { isAuthModalOpen, authModalContext, requireAuth, closeAuthModal } = useAuthModal();
 * 
 * const handleTakeClick = () => {
 *   if (!requireAuth(!!user, "take")) return;
 *   // User is authenticated, proceed...
 * };
 * 
 * // In JSX:
 * <AuthModal 
 *   isOpen={isAuthModalOpen} 
 *   onClose={closeAuthModal}
 *   context={authModalContext}
 * />
 */
export function useAuthModal(): UseAuthModalReturn {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalContext, setAuthModalContext] = useState<AuthContext>("default");

    const openAuthModal = useCallback((context: AuthContext = "default") => {
        setAuthModalContext(context);
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

    return {
        isAuthModalOpen,
        authModalContext,
        openAuthModal,
        closeAuthModal,
        requireAuth,
    };
}
