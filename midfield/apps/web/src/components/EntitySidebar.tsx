"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SidebarSection {
    id: string;
    label: string;
    icon?: React.ReactNode;
    count?: number;
    content: React.ReactNode;
    defaultOpen?: boolean;
}

interface EntitySidebarProps {
    sections: SidebarSection[];
}

export function EntitySidebar({ sections }: EntitySidebarProps) {
    const [openSections, setOpenSections] = useState<Set<string>>(() => {
        const defaults = new Set<string>();
        sections.forEach(s => {
            if (s.defaultOpen) defaults.add(s.id);
        });
        return defaults;
    });

    const toggleSection = (id: string) => {
        setOpenSections(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <div className="h-full overflow-y-auto border-r border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50">
            <div className="p-3 space-y-1">
                {sections.map((section) => {
                    const isOpen = openSections.has(section.id);

                    return (
                        <div key={section.id} className="rounded-lg overflow-hidden">
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(section.id)}
                                className={`
                                    w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors rounded-lg
                                    ${isOpen
                                        ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100'
                                        : 'text-slate-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-800 hover:text-slate-900 dark:hover:text-neutral-100'
                                    }
                                `}
                            >
                                {/* Chevron */}
                                <span className="shrink-0 text-slate-400 dark:text-neutral-500">
                                    {isOpen ? (
                                        <ChevronDown className="w-4 h-4" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4" />
                                    )}
                                </span>

                                {/* Icon */}
                                {section.icon && (
                                    <span className="shrink-0 text-slate-400 dark:text-neutral-500">
                                        {section.icon}
                                    </span>
                                )}

                                {/* Label */}
                                <span className="flex-1 text-sm font-semibold truncate">
                                    {section.label}
                                </span>

                                {/* Count Badge */}
                                {section.count !== undefined && (
                                    <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-neutral-700 text-slate-500 dark:text-neutral-400">
                                        {section.count}
                                    </span>
                                )}
                            </button>

                            {/* Section Content */}
                            {isOpen && (
                                <div className="px-3 pb-3 pt-2">
                                    {section.content}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
