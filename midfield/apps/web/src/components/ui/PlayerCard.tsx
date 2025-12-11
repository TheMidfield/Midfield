import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Activity, Users, ArrowRight, Shield } from "lucide-react"

const playerCardVariants = cva(
    "group relative flex flex-col bg-white dark:bg-neutral-900 rounded-lg transition-all duration-300 cursor-pointer overflow-hidden",
    {
        variants: {
            variant: {
                default: "border-2 border-slate-200 dark:border-neutral-800 hover:border-slate-400 dark:hover:border-neutral-600",
                highlight: "border-2 border-emerald-200 dark:border-emerald-900 hover:border-emerald-400 dark:hover:border-emerald-700 bg-emerald-50/30 dark:bg-emerald-950/20",
                interactive: "border-2 border-slate-200 dark:border-neutral-800 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-neutral-800/50"
            },
            size: {
                default: "p-4 min-h-[200px]",
                compact: "p-3 min-h-[180px]",
                large: "p-5 min-h-[220px]"
            }
        },
        defaultVariants: {
            variant: "interactive",
            size: "default"
        }
    }
)

export interface PlayerCardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof playerCardVariants> {
    name: string
    position?: string
    rating?: string | number
    age?: string | number
    club?: {
        name: string
        slug?: string
        badgeUrl?: string
    }
    avatarUrl?: string
    followers?: string | number
    activityLevel?: "low" | "medium" | "high"
}

const getPositionColor = (pos: string = "") => {
    const p = pos.toLowerCase()
    if (p.includes("goalkeeper") || p.includes("gk")) return "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900"
    if (p.includes("defen") || p.includes("back")) return "bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-900"
    if (p.includes("midfield")) return "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
    if (p.includes("forward") || p.includes("wing") || p.includes("striker") || p.includes("attack")) return "bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-400 border-red-200 dark:border-red-900"
    return "bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-400 border-slate-200 dark:border-neutral-700"
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

export const PlayerCard = React.forwardRef<HTMLDivElement, PlayerCardProps>(
    ({ className, variant, size, name, position, rating = "85", age, club, avatarUrl, followers = "2.4k", activityLevel = "high", ...props }, ref) => {
        const positionColor = getPositionColor(position)
        const activityColor = getActivityColor(activityLevel)
        const activityLabel = getActivityLabel(activityLevel)

        return (
            <div
                ref={ref}
                className={cn(playerCardVariants({ variant, size, className }))}
                {...props}
            >
                {/* Top Row: Avatar + Club Badge + Arrow */}
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className="flex items-start gap-2.5">
                        {/* Avatar Container */}
                        <div className="relative">
                            <div className="relative w-12 h-12 rounded-full border-2 border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={name}
                                        className="w-full h-full object-cover object-top origin-top scale-[1.2]"
                                    />
                                ) : (
                                    <span className="text-xl opacity-20">👤</span>
                                )}
                            </div>

                            {/* Rating Badge - Overlapping Cutout Style */}
                            <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-slate-900 dark:bg-neutral-100 rounded-full flex items-center justify-center ring-[2.5px] ring-white dark:ring-neutral-900">
                                <span className="text-[10px] font-bold text-white dark:text-neutral-900">{rating}</span>
                            </div>
                        </div>

                        {/* Club Badge */}
                        {club && (
                            <div className="flex flex-col gap-0.5 mt-0.5">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 dark:bg-neutral-800 border-2 border-slate-200 dark:border-neutral-700 rounded-lg hover:border-slate-300 dark:hover:border-neutral-600 transition-colors">
                                    {club.badgeUrl ? (
                                        <div className="w-3.5 h-3.5 rounded-sm overflow-hidden shrink-0">
                                            <img src={club.badgeUrl} alt={club.name} className="w-full h-full object-contain" />
                                        </div>
                                    ) : (
                                        <div className="w-3.5 h-3.5 rounded-sm bg-slate-200 dark:bg-neutral-700 shrink-0 overflow-hidden">
                                            <Shield className="w-full h-full p-0.5 text-white bg-slate-400 dark:bg-neutral-600" />
                                        </div>
                                    )}
                                    <span className="text-[10px] font-black text-slate-700 dark:text-neutral-300 uppercase tracking-tight">
                                        {club.name}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Arrow */}
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-neutral-800 border-2 border-slate-200 dark:border-neutral-700 flex items-center justify-center text-slate-400 dark:text-neutral-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 group-hover:border-emerald-500 dark:group-hover:border-emerald-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all shrink-0">
                        <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                </div>

                {/* Middle: Info */}
                <div className="relative z-10 flex-1 flex flex-col justify-center">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-neutral-100 leading-tight mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {name}
                    </h3>

                    <div className="flex flex-wrap gap-1.5 items-center">
                        {position && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide border-2 ${positionColor}`}>
                                {position}
                            </span>
                        )}

                        {age && (
                            <span className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 border-2 border-slate-200 dark:border-neutral-700 rounded-md px-1.5 py-0.5 bg-white dark:bg-neutral-900">
                                {age} yrs
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer Metrics */}
                <div className="mt-auto pt-2 border-t-2 border-slate-200 dark:border-neutral-800 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-1 text-slate-500 dark:text-neutral-400 text-[10px] font-semibold">
                        <Users className="w-3 h-3" />
                        <span>{followers}</span>
                    </div>

                    <div className={`flex items-center gap-1 text-[10px] font-bold ${activityColor}`}>
                        <Activity className="w-3 h-3" />
                        <span>{activityLabel}</span>
                    </div>
                </div>
            </div>
        )
    }
)

PlayerCard.displayName = "PlayerCard"

