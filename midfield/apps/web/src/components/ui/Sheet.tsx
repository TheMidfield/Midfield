"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
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
            // Position: below navbar, to the left of sidebar
            "fixed z-30 bg-black/40",
            "top-[72px] left-0 bottom-0",
            // Right edge stops before sidebar (320px = w-[340px])
            "right-[340px]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
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
                // z-40 above overlay
                "fixed z-40 flex flex-col bg-white dark:bg-neutral-900 shadow-xl transition-all duration-200 ease-out",
                // Position below navbar
                "top-[72px] bottom-0",
                side === "right" && [
                    // Width adjusted: bell is roughly 70px from right edge, so ~140px from center
                    // If bell is at right-0, and we want it centered: sidebar width = 2 * (bell center to right edge)
                    // Bell button is ~36px wide, at right edge with ~12px gap = ~30px center from right
                    // For visual centering, w-[340px] with bell at ~170px from left edge of sidebar
                    "right-0 w-[340px]",
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
