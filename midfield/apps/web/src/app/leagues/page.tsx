import { supabase } from "@midfield/logic/src/supabase";
import { getClubsByLeague } from "@midfield/logic/src/topics";
import Link from "next/link";
import { Trophy, Shield, Globe2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";

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
      {/* Hero Banner - Inline, naturally delimited by grid */}
      <section className="relative mb-10 lg:mb-14 pt-4 pb-6 lg:py-8 overflow-visible" style={{ width: '100%' }}>
        {/* Fading grid background - guaranteed smooth vignette */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.03] rounded-md"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, black 10%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, black 10%, transparent 85%)'
          }}
        />

        {/* Green-tinted grid accent (soft spotlights with heavy fade) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.4] dark:opacity-[0.3] rounded-md"
          style={{
            backgroundImage: `linear-gradient(to right, rgb(16, 185, 129) 1px, transparent 1px), linear-gradient(to bottom, rgb(16, 185, 129) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(circle 400px at 85% 0%, black 0%, transparent 80%), radial-gradient(circle 400px at 15% 100%, black 0%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(circle 400px at 85% 0%, black 0%, transparent 80%), radial-gradient(circle 400px at 15% 100%, black 0%, transparent 80%)'
          }}
        />
        <div className="relative z-10 px-6 py-10 sm:px-8 sm:py-12 max-w-7xl mx-auto">
          {/* Beta Badge - Small, top right corner */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-8 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wide">
            <Sparkles className="w-2.5 h-2.5" />
            More Coming Soon!
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            {/* Left: Title & Icon */}
            <div className="flex items-center gap-4">
              <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-md bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center">
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-neutral-100">
                  Leagues
                </h1>
              </div>
            </div>

            {/* Right: Stats - Single Row */}
            <div className="flex items-center gap-3 px-5 py-3 bg-slate-100 dark:bg-neutral-800 backdrop-blur-md rounded-md border border-slate-200 dark:border-neutral-700 self-start sm:self-auto">
              <Globe2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div className="text-2xl font-black text-slate-900 dark:text-neutral-100 tabular-nums leading-none">{leaguesWithCounts.length}</div>
              <div className="text-xs font-semibold text-slate-600 dark:text-neutral-400 uppercase tracking-wider">Leagues</div>
            </div>
          </div>
        </div>
      </section>

      {/* Leagues Grid - Bigger, More Prominent Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {leaguesWithCounts.map((league: any) => {
          const countryFlagImg = COUNTRY_FLAG_IMAGES[league.metadata?.country || ""];

          return (
            <Link key={league.id} href={`/topic/${league.slug}`}>
              <Card variant="interactive" className="p-6 group h-full relative overflow-hidden">
                {/* Background Gradient Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full blur-2xl group-hover:from-emerald-500/10 transition-all"></div>

                <div className="relative">
                  {/* League Logo - Larger */}
                  <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
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
                      <Trophy className="w-16 h-16 text-slate-300 dark:text-neutral-600" />
                    )}
                  </div>

                  {/* League Name */}
                  <h3 className="text-center text-lg font-bold text-slate-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-3">
                    {league.title.replace(/^(English|Spanish|Italian|German|French)\s/, '')}
                  </h3>

                  {/* Country Flag & Club Count */}
                  <div className="flex items-center justify-center gap-3">
                    {/* Country Flag - Smaller radius */}
                    {countryFlagImg && (
                      <img
                        src={countryFlagImg}
                        alt={league.metadata?.country}
                        className="h-5 w-auto object-contain rounded border border-slate-200 dark:border-neutral-700"
                      />
                    )}

                    {/* Club Count with Text - rounded-md */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-neutral-800 rounded-md text-xs font-semibold text-slate-700 dark:text-neutral-300">
                      <Shield className="w-3.5 h-3.5" />
                      <span>{league.clubCount} clubs</span>
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
