import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary text-primary-foreground hover:bg-emerald-600 cursor-pointer",
                secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-slate-200 cursor-pointer",
                destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-red-700 cursor-pointer",
                outline: "border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 cursor-pointer",
                success: "border-transparent bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer",
                warning: "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer",
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
