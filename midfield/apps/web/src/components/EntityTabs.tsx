"use client";

import { useState } from "react";

interface Tab {
    id: string;
    label: string;
    count?: number;
}

interface EntityTabsProps {
    tabs: Tab[];
    defaultTab?: string;
    onTabChange?: (tabId: string) => void;
    children: (activeTab: string) => React.ReactNode;
}

export function EntityTabs({ tabs, defaultTab, onTabChange, children }: EntityTabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || "");

    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
        onTabChange?.(tabId);
    };

    return (
        <div className="flex flex-col">
            {/* Tab Bar */}
            <div className="sticky top-[65px] z-30 bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800">
                <div className="flex items-center gap-1 px-4 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`
                                relative px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap
                                ${activeTab === tab.id
                                    ? 'text-slate-900 dark:text-neutral-100'
                                    : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-300'
                                }
                            `}
                        >
                            <span className="flex items-center gap-2">
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span className={`
                                        text-xs px-1.5 py-0.5 rounded-full
                                        ${activeTab === tab.id
                                            ? 'bg-slate-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                                            : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400'
                                        }
                                    `}>
                                        {tab.count}
                                    </span>
                                )}
                            </span>

                            {/* Active Indicator */}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1">
                {children(activeTab)}
            </div>
        </div>
    );
}
