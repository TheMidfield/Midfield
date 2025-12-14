import { getClubsByLeague } from "@midfield/logic/src/topics";
import Link from "next/link";
import { Shield, ChevronLeft, Activity, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { notFound } from "next/navigation";

// League slug to full name mapping
const LEAGUE_NAMES: Record<string, string> = {
  "english-premier-league": "English Premier League",
  "spanish-la-liga": "Spanish La Liga",
  "italian-serie-a": "Italian Serie A",
  "german-bundesliga": "German Bundesliga",
  "french-ligue-1": "French Ligue 1",
};

const LEAGUE_INFO: Record<string, { country: string; flag: string; color: string; founded: number }> = {
  "English Premier League": { country: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "from-purple-500 to-pink-500", founded: 1992 },
  "Spanish La Liga": { country: "Spain", flag: "🇪🇸", color: "from-red-500 to-yellow-500", founded: 1929 },
  "Italian Serie A": { country: "Italy", flag: "🇮🇹", color: "from-blue-500 to-green-500", founded: 1898 },
  "German Bundesliga": { country: "Germany", flag: "🇩🇪", color: "from-gray-800 to-red-600", founded: 1963 },
  "French Ligue 1": { country: "France", flag: "🇫🇷", color: "from-blue-600 to-red-600", founded: 1932 },
};

export default async function LeaguePage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const leagueName = LEAGUE_NAMES[slug];
  
  if (!leagueName) {
    return notFound();
  }

  const clubs = await getClubsByLeague(leagueName);
  const leagueInfo = LEAGUE_INFO[leagueName];

  if (clubs.length === 0) {
    return notFound();
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-24">
      {/* Back Navigation */}
      <div className="py-6">
        <Link
          href="/leagues"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Leagues
        </Link>
      </div>

      {/* League Header */}
      <div className={`mb-12 rounded-[2rem] overflow-hidden bg-gradient-to-br ${leagueInfo.color} shadow-2xl`}>
        <div className="relative h-64 md:h-80">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/45-degree-fabric-light.png')] opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-10">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-6xl">{leagueInfo.flag}</span>
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20 backdrop-blur-sm">
                    Est. {leagueInfo.founded}
                  </Badge>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg mb-2">
                  {leagueName.replace(/^(English|Spanish|Italian|German|French)\s/, '')}
                </h1>
                <p className="text-xl text-white/90 font-bold">{leagueInfo.country}</p>
              </div>

              <div className="hidden md:block text-right">
                <p className="text-white/70 text-sm font-medium mb-1">Teams</p>
                <p className="text-5xl font-black text-white">{clubs.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clubs Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            All Clubs
          </h2>
          <span className="text-sm text-slate-500 dark:text-neutral-400 font-medium">
            {clubs.length} clubs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {clubs.map((club) => (
            <Link key={club.id} href={`/topic/${club.slug}`}>
              <Card variant="interactive" className="group p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl border-2 border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 flex items-center justify-center shrink-0">
                    <img
                      src={(club.metadata as any)?.badge_url}
                      alt={club.title}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                      {club.title}
                    </h3>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {(club.metadata as any)?.stadium && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-neutral-400">
                      <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="truncate">{(club.metadata as any).stadium}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {club.follower_count?.toLocaleString() || 0} followers
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      <Activity className="w-3 h-3" />
                      <span>Active</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
