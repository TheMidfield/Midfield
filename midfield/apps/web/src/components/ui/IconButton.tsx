import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

const iconButtonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-500 dark:hover:bg-emerald-400 cursor-pointer",
                destructive: "bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-500 cursor-pointer",
                outline: "border-2 border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-700 dark:text-neutral-300 hover:border-slate-400 dark:hover:border-neutral-500 hover:bg-slate-50 dark:hover:bg-neutral-800 hover:text-slate-900 dark:hover:text-neutral-100 cursor-pointer",
                ghost: "text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-900 dark:hover:text-neutral-100 cursor-pointer",
                subtle: "bg-slate-50 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-700 hover:text-slate-900 dark:hover:text-neutral-100 cursor-pointer",
            },
            size: {
                default: "h-10 w-10",
                sm: "h-8 w-8",
                lg: "h-12 w-12",
                xl: "h-14 w-14",
            },
        },
        defaultVariants: {
            variant: "ghost",
            size: "default",
        },
    }
)

export interface IconButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
    icon: LucideIcon
    asChild?: boolean
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ className, variant, size, icon: Icon, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        const iconSize = size === "sm" ? 16 : size === "lg" ? 20 : size === "xl" ? 24 : 18

        return (
            <Comp
                className={cn(iconButtonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            >
                <Icon size={iconSize} />
            </Comp>
        )
    }
)
IconButton.displayName = "IconButton"

export { IconButton, iconButtonVariants }
