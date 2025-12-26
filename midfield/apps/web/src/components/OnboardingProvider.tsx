"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { OnboardingWizard } from "./OnboardingWizard";
import { useRouter } from "next/navigation";

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkOnboarding = async () => {
            const supabase = createClient();

            // Get current user
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

    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
        router.refresh();
    };

    if (isChecking) {
        return null; // Or a loading spinner
    }

    return (
        <>
            {showOnboarding && userId && (
                <OnboardingWizard
                    userId={userId}
                    userEmail={userEmail || undefined}
                    onComplete={handleOnboardingComplete}
                />
            )}
            {children}
        </>
    );
}
