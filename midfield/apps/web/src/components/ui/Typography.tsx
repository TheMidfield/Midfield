import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const typographyVariants = cva(
    "text-slate-900 transition-colors",
    {
        variants: {
            variant: {
                h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
                h2: "scroll-m-20 text-3xl font-bold tracking-tight first:mt-0",
                h3: "scroll-m-20 text-2xl font-bold tracking-tight",
                h4: "text-xl font-bold tracking-tight",
                body: "text-base leading-7 lg:leading-8 text-slate-700",
                small: "text-sm font-medium leading-none",
                tiny: "text-xs font-medium text-slate-500",
                muted: "text-sm text-slate-500",
            },
            weight: {
                default: "",
                normal: "font-normal",
                medium: "font-medium",
                semibold: "font-semibold",
                bold: "font-bold",
                black: "font-black",
            }
        },
        defaultVariants: {
            variant: "body",
            weight: "default",
        },
    }
)

export interface TypographyProps
    extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof typographyVariants> {
    as?: React.ElementType
}

const Typography = React.forwardRef<HTMLHeadingElement, TypographyProps>(
    ({ className, variant, weight, as, ...props }, ref) => {
        // Determine the default tag based on variant if 'as' is not provided
        const Component = as ||
            (variant === "h1" ? "h1" :
                variant === "h2" ? "h2" :
                    variant === "h3" ? "h3" :
                        variant === "h4" ? "h4" :
                            "p");

        return (
            <Component
                className={cn(typographyVariants({ variant, weight, className }))}
                // @ts-ignore - Polymorphic ref handling is tricky, keeping simple for now
                ref={ref}
                {...props}
            />
        )
    }
)
Typography.displayName = "Typography"

export { Typography, typographyVariants }
