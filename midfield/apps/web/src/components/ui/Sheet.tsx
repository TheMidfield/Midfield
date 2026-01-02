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
        {/* Overlay - below navbar only, z-30 so navbar (z-50) remains interactive */}
        <DialogPrimitive.Overlay
            className={cn(
                "fixed z-30 bg-black/50",
                // Cover everything below navbar
                "top-[62px] sm:top-16 left-0 right-0 bottom-0",
                "data-[state=open]:animate-in data-[state=closed]:animate-out",
                "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                "duration-200"
            )}
        />
        <DialogPrimitive.Content
            ref={ref}
            aria-describedby={undefined}
            className={cn(
                // z-40 above overlay but below navbar (z-50)
                "fixed z-40 flex flex-col bg-white dark:bg-neutral-900 shadow-xl transition-all duration-200 ease-out",
                // Start below navbar
                "top-[62px] sm:top-16 bottom-0",
                side === "right" && [
                    "right-0 left-0 sm:left-auto sm:w-[340px]",
                    "border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-neutral-800",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=closed]:slide-out-to-bottom sm:data-[state=closed]:slide-out-to-right",
                    "data-[state=open]:slide-in-from-bottom sm:data-[state=open]:slide-in-from-right",
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
            <DialogPrimitive.Title className="sr-only">Notifications</DialogPrimitive.Title>
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
