import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

// Utility for class merging (inline simple version to avoid dependency if not present)
function cn(...inputs: (string | undefined | null | false)[]) {
    return inputs.filter(Boolean).join(" ")
}

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-emerald-600 transition-colors cursor-pointer",
                destructive: "bg-destructive text-destructive-foreground hover:bg-red-700 transition-colors cursor-pointer",
                outline: "border-2 border-slate-200 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition-all cursor-pointer",
                secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer",
                ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer",
                "ghost-dark": "text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer",
                link: "text-primary hover:text-emerald-700 underline-offset-4 hover:underline transition-colors cursor-pointer",
                subtle: "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer",
                feature: "bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer",
                stroke: "border-2 border-slate-300 bg-transparent text-slate-900 hover:border-slate-900 hover:bg-slate-50 transition-all cursor-pointer",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 px-3 text-xs",
                lg: "h-11 px-8",
                icon: "h-10 w-10",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
