import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Activity, Users, ArrowRight, Trophy } from "lucide-react"

const clubCardVariants = cva(
    "group relative flex flex-row items-center gap-4 bg-white dark:bg-neutral-900 rounded-lg transition-all duration-300 cursor-pointer overflow-hidden",
    {
        variants: {
            variant: {
                default: "border-2 border-slate-200 dark:border-neutral-800 hover:border-slate-400 dark:hover:border-neutral-600",
                highlight: "border-2 border-emerald-200 dark:border-emerald-900 hover:border-emerald-400 dark:hover:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20",
                interactive: "border-2 border-slate-200 dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-neutral-800/50"
            },
            size: {
                default: "p-4 min-h-[100px]",
                compact: "p-3 min-h-[85px]",
                large: "p-5 min-h-[120px]"
            }
        },
        defaultVariants: {
            variant: "interactive",
            size: "default"
        }
    }
)

export interface ClubCardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof clubCardVariants> {
    name: string
    league?: string
    country?: string
    badgeUrl?: string
    followers?: string | number
    activityLevel?: "low" | "medium" | "high"
    trophies?: number
}

const getActivityColor = (level: string = "medium") => {
    if (level === "high") return "text-emerald-600 dark:text-emerald-400"
    if (level === "low") return "text-slate-400 dark:text-neutral-500"
    return "text-amber-600 dark:text-amber-400"
}

const getActivityLabel = (level: string = "medium") => {
    if (level === "high") return "High Activity"
    if (level === "low") return "Low Activity"
    return "Active"
}

export const ClubCard = React.forwardRef<HTMLDivElement, ClubCardProps>(
    ({ className, variant, size, name, league, country, badgeUrl, followers = "12k", activityLevel = "high", trophies, ...props }, ref) => {
        const activityColor = getActivityColor(activityLevel)
        const activityLabel = getActivityLabel(activityLevel)

        return (
            <div
                ref={ref}
                className={cn(clubCardVariants({ variant, size, className }))}
                {...props}
            >
                {/* Artistic Watermark */}
                {badgeUrl && (
                    <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-48 h-48 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 grayscale pointer-events-none select-none">
                        <img src={badgeUrl} alt="" className="w-full h-full object-contain" />
                    </div>
                )}

                {/* Left: Badge */}
                <div className="relative w-14 h-14 rounded-lg border-2 border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 p-2 flex items-center justify-center overflow-hidden shrink-0 z-10">
                    {badgeUrl ? (
                        <img
                            src={badgeUrl}
                            alt={name}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <Trophy className="w-8 h-8 text-slate-300 dark:text-neutral-600" />
                    )}
                </div>

                {/* Middle: Info */}
                <div className="relative z-10 flex-1 flex flex-col justify-center gap-1.5 min-w-0">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-neutral-100 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                        {name}
                    </h3>

                    <div className="flex items-center gap-2 text-xs">
                        {league && (
                            <span className="font-semibold uppercase tracking-wide text-slate-500 dark:text-neutral-400">
                                {league}
                            </span>
                        )}
                        {country && league && (
                            <span className="text-slate-300 dark:text-neutral-600">•</span>
                        )}
                        {country && (
                            <span className="text-slate-500 dark:text-neutral-400">
                                {country}
                            </span>
                        )}
                    </div>
                </div>

                {/* Right: Compact Metrics */}
                <div className="hidden sm:flex items-center gap-4 z-10">
                    {followers && (
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-neutral-400 text-xs font-semibold">
                            <Users className="w-3.5 h-3.5" />
                            <span>{followers}</span>
                        </div>
                    )}

                    <div className={`flex items-center gap-1 text-xs font-bold ${activityColor}`}>
                        <Activity className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">{activityLabel}</span>
                    </div>
                </div>

                {/* Arrow */}
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-neutral-800 border-2 border-slate-200 dark:border-neutral-700 flex items-center justify-center text-slate-400 dark:text-neutral-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 group-hover:border-emerald-500 dark:group-hover:border-emerald-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all shrink-0 z-10">
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>
        )
    }
)

ClubCard.displayName = "ClubCard"

