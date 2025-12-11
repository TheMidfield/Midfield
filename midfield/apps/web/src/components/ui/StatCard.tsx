import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
    label: string
    value: string | number
    icon?: LucideIcon
    trend?: {
        value: number
        isPositive: boolean
    }
    variant?: "default" | "highlight"
    clickable?: boolean
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
    ({ className, label, value, icon: Icon, trend, variant = "default", clickable = false, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-lg border p-4 transition-all",
                    clickable && "hover:border-slate-400 dark:hover:border-neutral-500 cursor-pointer",
                    variant === "highlight"
                        ? "bg-emerald-50/30 dark:bg-green-950/30 border-emerald-200 dark:border-green-900" + (clickable ? " hover:border-emerald-400 dark:hover:border-emerald-700" : "")
                        : "bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800",
                    className
                )}
                {...props}
            >
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-xs font-medium text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
                            {label}
                        </p>
                        <p className={cn(
                            "text-2xl font-bold font-[family-name:var(--font-brand)]",
                            variant === "highlight" ? "text-green-900 dark:text-green-100" : "text-slate-900 dark:text-neutral-100"
                        )}>
                            {value}
                        </p>
                        {trend && (
                            <p className={cn(
                                "text-xs font-medium mt-2",
                                trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                            )}>
                                {trend.isPositive ? "+" : ""}{trend.value}%
                            </p>
                        )}
                    </div>
                    {Icon && (
                        <div className={cn(
                            "rounded-md p-2",
                            variant === "highlight"
                                ? "bg-emerald-100 dark:bg-green-900/50 text-emerald-700 dark:text-emerald-300"
                                : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                        )}>
                            <Icon size={20} />
                        </div>
                    )}
                </div>
            </div>
        )
    }
)
StatCard.displayName = "StatCard"

export { StatCard }
