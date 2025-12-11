import * as React from "react"
import { Search } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const searchInputVariants = cva(
    "flex h-10 w-full pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-neutral-100 placeholder:text-slate-500 dark:placeholder:text-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200",
    {
        variants: {
            variant: {
                default: "rounded-md border-2 border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-slate-400 dark:hover:border-neutral-600 focus-visible:border-emerald-500 dark:focus-visible:border-emerald-400",
                pill: "rounded-full border-2 border-slate-300 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 hover:border-slate-400 dark:hover:border-neutral-600 focus-visible:border-emerald-500 dark:focus-visible:border-emerald-400",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface SearchInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>,
    VariantProps<typeof searchInputVariants> {
    onSearch?: (value: string) => void
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
    ({ className, variant, onSearch, ...props }, ref) => {
        return (
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-neutral-400" />
                <input
                    ref={ref}
                    type="search"
                    className={cn(searchInputVariants({ variant, className }))}
                    {...props}
                />
            </div>
        )
    }
)
SearchInput.displayName = "SearchInput"

export { SearchInput, searchInputVariants }
