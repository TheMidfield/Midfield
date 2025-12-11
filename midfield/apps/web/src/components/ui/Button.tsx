import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 transition-colors cursor-pointer",
                destructive: "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 transition-colors cursor-pointer",
                outline: "border-2 border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 hover:border-slate-400 dark:hover:border-neutral-600 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all cursor-pointer",
                secondary: "bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer",
                ghost: "text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-900 dark:hover:text-neutral-100 transition-all cursor-pointer",
                "ghost-dark": "text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 hover:text-slate-900 dark:hover:text-neutral-100 transition-all cursor-pointer",
                link: "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline-offset-4 hover:underline transition-colors cursor-pointer",
                subtle: "bg-slate-50 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-700 hover:text-slate-900 dark:hover:text-neutral-100 transition-all cursor-pointer",
                feature: "bg-slate-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-slate-700 dark:hover:bg-neutral-200 transition-colors cursor-pointer",
                stroke: "border-2 border-slate-300 dark:border-neutral-700 bg-transparent text-slate-900 dark:text-neutral-100 hover:border-slate-900 dark:hover:border-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all cursor-pointer",
                pill: "bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 transition-colors cursor-pointer",
                "pill-outline": "border-2 border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-neutral-100 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all cursor-pointer",
                "pill-secondary": "bg-slate-100 dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer",
            },
            size: {
                default: "h-10 px-4 py-2 rounded-md",
                sm: "h-9 px-3 text-xs rounded-md",
                lg: "h-11 px-8 rounded-md",
                icon: "h-10 w-10 rounded-md",
                pill: "h-10 px-5 py-2 rounded-full",
                "pill-sm": "h-8 px-4 text-xs rounded-full",
                "pill-lg": "h-11 px-6 rounded-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    icon?: LucideIcon
    iconPosition?: "left" | "right"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, icon: Icon, iconPosition = "left", children, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        const iconSize = size === "sm" ? 14 : size === "lg" ? 18 : 16

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            >
                {Icon && iconPosition === "left" && <Icon size={iconSize} className="mr-2" />}
                {children}
                {Icon && iconPosition === "right" && <Icon size={iconSize} className="ml-2" />}
            </Comp>
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
