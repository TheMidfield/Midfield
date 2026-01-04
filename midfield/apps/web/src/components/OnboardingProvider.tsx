"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { OnboardingWizard } from "./OnboardingWizard";
import { useRouter } from "next/navigation";

// Define Context
export const OnboardingContext = createContext<{ isOnboardingOpen: boolean }>({ isOnboardingOpen: false });

// Hook for consuming
export const useOnboarding = () => useContext(OnboardingContext);

import { useNotification } from "@/context/NotificationContext"; // Add import

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(true);
    const router = useRouter();
    const { triggerWelcomeToast } = useNotification(); // Consume context

    // 1. Auth & Onboarding Check Effect (Runs once on mount + auth changes)
    useEffect(() => {
        const checkOnboarding = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setIsChecking(false);
                return;
            }

            setUserId(user.id);
            setUserEmail(user.email || null);

            // Check if user has completed onboarding
            const { data: profile } = await supabase
                .from('users')
                .select('onboarding_completed, username')
                .eq('id', user.id)
                .maybeSingle();

            if (!profile || !profile.onboarding_completed || !profile.username) {
                setShowOnboarding(true);
            }

            setIsChecking(false);
        };

        checkOnboarding();

        // Subscribe to auth changes
        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                checkOnboarding();
            } else {
                setShowOnboarding(false);
                setUserId(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // 2. Dev Trigger Effect (Re-binds when userId changes)
    useEffect(() => {
        const handleDevTrigger = () => {
            setShowOnboarding(true);
            // If user is not logged in, we might need a dummy ID for testing wizard visual, 
            // but wizard requires userId prop. 
            // If logged in, use real ID. If not, use dummy.
            if (!userId) {
                setUserId('dev-test-user');
            }
        };

        window.addEventListener('dev:open-onboarding', handleDevTrigger);
        return () => window.removeEventListener('dev:open-onboarding', handleDevTrigger);
    }, [userId]);

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
        triggerWelcomeToast();
        router.refresh();
    };

    // Non-blocking render to ensure SEO/Crawlers can see page content immediately
    // if (isChecking) {
    //     return null; 
    // }

    return (
        <OnboardingContext.Provider value={{ isOnboardingOpen: showOnboarding }}>
            {showOnboarding && userId && (
                <OnboardingWizard
                    userId={userId}
                    userEmail={userEmail || undefined}
                    onComplete={handleOnboardingComplete}
                />
            )}
            {children}
        </OnboardingContext.Provider>
    );
}
