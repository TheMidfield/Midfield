import { getLeagues, getClubsByLeague } from "@midfield/logic/src/topics";
import Link from "next/link";
import { Trophy, Shield, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// League metadata
const LEAGUE_INFO: Record<string, { country: string; flag: string; color: string }> = {
  "English Premier League": { country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "from-purple-500 to-pink-500" },
  "Spanish La Liga": { country: "Spain", flag: "🇪🇸", color: "from-red-500 to-yellow-500" },
  "Italian Serie A": { country: "Italy", flag: "🇮🇹", color: "from-blue-500 to-green-500" },
  "German Bundesliga": { country: "Germany", flag: "🇩🇪", color: "from-gray-800 to-red-600" },
  "French Ligue 1": { country: "France", flag: "🇫🇷", color: "from-blue-600 to-red-600" },
};

export default async function LeaguesPage() {
  const leagues = await getLeagues();

  // Get club counts for each league
  const leaguesWithCounts = await Promise.all(
    leagues.map(async (league) => {
      const clubs = await getClubsByLeague(league);
      return {
        name: league,
        clubCount: clubs.length,
        ...LEAGUE_INFO[league]
      };
    })
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-24">
      {/* Header */}
      <div className="py-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-neutral-100">
              Leagues
            </h1>
            <p className="text-slate-500 dark:text-neutral-400 font-medium mt-1">
              Top 5 European football leagues
            </p>
          </div>
        </div>

        {/* Beta Badge */}
        <Badge variant="secondary" className="text-xs">
          🚀 Beta — More leagues coming soon
        </Badge>
      </div>

      {/* Leagues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaguesWithCounts.map((league) => (
          <Link
            key={league.name}
            href={`/leagues/${encodeURIComponent(league.name.toLowerCase().replace(/\s+/g, '-'))}`}
          >
            <Card variant="interactive" className="group overflow-hidden">
              {/* Gradient Header */}
              <div className={`h-32 bg-gradient-to-br ${league.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/45-degree-fabric-light.png')] opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Flag */}
                <div className="absolute top-4 right-4 text-5xl opacity-90">
                  {league.flag}
                </div>

                {/* League Name */}
                <div className="absolute bottom-4 left-6">
                  <h2 className="text-2xl font-black text-white drop-shadow-lg">
                    {league.name.replace(/^(English|Spanish|Italian|German|French)\s/, '')}
                  </h2>
                  <p className="text-white/80 text-sm font-semibold mt-0.5">
                    {league.country}
                  </p>
                </div>
              </div>

              {/* Stats Section */}
              <div className="p-6 bg-white dark:bg-neutral-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-neutral-100">
                        {league.clubCount}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
                        Clubs
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400 dark:text-neutral-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div className="mt-16 p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/30 text-center">
        <div className="mx-auto" style={{ maxWidth: '500px' }}>
          <p className="text-sm font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
            Coming Soon
          </p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-neutral-100 mb-2">
            More Leagues & Competitions
          </h3>
          <p className="text-slate-600 dark:text-neutral-400 text-sm">
            We're expanding coverage to include Champions League, Europa League, and domestic competitions worldwide.
          </p>
        </div>
      </div>
    </div>
  );
}
