import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
    "rounded-md border transition-all duration-200",
    {
        variants: {
            variant: {
                default: "bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-neutral-100",
                interactive: "bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-neutral-100 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer",
                highlight: "bg-emerald-50/50 dark:bg-green-950/30 border-emerald-200 dark:border-green-900 text-green-900 dark:text-green-100 hover:border-emerald-300 dark:hover:border-emerald-800 hover:bg-emerald-100/50 dark:hover:bg-green-950/50 cursor-pointer",
                flat: "bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 hover:bg-slate-100 dark:hover:bg-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600 cursor-pointer",
                ghost: "bg-white dark:bg-transparent border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-neutral-100 hover:bg-slate-50 dark:hover:bg-neutral-800 hover:border-slate-300 dark:hover:border-neutral-600 cursor-pointer",
                dark: "bg-slate-900 dark:bg-neutral-800 border-slate-800 dark:border-neutral-700 text-white hover:bg-slate-800 dark:hover:bg-neutral-700 cursor-pointer"
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> { }

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(cardVariants({ variant, className }))}
            {...props}
        />
    )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-2xl font-semibold leading-none tracking-tight text-slate-900 dark:text-neutral-100",
            className
        )}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-slate-500 dark:text-neutral-400", className)}
        {...props}
    />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
