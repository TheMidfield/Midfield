import { supabase } from "@midfield/logic/src/supabase";
import { getClubsByLeague } from "@midfield/logic/src/topics";
import Link from "next/link";
import { Trophy, Shield, Globe2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// Country flag image mapping
const COUNTRY_FLAG_IMAGES: Record<string, string> = {
  "England": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/england.png",
  "Spain": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/spain.png",
  "Italy": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/italy.png",
  "Germany": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/germany.png",
  "France": "https://bocldhavewgfxmbuycxy.supabase.co/storage/v1/object/public/league-logos/france.png",
};

export default async function LeaguesPage() {
  // Fetch league topics directly from database
  const { data: leagues } = await supabase
    .from('topics')
    .select('*')
    .eq('type', 'league')
    .eq('is_active', true)
    .order('title', { ascending: true });

  // Get club counts for each league
  const leaguesWithCounts = await Promise.all(
    (leagues || []).map(async (league: any) => {
      const clubs = await getClubsByLeague(league.title);
      return {
        ...league,
        clubCount: clubs.length,
      };
    })
  );

  return (
    <div className="w-full">
      {/* Elegant Hero Banner */}
      <div className="relative mb-8 overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-black dark:via-neutral-950 dark:to-black border border-slate-800/50 dark:border-neutral-800/30">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Content */}
        <div className="relative px-6 py-10 sm:px-8 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Left: Title & Icon */}
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Leagues
                </h1>
                <p className="text-sm sm:text-base text-slate-400 font-medium mt-1">
                  Top 5 European football leagues
                </p>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="flex items-center gap-3 px-5 py-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 self-start sm:self-auto">
              <Globe2 className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-2xl font-black text-white tabular-nums leading-none">{leaguesWithCounts.length}</div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Leagues</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leagues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {leaguesWithCounts.map((league: any) => {
          const countryFlagImg = COUNTRY_FLAG_IMAGES[league.metadata?.country || ""];

          return (
            <Link key={league.id} href={`/topic/${league.slug}`}>
              <Card variant="interactive" className="p-5 flex items-center gap-4 group h-full">
                {/* League Logo */}
                <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                  {league.metadata?.logo_url ? (
                    <>
                      <img
                        src={league.metadata.logo_url}
                        alt={league.title}
                        className="max-w-full max-h-full object-contain dark:hidden"
                      />
                      <img
                        src={league.metadata.logo_url_dark || league.metadata.logo_url}
                        alt={league.title}
                        className="max-w-full max-h-full object-contain hidden dark:block"
                      />
                    </>
                  ) : (
                    <Trophy className="w-10 h-10 text-slate-300 dark:text-neutral-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                    {league.title.replace(/^(English|Spanish|Italian|German|French)\s/, '')}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    {/* Country Flag Badge with Image */}
                    <Badge variant="secondary" className="text-[10px] flex items-center gap-1.5 px-2 py-1">
                      {countryFlagImg && (
                        <img src={countryFlagImg} alt={league.metadata?.country} className="w-3.5 h-3.5 object-cover rounded-sm" />
                      )}
                      <span className="truncate">{league.metadata?.country || "Europe"}</span>
                    </Badge>
                    {/* Club Count */}
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-neutral-400">
                      <Shield className="w-3 h-3" />
                      <span>{league.clubCount}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
