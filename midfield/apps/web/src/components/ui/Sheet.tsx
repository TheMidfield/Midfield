"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close
const SheetPortal = DialogPrimitive.Portal

const SheetOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            // Start below navbar
            "top-[72px]",
            className
        )}
        {...props}
    />
))
SheetOverlay.displayName = "SheetOverlay"

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
    side?: "right" | "left"
}

const SheetContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    SheetContentProps
>(({ className, children, side = "right", ...props }, ref) => (
    <SheetPortal>
        <SheetOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed z-50 flex flex-col bg-white dark:bg-neutral-900 shadow-xl transition-all duration-200 ease-out",
                // Position below navbar, full height minus navbar
                "top-[72px] bottom-0",
                // Side-specific positioning and animation
                side === "right" && [
                    "right-0 w-80",
                    "border-l border-slate-200 dark:border-neutral-800",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
                ],
                side === "left" && [
                    "left-0 w-80",
                    "border-r border-slate-200 dark:border-neutral-800",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
                ],
                className
            )}
            {...props}
        >
            {children}
            <DialogPrimitive.Close className="absolute right-3 top-3 rounded-md p-1.5 text-slate-400 dark:text-neutral-500 transition-colors hover:text-slate-600 dark:hover:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </SheetPortal>
))
SheetContent.displayName = "SheetContent"

const SheetHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-neutral-800",
            className
        )}
        {...props}
    />
)
SheetHeader.displayName = "SheetHeader"

const SheetTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn(
            "text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500",
            className
        )}
        {...props}
    />
))
SheetTitle.displayName = "SheetTitle"

export {
    Sheet,
    SheetPortal,
    SheetOverlay,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
}
