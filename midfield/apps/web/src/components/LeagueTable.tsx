
"use client";

import Link from "next/link";
import NextImage from "next/image";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface LeagueTableProps {
    standings: any[];
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
        <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead>
                    <tr className="border-b border-slate-100 dark:border-neutral-800 text-xs font-semibold text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
                        <th className="py-2 pl-2 w-8 text-center">#</th>
                        <th className="py-2 pl-2">Team</th>
                        <th className="py-2 text-center w-8">P</th>
                        <th className="py-2 text-center w-8 hidden sm:table-cell">W</th>
                        <th className="py-2 text-center w-8 hidden sm:table-cell">D</th>
                        <th className="py-2 text-center w-8 hidden sm:table-cell">L</th>
                        <th className="py-2 text-center w-8 hidden md:table-cell">GD</th>
                        <th className="py-2 text-center w-10 font-bold text-slate-900 dark:text-neutral-200">Pts</th>
                        <th className="py-2 text-center w-24 hidden md:table-cell">Form</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-neutral-800/50">
                    {standings.map((row) => (
                        <tr key={row.id} className="group hover:bg-slate-50 dark:hover:bg-neutral-800/30 transition-colors">
                            <td className="py-2 pl-2 text-center font-medium text-slate-500 dark:text-neutral-400">
                                {row.position}
                            </td>
                            <td className="py-2 pl-2">
                                <Link href={`/topic/${row.team?.slug}`} className="flex items-center gap-2 max-w-[160px] sm:max-w-none">
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
                                            <div className="w-full h-full bg-slate-200 dark:bg-neutral-700 rounded-full" />
                                        )}
                                    </div>
                                    <span className="font-semibold text-slate-900 dark:text-neutral-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                        {row.team?.title || "Unknown Team"}
                                    </span>
                                </Link>
                            </td>
                            <td className="py-2 text-center text-slate-600 dark:text-neutral-400">{row.played}</td>
                            <td className="py-2 text-center text-slate-500 dark:text-neutral-500 hidden sm:table-cell">{row.won || 0}</td>
                            <td className="py-2 text-center text-slate-500 dark:text-neutral-500 hidden sm:table-cell">{row.drawn || 0}</td>
                            <td className="py-2 text-center text-slate-500 dark:text-neutral-500 hidden sm:table-cell">{row.lost || 0}</td>
                            <td className="py-2 text-center text-slate-500 dark:text-neutral-500 hidden md:table-cell">
                                {row.goals_diff > 0 ? `+${row.goals_diff}` : row.goals_diff}
                            </td>
                            <td className="py-2 text-center font-bold text-slate-900 dark:text-neutral-100">{row.points}</td>
                            <td className="py-2 text-center hidden md:table-cell">
                                <div className="flex items-center justify-center gap-0.5">
                                    {row.form?.split('').slice(0, 5).map((result: string, i: number) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center text-white",
                                                result === 'W' ? "bg-emerald-500" :
                                                    result === 'D' ? "bg-slate-400 dark:bg-neutral-600" :
                                                        "bg-rose-500"
                                            )}
                                        >
                                            {result}
                                        </div>
                                    ))}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
