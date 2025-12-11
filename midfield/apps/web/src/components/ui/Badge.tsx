import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold",
    {
        variants: {
            variant: {
                default: "border-transparent bg-emerald-600 dark:bg-emerald-500 text-white",
                secondary: "border-transparent bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-neutral-300",
                destructive: "border-transparent bg-red-500 dark:bg-red-600 text-white",
                outline: "border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 bg-white dark:bg-neutral-900",
                success: "border-transparent bg-emerald-100 dark:bg-green-950/50 text-emerald-800 dark:text-emerald-300",
                warning: "border-transparent bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-300",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
