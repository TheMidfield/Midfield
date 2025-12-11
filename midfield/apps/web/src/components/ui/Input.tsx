import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-md border-2 border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-slate-900 dark:text-neutral-100 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 dark:placeholder:text-neutral-400 hover:border-slate-400 dark:hover:border-neutral-600 focus-visible:outline-none focus-visible:border-emerald-500 dark:focus-visible:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-300 dark:disabled:hover:border-neutral-700 transition-colors duration-200",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
