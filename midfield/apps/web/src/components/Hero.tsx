import Link from "next/link";
import { Button } from "./ui/Button";
import { Flame, TrendingUp, MessageSquare } from "lucide-react";
import { useAuthModal } from "./ui/useAuthModal";

export function Hero() {
    const { openAuthModal } = useAuthModal();

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900">
            <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />

            <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
                <div className="text-center space-y-6">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-neutral-100">
                        The home of <span className="text-emerald-600 dark:text-emerald-400">football takes</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 dark:text-neutral-400">
                        Share your hottest takes, engage in lively debates, and connect with fans around the world.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                        <Button
                            size="lg"
                            onClick={() => openAuthModal()}
                            className="font-semibold gap-2"
                        >
                            <MessageSquare className="w-5 h-5" />
                            Join the conversation
                        </Button>
                        <Link href="/about">
                            <Button variant="outline" size="lg">
                                How it works
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
