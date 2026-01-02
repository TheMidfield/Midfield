"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close
const SheetPortal = DialogPrimitive.Portal

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
    side?: "right" | "left"
}

const SheetContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    SheetContentProps
>(({ className, children, side = "right", ...props }, ref) => (
    <SheetPortal>
        {/* Overlay - covers content area, NOT the navbar */}
        <DialogPrimitive.Overlay
            className={cn(
                "fixed z-30 bg-black/40",
                "top-[72px] left-0 bottom-0",
                "right-[340px]",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            )}
        />
        <DialogPrimitive.Content
            ref={ref}
            // modal=false allows navbar interaction while sheet is open
            onPointerDownOutside={(e) => {
                // Allow clicks on navbar by checking if click is above the sheet top
                const rect = (e.target as HTMLElement).getBoundingClientRect?.();
                if (rect && rect.top < 72) {
                    e.preventDefault();
                }
            }}
            className={cn(
                "fixed z-40 flex flex-col bg-white dark:bg-neutral-900 shadow-xl transition-all duration-200 ease-out",
                "top-[72px] bottom-0",
                side === "right" && [
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
            "flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-neutral-800",
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
            "text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-500",
            className
        )}
        {...props}
    />
))
SheetTitle.displayName = "SheetTitle"

export {
    Sheet,
    SheetPortal,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
}
