"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    align?: "left" | "right";
    className?: string;
}

export function DropdownMenu({ trigger, children, align = "right", className }: DropdownMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Calculate position when opening - position right below trigger
    React.useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const menuWidth = 140; // menu width
            // getBoundingClientRect returns viewport-relative coords, which is what fixed needs
            setPosition({
                top: rect.bottom + 6, // 6px gap below trigger
                left: align === "right"
                    ? rect.right - menuWidth // align right edge with trigger
                    : rect.left,
            });
        }
    }, [isOpen, align]);

    // Close on outside click
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // Close on escape
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen]);

    return (
        <>
            <button
                ref={triggerRef}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={cn(
                    "p-1.5 rounded-md transition-colors cursor-pointer",
                    "text-slate-300 dark:text-neutral-600",
                    "hover:text-slate-600 dark:hover:text-neutral-400",
                    "hover:bg-slate-100 dark:hover:bg-neutral-800",
                    isOpen && "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400"
                )}
            >
                {trigger}
            </button>

            {isOpen && typeof window !== "undefined" && createPortal(
                <div
                    ref={menuRef}
                    className={cn(
                        "fixed z-50 min-w-[140px] bg-white dark:bg-neutral-900 border-2 border-slate-200 dark:border-neutral-700 rounded-md py-1",
                        className
                    )}
                    style={{ top: position.top, left: position.left }}
                >
                    {React.Children.map(children, (child) =>
                        React.isValidElement(child)
                            ? React.cloneElement(child as React.ReactElement<any>, {
                                onClick: (e: React.MouseEvent) => {
                                    (child.props as any).onClick?.(e);
                                    setIsOpen(false);
                                }
                            })
                            : child
                    )}
                </div>,
                document.body
            )}
        </>
    );
}

interface DropdownItemProps {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    icon?: React.ReactNode;
    variant?: "default" | "danger";
    className?: string;
}

export function DropdownItem({ children, onClick, icon, variant = "default", className }: DropdownItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors cursor-pointer",
                variant === "default" && "text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800",
                variant === "danger" && "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30",
                className
            )}
        >
            {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
            {children}
        </button>
    );
}

export function DropdownSeparator() {
    return <div className="my-1 border-t border-slate-200 dark:border-neutral-700" />;
}
