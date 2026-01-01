
"use client";

import Link from "next/link";
import NextImage from "next/image";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeagueTableProps {
    standings: any[];
    highlightTeamId?: string;
}

export function LeagueTable({ standings }: LeagueTableProps) {
    if (!standings || standings.length === 0) {
        return (
            <div className="text-center py-6 text-slate-500 dark:text-neutral-500 text-sm">
                No standings available.
            </div>
        );
    }

    return (
        <div
            className="squad-scroll pt-3 sm:pt-4 -mr-2 sm:-mr-3 pr-3 sm:pr-4 overflow-y-auto"
            style={{ maxHeight: '420px' }}
        >
            <table className="w-full text-sm text-left table-fixed">
                <thead className="sticky -top-3 sm:-top-4 z-10">
                    <tr className="border-b border-slate-200 dark:border-neutral-700 text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider bg-white dark:bg-neutral-900">
                        <th className="py-2 pl-2 w-7 text-center bg-white dark:bg-neutral-900">#</th>
                        <th className="py-2 pl-2 bg-white dark:bg-neutral-900">Team</th>
                        <th className="py-2 text-center w-6 bg-white dark:bg-neutral-900">P</th>
                        <th className="py-2 text-center w-6 bg-white dark:bg-neutral-900">W</th>
                        <th className="py-2 text-center w-6 bg-white dark:bg-neutral-900">D</th>
                        <th className="py-2 text-center w-6 bg-white dark:bg-neutral-900">L</th>
                        <th className="py-2 text-center w-8 font-bold text-slate-600 dark:text-neutral-300 bg-white dark:bg-neutral-900">Pts</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-neutral-800/50">
                    {standings.map((row, index) => {
                        // Position zone colors (UCL, UEL, relegation)
                        let positionStyle = "";
                        if (row.position <= 4) {
                            positionStyle = "text-emerald-600 dark:text-emerald-400 font-bold";
                        } else if (row.position <= 6) {
                            positionStyle = "text-blue-500 dark:text-blue-400";
                        } else if (row.position >= standings.length - 2) {
                            positionStyle = "text-rose-500 dark:text-rose-400";
                        }

                        return (
                            <tr key={row.id} className="group hover:bg-slate-50 dark:hover:bg-neutral-800/30 transition-colors">
                                <td className={cn("py-2 pl-2 text-center text-xs", positionStyle || "text-slate-500 dark:text-neutral-400")}>
                                    {row.position}
                                </td>
                                <td className="py-2 pl-2 min-w-0">
                                    <Link href={`/topic/${row.team?.slug}`} className="flex items-center gap-2 min-w-0">
                                        <div className="relative w-5 h-5 shrink-0">
                                            {row.team?.metadata?.badge_url ? (
                                                <NextImage
                                                    src={row.team.metadata.badge_url}
                                                    alt={row.team.title}
                                                    fill
                                                    className="object-contain"
                                                    sizes="20px"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-slate-100 dark:bg-neutral-700 rounded flex items-center justify-center">
                                                    <Shield className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-neutral-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors min-w-0">
                                            {row.team?.title || "Unknown Team"}
                                        </span>
                                    </Link>
                                </td>
                                <td className="py-2 text-center text-xs text-slate-600 dark:text-neutral-400">{row.played}</td>
                                <td className="py-2 text-center text-xs text-emerald-600 dark:text-emerald-400">{row.won || 0}</td>
                                <td className="py-2 text-center text-xs text-slate-400 dark:text-neutral-500">{row.drawn || 0}</td>
                                <td className="py-2 text-center text-xs text-rose-500 dark:text-rose-400">{row.lost || 0}</td>
                                <td className="py-2 text-center font-bold text-sm text-slate-900 dark:text-neutral-100">{row.points}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
