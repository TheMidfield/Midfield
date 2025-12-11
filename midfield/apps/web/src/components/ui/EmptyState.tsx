import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

const emptyStateVariants = cva(
    "flex flex-col items-center justify-center text-center p-8 rounded-lg border-2 border-dashed h-full min-h-[200px]",
    {
        variants: {
            variant: {
                default: "border-slate-400 dark:border-neutral-600 bg-slate-50/50 dark:bg-neutral-800/30",
                muted: "border-slate-300 dark:border-neutral-700 bg-slate-50/30 dark:bg-neutral-900/30",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface EmptyStateProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
    icon?: LucideIcon
    title: string
    description?: string
    action?: React.ReactNode
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
    ({ className, variant, icon: Icon, title, description, action, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(emptyStateVariants({ variant, className }))}
                {...props}
            >
                {Icon && (
                    <div className="mb-4 rounded-lg bg-slate-200 dark:bg-neutral-800 p-3 text-slate-500 dark:text-neutral-500">
                        <Icon size={32} />
                    </div>
                )}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-2">{title}</h3>
                {description && (
                    <p className="text-sm text-slate-500 dark:text-neutral-400 max-w-md mb-6 leading-relaxed">{description}</p>
                )}
                {action && <div className="mt-2">{action}</div>}
            </div>
        )
    }
)
EmptyState.displayName = "EmptyState"

export { EmptyState, emptyStateVariants }
